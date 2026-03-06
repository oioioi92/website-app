"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 10;
const PARTICLE_SIZE_MIN = 6;
const PARTICLE_SIZE_MAX = 14;
const SPREAD = 60;
const DURATION_MS = 700;

function createParticle(x: number, y: number): HTMLDivElement {
  const size = PARTICLE_SIZE_MIN + Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN);
  const angle = Math.random() * Math.PI * 2;
  const dist = 15 + Math.random() * SPREAD;
  const tx = Math.cos(angle) * dist;
  const ty = Math.sin(angle) * dist;
  const delay = Math.random() * 80;
  const el = document.createElement("div");
  el.className = "click-effect-particle";
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = [
    `left: ${x}px`,
    `top: ${y}px`,
    `width: ${size}px`,
    `height: ${size}px`,
    `margin-left: -${size / 2}px`,
    `margin-top: -${size / 2}px`,
    `--tx: ${tx}px`,
    `--ty: ${ty}px`,
    `--delay: ${delay}ms`,
  ].join("; ");
  return el;
}

export function ClickEffect() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const handleClick = (e: MouseEvent) => {
      const count = PARTICLE_COUNT + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const el = createParticle(e.clientX, e.clientY);
        container.appendChild(el);
        const duration = DURATION_MS + Math.random() * 200;
        const timeout = setTimeout(() => {
          el.remove();
          clearTimeout(timeout);
        }, duration);
      }
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      ref={containerRef}
      className="click-effect-container"
      aria-hidden="true"
    />
  );
}
