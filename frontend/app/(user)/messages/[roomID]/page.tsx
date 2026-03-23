'use client'

import {
  ChatInput,
  ChatMessage,
  LoadMoreButton,
  Message,
  MessagesPage,
  RoomMember,
  enrichMessages,
} from '@/components/chatComponents'
import { useRoomSocket, RoomEvent } from '@/hooks/useRoomSocket'
import { useUser } from '@/context/userContext'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function DMChatPage() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams<{ roomID: string }>()
  const roomID = params?.roomID ?? ''

  const [isLoading, setIsLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [editingMessageID, setEditingMessageID] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [confirmDeleteID, setConfirmDeleteID] = useState<string | null>(null)
  const [otherUsername, setOtherUsername] = useState<string>('Direct Message')

  const userMapRef = useRef<Record<string, RoomMember>>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'instant') => {
    bottomRef.current?.scrollIntoView({ behavior })
  }, [])

  useEffect(() => {
    if (!roomID) return
    const fetchAll = async () => {
      setIsLoading(true)
      try {
        const [membersRes, messagesRes] = await Promise.all([
          fetch(`/api/rooms/${roomID}/users`),
          fetch(`/api/dm/${roomID}/messages?limit=50`, { cache: 'no-store' }),
        ])
        if (messagesRes.status === 401) { router.push('/login'); return }
        if (!messagesRes.ok) throw new Error('Failed to load messages')

        const members: RoomMember[] = membersRes.ok ? await membersRes.json() : []
        const page: MessagesPage = await messagesRes.json()

        const userMap = Object.fromEntries(members.map(m => [m.UserID, m]))
        userMapRef.current = userMap

        const other = members.find(m => m.UserID !== user?.id)
        if (other) setOtherUsername(other.Username)

        setMessages(enrichMessages(page.messages ?? [], userMap))
        setHasMore(page.has_more ?? false)
        setNextCursor(page.next_cursor ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [roomID, user?.id, router])

  useEffect(() => {
    if (!isLoading && messages.length > 0) scrollToBottom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const loadMoreMessages = useCallback(async () => {
    if (!nextCursor || loadingMore || !hasMore) return
    setLoadingMore(true)
    const container = scrollContainerRef.current
    const prevScrollHeight = container?.scrollHeight ?? 0
    try {
      const url = new URL(`/api/dm/${roomID}/messages`, window.location.origin)
      url.searchParams.set('limit', '50')
      url.searchParams.set('before', nextCursor)
      const res = await fetch(url.toString())
      if (!res.ok) return
      const page: MessagesPage = await res.json()
      setMessages(prev => [...enrichMessages(page.messages, userMapRef.current), ...prev])
      setHasMore(page.has_more)
      setNextCursor(page.next_cursor)
      requestAnimationFrame(() => {
        if (container) container.scrollTop = container.scrollHeight - prevScrollHeight
      })
    } finally {
      setLoadingMore(false)
    }
  }, [nextCursor, loadingMore, hasMore, roomID])

  const handleEvent = useCallback((event: RoomEvent) => {
    if (event.type === 'message.new') {
      setMessages(prev => {
        if (prev.some(m => m.id === event.payload.ID)) return prev
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
        }
        return [...prev, enriched]
      })
      scrollToBottom('smooth')
    } else if (event.type === 'message.update') {
      setMessages(prev =>
        prev.map(m =>
          m.id === event.payload.ID
            ? { ...m, content: event.payload.Content, updated_at: new Date().toISOString() }
            : m
        )
      )
    } else if (event.type === 'message.delete') {
      setMessages(prev => prev.filter(m => m.id !== event.payload.ID))
    }
  }, [scrollToBottom])

  useRoomSocket(roomID, handleEvent)

  const handleSaveEdit = async (messageID: string, content: string) => {
    await fetch(`/api/messages/${messageID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    setMessages(prev =>
      prev.map(m => m.id === messageID ? { ...m, content, updated_at: new Date().toISOString() } : m)
    )
    setEditingMessageID(null)
    setEditContent('')
  }

  const handleDelete = async (messageID: string) => {
    await fetch(`/api/messages/${messageID}`, { method: 'DELETE' })
    setMessages(prev => prev.filter(m => m.id !== messageID))
    setConfirmDeleteID(null)
  }

  const handleSend = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    await fetch(`/api/dm/${roomID}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: messageInput }),
    })
    setMessageInput('')
    scrollToBottom('smooth')
  }

  if (!roomID) {
    return (
      <div className="flex h-[calc(100dvh-8.5rem)] min-h-120 w-full items-center justify-center rounded-2xl bg-surfaceNavy shadow-[0_20px_40px_var(--color-panelShadow)]">
        <p className="text-sm text-textMed">Invalid conversation</p>
      </div>
    )
  }

  return (
    <section className="relative flex h-[calc(100dvh-8.5rem)] min-h-120 w-full min-w-0 flex-1 overflow-hidden">
      <div className="relative flex h-full min-h-0 w-full flex-col rounded-2xl bg-surfaceNavy p-4 shadow-[0_20px_40px_var(--color-panelShadow)] sm:p-5">
        <header className="flex items-center gap-3 pb-3">
          <p className="text-sm font-semibold text-electricPurple">
            @ {otherUsername}
          </p>
        </header>

        <div ref={scrollContainerRef} className="custom-scroll mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          {hasMore && <LoadMoreButton onClick={loadMoreMessages} loading={loadingMore} />}
          {isLoading && <p className="text-center text-sm text-textMed">Loading messages...</p>}
          {error && <p className="text-center text-sm text-red-400">{error}</p>}
          {!isLoading && !error && messages.length === 0 && (
            <p className="text-center text-sm text-textMed">No messages yet. Say hello!</p>
          )}

          {messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              canEdit={message.user_id === user?.id}
              canDelete={message.user_id === user?.id || user?.role === 'admin'}
              isEditing={editingMessageID === message.id}
              isConfirmingDelete={confirmDeleteID === message.id}
              editContent={editContent}
              onEditStart={() => { setEditingMessageID(message.id); setEditContent(message.content) }}
              onEditSave={() => handleSaveEdit(message.id, editContent)}
              onEditCancel={() => { setEditingMessageID(null); setEditContent('') }}
              onEditContentChange={setEditContent}
              onDeleteRequest={() => setConfirmDeleteID(message.id)}
              onDeleteConfirm={() => handleDelete(message.id)}
              onDeleteCancel={() => setConfirmDeleteID(null)}
            />
          ))}

          <div ref={bottomRef} />
        </div>

        <footer className="mt-4">
          <ChatInput
            value={messageInput}
            onChange={setMessageInput}
            onSubmit={handleSend}
            placeholder={`Message @ ${otherUsername}...`}
          />
        </footer>
      </div>
    </section>
  )
}
