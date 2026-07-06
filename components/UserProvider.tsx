"use client";

import { createContext, useContext } from "react";
import { USER_DISPLAY_NAME, USER_EMAIL } from "@/lib/user";

type UserContextValue = {
  displayName: string;
  email: string;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserContext.Provider
      value={{ displayName: USER_DISPLAY_NAME, email: USER_EMAIL }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
