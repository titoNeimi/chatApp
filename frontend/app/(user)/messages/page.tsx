'use client'

import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div className="flex h-[calc(100dvh-8.5rem)] min-h-120 w-full items-center justify-center rounded-2xl bg-surfaceNavy shadow-[0_20px_40px_var(--color-panelShadow)]">
      <div className="flex flex-col items-center gap-3 text-center">
        <MessageSquare className="h-10 w-10 text-electricPurple/40" />
        <p className="text-sm font-semibold text-textMed">Select a conversation</p>
        <p className="text-xs text-textMed">or start a new one with the + button</p>
      </div>
    </div>
  )
}
