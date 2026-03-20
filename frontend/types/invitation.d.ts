type Invitation = {
  id: string
  server_id: string
  created_by: string
  code: string
  max_uses: number | null
  uses: number
  expires_at: string | null
  created_at: string
}

type InvitationPreview = {
  code: string
  max_uses: number | null
  uses: number
  expires_at: string | null
  server: {
    id: string
    name: string
    description?: string
  }
}
