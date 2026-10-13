# 02 · Usage and API

中文: `docs/02-用法与API.md`

> Every function lives under the two namespaces `doom.virtual.health:*` (core) and `doom.bossbar:*` (health bar).
> Unless stated otherwise, APIs run with `@s` as the virtual-health entity; calling them on a non-virtual-health entity `return fail`s (you can use that as a test).
> Unit conversion: 1 HP = 1000 mHP. The public `health` / `max_health` / `points` are always in HP units (fractions supported),
> while the `*_mhp` functions return the raw milli-value.

## 0 · Two entry points: auto_init and api/create

### auto_init (the recommended form, goes with `/summon`)

```
/summon minecraft:zombie ~ ~ ~ {data:{dvh:{max_health:40d, health:40d, on_death:"say died"}}, NoAI:1b}
```

- Supported fields: `max_health` (required) · `health` (required) · `on_death` (optional)
- Values may be numbers (`40d` / `40`) or strings (`"40"`, for mcdoc completion)
- The first tick runs `api/create` + `api/apply_trigger` automatically
- To give it a health bar: call `doom.bossbar:api/create` once more (see §3), or write your own tick loop that tops up
  `@e[tag=virtual_health_entity,tag=!dbb.has_bossbar]`

### api/create (for entities already in the world)

```
/execute as @n run function doom.virtual.health:api/create {with:{max_health:21.5, health:20}}
```

Calling create again `return fail`s (it does not overwrite existing health). To change health use `set_max_health` / `set_health`.

## 1 · Core API: `doom.virtual.health`

| Function | Parameters | Description |
| ---- | ---- | ---- |
| `api/create` | `{with:{max_health, health, on_death?}}` | Register virtual health (repeat calls return fail) |
| `api/remove` | `{with:{kill:1b/0b}}` | Remove virtual health; `kill:1b` (default) also kills the entity |
| `api/add_health` | `{points:num}` | Add or subtract health (HP units, fractions allowed; positive = heal, negative = damage) |
| `api/add_health_pct` | `{pct:int}` | Add or subtract by percentage of max health (range ±100) |
| `api/set_health` | `{health:num}` | Force-set current health (HP units; ≤0 triggers the death flow) |
| `api/set_health_pct` | `{pct:int}` | Set by percentage of max health ([0,100]) |
| `api/set_max_health` | `{max_health:num}` | Set max health (HP units, floor 1 HP = 1000 mHP) |
| `api/add_max_health` | `{points:num}` | Increase max health (HP units, floor 1 HP) |
| `api/add_max_health_pct` | `{pct:int}` | Increase max health by a percentage of max health |
| `api/get_health` | — (`execute store result`) | Current health (HP = mHP ÷ 1000) |
| `api/get_health_mhp` | — (same) | Current health (raw mHP) |
| `api/get_max_health` | — (same) | Max health (HP) |
| `api/get_max_health_mhp` | — (same) | Max health (mHP) |
| `api/get_percentage` | — (same) | Current health percentage [0,100] (integer) |
| `api/get_total_damage` | — (same) | Cumulative damage taken (mHP) |
| `api/get_total_healing` | — (same) | Cumulative healing (mHP) |
| `api/get_player_damage` | — (same) | Cumulative damage dealt by players (mHP) |
| `api/get_stats` | `{damage_out:"#dmg", healing_out:"#heal", scale:1000}` | Write the two cumulative values to scoreboards, divided by `scale` |
| `api/set_invulnerable` | `{state:1b/0b}` | Set invulnerability (immune to damage while active; `set_health` is unaffected by it) |
| `api/set_damage_mult` | `{mult:int}` | Damage multiplier (×1000 scale, range `[1, 100000]`) |
| `api/apply_trigger` | — | Assign the vitality enchantment trigger slot by entity type (`auto_init` calls it for you) |
| `api/sync/equipment_bonus` | — | Driven by the vitality enchantment tick; syncs equipment bonuses into `dvh.max_health` |
| `api/debug` | — | Print one line of debug info to chat |
| `debug` | — | Print detailed debug info (including bossbar / on_death state) |
| `dvhentity` | `{target:"@s"}` | Print one entity's virtual-health status to the given player |
| `__help__` | — | Print the API list |
| `__load__` / `__unload__` | — | Load / unload hooks (`#minecraft:load` already calls `__load__`) |

