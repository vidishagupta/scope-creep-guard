'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  DollarSign,
  Clock,
  Sparkles,
  Quote,
  Send,
  FileCheck,
} from 'lucide-react';
import { ScopeAnalysisResult } from '@/lib/types';

interface VerdictCardProps {
  result: ScopeAnalysisResult;
  currency: string;
  hourlyRate: number;
  clientRequest: string;
}

export function VerdictCard({
  result,
  currency,
  hourlyRate,
  clientRequest,
}: VerdictCardProps) {
  const [activeReplyTab, setActiveReplyTab] = useState<'polite' | 'firm' | 'friendly_upsell'>('polite');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const getVerdictDetails = () => {
    switch (result.verdict) {
      case 'IN_SCOPE':
        return {
          title: 'IN SCOPE',
          subtitle: 'Included in agreed deliverables or revision rounds',
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
          glowClass: 'glow-emerald',
          borderColor: 'border-emerald-500/30',
        };
      case 'OUT_OF_SCOPE':
        return {
          title: 'OUT OF SCOPE',
          subtitle: 'Billable change-order required before proceeding',
          badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          icon: AlertTriangle,
          glowClass: 'glow-rose',
          borderColor: 'border-rose-500/30',
        };
      case 'UNCLEAR':
      default:
        return {
          title: 'UNCLEAR / SILENT',
          subtitle: 'Contract does not explicitly specify this item',
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          icon: HelpCircle,
          glowClass: 'glow-amber',
          borderColor: 'border-amber-500/30',
        };
    }
  };

  const verdictInfo = getVerdictDetails();
  const VerdictIcon = verdictInfo.icon;

  const currentReplyText = result.replies[activeReplyTab] || '';

  // Formatted change-order mini quote
  const miniQuote = `--- CHANGE-ORDER MINI QUOTE ---
Project Add-On: ${clientRequest.slice(0, 100)}${clientRequest.length > 100 ? '...' : ''}
Estimated Effort: ${result.estimated_hours} billable hours
Billing Rate: ${currency} ${hourlyRate} / hr
Total Estimated Charge: ${currency} ${result.estimated_extra_charge.toLocaleString()}
Terms: Work on this addition begins upon written confirmation.
-------------------------------`;

  return (
    <div className={`w-full rounded-2xl bg-slate-900/90 border ${verdictInfo.borderColor} ${verdictInfo.glowClass} p-5 sm:p-7 space-y-6 transition-all duration-300`}>
      {/* Header: Verdict Badge & Financial Impact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className={`p-2.5 rounded-xl border ${verdictInfo.badgeClass}`}>
            <VerdictIcon className="w-7 h-7 shrink-0" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${verdictInfo.badgeClass}`}>
                {verdictInfo.title}
              </span>
              {result.is_demo && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                  Pre-recorded Gemma
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">{verdictInfo.subtitle}</p>
          </div>
        </div>

        {/* Pricing / Hours Pill */}
        <div className="flex items-center space-x-4 bg-slate-950/70 px-4 py-2.5 rounded-xl border border-slate-800/80">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Est. Hours</span>
            </div>
            <div className="text-sm font-bold text-slate-100">
              {result.estimated_hours > 0 ? `${result.estimated_hours} hrs` : '0 hrs (Included)'}
            </div>
          </div>
          <div className="h-7 w-[1px] bg-slate-800"></div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <DollarSign className="w-3 h-3 text-slate-400" />
              <span>Extra Charge</span>
            </div>
            <div className={`text-base font-extrabold ${result.estimated_extra_charge > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
              {result.estimated_extra_charge > 0
                ? `${currency} ${result.estimated_extra_charge.toLocaleString()}`
                : '₹0 / Covered'}
            </div>
          </div>
        </div>
      </div>

      {/* Rationale & Clause Citation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reason */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Analysis Rationale</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{result.reason}</p>
          </div>
        </div>

        {/* Matched Clause */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1.5">
              <Quote className="w-3.5 h-3.5 text-indigo-400" />
              <span>Matched Contract Clause</span>
            </h4>
            {result.matched_clause ? (
              <p className="text-xs sm:text-sm text-indigo-300 italic bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-500/20">
                &ldquo;{result.matched_clause}&rdquo;
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                No direct clause found. The agreed contract is completely silent on this deliverable.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reply Tabs Section */}
      <div className="bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <Send className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Ready-to-Send Client Responses
            </h3>
          </div>

          {/* Reply Tone Selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveReplyTab('polite')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeReplyTab === 'polite'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Polite
            </button>
            <button
              onClick={() => setActiveReplyTab('firm')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeReplyTab === 'firm'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Firm
            </button>
            <button
              onClick={() => setActiveReplyTab('friendly_upsell')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeReplyTab === 'friendly_upsell'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Friendly Upsell
            </button>
          </div>
        </div>

        {/* Reply Message Box */}
        <div className="relative bg-slate-900/90 rounded-xl p-4 border border-slate-800 min-h-[90px] flex items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed pr-10">
            {currentReplyText}
          </p>
          <button
            onClick={() => copyToClipboard(currentReplyText, `reply_${activeReplyTab}`)}
            className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow border border-slate-700 cursor-pointer"
            title="Copy this message to clipboard"
          >
            {copiedKey === `reply_${activeReplyTab}` ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Change-Order Mini Quote Section (For OUT_OF_SCOPE or UNCLEAR) */}
      {result.verdict !== 'IN_SCOPE' && (
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Change-Order Mini Quote (1-Click Notice)</span>
            </div>
            <button
              onClick={() => copyToClipboard(miniQuote, 'mini_quote')}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors cursor-pointer"
            >
              {copiedKey === 'mini_quote' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Quote</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-xs font-mono text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 overflow-x-auto whitespace-pre-wrap">
            {miniQuote}
          </pre>
        </div>
      )}
    </div>
  );
}
