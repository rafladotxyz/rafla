"use client";

import { useState } from "react";

const DISCLAIMER_KEY = "rafla_disclaimer_accepted";

export function useDisclaimer() {
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    // Only show if user hasn't accepted before
    const accepted = localStorage.getItem(DISCLAIMER_KEY);
    return !accepted;
  });

  const acceptDisclaimer = () => {
    localStorage.setItem(DISCLAIMER_KEY, "1");
    setShowDisclaimer(false);
  };

  return { showDisclaimer, acceptDisclaimer };
}