### Reading health (`execute store result`)

```
# current health (HP)
execute store result score #hp obj run function doom.virtual.health:api/get_health
# current health (mHP, raw precision)
execute store result score #hp_mhp obj run function doom.virtual.health:api/get_health_mhp
# percentage [0,100]
execute store result score #pct obj run function doom.virtual.health:api/get_percentage
# stats: cumulative damage → #dmg (divided by 1000), cumulative healing → #heal
execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/get_stats {damage_out:"#dmg", healing_out:"#heal", scale:1000}
```

> `scale:0` divides by zero and errors; use `scale:1` for raw mHP and `scale:1000` for HP.

## 2 · Percentage checks (predicate functions)

`return 1` = condition holds. The thresholds live on the entity's own scoreboards, so set them first:

```
scoreboard players set @e[tag=virtual_health_entity] dvh.pp 30
scoreboard players set @e[tag=virtual_health_entity] dvh.pp_max 60
execute as @e[tag=virtual_health_entity] if function doom.virtual.health:api/predicate/below_percentage run say low HP!
```

| Function | Condition |
| ---- | ---- |
| `api/predicate/is_invulnerable` | The entity is invulnerable |
| `api/predicate/below_percentage` | Health percentage < `@s dvh.pp` |
| `api/predicate/above_percentage` | Health percentage > `@s dvh.pp` |
| `api/predicate/between_percentage` | Between `@s dvh.pp` and `@s dvh.pp_max` |
| `api/predicate/below_hp` | Health < `#dvh.hp_threshold` (HP units, pseudo-global) |
| `api/predicate/above_hp` | Health > `#dvh.hp_threshold` |
| `api/predicate/between_hp` | Between `#dvh.hp_threshold_low` and `#dvh.hp_threshold_high` |

The classic "phased boss" pattern: give the boss a tick loop and change behaviour / cast skills as health enters each band.
Use `between_percentage` to test and `dvh.pp` / `dvh.pp_max` to draw the bands.

## 3 · Bossbar API: `doom.bossbar`

| Function | Parameters | Description |
| ---- | ---- | ---- |
| `api/create` | `{with:{…}}` | Create a health bar for the entity (repeat calls return fail) |
| `api/remove` | — | Remove the health bar |
| `api/sync_dvh` | — | Manually sync virtual health to the health bar (`tick` does it automatically, usually no manual call needed) |

`api/create` parameters:

| Parameter | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `id` | string | auto-generated | Health bar identifier (used to tell bars apart when the same entity is created twice) |
| `name` | string (JSON) | `"Boss"` | Display text, given as a JSON string (e.g. `'"Boss"'`) |
| `color` | string | `"white"` | `pink` / `blue` / `red` / `green` / `yellow` / `purple` / `white` |
| `style` | string | `"progress"` | `progress` / `notched_6` / `notched_10` / `notched_12` / `notched_20` |
| `visible` | string | `"true"` | Visibility (`"true"` / `"false"`) |
| `targets` | string | `"@a"` | Who can see this health bar |
| `persist` | bool | `false` | With `persist:1b`, the health bar is not deleted automatically once the entity loses the virtual-health tag (for deferred cleanup / keeping it across respawns) |

```
/execute as @e[tag=virtual_health_entity] run function doom.bossbar:api/create {with:{name:'"Boss"',color:red,style:progress,visible:"true",targets:"@a"}}
/execute as @e[tag=dbb.has_bossbar] run function doom.bossbar:api/sync_dvh
/execute as @e[tag=dbb.has_bossbar] run function doom.bossbar:api/remove
```

