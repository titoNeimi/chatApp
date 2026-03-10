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



export const useRoomSocket = (roomID: string, onEvent: (event: RoomEvent) => void) => {
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  })

  useEffect(() => {
    if (!roomID) return

    let ws: WebSocket
    let cancelled = false

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
    }

    connect()

    return () => {
      cancelled = true
      ws?.close()
    }
  }, [roomID])
}
