import { useState, useEffect, useCallback, useRef } from "react";

const SOUND_EFFECTS = {
  spin: "https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3",
  win: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
  loss: "https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3",
  flip: "https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
} as const;

export type SoundType = keyof typeof SOUND_EFFECTS;
type MusicMode = "spin" | "flip";

type MusicState = {
  context: AudioContext;
  mix: GainNode;
  filter: BiquadFilterNode;
  drone: OscillatorNode;
  droneGain: GainNode;
  pulse: OscillatorNode;
  pulseGain: GainNode;
  scheduleId: number;
  alive: boolean;
  mode: MusicMode;
};

const SOUND_CHANGE_EVENT = "rafla-sound-state";

export function useSound() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem("soundEnabled");
    return saved !== null ? saved === "true" : true;
  });
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const unlockedRef = useRef(false);
  const musicRef = useRef<MusicState | null>(null);

  const stopMusic = useCallback(() => {
    const state = musicRef.current;
    if (!state) return;

    state.alive = false;
    window.clearInterval(state.scheduleId);

    try {
      state.drone.stop();
    } catch {
      // Ignore shutdown errors when the node is already stopped.
    }

    try {
      state.pulse.stop();
    } catch {
      // Ignore shutdown errors when the node is already stopped.
    }

    state.context.close().catch(() => {
      // Ignore shutdown errors when the context is already closed.
    });

    musicRef.current = null;
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

  useEffect(() => {
    Object.entries(SOUND_EFFECTS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      audioRefs.current[key] = audio;
    });

    const syncSoundState = (nextValue: boolean) => {
      setIsSoundEnabled(nextValue);
      if (!nextValue) {
        stopMusic();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "soundEnabled" && event.newValue !== null) {
        syncSoundState(event.newValue === "true");
      }
    };

    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === "boolean") {
        syncSoundState(customEvent.detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      SOUND_CHANGE_EVENT,
      handleCustomEvent as EventListener,
    );

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        SOUND_CHANGE_EVENT,
        handleCustomEvent as EventListener,
      );
      stopMusic();
    };
  }, [stopMusic]);

  const startMusic = useCallback(
    async (mode: MusicMode) => {
      if (!isSoundEnabled || typeof window === "undefined") return;

      unlockAudio();
      stopMusic();

      const AudioCtx =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioCtx) return;

      const context = new AudioCtx();
      await context.resume().catch(() => {
        // Safari/iOS can reject until the user interacts again.
      });

      const mix = context.createGain();
      mix.gain.value = 0.0001;

      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = mode === "spin" ? 950 : 760;
      filter.Q.value = 0.8;

      const drone = context.createOscillator();
      drone.type = mode === "spin" ? "sine" : "triangle";
      drone.frequency.value = mode === "spin" ? 82 : 110;
      const droneGain = context.createGain();
      droneGain.gain.value = mode === "spin" ? 0.016 : 0.012;

      const pulse = context.createOscillator();
      pulse.type = "sine";
      pulse.frequency.value = mode === "spin" ? 2.2 : 1.7;
      const pulseGain = context.createGain();
      pulseGain.gain.value = 0.0001;

      drone.connect(droneGain).connect(mix);
      pulse.connect(pulseGain).connect(mix);
      mix.connect(filter).connect(context.destination);

      drone.start();
      pulse.start();

      const patterns =
        mode === "spin"
          ? [
              [220, 277.18, 329.63],
              [196, 246.94, 293.66],
              [174.61, 220, 261.63],
              [196, 246.94, 392],
            ]
          : [
              [196, 246.94, 293.66],
              [174.61, 220, 261.63],
              [220, 261.63, 329.63],
              [196, 293.66, 369.99],
            ];

      const state: MusicState = {
        context,
        mix,
        filter,
        drone,
        droneGain,
        pulse,
        pulseGain,
        scheduleId: 0,
        alive: true,
        mode,
      };
      musicRef.current = state;

      let step = 0;
      const schedulePattern = () => {
        if (!state.alive) return;

        const now = context.currentTime;
        const chord = patterns[step % patterns.length];

        chord.forEach((frequency, index) => {
          const note = context.createOscillator();
          note.type = mode === "spin" ? "triangle" : "sine";
          note.frequency.value = frequency;

          const noteGain = context.createGain();
          noteGain.gain.setValueAtTime(0.0001, now);
          noteGain.gain.exponentialRampToValueAtTime(
            mode === "spin" ? 0.03 : 0.022,
            now + 0.08 + index * 0.04,
          );
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.82);

          note.connect(noteGain).connect(filter);
          note.start(now + index * 0.03);
          note.stop(now + 0.9);
        });

        pulseGain.gain.cancelScheduledValues(now);
        pulseGain.gain.setTargetAtTime(
          mode === "spin" ? 0.035 : 0.024,
          now,
          0.025,
        );
        pulseGain.gain.setTargetAtTime(0.0001, now + 0.28, 0.09);

        step += 1;
      };

      schedulePattern();
      state.scheduleId = window.setInterval(schedulePattern, 920);
    },
    [isSoundEnabled, stopMusic, unlockAudio],
  );

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const newState = !prev;
      localStorage.setItem("soundEnabled", String(newState));
      window.dispatchEvent(
        new CustomEvent<boolean>(SOUND_CHANGE_EVENT, { detail: newState }),
      );
      if (!newState) {
        stopMusic();
      }
      return newState;
    });
  }, [stopMusic]);

  const playSound = useCallback(
    (type: SoundType) => {
      if (!isSoundEnabled) return;
      unlockAudio();
      const audio = audioRefs.current[type];
      if (audio) {
        audio.currentTime = 0;
        audio.muted = false;
        void audio.play().catch((e) => console.warn("Sound play failed:", e));
      }
    },
    [isSoundEnabled, unlockAudio],
  );

  useEffect(() => {
    if (!isSoundEnabled) {
      stopMusic();
    }
  }, [isSoundEnabled, stopMusic]);

  const stopSound = useCallback((type: SoundType) => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  return {
    isSoundEnabled,
    toggleSound,
    playSound,
    playMusic: startMusic,
    stopMusic,
    stopSound,
    unlockAudio,
  };
}