> For `name`, prefer a single JSON object; with a JSON array (multi-part text) the nested quotes in the macro expansion can go wrong (see E16).

## 4 · Death callback `on_death`

The command string executed when `dvh.health` hits 0 (via `trigger_death`):

```
/execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/create {with:{max_health:100, health:100, on_death:"say I died"}}
```

```
/summon minecraft:zombie ~ ~ ~ {data:{dvh:{max_health:100d, health:100d, on_death:"function mypack:boss_death"}}, NoAI:1b}
```

Execution semantics:

- Equivalent to `execute at @s run <on_death command>`, where `@s` is this virtual-health entity and the coordinates are its position
- So do not write `@s[tag=virtual_health_entity]` (by then the selector is already invalid); just write `@s`
- After the callback runs, the entity is finished off by `damage out_of_world` (a direct damage when no kill attribution is set)
- An empty string for `on_death` = no callback, straight into the death flow
- Kill attribution: with `on_death` set, the callback branch is taken and UUID tracking is skipped; without it, `last_hurt_by_mob` is tracked,
  generating `damage ... by <uuid>` to credit the real attacker (the UUID goes through a 4×int → hex string conversion)

Common forms:

```
on_death: "say A VH entity has died"
on_death: "function mypack:boss_killed"
on_death: "playsound minecraft:entity.wither.death master @a ~ ~ ~ 1 1"
on_death: "summon minecraft:item ~ ~ ~ {Item:{id:"minecraft:diamond",Count:1b}}"
```

## 5 · vitality enchantment trigger

What it solves: an equipment's `attribute_modifiers` (such as +20 max health) normally has to be read out by command polling.
The vitality enchantment sits on the equipment and uses the game's own enchantment tick to drive `api/sync/equipment_bonus`, removing the polling.

- Enchantment file: `doom.virtual.health/enchantment/vitality.json`, supporting two slots: `saddle` and `mainhand`
- Riding entities (pig / horse / donkey / mule / skeleton horse / zombie horse / camel / strider) → mainhand slot
- Other entities → saddle slot
- `api/apply_trigger` assigns by entity type automatically (`auto_init` calls it for you), or you can call it yourself
- Sync logic: scan the `attribute_modifiers` (max_health) of 8 equipment slots → sum them → compute the delta → add it to `dvh.max_health`
- Enchantment level cap 255, so items are not lost to stacking merges

> ⚠️ After editing `vitality.json` you must restart the server for the new content to be read; `/reload` will not do it.

## 6 · How damage and healing are computed

```
Health = 512f (vanilla probe, reset every tick)
  · takes a hit → Health drops
  · tick sampling: temp = Health × 2200, baseline = 512 × 2200
  · delta = baseline - temp
  · mHP = delta × dvh.damage_mult / 2200        (×1000 scale)
  · dvh.health -= mHP
  · dvh.rem_damage += remainder (carried next time, no long-run precision loss)
  · Health reset to 512f
  · dvh.health ≤ 0 → trigger_death
```

`dvh.damage_mult` defaults to `1000` = 100% damage:

| mult | Equivalent |
|---|---|
| `200` | 20% damage (very tanky) |
| `500` | 50% damage |
| `1000` | 100% (default) |
| `2000` | 200% (vulnerability) |
| `100000` | ceiling (10000%) |

Precision is 0.001 HP (mHP); remainder compensation keeps long-run totals from drifting.

## 7 · Known Edge Cases and notes

See the "Known Edge Cases" and "Notes" sections of the repo root [`../README.md`](../README.md). That is the only copy; it is not maintained elsewhere.
The three most worth remembering:

- `api/remove` defaults to `kill:1b` and **will kill the entity**; to strip the system without killing, use `{kill:0b}`;
- inside `on_death` write `@s`, not `@s[tag=virtual_health_entity]`;
- `/kill`ing an entity directly does not trigger `on_death` (vanilla kill never passes through the Health probe, see E10).
