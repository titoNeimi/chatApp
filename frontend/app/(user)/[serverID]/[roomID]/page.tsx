'use client'
import { EffectivePermissions } from "@/types/role";
import { Check, ChevronUp, Paperclip, Pencil, SendHorizontal, Smile, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useRoomSocket, RoomEvent } from "@/hooks/useRoomSocket";
import { useUser } from "@/context/userContext";

type RoomMember = {
  UserID: string;
  Username: string;
};

type Message = {
  id: string;
  content: string;
  user_id: string;
  username: string;
  reply_to_message_id: string | null;
  room_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type RawMessage = Omit<Message, 'username'>;

type MessagesPage = {
  messages: RawMessage[];
  has_more: boolean;
  next_cursor: string | null;
};

function enrichMessages(raw: RawMessage[], userMap: Record<string, RoomMember>): Message[] {
  return raw.map(msg => ({
    ...msg,
    username: userMap[msg.user_id]?.Username ?? msg.user_id.slice(0, 8),
  }));
}

export default function RoomPage() {
  const { user } = useUser();
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

  const userMapRef = useRef<Record<string, RoomMember>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const params = useParams<{ serverID: string; roomID: string }>();
  const serverID = params?.serverID || "";
  const roomID = params?.roomID || "";

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

  // Scroll to bottom after initial load
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
      const enriched = enrichMessages(page.messages, userMapRef.current);

      setMessages(prev => [...enriched, ...prev]);
      setHasMore(page.has_more);
      setNextCursor(page.next_cursor);

      // Restore scroll position so the user stays at the same message
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
    }
  }, [scrollToBottom]);

  useRoomSocket(roomID, handleEvent);

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

  const handleSend = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
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
            #{roomID}
          </p>
        </header>

        <div ref={scrollContainerRef} className="custom-scroll mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">

          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center py-2">
              <button
                type="button"
                onClick={loadMoreMessages}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-full border border-softBorder px-4 py-1.5 text-xs font-semibold text-textMed transition hover:border-electricPurple/50 hover:text-electricPurple disabled:opacity-50"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                {loadingMore ? "Loading..." : "Load older messages"}
              </button>
            </div>
          )}

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
            const isEditing = editingMessageID === message.id;
            const isConfirmingDelete = confirmDeleteID === message.id;

            return (
              <article
                key={message.id}
                className="group flex w-full items-end gap-2 justify-start sm:gap-3"
              >
                <HexAvatar initials={message.username.slice(0, 2).toUpperCase()} />

                <div className="flex max-w-[92%] flex-col gap-2 items-start sm:max-w-[80%]">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-textHigh">{message.username}</span>
                    <span className="text-textMed">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {message.updated_at > message.created_at && (
                      <span className="text-textMed italic">(edited)</span>
                    )}
                  </div>

                  <div className="flex items-end gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2 rounded-2xl bg-deepNavy px-3 py-2 shadow-sm">
                        <input
                          autoFocus
                          type="text"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-w-0 flex-1 bg-transparent text-sm text-textHigh outline-none"
                          onKeyDown={(e) => {
                            if (e.key === "Escape") { setEditingMessageID(null); setEditContent(""); }
                            if (e.key === "Enter" && editContent.trim()) {
                              handleSaveEdit(message.id, editContent);
                            }
                          }}
                        />
                        <button
                          type="button"
                          disabled={!editContent.trim()}
                          onClick={() => handleSaveEdit(message.id, editContent)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-electricPurple transition hover:bg-electricPurple/10 disabled:opacity-40"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingMessageID(null); setEditContent(""); }}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-textMed transition hover:bg-surfaceNavy"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : isConfirmingDelete ? (
                      <div className="flex items-center gap-2 rounded-2xl bg-deepNavy px-4 py-3 shadow-sm">
                        <span className="text-xs text-red-400">Delete this message?</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(message.id)}
                          className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteID(null)}
                          className="rounded-full border border-softBorder px-3 py-1 text-xs font-semibold text-textMed transition hover:text-textHigh"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <p className="rounded-2xl bg-deepNavy px-4 py-3 text-sm leading-relaxed text-textHigh shadow-sm sm:text-base">
                        {message.content}
                      </p>
                    )}

                    {!isEditing && !isConfirmingDelete && (canEdit || canDelete) && (
                      <div className="mb-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => { setEditingMessageID(message.id); setEditContent(message.content); }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-surfaceNavy text-textMed transition hover:bg-deepNavy hover:text-electricPurple"
                            aria-label="Edit message"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteID(message.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-surfaceNavy text-textMed transition hover:bg-deepNavy hover:text-red-400"
                            aria-label="Delete message"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          <div ref={bottomRef} />
        </div>

        <footer className="mt-4">
          <form onSubmit={handleSend} className="flex items-center gap-2 rounded-2xl bg-deepNavy p-2 sm:p-3">
            <button
              type="button"
              className="rounded-lg p-2 text-textMed transition hover:bg-surfaceNavy hover:text-textHigh"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Transmit data to #main-frame..."
              className="min-w-0 flex-1 bg-transparent text-sm text-textHigh outline-none placeholder:text-textMed sm:text-base"
            />

            <button
              type="button"
              className="rounded-lg p-2 text-textMed transition hover:text-textHigh"
              aria-label="Emoji"
            >
              <Smile className="h-4 w-4" />
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-electricPurple px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:px-5"
            >
              SEND
              <SendHorizontal className="h-4 w-4" />
            </button>
          </form>
        </footer>
      </div>
    </section>
  );
}

function HexAvatar(params: { initials: string; tone?: string }) {
  const { initials, tone = "bg-electricPurple" } = params;

  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center text-sm font-semibold text-white">
      <span className="absolute inset-0 [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-softBorder" />
      <span
        className={`relative z-10 flex h-9 w-9 items-center justify-center [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] ${tone}`}
      >
        {initials}
      </span>
    </span>
  );
}
