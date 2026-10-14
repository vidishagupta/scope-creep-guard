'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  DollarSign,
  Clock,
  Sparkles,
  Check,
  Copy,
  Layers,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface DemoScene {
  id: number;
  timeRange: string;
  duration: number; // in seconds
  title: string;
  subtitle: string;
  narration: string;
  badge: string;
  badgeColor: string;
}

const DEMO_SCENES: DemoScene[] = [
  {
    id: 1,
    timeRange: '0:00 - 0:10',
    duration: 10,
    title: 'The Problem: Silent Scope Creep & Contract Privacy',
    subtitle: 'Clients always ask for "just one quick change." Saying no is awkward, and freelancers lose thousands.',
    narration:
      'Clients always ask for just one quick change. But saying no is hard, and freelancers lose thousands in free labor. Meet Scope-Creep Guard — a local-first AI assistant powered by Google Gemma that defends your contracts with 100% privacy.',
    badge: 'Privacy Shield',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 2,
    timeRange: '0:10 - 0:25',
    duration: 15,
    title: 'The Request: Casual Scope Creep via WhatsApp',
    subtitle: 'A client sends a casual Hinglish message asking for payment gateway, store products, and SEO.',
    narration:
      'Here is a realistic sample contract for a 3-page website. Our client sends a casual WhatsApp message asking for Razorpay payment integration, 25 products, and Google SEO ranking.',
    badge: 'Incoming Scope Creep',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  },
  {
    id: 3,
    timeRange: '0:25 - 0:38',
    duration: 13,
    title: 'Gemma 3 Verdict & Financial Leakage Detected',
    subtitle: 'Local Gemma model matches Clause 3 and flags ₹18,000 in unbilled work.',
    narration:
      'Instantly, Gemma detects the exact exclusion clause from the contract and calculates the financial impact: 18 extra hours, or ₹18,000 in billable revenue.',
    badge: 'OUT OF SCOPE',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  {
    id: 4,
    timeRange: '0:38 - 0:48',
    duration: 10,
    title: '3 Diplomatic Reply Tones: Polite, Firm, or Upsell',
    subtitle: 'Tactful ready-to-send messages that protect the client relationship without giving away free labor.',
    narration:
      'Instead of stressing over how to respond, you get 3 instant reply options — polite, firm, or a friendly upsell — ready to send in one click.',
    badge: 'AI Replies',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  },
  {
    id: 5,
    timeRange: '0:48 - 0:54',
    duration: 6,
    title: '1-Click Change-Order Mini Quote',
    subtitle: 'Professional change-order note with hours, rates, and written terms.',
    narration:
      'Plus, a 1-click professional Change-Order Mini Quote ready to paste directly into WhatsApp or email.',
    badge: 'Mini Quote',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  {
    id: 6,
    timeRange: '0:54 - 1:00',
    duration: 6,
    title: 'Scope Ledger: ₹18,000 Recovered Revenue!',
    subtitle: 'Track your uncontracted requests. Mark as agreed when the client approves the invoice.',
    narration:
      'In the Scope Ledger, track every caught request. When your client agrees to pay, mark it recovered. Keeping your contracts tight, clients happy, and your wallet full. 100% open-source and local.',
    badge: 'Revenue Recovered',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
];

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoWalkthroughModal({ isOpen, onClose }: DemoWalkthroughModalProps) {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeReplyTab, setActiveReplyTab] = useState<'polite' | 'firm' | 'friendly_upsell'>('friendly_upsell');
  const [clientAgreed, setClientAgreed] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentScene = DEMO_SCENES[currentSceneIdx];

  // Stop speech when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopPlayback();
    }
    return () => {
      stopPlayback();
    };
  }, [isOpen]);

  const speakNarration = (text: string, onEndCallback?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEndCallback) setTimeout(onEndCallback, currentScene.duration * 1000);
      return;
    }

    window.speechSynthesis.cancel();

    if (isMuted) {
      if (onEndCallback) {
        timerRef.current = setTimeout(onEndCallback, currentScene.duration * 1000);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('David'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      if (onEndCallback) onEndCallback();
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const playScene = (index: number) => {
    setCurrentSceneIdx(index);
    setIsPlaying(true);

    if (index === 5) {
      setClientAgreed(true);
    } else {
      setClientAgreed(false);
    }

    speakNarration(DEMO_SCENES[index].narration, () => {
      if (index < DEMO_SCENES.length - 1) {
        playScene(index + 1);
      } else {
        setIsPlaying(false);
      }
    });
  };

  const startPlayback = () => {
    playScene(currentSceneIdx);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentSceneIdx(0);
    setClientAgreed(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const toggleMute = () => {
    if (!isMuted) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsMuted(true);
    } else {
      setIsMuted(false);
      if (isPlaying) {
        speakNarration(currentScene.narration);
      }
    }
  };

  const handleCopySimulation = () => {
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  60-Second AI Video Walkthrough
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  AI Narrated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Experience Scope-Creep Guard protecting freelance contracts step-by-step
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                isMuted
                  ? 'bg-rose-950/30 border-rose-500/30 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scene Navigation Bar / Timeline Scrubber */}
        <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center space-x-1.5 shrink-0">
            {DEMO_SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => {
                  pausePlayback();
                  setCurrentSceneIdx(idx);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentSceneIdx === idx
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>Scene {scene.id}</span>
                <span className="text-[10px] opacity-70 ml-1">({scene.timeRange})</span>
              </button>
            ))}
          </div>

          <div className="text-xs font-mono font-bold text-indigo-400 shrink-0">
            {currentScene.timeRange}
          </div>
        </div>

        {/* Visual Stage Area */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-5 bg-[#0b0f19]">
          {/* Scene Title & Badge */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border mb-1.5 ${currentScene.badgeColor}`}>
                {currentScene.badge}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {currentScene.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {currentScene.subtitle}
              </p>
            </div>
          </div>

          {/* DYNAMIC SCENE VISUALS */}
          <div className="min-h-[260px] flex items-center justify-center">
            {/* SCENE 1 VISUAL: Privacy & Problem */}
            {currentSceneIdx === 0 && (
              <div className="w-full max-w-xl bg-slate-900/90 rounded-2xl p-6 border border-emerald-500/30 glow-emerald space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-300">
                    100% Local Inference · Zero Cloud Data Leakage
                  </h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                    Client NDAs and contracts never leave your laptop. Google Gemma 3 runs completely inside local RAM and GPU via Ollama on localhost:11434.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 text-left">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Privacy</div>
                    <div className="text-xs font-semibold text-emerald-400">Zero Cloud APIs</div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Cost</div>
                    <div className="text-xs font-semibold text-indigo-400">₹0 / Free Forever</div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Uptime</div>
                    <div className="text-xs font-semibold text-purple-400">100% Offline</div>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 2 VISUAL: WhatsApp Scope Creep Request */}
            {currentSceneIdx === 1 && (
              <div className="w-full max-w-lg space-y-3">
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold px-1">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Incoming WhatsApp Message (Client)</span>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl rounded-tl-none p-4 shadow-xl space-y-2">
                  <p className="text-xs sm:text-sm text-emerald-200 font-medium leading-relaxed italic">
                    &ldquo;Bhai ek chhota sa quick change tha — please site pe Razorpay payment gateway integrate kar do na for our store aur 25 products add kar dena. Aur Google pe #1 rank karane ke liye pura SEO bhi set kar dena jaldi se!&rdquo;
                  </p>
                  <div className="text-[10px] text-emerald-400/80 text-right">Just now · Received</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <span className="text-slate-400">Agreed Contract:</span>
                  <span className="font-semibold text-indigo-300">3-Page Informational Website (No eCommerce)</span>
                </div>
              </div>
            )}

            {/* SCENE 3 VISUAL: OUT OF SCOPE Badge & Financials */}
            {currentSceneIdx === 2 && (
              <div className="w-full max-w-xl bg-slate-900/90 rounded-2xl p-5 border border-rose-500/30 glow-rose space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>OUT OF SCOPE</span>
                    </span>
                    <span className="text-xs text-slate-400">Gemma 3 Strict Match</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-rose-400">₹18,000</span>
                    <span className="text-[10px] text-slate-400 block">18 billable hours</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Exact Contract Citation (Clause 3)
                  </div>
                  <p className="text-xs text-indigo-300 italic bg-indigo-950/30 p-2 rounded-lg border border-indigo-500/20">
                    &ldquo;E-commerce features, shopping cart, product catalog creation, and payment gateway integrations are strictly excluded. Search Engine Optimization (SEO) is strictly excluded.&rdquo;
                  </p>
                </div>

                <div className="text-xs text-slate-300">
                  <strong>Rationale:</strong> The client is asking for e-commerce and SEO, which are explicitly non-deliverables under the signed agreement.
                </div>
              </div>
            )}

            {/* SCENE 4 VISUAL: 3 Reply Tones */}
            {currentSceneIdx === 3 && (
              <div className="w-full max-w-xl bg-slate-900/90 rounded-2xl p-5 border border-purple-500/30 glow-indigo space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Select Ready-to-Send Reply Tone:
                  </span>
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setActiveReplyTab('polite')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        activeReplyTab === 'polite' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Polite
                    </button>
                    <button
                      onClick={() => setActiveReplyTab('firm')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        activeReplyTab === 'firm' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Firm
                    </button>
                    <button
                      onClick={() => setActiveReplyTab('friendly_upsell')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        activeReplyTab === 'friendly_upsell' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Friendly Upsell
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed min-h-[90px] relative">
                  {activeReplyTab === 'polite' &&
                    "Bhai, thank you for reaching out! Razorpay and SEO are outside our current 3-page site agreement. I'd love to help you build this out — let me send over a quick change-order estimate (approx. 18 hours @ ₹1,000/hr) so we can add this seamlessly."}
                  {activeReplyTab === 'firm' &&
                    "Hi! As specified in Clause 3 of our agreement, e-commerce payment gateways and SEO ranking services are strictly excluded from the current project scope. If you'd like to expand the project to include these features, I can prepare an addendum with an extra charge of ₹18,000."}
                  {activeReplyTab === 'friendly_upsell' &&
                    "Great vision for the store! Setting up Razorpay and full SEO will really supercharge your sales. Since this is beyond our 3-page contract, I can bundle the payment integration, 25 product uploads, and on-page SEO into a dedicated Phase 2 add-on for just ₹18,000. Should I send over the change-order?"}

                  <button
                    onClick={handleCopySimulation}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Copy response"
                  >
                    {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* SCENE 5 VISUAL: Change-Order Mini Quote */}
            {currentSceneIdx === 4 && (
              <div className="w-full max-w-xl bg-slate-900/90 rounded-2xl p-5 border border-amber-500/30 glow-amber space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Change-Order Mini Quote Note</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Ready to Paste
                  </span>
                </div>

                <pre className="text-xs font-mono bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed">
{`--- CHANGE-ORDER MINI QUOTE ---
Project Add-On: Razorpay Payment Gateway & 25 Store Products
Estimated Effort: 18 billable hours
Billing Rate: ₹ 1,000 / hr
Total Estimated Charge: ₹ 18,000
Terms: Work on this addition begins upon written confirmation.
-------------------------------`}
                </pre>
              </div>
            )}

            {/* SCENE 6 VISUAL: Scope Ledger Revenue Recovered */}
            {currentSceneIdx === 5 && (
              <div className="w-full max-w-xl space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Requests Caught</div>
                    <div className="text-xl font-black text-rose-400">1 Out-of-Scope</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 p-4 rounded-xl border border-emerald-500/40 glow-emerald">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase">Extra Money Recovered</div>
                    <div className="text-xl font-black text-emerald-400">₹18,000</div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Razorpay & SEO Change-Order</div>
                    <div className="text-[11px] text-slate-400">Client signed & confirmed invoice</div>
                  </div>
                  <button
                    onClick={() => setClientAgreed(!clientAgreed)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1 shadow-md cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Client Agreed to Pay ✓</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Voice Narration Teleprompter / Captions */}
          <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800/80 flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0 mt-0.5">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-0.5">
                AI Voiceover Narration:
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                &ldquo;{currentScene.narration}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Playback Controls Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (currentSceneIdx > 0) {
                  pausePlayback();
                  setCurrentSceneIdx(currentSceneIdx - 1);
                }
              }}
              disabled={currentSceneIdx === 0}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {isPlaying ? (
              <button
                onClick={pausePlayback}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow transition-colors cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={startPlayback}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play 60s AI Walkthrough</span>
              </button>
            )}

            <button
              onClick={stopPlayback}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              title="Reset to beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (currentSceneIdx < DEMO_SCENES.length - 1) {
                  pausePlayback();
                  setCurrentSceneIdx(currentSceneIdx + 1);
                }
              }}
              disabled={currentSceneIdx === DEMO_SCENES.length - 1}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <span>Powered by Google Gemma + Web Speech AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
