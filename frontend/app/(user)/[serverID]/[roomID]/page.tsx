import { Paperclip, SendHorizontal, Smile } from "lucide-react";
import { mockedMessages, mockedUsers } from "@/lib/mockData";

export default function RoomDashboardPlaceholder() {
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

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          {mockedMessages.map((message) => {
            const author = mockedUsers[message.userID];
            const isCurrentUser = author.id === "user-kris";

            return (
              <article
                key={message.id}
                className={`flex w-full items-end gap-2 sm:gap-3 ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isCurrentUser && (
                  <HexAvatar initials={author.initials} tone={author.avatarTone} />
                )}

                <div
                  className={`flex max-w-[92%] flex-col gap-2 sm:max-w-[80%] ${
                    isCurrentUser ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    {!isCurrentUser && (
                      <span className="font-semibold text-textHigh">
                        {author.handle}
                      </span>
                    )}
                    <span className="text-textMed">{message.timeUTC}</span>
                    {isCurrentUser && (
                      <span className="font-semibold text-electricPurple">
                        {author.handle}
                      </span>
                    )}
                  </div>

                  {message.type === "text" && (
                    <p
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:text-base ${
                        isCurrentUser
                          ? "bg-electricPurple text-white"
                          : "bg-deepNavy text-textHigh"
                      }`}
                    >
                      {message.content}
                    </p>
                  )}

                  {message.type === "attachment" && (
                    <div className="w-full max-w-105 rounded-2xl bg-[#c8b79d]/90 p-3 shadow-sm">
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[linear-gradient(140deg,#cdbb9f_0%,#8f836f_100%)]">
                        <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#68735d]/70" />
                        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#a8abae]/80" />
                        <div className="absolute bottom-3 right-3 text-[10px] font-semibold tracking-wide text-[#ece7db]">
                          {message.fileName}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isCurrentUser && (
                  <HexAvatar initials={author.initials} tone={author.avatarTone} />
                )}
              </article>
            );
          })}
        </div>

        <footer className="mt-4">
          <form className="flex items-center gap-2 rounded-2xl bg-deepNavy p-2 sm:p-3">
            <button
              type="button"
              className="rounded-lg p-2 text-textMed transition hover:bg-surfaceNavy hover:text-textHigh"
              aria-label="Adjuntar archivo"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <input
              type="text"
              value=""
              readOnly
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

function HexAvatar(params: { initials: string; tone: string }) {
  const { initials, tone } = params;

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
