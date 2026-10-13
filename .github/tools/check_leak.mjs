// .github/tools/check_leak.mjs —— 泄漏守门 + 仓库顶层结构守门。
//
//   node .github/tools/check_leak.mjs                       # 扫仓库根（默认 <本文件>/../..）
//   DOOM_GIT=<git 完整路径> node .github/tools/check_leak.mjs   # 本机 git 不在 PATH 时
//   DOOM_ROOT=<仓库根> node .github/tools/check_leak.mjs        # 检查另一个克隆
//   DOOM_TOP=off node .github/tools/check_leak.mjs              # 只做泄漏扫描，跳过顶层结构
//
// 两条守门：
//   ① 泄漏扫描：不得出现本机绝对路径、开发物标识、第三方素材标识。
//      为什么：玩家向仓库里出现 `C:\Users\...` 或某次实验的夹具名，等于把开发机的断面直接公开。
//   ② 顶层白名单：仓库顶层只允许下面 ALLOW 里列的那几项。
//      为什么：曾有过顶层误建垃圾文件的事故，一次 `git add -A` 就混进仓库。从此顶层结构也过门。
//
//   顶层允许：README.md · LICENSE · CHANGELOG.md · .gitignore · .gitattributes
//            · dist/ · docs/ · .github/ · doom.virtual.health/ · variants/
//   未跟踪但躺在工作目录里的可疑条目：只警告（下一次 `git add -A` 就会被带进仓库）。
//
// 来源：从 doom.schedule 的同名门移植（2026-10-08），差异仅 ALLOW 与 PACK 两项。
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const GIT = process.env.DOOM_GIT || 'git';
const ROOT = process.env.DOOM_ROOT ? path.resolve(process.env.DOOM_ROOT) : path.resolve(import.meta.dirname, '..', '..');

// ① 泄漏模式
const IDS = [
  /[A-Za-z]:[\\/]Users[\\/]/i,            // 本机绝对路径（Windows）
  /\/c\/Users\//i,                        // 本机绝对路径（Git Bash 形态）
  /Downloads[\\/]datapack/i,              // 本机工作区名
  /_work[\\/](mcserver|ports)/i,          // 本机测试台路径
  /_run_schedule\.mjs/i,                  // 真机验收脚本（在 _work/ports，不进玩家向仓库）
  /_matrix_lib\.mjs/i,                    // 验收套件依赖
  /mineflayer/i,                          // 测试台依赖
  /doom\.virtual\.health-multi/i,         // 多版本构建目录（开发物）
  /spyglass-probe/i,                      // 本机探针目录
  /opencode/i,                            // 另一个工作区名
  /thirdparty-rig/i,                      // 实验用第三方 rig 素材标识
  /\brigns\d*/i,
  /\bbdengine\b/i,
  /All-Rights-Reserved/i,                 // 第三方许可标识（本项目用的是 MIT）
];
// 本文件与 CI 工作流里会复述上面的正则 / 路径模式（为说明「门在防什么」）⇒ 这些行豁免。
// ⚠️ 2026-10-08 实测踩过：static.yml 的注释里写了 `_work/ports`，被本门当成真泄漏、
//    CI 直接红（本地当时还没写 yml，所以没暴露）。
//
// 豁免粒度是【行】而不是【文件】：只放过注释行（`#` / `//` 开头）。
// 这样 workflow 的 YAML 正文（run: 那几行、env 值）仍然全查 —— 那里出现真路径就是要拦。
const SELF = ['.github/tools/check_leak.mjs'];
const isCommentLine = (line) => /^\s*(#|\/\/)/.test(line);

const ALLOW = new Set(['README.md', 'LICENSE', 'CHANGELOG.md', '.gitignore', '.gitattributes',
  'dist', 'docs', '.github', 'doom.virtual.health', 'variants',
  // 英文译本（与中文并列，不进发行包）
  'README.en.md', 'CHANGELOG.en.md']);

const git = (args) => execFileSync(GIT, args, { cwd: ROOT, encoding: 'utf8' });
const walk = (d, out = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
};

let failed = 0;

// ---- 拿 git 已跟踪文件（这是"真正会公开"的集合）----
let tracked = [];
try {
  tracked = git(['ls-files']).split('\n').map((s) => s.trim()).filter(Boolean);
} catch (e) {
  console.error('❌ 取 git 已跟踪文件失败（DOOM_GIT 设对了吗？）：' + String(e.message).slice(0, 120));
  process.exit(2);
}

console.log('仓库根：' + ROOT);

// ---- ① 泄漏扫描 ----
// 逐行扫，注释行豁免（见 SELF 处的说明）。非注释行照旧全查。
const leaks = [];
for (const rel of tracked) {
  if (SELF.includes(rel)) continue;
  let t;
  try { t = fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { continue; }
  const lines = t.split(/\r?\n/);
  for (const [i, line] of lines.entries()) {
    if (isCommentLine(line)) continue;
    for (const re of IDS) {
      const m = line.match(re);
      if (m) leaks.push('   ' + rel + ':' + (i + 1) + ' :: ' + re.source.slice(0, 46) + '  命中「' + m[0].slice(0, 40) + '」');
    }
  }
}
if (leaks.length) {
  console.log('❌ 泄漏检查：' + leaks.length + ' 处');
  leaks.slice(0, 20).forEach((l) => console.log(l));
  failed++;
} else {
  console.log('✅ 泄漏检查：0 处（' + tracked.length + ' 个已跟踪文件的非注释行里无本机绝对路径 / 无开发物标识）');
}

// ---- ② 顶层结构 ----
if (process.env.DOOM_TOP !== 'off') {
  const top = new Set(fs.readdirSync(ROOT).filter((n) => n !== '.git'));
  const trackedTop = new Set(tracked.map((r) => r.split('/')[0]));
  const dirty = [...top].filter((t) => !ALLOW.has(t) && trackedTop.has(t)).sort();   // 已提交且违规 ⇒ 报错
  const stray = [...top].filter((t) => !ALLOW.has(t) && !trackedTop.has(t)).sort();  // 未跟踪 ⇒ 只警告

  if (dirty.length) {
    console.log('❌ 顶层结构：' + dirty.length + ' 个**已提交**的顶级条目不在白名单里');
    dirty.forEach((d) => console.log('   ' + d));
    console.log('   白名单：' + [...ALLOW].sort().join(' / '));
    failed++;
  } else {
    console.log('✅ 顶层结构：' + [...top].filter((t) => ALLOW.has(t)).length
      + ' 个顶级条目全在白名单内（扫描 ' + tracked.length + ' 个已跟踪文件）');
  }
  if (stray.length) {
    console.log('⚠️  未跟踪的可疑顶层条目（下一次 git add -A 会带进仓库）：' + stray.join(' / '));
  }
}

console.log('结论：' + (failed ? 'FAIL（' + failed + ' 项）' : 'PASS'));
process.exit(failed ? 1 : 0);
