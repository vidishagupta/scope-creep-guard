'use client';

import React, { useState } from 'react';
import { X, Check, Copy, Shield, Cpu } from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SetupGuideModal({ isOpen, onClose }: SetupGuideModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Install Ollama & Pull Gemma Model',
      desc: 'Ollama runs open-weight AI models locally on your GPU/CPU with zero setup fees.',
      cmd: 'ollama run gemma3:1b',
    },
    {
      title: '2. Clone the Repository',
      desc: 'Get the full open-source Next.js project on your local machine.',
      cmd: 'git clone https://github.com/vidishagupta/scope-creep-guard.git\ncd scope-creep-guard',
    },
    {
      title: '3. Start Local Development Server',
      desc: 'Scope-Creep Guard will automatically detect your local Ollama instance on port 11434.',
      cmd: 'npm install\nnpm run dev',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Run 100% Locally with Gemma</h2>
            <p className="text-xs text-slate-400">Zero cloud API calls. Total client privacy.</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">{step.title}</h3>
              <p className="text-xs text-slate-400 mb-2.5">{step.desc}</p>
              <div className="flex items-center justify-between bg-black/60 rounded-lg px-3 py-2 border border-slate-800">
                <code className="text-xs font-mono text-indigo-300 whitespace-pre-line">{step.cmd}</code>
                <button
                  onClick={() => copyCommand(step.cmd, idx)}
                  className="ml-3 p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Copy command"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Why Open Source AI Section */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-950/50 p-4 rounded-xl border border-indigo-500/20">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Why Open-Source AI Matters Here</span>
          </h4>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li><strong>Contract NDA Compliance:</strong> Client contracts and pricing terms never get uploaded to third-party cloud LLMs.</li>
            <li><strong>Zero Operating Cost:</strong> No recurring API bill, credit card, or token limits.</li>
            <li><strong>Reliable & Offline:</strong> Protects your freelance work even on flights, trains, or weak Wi-Fi.</li>
            <li><strong>Open Weights:</strong> Powered by Google&apos;s open-weight Gemma model through Ollama.</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Got it, Let&apos;s Protect Scope!
          </button>
        </div>
      </div>
    </div>
  );
}
