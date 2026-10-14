'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, BookOpen, Layers, Sparkles } from 'lucide-react';
import { OllamaStatus } from '@/lib/types';

interface NavbarProps {
  activeTab: 'analyzer' | 'ledger';
  setActiveTab: (tab: 'analyzer' | 'ledger') => void;
  ollamaStatus: OllamaStatus | null;
  ledgerCount: number;
  onOpenGuide: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  ollamaStatus,
  ledgerCount,
  onOpenGuide,
}: NavbarProps) {
  const isLive = ollamaStatus?.connected;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('analyzer')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Scope-Creep Guard
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Gemma AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Open-weight contract protector for freelancers
            </p>
          </div>
        </div>

        {/* Navigation & Status */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'analyzer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyzer</span>
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'ledger'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Scope Ledger</span>
              {ledgerCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-indigo-950 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px]">
                  {ledgerCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mode Badge */}
          {isLive ? (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">Ollama Live ({ollamaStatus?.model || 'Gemma'})</span>
              <span className="sm:hidden">Live</span>
            </div>
          ) : (
            <button
              onClick={onOpenGuide}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors"
              title="Click for setup guide"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Demo Mode</span>
              <span className="sm:hidden">Demo</span>
            </button>
          )}

          {/* Guide link */}
          <button
            onClick={onOpenGuide}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
            title="How to run locally with Ollama & Gemma"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
