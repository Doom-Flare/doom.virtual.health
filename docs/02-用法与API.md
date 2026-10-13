# 02 · 用法与 API
English: `docs/02-用法与API.en.md`

> 全部函数都在 `doom.virtual.health:*`（核心）与 `doom.bossbar:*`（血条）两个命名空间下。
> 除特别说明外，API 都以 `@s` 为虚拟血量实体执行；非虚拟血量实体调用会 `return fail`（可以用这个当判定）。
> 单位换算：1 HP = 1000 mHP。对外的 `health` / `max_health` / `points` 一律是 HP 单位（支持小数），
> `*_mhp` 那几个函数返回原始毫值。

## 0 · 两条入口：auto_init 与 api/create

### auto_init（推荐写法，跟 `/summon` 一起走）

```
/summon minecraft:zombie ~ ~ ~ {data:{dvh:{max_health:40d, health:40d, on_death:"say died"}}, NoAI:1b}
```

- 支持字段：`max_health`（必填）· `health`（必填）· `on_death`（可选）
- 值可以是数字（`40d` / `40`）或字符串（`"40"`，mcdoc 补全用）
- 第一 tick 自动完成 `api/create` + `api/apply_trigger`
- 想给它挂血条：再用一次 `doom.bossbar:api/create`（见 §3），或者自己写个 tick 循环对
  `@e[tag=virtual_health_entity,tag=!dbb.has_bossbar]` 补挂

### api/create（给已经在世界里的实体）

```
/execute as @n run function doom.virtual.health:api/create {with:{max_health:21.5, health:20}}
```

重复 create 会 `return fail`（不会覆盖已有血量）。想改血量用 `set_max_health` / `set_health`。

## 1 · 核心 API：`doom.virtual.health`

| 函数 | 参数 | 说明 |
| ---- | ---- | ---- |
| `api/create` | `{with:{max_health, health, on_death?}}` | 注册虚拟血量（重复调用 return fail） |
| `api/remove` | `{with:{kill:1b/0b}}` | 移除虚拟血量；`kill:1b`（默认）同时杀死实体 |
| `api/add_health` | `{points:num}` | 加减血量（HP 单位，可小数；正=治疗，负=伤害） |
| `api/add_health_pct` | `{pct:int}` | 按最大血量百分比加减（±100 范围） |
| `api/set_health` | `{health:num}` | 强制设定当前血量（HP 单位；≤0 触发死亡流程） |
| `api/set_health_pct` | `{pct:int}` | 按最大血量百分比设定（[0,100]） |
| `api/set_max_health` | `{max_health:num}` | 设定最大血量（HP 单位，下限 1 HP = 1000 mHP） |
| `api/add_max_health` | `{points:num}` | 增加最大血量（HP 单位，下限 1 HP） |
| `api/add_max_health_pct` | `{pct:int}` | 按最大血量百分比增加最大血量 |
| `api/get_health` | —（`execute store result`） | 当前血量（HP = mHP ÷ 1000） |
| `api/get_health_mhp` | —（同上） | 当前血量（mHP 原始值） |
| `api/get_max_health` | —（同上） | 最大血量（HP） |
| `api/get_max_health_mhp` | —（同上） | 最大血量（mHP） |
| `api/get_percentage` | —（同上） | 当前血量百分比 [0,100]（整数） |
| `api/get_total_damage` | —（同上） | 累计受伤 (mHP) |
| `api/get_total_healing` | —（同上） | 累计治疗 (mHP) |
| `api/get_player_damage` | —（同上） | 玩家造成的累计伤害 (mHP) |
| `api/get_stats` | `{damage_out:"#dmg", healing_out:"#heal", scale:1000}` | 把两个累计值写到计分板并按 `scale` 除 |
| `api/set_invulnerable` | `{state:1b/0b}` | 设置无敌（无敌期间免伤；`set_health` 不受它影响） |
| `api/set_damage_mult` | `{mult:int}` | 伤害倍率（×1000 标度，范围 `[1, 100000]`） |
| `api/apply_trigger` | — | 按实体类型分配 vitality 附魔触发器槽位（`auto_init` 会自动调） |
| `api/sync/equipment_bonus` | — | 由 vitality 附魔 tick 驱动，同步装备加成到 `dvh.max_health` |
| `api/debug` | — | 往聊天栏打印一行调试信息 |
| `debug` | — | 打印详细调试信息（含 bossbar / on_death 状态） |
| `dvhentity` | `{target:"@s"}` | 向指定玩家打印某只实体的虚拟血量状态 |
| `__help__` | — | 打印 API 清单 |
| `__load__` / `__unload__` | — | 加载 / 卸载钩子（`#minecraft:load` 已接 `__load__`） |

