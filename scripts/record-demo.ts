import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getAudioDuration(filePath: string): number {
  try {
    const output = execSync(`ffmpeg -i "${filePath}" 2>&1`, { encoding: 'utf-8' });
    const match = output.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = parseFloat(match[3]);
      return hours * 3600 + minutes * 60 + seconds;
    }
  } catch (err: unknown) {
    const output = (err as { stdout?: string; stderr?: string }).stdout || (err as { stdout?: string; stderr?: string }).stderr || '';
    const match = output.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = parseFloat(match[3]);
      return hours * 3600 + minutes * 60 + seconds;
    }
  }
  return 5.0; // fallback duration
}

function formatSrtTime(totalSeconds: number): string {
  const pad = (n: number, w: number = 2) => String(Math.floor(n)).padStart(w, '0');
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const intSec = Math.floor(seconds);
  const ms = Math.floor((seconds - intSec) * 1000);
  return `${pad(hours)}:${pad(minutes)}:${pad(intSec)},${pad(ms, 3)}`;
}

interface SceneDef {
  id: string;
  speech: string;
  subtitle: string;
}

const SCENES: SceneDef[] = [
  {
    id: '01_title',
    speech: 'Welcome to Scope-Creep Guard. The local-first AI assistant built for freelancers to stop doing unpaid work.',
    subtitle: 'Welcome to Scope-Creep Guard — Local-first AI for freelancers',
  },
  {
    id: '02_privacy',
    speech: 'It runs completely on your laptop using Ollama and Google Gemma. Your client contracts and messages never leave your device.',
    subtitle: 'Runs 100% locally via Ollama — Your contracts never leave your laptop',
  },
  {
    id: '03_sample',
    speech: "Let's load a real-world freelance agreement and an incoming client WhatsApp message.",
    subtitle: 'Loading real freelancer scenario: 5-Page Website Agreement',
  },
  {
    id: '04_hinglish',
    speech: "Here is the client's message in Hinglish, asking to add Razorpay payment gateway and Google SEO for free.",
    subtitle: 'Hinglish client request: "Bhai Razorpay aur SEO bhi add kardo na"',
  },
  {
    id: '05_analyze',
    speech: 'With one click, Gemma analyzes the contract clauses against the request to detect scope boundaries.',
    subtitle: 'Gemma analyzes the contract against the client request locally...',
  },
  {
    id: '06_verdict',
    speech: 'Instant verdict: Out of scope. Gemma identifies 12 extra hours of work, calculating twelve thousand rupees in extra billable charges.',
    subtitle: 'OUT OF SCOPE detected! 12 extra hours = ₹12,000 extra charge',
  },
  {
    id: '07_clause',
    speech: 'Notice the matched clause: Gemma cites the exact contract term limiting revisions and third-party payment gateways.',
    subtitle: 'AI finds exact contract clause limiting payment gateway & SEO',
  },
  {
    id: '08_replies',
    speech: 'You get three ready-to-send responses: Polite, Firm, or Friendly Upsell. Let us copy the Firm reply to set a clear boundary.',
    subtitle: 'Ready-to-send replies: Switch between Polite, Firm, and Upsell',
  },
  {
    id: '09_quote',
    speech: 'It also generates a Change-Order Mini Quote, ready to paste directly into your client chat or email.',
    subtitle: 'Instant Change-Order Mini Quote ready to paste into client chat',
  },
  {
    id: '10_ledger',
    speech: 'In the Scope Ledger, you track every creep attempt. When the client approves, click agreed to pay, and your recovered revenue updates immediately.',
    subtitle: 'Scope Ledger tracks creep attempts — Money Recovered updates in real time!',
  },
  {
    id: '11_end',
    speech: 'Protect your freelance income today. Scope-Creep Guard is open source and completely free on GitHub.',
    subtitle: 'Scope-Creep Guard — Open Source & MIT Licensed on GitHub',
  },
];

