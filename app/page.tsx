'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { PrivacyBanner } from '@/components/PrivacyBanner';
import { SetupGuideModal } from '@/components/SetupGuideModal';
import { DemoWalkthroughModal } from '@/components/DemoWalkthroughModal';
import { SampleLoader } from '@/components/SampleLoader';
import { VerdictCard } from '@/components/VerdictCard';
import { LedgerView } from '@/components/LedgerView';
import { ScopeAnalysisResult, OllamaStatus, LedgerEntry } from '@/lib/types';
import { getLedgerEntries, saveLedgerEntry } from '@/lib/storage';
import {
  Sparkles,
  FileText,
  MessageSquare,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
  Award,
  Zap,
} from 'lucide-react';

const CURRENCIES = [
  { symbol: '₹', code: 'INR', label: '₹ INR (Indian Rupee)' },
  { symbol: '$', code: 'USD', label: '$ USD (US Dollar)' },
  { symbol: '€', code: 'EUR', label: '€ EUR (Euro)' },
  { symbol: '£', code: 'GBP', label: '£ GBP (British Pound)' },
  { symbol: 'A$', code: 'AUD', label: 'A$ AUD (Australian Dollar)' },
  { symbol: 'C$', code: 'CAD', label: 'C$ CAD (Canadian Dollar)' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'ledger'>('analyzer');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);

  // Form State
  const [contract, setContract] = useState('');
  const [clientRequest, setClientRequest] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(1000);
  const [currency, setCurrency] = useState('₹');

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ScopeAnalysisResult | null>(null);

  // Ledger State
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);

  // Health check on mount
  useEffect(() => {
    checkHealth();
    setLedgerEntries(getLedgerEntries());
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data: OllamaStatus = await res.json();
        setOllamaStatus(data);
      }
    } catch {
      setOllamaStatus({
        connected: false,
        model: '',
        availableModels: [],
        mode: 'demo',
      });
    }
  };

  const handleSelectSample = (sampleContract: string, sampleRequest: string, rate: number = 1000) => {
    setContract(sampleContract);
    setClientRequest(sampleRequest);
    setHourlyRate(rate);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract.trim()) {
      setAnalysisError('Please paste your contract or scope of work.');
      return;
    }
    if (!clientRequest.trim()) {
      setAnalysisError('Please enter the client message or request to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract,
          client_request: clientRequest,
          hourly_rate: hourlyRate,
          currency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze request');
      }

      setAnalysisResult(data);

      // Save to ledger
      saveLedgerEntry(data, clientRequest, contract, hourlyRate, currency);
      setLedgerEntries(getLedgerEntries());
    } catch (err: any) {
      setAnalysisError(err?.message || 'Failed to connect to analysis engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isLive = Boolean(ollamaStatus?.connected);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ollamaStatus={ollamaStatus}
        ledgerCount={ledgerEntries.length}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenDemo={() => setIsDemoModalOpen(true)}
      />

      {/* Mode / Privacy Banner */}
      <PrivacyBanner isLive={isLive} onOpenGuide={() => setIsGuideOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'ledger' ? (
          <LedgerView
            entries={ledgerEntries}
            onRefresh={() => setLedgerEntries(getLedgerEntries())}
            onGoToAnalyzer={() => setActiveTab('analyzer')}
          />
        ) : (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center max-w-2xl mx-auto space-y-3.5">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Dev.to Hacktoberfest Open-Source AI Challenge</span>
                </div>
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 hover:text-white hover:border-pink-400 text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Watch 60s AI Video Walkthrough</span>
                </button>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Defend Your Scope. <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  Recover Billable Revenue.
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Stop doing unpaid &ldquo;quick changes.&rdquo; Run private, open-weight Gemma AI directly on your laptop to evaluate contract clauses and draft polite, firm replies with 1-click change-order quotes.
              </p>
            </div>

            {/* Quick Demo Sample Loader */}
            <SampleLoader onSelectSample={handleSelectSample} />

            {/* Analysis Form Grid */}
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contract / Scope Column */}
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          1. Agreed Scope of Work / Contract
                        </label>
                      </div>
                      <span className="text-[11px] text-slate-400">Pasted locally</span>
                    </div>

                    <textarea
                      rows={9}
                      value={contract}
                      onChange={(e) => setContract(e.target.value)}
                      placeholder="Paste your freelance agreement, project proposal, or list of included deliverables..."
                      className="w-full bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y font-mono"
                    />
                  </div>

                  {/* Hourly Rate & Currency Row */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Billing Rate (per hour)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(Number(e.target.value))}
                          className="w-full bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.symbol}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Client Request Column */}
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          2. Incoming Client Message
                        </label>
                      </div>
                      <span className="text-[11px] text-slate-400">WhatsApp / Email / Slack</span>
                    </div>

                    <textarea
                      rows={9}
                      value={clientRequest}
                      onChange={(e) => setClientRequest(e.target.value)}
                      placeholder="Paste the message from the client asking for changes, extra pages, or new features (English or Hinglish)..."
                      className="w-full bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y"
                    />
                  </div>

                  {/* Submission Row */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80">
                    <button
                      type="submit"
                      disabled={isAnalyzing}
                      className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Gemma AI analyzing contract clauses...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Analyze Scope with Gemma</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {analysisError && (
                <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-xl flex items-center space-x-3 text-rose-300 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  <span>{analysisError}</span>
                </div>
              )}
            </form>

            {/* Results Section */}
            {analysisResult && (
              <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <VerdictCard
                  result={analysisResult}
                  currency={currency}
                  hourlyRate={hourlyRate}
                  clientRequest={clientRequest}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 py-6 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Scope-Creep Guard · Local-First Open-Source AI for Freelancers</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>License: MIT</span>
            <a
              href="https://github.com/vidishagupta/scope-creep-guard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Setup Guide Modal */}
      <SetupGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* 60s AI Video Walkthrough Modal */}
      <DemoWalkthroughModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
