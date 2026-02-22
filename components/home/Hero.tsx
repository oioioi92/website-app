"use client";

import Link from "next/link";
import { LiveStatusPanel } from "@/components/home/LiveStatusPanel";

export function Hero() {
  return (
    <section className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="flex flex-col justify-center gap-4 px-0 py-6 lg:col-span-7 lg:py-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white lg:text-4xl xl:text-[40px]">
          Top Picks & Live Status
        </h1>
        <p className="max-w-xl text-base text-white/80 lg:text-lg">
          Get data-driven picks, track draw status, and sync results in one place.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="#picks"
            className="inline-flex items-center justify-center rounded-xl bg-[color:var(--front-gold)] px-5 py-3 text-base font-semibold text-black shadow-lg transition hover:opacity-90"
          >
            Get Top Picks
          </Link>
          <Link
            href="#results"
            className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/5 px-5 py-3 text-base font-semibold text-white transition hover:bg-white/10"
          >
            View Results
          </Link>
        </div>
      </div>
      <div className="lg:col-span-5">
        <LiveStatusPanel />
      </div>
    </section>
  );
}
