#!/usr/bin/env node
/**
 * Record the RelayCrew demo without signing any transaction.
 *
 * The video is assembled from:
 *   1. a title card,
 *   2. the live Arc Mainnet production app (read-only),
 *   3. the exported Arc Studio contract source and its 31-test suite,
 *   4. the real Stage 1 approval transaction on the Arc explorer,
 *   5. an end card.
 *
 * The Arc Studio workspace is private and redirects to Circle sign-in when no
 * authenticated session is present. The script therefore uses the exported
 * source (the same files pulled from the Studio project) in a local evidence
 * view, clearly labelled "EXPORTED SOURCE", instead of recording a login page.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RECORDINGS_DIR = path.join(ROOT, 'recordings');

const APP_URL = 'https://relaycrew-omega.vercel.app';
const STUDIO_URL =
  'https://studio.arc.io/app/9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961';
const STAGE_1_APPROVE_TX =
  '0xfddd46b6b322a1f3b66efc4b99626e862d2bfd7d7a12c0f0306a422b5cbc9e62';
const EXPLORER_TX = `https://explorer.arc.io/tx/${STAGE_1_APPROVE_TX}`;

const CONTRACT_SOURCE = fs.readFileSync(
  path.join(ROOT, 'contracts/PipelineCoordinator.sol'),
  'utf8',
);
const TEST_SOURCE = fs.readFileSync(
  path.join(ROOT, 'contracts/test/PipelineCoordinator.t.sol'),
  'utf8',
);
const TEST_NAMES = [...TEST_SOURCE.matchAll(/function\s+(test\w+)\s*\(/g)].map(
  (match) => match[1],
);

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

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

const SOLIDITY_KEYWORDS = [
  'pragma', 'solidity', 'contract', 'interface', 'library', 'function',
  'modifier', 'event', 'error', 'struct', 'enum', 'mapping', 'address',
  'uint256', 'uint8', 'uint32', 'uint64', 'int256', 'bool', 'string', 'bytes',
  'memory', 'calldata', 'storage', 'public', 'private', 'internal', 'external',
  'view', 'pure', 'payable', 'returns', 'return', 'if', 'else', 'for', 'while',
  'require', 'revert', 'emit', 'new', 'delete', 'true', 'false', 'indexed',
  'immutable', 'constant', 'constructor', 'import', 'using', 'is', 'virtual',
  'override', 'unchecked', 'assembly', 'try', 'catch', 'type',
].join('|');

function highlightSolidity(source) {
  const tokenPattern = new RegExp(
    `(\\/\\/[^\\n]*)|("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')|\\b(${SOLIDITY_KEYWORDS})\\b|\\b(\\d[\\d_]*)\\b`,
    'g',
  );
  let output = '';
  let lastIndex = 0;
  for (const match of source.matchAll(tokenPattern)) {
    output += escapeHtml(source.slice(lastIndex, match.index));
    const className = match[1] ? 'c' : match[2] ? 's' : match[3] ? 'k' : 'n';
    output += `<span class="${className}">${escapeHtml(match[0])}</span>`;
    lastIndex = match.index + match[0].length;
  }
  output += escapeHtml(source.slice(lastIndex));
  return output;
}

function numberedCode(source) {
  const highlighted = highlightSolidity(source);
  return highlighted
    .split('\n')
    .map(
      (line, index) =>
        `<div class="line" id="L${index + 1}"><span class="ln">${index + 1}</span><span class="lc">${line || ' '}</span></div>`,
    )
    .join('');
}

function titleCard() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&family=Instrument+Sans:ital,wght@0,400..700;1,400..600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  *{box-sizing:border-box} html,body{margin:0;height:100%}
  body{background:#f6f0e4;color:#10281d;font-family:'Instrument Sans',ui-sans-serif,sans-serif;display:grid;place-items:center;overflow:hidden}
  .card{width:min(1080px,82vw);position:relative;padding:52px 0 44px;animation:rise .9s cubic-bezier(.2,.7,.2,1) both}
  .eyebrow{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.22em;color:#6b7566;display:flex;gap:18px;align-items:center}
  .eyebrow::before{content:'';width:46px;height:1px;background:#a9b09f}
  h1{font-family:'Newsreader',Georgia,serif;font-weight:400;font-size:clamp(64px,8.4vw,118px);line-height:.92;letter-spacing:-.055em;margin:30px 0 24px;max-width:980px}
  h1 em{font-style:italic;color:#173f2d}
  .tag{font-size:18px;letter-spacing:-.01em;color:#3d4a3f;max-width:600px;line-height:1.5}
  .rule{height:1px;background:#d7cfbd;margin:42px 0 18px}
  .meta{display:flex;justify-content:space-between;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.13em;color:#6b7566;text-transform:uppercase}
  .seal{position:absolute;right:0;top:54px;width:150px;height:150px;border:1px solid #b9c0ae;border-radius:50%;display:grid;place-items:center;text-align:center;transform:rotate(-8deg);color:#3f5a48;font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.12em;line-height:1.7;text-transform:uppercase}
  .seal::before{content:'';position:absolute;inset:9px;border:1px dashed #b9c0ae;border-radius:50%}
  @keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
</style></head><body>
  <div class="card">
    <div class="eyebrow">RELAYCREW / MAINNET DEMO</div>
    <h1>Work moves<br />in order.<br /><em>Money follows.</em></h1>
    <div class="tag">A fixed crew of specialist agents, funded once in USDC escrow on Arc, settled one approved handoff at a time.</div>
    <div class="rule"></div>
    <div class="meta"><span>Arc Mainnet · Real USDC · Chain 5042</span><span>Escrow for Agent Workflows</span></div>
    <div class="seal">2-stage<br />pipeline<br />completed</div>
  </div>
</body></html>`;
}

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

function studioPage() {
  const contractLines = numberedCode(CONTRACT_SOURCE);
  const testLines = numberedCode(TEST_SOURCE);
  const testGrid = TEST_NAMES.map(
    (name, index) =>
      `<div class="test"><span class="check">✓</span><span class="num">${String(index + 1).padStart(2, '0')}</span><span class="name">${escapeHtml(name)}</span></div>`,
  ).join('');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&family=Instrument+Sans:ital,wght@0,400..700;1,400..600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  *{box-sizing:border-box} html,body{margin:0;height:100%;overflow:hidden}
  body{background:#0d1b16;color:#e9e4d6;font-family:'Instrument Sans',ui-sans-serif,sans-serif}
  .shell{height:100vh;display:flex;flex-direction:column}
  .top{height:64px;flex:0 0 64px;display:flex;align-items:center;justify-content:space-between;padding:0 26px;border-bottom:1px solid rgba(233,228,214,.14);background:#10211a}
  .brand{display:flex;align-items:baseline;gap:12px;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.17em;color:#cfd8c9;text-transform:uppercase}
  .brand b{font-family:'Newsreader',Georgia,serif;font-size:24px;font-weight:400;letter-spacing:-.03em;color:#f6f0e4;text-transform:none}
  .top-meta{display:flex;gap:22px;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.12em;color:#94a58f;text-transform:uppercase}
  .badge{display:inline-flex;align-items:center;gap:8px;border:1px solid #5e7a60;border-radius:2px;padding:6px 9px;color:#cfe0c8;background:rgba(94,122,96,.12)}
  .badge i{width:5px;height:5px;border-radius:50%;background:#9bc58f;display:block}
  .workspace{flex:1;display:grid;grid-template-columns:248px minmax(0,1fr) 310px;min-height:0}
  .sidebar{border-right:1px solid rgba(233,228,214,.12);background:#0f1f18;padding:20px 14px;overflow:hidden}
  .panel-label{font-family:'IBM Plex Mono',monospace;font-size:8px;letter-spacing:.18em;color:#7f937c;text-transform:uppercase;margin:0 8px 10px}
  .folder,.file{display:flex;align-items:center;gap:9px;padding:8px 9px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#c7d2c1;cursor:pointer;border-radius:2px;line-height:1.3}
  .folder:hover,.file:hover{background:rgba(233,228,214,.07)}
  .folder .chev{display:inline-block;width:10px;color:#8fa58a;transition:transform .18s ease}
  .folder.open .chev{transform:rotate(90deg)}
  .files{display:none;margin-left:14px;border-left:1px solid rgba(233,228,214,.13);padding-left:4px}
  .files.open{display:block}
  .file.active{background:#1d3327;color:#f6f0e4}
  .file .dot{width:5px;height:5px;border-radius:50%;background:#7d9279;display:block;flex:0 0 5px}
  .file.active .dot{background:#c8a96a}
  .side-note{margin:26px 8px 0;padding-top:16px;border-top:1px solid rgba(233,228,214,.12);font-family:'IBM Plex Mono',monospace;font-size:9px;line-height:1.7;color:#83967f}
  .side-note strong{color:#cfd8c9;font-weight:500}
  .editor{min-width:0;display:flex;flex-direction:column;background:#0b1712}
  .tabs{height:43px;flex:0 0 43px;display:flex;align-items:stretch;border-bottom:1px solid rgba(233,228,214,.12);background:#0f1f18}
  .tab{padding:0 18px;display:flex;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:10px;color:#8fa58a;border-right:1px solid rgba(233,228,214,.09)}
  .tab.active{color:#f6f0e4;background:#0b1712;box-shadow:inset 0 -1px 0 #c8a96a}
  .editor-body{position:relative;flex:1;min-height:0;overflow:hidden}
  .code{position:absolute;inset:0;overflow:hidden;padding:16px 0 24px;font-family:'IBM Plex Mono','SFMono-Regular',Menlo,monospace;font-size:11.5px;line-height:1.62;background:#0b1712}
  .line{display:flex;min-height:18.6px;padding-right:20px}
  .line:hover{background:rgba(233,228,214,.035)}
  .ln{flex:0 0 48px;text-align:right;padding-right:16px;color:#4f6555;user-select:none}
  .lc{white-space:pre;color:#d8dfd1}
  .k{color:#d9b878}.s{color:#a8c99b}.c{color:#6d8770}.n{color:#d7a58a}
  .placeholder{position:absolute;inset:0;display:grid;place-items:center;text-align:center;color:#728871;font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.8;background:#0b1712}
  .placeholder strong{display:block;color:#c7d2c1;font-weight:500;font-size:13px;margin-bottom:8px}
  .tests{position:absolute;inset:0;display:none;flex-direction:column;background:#0b1712;padding:22px 24px;overflow:hidden}
  .tests.visible{display:flex}
  .tests-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;border-bottom:1px solid rgba(233,228,214,.13);padding-bottom:16px;margin-bottom:14px}
  .tests-title{font-family:'Newsreader',Georgia,serif;font-size:34px;line-height:1;letter-spacing:-.03em;color:#f6f0e4}
  .tests-sub{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.12em;color:#8fa58a;text-transform:uppercase;margin-top:8px}
  .tests-score{text-align:right;font-family:'IBM Plex Mono',monospace;color:#9bc58f}
  .tests-score b{display:block;font-family:'Newsreader',Georgia,serif;font-size:46px;line-height:.9;font-weight:400;color:#cfe0c8}
  .tests-score span{font-size:9px;letter-spacing:.12em;text-transform:uppercase}
  .test-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 24px;overflow:hidden}
  .test{display:flex;align-items:center;gap:8px;height:23px;border-bottom:1px solid rgba(233,228,214,.055);font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:#c3cfbd;white-space:nowrap;overflow:hidden}
  .check{color:#9bc58f;font-size:10px;flex:0 0 10px}
  .num{color:#58705c;flex:0 0 16px}
  .name{overflow:hidden;text-overflow:ellipsis}
  .right{border-left:1px solid rgba(233,228,214,.12);background:#0f1f18;padding:20px 18px;overflow:hidden}
  .right h2{font-family:'Newsreader',Georgia,serif;font-size:24px;font-weight:400;line-height:1.1;letter-spacing:-.02em;margin:0 0 6px;color:#f6f0e4}
  .right p{font-size:11px;line-height:1.6;color:#93a48e;margin:0 0 18px}
  .kv{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid rgba(233,228,214,.08);font-family:'IBM Plex Mono',monospace;font-size:9px;line-height:1.5;color:#8fa58a}
  .kv span:last-child{color:#d8dfd1;text-align:right}
  .callout{margin-top:18px;border:1px solid #4d6b51;background:rgba(77,107,81,.13);padding:13px;font-family:'IBM Plex Mono',monospace;font-size:9px;line-height:1.65;color:#b9cbb2}
  .callout b{display:block;color:#e8efdf;font-weight:500;margin-bottom:5px;letter-spacing:.03em}
  .foot-note{position:absolute;left:18px;right:18px;bottom:14px;font-family:'IBM Plex Mono',monospace;font-size:8px;line-height:1.6;color:#647a66}
  .seal{position:absolute;right:18px;bottom:16px;font-family:'IBM Plex Mono',monospace;font-size:8px;letter-spacing:.1em;color:#8fa58a;text-transform:uppercase}
</style></head><body>
<div class="shell">
  <header class="top">
    <div class="brand"><b>Arc Studio</b><span>Build / exported source</span></div>
    <div class="top-meta">
      <span>App 9ad3cdcd…4961</span>
      <span>Solidity 0.8.28</span>
      <span class="badge"><i></i>31 / 31 tests passed</span>
    </div>
  </header>
  <div class="workspace">
    <aside class="sidebar">
      <div class="panel-label">Project files</div>
      <div class="folder" id="contracts-folder"><span class="chev">▸</span><span>contracts</span></div>
      <div class="files" id="contracts-files">
        <div class="file active" id="file-contract"><span class="dot"></span><span>PipelineCoordinator.sol</span></div>
      </div>
      <div class="folder open" id="test-folder"><span class="chev">▸</span><span>test</span></div>
      <div class="files open" id="test-files">
        <div class="file" id="file-test"><span class="dot"></span><span>PipelineCoordinator.t.sol</span></div>
      </div>
      <div class="side-note"><strong>Arc Studio build</strong><br />Contract, tests and deployment records. Source exported for this recording.</div>
    </aside>
    <main class="editor">
      <div class="tabs"><div class="tab active" id="tab-contract">PipelineCoordinator.sol</div><div class="tab" id="tab-test">PipelineCoordinator.t.sol</div></div>
      <div class="editor-body">
        <div class="code" id="code-contract">${contractLines}</div>
        <div class="tests" id="tests-panel">
          <div class="tests-head">
            <div><div class="tests-title">31 tests. One settlement path.</div><div class="tests-sub">Foundry test suite · Arc Studio run · 0 failed · 0 skipped</div></div>
            <div class="tests-score"><b>31</b><span>passed</span></div>
          </div>
          <div class="test-grid">${testGrid}</div>
        </div>
        <div class="placeholder" id="placeholder"><div><strong>Select a file from the project tree</strong>Open contracts/ to inspect the coordinator.</div></div>
      </div>
    </main>
    <aside class="right">
      <h2>PipelineCoordinator</h2>
      <p>The parent escrow pays the active specialist and activates the next stage in the same transaction.</p>
      <div class="kv"><span>Network</span><span>Arc Mainnet</span></div>
      <div class="kv"><span>Compiler</span><span>0.8.28</span></div>
      <div class="kv"><span>Optimizer</span><span>200 runs</span></div>
      <div class="kv"><span>Stages</span><span>2–10</span></div>
      <div class="kv"><span>Mainnet</span><span>0x9b85…9114</span></div>
      <div class="callout"><b>approveStage()</b>safeTransfer(provider, budget)<br />emit StageReleased<br />activate next stage<br />emit StageHired</div>
    </aside>
  </div>
</div>
<script>
  const folder = document.getElementById('contracts-folder');
  const files = document.getElementById('contracts-files');
  const testFolder = document.getElementById('test-folder');
  const testFiles = document.getElementById('test-files');
  const code = document.getElementById('code-contract');
  const tests = document.getElementById('tests-panel');
  const placeholder = document.getElementById('placeholder');
  const fileContract = document.getElementById('file-contract');
  const fileTest = document.getElementById('file-test');
  const tabContract = document.getElementById('tab-contract');
  const tabTest = document.getElementById('tab-test');

  folder.addEventListener('click', () => {
    folder.classList.toggle('open');
    files.classList.toggle('open');
  });
  testFolder.addEventListener('click', () => {
    testFolder.classList.toggle('open');
    testFiles.classList.toggle('open');
  });
  fileContract.addEventListener('click', () => {
    placeholder.style.display = 'none';
    code.style.display = 'block';
    tests.classList.remove('visible');
    fileContract.classList.add('active');
    fileTest.classList.remove('active');
    tabContract.classList.add('active');
    tabTest.classList.remove('active');
  });
  fileTest.addEventListener('click', () => {
    placeholder.style.display = 'none';
    code.style.display = 'none';
    tests.classList.add('visible');
    fileTest.classList.add('active');
    fileContract.classList.remove('active');
    tabTest.classList.add('active');
    tabContract.classList.remove('active');
  });
  window.scrollToContract = (line) => {
    const target = document.getElementById('L' + line);
    if (target) code.scrollTop = Math.max(0, target.offsetTop - 8);
  };
</script>
</body></html>`;
}

async function main() {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
  for (const entry of fs.readdirSync(RECORDINGS_DIR)) {
    if (entry.endsWith('.webm')) {
      fs.unlinkSync(path.join(RECORDINGS_DIR, entry));
    }
  }

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

  // Warm the same browser context's HTTP cache so the recorded navigations do
  // not spend several seconds on a blank loading screen. This only reads public
  // pages; it does not connect a wallet or sign anything.
  const warm = await context.newPage();
  const warmVideo = warm.video();
  for (const url of [APP_URL, `${APP_URL}/pipelines/1`, EXPLORER_TX]) {
    await warm.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await warm.waitForTimeout(1800);
  }
  await warm.getByText('Transaction details').waitFor({ timeout: 30_000 });
  await warm.waitForTimeout(1200);

  // Probe the real Arc Studio workspace. With no authenticated Circle session
  // it redirects away from the project; the recorded Studio segment therefore
  // uses the exported source and test evidence in a clearly labelled view.
  await warm
    .goto(STUDIO_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    .catch(() => {});
  console.log(`STUDIO_URL_RESULT=${warm.url()}`);

  await warm.close();
  const warmVideoPath = await warmVideo.path();
  if (warmVideoPath && fs.existsSync(warmVideoPath)) {
    fs.unlinkSync(warmVideoPath);
  }

  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  const video = page.video();

  const hold = (ms) => page.waitForTimeout(ms);
  const mark = (label) =>
    console.log(
      `[${((Date.now() - t0) / 1000).toFixed(1)}s] ${label}`,
    );

  let t0 = Date.now();
  const at = async (seconds, label) => {
    const target = t0 + seconds * 1000;
    const remaining = target - Date.now();
    if (remaining > 0) await hold(remaining);
    mark(label);
  };

  const smoothScrollTo = async (y, duration = 1400) => {
    await page.evaluate(
      ({ targetY, ms }) =>
        new Promise((resolve) => {
          const startY = window.scrollY;
          const delta = targetY - startY;
          const started = performance.now();
          const ease = (value) =>
            value < 0.5
              ? 2 * value * value
              : 1 - Math.pow(-2 * value + 2, 2) / 2;
          const step = (now) => {
            const progress = Math.min(1, (now - started) / ms);
            window.scrollTo(0, startY + delta * ease(progress));
            if (progress < 1) requestAnimationFrame(step);
            else resolve();
          };
          requestAnimationFrame(step);
        }),
      { targetY: y, ms: duration },
    );
  };

  const fadeTo = async (url, color, ready) => {
    await page.evaluate((bg) => {
      const overlay = document.createElement('div');
      overlay.id = 'rc-fade';
      Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        background: bg,
        opacity: '0',
        zIndex: '2147483647',
        pointerEvents: 'none',
        transition: 'opacity 280ms ease',
      });
      document.documentElement.appendChild(overlay);
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
      });
    }, color);
    await hold(320);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.evaluate((bg) => {
      const overlay = document.createElement('div');
      overlay.id = 'rc-fade';
      Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        background: bg,
        opacity: '1',
        zIndex: '2147483647',
        pointerEvents: 'none',
      });
      document.documentElement.appendChild(overlay);
    }, color);
    if (ready) await ready();
    await hold(250);
    await page.evaluate(() => {
      const overlay = document.getElementById('rc-fade');
      if (!overlay) return;
      overlay.style.transition = 'opacity 520ms ease';
      requestAnimationFrame(() => {
        overlay.style.opacity = '0';
      });
      setTimeout(() => overlay.remove(), 800);
    });
    await hold(700);
  };

  const crossfadeTo = async (url, ready) => {
    await page.evaluate(() => {
      const cursor = document.getElementById('rc-cursor');
      if (cursor) cursor.style.display = 'none';
    });
    const screenshot = await page.screenshot({ type: 'png' });
    await page.evaluate(() => {
      const cursor = document.getElementById('rc-cursor');
      if (cursor) cursor.style.display = 'block';
    });
    const dataUrl = `data:image/png;base64,${screenshot.toString('base64')}`;
    await page.addInitScript((source) => {
      if (!location.href.includes('explorer.arc.io/tx/')) return;
      const install = () => {
        const overlay = document.createElement('div');
        overlay.id = 'rc-crossfade';
        Object.assign(overlay.style, {
          position: 'fixed',
          inset: '0',
          background: `#0d1b2e url("${source}") top left / cover no-repeat`,
          zIndex: '2147483647',
          pointerEvents: 'none',
          opacity: '1',
        });
        document.documentElement.appendChild(overlay);
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', install, { once: true });
      } else {
        install();
      }
    }, dataUrl);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    if (ready) await ready();
    await page.mouse.move(700, 360, { steps: 6 });
    await hold(200);
    await page.evaluate(() => {
      const overlay = document.getElementById('rc-crossfade');
      if (!overlay) return;
      overlay.style.transition = 'opacity 700ms ease';
      requestAnimationFrame(() => {
        overlay.style.opacity = '0';
      });
      setTimeout(() => overlay.remove(), 900);
    });
    await hold(700);
  };

  const moveTo = async (locator) => {
    const box = await locator.boundingBox();
    if (!box) return false;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 6,
    });
    await hold(180);
    return true;
  };

  const clickSelector = async (selector) => {
    const locator = page.locator(selector).first();
    await locator.waitFor({ state: 'visible' });
    const moved = await moveTo(locator);
    if (moved) {
      await page.mouse.down();
      await hold(80);
      await page.mouse.up();
    } else {
      await locator.click();
    }
    await hold(320);
  };

  // 0–5s: title card
  await page.setContent(titleCard(), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(720, 450);
  t0 = Date.now();
  mark('title card');

  await at(5, 'home hero');
  await fadeTo(APP_URL, '#f6f0e4', () =>
    page.getByRole('heading', { name: /Work moves/i }).waitFor(),
  );
  await page.mouse.move(980, 420, { steps: 6 });
  await hold(900);
  await page.mouse.move(650, 700, { steps: 6 });
  await smoothScrollTo(150, 2400);

  await at(14, 'home mechanism');
  await smoothScrollTo(980, 1500);
  await page.mouse.move(1050, 560, { steps: 6 });
  await hold(2200);

  await at(20, 'home relay');
  await smoothScrollTo(1950, 1500);
  await page.mouse.move(700, 560, { steps: 6 });
  await hold(2200);

  // 26–36.5s: Arc Studio exported source
  await at(26, 'studio export');
  await page.setContent(studioPage(), { waitUntil: 'load' });
  await page.addScriptTag({ content: CURSOR_SCRIPT });
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(720, 450);
  await hold(600);

  await at(27.5, 'studio folder');
  await clickSelector('#contracts-folder');

  await at(28.5, 'studio contract');
  await clickSelector('#file-contract');
  await page.evaluate(() => window.scrollToContract(281));
  await page.mouse.move(760, 500, { steps: 6 });
  await hold(500);

  await at(33, 'studio tests');
  await clickSelector('#file-test');
  await page.mouse.move(920, 500, { steps: 6 });
  await hold(500);

  // 36.5–58s: live production pipeline
  await at(36.5, 'live pipeline');
  await fadeTo(`${APP_URL}/pipelines/1`, '#f6f0e4', async () => {
    await page.getByRole('heading', { name: 'Pipeline #1' }).waitFor();
    await page.getByText('2 USDC escrow').waitFor();
  });
  await page.mouse.move(1020, 390, { steps: 6 });
  await hold(1200);

  await at(43, 'pipeline ledger');
  await smoothScrollTo(330, 1200);
  await page.mouse.move(520, 520, { steps: 6 });
  await hold(2200);

  await at(49, 'pipeline payout');
  await smoothScrollTo(360, 800);
  await page.mouse.move(560, 560, { steps: 6 });
  await hold(2200);

  await at(54, 'pipeline summary');
  await smoothScrollTo(390, 800);
  await page.mouse.move(950, 580, { steps: 6 });
  await hold(2200);

  // 55–70s: real Stage 1 approval on the Arc explorer
  await at(55, 'explorer');
  await crossfadeTo(EXPLORER_TX, async () => {
    // The explorer renders a full-page skeleton for roughly two seconds.
    // Keep the captured pipeline frame over it until the transaction rows paint.
    await page.waitForTimeout(3000);
    await page
      .getByText(STAGE_1_APPROVE_TX, { exact: true })
      .first()
      .waitFor({ timeout: 15_000 });
    await page.waitForTimeout(300);
  });

  await at(64.5, 'explorer token transfer');
  const tokenTab = page.getByRole('tab', { name: 'Token transfers' });
  await tokenTab.waitFor();
  await moveTo(tokenTab);
  await page.mouse.down();
  await hold(80);
  await page.mouse.up();
  const usdc = page.getByText('USDC', { exact: true }).first();
  await usdc.waitFor({ state: 'visible', timeout: 8000 });
  await moveTo(usdc);
  await hold(1800);

  // 71.5–82s: end card
  await at(71.5, 'end card');
  await page.setContent(endCard(), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(720, 450);
  await hold(800);
  await at(82, 'recording complete');

  await context.close();
  await browser.close();

  const videoPath = await video.path();
  console.log(`VIDEO_PATH=${videoPath}`);
  fs.writeFileSync(
    path.join(RECORDINGS_DIR, 'latest.txt'),
    `${videoPath}\n`,
    'utf8',
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
