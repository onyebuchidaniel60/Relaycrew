#!/usr/bin/env node
/**
 * Record the Arc explorer evidence segment for the RelayCrew demo.
 *
 * Blockscout lazy-loads the transaction rows and the token-transfer tab, so
 * this segment is recorded separately and trimmed during assembly. It shows
 * the real Stage 1 approval transaction and its 1 USDC ERC-20 transfer.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RECORDINGS_DIR = path.join(ROOT, 'recordings');

const STAGE_1_APPROVE_TX =
  '0xfddd46b6b322a1f3b66efc4b99626e862d2bfd7d7a12c0f0306a422b5cbc9e62';
const EXPLORER_TX = `https://explorer.arc.io/tx/${STAGE_1_APPROVE_TX}`;
const APP_URL = 'https://relaycrew-omega.vercel.app';

const CURSOR_SCRIPT = `
(() => {
  const install = () => {
    if (window.__relaycrewCursor && document.getElementById('rc-cursor')) return;
    window.__relaycrewCursor = true;
    const style = document.createElement('style');
    style.id = 'rc-cursor-style';
    style.textContent = [
      '#rc-cursor{position:fixed;left:0;top:0;width:13px;height:13px;border-radius:50%;',
      'background:#fffdf8;border:2px solid #10281d;box-shadow:0 2px 10px rgba(0,0,0,.35);',
      'z-index:2147483646;pointer-events:none;transform:translate(-50%,-50%);',
      'transition:width .12s ease,height .12s ease,background .12s ease}',
      '#rc-cursor::after{content:"";position:absolute;inset:-7px;border:1px solid rgba(255,253,248,.55);border-radius:50%}',
      '#rc-cursor.rc-click{width:26px;height:26px;background:rgba(255,253,248,.35)}'
    ].join('');
    document.documentElement.appendChild(style);
    const cursor = document.createElement('div');
    cursor.id = 'rc-cursor';
    document.documentElement.appendChild(cursor);
    window.addEventListener('mousemove', (event) => {
      cursor.style.left = event.clientX + 'px';
      cursor.style.top = event.clientY + 'px';
    }, { passive: true });
    window.addEventListener('mousedown', () => cursor.classList.add('rc-click'));
    window.addEventListener('mouseup', () => setTimeout(() => cursor.classList.remove('rc-click'), 140));
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
`;

function endCard() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&family=Instrument+Sans:ital,wght@0,400..700;1,400..600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  *{box-sizing:border-box} html,body{margin:0;height:100%}
  body{background:#10281d;color:#f6f0e4;font-family:'Instrument Sans',ui-sans-serif,sans-serif;display:grid;place-items:center;overflow:hidden}
  .card{width:min(1080px,82vw);animation:rise .8s ease both}
  .wordmark{font-family:'Newsreader',Georgia,serif;font-size:72px;letter-spacing:-.055em;line-height:1;display:flex;align-items:baseline;gap:18px}
  .wordmark span{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.18em;color:#b9c7b6;text-transform:uppercase}
  .tag{font-family:'Newsreader',Georgia,serif;font-size:34px;font-style:italic;color:#dfe7d8;margin:18px 0 42px;letter-spacing:-.02em}
  .rule{height:1px;background:rgba(246,240,228,.22);margin:0 0 28px}
  .rows{display:grid;gap:18px;max-width:900px}
  .row{display:grid;grid-template-columns:150px 1fr;gap:24px;align-items:baseline}
  .label{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.16em;color:#9fb09b;text-transform:uppercase}
  .value{font-family:'IBM Plex Mono',monospace;font-size:14px;color:#f6f0e4;word-break:break-all;line-height:1.5}
  .value a{color:inherit;text-decoration:none;border-bottom:1px solid rgba(246,240,228,.28)}
  .foot{display:flex;justify-content:space-between;margin-top:46px;font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.14em;color:#9fb09b;text-transform:uppercase}
  @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
</style></head><body>
  <div class="card">
    <div class="wordmark">RelayCrew <span>Escrow for Agent Workflows</span></div>
    <div class="tag">The handoff is the settlement.</div>
    <div class="rule"></div>
    <div class="rows">
      <div class="row"><div class="label">Production</div><div class="value"><a href="${APP_URL}">relaycrew-omega.vercel.app</a></div></div>
      <div class="row"><div class="label">Contract</div><div class="value">0x9b85cd94f9dedd8ee6ef09a5c904502da52a9114</div></div>
      <div class="row"><div class="label">Stage 1 approval</div><div class="value">${STAGE_1_APPROVE_TX}</div></div>
      <div class="row"><div class="label">Source</div><div class="value"><a href="https://github.com/onyebuchidaniel60/Relaycrew">github.com/onyebuchidaniel60/Relaycrew</a></div></div>
    </div>
    <div class="foot"><span>Arc Mainnet · Chain 5042 · USDC 6 decimals</span><span>Built with Arc Studio</span></div>
  </div>
</body></html>`;
}

async function main() {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--force-color-profile=srgb'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    screen: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1440, height: 900 },
    },
  });
  await context.addInitScript(CURSOR_SCRIPT);

  // Warm the explorer's lazy-loaded token tab in the same context, then close
  // that page. The recorded page starts with the tab data already cached.
  const warm = await context.newPage();
  const warmVideo = warm.video();
  await warm.goto(EXPLORER_TX, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await warm.getByText(STAGE_1_APPROVE_TX, { exact: true }).first().waitFor({ timeout: 30_000 });
  await warm.getByRole('tab', { name: 'Token transfers' }).click();
  await warm.getByText('USDC', { exact: true }).first().waitFor({ timeout: 30_000 });
  await warm.getByRole('tab', { name: 'Details' }).click();
  await warm.getByText(STAGE_1_APPROVE_TX, { exact: true }).first().waitFor({ timeout: 30_000 });
  await warm.waitForTimeout(800);
  await warm.close();
  const warmVideoPath = await warmVideo.path();
  if (warmVideoPath && fs.existsSync(warmVideoPath)) {
    fs.unlinkSync(warmVideoPath);
  }

  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  const video = page.video();

  await page.goto(EXPLORER_TX, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.getByText(STAGE_1_APPROVE_TX, { exact: true }).first().waitFor({ timeout: 30_000 });
  await page.waitForTimeout(3000);

  // Top of the transaction, including the 1 USDC transfer summary.
  await page.mouse.move(620, 430, { steps: 6 });
  await page.waitForTimeout(7000);

  // Token transfers tab. The warm-up page has already cached the response.
  const tab = page.getByRole('tab', { name: 'Token transfers' });
  const tabBox = await tab.boundingBox();
  if (tabBox) {
    await page.mouse.move(tabBox.x + tabBox.width / 2, tabBox.y + tabBox.height / 2, { steps: 6 });
    await page.mouse.down();
    await page.waitForTimeout(80);
    await page.mouse.up();
  } else {
    await tab.click();
  }
  const usdc = page.getByText('USDC', { exact: true }).first();
  await usdc.waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(10000);

  // End card.
  await page.setContent(endCard(), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(12_000);

  await context.close();
  await browser.close();

  const videoPath = await video.path();
  console.log(`EXPLORER_VIDEO_PATH=${videoPath}`);
  fs.writeFileSync(path.join(RECORDINGS_DIR, 'explorer-latest.txt'), `${videoPath}\n`, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
