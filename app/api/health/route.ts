import { NextResponse } from 'next/server';

export async function GET() {
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const configuredModel = process.env.OLLAMA_MODEL || 'gemma3:1b';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${ollamaBaseUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const models = Array.isArray(data.models)
        ? data.models.map((m: { name?: string }) => m.name || '').filter(Boolean)
        : [];
      return NextResponse.json({
        connected: true,
        model: configuredModel,
        availableModels: models,
        mode: 'live',
      });
    }
  } catch {
    // Expected on Vercel deployment or when Ollama is offline
  }

  return NextResponse.json({
    connected: false,
    model: configuredModel,
    availableModels: [],
    mode: 'demo',
  });
}