### 读取血量（`execute store result`）

```
# 当前血量（HP）
execute store result score #hp obj run function doom.virtual.health:api/get_health
# 当前血量（mHP，原始精度）
execute store result score #hp_mhp obj run function doom.virtual.health:api/get_health_mhp
# 百分比 [0,100]
execute store result score #pct obj run function doom.virtual.health:api/get_percentage
# 统计：累计伤害 → #dmg（除以 1000），累计治疗 → #heal
execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/get_stats {damage_out:"#dmg", healing_out:"#heal", scale:1000}
```

> `scale:0` 会除零报错；要原始 mHP 用 `scale:1`，要 HP 用 `scale:1000`。

## 2 · 百分比判定（predicate 函数）

`return 1` = 条件成立。阈值走实体自己的计分板，所以要先把阈值设上去：

```
scoreboard players set @e[tag=virtual_health_entity] dvh.pp 30
scoreboard players set @e[tag=virtual_health_entity] dvh.pp_max 60
execute as @e[tag=virtual_health_entity] if function doom.virtual.health:api/predicate/below_percentage run say low HP!
```

| 函数 | 判定条件 |
| ---- | ---- |
| `api/predicate/is_invulnerable` | 实体处于无敌状态 |
| `api/predicate/below_percentage` | 血量百分比 < `@s dvh.pp` |
| `api/predicate/above_percentage` | 血量百分比 > `@s dvh.pp` |
| `api/predicate/between_percentage` | `@s dvh.pp` ~ `@s dvh.pp_max` 之间 |
| `api/predicate/below_hp` | 血量 < `#dvh.hp_threshold`（HP 单位，伪全局） |
| `api/predicate/above_hp` | 血量 > `#dvh.hp_threshold` |
| `api/predicate/between_hp` | `#dvh.hp_threshold_low` ~ `#dvh.hp_threshold_high` 之间 |

典型的“分阶段 Boss”写法：给 Boss 挂一个 tick 循环，血量进到某一段就换行为 / 放技能。
用 `between_percentage` 判定，用 `dvh.pp` / `dvh.pp_max` 划段。

## 3 · Bossbar API：`doom.bossbar`

| 函数 | 参数 | 说明 |
| ---- | ---- | ---- |
| `api/create` | `{with:{…}}` | 给实体创建血条（重复调用 return fail） |
| `api/remove` | — | 移除血条 |
| `api/sync_dvh` | — | 手动把虚拟血量同步到血条（`tick` 会自动调，一般不用手调） |

`api/create` 的参数：

| 参数 | 类型 | 默认 | 说明 |
| ---- | ---- | ---- | ---- |
| `id` | string | 自动生成 | 血条标识（同一实体重复创建时用来认人） |
| `name` | string (JSON) | `"Boss"` | 显示文本，给 JSON 字符串（例如 `'"Boss"'`） |
| `color` | string | `"white"` | `pink` / `blue` / `red` / `green` / `yellow` / `purple` / `white` |
| `style` | string | `"progress"` | `progress` / `notched_6` / `notched_10` / `notched_12` / `notched_20` |
| `visible` | string | `"true"` | 可见性（`"true"` / `"false"`） |
| `targets` | string | `"@a"` | 谁能看到这条血条 |
| `persist` | bool | `false` | `persist:1b` 时实体失去虚拟血量标签后不自动删血条（用于延迟清理 / 跨重生保留） |

```
/execute as @e[tag=virtual_health_entity] run function doom.bossbar:api/create {with:{name:'"Boss"',color:red,style:progress,visible:"true",targets:"@a"}}
/execute as @e[tag=dbb.has_bossbar] run function doom.bossbar:api/sync_dvh
/execute as @e[tag=dbb.has_bossbar] run function doom.bossbar:api/remove
```

