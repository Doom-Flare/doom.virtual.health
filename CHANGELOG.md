# 变更日志 · doom.virtual.health
English: `CHANGELOG.en.md`

> 口径：只记会影响玩家的改动：改了什么，为什么，能核对什么。
> 版本号规则：`vX.Y.Z`（正式）· `vX.Y.Z-beta.N` / `-rc.N`（预发布）；Minecraft 版本不塞进版本号，
> 它写在 `pack.mcmeta` 与 [`docs/04-兼容与版本.md`](docs/04-兼容与版本.md) 里。
> 目标环境：Minecraft 1.21.5 – 26.3（多版本，按变体分两份下发）。

---

## v3.1.0 · 多版本支持（1.21.5 → 26.3）· 2026-10-05

下载：
- [`dist/doom.virtual.health-v3.1.0.zip`](dist/doom.virtual.health-v3.1.0.zip)：1.21.5 – 26.2（主用）
  · sha256 `cd556d2b946fb4a8c24a37c242c4e0cedf6f9eb3d296614c0ad17af02032145b`
- [`dist/doom.virtual.health-v3.1.0-mc26.3.zip`](dist/doom.virtual.health-v3.1.0-mc26.3.zip)：仅 26.3
  · sha256 `51bcccbc04d4742c689140863c166aa50e13a683c587735f4e4f741344db8816`

> 玩法行为与 v3.0.0 完全一致，63 个 mcfunction 一字未改。
> 这一版改的是能不能装上去。26.3 改了两处会让服务器**直接起不来**的东西。

### 一、多版本支持表（MC 版本 → 用哪份变体）

| MC 版本 | data pack format | 用哪份 | 附魔 JSON `vitality.json` |
|---|---|---|---|
| 1.21.5 | 71 | `v3.1.0`（仓库根 `doom.virtual.health/`） | 原样 |
| 1.21.6 | 80 | 同上 | 原样 |
| 1.21.7 / 1.21.8 | 81 | 同上 | 原样 |
| 1.21.9 / 1.21.10 | 88.0 | 同上 | 原样 |
| 1.21.11 | 94.1 | 同上 | 原样 |
| 26.1 / 26.1.1 / 26.1.2 | 101.1 | 同上 | 原样 |
| 26.2 | 107.1 | 同上 | 原样 |
| 26.3 | 121.0 | `v3.1.0-mc26.3`（仓库 [variants/doom.virtual.health-26.3/](variants/doom.virtual.health-26.3)） | 已按 26.3 schema 修好 |
| 1.21.4 及更低 | ≤ 61 | ❌ 不支持 | — |

为什么必须拆两份：26.3 改了 `enchantment` 注册表的 JSON 形状，
`condition` → `type`、`requirements` 由数组变单体对象。
同一份 JSON 没法同时满足两侧（26.2 及以前要旧的、26.3 只认新的）⇒ 只能拆。
两份的命令层逐字节相同，差异只有 `pack.mcmeta` + `enchantment/vitality.json` 两个文件。

> ⚠️ 旧变体一字未改：`v3.1.0` 主用份的 `vitality.json` 与 v3.0.0
> 逐字节相同（sha256 `38ac2a65…bafe1`），即“不会为 26.3 改坏旧版” ✓

### 二、本轮修了什么（两处硬破坏）

① `enchantment/vitality.json` 的 schema 在 26.3 变了，会让服务器**直接起不来** ✗✗

```
[Worker-Main-18/ERROR]: Registry loading errors:
> Errors in registry minecraft:enchantment:
>> Errors in element doom.virtual.health:vitality:
Failed to parse doom.virtual.health:vitality from pack file/doom.virtual.health
Caused by: Not a JSON object: [{"condition":"minecraft:entity_properties",...}]
[main/WARN]: Failed to load datapacks, can't proceed with server load.
```
⇒ 这不是“功能静默失效”，是整个服务器拒绝启动 ✗。

两处 schema 变更（对照 26.3 原版 `data/minecraft/enchantment/bane_of_arthropods.json` 逐字段核对）：
1. `requirements` 由「数组」变「单体对象」：`[{...}]` → `{...}`
2. 谓词判别键改名：`"condition"` → `"type"`

> 变更点精确定位在 `26.2 → 26.3` 那一步（不是“26.x 全线”）：
> 对 12 个版本的原版附魔 JSON 统计 `"condition"` 出现次数 ⇒
> `56,56,56,56,55,55,60,65,65,65,**65**,**0**`。26.2 仍有 65 ✓，26.3 归零 ✗。

