export type Room = {
  id: string
  name: string
  description?: string
  type: RoomType
  server_id: string
  is_private: boolean
  is_read_only: boolean
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export type RoomType = 'server' | 'direct_message'