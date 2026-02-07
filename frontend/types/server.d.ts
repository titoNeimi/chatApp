export type Server = {
  id: string
  name: string
  description?: string,
  room_ids?: string[]
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}