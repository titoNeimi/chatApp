export type User = {
  id: string,
  username: string,
  email:string,
  role: UserRole,
  created_at?: string,
  updated_at?: string,
}

export type UserRole = 'user' | 'admin'