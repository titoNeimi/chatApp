import { useEffect, useRef } from "react"

type Message = {
  ID: string
  Content: string
  UserID: string
  RoomID: string
  ReplyToMessageID: string | null
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
}

export type RoomEvent =
  | {type:"message.new", payload: Message}
  | {type: "message.update", payload:{ID: string, Content: string}}
  | {type: "message.delete", payload:{ID: string}}
  | {type: "typing.start", payload:{userID: string}}
  | {type: "typing.stop", payload:{userID: string}}

type OutgoingEvent =
  | {type: "typing.start"}
  | {type: "typing.stop"}



const BASE_DELAY = 1000
const MAX_DELAY = 30000
const MAX_ATTEMPTS = 10
const TOKEN_TTL_MS = 5 * 60 * 1000

let cachedToken: string | null = null
let tokenFetchedAt = 0

async function getAuthToken(): Promise<string | null> {
  if (cachedToken && Date.now() - tokenFetchedAt < TOKEN_TTL_MS) {
    return cachedToken
  }
  const res = await fetch("/api/auth/token")
  if (!res.ok) return null
  const { token } = await res.json()
  cachedToken = token
  tokenFetchedAt = Date.now()
  return token
}

export const useRoomSocket = (roomID: string, onEvent: (event: RoomEvent) => void) => {
  const onEventRef = useRef(onEvent)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    onEventRef.current = onEvent
  })

  const sendEvent = (event: OutgoingEvent) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event))
    }
  }

  useEffect(() => {
    if (!roomID) return

    let cancelled = false
    let attempt = 0
    let retryTimeout: ReturnType<typeof setTimeout>

    const connect = async () => {
      const token = await getAuthToken()
      if (!token || cancelled) return

      const host = process.env.NEXT_PUBLIC_WS_HOST ?? "localhost:8080"
      const ws = new WebSocket(`ws://${host}/ws/room/${roomID}?token=${token}`)
      wsRef.current = ws

      ws.onmessage = (e) => {
        if (cancelled) return
        const event = JSON.parse(e.data) as RoomEvent
        onEventRef.current(event)
      }

      ws.onopen = () => {
        attempt = 0
      }

      ws.onerror = () => {
        ws.close()
      }

      ws.onclose = () => {
        wsRef.current = null
        if (cancelled || attempt >= MAX_ATTEMPTS) return
        const delay = Math.min(BASE_DELAY * 2 ** attempt, MAX_DELAY)
        attempt++
        retryTimeout = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      cancelled = true
      clearTimeout(retryTimeout)
      wsRef.current?.close()
    }
  }, [roomID])

  return { sendEvent }
}
