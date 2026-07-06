"use client";

import { useState } from "react";
import { CreditsProvider } from "./CreditsProvider";
import { FavoriteBreaksProvider } from "./FavoriteBreaksProvider";
import TopBar from "./TopBar";
import WelcomeOverlay from "./WelcomeOverlay";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <CreditsProvider>
      <FavoriteBreaksProvider>
        <TopBar />
        {children}
        {showWelcome && (
          <WelcomeOverlay onDismiss={() => setShowWelcome(false)} />
        )}
      </FavoriteBreaksProvider>
    </CreditsProvider>
  );
}