> `name` 建议用单个 JSON 对象；给 JSON 数组（多段文本）时，宏展开里的嵌套引号可能出问题（见 E16）。

## 4 · 死亡回调 `on_death`

`dvh.health` 掉到 0（走 `trigger_death`）时执行的一串命令：

```
/execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/create {with:{max_health:100, health:100, on_death:"say I died"}}
```

```
/summon minecraft:zombie ~ ~ ~ {data:{dvh:{max_health:100d, health:100d, on_death:"function mypack:boss_death"}}, NoAI:1b}
```

执行语义：

- 等价于 `execute at @s run <on_death 命令>`，其中 `@s` 就是这只虚拟血量实体，坐标就是它的位置
- 所以不要写 `@s[tag=virtual_health_entity]`（那一刻选择器已经失效），直接写 `@s` 即可
- 回调执行完，实体被 `damage out_of_world` 收尾（没指定击杀归属时就是直接伤害）
- `on_death` 给空字符串 = 没有回调，直接进死亡流程
- 击杀归属：给了 `on_death` 就走回调分支、跳过 UUID 追踪；没给的话追踪 `last_hurt_by_mob`，
  生成 `damage ... by <uuid>`，把击杀 credit 给真正的攻击者（UUID 走 4×int → hex 字符串转换）

常见写法：

```
on_death: "say A VH entity has died"
on_death: "function mypack:boss_killed"
on_death: "playsound minecraft:entity.wither.death master @a ~ ~ ~ 1 1"
on_death: "summon minecraft:item ~ ~ ~ {Item:{id:"minecraft:diamond",Count:1b}}"
```

## 5 · vitality 附魔触发器

它解决什么：装备上的 `attribute_modifiers`（例如 +20 最大生命）平时要靠命令轮询才能读出来。
vitality 附魔挂在装备上，用游戏自己的附魔 tick 驱动 `api/sync/equipment_bonus`，省掉轮询。

- 附魔文件：`doom.virtual.health/enchantment/vitality.json`，支持两个槽位：`saddle` 与 `mainhand`
- Riding 实体（猪 / 马 / 驴 / 骡 / 骷髅马 / 僵尸马 / 骆驼 / 炽足兽）→ 用主手槽
- 其它实体 → 用鞍槽
- `api/apply_trigger` 自动按实体类型分配（`auto_init` 会替你调一次），也可以自己调
- 同步逻辑：扫 8 个装备槽的 `attribute_modifiers`（max_health）→ 汇总 → 算出 delta → 加到 `dvh.max_health`
- 附魔等级上限 255，避免物品因堆叠被合并丢失

> ⚠️ 改 `vitality.json` 之后要重启服务器才读到新内容，`/reload` 不管用。

## 6 · 伤害与治疗是怎么算的

```
Health = 512f（原版探针，每 tick 复位）
  · 受到攻击 → Health 下降
  · tick 采样：temp = Health × 2200，baseline = 512 × 2200
  · delta = baseline - temp
  · mHP = delta × dvh.damage_mult / 2200        （×1000 标度）
  · dvh.health -= mHP
  · dvh.rem_damage += 余数（下次进位，长期不丢精度）
  · Health 复位 512f
  · dvh.health ≤ 0 → trigger_death
```

`dvh.damage_mult` 默认 `1000` = 100% 伤害：

| mult | 等效 |
|---|---|
| `200` | 20% 伤害（很硬） |
| `500` | 50% 伤害 |
| `1000` | 100%（默认） |
| `2000` | 200%（易伤） |
| `100000` | 上限（10000%） |

精度 0.001 HP（mHP），余数补偿保证长期累计不丢。

## 7 · 已知 Edge Cases 与注意事项

见仓库根 [`../README.md`](../README.md) 的「已知 Edge Cases」与「注意事项」两节。那里是唯一一份，别处不重复维护。
最值得记住的三条：

- `api/remove` 默认 `kill:1b`，**会杀死实体**；只想摘系统不想杀就 `{kill:0b}`；
- `on_death` 里写 `@s`，不要写 `@s[tag=virtual_health_entity]`；
- 直接 `/kill` 实体不会触发 `on_death`（原版 kill 不经过 Health 探针，见 E10）。
