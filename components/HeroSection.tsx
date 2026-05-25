"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export default function HeroSection() {
  const stats: { label: string; value: string }[] = [];

  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);

  const rampPlaybackRate = (target: number, duration = 500) => {
    const video = videoRef.current;
    if (!video) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const from = video.playbackRate;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      video.playbackRate = from + (target - from) * t;
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  return (
    <section className="hero-grid-bg relative overflow-hidden border-b border-border-accent px-8 md:px-24 pt-4 pb-24 md:pb-0">
      {/* Background video */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <video
          ref={videoRef}
          src="/videos/hero-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-multiply [filter:grayscale(1)_contrast(1.05)_invert(1)]"
        />
        <div className="absolute inset-0 bg-bg mix-blend-saturation" />
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/40 to-bg/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-transparent to-bg" />
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-12 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
        <div>
          {/* Greeting */}
          <p className="font-mono text-base md:text-xl tracking-wider text-text-secondary">
            Hi, I am
          </p>

          {/* Main heading */}
          <h1 className="font-heading text-6xl md:text-[128px] leading-none uppercase text-primary max-w-5xl -ml-1 mt-4">
            PADMANABH
            <br />
            KULKARNI
          </h1>

          {/* Subtitle */}
          <p className="font-mono text-lg md:text-2xl leading-8 text-text-secondary max-w-2xl mt-10">
            A Backend Engineer focused on building scalable systems, designing
            efficient APIs, and developing reliable software for real world
            applications.
          </p>

          {/* About link */}
          <Link
            href="/about"
            onMouseEnter={() => rampPlaybackRate(5)}
            onMouseLeave={() => rampPlaybackRate(1)}
            onFocus={() => rampPlaybackRate(5)}
            onBlur={() => rampPlaybackRate(1)}
            className="group inline-flex items-center gap-3 mt-8 font-mono text-xs font-bold tracking-widest uppercase text-primary border border-primary px-5 py-3 hover:bg-primary hover:text-tag-text transition-colors"
          >
            KNOW MORE
          </Link>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-8 pt-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-surface border-r-4 border-primary p-4 min-w-[108px]"
              >
                <p className="font-mono text-[10px] font-bold uppercase text-text-muted leading-tight">
                  {stat.label}
                </p>
                <p className="font-heading text-3xl text-text mt-1">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Portrait */}
        <div className="relative mx-auto aspect-[3/4] w-80 md:mx-0 md:w-[480px] lg:w-[480px] overflow-hidden">
          <Image
            src="/images/hero-image-removebg-preview.png"
            alt="Padmanabh Kulkarni"
            fill
            priority
            sizes="(min-width: 1024px) 560px, (min-width: 768px) 480px, 320px"
            className="object-contain object-bottom mix-blend-multiply [filter:grayscale(1)_contrast(1.05)] [scale:1.3] [clip-path:inset(20%_0_0_0)]"
          />
        </div>
      </div>
    </section>
  );
}