async function main() {
  console.log('=== Starting Scope-Creep Guard AI Voice & Subtitle Video Generator ===');

  const demoDir = path.join(process.cwd(), 'demo');
  const rawDir = path.join(demoDir, 'raw');
  const audioDir = path.join(demoDir, 'audio');

  if (!fs.existsSync(demoDir)) fs.mkdirSync(demoDir, { recursive: true });
  if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

  // Step 1: Synthesize all AI Voice audio clips with edge-tts
  console.log('\n--- Step 1: Generating AI Voice Clips with edge-tts (en-US-GuyNeural) ---');
  const audioClips: { id: string; file: string; duration: number; subtitle: string }[] = [];

  for (const scene of SCENES) {
    const audioPath = path.join(audioDir, `${scene.id}.mp3`);
    console.log(`Synthesizing [${scene.id}]: "${scene.speech}"`);
    // Escape double quotes for shell
    const escapedText = scene.speech.replace(/"/g, '\\"');
    const ttsCmd = `edge-tts --voice en-US-GuyNeural --text "${escapedText}" --write-media "${audioPath}"`;
    execSync(ttsCmd, { stdio: 'inherit' });

    const dur = getAudioDuration(audioPath);
    console.log(`  -> Duration: ${dur.toFixed(2)}s`);
    audioClips.push({
      id: scene.id,
      file: audioPath,
      duration: dur,
      subtitle: scene.subtitle,
    });
  }

  // Step 2: Launch Playwright and record browser session synchronized with audio
  console.log('\n--- Step 2: Recording Browser Actions with Synchronized Subtitles ---');
  // Clean previous raw videos
  const previousFiles = fs.readdirSync(rawDir);
  for (const file of previousFiles) {
    try {
      fs.unlinkSync(path.join(rawDir, file));
    } catch {
      // Ignore
    }
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: rawDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  // Helper: Subtitle overlay in the browser
  const showSubtitle = async (text: string) => {
    console.log(`[Subtitle Overlay] ${text}`);
    await page.evaluate((subtitleText) => {
      let overlay = document.getElementById('demo-subtitle-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'demo-subtitle-overlay';
        overlay.style.position = 'fixed';
        overlay.style.bottom = '26px';
        overlay.style.left = '50%';
        overlay.style.transform = 'translateX(-50%)';
        overlay.style.zIndex = '999999';
        overlay.style.backgroundColor = 'rgba(7, 11, 22, 0.95)';
        overlay.style.backdropFilter = 'blur(16px)';
        overlay.style.border = '1px solid rgba(99, 102, 241, 0.55)';
        overlay.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.8), 0 0 24px rgba(99, 102, 241, 0.35)';
        overlay.style.borderRadius = '9999px';
        overlay.style.padding = '12px 30px';
        overlay.style.color = '#ffffff';
        overlay.style.fontSize = '15.5px';
        overlay.style.fontWeight = '600';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.gap = '14px';
        overlay.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        overlay.style.letterSpacing = '-0.015em';
        overlay.style.transition = 'all 0.3s ease';
        document.body.appendChild(overlay);
      }
      overlay.innerHTML = `
        <span style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:9999px;background:rgba(99,102,241,0.25);border:1px solid rgba(99,102,241,0.5);color:#a5b4fc;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">
          <span style="width:7px;height:7px;border-radius:9999px;background:#818cf8;box-shadow:0 0 8px #818cf8;"></span>
          AI Voice
        </span>
        <span style="text-shadow:0 1px 3px rgba(0,0,0,0.8);">${subtitleText}</span>
      `;
      overlay.style.opacity = '1';
    }, text);
  };

  // Helper: Title Card
  const showTitleCard = async () => {
    await page.evaluate(() => {
      const card = document.createElement('div');
      card.id = 'demo-title-card';
      card.style.position = 'fixed';
      card.style.inset = '0';
      card.style.zIndex = '9999999';
      card.style.backgroundColor = '#070b14';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'center';
      card.style.textAlign = 'center';
      card.style.padding = '30px';
      card.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      card.innerHTML = `
        <div style="width:76px;height:76px;border-radius:24px;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;margin-bottom:24px;box-shadow:0 0 50px rgba(99,102,241,0.5);">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h1 style="font-size:46px;font-weight:800;color:white;letter-spacing:-0.03em;margin:0 0 12px 0;">Scope-Creep Guard</h1>
        <p style="font-size:22px;font-weight:500;color:#94a3b8;max-width:650px;line-height:1.5;margin:0 0 24px 0;">Local-first AI for freelancers — Stop doing unpaid work</p>
        <div style="display:inline-flex;align-items:center;gap:10px;padding:9px 20px;border-radius:9999px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);color:#34d399;font-size:15px;font-weight:600;">
          <span style="width:8px;height:8px;border-radius:9999px;background:#10b981;box-shadow:0 0 8px #10b981;"></span>
          Powered by Google Gemma & Ollama (100% Offline & Private)
        </div>
      `;
      document.body.appendChild(card);
    });
  };

  const hideTitleCard = async () => {
    await page.evaluate(() => {
      const card = document.getElementById('demo-title-card');
      if (card) {
        card.style.transition = 'opacity 0.5s ease';
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 500);
      }
    });
  };

  // Helper: End Card
  const showEndCard = async () => {
    await page.evaluate(() => {
      const card = document.createElement('div');
      card.id = 'demo-end-card';
      card.style.position = 'fixed';
      card.style.inset = '0';
      card.style.zIndex = '9999999';
      card.style.backgroundColor = '#070b14';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'center';
      card.style.textAlign = 'center';
      card.style.padding = '30px';
      card.style.opacity = '0';
      card.style.transition = 'opacity 0.6s ease';
      card.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      card.innerHTML = `
        <div style="width:72px;height:72px;border-radius:24px;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;margin-bottom:20px;box-shadow:0 0 50px rgba(99,102,241,0.45);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h2 style="font-size:42px;font-weight:800;color:white;letter-spacing:-0.03em;margin:0 0 10px 0;">Scope-Creep Guard</h2>
        <p style="font-size:20px;color:#94a3b8;max-width:580px;line-height:1.5;margin:0 0 24px 0;">Recover revenue. Set boundaries. Run privately on your machine.</p>
        <div style="padding:14px 28px;border-radius:14px;background:#10172a;border:1px solid #3730a3;display:flex;align-items:center;gap:12px;font-family:monospace;font-size:16px;color:#818cf8;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
          <span>github.com/vidishagupta/scope-creep-guard</span>
        </div>
        <p style="margin-top:20px;color:#64748b;font-size:14px;">Open Source • MIT Licensed • Built with Gemma 3</p>
      `;
      document.body.appendChild(card);
      setTimeout(() => { card.style.opacity = '1'; }, 50);
    });
  };

  console.log('Navigating to app at http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Scope-Creep Guard');
  await sleep(1000);

  // Array to hold scene timing marks for audio mixing
  const sceneTimings: { id: string; startTime: number; duration: number; subtitle: string }[] = [];
  const recordingStartTime = Date.now();

  const markScene = (sceneId: string, dur: number, subtitle: string) => {
    const elapsed = (Date.now() - recordingStartTime) / 1000;
    sceneTimings.push({
      id: sceneId,
      startTime: elapsed,
      duration: dur,
      subtitle,
    });
    console.log(`[Timeline] Scene ${sceneId} begins at ${elapsed.toFixed(2)}s (audio duration: ${dur.toFixed(2)}s)`);
  };

  // 1. Title Card
  const c01 = audioClips[0];
  markScene(c01.id, c01.duration, c01.subtitle);
  await showTitleCard();
  await sleep(c01.duration * 1000 + 400);
  await hideTitleCard();
  await sleep(600);

  // 2. Overview & Privacy
  const c02 = audioClips[1];
  markScene(c02.id, c02.duration, c02.subtitle);
  await showSubtitle(c02.subtitle);
  await sleep(c02.duration * 1000 + 800);

  // 3. Load Sample
  const c03 = audioClips[2];
  markScene(c03.id, c03.duration, c03.subtitle);
  await showSubtitle(c03.subtitle);
  await page.click('button:has-text("Load Full Sample")');
  await sleep(c03.duration * 1000 + 600);

  // 4. Hinglish message
  const c04 = audioClips[3];
  markScene(c04.id, c04.duration, c04.subtitle);
  await showSubtitle(c04.subtitle);
  await page.click('button:has-text("Out-of-Scope (Hinglish)")');
  await sleep(1200);
  await page.evaluate(() => window.scrollBy({ top: 320, behavior: 'smooth' }));
  await sleep(c04.duration * 1000);

  // 5. Analyze Scope with Gemma
  const c05 = audioClips[4];
  markScene(c05.id, c05.duration, c05.subtitle);
  await showSubtitle(c05.subtitle);
  await page.click('button:has-text("Analyze Scope with Gemma")');

  try {
    await page.waitForSelector('text=OUT OF SCOPE', { timeout: 35000 });
  } catch {
    console.log('Waiting for verdict card fallback...');
  }
  await sleep(c05.duration * 1000 + 600);

  // 6. Verdict Card
  const c06 = audioClips[5];
  markScene(c06.id, c06.duration, c06.subtitle);
  await showSubtitle(c06.subtitle);
  await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
  await sleep(c06.duration * 1000 + 800);

  // 7. Matched Clause
  const c07 = audioClips[6];
  markScene(c07.id, c07.duration, c07.subtitle);
  await showSubtitle(c07.subtitle);
  await sleep(c07.duration * 1000 + 800);

  // 8. Ready to Send Replies
  const c08 = audioClips[7];
  markScene(c08.id, c08.duration, c08.subtitle);
  await showSubtitle(c08.subtitle);
  await page.click('button:has-text("Polite")');
  await sleep(1800);
  await page.click('button:has-text("Firm")');
  await sleep(1800);
  await page.click('button[title="Copy this message to clipboard"]');
  await sleep(1500);
  await page.click('button:has-text("Friendly Upsell")');
  await sleep(c08.duration * 1000);

  // 9. Change Order Mini Quote
  const c09 = audioClips[8];
  markScene(c09.id, c09.duration, c09.subtitle);
  await showSubtitle(c09.subtitle);
  await page.evaluate(() => window.scrollBy({ top: 240, behavior: 'smooth' }));
  await page.click('button:has-text("Copy Quote")');
  await sleep(c09.duration * 1000 + 600);

  // 10. Scope Ledger
  const c10 = audioClips[9];
  markScene(c10.id, c10.duration, c10.subtitle);
  await showSubtitle(c10.subtitle);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(1200);
  await page.click('button:has-text("Scope Ledger")');
  await sleep(1800);
  await page.evaluate(() => window.scrollBy({ top: 220, behavior: 'smooth' }));
  await page.click('button:has-text("Client Agreed to Pay")');
  await sleep(c10.duration * 1000 + 1000);

  // 11. End Card
  const c11 = audioClips[10];
  markScene(c11.id, c11.duration, c11.subtitle);
  await showEndCard();
  await sleep(c11.duration * 1000 + 1000);

  console.log('Closing browser recording...');
  await page.close();
  await context.close();
  await browser.close();

  // Find recorded WebM
  const rawWebmFiles = fs.readdirSync(rawDir).filter((f) => f.endsWith('.webm'));
  if (rawWebmFiles.length === 0) {
    throw new Error('No raw video file found in ' + rawDir);
  }
  const rawVideoPath = path.join(rawDir, rawWebmFiles[0]);
  console.log(`Raw video captured: ${rawVideoPath}`);

  // Step 3: Generate Synchronized Audio Track with ffmpeg adelay & amix
  console.log('\n--- Step 3: Mixing Audio Track with Exact Scene Offsets ---');
  const masterAudioPath = path.join(demoDir, 'master_narration.mp3');

  // Build ffmpeg inputs and filter complex
  const inputsArgs = sceneTimings.map((st) => `-i "${path.join(audioDir, `${st.id}.mp3`)}"`).join(' ');
  const filterParts = sceneTimings.map((st, idx) => {
    const delayMs = Math.max(0, Math.round(st.startTime * 1000));
    return `[${idx}:a]adelay=${delayMs}|${delayMs}[a${idx}]`;
  });
  const amixInputs = sceneTimings.map((_, idx) => `[a${idx}]`).join('');
  const filterComplex = `${filterParts.join(';')};${amixInputs}amix=inputs=${sceneTimings.length}:dropout_transition=0:normalize=0[aout]`;

  const mixAudioCmd = `ffmpeg -y ${inputsArgs} -filter_complex "${filterComplex}" -map "[aout]" -c:a libmp3lame -b:a 192k "${masterAudioPath}"`;
  execSync(mixAudioCmd, { stdio: 'inherit' });
  console.log(`Master narration track created: ${masterAudioPath}`);

  // Step 4: Generate .srt subtitle file
  console.log('\n--- Step 4: Generating Subtitle File (.srt) ---');
  const srtPath = path.join(demoDir, 'scope-creep-guard-demo.srt');
  let srtContent = '';
  sceneTimings.forEach((st, idx) => {
    const startStr = formatSrtTime(st.startTime);
    const endStr = formatSrtTime(st.startTime + st.duration + 0.6);
    srtContent += `${idx + 1}\n${startStr} --> ${endStr}\n${st.subtitle}\n\n`;
  });
  fs.writeFileSync(srtPath, srtContent, 'utf-8');
  console.log(`SRT subtitle saved to: ${srtPath}`);

  // Step 5: Merge Video + Audio + Subtitles into MP4
  console.log('\n--- Step 5: Transcoding Final MP4 with Video, AI Voice & Subtitles ---');
  const mp4Path = path.join(demoDir, 'scope-creep-guard-demo.mp4');
  const mergeCmd = `ffmpeg -y -i "${rawVideoPath}" -i "${masterAudioPath}" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${mp4Path}"`;
  execSync(mergeCmd, { stdio: 'inherit' });

  const mp4Stats = fs.statSync(mp4Path);
  const mp4SizeMB = (mp4Stats.size / (1024 * 1024)).toFixed(2);
  console.log(`Final MP4 with AI Voice created: ${mp4Path} (${mp4SizeMB} MB)`);

  // Step 6: Export 10s preview GIF
  console.log('\n--- Step 6: Exporting 10s Preview GIF ---');
  const gifPath = path.join(demoDir, 'preview.gif');
  // Capture the high-impact verdict revelation around 25s - 35s
  const gifCmd = `ffmpeg -y -ss 00:00:26 -t 10 -i "${mp4Path}" -vf "fps=10,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${gifPath}"`;
  execSync(gifCmd, { stdio: 'inherit' });

  const gifStats = fs.statSync(gifPath);
  const gifSizeMB = (gifStats.size / (1024 * 1024)).toFixed(2);
  console.log(`GIF preview created: ${gifPath} (${gifSizeMB} MB)`);

  console.log('\n======================================================');
  console.log('🎉 AI Voice & Subtitle Demo Video Completed Successfully!');
  console.log(`Video: ${mp4Path} (${mp4SizeMB} MB)`);
  console.log(`Audio: ${masterAudioPath}`);
  console.log(`SRT:   ${srtPath}`);
  console.log(`GIF:   ${gifPath} (${gifSizeMB} MB)`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Error generating demo video with voice:', err);
  process.exit(1);
});
