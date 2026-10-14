'use client';

import React, { useState } from 'react';
import {
  Layers,
  DollarSign,
  AlertTriangle,
  Trash2,
  Download,
  Search,
  Check,
  Copy,
  Sparkles,
} from 'lucide-react';
import { LedgerEntry } from '@/lib/types';
import { updateEntryAgreedStatus, deleteLedgerEntry, clearAllLedgerEntries } from '@/lib/storage';

interface LedgerViewProps {
  entries: LedgerEntry[];
  onRefresh: () => void;
  onGoToAnalyzer: () => void;
}

export function LedgerView({ entries, onRefresh, onGoToAnalyzer }: LedgerViewProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'out_of_scope' | 'agreed' | 'pending'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compute metrics
  const totalChecked = entries.length;
  const outOfScopeCount = entries.filter((e) => e.verdict === 'OUT_OF_SCOPE').length;
  
  // Total potential extra identified
  const totalIdentified = entries
    .filter((e) => e.verdict === 'OUT_OF_SCOPE' || e.verdict === 'UNCLEAR')
    .reduce((sum, e) => sum + (e.estimated_extra_charge || 0), 0);

  // Extra money recovered (sum where client agreed to pay)
  const totalRecovered = entries
    .filter((e) => e.agreed_to_pay)
    .reduce((sum, e) => sum + (e.estimated_extra_charge || 0), 0);

  const handleToggleAgreed = (id: string, current: boolean) => {
    updateEntryAgreedStatus(id, !current);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this ledger entry?')) {
      deleteLedgerEntry(id);
      onRefresh();
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your entire scope ledger?')) {
      clearAllLedgerEntries();
      onRefresh();
    }
  };

  const handleExportCSV = () => {
    if (entries.length === 0) return;
    const headers = ['Date', 'Verdict', 'Hours', 'Rate', 'Extra Charge', 'Agreed to Pay', 'Client Request', 'Reason'];
    const rows = entries.map((e) => [
      new Date(e.created_at).toLocaleDateString(),
      e.verdict,
      e.estimated_hours,
      `${e.currency} ${e.hourly_rate}`,
      `${e.currency} ${e.estimated_extra_charge}`,
      e.agreed_to_pay ? 'YES' : 'NO',
      `"${e.client_request.replace(/"/g, '""')}"`,
      `"${e.reason.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scope_creep_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyQuote = (entry: LedgerEntry) => {
    const text = `--- CHANGE-ORDER MINI QUOTE ---
Project Add-On: ${entry.client_request}
Estimated Effort: ${entry.estimated_hours} billable hours
Billing Rate: ${entry.currency} ${entry.hourly_rate} / hr
Total Estimated Charge: ${entry.currency} ${entry.estimated_extra_charge.toLocaleString()}
Terms: Work begins upon written approval.
-------------------------------`;
    navigator.clipboard.writeText(text);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered entries
  const filtered = entries.filter((e) => {
    const matchesSearch =
      e.client_request.toLowerCase().includes(search.toLowerCase()) ||
      e.reason.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'out_of_scope') return e.verdict === 'OUT_OF_SCOPE';
    if (filter === 'agreed') return e.agreed_to_pay;
    if (filter === 'pending') return !e.agreed_to_pay && e.verdict !== 'IN_SCOPE';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Checked */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total Checked</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalChecked}</div>
          <p className="text-[11px] text-slate-400 mt-1">Client messages analyzed</p>
        </div>

        {/* Out of Scope */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Out of Scope</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{outOfScopeCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Uncontracted requests caught</p>
        </div>

        {/* Extra Money Identified */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Money Identified</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300">
            ₹{totalIdentified.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total billable scope identified</p>
        </div>

        {/* Extra Money Recovered */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-4 rounded-2xl border border-emerald-500/30 glow-emerald">
          <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Money Recovered</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ₹{totalRecovered.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-1">Client confirmed & agreed to pay</p>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Export */}
      <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search saved requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/90 pl-9 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({entries.length})
          </button>
          <button
            onClick={() => setFilter('out_of_scope')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'out_of_scope' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Out of Scope ({outOfScopeCount})
          </button>
          <button
            onClick={() => setFilter('agreed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'agreed' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Agreed to Pay
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'pending' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 self-end md:self-auto">
          {entries.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Export Ledger to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleClearAll}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                title="Clear all entries"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Entries List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No requests in Scope Ledger</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Every client request you analyze with Scope-Creep Guard will automatically be saved here in browser localStorage.
          </p>
          <button
            onClick={onGoToAnalyzer}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
          >
            Analyze Your First Request
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isOutOfScope = item.verdict === 'OUT_OF_SCOPE';
            const isInScope = item.verdict === 'IN_SCOPE';

            return (
              <div
                key={item.id}
                className={`bg-slate-900/80 rounded-2xl p-4 sm:p-5 border transition-all ${
                  item.agreed_to_pay
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : isOutOfScope
                    ? 'border-rose-500/20'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        isInScope
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : isOutOfScope
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {item.verdict.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()} at{' '}
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Financial & Status Toggle */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-100">
                        {item.estimated_extra_charge > 0
                          ? `${item.currency} ${item.estimated_extra_charge.toLocaleString()}`
                          : '₹0 (Included)'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.estimated_hours > 0 ? `${item.estimated_hours} billable hrs` : 'No extra hours'}
                      </div>
                    </div>

                    {/* "Client agreed to pay" toggle */}
                    {item.verdict !== 'IN_SCOPE' && (
                      <button
                        onClick={() => handleToggleAgreed(item.id, item.agreed_to_pay)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          item.agreed_to_pay
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-500/40 hover:text-emerald-300'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{item.agreed_to_pay ? 'Client Agreed to Pay ✓' : 'Client Agreed to Pay'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Request Content */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 mb-3">
                  <p className="text-xs text-slate-200 line-clamp-2 italic">
                    &ldquo;{item.client_request}&rdquo;
                  </p>
                </div>

                {/* Reason & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                  <p className="line-clamp-1">{item.reason}</p>
                  <div className="flex items-center space-x-2 shrink-0">
                    {item.verdict !== 'IN_SCOPE' && (
                      <button
                        onClick={() => handleCopyQuote(item)}
                        className="p-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
                        title="Copy change-order mini quote"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[11px] text-emerald-400">Quote Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[11px]">Copy Quote</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