> 🔴 这一类叫「宽松 → 收紧」型破坏：`requirements` 在原版 12/12 版本全部是单体 ✓
> ⇒ 本包原来的 `[{...}]` 数组写法从来就不合规，只因旧版解码器“宽松接受”才一直没炸。
> 教训：原版任何版本都没有先例的写法，都是定时炸弹。

② `pack.mcmeta` 缺 `min_format`/`max_format`：1.21.9 起直接拒收：
```
Couldn't load file/doom.virtual.health pack metadata:
  Pack declares support for version newer than 81, but is missing mandatory fields min_format and max_format
```
③ 顺带收紧下限：源包声明 `supported_formats 48–82`，但代码用了 1.21.5 才引入的 `equipment:{}`
⇒ 自称下限 48 是错的 ✗ ⇒ 本次收紧到 71（= 1.21.5），与真实能力对齐。

④ 26.3 上 `supported_formats` 是「禁止」而非「可选」：
```
Pack key supported_formats is deprecated starting from pack format 82.
Remove supported_formats from your pack.mcmeta.
```
⇒ 边界是“声明范围触及 82+”就触发 ⇒ 26.3 那份改成纯新式（只留 `min_format`/`max_format`）。
改后复跑：deprecation 警告 0 条 ✓。

### 三、真机验收证据

三台实测，各 12/12 断言全过，8 类加载错误全 0：

| 版本 | Java | 变体 | 8 类门槛 | 汇总行 | 判定 |
|---|---|---|---|---|---|
| 1.21.5 | 21 | `v3.1.0`（legacy 形态） | 全 0 ✓ | `pass=12 fail=0 total=12` | ✅ ALL PASS |
| 1.21.10 | 21 | `v3.1.0`（legacy 形态） | 全 0 ✓ | `pass=12 fail=0 total=12` | ✅ ALL PASS |
| 26.3 | 25 | `v3.1.0-mc26.3` | 全 0 ✓ | `pass=12 fail=0 total=12` | ✅ ALL PASS |

26.3 关键对照（证明 schema 修复真的有效）：

| 时机 | 现象 |
|---|---|
| 修复前 | ✗ `Failed to load datapacks, can't proceed with server load.` ⇒ 服务器根本起不来 |
| 修复后 | ✅ 0 条 `Registry loading errors` · 服务器正常 `Done` · 套件 12/12 |

12 条断言覆盖：常量/目标/`attribute max_health` 读回 1024 / `Health*2200==1126400` /
真实伤害端到端 / `equipment.saddle` 组件路径 / bossbar 同步 / `out_of_world` 硬杀 /
UUID hex 伤害真的杀死实体 / 4 个外部 API 签名可调。

### 四、能核对什么

- `dist/doom.virtual.health-v3.1.0.zip` 内 92 个条目与仓库 [`doom.virtual.health/`](doom.virtual.health) 下同名文件逐字节相同（0 差异）。
- `dist/doom.virtual.health-v3.1.0-mc26.3.zip` 内 92 个条目与仓库 [`variants/doom.virtual.health-26.3/`](variants/doom.virtual.health-26.3) 下同名文件逐字节相同（0 差异）。
- 主用份与 v3.0.0 相比，只有 `pack.mcmeta` 一个文件不同（其余 90 个逐字节相同），
  命令层零改动，对外契约（`dvh.health` / `dvh.max_health` / `dvh.temp` 目标、
  `doom.vh:const.hex_chars` storage、4 个 API 函数签名与 `add_health` 的 `{points}` 宏参数）一字未改 ✓。

---

## v3.0.0 · 首次附上真实产物 + 仓库形态改成玩家向 · 2026-09-30

下载：[`dist/doom.virtual.health-v3.0.0.zip`](dist/doom.virtual.health-v3.0.0.zip) · sha256 `d271d11b12752493c74bf2875146e84c106f261c4e3c2166a1e5a479cf47be93`

### 一、版本号对应关系（先看这一段）

- `v3.0`（2026-08-05 的标签）保留不动，但它从未附带任何产物，只有标签，没有 zip。
  它的 Release 页已标注「⚠️ 已被 v3.0.0 取代」，免得玩家以为附件丢了。
- `v3.0.0` 是本版本线的规范三位版号，也是第一个真正能下载的产物。
  两者是同一个版本，没有功能差别。
- 按 SPEC 的版本号规则，这次的改动属于 PATCH 级（不新增能力、玩家不需要动手改任何东西）。

### 二、仓库形态改成玩家向（只影响仓库，不影响玩法）

- 顶层重排为 README.md · LICENSE · CHANGELOG.md · dist/ · docs/ · doom.virtual.health/ · .github/：
  第一屏直接回答“这是什么 / 下哪个 / 怎么装 / 源码在哪”，并留了首屏效果图位（见 [`docs/图-首屏效果位.md`](docs/图-首屏效果位.md)）。
