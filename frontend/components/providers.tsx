'use client'

import { ReactNode } from "react";
import { UserProvider } from "@/context/userContext";
import { UserBlocksProvider } from "@/context/userBlocksContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
  <UserProvider>
    <UserBlocksProvider>
      {children}
    </UserBlocksProvider>
  </UserProvider>)
}
