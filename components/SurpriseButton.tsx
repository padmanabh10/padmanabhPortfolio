"use client";
import { useEffect, useRef, useState } from "react";

export default function SurpriseButton() {
  const [active, setActive] = useState(false);
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const fadeRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/hava_nagila.mp3");
    audioRef.current.loop = false;
    return () => { audioRef.current?.pause(); };
  }, []);

  const fadeOut = (duration = 1500) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) clearInterval(fadeRef.current);
    const step = audio.volume / (duration / 50);
    fadeRef.current = setInterval(() => {
      if (!audioRef.current) return;
      if (audioRef.current.volume <= step) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 1;
        if (fadeRef.current) clearInterval(fadeRef.current);
      } else {
        audioRef.current.volume -= step;
      }
    }, 50);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const phase = (e as CustomEvent<string>).detail;
      const isActive = phase !== "idle" && phase !== "done";
      setActive(isActive);
      if (!isActive) fadeOut();
    };
    window.addEventListener("surprise-phase", handler);
    return () => window.removeEventListener("surprise-phase", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    if (!active) {
      const section = document.getElementById("tech-stack");
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (audioRef.current) {
        audioRef.current.volume = 1;
        audioRef.current.play().catch(() => {});
      }
    } else {
      fadeOut(600);
    }
    window.dispatchEvent(new CustomEvent("surprise-click"));
  };

  return (
    <div className="sm:hidden flex justify-center mt-6">
      <button
        onClick={handleClick}
        className="font-mono text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full bg-primary text-tag-text hover:opacity-80 active:scale-95 transition-all"
      >
        {active ? "Reset" : "Surprise"}
      </button>
    </div>
  );
}
