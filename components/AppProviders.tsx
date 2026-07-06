"use client";

import { UserProvider } from "./UserProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
