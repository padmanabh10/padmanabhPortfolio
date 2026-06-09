"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/components/ThemeProvider";

const INTRO_MS   = 10000;  // intro plane flies right→left behind buildings
const CYCLE_MS   = 14000;  // one full main animation cycle
const BURST_GAP  = 220;    // ms between each rapid burst explosion

const EXPLOSIONS = [
  { id: "a", left: 18, triggerPct: 18, yOffset: 22 },
  { id: "b", left: 33, triggerPct: 33, yOffset: 40 },
  { id: "c", left: 50, triggerPct: 50, yOffset: 60 },
  { id: "d", left: 67, triggerPct: 67, yOffset: 80 },
  { id: "e", left: 83, triggerPct: 83, yOffset: 100 },
];

const BURST_POSITIONS = [
  { left: "12%", top: "25%" }, { left: "42%", top: "18%" }, { left: "72%", top: "30%" },
  { left: "22%", top: "55%" }, { left: "58%", top: "48%" }, { left: "85%", top: "22%" },
  { left: "8%",  top: "72%" }, { left: "48%", top: "70%" }, { left: "33%", top: "40%" },
  { left: "68%", top: "65%" }, { left: "18%", top: "85%" }, { left: "80%", top: "78%" },
  { left: "52%", top: "35%" }, { left: "28%", top: "62%" }, { left: "90%", top: "55%" },
];

function buildMainKeyframes(id: string, p: number) {
  const pre      = Math.max(0, p - 0.1).toFixed(1);
  const flashEnd = Math.min(100, p + 9);
  const ring1End = Math.min(100, p + 17);
  const r2Start  = Math.min(100, p + 2);
  const ring2End = Math.min(100, p + 19);
  return `
    @keyframes flash-${id} {
      0%,${pre}% { opacity:0; transform:scale(0); }
      ${p}%      { opacity:.95; transform:scale(.6); }
      ${flashEnd}%,100% { opacity:0; transform:scale(2.2); }
    }
    @keyframes ring1-${id} {
      0%,${pre}% { opacity:0; transform:scale(0); }
      ${p}%      { opacity:1; transform:scale(0); }
      ${ring1End}%,100% { opacity:0; transform:scale(4.5); }
    }
    @keyframes ring2-${id} {
      0%,${r2Start}% { opacity:0; transform:scale(0); }
      ${Math.min(100, p + 2.1).toFixed(1)}% { opacity:.65; transform:scale(0); }
      ${ring2End}%,100% { opacity:0; transform:scale(4); }
    }
  `;
}

const MAIN_KEYFRAMES = EXPLOSIONS.map((e) => buildMainKeyframes(e.id, e.triggerPct)).join("");
const MAIN_ANIM_CSS  = EXPLOSIONS.map(({ id }) => `
  .flash-${id} { animation-name:flash-${id}; animation-duration:14s; animation-timing-function:ease-out; animation-iteration-count:1; }
  .ring1-${id} { animation-name:ring1-${id}; animation-duration:14s; animation-timing-function:ease-out; animation-iteration-count:1; }
  .ring2-${id} { animation-name:ring2-${id}; animation-duration:14s; animation-timing-function:ease-out; animation-iteration-count:1; }
`).join("");

type Phase = "idle" | "intro" | "main" | "burst" | "reset" | "done";

