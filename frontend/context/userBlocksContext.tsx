import { UserBlock } from "@/types/userBlocks"
import { createContext, useContext, useEffect, useState } from "react"

type UserBlocksContext = {
  loading: boolean,
  isBlocked: (userID: string) => boolean,
  refresh: () => Promise<void>,
  addUserBlock: (userID: string) => Promise<void>,
  removeUserBlock: (userID: string) => Promise<void>,
}

const UserBlocksContext = createContext<UserBlocksContext | undefined>(undefined)

export function UserBlocksProvider({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    refresh()
  }, [])

  async function refresh(): Promise<void> {
    try {
      setLoading(true)
      const res = await fetch("/api/blocks")
      if (!res.ok) return

      const data = await res.json() as UserBlock[]
      setBlocked(new Set(data.map(b => b.blocked_user_id)))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function addUserBlock(userID: string): Promise<void> {
    setBlocked(prev => new Set(prev).add(userID))
    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userID }),
      })
      if (!res.ok) setBlocked(prev => { const next = new Set(prev); next.delete(userID); return next })
    } catch (error) {
      console.error(error)
      setBlocked(prev => { const next = new Set(prev); next.delete(userID); return next })
    }
  }

  async function removeUserBlock(userID: string): Promise<void> {
    setBlocked(prev => { const next = new Set(prev); next.delete(userID); return next })
    try {
      const res = await fetch(`/api/blocks/${userID}`, { method: 'DELETE' })
      if (!res.ok) await refresh()
    } catch (error) {
      console.error(error)
      await refresh()
    }
  }

  function isBlocked(userID: string): boolean {
    return blocked.has(userID)
  }

  const value: UserBlocksContext = {
    loading,
    refresh,
    addUserBlock,
    removeUserBlock,
    isBlocked,
  }

  return <UserBlocksContext.Provider value={value}>{children}</UserBlocksContext.Provider>
}

export function useUserBlocks() {
  const ctx = useContext(UserBlocksContext)
  if (!ctx) {
    throw new Error("useUserBlocks must be used within a UserBlocksProvider")
  }
  return ctx
}
