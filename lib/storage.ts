import { LedgerEntry, ScopeAnalysisResult } from './types';

const LEDGER_STORAGE_KEY = 'scope_creep_guard_ledger_v1';

export function getLedgerEntries(): LedgerEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load ledger from localStorage:', err);
    return [];
  }
}

export function saveLedgerEntry(
  result: ScopeAnalysisResult,
  clientRequest: string,
  contractSnippet: string,
  hourlyRate: number,
  currency: string
): LedgerEntry {
  const entries = getLedgerEntries();
  const newEntry: LedgerEntry = {
    ...result,
    id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    client_request: clientRequest,
    contract_snippet: contractSnippet.slice(0, 150) + (contractSnippet.length > 150 ? '...' : ''),
    hourly_rate: hourlyRate,
    currency: currency,
    created_at: new Date().toISOString(),
    agreed_to_pay: false,
  };

  const updated = [newEntry, ...entries];
  try {
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save entry to localStorage:', err);
  }
  return newEntry;
}

export function updateEntryAgreedStatus(id: string, agreed: boolean): LedgerEntry[] {
  const entries = getLedgerEntries();
  const updated = entries.map((item) =>
    item.id === id ? { ...item, agreed_to_pay: agreed } : item
  );
  try {
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update entry status:', err);
  }
  return updated;
}

export function deleteLedgerEntry(id: string): LedgerEntry[] {
  const entries = getLedgerEntries();
  const updated = entries.filter((item) => item.id !== id);
  try {
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete entry from localStorage:', err);
  }
  return updated;
}

export function clearAllLedgerEntries(): void {
  try {
    localStorage.removeItem(LEDGER_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear ledger:', err);
  }
}
