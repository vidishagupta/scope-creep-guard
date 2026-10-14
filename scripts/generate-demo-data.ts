import { SAMPLE_CONTRACT, SAMPLE_CASES } from '../lib/sample-data';
import { SYSTEM_PROMPT, buildAnalysisPrompt, buildRepairPrompt } from '../lib/prompts';
import { parseAndValidateLLMOutput } from '../lib/validator';
import fs from 'node:fs';
import path from 'node:path';

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'gemma3:1b';

async function queryOllama(prompt: string, systemPrompt?: string) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      system: systemPrompt,
      prompt: prompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.1,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json.response;
}

async function run() {
  console.log(`Connecting to Ollama at ${OLLAMA_URL} with model ${MODEL}...`);
  const demoOutputs: Record<string, any> = {};

  for (const item of SAMPLE_CASES) {
    console.log(`\nAnalyzing sample: ${item.id} (${item.title})...`);
    const prompt = buildAnalysisPrompt(SAMPLE_CONTRACT, item.client_request, 1000, '₹');

    let raw = await queryOllama(prompt, SYSTEM_PROMPT);
    console.log(`Raw output received (${raw.length} chars)`);

    let validated = parseAndValidateLLMOutput(raw, 1000);
    if (!validated.success) {
      console.log(`Validation failed: ${validated.error}. Attempting repair prompt...`);
      const repair = buildRepairPrompt(raw, validated.error, 1000, '₹');
      raw = await queryOllama(repair);
      validated = parseAndValidateLLMOutput(raw, 1000);
    }

    if (!validated.success) {
      console.error(`Repair failed for ${item.id}: ${validated.error}`);
    } else {
      console.log(`Success! Verdict: ${validated.data.verdict}`);
      demoOutputs[item.id] = {
        ...validated.data,
        is_demo: true,
      };
    }
  }

  const outDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'demo-samples.json');
  fs.writeFileSync(outFile, JSON.stringify(demoOutputs, null, 2), 'utf-8');
  console.log(`\nSaved pre-generated demo samples to ${outFile}`);
}

run().catch((err) => {
  console.error('Fatal error running demo generation:', err);
  process.exit(1);
});
