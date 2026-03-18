'use client'

import { Server } from "@/types/server"
import { createContext, ReactNode, useContext } from "react"

type UserServersContextValue = {
  servers: Server[] | null
  refresh: () => Promise<void>
}

const UserServersContext = createContext<UserServersContextValue | undefined>(undefined)

export function UserServersProvider({
  children,
  value,
}: {
  children: ReactNode
  value: UserServersContextValue
}) {
  return (
    <UserServersContext.Provider value={value}>
      {children}
    </UserServersContext.Provider>
  )
}

export function useUserServers() {
  const ctx = useContext(UserServersContext)
  if (!ctx) {
    throw new Error("useUserServers must be used within UserServersProvider")
  }
  return ctx
}
