"use client";

import { FlickeringGrid } from "@/components/FlickeringGrid";

interface PageHeaderProps {
  children: React.ReactNode;
}

export default function PageHeader({ children }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden px-4 sm:px-8 md:px-24 pt-12 sm:pt-16 pb-10 sm:pb-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <FlickeringGrid
          className="absolute inset-0 z-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.5}
          flickerChance={0.1}
        />
        <div className="absolute inset-0 bg-bg mix-blend-saturation" />
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/40 to-bg/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-transparent to-bg" />
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}
