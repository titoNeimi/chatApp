export type Server = {
  id: string
  name: string
  description?: string,
  room_ids?: string[]
  created_at: Date
  updated_at: Date
  deleted_at?: Date
  is_private?: boolean
}

export type TrendingServer = {
  id: string
  name: string
  description?: string
  is_private: boolean
  created_at: string
  updated_at: string
  member_count: number
  recent_messages: number
  active_users: number
  trend_score: number
}