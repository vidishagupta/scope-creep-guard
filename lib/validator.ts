import { ScopeAnalysisResult, Verdict } from './types';

export interface ValidationSuccess {
  success: true;
  data: ScopeAnalysisResult;
}

export interface ValidationFailure {
  success: false;
  error: string;
  rawText: string;
}

export type ValidationOutcome = ValidationSuccess | ValidationFailure;

/**
 * Strips markdown code blocks and trims whitespace from raw LLM output.
 */
export function extractJsonString(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let cleaned = raw.trim();

  // Match ```json ... ``` or ``` ... ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  } else {
    // If there is leading/trailing text outside the first { and last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1).trim();
    }
  }

  return cleaned;
}

/**
 * Validates and sanitizes a parsed JSON object to match ScopeAnalysisResult.
 */
export function validateScopeAnalysisResult(
  parsed: unknown,
  hourlyRate: number = 1000
): ValidationOutcome {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      success: false,
      error: 'Parsed response is not a valid JSON object.',
      rawText: JSON.stringify(parsed),
    };
  }

  const obj = parsed as Record<string, unknown>;

  // Validate verdict
  const validVerdicts: Verdict[] = ['IN_SCOPE', 'OUT_OF_SCOPE', 'UNCLEAR'];
  let verdict = typeof obj.verdict === 'string' ? obj.verdict.toUpperCase().trim() : '';
  if (!validVerdicts.includes(verdict as Verdict)) {
    // Fallback detection if verdict format differs slightly
    if (verdict.includes('IN') && !verdict.includes('OUT')) verdict = 'IN_SCOPE';
    else if (verdict.includes('OUT')) verdict = 'OUT_OF_SCOPE';
    else if (verdict.includes('UNCLEAR') || verdict.includes('AMBIGUOUS')) verdict = 'UNCLEAR';
    else {
      return {
        success: false,
        error: `Invalid verdict "${obj.verdict}". Expected IN_SCOPE, OUT_OF_SCOPE, or UNCLEAR.`,
        rawText: JSON.stringify(parsed),
      };
    }
  }

  // Validate matched_clause
  let matched_clause: string | null = null;
  if (typeof obj.matched_clause === 'string' && obj.matched_clause.trim().length > 0) {
    matched_clause = obj.matched_clause.trim();
  }

  // Validate reason
  const reason = typeof obj.reason === 'string' && obj.reason.trim().length > 0
    ? obj.reason.trim()
    : 'No detailed rationale provided by analysis.';

  // Validate estimated_hours
  let estimated_hours = 0;
  if (typeof obj.estimated_hours === 'number' && !isNaN(obj.estimated_hours)) {
    estimated_hours = Math.max(0, obj.estimated_hours);
  } else if (typeof obj.estimated_hours === 'string') {
    const parsedHours = parseFloat(obj.estimated_hours);
    if (!isNaN(parsedHours)) estimated_hours = Math.max(0, parsedHours);
  }

  // Enforce rule: IN_SCOPE means 0 hours
  if (verdict === 'IN_SCOPE') {
    estimated_hours = 0;
  } else if (verdict === 'OUT_OF_SCOPE' && estimated_hours === 0) {
    // Sensible fallback: at least 1 hour for out of scope
    estimated_hours = 2;
  }

  // Validate estimated_extra_charge
  let estimated_extra_charge = 0;
  if (typeof obj.estimated_extra_charge === 'number' && !isNaN(obj.estimated_extra_charge)) {
    estimated_extra_charge = Math.max(0, obj.estimated_extra_charge);
  } else if (typeof obj.estimated_extra_charge === 'string') {
    const parsedCharge = parseFloat(obj.estimated_extra_charge.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsedCharge)) estimated_extra_charge = Math.max(0, parsedCharge);
  }

  // If charge was 0 but hours > 0, calculate from rate
  if (verdict !== 'IN_SCOPE' && estimated_extra_charge === 0 && estimated_hours > 0) {
    estimated_extra_charge = estimated_hours * hourlyRate;
  }

  // If verdict is IN_SCOPE, charge must be 0
  if (verdict === 'IN_SCOPE') {
    estimated_extra_charge = 0;
  }

  // Validate replies
  const rawReplies = (typeof obj.replies === 'object' && obj.replies !== null)
    ? (obj.replies as Record<string, unknown>)
    : {};

  const polite = typeof rawReplies.polite === 'string' && rawReplies.polite.trim().length > 0
    ? rawReplies.polite.trim()
    : 'Thank you for reaching out. I reviewed your request against our scope of work.';

  const firm = typeof rawReplies.firm === 'string' && rawReplies.firm.trim().length > 0
    ? rawReplies.firm.trim()
    : 'This request is outside the agreed scope. Let us know if you would like a separate change-order.';

  const friendly_upsell = typeof rawReplies.friendly_upsell === 'string' && rawReplies.friendly_upsell.trim().length > 0
    ? rawReplies.friendly_upsell.trim()
    : `I would love to help add this feature! Based on current specifications, it would take approximately ${estimated_hours} hours.`;

  return {
    success: true,
    data: {
      verdict: verdict as Verdict,
      matched_clause,
      reason,
      estimated_hours,
      estimated_extra_charge,
      replies: {
        polite,
        firm,
        friendly_upsell,
      },
    },
  };
}

/**
 * Complete parsing pipeline: string extraction -> JSON.parse -> schema validation.
 */
export function parseAndValidateLLMOutput(
  rawText: string,
  hourlyRate: number = 1000
): ValidationOutcome {
  const extracted = extractJsonString(rawText);
  if (!extracted) {
    return {
      success: false,
      error: 'Empty response or no JSON block found.',
      rawText,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(extracted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `JSON parse error: ${message}`,
      rawText: extracted,
    };
  }

  return validateScopeAnalysisResult(parsed, hourlyRate);
}
