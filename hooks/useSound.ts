import { useState, useEffect, useCallback, useRef } from "react";

const SOUND_EFFECTS = {
  spin: "https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3",
  win: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
  loss: "https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3",
  flip: "https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
};

export type SoundType = keyof typeof SOUND_EFFECTS;

export function useSound() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    const saved = localStorage.getItem("soundEnabled");
    if (saved !== null) {
      setIsSoundEnabled(saved === "true");
    }

    // Preload sounds
    Object.entries(SOUND_EFFECTS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = "auto";
      audioRefs.current[key] = audio;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const newState = !prev;
      localStorage.setItem("soundEnabled", String(newState));
      return newState;
    });
  }, []);

  const playSound = useCallback(
    (type: SoundType) => {
      if (!isSoundEnabled) return;
      const audio = audioRefs.current[type];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch((e) => console.warn("Sound play failed:", e));
      }
    },
    [isSoundEnabled],
  );

  const stopSound = useCallback((type: SoundType) => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  return { isSoundEnabled, toggleSound, playSound, stopSound };
}
