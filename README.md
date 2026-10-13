# doom.virtual.health — 虚拟血量系统 + Bossbar 血条（数据包）
English: `README.en.md`

[![最新版本](https://img.shields.io/github/v/release/DoomDecapitator/doom.virtual.health?label=%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC)](https://github.com/DoomDecapitator/doom.virtual.health/releases)
[![Minecraft](https://img.shields.io/badge/Minecraft-1.21.5%20%E2%80%93%2026.3-3C8527)](docs/04-兼容与版本.md)
[![许可](https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF-MIT-97ca00)](LICENSE)

<!-- 首屏效果图位（还没放图）：按 docs/图-首屏效果位.md 的说明截一张“一只怪顶着血条、血量不是原版那 20 点”的图，
     存成 docs/assets/首屏效果.png，然后把下面这行的注释去掉。在那之前不要留半张破图。 -->
<!-- <p align="center"><img src="docs/assets/首屏效果.png" width="720" alt="doom.virtual.health 在存档里跑起来的样子"></p> -->

用纯数据包给实体注入一套独立于原版血量的虚拟血量。

血量以 0.001 HP（mHP）为单位，上限可以开到 95325 HP，自动映射到 Bossbar 血条。配套能力有 `auto_init`（`/summon` 直接带 NBT）、非侵入 tick 伤害检测、死亡回调 `on_death`、百分比血量判定、无敌控制、伤害倍率、按比例回血。零 Mod，零外部依赖。

## 下载哪个

| 你的 MC 版本 | 下这个 |
|---|---|
| 1.21.5 – 26.2 | `dist/doom.virtual.health-v3.1.0.zip` |
| 26.3 | `dist/doom.virtual.health-v3.1.0-mc26.3.zip` |

见下面「MC 版本 → 用哪份变体」。

## 安装

1. 解压 zip，得到一个 `doom.virtual.health/` 文件夹
2. 整个文件夹放进 `saves/<你的存档>/datapacks/`。服务器放 `world/datapacks/`
3. 进游戏跑 `/reload`

下载后建议先对一下校验值，见「校验下载的文件」。

图文站点在 <https://doomdecapitator.github.io/doom.virtual.health/>，就是仓库里的 `docs/index.html`，随本仓库一起发布，不另存一份。

## 源码在哪

这个包没有生成器。源码就是 [`doom.virtual.health/`](doom.virtual.health) 里那 63 个 mcfunction 本体，点开就能逐个读。zip 里的文件与它逐字节相同。

## 当前状态

**v3.1.0 正式发布（Latest）**，支持 Minecraft 1.21.5 到 26.3。

玩法行为与 v3.0.0 完全一致（63 个 mcfunction 一字未改）。这一版改的是能不能装上去：26.3 改了 `enchantment` 注册表的 JSON 形状，旧写法会让服务器直接起不来，已修好并真机复验。

三台实测全绿：1.21.5 / 1.21.10 / 26.3 各 12/12 断言通过，8 类加载错误全 0。

包内的 `pack.mcmeta` 描述串仍写着「DVH v3.0」，那是同一个版本，不是旧包。

可以装进存档玩，但请先备份存档。

---

## 30 秒：下载 → 装 → 看它跑起来

| 步 | 做什么 |
|---|---|
| ① | 下载 [`dist/doom.virtual.health-v3.1.0.zip`](dist/doom.virtual.health-v3.1.0.zip)（1.21.5–26.2）或 [`dist/doom.virtual.health-v3.1.0-mc26.3.zip`](dist/doom.virtual.health-v3.1.0-mc26.3.zip)（26.3），顺手对一下 [SHA256SUMS.txt](dist/SHA256SUMS.txt) |
| ② | 解压，把 `doom.virtual.health/` 整个放进 `<存档>/datapacks/`；服务器放 `world/datapacks/` |
| ③ | 进世界 `/reload`，然后 `/function doom.virtual.health:__help__` 看聊天栏里的命令清单 |

再召唤一只有虚拟血量的僵尸（`auto_init`，第一 tick 自动初始化）：

```
/summon minecraft:zombie ~ ~ ~ {data:{dvh:{max_health:40d, health:40d}}, NoAI:1b}
```

它脚下会立刻多出一条血量条（`doom.bossbar` 命名空间跟着包一起装），打它掉的是虚拟血量，不是原版那 20 点。

没反应就按顺序查这三样：`pack.mcmeta` 是不是正好在 `datapacks/doom.virtual.health/pack.mcmeta`（多套一层就不加载）
→ `logs/latest.log` 里有没有 `Failed to load function` → 有没有 `/reload`。

要卸载：先 `/function doom.virtual.health:__unload__` 把所有虚拟血量实体摘干净，再删掉 `datapacks/doom.virtual.health/` → `/reload`。
细一点的安装步骤（含“包放哪儿、服务器怎么放、版本不符怎么判”）见 [`docs/01-安装.md`](docs/01-安装.md)。

## 校验下载的文件（一行）

`dist/SHA256SUMS.txt` 里是 zip 的 sha256。在 zip 所在的目录里跑：

```
Linux / macOS:        sha256sum -c SHA256SUMS.txt
Windows PowerShell:   (Get-FileHash .\doom.virtual.health-v3.1.0.zip -Algorithm SHA256).Hash
```

输出 `OK`（或哈希与 `SHA256SUMS.txt` 里那一串相等）就是完整下载；不等就别用，重新下。当前值：

| 文件 | sha256 |
|---|---|
| `doom.virtual.health-v3.1.0.zip`（1.21.5–26.2） | `cd556d2b946fb4a8c24a37c242c4e0cedf6f9eb3d296614c0ad17af02032145b` |
| `doom.virtual.health-v3.1.0-mc26.3.zip`（仅 26.3） | `51bcccbc04d4742c689140863c166aa50e13a683c587735f4e4f741344db8816` |

这个值不是手抄的。`tools/build_dist.py` 打完 zip 会回读每一个条目，与仓库 [`doom.virtual.health/`](doom.virtual.health) 下的同名文件逐字节比，不一致就报错退出。`tools/verify.py` 再把 `SHA256SUMS.txt`、zip、包体三方对一遍。你重新打包得到的 hash 应当与上表完全相同。

## 我该下载哪个

| 文件 | 里面是什么 | 适合谁 |
|---|---|---|
| `dist/doom.virtual.health-v3.1.0.zip`（1.21.5 – 26.2） | 完整的 `doom.virtual.health/` 数据包：92 个文件（64 个 `.mcfunction` + 24 个 `.json` + 3 个 `.mcdoc` + `pack.mcmeta` + 包内 README），含两个命名空间，`doom.virtual.health`（虚拟血量核心）与 `doom.bossbar`（血条联动，可选，不接也不影响本体） | 1.21.5 – 26.2，绝大多数人下这个 |
| `dist/doom.virtual.health-v3.1.0-mc26.3.zip`（仅 26.3） | 同一套命令，附魔 JSON 按 26.3 新 schema 修好（`condition`→`type`、`requirements` 数组→单体） | 只在 26.3 上用。26.3 上装上面那份会**让服务器起不来** ✗ |

## 它给你什么（核心特性）

| 能力 | 一句话 |
|---|---|
| 独立虚拟血量 | 实体持有 `dvh.health` / `dvh.max_health`（mHP，0.001 HP 精度），与原版血量完全解耦 |
| auto_init | `/summon ... {data:{dvh:{...}}}` 直接带 NBT，第一 tick 自动完成注册 + 触发器分配 |
| tick 伤害检测 | 拿原版 Health（复位到 `512f`）当探针，22 倍采样，把原版伤害/治疗精准换算进虚拟血量 |
| 死亡回调 `on_death` | 血量归零时执行任意命令串（`say` / `function` / `summon` / `playsound` …） |
| 正确的击杀归属 | UUID（4×int）→ hex 字符串 → `damage ... by <uuid>`，击杀 credit 归真正的攻击者 |
| 百分比判定 | 实体级阈值 `dvh.pp` / `dvh.pp_max` + 7 个 predicate 函数（below / above / between × percentage / hp） |
| 无敌与倍率 | `set_invulnerable` 一键免伤；`set_damage_mult` 可把伤害压到 0.1% 或放大到 10000% |
| 精度补偿 | `dvh.rem_damage` / `dvh.rem_heal` 把余数进位，长期累计不丢精度 |
| 统计追踪 | 累计伤害 / 治疗 / 玩家伤害，可导出到任意计分板 |
| Bossbar 血条 | `doom.bossbar` 自动同步虚拟血量，支持自定义名称/颜色/样式/可见玩家、死亡后保留血条 |
| vitality 附魔触发器 | 用附魔 tick 驱动装备加成同步（`attribute_modifiers` → `dvh.max_health`），替代命令轮询 |
| mcdoc 补全 | 3 个 mcdoc 文件，装了 Spyglass + mcdoc 插件后写 storage / `data:{dvh:{` 有补全与拼写检查 |

## MC 版本 → 用哪份变体

| MC 版本 | data format | 用哪份 | 附魔 JSON | 实测 |
|---|---|---|---|---|
| 1.21.5 | 71 | `v3.1.0` | 原样 | 12/12 实测 |
| 1.21.6 | 80 | `v3.1.0` | 原样 | 未单独实测，按同区间外推 |
| 1.21.7 / 1.21.8 | 81 | `v3.1.0` | 原样 | 未单独实测，按同区间外推 |
| 1.21.9 / 1.21.10 | 88.0 | `v3.1.0` | 原样 | 12/12 实测（1.21.10） |
| 1.21.11 | 94.1 | `v3.1.0` | 原样 | 未单独实测，按同区间外推 |
| 26.1 / 26.1.1 / 26.1.2 | 101.1 | `v3.1.0` | 原样 | 未单独实测，按同区间外推 |
| 26.2 | 107.1 | `v3.1.0` | 原样 | 未单独实测，按同区间外推 |
| 26.3 | 121.0 | `v3.1.0-mc26.3` | 已按 26.3 schema 修好 | 12/12 实测 |
| 1.21.4 及更低 | ≤ 61 | 不支持 | — | — |

为什么必须拆两份：26.3 把 `enchantment` 注册表的 JSON 形状改了
（`condition` → `type`、`requirements` 由数组变单体对象），
同一份 JSON 无法同时满足两侧。命令层两份逐字节相同，差异只有
`pack.mcmeta` + `enchantment/vitality.json` 两个文件。

> ⚠️ **在 26.3 上装 `v3.1.0`（那份给 1.21.5–26.2 的）会让服务器直接起不来**。
> 报 `Registry loading errors: doom.virtual.health:vitality`。
> 26.3 请用 `v3.1.0-mc26.3`。

| 其他 | 能不能用 |
|---|---|
| 单人存档 / 服务器 | 都行；服务器用 `world/datapacks/` |
| 实验性玩法 | 不需要开任何实验性玩法 |

完整的版本矩阵、升级/降级与“改哪些文件要重启服务器”见 [`docs/04-兼容与版本.md`](docs/04-兼容与版本.md)。
版本号规则（`vX.Y.Z`、什么时候升哪一位）也写在那一页。

## 快速开始

### 方式一：auto_init（推荐）

```
/summon minecraft:zombie ~ ~ ~ {data:{dvh:{max_health:40d, health:40d}}, NoAI:1b}
```

### 方式二：api/create（传统方式，对任意实体）

```
/execute as @n run function doom.virtual.health:api/create {with:{max_health:21.5, health:20}}
```

### 绑定 Bossbar（可选）

```
/execute as @e[tag=virtual_health_entity] run function doom.bossbar:api/create {with:{name:'"Boss"',color:red,style:progress,visible:"true",targets:"@a"}}
```

### 扣血 / 加血 / 无敌 / 倍率

```
/execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/add_health {points:-500}
/execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/add_health_pct {pct:-25}
/execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/set_invulnerable {state:1b}
/execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/set_damage_mult {mult:200}
```

## 伤害与治疗机制

```
Health = 512f（原版探针，每 tick 复位）
  · 受到攻击 → Health 下降
  · Tick 采样: temp = Health × 2200, 对比 baseline = 512 × 2200
  · delta = baseline - temp
  · delta × dvh.damage_mult / 2200 → mHP（×1000 标度）
  · dvh.health -= mHP
  · dvh.rem_damage += 余数（下次进位，防精度丢失）
  · Health 复位 512f
  · dvh.health ≤ 0 → trigger_death

dvh.damage_mult 默认 1000 = 100% 伤害
  mult=200  → 20% 伤害
  mult=500  → 50% 伤害
  mult=2000 → 200% 伤害（易伤）
```

精度：0.001 HP（mHP）。余数补偿保证长期累计不丢失。

---

## API 参考

### doom.virtual.health

所有 API 都以 `@s` 为虚拟血量实体执行，非 VH 实体 `return fail`。

| 函数 | 参数 | 说明 |
| ---- | ---- | ---- |
| `api/create` | `{with:{max_health, health, on_death?}}` | 注册虚拟血量（重复调用 return fail） |
| `api/remove` | `{with:{kill:1b/0b}}` | 移除虚拟血量；`kill:1b` 同时杀死实体（默认 1b） |
| `api/add_health` | `{points:int}` | 加减血量，正=治疗/负=伤害 |
| `api/add_health_pct` | `{pct:int}` | 按最大血量百分比加减（±100 范围） |
| `api/set_health` | `{health:int}` | 强制设定血量（HP 单位，≤0 触发死亡） |
| `api/set_health_pct` | `{pct:int}` | 按最大血量百分比设定（[0,100]） |
| `api/set_max_health` | `{max_health:int}` | 设定最大血量（HP 单位，下限 1000 mHP = 1 HP） |
| `api/add_max_health` | `{points:int}` | 增加最大血量（HP 单位，下限 1 HP） |
| `api/add_max_health_pct` | `{pct:int}` | 按最大血量百分比增加 |
| `api/get_health` | (无，store result) | 当前血量（HP，÷1000） |
| `api/get_health_mhp` | (无，store result) | 当前血量（mHP 原始值） |
| `api/get_max_health` | (无，store result) | 最大血量（HP） |
| `api/get_max_health_mhp` | (无，store result) | 最大血量（mHP） |
| `api/get_percentage` | (无，store result) | 当前血量百分比 [0,100] |
| `api/get_total_damage` | (无，store result) | 累计受伤 (mHP) |
| `api/get_total_healing` | (无，store result) | 累计治疗 (mHP) |
| `api/get_player_damage` | (无，store result) | 玩家造成的累计伤害 (mHP) |
| `api/get_stats` | `{damage_out, healing_out, scale}` | 将累计统计写入两个计分板并除以 scale |
| `api/set_invulnerable` | `{state:1b/0b}` | 设置无敌状态（无敌时免伤） |
| `api/set_damage_mult` | `{mult:int}` | 设置伤害倍率（×1000，范围 [1, 100000]） |
| `api/apply_trigger` | (无) | 按实体类型分配 vitality 附魔触发器槽位 |
| `api/debug` | (无) | 打印调试信息到聊天栏 |
| `debug` | (无) | 打印详细调试信息（含 bossbar / on_death） |
| `dvhentity` | `{target}` | 向指定玩家打印实体状态（`{target:"@s"}`） |

单位说明：`points` / `health` / `max_health` 均为 HP 单位（内部自动 ×1000 转 mHP，支持小数如 `points:-0.5`）。mHP 版本 API 直接返回原始毫值。

### doom.bossbar

| 函数 | 参数 | 说明 |
| ---- | ---- | ---- |
| `api/create` | `{with:{...}}` | 创建血条（重复调用 return fail） |
| `api/remove` | (无) | 移除血条 |
| `api/sync_dvh` | (无) | 手动同步血量到 Bossbar（tick 自动调用） |

`api/create` 参数：

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------ | ---- |
| `id` | string | 自动生成 | Bossbar 标识 |
| `name` | string (JSON) | `"Boss"` | 血条显示文本（JSON 字符串） |
| `color` | string | `"white"` | 颜色 |
| `style` | string | `"progress"` | 样式 |
| `visible` | string | `"true"` | 可见性 |
| `targets` | string | `"@a"` | 可见玩家选择器 |
| `persist` | bool | `false` | 实体死亡后是否保留血条 |

persist 说明：`persist:1b` 时实体失去 VH 标签后血条不自动删除（用于延迟清理或跨重生保留）。

### predicate 判定

predicate 类函数 `return 1` 表示条件成立。需要预先设置 `@s dvh.pp` / `@s dvh.pp_max` 计分板（实体级阈值，[0,100]）。

| 函数 | 判定条件 |
| ---- | ---- |
| `predicate/is_invulnerable` | 实体处于无敌状态 |
| `predicate/below_percentage` | 血量百分比 < `@s dvh.pp` |
| `predicate/above_percentage` | 血量百分比 > `@s dvh.pp` |
| `predicate/between_percentage` | 血量在 `@s dvh.pp` ~ `@s dvh.pp_max` 之间 |
| `predicate/below_hp` | 血量 < `#dvh.hp_threshold`（HP 单位，伪全局） |
| `predicate/above_hp` | 血量 > `#dvh.hp_threshold` |
| `predicate/between_hp` | 血量在 `#dvh.hp_threshold_low` ~ `#dvh.hp_threshold_high` 之间 |

用法示例（配合 `execute if`）：

```
# 血量低于 30% 时触发
scoreboard players set @e[tag=virtual_health_entity] dvh.pp 30
execute as @e[tag=virtual_health_entity] if function doom.virtual.health:api/predicate/below_percentage run say low HP!
```

---

## 死亡回调 on_death

触发时机：`dvh.health` 降至 0（`trigger_death`）时执行。

用法：`on_death` 是任意命令字符串，以 VH 实体位置执行：

```
/execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/create {with:{max_health:100, health:100, on_death:"say I died"}}
```

或 auto_init 时：

```
/summon minecraft:zombie ~ ~ ~ {data:{dvh:{max_health:100d, health:100d, on_death:"function mypack:boss_death"}}, NoAI:1b}
```

执行语义：

- 等价于 `execute at @s run <on_death 命令>`，`@s` 是 VH 实体
- 因此不要写 `@s[tag=virtual_health_entity]`（该选择器在回调执行时已失效），直接写 `@s`
- 回调执行后实体被 `damage out_of_world` 杀死（若未指定归属则直接伤害）
- 如果 `on_death` 为空字符串，视为无回调，直接进入死亡流程
- 死亡归属：指定 `on_death` 时跳过 UUID 追踪（`trigger_death` 分支），否则追踪 `last_hurt_by_mob` 并生成 `damage ... by <uuid>` 击杀 credit

常见写法：

```
on_death: "say A VH entity has died"
on_death: "function mypack:boss_killed"
on_death: "playsound minecraft:entity.wither.death master @a ~ ~ ~ 1 1"
on_death: "summon minecraft:item ~ ~ ~ {Item:{id:"minecraft:diamond",Count:1b}}"
```

## auto_init 自动初始化

`/summon` 时实体携带 `data:{dvh:{...}}`，第一 tick 自动完成 create + apply_trigger：

```
/summon minecraft:zombie ~ ~ ~ {data:{dvh:{max_health:"2000", health:"2000"}}, NoAI:1b}
```

- 支持字段：`max_health` / `health` / `on_death`
- 值可以是数字（double）或字符串（如 `"2000"`，mcdoc 补全用）
- 自动补全：Spyglass + mcdoc 插件会在 `data:{dvh:{` 处提示
- auto_init 后自动执行 `apply_trigger`（分配 vitality 触发器）

## vitality 附魔触发器

目的：vitality 附魔挂在实体装备上，让游戏内附魔 tick 驱动装备加成/伤害回调，替代纯命令轮询。

- 附魔文件：`enchantment/vitality.json`（支持槽位：saddle、mainhand）
- Riding 实体（猪/马/驴/骡/骷髅马/僵尸马/骆驼/炽足兽）→ 主手槽
- 非 Riding 实体 → 鞍槽
- `api/apply_trigger` 自动分配，也可手动调用

vitality 附魔的 `minecraft:tick` effect 驱动 `api/sync/equipment_bonus`：

- 扫描实体 8 个装备槽的 `attribute_modifiers`（max_health）
- 汇总加成 → 同步到 `dvh.max_health`（自动计算 delta，支持加减）
- 附魔等级 255（max_level），保证物品不会因堆叠丢失

修改 enchantment JSON 需要重启服务器（`/reload` 无效）。

## 读取血量

```
# 读取 HP（÷1000）
execute store result score #hp obj run function doom.virtual.health:api/get_health
# 读取 mHP（原始精度）
execute store result score #hp_mhp obj run function doom.virtual.health:api/get_health_mhp
# 读取百分比 [0,100]
execute store result score #pct obj run function doom.virtual.health:api/get_percentage
# 统计（写两个计分板并 scale）
execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/get_stats {damage_out:"#dmg", healing_out:"#heal", scale:1000}
```

## 计分板

| 计分板 | 类型 | 说明 |
| ----- | --- | ---- |
| `dvh.health` | 实体 | 当前虚拟血量 (mHP) |
| `dvh.max_health` | 实体 | 最大虚拟血量 (mHP) |
| `dvh.total_damage` | 实体 | 累计受伤 (mHP) |
| `dvh.total_healing` | 实体 | 累计治疗 (mHP) |
| `dvh.player_damage` | 实体 | 玩家造成的伤害 (mHP) |
| `dvh.rem_damage` | 实体 | 伤害余数（进位补偿） |
| `dvh.rem_heal` | 实体 | 治疗余数 |
| `dvh.pp` | 实体 | 百分比阈值（下界）[0,100] |
| `dvh.pp_max` | 实体 | 百分比阈值（上界）[0,100] |
| `dvh.prev_hp` | 实体 | 上一 tick 血量探针 (×2200) |
| `dvh.damage_mult` | 实体 | 伤害倍率（×1000，默认 1000=100%） |
| `dvh.saddle_bonus` | 实体 | 装备加成缓存 |
| `dvh.temp` | #虚拟 | 内部临时计算 |
| `dbb.temp` | #虚拟 | bossbar 临时标识 |

## 标签

| 标签 | 说明 |
| ---- | ---- |
| `virtual_health_entity` | VH 实体标识 |
| `dvh.invulnerable` | 无敌状态 |
| `dbb.has_bossbar` | 已绑定血条 |

## mcdoc 补全

3 个 mcdoc 文件提供 Spyglass 自动补全：

| 文件 | 补全对象 |
| ---- | ---- |
| `mcdoc/doom.virtual.health.mcdoc` | `data modify storage doom.vh:ctx ...`（显式声明全部运行时槽位：`with` / `uid*` / `state` / `_` / `trigger` / `b0..bf` / `h0..hf`） |
| `mcdoc/doom.bossbar.mcdoc` | `data modify storage doom.dbb:ctx ...` |
| `mcdoc/doom.virtual.health.tags.mcdoc` | 函数标签参考 |

示例用法见 `function/mcdoc.mcfunction`。mcdoc 需要 Spyglass + `Misodee.vscode-mcdoc` 插件。

## 已知 Edge Cases（边界情况）

> ⚠️ 亟待更多玩家测试：以下是代码审查中识别出的边界情况，部分已在设计中规避，部分受原版机制限制。欢迎在 [Issues](https://github.com/DoomDecapitator/doom.virtual.health/issues) 反馈实测结果。

### 数值精度类

| # | 场景 | 表现 | 规避建议 |
|---|------|------|---------|
| E1 | `auto_init` 的 NBT 用 double（如 `40d`） | 旧版宏展开 `40.0` 会 scoreboard 报错 | 已修复为 `data get` 版（兼容 double/int/string）|
| E2 | `get_percentage` 血量 < 1 HP | 整数除法，<1 HP 时百分比可能显示 0 | 低血量请用 `get_health_mhp` 精确读取 |
| E3 | `get_percentage` / `get_stats` 的 scale | `scale:0` 会除零报错 | 使用 `scale:1`（mHP）或 `scale:1000`（HP） |
| E4 | `add_health` 大量治疗 | 钳制到 `max_health`，不会溢出 | 已内置 `#max_safe` 溢出保护 |
| E5 | `damage_mult` 上限 | 最高 100000（×100 = 10000%） | 已内置上限保护 |

### 机制限制类（原版限制，无法规避）

| # | 场景 | 表现 |
|---|------|------|
| E6 | 单 tick 内受到超大数据伤害（如 `/damage 999999`） | Health 探针单次最多检测 512 HP 的 delta，超出部分截断 |
| E7 | 治疗时 Health 探针上限 1024 | 单次最多补 512 HP，超出部分丢失 |
| E8 | 实体处于未加载区块 | tick 检测暂停，虚拟血量不会变化 |
| E9 | `damage_mult` 极小时（< 1%） | 向下取整后单次伤害可能为 0 |
| E10 | 实体被 `kill` 命令直接杀死（绕过 VH） | `on_death` 不会触发（原版 kill 不经过 Health 探针） |
| E11 | 实体有原版 `Regeneration` / 饱和回复 | 会触发 VH 治疗检测（Health 上升被识别为治疗） |
| E12 | 玩家实体 | 支持，但玩家死亡会掉落经验/背包（原版行为，非 VH 控制） |

### 使用注意类

| # | 场景 | 表现 |
|---|------|------|
| E13 | `on_death` 命令含复杂引号/宏 | `$execute at @s run $(on_death)` 宏展开可能破坏引号嵌套 |
| E14 | 多个实体同一 tick 死亡 | `trigger_death` 使用全局 storage，同步执行无并发问题 |
| E15 | `remove` 后立刻 `create` | 需等 1 tick（原版实体 NBT 写入延迟） |
| E16 | bossbar `name` 传 JSON 数组（多段文本） | `$(name)` 宏展开嵌套引号可能失败，建议用单个 JSON 对象 |

## 注意事项

- `kill` 参数默认 `{kill:1b}`，移除时会杀死实体；不想杀用 `{kill:0b}`
- `on_death` 回调不要写 `@s[tag=virtual_health_entity]`（选择器已失效），直接用 `@s`
- `add_health {points:负数}` 对无敌实体无效；`set_health` 不受无敌影响
- Bossbar `api/create` 重复调用 return fail
- `scale` 参数：`scale:1` = mHP，`scale:1000` = HP
- 修改 enchantment JSON（vitality.json）需要重启服务器
- 伤害倍率范围 `[1, 100000]`（×1000 标度）
- 测试反馈渠道：遇到任何异常请在 [Issues](https://github.com/DoomDecapitator/doom.virtual.health/issues) 提交，附上复现步骤与版本号

## 文件结构

```
doom.virtual.health/                ← 数据包本体（1.21.5–26.2；zip 内顶层也是这个名字）
variants/
└── doom.virtual.health-26.3/       ← 26.3 专用变体（命令层同上逐字节相同，多改一处附魔 JSON）
```

`variants/` 只在仓库里用于区分。两个 zip 解压后得到的都是标准数据包目录，装的时候把解压出来的那个文件夹整体丢进 `datapacks/` 即可（不要连 `variants/` 一起放）。

```
doom.virtual.health/                ← 数据包本体（zip 内顶层也是这个名字）
├── pack.mcmeta                     ← 1.21.5–26.2 形态（sf 71–107 / min [71,0] / max 107）
├── mcdoc/                          ← 3 个补全定义
└── data/
    ├── minecraft/tags/function/    ← load.json · tick.json
    ├── doom.virtual.health/
    │   ├── enchantment/vitality.json
    │   └── function/               ← 51 个 mcfunction
    │       ├── __load__ / __unload__ / __help__
    │       ├── debug / dvhentity / mcdoc
    │       ├── core/               ← main · detect_damage · setup
    │       ├── api/                ← create · remove · add/set/get · predicate/ · sync/
    │       └── internal/           ← apply_damage/heal · trigger_death · uuid_* · auto_create*
    └── doom.bossbar/function/      ← __load__ / __unload__ / __help__ · core/ · api/ · internal/
```

仓库顶层这些是给玩家的，不在 zip 里：`README.md`（本文件）· `CHANGELOG.md`（逐版变更）· `dist/`（成品 zip + 校验值）·
`docs/`（玩家手册）· `LICENSE` · `.github/`（Issue 表单）。

## 文档在哪

| 想看什么 | 去哪 |
|---|---|
| 安装 / 升级 / 卸载全过程 | [`docs/01-安装.md`](docs/01-安装.md) |
| 全部 API 与用法示例 | [`docs/02-用法与API.md`](docs/02-用法与API.md) |
| storage 布局、计分板、标签、NBT 与 mcdoc 补全 | [`docs/03-配置.md`](docs/03-配置.md) |
| 版本 / `pack_format` / 升级降级 / 版本号规则 | [`docs/04-兼容与版本.md`](docs/04-兼容与版本.md) |
| 许可、致谢、AI 协作与第三方边界 | [`docs/05-致谢与许可.md`](docs/05-致谢与许可.md) |
| 每一版改了什么 | [CHANGELOG.md](CHANGELOG.md) |
| 全部文档索引 | [`docs/README.md`](docs/README.md) |
| 首屏那张图怎么拍 | [`docs/图-首屏效果位.md`](docs/图-首屏效果位.md) |

图文文档站在 <https://doomdecapitator.github.io/doom.virtual.health/>，就是仓库 `docs/index.html`，随本仓库一起发布。打不开时，`docs/` 里的 Markdown 手册内容一致。

## 许可

[MIT](LICENSE)，随便用、随便改、随便打包进整合包，保留版权声明即可。
