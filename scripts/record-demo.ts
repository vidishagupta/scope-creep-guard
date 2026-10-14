import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('=== Starting Scope-Creep Guard Playwright Demo Recorder ===');

  const demoDir = path.join(process.cwd(), 'demo');
  const rawDir = path.join(demoDir, 'raw');

  if (!fs.existsSync(demoDir)) fs.mkdirSync(demoDir, { recursive: true });
  if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });

  // Clean previous raw videos if any
  const previousFiles = fs.readdirSync(rawDir);
  for (const file of previousFiles) {
    try {
      fs.unlinkSync(path.join(rawDir, file));
    } catch {
      // Ignore
    }
  }

  console.log('Launching Chromium with video recording (1280x720)...');
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

  // Helper: inject caption overlay
  const showCaption = async (text: string) => {
    console.log(`[Caption] ${text}`);
    await page.evaluate((captionText) => {
      let overlay = document.getElementById('demo-caption-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'demo-caption-overlay';
        overlay.style.position = 'fixed';
        overlay.style.bottom = '24px';
        overlay.style.left = '50%';
        overlay.style.transform = 'translateX(-50%)';
        overlay.style.zIndex = '999999';
        overlay.style.backgroundColor = 'rgba(10, 15, 30, 0.94)';
        overlay.style.backdropFilter = 'blur(16px)';
        overlay.style.border = '1px solid rgba(99, 102, 241, 0.45)';
        overlay.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(99, 102, 241, 0.25)';
        overlay.style.borderRadius = '9999px';
        overlay.style.padding = '12px 28px';
        overlay.style.color = '#ffffff';
        overlay.style.fontSize = '15px';
        overlay.style.fontWeight = '600';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.gap = '12px';
        overlay.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        overlay.style.letterSpacing = '-0.01em';
        overlay.style.transition = 'all 0.3s ease';
        document.body.appendChild(overlay);
      }
      overlay.innerHTML = `
        <span style="display:inline-block;width:10px;height:10px;border-radius:9999px;background:#6366f1;box-shadow:0 0 10px #818cf8;"></span>
        <span>${captionText}</span>
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
        card.style.transition = 'opacity 0.6s ease';
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 600);
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
  await sleep(1500);

  // 1. Title Card (4.5s)
  await showTitleCard();
  await sleep(4500);
  await hideTitleCard();
  await sleep(600);

  // 2. Open app, show "Ollama Connected" badge & privacy banner (6s)
  await showCaption('Runs 100% on your laptop — Ollama connected & NDA compliant');
  await sleep(6000);

  // 3. Click "Load Full Sample" (3s)
  await showCaption('Loading real freelancer scenario: 5-page static website agreement');
  await page.click('button:has-text("Load Full Sample")');
  await sleep(3000);

  // 4. Select the Hinglish out-of-scope message (4.5s)
  await showCaption('Hinglish client message: "Bhai Razorpay aur SEO bhi add kardo na"');
  await page.click('button:has-text("Out-of-Scope (Hinglish)")');
  await sleep(1500);
  await page.evaluate(() => window.scrollBy({ top: 320, behavior: 'smooth' }));
  await sleep(4500);

  // 5. Click Analyze Scope with Gemma (6s)
  await showCaption('AI analyzing contract against client request with local Gemma...');
  await page.click('button:has-text("Analyze Scope with Gemma")');

  // Wait for result to appear
  try {
    await page.waitForSelector('text=OUT OF SCOPE', { timeout: 35000 });
  } catch {
    console.log('Waiting for verdict card fallback...');
  }
  await sleep(4000);

  // 6. Show red OUT_OF_SCOPE badge, hours and extra charge (5.5s)
  await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
  await showCaption('OUT OF SCOPE detected! AI calculates 12 extra hours = ₹12,000 extra charge');
  await sleep(5500);

  // 7. Show matched clause (4.5s)
  await showCaption('AI finds exact contract clause limiting payment gateways and revisions');
  await sleep(4500);

  // 8. Switch through Polite / Firm / Friendly Upsell tabs and click Copy on Firm (10s)
  await showCaption('Ready-to-send replies: Switch between Polite, Firm, and Upsell');
  await page.click('button:has-text("Polite")');
  await sleep(3000);

  await page.click('button:has-text("Firm")');
  await showCaption('Firm reply sets professional boundary with quote');
  await sleep(3000);

  await page.click('button[title="Copy this message to clipboard"]');
  await sleep(2500);

  await page.click('button:has-text("Friendly Upsell")');
  await showCaption('Friendly Upsell turns scope-creep into new revenue');
  await sleep(3500);

  // 9. Generate Change-Order Mini Quote (4.5s)
  await page.evaluate(() => window.scrollBy({ top: 240, behavior: 'smooth' }));
  await showCaption('Instant Change-Order Mini Quote ready to send client');
  await page.click('button:has-text("Copy Quote")');
  await sleep(4500);

  // 10. Open Scope Ledger page and mark request as "Client agreed to pay" (9s)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(1500);

  await page.click('button:has-text("Scope Ledger")');
  await showCaption('Scope Ledger tracks every scope creep request and recovered revenue');
  await sleep(4000);

  await page.evaluate(() => window.scrollBy({ top: 220, behavior: 'smooth' }));
  await showCaption('Mark "Client agreed to pay" — Money Recovered updates instantly!');
  await page.click('button:has-text("Client Agreed to Pay")');
  await sleep(5500);

  // 11. End Card (6s)
  await showEndCard();
  await sleep(6000);

  console.log('Finished walkthrough actions. Closing browser to finalize video file...');
  await page.close();
  await context.close();
  await browser.close();

  // Find the raw video recorded by Playwright
  const files = fs.readdirSync(rawDir).filter((f) => f.endsWith('.webm'));
  if (files.length === 0) {
    throw new Error('No raw video file found in ' + rawDir);
  }

  const rawVideoPath = path.join(rawDir, files[0]);
  const mp4Path = path.join(demoDir, 'scope-creep-guard-demo.mp4');
  const gifPath = path.join(demoDir, 'preview.gif');

  console.log(`Raw video captured at: ${rawVideoPath}`);

  // Transcode to MP4 (H.264, under 25 MB)
  console.log('Transcoding to MP4 with ffmpeg...');
  const ffmpegMp4Cmd = `ffmpeg -y -i "${rawVideoPath}" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p "${mp4Path}"`;
  execSync(ffmpegMp4Cmd, { stdio: 'inherit' });

  const mp4Stats = fs.statSync(mp4Path);
  const mp4SizeMB = (mp4Stats.size / (1024 * 1024)).toFixed(2);
  console.log(`MP4 created successfully: ${mp4Path} (${mp4SizeMB} MB)`);

  // Export 10-second looping GIF preview (under 5 MB)
  // Extracting from around 28s (when OUT_OF_SCOPE verdict and calculations appear)
  console.log('Creating 10-second looping preview GIF with ffmpeg...');
  const ffmpegGifCmd = `ffmpeg -y -ss 00:00:26 -t 10 -i "${mp4Path}" -vf "fps=10,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${gifPath}"`;
  execSync(ffmpegGifCmd, { stdio: 'inherit' });

  const gifStats = fs.statSync(gifPath);
  const gifSizeMB = (gifStats.size / (1024 * 1024)).toFixed(2);
  console.log(`GIF created successfully: ${gifPath} (${gifSizeMB} MB)`);

  console.log('\n=== Demo Recording & Transcoding Completed Successfully ===');
  console.log(`MP4 Path: ${mp4Path} (${mp4SizeMB} MB)`);
  console.log(`GIF Path: ${gifPath} (${gifSizeMB} MB)`);
}

main().catch((err) => {
  console.error('Error recording demo:', err);
  process.exit(1);
});
