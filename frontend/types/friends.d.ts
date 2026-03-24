import { User } from "./user"

export type FriendEntry = {
  friendship_id: string
  user: User
  since: string
}

export type PendingRequest = {
  friendship_id: string
  from_user: User
  sent_at: string
}

export type FriendRequest = {
  id: string
  requester_id: string
  addressee_id: string
  status: "pending" | "accepted"
  created_at: string
}