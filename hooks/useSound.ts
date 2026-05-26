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
  const unlockedRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("soundEnabled");
    if (saved !== null) {
      setIsSoundEnabled(saved === "true");
    }

    Object.entries(SOUND_EFFECTS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      audio.playsInline = true;
      audioRefs.current[key] = audio;
    });
  }, []);

  const unlockAudio = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;

    Object.values(audioRefs.current).forEach((audio) => {
      const originalMuted = audio.muted;
      audio.muted = true;
      void audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = originalMuted;
        })
        .catch(() => {
          audio.muted = originalMuted;
        });
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
      unlockAudio();
      const audio = audioRefs.current[type];
      if (audio) {
        audio.currentTime = 0;
        audio.muted = false;
        audio.play().catch((e) => console.warn("Sound play failed:", e));
      }
    },
    [isSoundEnabled, unlockAudio],
  );

  const stopSound = useCallback((type: SoundType) => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  return { isSoundEnabled, toggleSound, playSound, stopSound, unlockAudio };
}
