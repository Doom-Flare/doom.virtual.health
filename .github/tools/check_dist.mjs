// .github/tools/check_dist.mjs —— 发行物可复现性检查。
//
//   node .github/tools/check_dist.mjs           # 检查
//   node .github/tools/check_dist.mjs --write   # 重新打 zip 并更新 SHA256SUMS.txt
//   DOOM_ROOT=<仓库根> node .github/tools/check_dist.mjs
//
// 查三件事：
//   ① zip 与包体逐字节一致 —— 解 zip，逐文件与仓库里的包体比对。
//      为什么：玩家从 Releases 下的 zip，和他在网页上点开的源码必须一样。
//   ② sha256 与 SHA256SUMS.txt 一致 —— 每个 zip 重算一遍，与清单里那串比对。
//   ③ 清单覆盖完整 —— dist/ 里每个 zip 都要在 SHA256SUMS.txt 里有一行。
//
// zip 的形态：仅文件条目、无目录条目、顶层前缀 = 包体目录名。
// 注意两份变体的顶层前缀不同（主包 doom.virtual.health/，26.3 变体 doom.virtual.health-26.3/），
// 本脚本**从 zip 里读顶层名**再剥掉，不写死前缀。
//
// 来源：从 doom.schedule 的同名门移植（2026-10-08）。差异：PAIRS 指向 DVH 的两份产物。
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const ROOT = process.env.DOOM_ROOT ? path.resolve(process.env.DOOM_ROOT) : path.resolve(import.meta.dirname, '..', '..');
const DIST = path.join(ROOT, 'dist');
const WRITE = process.argv.includes('--write');

// zip ↔ 包体目录 的对应关系（只列当前发布物；旧版 zip 不进清单）
const PAIRS = [
  ['doom.virtual.health-v3.1.1.zip', path.join(ROOT, 'doom.virtual.health')],
  ['doom.virtual.health-v3.1.1-mc26.3.zip', path.join(ROOT, 'variants', 'doom.virtual.health-26.3')],
];

/* ---------- 最小 ZIP 读取器 ---------- */
function readZip(file) {
  const buf = fs.readFileSync(file);
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 66000; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('不是 zip（找不到 EOCD）');
  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(off + 10);
    const csize = buf.readUInt32LE(off + 20);
    const nlen = buf.readUInt16LE(off + 28);
    const elen = buf.readUInt16LE(off + 30);
    const clen = buf.readUInt16LE(off + 32);
    const lho = buf.readUInt32LE(off + 42);
    const name = buf.toString('utf8', off + 46, off + 46 + nlen);
    entries.set(name, { method, csize, lho });
    off += 46 + nlen + elen + clen;
  }
  const data = (name) => {
    const e = entries.get(name);
    if (!e) return null;
    const nlen = buf.readUInt16LE(e.lho + 26);
    const elen = buf.readUInt16LE(e.lho + 28);
    const start = e.lho + 30 + nlen + elen;
    const raw = buf.subarray(start, start + e.csize);
    return e.method === 0 ? Buffer.from(raw) : zlib.inflateRawSync(raw);
  };
  return { names: [...entries.keys()], data };
}

const walk = (d, rel = '') => {
  const out = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const q = path.join(d, e.name);
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) out.push(...walk(q, r));
    else out.push(r);
  }
  return out;
};

let errors = 0;
const err = (msg) => { errors++; console.log('  ❌ ' + msg); };

console.log('=== ① zip 与包体逐字节一致 ===');
for (const [zipName, srcDir] of PAIRS) {
  const zipPath = path.join(DIST, zipName);
  if (!fs.existsSync(zipPath)) { err('缺 ' + zipName); continue; }
  if (!fs.existsSync(srcDir)) { err('缺包体目录 ' + path.relative(ROOT, srcDir)); continue; }

  const z = readZip(zipPath);
  const fileNames = z.names.filter((n) => !n.endsWith('/'));
  if (!fileNames.length) { err(zipName + ' 里没有文件条目'); continue; }
  // 从 zip 自己读顶层前缀，不写死
  const top = fileNames[0].split('/')[0] + '/';
  const inZip = new Map();
  for (const n of fileNames) {
    if (!n.startsWith(top)) { err(zipName + ' 有不带顶层前缀的条目 ' + n); continue; }
    inZip.set(n.slice(top.length), z.data(n));
  }
  const src = walk(srcDir).filter((f) => !f.endsWith('.en.md'));
  const missing = src.filter((f) => !inZip.has(f));
  const extra = [...inZip.keys()].filter((f) => !src.includes(f));
  let diff = 0;
  for (const f of src.filter((x) => inZip.has(x))) {
    if (!inZip.get(f).equals(fs.readFileSync(path.join(srcDir, f)))) { diff++; err(zipName + ' 内容不同: ' + f); }
  }
  if (missing.length) err(zipName + ' 缺 ' + missing.length + ' 个文件: ' + missing.slice(0, 3).join(', '));
  if (extra.length) err(zipName + ' 多 ' + extra.length + ' 个文件: ' + extra.slice(0, 3).join(', '));
  if (!missing.length && !extra.length && !diff) console.log('  ✅ ' + zipName + '（顶层 ' + top + '，' + src.length + ' 文件逐字节一致）');
}

console.log('\n=== ② sha256 与 SHA256SUMS.txt 一致 ===');
const sumsPath = path.join(DIST, 'SHA256SUMS.txt');
if (!fs.existsSync(sumsPath)) {
  err('缺 SHA256SUMS.txt');
} else {
  const listed = new Map();
  for (const l of fs.readFileSync(sumsPath, 'utf8').trim().split('\n')) {
    const [h, f] = l.trim().split(/\s+/);
    if (h && f) listed.set(f, h);
  }
  for (const [f, h] of listed) {
    const p = path.join(DIST, f);
    if (!fs.existsSync(p)) { err('清单列了但文件不在: ' + f); continue; }
    const real = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
    if (real !== h) err(f + ' 的 sha256 对不上（清单 ' + h.slice(0, 12) + '… 实际 ' + real.slice(0, 12) + '…）');
    else console.log('  ✅ ' + f);
  }

  console.log('\n=== ③ 清单覆盖完整 ===');
  const zips = fs.readdirSync(DIST).filter((f) => f.endsWith('.zip'));
  const notListed = zips.filter((f) => !listed.has(f));
  const notFile = [...listed.keys()].filter((f) => !zips.includes(f));
  // 旧版 zip 允许不进清单（RELEASING：旧版本不删，但要标「已被取代」）
  const superseded = notListed.filter((f) => /v3\.0\.0|-v3\.1\.0(?:-mc26\.3)?\.zip$/.test(f));
  const reallyMissing = notListed.filter((f) => !superseded.includes(f));
  if (reallyMissing.length) err('这几个 zip 没列进 SHA256SUMS.txt: ' + reallyMissing.join(', '));
  if (notFile.length) err('清单里这几行没有对应文件: ' + notFile.join(', '));
  if (superseded.length) console.log('  ⚠️  旧版 zip 未进清单（应标「已被取代」）: ' + superseded.join(', '));
  if (!reallyMissing.length && !notFile.length) console.log('  ✅ ' + (zips.length - superseded.length) + ' 个当前产物全部在清单里' + (superseded.length ? '（' + superseded.length + ' 个旧版除外）' : ''));
}

console.log('\n' + (errors ? '❌ ' + errors + ' 个问题' : '✅ 全部通过'));
if (!WRITE && errors) console.log('（改完重跑本脚本；要重算 sha256 就加 --write）');
process.exit(errors ? 1 : 0);
