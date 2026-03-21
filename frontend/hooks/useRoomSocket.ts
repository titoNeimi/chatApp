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



const BASE_DELAY = 1000
const MAX_DELAY = 30000
const MAX_ATTEMPTS = 10

export const useRoomSocket = (roomID: string, onEvent: (event: RoomEvent) => void) => {
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  })

  useEffect(() => {
    if (!roomID) return

    let ws: WebSocket
    let cancelled = false
    let attempt = 0
    let retryTimeout: ReturnType<typeof setTimeout>

    const connect = async () => {
      const res = await fetch("/api/auth/token")
      if (!res.ok || cancelled) return

      const { token } = await res.json()
      if (cancelled) return

      const host = process.env.NEXT_PUBLIC_WS_HOST ?? "localhost:8080"
      ws = new WebSocket(`ws://${host}/ws/room/${roomID}?token=${token}`)

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
      ws?.close()
    }
  }, [roomID])
}
