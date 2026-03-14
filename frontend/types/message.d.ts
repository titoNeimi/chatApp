export type Message = {
  id: string
  content: string
  user_id: string
  reply_to_message_id?: string
  room_id: string
  created_at: string
  updated_at: string
  deleted_at?: string
}
