# Doom Virtual Health (DVH) v3.0 + Doom Bossbar (DBB)

中文: `variants/doom.virtual.health-26.3/README.md`

> **🤖 This project was developed and debugged with the help of Deepseek AI** — code review, bug fixes and documentation were all assisted by AI.

Injects a **virtual health system, decoupled from vanilla health**, into Minecraft entities, mapped automatically to a Bossbar.

- Supports `auto_init`: `/summon` carries the NBT directly, initialized automatically on the first tick
- High-frequency tick damage detection (vanilla Health as the probe, 22 scale sampling)
- Custom death callback `on_death` (runs any command when the entity dies)
- Percentage health checks (`dvh.pp` / `dvh.pp_max` entity-level thresholds)
- Invulnerability control, damage multiplier (×1000 scale), remainder precision compensation
- Correct death attribution (UUID hex → `damage ... by <uuid>`)
- **Needs more player testing**: this is currently an early community version; any anomaly is welcome in [Issues](https://github.com/Doom-Flare/doom.virtual.health/issues)

---

## Table of contents

1. [Architecture](#architecture)
2. [Quick start](#quick-start)
3. [Damage and healing mechanics](#damage-and-healing-mechanics)
4. [API reference](#api-reference)
   - [doom.virtual.health](#doomvirtualhealth)
   - [doom.bossbar](#doombossbar)
   - [predicate checks](#predicate-checks)
5. [Death callback on_death](#death-callback-on_death)
6. [auto_init automatic initialization](#auto_init-automatic-initialization)
7. [vitality enchantment trigger](#vitality-enchantment-trigger)
8. [Reading health](#reading-health)
9. [Scoreboard](#scoreboard)
10. [Tags](#tags)
11. [mcdoc completion](#mcdoc-completion)
12. [Notes](#notes)
13. [File structure](#file-structure)

---

## Architecture

```
doom.virtual.health     → virtual health core
    │
    │ (integration: scoreboard + tag)
    ↓
doom.bossbar            → binds DVH, syncs the health bar automatically
```

The two namespaces load independently; `doom.bossbar` is optional (DVH works without it).

---

## Quick start

### Option one: auto_init (recommended)

```mcfunction
# write data.dvh directly at summon time; initialized automatically on the first tick
/summon minecraft:zombie ~ ~ ~ {
  data:{dvh:{max_health:40d, health:40d, on_death:"say died"}},
  NoAI:1b
}
```

### Option two: api/create (the traditional way)

```mcfunction
# create virtual health on any entity (fractional HP supported)
/execute as @n run \
  function doom.virtual.health:api/create {with:{max_health:21.5, health:20}}
```

### Binding a Bossbar

```mcfunction
# add a health bar to an existing VH entity (optional)
/execute as @e[tag=virtual_health_entity] run \
  function doom.bossbar:api/create {with:{name:'"Boss"',color:red,style:progress,visible:"true",targets:"@a"}}
```

### Damage / heal

```mcfunction
# deal 500 mHP (= 0.5 HP)
/execute as @e[tag=virtual_health_entity] run \
  function doom.virtual.health:api/add_health {points:-500}
```

### Invulnerability

```mcfunction
/execute as @e[tag=virtual_health_entity] run \
  function doom.virtual.health:api/set_invulnerable {state:1b}
```

---

## Damage and healing mechanics

```
Health = 512f (vanilla probe)
  · takes a hit → Health drops
  · tick sampling: temp = Health × 2200, compared against baseline = 512 × 2200
  · delta = baseline - temp
  · delta × dvh.damage_mult / 2200 → mHP (×1000 scale)
  · dvh.health -= mHP
  · dvh.rem_damage += remainder (carried next time, prevents precision loss)
  · Health reset to 512f
  · dvh.health ≤ 0 → trigger_death

dvh.damage_mult defaults to 1000 = 100% damage (equivalent to the vanilla Resistance IV effect)
  mult=200  → 20% damage (equivalent to the vanilla Resistance IV effect)
  mult=500  → 50% damage
  mult=2000 → 200% damage (vulnerability)
```

**Precision: 0.001 HP** (mHP). Remainder compensation keeps long-run totals from drifting.

---

## API reference

### doom.virtual.health

All APIs run with `@s` as the VH entity; a non-VH entity `return fail`s.

| Function | Parameters | Description |
| ---- | ---- | ---- |
| `api/create` | `{with:{max_health, health, on_death?}}` | Register virtual health (repeat calls return fail) |
| `api/remove` | `{with:{kill:1b/0b}}` | Remove virtual health; `kill:1b` also kills the entity (default 1b) |
| `api/add_health` | `{points:int}` | Add or subtract health; positive = heal / negative = damage (units HP or mHP, see below) |
| `api/add_health_pct` | `{pct:int}` | Add or subtract by percentage of max health (range ±100) |
| `api/set_health` | `{health:int}` | Force-set health (HP units, ≤0 triggers death) |
| `api/set_health_pct` | `{pct:int}` | Set health as a percentage of max health ([0,100]) |
| `api/set_max_health` | `{max_health:int}` | Set max health (HP units, floor 1000 mHP=1 HP) |
| `api/add_max_health` | `{points:int}` | Increase max health (HP units, floor 1 HP) |
| `api/add_max_health_pct` | `{pct:int}` | Increase by a percentage of max health |
| `api/get_health` | (none, store result) | Current health (HP, ÷1000) |
| `api/get_health_mhp` | (none, store result) | Current health (raw mHP) |
| `api/get_max_health` | (none, store result) | Max health (HP) |
| `api/get_max_health_mhp` | (none, store result) | Max health (mHP) |
| `api/get_percentage` | (none, store result) | Current health percentage [0,100] |
| `api/get_total_damage` | (none, store result) | Cumulative damage taken (mHP) |
| `api/get_total_healing` | (none, store result) | Cumulative healing (mHP) |
| `api/get_player_damage` | (none, store result) | Cumulative damage dealt by players (mHP) |
| `api/get_stats` | `{damage_out, healing_out, scale}` | Write the cumulative stats to two scoreboards, divided by scale |
| `api/set_invulnerable` | `{state:1b/0b}` | Set invulnerability (immune to damage while active) |
| `api/set_damage_mult` | `{mult:int}` | Set the damage multiplier (×1000, range [1, 100000]) |
| `api/apply_trigger` | (none) | Assign the vitality enchantment trigger slot by entity type |
| `api/debug` | (none) | Print debug info to chat |
| `debug` | (none) | Print detailed debug info (including bossbar/on_death) |
| `dvhentity` | `{target}` | Print an entity's status to the given player (`{target:"@s"}`) |

**Units**: `points`/`health`/`max_health` are all in **HP units** (internally ×1000 into mHP, fractions such as `points:-0.5` supported). The mHP APIs return the raw milli-value.

### doom.bossbar

| Function | Parameters | Description |
| ---- | ---- | ---- |
| `api/create` | `{with:{...}}` | Create a health bar (repeat calls return fail) |
| `api/remove` | (none) | Remove the health bar |
| `api/sync_dvh` | (none) | Manually sync health to the Bossbar (tick calls it automatically) |

`api/create` parameters:

| Parameter | Type | Default | Description |
| ---- | ---- | ------ | ---- |
| `id` | string | auto-generated | Bossbar identifier |
| `name` | string (JSON) | `"Boss"` | Health bar display text (JSON string) |
| `color` | string | `"white"` | Colour |
| `style` | string | `"progress"` | Style |
| `visible` | string | `"true"` | Visibility |
| `targets` | string | `"@a"` | Selector for the players who can see it |
| `persist` | bool | `false` | Whether to keep the health bar after the entity dies |

**persist note**: with `persist:1b` the health bar is not deleted automatically once the entity loses the VH tag (useful for deferred cleanup or keeping it across respawns).

### predicate checks

A predicate function `return 1`s when the condition holds. **You must set the `@s dvh.pp` / `@s dvh.pp_max` scoreboards first** (entity-level thresholds, [0,100]).

| Function | Condition |
| ---- | ---- |
| `predicate/is_invulnerable` | The entity is invulnerable |
| `predicate/below_percentage` | Health percentage < `@s dvh.pp` |
| `predicate/above_percentage` | Health percentage > `@s dvh.pp` |
| `predicate/between_percentage` | Health between `@s dvh.pp` and `@s dvh.pp_max` |
| `predicate/below_hp` | Health < `#dvh.hp_threshold` (HP units, pseudo-global) |
| `predicate/above_hp` | Health > `#dvh.hp_threshold` |
| `predicate/between_hp` | Health between `#dvh.hp_threshold_low` and `#dvh.hp_threshold_high` |

Example use (with execute if):

```mcfunction
# trigger when health drops below 30%
scoreboard players set @e[tag=virtual_health_entity] dvh.pp 30
execute as @e[tag=virtual_health_entity] if function \
  doom.virtual.health:api/predicate/below_percentage run say low HP!
```

---

## Death callback on_death

**When it fires**: runs when `dvh.health` drops to 0 (`trigger_death`).

**Usage**: `on_death` is an **arbitrary command string**, executed at the VH entity's position:

```mcfunction
/execute as @e[tag=virtual_health_entity] run \
  function doom.virtual.health:api/create {with:{max_health:100, health:100, on_death:"say I died"}}
```

Or at auto_init time:

```mcfunction
/summon minecraft:zombie ~ ~ ~ {
  data:{dvh:{max_health:100d, health:100d, on_death:"function mypack:boss_death"}},
  NoAI:1b
}
```

**Execution semantics**:
- Equivalent to `execute at @s run <on_death command>`, where `@s` is the VH entity
- Therefore **do not write `@s[tag=virtual_health_entity]`** (that selector is already invalid by the time the command runs); writing `@e[tag=virtual_health_entity]` will not do either — just use `@s`
- After the callback runs, the entity is killed by `damage out_of_world` (a direct damage if no attribution is set)
- If `on_death` is an **empty string**, it counts as no callback and the death flow runs directly
- Death attribution: with on_death set, UUID tracking is skipped (the `trigger_death` branch); otherwise it tracks `last_hurt_by_mob` and generates `damage ... by <uuid>` kill credit

**Common forms**:

```mcfunction
# broadcast a death message
on_death: "say A VH entity has died"

# call your own handler function
on_death: "function mypack:boss_killed"

# play a sound (at the entity's position)
on_death: "playsound minecraft:entity.wither.death master @a ~ ~ ~ 1 1"

# drop an item (summoned at the entity's position)
on_death: "summon minecraft:item ~ ~ ~ {Item:{id:\"minecraft:diamond\",Count:1b}}"
```

---

## auto_init automatic initialization

When `/summon` gives the entity `data:{dvh:{...}}`, create + apply_trigger happen automatically on the first tick:

```mcfunction
/summon minecraft:zombie ~ ~ ~ {
  data:{dvh:{max_health:"2000", health:"2000"}},
  NoAI:1b
}
```

- Supported fields: `max_health` / `health` / `on_death`
- Values may be numbers (double) or strings (e.g. `"2000"`, for mcdoc completion)
- Completion: Spyglass + the mcdoc plugin suggest keys at `data:{dvh:{`
- After auto_init, `apply_trigger` runs automatically (assigns the vitality trigger)

---

## vitality enchantment trigger

**Purpose**: the vitality enchantment sits on the entity's equipment so the in-game enchantment tick drives equipment bonuses / damage callbacks, replacing pure command polling.

- Enchantment file: `enchantment/vitality.json` (supported slots: saddle, mainhand)
- **Riding entities** (pig/horse/donkey/mule/skeleton horse/zombie horse/camel/strider) → mainhand slot
- **Non-riding entities** → saddle slot
- `api/apply_trigger` assigns it automatically, or you can call it yourself

The vitality enchantment's `minecraft:tick` effect drives `api/sync/equipment_bonus`:
- Scans `attribute_modifiers` (max_health) across the entity's 8 equipment slots
- Sums the bonuses → syncs them into `dvh.max_health` (computes the delta automatically, handles both increases and decreases)
- Enchantment level 255 (max_level), so items are never lost to stacking merges

**Editing the enchantment JSON requires a server restart** (`/reload` will not do it).

---

## Reading health

```mcfunction
# read HP (÷1000)
execute store result score #hp obj run function api/get_health
# #hp = 2000

# read mHP (raw precision)
execute store result score #hp_mhp obj run function api/get_health_mhp
# #hp_mhp = 2000000

# read percentage [0,100]
execute store result score #pct obj run function api/get_percentage
# #pct = 63

# read max health (HP)
execute store result score #mhp obj run function api/get_max_health
# #mhp = 2000

# stats (write two scoreboards and scale)
execute as @e[tag=virtual_health_entity] run \
  function doom.virtual.health:api/get_stats {damage_out:"#dmg", healing_out:"#heal", scale:1000}
```

---

## Scoreboard

| Scoreboard | Type | Description |
| ----- | --- | ---- |
| `dvh.health` | entity | Current virtual health (mHP) |
| `dvh.max_health` | entity | Max virtual health (mHP) |
| `dvh.total_damage` | entity | Cumulative damage taken (mHP) |
| `dvh.total_healing` | entity | Cumulative healing (mHP) |
| `dvh.player_damage` | entity | Damage dealt by players (mHP) |
| `dvh.rem_damage` | entity | Damage remainder (carry compensation) |
| `dvh.rem_heal` | entity | Healing remainder |
| `dvh.pp` | entity | Percentage threshold (lower bound) [0,100] |
| `dvh.pp_max` | entity | Percentage threshold (upper bound) [0,100] |
| `dvh.prev_hp` | entity | Previous tick's health probe value (×2200) |
| `dvh.damage_mult` | entity | Damage multiplier (×1000, default 1000=100%) |
| `dvh.saddle_bonus` | entity | Equipment bonus cache |
| `dvh.temp` | #virtual (fake player) | Internal temporary calculation |
| `dbb.temp` | #virtual (fake player) | bossbar temporary identifier |

---

## Tags

| Tag | Description |
| ---- | ---- |
| `virtual_health_entity` | VH entity marker |
| `dvh.invulnerable` | Invulnerable state |
| `dbb.has_bossbar` | Health bar already bound |

---

## mcdoc completion

3 mcdoc files provide Spyglass auto-completion:

| File | Completes |
| ---- | ---- |
| `mcdoc/doom.virtual.health.mcdoc` | `data modify storage doom.vh:ctx ...` |
| `mcdoc/doom.bossbar.mcdoc` | `data modify storage doom.dbb:ctx ...` |
| `mcdoc/doom.virtual.health.tags.mcdoc` | Function tag reference |

For example usage see `function/mcdoc.mcfunction`. mcdoc needs Spyglass + the `Misodee.vscode-mcdoc` extension.

---

## Known Edge Cases

> ⚠️ **Needs more player testing**: these are the edge cases identified during code review, some already designed around and some limited by vanilla mechanics. Real-machine results are welcome.

### Numeric precision

| # | Scenario | Behaviour | Workaround |
|---|------|------|---------|
| E1 | `auto_init` NBT uses a double (e.g. `40d`) | The old macro expanded to `40.0`, which made scoreboard error out | ✅ Fixed to a `data get` version (accepts double/int/string) |
| E2 | `get_percentage` with health < 1 HP | Integer division, so the percentage may read 0 below 1 HP | For low health use `get_health_mhp` for exact readings |
| E3 | The scale of `get_percentage` / `get_stats` | `scale:0` divides by zero and errors | Use `scale:1` (mHP) or `scale:1000` (HP) |
| E4 | `add_health` with a large heal | Clamped to `max_health`, no overflow | ✅ `#max_safe` overflow protection is built in |
| E5 | `damage_mult` ceiling | Caps at 100000 (×100 = 10000%) | ✅ A ceiling guard is built in |

### Mechanic limits (vanilla limits, cannot be worked around)

| # | Scenario | Behaviour |
|---|------|------|
| E6 | Enormous single-tick damage (e.g. `/damage 999999`) | The Health probe detects at most a 512 HP delta per tick; the excess is truncated |
| E7 | Healing when the Health probe ceiling is 1024 | At most 512 HP restored per tick; the excess is lost |
| E8 | Entity in an unloaded chunk | tick detection pauses and virtual health does not change |
| E9 | Extremely small `damage_mult` (< 1%) | After flooring, a single hit may deal 0 |
| E10 | Entity killed directly by the `kill` command (bypassing VH) | `on_death` does not fire (vanilla kill never passes through the Health probe) |
| E11 | Entity has vanilla `Regeneration`/saturation regeneration | It triggers VH healing detection (a Health rise is read as healing) |
| E12 | Player entities | Supported, but a player death drops XP/inventory (vanilla behaviour, not controlled by VH) |

### Usage caveats

| # | Scenario | Behaviour |
|---|------|------|
| E13 | `on_death` command with complex quotes/macros | `$execute at @s run $(on_death)` macro expansion may break nested quotes |
| E14 | Multiple entities dying in the same tick | `trigger_death` uses global storage and runs synchronously, so there is no concurrency problem |
| E15 | `remove` immediately followed by `create` | You must wait 1 tick (vanilla entity NBT write delay) |
| E16 | bossbar `name` given a JSON array (multi-part text) | `$(name)` macro expansion may fail on nested quotes; use a single JSON object instead |

---

## Notes

- The `kill` parameter defaults to `{kill:1b}`, which **kills the entity** on removal; use `{kill:0b}` if you do not want that
- Never write **`@s[tag=virtual_health_entity]`** in the `on_death` callback (the selector is already invalid); use `@s` directly
- `add_health {points:<negative>}` has no effect on an invulnerable entity; `set_health` is unaffected by invulnerability
- Bossbar `api/create` called again returns fail
- The `scale` parameter: `scale:1` = mHP, `scale:1000` = HP
- Editing the enchantment JSON (vitality.json) requires a **server restart**
- Damage multiplier range `[1, 100000]` (×1000 scale)
- **Test feedback**: report anything unusual in [Issues](https://github.com/Doom-Flare/doom.virtual.health/issues), with reproduction steps and version number

---

## File structure

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

> **Author**: Doom_Flare
