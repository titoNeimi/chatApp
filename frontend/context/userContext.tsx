'use client'

import { User } from "@/types/user"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

type Context = {
  user: User | null,
  isLoading: boolean,
  isLoggedIn: boolean,
  refresh: () => Promise<void>,
  logout: () => Promise<void>
}

const UserContext = createContext<Context | undefined>(undefined)

export function UserProvider({ children }:{ children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  async function refresh(): Promise<void>{
    setLoading(true)
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if(!res.ok){
        setUser(null)
        return
      }
      const data:User= await res.json()
      setUser(data)
    } catch {
      setUser(null)
      return
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

    const value: Context = {
    user,
    isLoading: loading,
    isLoggedIn: !!user,
    refresh,
    logout,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return ctx
}
