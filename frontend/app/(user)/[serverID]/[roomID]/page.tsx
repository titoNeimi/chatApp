'use client'
import { Paperclip, SendHorizontal, Smile } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRoomSocket, RoomEvent } from "@/hooks/useRoomSocket";

type Message = {
  ID: string;
  Content: string;
  UserID: string;
  ReplyToMessageID: string | null;
  RoomID: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
};

export default function RoomDashboardPlaceholder() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");

  const params = useParams<{ serverID: string, roomID: string }>();

  const serverID = params?.serverID || "";
  const roomID = params?.roomID || "";

  const handleEvent = useCallback((event: RoomEvent) => {
    if (event.type === "message.new") {
      setMessages((prev) => prev.some(m => m.ID === event.payload.ID) ? prev : [...prev, event.payload])
    } else if (event.type === "message.update") {
      setMessages((prev) => prev.map(m =>
        m.ID === event.payload.ID ? { ...m, Content: event.payload.Content } : m
      ))
    } else if (event.type === "message.delete") {
      setMessages((prev) => prev.filter(m => m.ID !== event.payload.ID))
    }
  }, [])

  useRoomSocket(roomID, handleEvent)

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    await fetch(`/api/servers/${serverID}/rooms/${roomID}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: messageInput }),
    })
    setMessageInput("")
  }

  useEffect(() => {
    if (!serverID || !roomID) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/servers/${serverID}/rooms/${roomID}/messages`);
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Fetched messages:", data);
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [serverID, roomID]);

  if (!serverID || !roomID) {
    return (
      <div className="flex h-[calc(100dvh-8.5rem)] min-h-120 w-full items-center justify-center rounded-2xl bg-surfaceNavy p-4 shadow-[0_20px_40px_var(--color-panelShadow)] sm:p-5">
        <p className="text-sm text-textMed">serverID and roomID are required</p>
      </div>
    );
  }
  


  return (
    <section className="relative flex h-[calc(100dvh-8.5rem)] min-h-120 w-full min-w-0 flex-1 overflow-hidden">
      <div className="relative flex h-full min-h-0 w-full flex-col rounded-2xl bg-surfaceNavy p-4 shadow-[0_20px_40px_var(--color-panelShadow)] sm:p-5">
        <header className="flex items-center gap-3 pb-3">
          <p className="text-sm font-semibold text-electricPurple">
            /main-frame
          </p>
          <span className="text-xs text-textMed">|</span>
          <p className="text-sm text-textMed">Public Protocol Channel</p>
        </header>

        <div className="custom-scroll mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          {isLoading && (
            <p className="text-center text-sm text-textMed">Loading messages...</p>
          )}
          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}
          {!isLoading && !error && messages && messages.length === 0 && (
            <p className="text-center text-sm text-textMed">No messages yet. Be the first to send one!</p>
          )}
          {messages && messages.map((message) => (
            <article
              key={message.ID}
              className="flex w-full items-end gap-2 justify-start sm:gap-3"
            >
              <HexAvatar initials={message.UserID.slice(0, 2).toUpperCase()} />

              <div className="flex max-w-[92%] flex-col gap-2 items-start sm:max-w-[80%]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-textHigh">
                    {message.UserID.slice(0, 8)}
                  </span>
                  <span className="text-textMed">
                    {new Date(message.CreatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <p className="rounded-2xl bg-deepNavy px-4 py-3 text-sm leading-relaxed text-textHigh shadow-sm sm:text-base">
                  {message.Content}
                </p>
              </div>
            </article>
          ))}
        </div>

        <footer className="mt-4">
          <form onSubmit={handleSend} className="flex items-center gap-2 rounded-2xl bg-deepNavy p-2 sm:p-3">
            <button
              type="button"
              className="rounded-lg p-2 text-textMed transition hover:bg-surfaceNavy hover:text-textHigh"
              aria-label="Adjuntar archivo"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Transmit data to #main-frame..."
              className="min-w-0 flex-1 bg-transparent text-sm text-textHigh outline-none placeholder:text-textMed sm:text-base"
            />

            <button
              type="button"
              className="rounded-lg p-2 text-textMed transition hover:text-textHigh"
              aria-label="Emoji"
            >
              <Smile className="h-4 w-4" />
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-electricPurple px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:px-5"
            >
              SEND
              <SendHorizontal className="h-4 w-4" />
            </button>
          </form>
        </footer>
      </div>
    </section>
  );
}

function HexAvatar(params: { initials: string; tone?: string }) {
  const { initials, tone = "bg-electricPurple" } = params;

  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center text-sm font-semibold text-white">
      <span className="absolute inset-0 [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-softBorder" />
      <span
        className={`relative z-10 flex h-9 w-9 items-center justify-center [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] ${tone}`}
      >
        {initials}
      </span>
    </span>
  );
}
