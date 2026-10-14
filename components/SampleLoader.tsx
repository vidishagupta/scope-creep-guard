'use client';

import React from 'react';
import { SAMPLE_CONTRACT, SAMPLE_CASES } from '@/lib/sample-data';
import { FileCode, Sparkles, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface SampleLoaderProps {
  onSelectSample: (contract: string, request: string, rate?: number) => void;
}

export function SampleLoader({ onSelectSample }: SampleLoaderProps) {
  const getBadge = (cat: string) => {
    switch (cat) {
      case 'in_scope':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          label: 'In-Scope',
        };
      case 'out_of_scope':
        return {
          icon: AlertTriangle,
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          label: 'Out-of-Scope (Hinglish)',
        };
      default:
        return {
          icon: HelpCircle,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          label: 'Unclear',
        };
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-800/80 mb-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
            <FileCode className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Interactive Demo Scenarios</h3>
            <p className="text-xs text-slate-400">Load sample contract (3-Page Web Project) & client messages:</p>
          </div>
        </div>

        <button
          onClick={() => onSelectSample(SAMPLE_CONTRACT, SAMPLE_CASES[1].client_request, 1000)}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Full Sample</span>
        </button>
      </div>

      {/* 3 Scenario quick buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {SAMPLE_CASES.map((item) => {
          const badge = getBadge(item.category);
          const Icon = badge.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSample(SAMPLE_CONTRACT, item.client_request, 1000)}
              className="text-left p-3 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                    <Icon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {item.client_request}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
