# Doom Virtual Health (DVH) v3.0 + Doom Bossbar (DBB)

> **🤖 本项目由 Deepseek AI 协助开发与调试** — 代码审查、bug 修复、文档撰写均由 AI 辅助完成。

为 Minecraft 实体注入**独立于原版血量的虚拟血量系统**，自动映射到 Bossbar。

- 支持 `auto_init`：`/summon` 直接带 NBT，第一 tick 自动初始化
- 高频 tick 伤害检测（原版 Health 作为探针，22 scale 采样）
- 自定义死亡回调 `on_death`（实体死亡时执行任意命令）
- 百分比血量判定（`dvh.pp` / `dvh.pp_max` 实体级阈值）
- 无敌控制、伤害倍率（×1000 标度）、余数精度补偿
- 正确的死亡归属（UUID hex → `damage ... by <uuid>`）
- **亟待更多玩家测试**：当前为社区早期版本，欢迎在 [Issues](https://github.com/Doom-Flare/doom.virtual.health/issues) 反馈任何异常

---

## 目录

1. [架构](#架构)
2. [快速开始](#快速开始)
3. [伤害与治疗机制](#伤害与治疗机制)
4. [API 参考](#api-参考)
   - [doom.virtual.health](#doomvirtualhealth)
   - [doom.bossbar](#doombossbar)
   - [predicate 判定](#predicate-判定)
5. [死亡回调 on_death](#死亡回调-on_death)
6. [auto_init 自动初始化](#auto_init-自动初始化)
7. [vitality 附魔触发器](#vitality-附魔触发器)
8. [读取血量](#读取血量)
9. [计分板](#计分板)
10. [标签](#标签)
11. [mcdoc 补全](#mcdoc-补全)
12. [注意事项](#注意事项)
13. [文件结构](#文件结构)

---

## 架构

```
doom.virtual.health     → 虚拟血量核心
    │
    │ (联动: scoreboard + tag)
    ↓
doom.bossbar            → 绑定 DVH，自动同步血量条
```

两个 namespace 独立加载，`doom.bossbar` 可选（不装也能用 DVH 本体）。

---

## 快速开始

### 方式一：auto_init（推荐）

```mcfunction
# summon 时直接写 data.dvh，第一 tick 自动初始化
/summon minecraft:zombie ~ ~ ~ {
  data:{dvh:{max_health:40d, health:40d, on_death:"say died"}},
  NoAI:1b
}
```

### 方式二：api/create（传统方式）

```mcfunction
# 对任意实体创建虚拟血量（支持小数 HP）
/execute as @n run \
  function doom.virtual.health:api/create {with:{max_health:21.5, health:20}}
```

### 绑定 Bossbar

```mcfunction
# 给已有 VH 实体添加血条（可选）
/execute as @e[tag=virtual_health_entity] run \
  function doom.bossbar:api/create {with:{name:'"Boss"',color:red,style:progress,visible:"true",targets:"@a"}}
```

### 扣血 / 加血

```mcfunction
# 扣 500 mHP（= 0.5 HP）
/execute as @e[tag=virtual_health_entity] run \
  function doom.virtual.health:api/add_health {points:-500}
```

### 无敌

```mcfunction
/execute as @e[tag=virtual_health_entity] run \
  function doom.virtual.health:api/set_invulnerable {state:1b}
```

---

## 伤害与治疗机制

```
Health = 512f（原版探针）
  · 受到攻击 → Health 下降
  · Tick 采样: temp = Health × 2200, 对比 baseline = 512 × 2200
  · delta = baseline - temp
  · delta × dvh.damage_mult / 2200 → mHP（×1000 标度）
  · dvh.health -= mHP
  · dvh.rem_damage += 余数（下次进位，防精度丢失）
  · Health 复位 512f
  · dvh.health ≤ 0 → trigger_death

dvh.damage_mult 默认 1000 = 100% 伤害（等效原 Resistance IV 效果）
  mult=200  → 20% 伤害（等效原 Resistance IV 效果）
  mult=500  → 50% 伤害
  mult=2000 → 200% 伤害（易伤）
```

**精度：0.001 HP**（mHP）。余数补偿保证长期累计不丢失。

---

## API 参考

### doom.virtual.health

所有 API 都以 `@s` 为 VH 实体执行，非 VH 实体 `return fail`。

| 函数 | 参数 | 说明 |
| ---- | ---- | ---- |
| `api/create` | `{with:{max_health, health, on_death?}}` | 注册虚拟血量（重复调用 return fail） |
| `api/remove` | `{with:{kill:1b/0b}}` | 移除虚拟血量；`kill:1b` 同时杀死实体（默认 1b） |
| `api/add_health` | `{points:int}` | 加减血量，正=治疗/负=伤害（单位 HP 或 mHP 见下） |
| `api/add_health_pct` | `{pct:int}` | 按最大血量百分比加减（±100 范围） |
| `api/set_health` | `{health:int}` | 强制设定血量（HP 单位，≤0 触发死亡） |
| `api/set_health_pct` | `{pct:int}` | 按最大血量百分比设定（[0,100]） |
| `api/set_max_health` | `{max_health:int}` | 设定最大血量（HP 单位，下限 1000 mHP=1 HP） |
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
| `debug` | (无) | 打印详细调试信息（含 bossbar/on_death） |
| `dvhentity` | `{target}` | 向指定玩家打印实体状态（`{target:"@s"}`） |

**单位说明**：`points`/`health`/`max_health` 均为 **HP 单位**（内部自动 ×1000 转 mHP，支持小数如 `points:-0.5`）。mHP 版本 API 直接返回原始毫值。

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

**persist 说明**：`persist:1b` 时实体失去 VH 标签后血条不自动删除（用于延迟清理或跨重生保留）。

### predicate 判定

predicate 类函数 `return 1` 表示条件成立。**需要预先设置 `@s dvh.pp` / `@s dvh.pp_max` 计分板**（实体级阈值，[0,100]）。

| 函数 | 判定条件 |
| ---- | ---- |
| `predicate/is_invulnerable` | 实体处于无敌状态 |
| `predicate/below_percentage` | 血量百分比 < `@s dvh.pp` |
| `predicate/above_percentage` | 血量百分比 > `@s dvh.pp` |
| `predicate/between_percentage` | 血量在 `@s dvh.pp` ~ `@s dvh.pp_max` 之间 |
| `predicate/below_hp` | 血量 < `#dvh.hp_threshold`（HP 单位，伪全局） |
| `predicate/above_hp` | 血量 > `#dvh.hp_threshold` |
| `predicate/between_hp` | 血量在 `#dvh.hp_threshold_low` ~ `#dvh.hp_threshold_high` 之间 |

用法示例（配合 execute if）：

```mcfunction
# 血量低于 30% 时触发
scoreboard players set @e[tag=virtual_health_entity] dvh.pp 30
execute as @e[tag=virtual_health_entity] if function \
  doom.virtual.health:api/predicate/below_percentage run say low HP!
```

---

## 死亡回调 on_death

**触发时机**：`dvh.health` 降至 0（`trigger_death`）时执行。

**用法**：`on_death` 是**任意命令字符串**，以 VH 实体位置执行：

```mcfunction
/execute as @e[tag=virtual_health_entity] run \
  function doom.virtual.health:api/create {with:{max_health:100, health:100, on_death:"say I died"}}
```

或 auto_init 时：

```mcfunction
/summon minecraft:zombie ~ ~ ~ {
  data:{dvh:{max_health:100d, health:100d, on_death:"function mypack:boss_death"}},
  NoAI:1b
}
```

**执行语义**：
- 等价于 `execute at @s run <on_death 命令>`，`@s` 是 VH 实体
- 因此 **不要写 `@s[tag=virtual_health_entity]`**（该选择器在命令执行时已失效），直接写 `@s` 或 `@e[tag=virtual_health_entity]` 不行，用 `@s` 即可
- 回调执行后实体被 `damage out_of_world` 杀死（若未指定归属则直接伤害）
- 如果 `on_death` 为**空字符串**，视为无回调，直接进入死亡流程
- 死亡归属：指定 on_death 时跳过 UUID 追踪（`trigger_death` 分支），否则追踪 `last_hurt_by_mob` 并生成 `damage ... by <uuid>` 击杀 credit

**常见写法**：

```mcfunction
# 广播死亡消息
on_death: "say A VH entity has died"

# 调用你自己的处理函数
on_death: "function mypack:boss_killed"

# 播放音效（以实体位置）
on_death: "playsound minecraft:entity.wither.death master @a ~ ~ ~ 1 1"

# 掉落物（summon 在实体位置）
on_death: "summon minecraft:item ~ ~ ~ {Item:{id:\"minecraft:diamond\",Count:1b}}"
```

---

## auto_init 自动初始化

`/summon` 时实体携带 `data:{dvh:{...}}`，第一 tick 自动完成 create + apply_trigger：

```mcfunction
/summon minecraft:zombie ~ ~ ~ {
  data:{dvh:{max_health:"2000", health:"2000"}},
  NoAI:1b
}
```

- 支持字段：`max_health` / `health` / `on_death`
- 值可以是数字（double）或字符串（如 `"2000"`，mcdoc 补全用）
- 自动补全：Spyglass + mcdoc 插件会在 `data:{dvh:{` 处提示
- auto_init 后自动执行 `apply_trigger`（分配 vitality 触发器）

---

## vitality 附魔触发器

**目的**：vitality 附魔挂在实体装备上，让游戏内附魔 tick 驱动装备加成/伤害回调，替代纯命令轮询。

- 附魔文件：`enchantment/vitality.json`（支持槽位：saddle、mainhand）
- **Riding 实体**（猪/马/驴/骡/骷髅马/僵尸马/骆驼/炽足兽）→ 主手槽
- **非 Riding 实体** → 鞍槽
- `api/apply_trigger` 自动分配，也可手动调用

vitality 附魔的 `minecraft:tick` effect 驱动 `api/sync/equipment_bonus`：
- 扫描实体 8 个装备槽的 `attribute_modifiers`（max_health）
- 汇总加成 → 同步到 `dvh.max_health`（自动计算 delta，支持加减）
- 附魔等级 255（max_level），保证物品不会因堆叠丢失

**修改 enchantment JSON 需要重启服务器**（`/reload` 无效）。

---

## 读取血量

```mcfunction
# 读取 HP（÷1000）
execute store result score #hp obj run function api/get_health
# #hp = 2000

# 读取 mHP（原始精度）
execute store result score #hp_mhp obj run function api/get_health_mhp
# #hp_mhp = 2000000

# 读取百分比 [0,100]
execute store result score #pct obj run function api/get_percentage
# #pct = 63

# 读取最大血量（HP）
execute store result score #mhp obj run function api/get_max_health
# #mhp = 2000

# 统计（写两个计分板并 scale）
execute as @e[tag=virtual_health_entity] run \
  function doom.virtual.health:api/get_stats {damage_out:"#dmg", healing_out:"#heal", scale:1000}
```

---

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

---

## 标签

| 标签 | 说明 |
| ---- | ---- |
| `virtual_health_entity` | VH 实体标识 |
| `dvh.invulnerable` | 无敌状态 |
| `dbb.has_bossbar` | 已绑定血条 |

---

## mcdoc 补全

3 个 mcdoc 文件提供 Spyglass 自动补全：

| 文件 | 补全对象 |
| ---- | ---- |
| `mcdoc/doom.virtual.health.mcdoc` | `data modify storage doom.vh:ctx ...` |
| `mcdoc/doom.bossbar.mcdoc` | `data modify storage doom.dbb:ctx ...` |
| `mcdoc/doom.virtual.health.tags.mcdoc` | 函数标签参考 |

示例用法见 `function/mcdoc.mcfunction`。mcdoc 需要 Spyglass + `Misodee.vscode-mcdoc` 插件。

---

## 已知 Edge Cases（边界情况）

> ⚠️ **亟待更多玩家测试**：以下为代码审查中识别出的边界情况，部分已在设计中规避，部分受原版机制限制。欢迎反馈实测结果。

### 数值精度类

| # | 场景 | 表现 | 规避建议 |
|---|------|------|---------|
| E1 | `auto_init` 的 NBT 用 double（如 `40d`） | 旧版宏展开 `40.0` 会 scoreboard 报错 | ✅ 已修复为 `data get` 版（兼容 double/int/string） |
| E2 | `get_percentage` 血量 < 1 HP | 整数除法，<1 HP 时百分比可能显示 0 | 低血量请用 `get_health_mhp` 精确读取 |
| E3 | `get_percentage` / `get_stats` 的 scale | `scale:0` 会除零报错 | 使用 `scale:1`（mHP）或 `scale:1000`（HP） |
| E4 | `add_health` 大量治疗 | 钳制到 `max_health`，不会溢出 | ✅ 已内置 `#max_safe` 溢出保护 |
| E5 | `damage_mult` 上限 | 最高 100000（×100 = 10000%） | ✅ 已内置上限保护 |

### 机制限制类（原版限制，无法规避）

| # | 场景 | 表现 |
|---|------|------|
| E6 | 单 tick 内受到超大数据伤害（如 `/damage 999999`） | Health 探针单次最多检测 512 HP 的 delta，超出部分截断 |
| E7 | 治疗时 Health 探针上限 1024 | 单次最多补 512 HP，超出部分丢失 |
| E8 | 实体处于未加载区块 | tick 检测暂停，虚拟血量不会变化 |
| E9 | `damage_mult` 极小时（< 1%） | 向下取整后单次伤害可能为 0 |
| E10 | 实体被 `kill` 命令直接杀死（绕过 VH） | `on_death` 不会触发（原版 kill 不经过 Health 探针） |
| E11 | 实体有原版 `Regeneration`/饱和回复 | 会触发 VH 治疗检测（Health 上升被识别为治疗） |
| E12 | 玩家实体 | 支持，但玩家死亡会掉落经验/背包（原版行为，非 VH 控制） |

### 使用注意类

| # | 场景 | 表现 |
|---|------|------|
| E13 | `on_death` 命令含复杂引号/宏 | `$execute at @s run $(on_death)` 宏展开可能破坏引号嵌套 |
| E14 | 多个实体同一 tick 死亡 | `trigger_death` 使用全局 storage，同步执行无并发问题 |
| E15 | `remove` 后立刻 `create` | 需等 1 tick（原版实体 NBT 写入延迟） |
| E16 | bossbar `name` 传 JSON 数组（多段文本） | `$(name)` 宏展开嵌套引号可能失败，建议用单个 JSON 对象 |

---

## 注意事项

- `kill` 参数默认 `{kill:1b}`，移除时**会杀死实体**；不想杀用 `{kill:0b}`
- `on_death` 回调**不要写 `@s[tag=virtual_health_entity]`**（选择器已失效），直接用 `@s`
- `add_health {points:负数}` 对无敌实体无效；`set_health` 不受无敌影响
- Bossbar `api/create` 重复调用 return fail
- `scale` 参数：`scale:1` = mHP，`scale:1000` = HP
- 修改 enchantment JSON（vitality.json）需要**重启服务器**
- 伤害倍率范围 `[1, 100000]`（×1000 标度）
- **测试反馈渠道**：遇到任何异常请在 [Issues](https://github.com/Doom-Flare/doom.virtual.health/issues) 提交，附上复现步骤与版本号

---

## 文件结构

```
doom.virtual.health/
├── pack.mcmeta
├── mcdoc/
├── README.md
├── data/
│   ├── minecraft/tags/function/
│   │   ├── load.json
│   │   └── tick.json
│   ├── doom.virtual.health/
│   │   ├── enchantment/vitality.json
│   │   └── function/
│   │       ├── __load__.mcfunction
│   │       ├── __unload__.mcfunction
│   │       ├── __help__.mcfunction
│   │       ├── debug.mcfunction
│   │       ├── dvhentity.mcfunction
│   │       ├── core/       (main, detect_damage, setup)
│   │       ├── api/        (create, remove, add/set health, get, predicate)
│   │       └── internal/   (apply_damage/heal, trigger_death, uuid_hex, auto_create)
│   └── doom.bossbar/
│       └── function/
│           ├── __load__/__unload__/__help__.mcfunction
│           ├── core/main.mcfunction
│           ├── api/ (create, remove, sync_dvh)
│           └── internal/ (create_impl, detect_orphan, sync_macro, ...)
```

---

> **作者**：Doom_Flare