- 新增 `dist/`（成品 zip + `SHA256SUMS.txt`）、`CHANGELOG.md`（本文件）、`.github/ISSUE_TEMPLATE/`（bug / 功能建议两张表单）、
  `.gitignore` 与 `.gitattributes`（`* -text`，锁住字节不被换行改写）。
- 新增 `docs/` 玩家手册五页：安装 · 用法与 API · 配置 · 兼容与版本 · 致谢与许可。
- 文档站保留并继续服务：`docs/index.html` 与 `docs/.nojekyll` 原样留在 `docs/`，
  GitHub Pages 仍然从 `docs/` 发布 → <https://doomdecapitator.github.io/doom.virtual.health/>。
  页内版本标识从 `v3.0` 更新为 `v3.0.0`，其余内容未动。
- 数据包本体本来就在顶层 `doom.virtual.health/`，位置不变，每个 mcfunction 都能直接点开读。

### 三、包体同步（本轮唯一的包内字节变化）

GitHub 上的包体停在 2026-08-05（`v3.0` 那次合并），工作区那一份在 2026-09-27 又被改过一处。
本版把工作区最新那一份原样搬了过来（91 个文件）。相对库内旧版只有 3 处差异，没有一处改变游戏内行为：

- `mcdoc/doom.virtual.health.mcdoc`：1496 B → 2628 B。把 `[string]: any` 这个“什么都收”的兜底换成显式键名
  （`with` / `uid0..3` / `uid_hex` / `on_death` / `state` / `_` / `trigger` / `b0..bf` / `h0..hf`），
  并补上中文说明。效果：写 `data modify storage doom.vh:ctx ...` 时拼错键名当场报警，而不是静默新建一个没人读的槽位。
  槽位清单与包内 `internal/uuid_hex`、`api/apply_trigger` 实际使用的键逐个对齐（这是它比旧版更有用的原因）。
- `pack.mcmeta`：`supported_formats` 从单行写成多行。值一字未变（`min_inclusive: 48` · `max_inclusive: 82`），
  连描述串 `§cDVH v3.0 §7+ §9DBB` 也照旧（同版本，不是旧包）。
- `data/doom.virtual.health/function/__unload__.mcfunction`：去掉行首的 UTF-8 BOM。
  旧版这个文件开头有 3 个字节 `EF BB BF`，其它 90 个文件都没有；去掉后与全包一致，
  也避免某些工具/加载路径把 BOM 当成第一条命令的一部分。

> 说明：`mcdoc` 与 BOM 这两处是包内字节变化，所以本版必须发版（而不是“只改文档”），这条正是发布规范第 3 条。

### 四、能核对什么（数字都可以自己复算）

- 包体 91 个文件（63 个 `.mcfunction` + 24 个 `.json` + 3 个 `.mcdoc` + `pack.mcmeta`），
  与工作区最新那份逐字节相同（0 差异）。
- `dist/doom.virtual.health-v3.0.0.zip` 内 91 个条目与仓库 [`doom.virtual.health/`](doom.virtual.health) 下同名文件逐字节相同（0 差异）。
- `dist/SHA256SUMS.txt`、Release 附件 digest、本文件顶上那一串，三处同一个值。
- 仓库顶层只含白名单条目；泄漏扫描 0 命中（口径见 [`docs/README.md`](docs/README.md)）。
- 本版未做真机加载验证（本轮只动仓库形态与版本号，没碰运行逻辑）；上一轮的真机结论仍是 v3.0 那一轮的。

---

## v3.0 · 2026-08-05（标签保留 · 无产物）

- 合并“DVH v3.0 unified”：实体级百分比阈值 `dvh.pp` / `dvh.pp_max`、`auto_create` 宏、
  `pack_format` 升到 81（1.21.7 / 1.21.8）、`damage_mult` 补上限保护（H7）。
- 同日的两次提交补齐文档：完整 API 参考、`on_death` 章节、vitality 与 predicate 说明；修掉 `auto_init` 对 double 的处理
  （改用 `data get`，兼容 double / int / string），并补上“已知 Edge Cases”章节。
- 这个标签没有附带 zip。想用这一版请下载 [`v3.0.0`](https://github.com/DoomDecapitator/doom.virtual.health/releases/tag/v3.0.0)。

## v2.x 及更早

早期版本（v1.1 / v2.1 / v3.0 三个内测打包）只在本地工作区里流转，GitHub 上没有对应的产物，也不再维护。当前包内的 API 已经从那些版本演化过若干轮，
不建议再从旧目录取包，以本仓库的 `dist/` 为准。
