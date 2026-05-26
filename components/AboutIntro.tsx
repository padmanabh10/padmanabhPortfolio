"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const para1 =
  "I'm Padmanabh Kulkarni, a backend engineer from Solapur, India, currently wrapping up my B.Tech in Electronics and Computer Engineering at Walchand Institute of Technology.";

const para2 =
  "I love building the things most users never see, distributed systems that scale under pressure, data pipelines and the kind of resilient backend plumbing that keeps production humming at 3 AM while everyone else sleeps.";

const para3 =
  "When I'm not writing code, you'll find me grinding competitive programming problems, diving into system design rabbit holes, or experimenting with LLMs and Machine Learning, from fine-tuning models to building AI-powered tools that actually solve real problems.";

const fullText = [para1, para2, para3];
const SPEED = 18;
const PAUSE = 1500;

type StickmanState = "typing" | "thinking" | "done";

export default function AboutIntro() {
  const [displayedParas, setDisplayedParas] = useState<string[]>(["", "", ""]);
  const [done, setDone] = useState(false);
  const [stickman, setStickman] = useState<StickmanState>("typing");
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(false);

  function skipAnimation() {
    if (doneRef.current) return;
    doneRef.current = true;
    if (animRef.current) clearTimeout(animRef.current);
    setDisplayedParas([...fullText]);
    setDone(true);
    setStickman("done");
  }

  useEffect(() => {
    let paraIdx = 0;
    let charIdx = 0;

    function tick() {
      if (doneRef.current) return;

      if (paraIdx >= fullText.length) {
        doneRef.current = true;
        setDone(true);
        setStickman("done");
        return;
      }

      const currentPara = fullText[paraIdx];
      if (charIdx <= currentPara.length) {
        setStickman("typing");
        setDisplayedParas((prev) => {
          const next = [...prev];
          next[paraIdx] = currentPara.slice(0, charIdx);
          return next;
        });
        charIdx++;
        animRef.current = setTimeout(tick, SPEED);
      } else {
        setStickman("thinking");
        paraIdx++;
        charIdx = 0;
        animRef.current = setTimeout(tick, PAUSE);
      }
    }

    tick();

    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, []);

  useEffect(() => {
    const handler = () => skipAnimation();
    window.addEventListener("scroll", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    window.addEventListener("click", handler, { once: true });
    window.addEventListener("touchstart", handler, { once: true });
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("keydown", handler);
      window.removeEventListener("click", handler);
      window.removeEventListener("touchstart", handler);
    };
  }, []);

  return (
    <section className="px-4 sm:px-8 md:px-24 pt-12 sm:pt-16 pb-16 sm:pb-24">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="flex-1 text-justify">
          <div className="space-y-4 sm:space-y-6 min-h-[280px] sm:min-h-[320px]">
            {fullText.map((para, i) => (
              <p
                key={i}
                className="font-mono text-base sm:text-lg md:text-2xl text-text-secondary leading-relaxed"
                style={{ visibility: displayedParas[i] ? "visible" : "hidden" }}
              >
                {displayedParas[i] || para}
              </p>
            ))}
          </div>
          <div
            className="flex flex-wrap gap-3 mt-10 transition-opacity duration-500"
            style={{ opacity: done ? 1 : 0 }}
          >
            <Link
              href="/PadmanabhKulkarniResume.pdf"
              target="_blank"
              className="group inline-flex items-center gap-3 font-mono text-xs font-bold tracking-widest uppercase text-tag-text bg-primary border border-primary px-5 py-3 hover:bg-primary-dark transition-colors"
            >
              DOWNLOAD RESUME
              <span className="transition-transform group-hover:translate-y-0.5">
                ↓
              </span>
            </Link>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 font-mono text-xs font-bold tracking-widest uppercase text-primary border border-primary px-5 py-3 hover:bg-primary hover:text-tag-text transition-colors"
            >
              GET IN TOUCH
            </Link>
          </div>
        </div>
        <div className="hidden md:flex w-96 shrink-0 items-start justify-center pt-8">
          <div className="relative w-96 h-96">
            <Image
              src="/images/stickman-typing.png"
              alt="Typing"
              fill
              sizes="320px"
              className={`object-contain mix-blend-multiply transition-opacity duration-300 ${stickman === "typing" ? "opacity-100" : "opacity-0"}`}
            />
            <Image
              src="/images/stickman-thinking.png"
              alt="Thinking"
              fill
              sizes="320px"
              className={`object-contain mix-blend-multiply transition-opacity duration-300 ${stickman === "thinking" ? "opacity-100" : "opacity-0"}`}
            />
            <Image
              src="/images/stickman-thumbsup.png"
              alt="Done"
              fill
              sizes="320px"
              className={`object-contain mix-blend-multiply transition-opacity duration-500 ${stickman === "done" ? "opacity-100" : "opacity-0"}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
