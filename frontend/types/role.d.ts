export type ServerRole = {
  id: string
  server_id: string
  name: string
  can_delete_messages: boolean
  can_mute_members: boolean
  can_manage_members: boolean
  can_manage_rooms: boolean
  can_send_messages: boolean
  created_at: string
  updated_at: string
}

export type UserWithRoles = {
  user_id: string
  username: string
  roles: ServerRole[]
}
export type ServerBan = {
  id: string
  server_id: string
  user_id: string
  banned_by: string
  reason?: string
  banned_at: string
}
export type EffectivePermissions = {
  can_delete_messages: boolean
  can_mute_members: boolean
  can_manage_members: boolean
  can_manage_rooms: boolean
  can_send_messages: boolean
}

export type RoomPermissionOverride = {
  id: string
  room_id: string
  role_id?: string
  user_id?: string
  can_delete_messages?: boolean
  can_mute_members?: boolean
  can_manage_members?: boolean
  can_manage_rooms?: boolean
  can_send_messages?: boolean
  created_at: string
  updated_at: string
}