export default function PlaneExplosion() {
  const { theme } = useTheme();
  const containerRef   = useRef<HTMLDivElement>(null);
  const timers         = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [phase,        setPhase]        = useState<Phase>("idle");
  const [leftDown,     setLeftDown]     = useState(false);
  const [rightDown,    setRightDown]    = useState(false);
  const [burstCount,   setBurstCount]   = useState(0);

  const cancelAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const reset = useCallback(() => {
    cancelAll();
    setPhase("idle");
    setLeftDown(false);
    setRightDown(false);
    setBurstCount(0);
  }, [cancelAll]);

  const addTimer = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const run = useCallback(() => {
    setBurstCount(0);
    setLeftDown(false);
    setRightDown(false);
    setPhase("intro");

    // After intro, start main animation
    addTimer(() => setPhase("main"), INTRO_MS);

    // Collapse — left after first column, right after second
    addTimer(() => setLeftDown(true),  INTRO_MS + CYCLE_MS * 0.40);
    addTimer(() => setRightDown(true), INTRO_MS + CYCLE_MS * 0.80);

    // After single main cycle → burst phase (curtains stay up)
    const burstStart = INTRO_MS + CYCLE_MS;
    addTimer(() => setPhase("burst"), burstStart);

    // Rapid burst explosions
    BURST_POSITIONS.forEach((_, i) => {
      addTimer(() => setBurstCount(i + 1), burstStart + i * BURST_GAP);
    });

    // After bursts → reset: retract curtains to reveal buildings again
    const resetStart = burstStart + BURST_POSITIONS.length * BURST_GAP + 400;
    addTimer(() => {
      setPhase("reset");
      setLeftDown(false);
      setRightDown(false);
    }, resetStart);

    // Done after curtain retraction transition (2500ms)
    addTimer(() => setPhase("done"), resetStart + 2800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSurprise = useCallback(() => {
    if (phase === "idle" || phase === "done") run();
    else reset();
  }, [phase, run, reset]);

  useEffect(() => {
    window.addEventListener("surprise-click", handleSurprise);
    return () => window.removeEventListener("surprise-click", handleSurprise);
  }, [handleSurprise]);

  // Broadcast phase so the button can update its label
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("surprise-phase", { detail: phase }));
  }, [phase]);

  const showMain    = phase === "main";
  const showBurst   = phase === "burst";
  const showCurtain = phase === "main" || phase === "burst" || phase === "reset";

  return (
    <div ref={containerRef} className="sm:hidden absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes planeIntro {
          0%   { transform: translate(calc(100vw + 60px), 80px); }
          100% { transform: translate(-80px, 380px); }
        }
        .plane-intro-wrap {
          position: absolute; top: 0; left: 0;
          animation: planeIntro ${INTRO_MS}ms linear 1 forwards;
        }
        @keyframes planeFly {
          0%   { transform: translate(-80px, 0px) rotate(15deg); }
          100% { transform: translate(calc(100vw + 80px), 120px) rotate(15deg); }
        }
        .plane-main { animation: planeFly 14s linear 1 forwards; }
        @keyframes burstFlash {
          0%   { opacity:1; transform:scale(.3); }
          100% { opacity:0; transform:scale(3.5); }
        }
        @keyframes burstRing {
          0%   { opacity:1; transform:scale(0); }
          100% { opacity:0; transform:scale(6); }
        }
        .b-flash { animation: burstFlash .6s ease-out forwards; }
        .b-ring1  { animation: burstRing  .8s ease-out forwards; }
        .b-ring2  { animation: burstRing  .8s ease-out .1s forwards; }
        ${MAIN_KEYFRAMES}
        ${MAIN_ANIM_CSS}
      `}</style>

      {phase === "intro" && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <div className="plane-intro-wrap">
            <img src={theme.images.airTransport} alt=""
              className="w-9 h-9 object-contain opacity-25"
              style={{ transform: "scaleX(-1) rotate(15deg)" }} />
          </div>
        </div>
      )}

      {showCurtain && (
        <>
          <div className="absolute left-0 top-0 w-1/2 bg-bg z-[12] pointer-events-none transition-[height] duration-[2500ms] ease-in"
            style={{ height: leftDown ? "100%" : "0%" }} />
          <div className="absolute right-0 top-0 w-1/2 bg-bg z-[12] pointer-events-none transition-[height] duration-[2500ms] ease-in"
            style={{ height: rightDown ? "100%" : "0%" }} />
        </>
      )}

      {showMain && (
        <div className="absolute inset-0 z-[15] pointer-events-none">
          <img src={theme.images.airTransport} alt=""
            className="plane-main absolute w-14 h-14 object-contain"
            style={{ top: "40%", left: 0, marginTop: -28 }} />
          {EXPLOSIONS.map(({ id, left, yOffset }) => (
            <div key={id} className="absolute"
              style={{ left: `${left}%`, top: `calc(40% + ${yOffset}px)`, marginTop: -24 }}>
              <div className={`flash-${id} absolute rounded-full bg-primary`}   style={{ width: 44, height: 44, top: 0, left: -22 }} />
              <div className={`ring1-${id} absolute rounded-full border-[3px] border-primary`} style={{ width: 44, height: 44, top: 0, left: -22 }} />
              <div className={`ring2-${id} absolute rounded-full border-[2px] border-primary`} style={{ width: 44, height: 44, top: 0, left: -22 }} />
            </div>
          ))}
        </div>
      )}

      {showBurst && (
        <div className="absolute inset-0 z-[15] pointer-events-none">
          {BURST_POSITIONS.slice(0, burstCount).map((pos, i) => (
            <div key={i} className="absolute" style={{ left: pos.left, top: pos.top }}>
              <div className="b-flash absolute rounded-full bg-primary"           style={{ width: 50, height: 50, top: -25, left: -25 }} />
              <div className="b-ring1 absolute rounded-full border-[3px] border-primary" style={{ width: 50, height: 50, top: -25, left: -25 }} />
              <div className="b-ring2 absolute rounded-full border-[2px] border-primary" style={{ width: 50, height: 50, top: -25, left: -25 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
