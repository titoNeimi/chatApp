'use client'

import {
  ChatInput,
  ChatMessage,
  LoadMoreButton,
  TypingIndicator,
  UserContextMenu,
  Message,
  MessagesPage,
  RoomMember,
  enrichMessages,
} from '@/components/chatComponents'
import { EffectivePermissions } from "@/types/role";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useRoomSocket, RoomEvent } from "@/hooks/useRoomSocket";
import { useUser } from "@/context/userContext";
import { useServer } from "@/context/serverContext";

export default function RoomPage() {
  const { user } = useUser();
  const { rooms, permissions: serverPermissions } = useServer();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [myPermissions, setMyPermissions] = useState<EffectivePermissions | null>(null);
  const [editingMessageID, setEditingMessageID] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [confirmDeleteID, setConfirmDeleteID] = useState<string | null>(null);

  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; userID: string; username: string } | null>(null);

  const userMapRef = useRef<Record<string, RoomMember>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingClearTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const params = useParams<{ serverID: string; roomID: string }>();
  const serverID = params?.serverID || "";
  const roomID = params?.roomID || "";
  const currentRoom = rooms.find(r => r.id === roomID);
  const roomName = currentRoom?.name ?? roomID;
  const effectivePermissions = myPermissions ?? serverPermissions;
  const canSend = !currentRoom?.is_read_only || user?.role === 'admin' || effectivePermissions?.can_send_messages === true;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (!serverID || !roomID) return;

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const base = `/api/servers/${serverID}/rooms/${roomID}`;
        const [membersRes, , messagesRes, permissionsRes] = await Promise.all([
          fetch(`${base}/users`),
          fetch(`${base}/me`),
          fetch(`${base}/messages?limit=50`),
          fetch(`/api/servers/${serverID}/my-permissions?roomID=${roomID}`),
        ]);

        if (!membersRes.ok) throw new Error(`Failed to fetch members: ${membersRes.statusText}`);
        if (!messagesRes.ok) throw new Error(`Failed to fetch messages: ${messagesRes.statusText}`);
        if (!permissionsRes.ok) throw new Error(`Failed to fetch permissions: ${permissionsRes.statusText}`);

        const [members, page, permissions]: [RoomMember[], MessagesPage, EffectivePermissions] = await Promise.all([
          membersRes.json(),
          messagesRes.json(),
          permissionsRes.json(),
        ]);

        setMyPermissions(permissions);

        const userMap = Object.fromEntries(members.map(m => [m.UserID, m]));
        userMapRef.current = userMap;

        setMessages(enrichMessages(page?.messages ?? [], userMap));
        setHasMore(page?.has_more ?? false);
        setNextCursor(page?.next_cursor ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [serverID, roomID]);

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      scrollToBottom();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const loadMoreMessages = useCallback(async () => {
    if (!nextCursor || loadingMore || !hasMore) return;
    setLoadingMore(true);

    const container = scrollContainerRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;

    try {
      const url = new URL(`/api/servers/${serverID}/rooms/${roomID}/messages`, window.location.origin);
      url.searchParams.set("limit", "50");
      url.searchParams.set("before", nextCursor);

      const res = await fetch(url.toString());
      if (!res.ok) return;

      const page: MessagesPage = await res.json();

      setMessages(prev => [...enrichMessages(page.messages, userMapRef.current), ...prev]);
      setHasMore(page.has_more);
      setNextCursor(page.next_cursor);

      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, hasMore, serverID, roomID]);

  const handleEvent = useCallback((event: RoomEvent) => {
    if (event.type === "message.new") {
      setMessages(prev => {
        if (prev.some(m => m.id === event.payload.ID)) return prev;
        const enriched: Message = {
          id: event.payload.ID,
          content: event.payload.Content,
          user_id: event.payload.UserID,
          username: userMapRef.current[event.payload.UserID]?.Username ?? event.payload.UserID.slice(0, 8),
          reply_to_message_id: event.payload.ReplyToMessageID,
          room_id: event.payload.RoomID,
          created_at: event.payload.CreatedAt,
          updated_at: event.payload.UpdatedAt,
          deleted_at: event.payload.DeletedAt,
        };
        return [...prev, enriched];
      });
      scrollToBottom("smooth");
    } else if (event.type === "message.update") {
      setMessages(prev => prev.map(m =>
        m.id === event.payload.ID ? { ...m, content: event.payload.Content, updated_at: new Date().toISOString() } : m
      ));
    } else if (event.type === "message.delete") {
      setMessages(prev => prev.filter(m => m.id !== event.payload.ID));
    } else if (event.type === "typing.start") {
      const { userID } = event.payload;
      const username = userMapRef.current[userID]?.Username ?? userID.slice(0, 8);
      setTypingUsers(prev => ({ ...prev, [userID]: username }));
      if (typingClearTimers.current[userID]) clearTimeout(typingClearTimers.current[userID]);
      typingClearTimers.current[userID] = setTimeout(() => {
        setTypingUsers(prev => { const next = { ...prev }; delete next[userID]; return next; });
      }, 3000);
    } else if (event.type === "typing.stop") {
      const { userID } = event.payload;
      if (typingClearTimers.current[userID]) clearTimeout(typingClearTimers.current[userID]);
      setTypingUsers(prev => { const next = { ...prev }; delete next[userID]; return next; });
    }
  }, [scrollToBottom]);

  const { sendEvent } = useRoomSocket(roomID, handleEvent);

  const handleAddFriend = async (userID: string) => {
    setContextMenu(null);
    await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userID }),
    });
  };

  const handleSaveEdit = async (messageID: string, content: string) => {
    await fetch(`/api/messages/${messageID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setMessages(prev => prev.map(m => m.id === messageID ? { ...m, content, updated_at: new Date().toISOString() } : m));
    setEditingMessageID(null);
    setEditContent("");
  };

  const handleDelete = async (messageID: string) => {
    await fetch(`/api/messages/${messageID}`, { method: "DELETE" });
    setMessages(prev => prev.filter(m => m.id !== messageID));
    setConfirmDeleteID(null);
  };

  const handleInputChange = (val: string) => {
    setMessageInput(val);
    if (val.trim()) {
      sendEvent({ type: "typing.start" });
      if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
      typingStopTimer.current = setTimeout(() => sendEvent({ type: "typing.stop" }), 2000);
    } else {
      if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
      sendEvent({ type: "typing.stop" });
    }
  };

  const handleSend = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    sendEvent({ type: "typing.stop" });
    await fetch(`/api/servers/${serverID}/rooms/${roomID}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: messageInput }),
    });
    setMessageInput("");
    scrollToBottom("smooth");
  };

  if (!serverID || !roomID) {
    return (
      <div className="flex h-[calc(100dvh-8.5rem)] min-h-120 w-full items-center justify-center rounded-2xl bg-surfaceNavy p-4 shadow-[0_20px_40px_var(--color-panelShadow)] sm:p-5">
        <p className="text-sm text-textMed">serverID and roomID are required</p>
      </div>
    );
  }

  return (
    <section className="relative flex h-[calc(100dvh-8.5rem)] min-h-120 w-full min-w-0 flex-1 overflow-hidden">
      <div className="relative flex h-full min-h-0 w-full flex-col rounded-2xl bg-surfaceNavy p-4 shadow-[0_20px_40px_var(--color-panelShadow)] sm:p-5">
        <header className="flex items-center gap-3 pb-3">
          <p className="text-sm font-semibold text-electricPurple">
            #{roomName}
          </p>
        </header>

        <div ref={scrollContainerRef} className="custom-scroll mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          {hasMore && <LoadMoreButton onClick={loadMoreMessages} loading={loadingMore} />}

          {isLoading && (
            <p className="text-center text-sm text-textMed">Loading messages...</p>
          )}
          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}
          {!isLoading && !error && messages.length === 0 && (
            <p className="text-center text-sm text-textMed">No messages yet. Be the first to send one!</p>
          )}

          {messages.map((message) => {
            const canEdit = message.user_id === user?.id;
            const canDelete = message.user_id === user?.id || user?.role === 'admin' || myPermissions?.can_delete_messages === true;
            return (
              <ChatMessage
                key={message.id}
                message={message}
                canEdit={canEdit}
                canDelete={canDelete}
                isEditing={editingMessageID === message.id}
                isConfirmingDelete={confirmDeleteID === message.id}
                editContent={editContent}
                onEditStart={() => { setEditingMessageID(message.id); setEditContent(message.content); }}
                onEditSave={() => handleSaveEdit(message.id, editContent)}
                onEditCancel={() => { setEditingMessageID(null); setEditContent(""); }}
                onEditContentChange={setEditContent}
                onDeleteRequest={() => setConfirmDeleteID(message.id)}
                onDeleteConfirm={() => handleDelete(message.id)}
                onDeleteCancel={() => setConfirmDeleteID(null)}
                onUserContextMenu={(userID, username, x, y) => setContextMenu({ userID, username, x, y })}
              />
            );
          })}

          <div ref={bottomRef} />
        </div>

        {contextMenu && (
          <UserContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            username={contextMenu.username}
            isSelf={contextMenu.userID === user?.id}
            onAddFriend={() => handleAddFriend(contextMenu.userID)}
            onBlock={() => setContextMenu(null)}
            onReport={() => setContextMenu(null)}
            onClose={() => setContextMenu(null)}
          />
        )}

        <footer className="mt-4">
          <TypingIndicator typingUsers={typingUsers} />
          <ChatInput
            value={messageInput}
            onChange={handleInputChange}
            onSubmit={handleSend}
            placeholder={`Transmit data to #${roomName}...`}
            disabled={!canSend}
            disabledMessage="This room is read-only. You don't have permission to send messages."
          />
        </footer>
      </div>
    </section>
  );
}
