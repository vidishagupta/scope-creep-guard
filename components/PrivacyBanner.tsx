'use client';

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface PrivacyBannerProps {
  isLive: boolean;
  onOpenGuide: () => void;
}

export function PrivacyBanner({ isLive, onOpenGuide }: PrivacyBannerProps) {
  if (isLive) {
    return (
      <div className="w-full bg-emerald-950/40 border-y border-emerald-500/20 py-2.5 px-4 text-center">
        <div className="max-w-6xl mx-auto flex items-center justify-center space-x-2 text-xs sm:text-sm text-emerald-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>100% Private & Local:</strong> Runs 100% on your laptop via Ollama. Your client contracts and messages never leave this device.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-indigo-950/60 via-purple-950/50 to-indigo-950/60 border-y border-indigo-500/20 py-2.5 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-300">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-amber-300">Demo mode</strong> — results are pre-recorded from real Gemma output. Run locally for live analysis on your own contracts.
          </span>
        </div>
        <button
          onClick={onOpenGuide}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 shrink-0 cursor-pointer"
        >
          <span>View 3-step local setup</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
