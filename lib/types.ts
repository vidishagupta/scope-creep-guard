export type Verdict = 'IN_SCOPE' | 'OUT_OF_SCOPE' | 'UNCLEAR';

export interface AnalysisReplies {
  polite: string;
  firm: string;
  friendly_upsell: string;
}

export interface ScopeAnalysisResult {
  verdict: Verdict;
  matched_clause: string | null;
  reason: string;
  estimated_hours: number;
  estimated_extra_charge: number;
  replies: AnalysisReplies;
  is_demo?: boolean;
}

export interface LedgerEntry extends ScopeAnalysisResult {
  id: string;
  client_request: string;
  contract_snippet: string;
  hourly_rate: number;
  currency: string;
  created_at: string;
  agreed_to_pay: boolean;
}

export interface AnalyzePayload {
  contract: string;
  client_request: string;
  hourly_rate: number;
  currency: string;
}

export interface OllamaStatus {
  connected: boolean;
  model: string;
  availableModels: string[];
  mode: 'live' | 'demo';
  error?: string;
}
