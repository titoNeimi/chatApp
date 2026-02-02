export type User = {
  id: string,
  username: string,
  email:string,
  role: UserRole
}

export type UserRole = 'user' | 'admin'