import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT, buildAnalysisPrompt, buildRepairPrompt } from '@/lib/prompts';
import { parseAndValidateLLMOutput } from '@/lib/validator';
import { ScopeAnalysisResult } from '@/lib/types';
import demoSamplesData from '@/data/demo-samples.json';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contract, client_request, hourly_rate = 1000, currency = '₹' } = body;

    if (!contract || typeof contract !== 'string' || contract.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please paste your contract or scope of work.' },
        { status: 400 }
      );
    }

    if (!client_request || typeof client_request !== 'string' || client_request.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter the client message or request to analyze.' },
        { status: 400 }
      );
    }

    const rate = Number(hourly_rate) > 0 ? Number(hourly_rate) : 1000;
    const cur = currency || '₹';

    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'gemma3:1b';

    let isOllamaAvailable = false;
    try {
      const pingController = new AbortController();
      const pingTimeout = setTimeout(() => pingController.abort(), 1500);
      const ping = await fetch(`${ollamaBaseUrl}/api/tags`, {
        method: 'GET',
        signal: pingController.signal,
      });
      clearTimeout(pingTimeout);
      if (ping.ok) {
        isOllamaAvailable = true;
      }
    } catch {
      isOllamaAvailable = false;
    }

    // LIVE MODE: Run inference through local Ollama Gemma model
    if (isOllamaAvailable) {
      const prompt = buildAnalysisPrompt(contract, client_request, rate, cur);

      try {
        const genController = new AbortController();
        const genTimeout = setTimeout(() => genController.abort(), 90000); // 90s timeout for local inference

        const ollamaRes = await fetch(`${ollamaBaseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            system: SYSTEM_PROMPT,
            prompt,
            stream: false,
            format: 'json',
            options: {
              temperature: 0.1,
            },
          }),
          signal: genController.signal,
        });
        clearTimeout(genTimeout);

        if (!ollamaRes.ok) {
          const errText = await ollamaRes.text();
          throw new Error(`Ollama returned status ${ollamaRes.status}: ${errText}`);
        }

        const ollamaData = await ollamaRes.json();
        let rawResponse = ollamaData.response;

        let validation = parseAndValidateLLMOutput(rawResponse, rate);

        // If JSON invalid, retry once with repair prompt
        if (!validation.success) {
          const repairPrompt = buildRepairPrompt(rawResponse, validation.error, rate, cur);
          const repairRes = await fetch(`${ollamaBaseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              prompt: repairPrompt,
              stream: false,
              format: 'json',
              options: { temperature: 0.0 },
            }),
          });

          if (repairRes.ok) {
            const repairData = await repairRes.json();
            validation = parseAndValidateLLMOutput(repairData.response, rate);
          }
        }

        if (validation.success) {
          const result: ScopeAnalysisResult = {
            ...validation.data,
            is_demo: false,
          };
          return NextResponse.json(result);
        } else {
          return NextResponse.json(
            {
              error: `AI returned invalid formatting: ${validation.error}. Please try again.`,
            },
            { status: 502 }
          );
        }
      } catch (ollamaErr: any) {
        // Fall back to demo mode if inference fails
        console.warn('Live inference failed, falling back to demo mode:', ollamaErr.message);
      }
    }

    // DEMO MODE: Serve pre-recorded Gemma outputs for samples, or intelligent demo output
    const demoSamples = demoSamplesData as Record<string, ScopeAnalysisResult>;
    const normalizedReq = client_request.toLowerCase();

    let matchedSampleKey = 'sample-out-of-scope';
    if (
      normalizedReq.includes('typo') ||
      normalizedReq.includes('photo') ||
      normalizedReq.includes('picture') ||
      normalizedReq.includes('1st round') ||
      normalizedReq.includes('revision')
    ) {
      matchedSampleKey = 'sample-in-scope';
    } else if (
      normalizedReq.includes('figma') ||
      normalizedReq.includes('vector') ||
      normalizedReq.includes('intern') ||
      normalizedReq.includes('source') ||
      normalizedReq.includes('psd')
    ) {
      matchedSampleKey = 'sample-unclear';
    } else if (
      normalizedReq.includes('razorpay') ||
      normalizedReq.includes('payment') ||
      normalizedReq.includes('seo') ||
      normalizedReq.includes('google') ||
      normalizedReq.includes('ecommerce') ||
      normalizedReq.includes('bhai')
    ) {
      matchedSampleKey = 'sample-out-of-scope';
    }

    const baseDemo = demoSamples[matchedSampleKey] || demoSamples['sample-out-of-scope'];

    // Adjust pricing for custom user hourly rate
    const adjustedExtraCharge = baseDemo.estimated_hours * rate;

    const demoResult: ScopeAnalysisResult = {
      ...baseDemo,
      estimated_extra_charge: baseDemo.verdict === 'IN_SCOPE' ? 0 : adjustedExtraCharge,
      is_demo: true,
    };

    return NextResponse.json(demoResult);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred during analysis.' },
      { status: 500 }
    );
  }
}
