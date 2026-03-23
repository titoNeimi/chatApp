'use client'

import { Check, ChevronUp, Paperclip, Pencil, SendHorizontal, Smile, Trash2, X } from 'lucide-react'

export type RoomMember = {
  UserID: string
  Username: string
}

export type Message = {
  id: string
  content: string
  user_id: string
  username: string
  reply_to_message_id: string | null
  room_id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type RawMessage = Omit<Message, 'username'>

export type MessagesPage = {
  messages: RawMessage[]
  has_more: boolean
  next_cursor: string | null
}

export function enrichMessages(
  raw: RawMessage[],
  userMap: Record<string, RoomMember>
): Message[] {
  return raw.map(msg => ({
    ...msg,
    username: userMap[msg.user_id]?.Username ?? msg.user_id.slice(0, 8),
  }))
}

// ---------------------------------------------------------------------------
// ChatAvatar
// ---------------------------------------------------------------------------
export function ChatAvatar({ initials }: { initials: string }) {
  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center text-sm font-semibold text-white">
      <span className="absolute inset-0 [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-softBorder" />
      <span className="relative z-10 flex h-9 w-9 items-center justify-center [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-electricPurple">
        {initials}
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// LoadMoreButton
// ---------------------------------------------------------------------------
export function LoadMoreButton({
  onClick,
  loading,
}: {
  onClick: () => void
  loading: boolean
}) {
  return (
    <div className="flex justify-center py-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-softBorder px-4 py-1.5 text-xs font-semibold text-textMed transition hover:border-electricPurple/50 hover:text-electricPurple disabled:opacity-50"
      >
        <ChevronUp className="h-3.5 w-3.5" />
        {loading ? 'Loading...' : 'Load older messages'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ChatMessage
// ---------------------------------------------------------------------------
export function ChatMessage({
  message,
  canEdit,
  canDelete,
  isEditing,
  isConfirmingDelete,
  editContent,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditContentChange,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: {
  message: Message
  canEdit: boolean
  canDelete: boolean
  isEditing: boolean
  isConfirmingDelete: boolean
  editContent: string
  onEditStart: () => void
  onEditSave: () => void
  onEditCancel: () => void
  onEditContentChange: (val: string) => void
  onDeleteRequest: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}) {
  return (
    <article className="group flex w-full items-end gap-2 justify-start sm:gap-3">
      <ChatAvatar initials={message.username.slice(0, 2).toUpperCase()} />

      <div className="flex max-w-[92%] flex-col gap-2 items-start sm:max-w-[80%]">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-textHigh">{message.username}</span>
          <span className="text-textMed">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                onChange={e => onEditContentChange(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-textHigh outline-none"
                onKeyDown={e => {
                  if (e.key === 'Escape') onEditCancel()
                  if (e.key === 'Enter' && editContent.trim()) onEditSave()
                }}
              />
              <button
                type="button"
                disabled={!editContent.trim()}
                onClick={onEditSave}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-electricPurple transition hover:bg-electricPurple/10 disabled:opacity-40"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onEditCancel}
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
                onClick={onDeleteConfirm}
                className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={onDeleteCancel}
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
                  onClick={onEditStart}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-surfaceNavy text-textMed transition hover:bg-deepNavy hover:text-electricPurple"
                  aria-label="Edit message"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={onDeleteRequest}
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
  )
}

// ---------------------------------------------------------------------------
// ChatInput
// ---------------------------------------------------------------------------
export function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Send a message...',
  disabled = false,
  disabledMessage = 'You do not have permission to send messages here.',
}: {
  value: string
  onChange: (val: string) => void
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void
  placeholder?: string
  disabled?: boolean
  disabledMessage?: string
}) {
  return (
    <form onSubmit={onSubmit} className={`flex items-center gap-2 rounded-2xl bg-deepNavy p-2 sm:p-3 ${disabled ? 'opacity-60' : ''}`}>
      <button
        type="button"
        disabled={disabled}
        className="rounded-lg p-2 text-textMed transition hover:bg-surfaceNavy hover:text-textHigh disabled:cursor-not-allowed disabled:pointer-events-none"
        aria-label="Attach file"
      >
        <Paperclip className="h-4 w-4" />
      </button>

      <input
        type="text"
        value={disabled ? '' : value}
        onChange={e => onChange(e.target.value)}
        placeholder={disabled ? disabledMessage : placeholder}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent text-sm text-textHigh outline-none placeholder:text-textMed disabled:cursor-not-allowed sm:text-base"
      />

      <button
        type="button"
        disabled={disabled}
        className="rounded-lg p-2 text-textMed transition hover:text-textHigh disabled:cursor-not-allowed disabled:pointer-events-none"
        aria-label="Emoji"
      >
        <Smile className="h-4 w-4" />
      </button>

      <button
        type="submit"
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-xl bg-electricPurple px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:pointer-events-none sm:px-5"
      >
        SEND
        <SendHorizontal className="h-4 w-4" />
      </button>
    </form>
  )
}
