import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  extractJsonString,
  validateScopeAnalysisResult,
  parseAndValidateLLMOutput,
} from '../lib/validator';

describe('extractJsonString', () => {
  it('extracts raw JSON cleanly', () => {
    const raw = '{"verdict": "IN_SCOPE"}';
    assert.strictEqual(extractJsonString(raw), '{"verdict": "IN_SCOPE"}');
  });

  it('extracts JSON from markdown code blocks', () => {
    const raw = '```json\n{\n  "verdict": "OUT_OF_SCOPE"\n}\n```';
    assert.strictEqual(extractJsonString(raw), '{\n  "verdict": "OUT_OF_SCOPE"\n}');
  });

  it('extracts JSON when surrounded by conversational text', () => {
    const raw = 'Here is the analysis:\n{"verdict": "UNCLEAR"}\nHope this helps!';
    assert.strictEqual(extractJsonString(raw), '{"verdict": "UNCLEAR"}');
  });

  it('handles empty or whitespace strings', () => {
    assert.strictEqual(extractJsonString(''), '');
    assert.strictEqual(extractJsonString('   '), '');
  });
});

describe('validateScopeAnalysisResult', () => {
  it('validates a complete IN_SCOPE response and zeroes out hours/charges', () => {
    const input = {
      verdict: 'IN_SCOPE',
      matched_clause: 'Includes up to two rounds of textual edits',
      reason: 'This is the first round of review within the allowed limit.',
      estimated_hours: 5, // should be forced to 0
      estimated_extra_charge: 5000, // should be forced to 0
      replies: {
        polite: 'Happy to make this change!',
        firm: 'This is covered in Round 1.',
        friendly_upsell: 'Included in scope.',
      },
    };

    const result = validateScopeAnalysisResult(input, 1000);
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.verdict, 'IN_SCOPE');
      assert.strictEqual(result.data.estimated_hours, 0);
      assert.strictEqual(result.data.estimated_extra_charge, 0);
      assert.strictEqual(result.data.matched_clause, 'Includes up to two rounds of textual edits');
    }
  });

  it('validates an OUT_OF_SCOPE response and calculates charge from rate if missing', () => {
    const input = {
      verdict: 'OUT_OF_SCOPE',
      matched_clause: 'Payment gateway integrations are strictly excluded',
      reason: 'E-commerce and payments are excluded.',
      estimated_hours: 6,
      estimated_extra_charge: 0, // validator should calculate 6 * 1500 = 9000
      replies: {
        polite: 'We can add Razorpay as an add-on.',
        firm: 'This is out of scope.',
        friendly_upsell: 'I would love to set this up for ₹9,000.',
      },
    };

    const result = validateScopeAnalysisResult(input, 1500);
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.verdict, 'OUT_OF_SCOPE');
      assert.strictEqual(result.data.estimated_hours, 6);
      assert.strictEqual(result.data.estimated_extra_charge, 9000);
    }
  });

  it('handles UNCLEAR verdict with null matched_clause', () => {
    const input = {
      verdict: 'UNCLEAR',
      matched_clause: null,
      reason: 'Contract does not mention source design files.',
      estimated_hours: 2,
      estimated_extra_charge: 2000,
      replies: {
        polite: 'Let us clarify design file deliverables.',
        firm: 'The contract is silent on source files.',
        friendly_upsell: 'We can package design files for a nominal fee.',
      },
    };

    const result = validateScopeAnalysisResult(input, 1000);
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.verdict, 'UNCLEAR');
      assert.strictEqual(result.data.matched_clause, null);
    }
  });

  it('rejects invalid or non-object payloads', () => {
    const result = validateScopeAnalysisResult('not an object');
    assert.strictEqual(result.success, false);
  });
});

describe('parseAndValidateLLMOutput', () => {
  it('parses fenced JSON string successfully', () => {
    const raw = `Here is your result:
\`\`\`json
{
  "verdict": "OUT_OF_SCOPE",
  "matched_clause": "Excludes SEO",
  "reason": "SEO is not included in the 3-page scope.",
  "estimated_hours": 4,
  "estimated_extra_charge": 4000,
  "replies": {
    "polite": "SEO is an add-on.",
    "firm": "SEO is excluded.",
    "friendly_upsell": "I can do full SEO for 4,000."
  }
}
\`\`\`
Let me know if you need anything else!`;

    const result = parseAndValidateLLMOutput(raw, 1000);
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.verdict, 'OUT_OF_SCOPE');
      assert.strictEqual(result.data.estimated_hours, 4);
      assert.strictEqual(result.data.estimated_extra_charge, 4000);
    }
  });

  it('reports error on broken JSON syntax', () => {
    const raw = '{"verdict": "IN_SCOPE", broken json syntax';
    const result = parseAndValidateLLMOutput(raw, 1000);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.match(result.error, /JSON parse error/);
    }
  });
});
