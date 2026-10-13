# doom.virtual.health — Virtual Health System + Bossbar Health Bar (Datapack)

中文: `README.md`

[![Latest release](https://img.shields.io/github/v/release/DoomDecapitator/doom.virtual.health?label=%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC)](https://github.com/DoomDecapitator/doom.virtual.health/releases)
[![Minecraft](https://img.shields.io/badge/Minecraft-1.21.5%20%E2%80%93%2026.3-3C8527)](docs/04-兼容与版本.md)
[![License](https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF-MIT-97ca00)](LICENSE)

<!-- Hero image slot (no image yet): follow docs/图-首屏效果位.md to take a screenshot of "a mob wearing a health bar, with a health value that is nothing like vanilla's 20 points",
     save it as docs/assets/首屏效果.png, then uncomment the line below. Until then, do not leave a broken half-image. -->
<!-- <p align="center"><img src="docs/assets/首屏效果.png" width="720" alt="doom.virtual.health running in a world"></p> -->

Inject a virtual health pool into entities with nothing but a datapack, fully decoupled from vanilla health.

Health is measured in 0.001 HP (mHP), the cap goes up to 95325 HP, and it maps to a Bossbar health bar automatically. Rounding it out: `auto_init` (`/summon` carries the NBT directly), non-invasive tick damage detection, an `on_death` death callback, percentage health checks, invulnerability control, a damage multiplier, and proportional healing. Zero mods, zero external dependencies.

## Which one to download

| Your MC version | Download this |
|---|---|
| 1.21.5 – 26.2 | `dist/doom.virtual.health-v3.1.0.zip` |
| 26.3 | `dist/doom.virtual.health-v3.1.0-mc26.3.zip` |

See "MC version → which variant" below.

## Installation

1. Unzip the archive to get a `doom.virtual.health/` folder
2. Drop that whole folder into `saves/<your world>/datapacks/`. On a server, put it in `world/datapacks/`
3. Go in-game and run `/reload`

After downloading, it is worth checking the checksum first — see "Verifying your download".

The illustrated site is at <https://doomdecapitator.github.io/doom.virtual.health/>, which is just `docs/index.html` in this repo; it ships with the repo, there is no second copy.

## Where the source is

This pack has no generator. The source is the 63 mcfunction files under [`doom.virtual.health/`](doom.virtual.health), each of which you can open and read. The files inside the zip are byte-identical to them.

## Current status

**v3.1.0 is a full release (Latest)**, supporting Minecraft 1.21.5 through 26.3.

Gameplay behaviour is identical to v3.0.0 (not a single character changed in the 63 mcfunction files). What this release changes is whether it installs at all: 26.3 changed the JSON shape of the `enchantment` registry, and the old form made the server refuse to start; that is fixed and re-verified on a real server.

Three real-machine runs, all green: 1.21.5 / 1.21.10 / 26.3 each passed 12/12 assertions, with 0 of the 8 load-error classes.

The `pack.mcmeta` description string inside the pack still says "DVH v3.0"; that is the same version, not an old pack.

It is ready to install into a world and play, but please back up your world first.

---

## 30 seconds: download → install → watch it run

| Step | What to do |
|---|---|
| ① | Download [`dist/doom.virtual.health-v3.1.0.zip`](dist/doom.virtual.health-v3.1.0.zip) (1.21.5–26.2) or [`dist/doom.virtual.health-v3.1.0-mc26.3.zip`](dist/doom.virtual.health-v3.1.0-mc26.3.zip) (26.3), and check it against [SHA256SUMS.txt](dist/SHA256SUMS.txt) while you are at it |
| ② | Unzip, put the whole `doom.virtual.health/` into `<world>/datapacks/`; on a server put it in `world/datapacks/` |
| ③ | Enter the world, `/reload`, then `/function doom.virtual.health:__help__` to see the command list in chat |

Now summon a zombie that has virtual health (`auto_init`, initialized automatically on the first tick):

```
/summon minecraft:zombie ~ ~ ~ {data:{dvh:{max_health:40d, health:40d}}, NoAI:1b}
```

A health bar appears at its feet immediately (the `doom.bossbar` namespace installs along with the pack), and hitting it subtracts virtual health, not vanilla's 20 points.

If nothing happens, check these three in order: is `pack.mcmeta` exactly at `datapacks/doom.virtual.health/pack.mcmeta` (one extra nesting level and it will not load)
→ is there a `Failed to load function` in `logs/latest.log` → did you `/reload`.

To uninstall: first run `/function doom.virtual.health:__unload__` to strip every virtual-health entity clean, then delete `datapacks/doom.virtual.health/` → `/reload`.
For more detailed installation steps (including "where does the pack go, how on a server, how to tell when the version is wrong") see [`docs/01-安装.md`](docs/01-安装.md).

## Verifying your download (one line)

`dist/SHA256SUMS.txt` holds the sha256 of each zip. Run this in the directory containing the zip:

```
Linux / macOS:        sha256sum -c SHA256SUMS.txt
Windows PowerShell:   (Get-FileHash .\doom.virtual.health-v3.1.0.zip -Algorithm SHA256).Hash
```

If it prints `OK` (or the hash equals the string in `SHA256SUMS.txt`), the download is intact; if not, do not use it, download again. Current values:

| File | sha256 |
|---|---|
| `doom.virtual.health-v3.1.0.zip` (1.21.5–26.2) | `cd556d2b946fb4a8c24a37c242c4e0cedf6f9eb3d296614c0ad17af02032145b` |
| `doom.virtual.health-v3.1.0-mc26.3.zip` (26.3 only) | `51bcccbc04d4742c689140863c166aa50e13a683c587735f4e4f741344db8816` |

These values were not copied by hand. `tools/build_dist.py` reads every entry back after building the zip and compares it byte-for-byte with the same-named file under [`doom.virtual.health/`](doom.virtual.health) in the repo, aborting with an error on any mismatch. `tools/verify.py` then cross-checks `SHA256SUMS.txt`, the zip and the pack body against each other. Repacking yourself should produce exactly the hashes above.

## Which one should I download

| File | What is inside | Who it is for |
|---|---|---|
| `dist/doom.virtual.health-v3.1.0.zip` (1.21.5 – 26.2) | The complete `doom.virtual.health/` datapack: 92 files (64 `.mcfunction` + 24 `.json` + 3 `.mcdoc` + `pack.mcmeta` + the in-pack README), containing two namespaces, `doom.virtual.health` (virtual health core) and `doom.bossbar` (health bar integration, optional — not wiring it up does not affect the core) | 1.21.5 – 26.2; this is what almost everyone wants |
| `dist/doom.virtual.health-v3.1.0-mc26.3.zip` (26.3 only) | The same commands, with the enchantment JSON fixed for the new 26.3 schema (`condition`→`type`, `requirements` array→single object) | Only for 26.3. Installing the one above on 26.3 will **stop your server from starting** ✗ |

## What it gives you (core features)

| Capability | In one line |
|---|---|
| Standalone virtual health | Entities carry `dvh.health` / `dvh.max_health` (mHP, 0.001 HP precision), fully decoupled from vanilla health |
| auto_init | `/summon ... {data:{dvh:{...}}}` carries NBT directly; registration + trigger assignment happen automatically on the first tick |
| tick damage detection | Uses vanilla Health (reset to `512f`) as a probe with 22× sampling, converting vanilla damage/healing precisely into virtual health |
| `on_death` death callback | Runs an arbitrary command string when health hits zero (`say` / `function` / `summon` / `playsound` …) |
| Correct kill attribution | UUID (4×int) → hex string → `damage ... by <uuid>`, so kill credit goes to the real attacker |
| Percentage checks | Entity-level thresholds `dvh.pp` / `dvh.pp_max` + 7 predicate functions (below / above / between × percentage / hp) |
| Invulnerability and multiplier | `set_invulnerable` gives one-call damage immunity; `set_damage_mult` can crush damage to 0.1% or amplify it to 10000% |
| Precision compensation | `dvh.rem_damage` / `dvh.rem_heal` carry the remainder forward, so long-run totals lose no precision |
| Stat tracking | Cumulative damage / healing / player damage, exportable to any scoreboard |
| Bossbar health bar | `doom.bossbar` syncs virtual health automatically, with custom name/colour/style/visible players and an option to keep the bar after death |
| vitality enchantment trigger | Uses the enchantment tick to drive equipment-bonus sync (`attribute_modifiers` → `dvh.max_health`), replacing command polling |
| mcdoc completion | 3 mcdoc files give completion and spell-checking for storage / `data:{dvh:{` once Spyglass + the mcdoc plugin are installed |

## MC version → which variant

| MC version | data format | Which one | Enchantment JSON | Real-machine test |
|---|---|---|---|---|
| 1.21.5 | 71 | `v3.1.0` | as-is | 12/12 tested |
| 1.21.6 | 80 | `v3.1.0` | as-is | not tested individually, extrapolated from the same range |
| 1.21.7 / 1.21.8 | 81 | `v3.1.0` | as-is | not tested individually, extrapolated from the same range |
| 1.21.9 / 1.21.10 | 88.0 | `v3.1.0` | as-is | 12/12 tested (1.21.10) |
| 1.21.11 | 94.1 | `v3.1.0` | as-is | not tested individually, extrapolated from the same range |
| 26.1 / 26.1.1 / 26.1.2 | 101.1 | `v3.1.0` | as-is | not tested individually, extrapolated from the same range |
| 26.2 | 107.1 | `v3.1.0` | as-is | not tested individually, extrapolated from the same range |
| 26.3 | 121.0 | `v3.1.0-mc26.3` | fixed for the 26.3 schema | 12/12 tested |
| 1.21.4 and older | ≤ 61 | not supported | — | — |

Why the split is unavoidable: 26.3 changed the JSON shape of the `enchantment` registry
(`condition` → `type`, `requirements` from an array to a single object),
and one JSON file cannot satisfy both sides. The command layer is byte-identical between the two; the only difference is
`pack.mcmeta` + `enchantment/vitality.json`.

> ⚠️ **Installing `v3.1.0` (the one for 1.21.5–26.2) on 26.3 stops the server from starting at all**.
> It reports `Registry loading errors: doom.virtual.health:vitality`.
> On 26.3 use `v3.1.0-mc26.3`.

| Other | Does it work |
|---|---|
| Single-player world / server | Both; on a server use `world/datapacks/` |
| Experimental gameplay | No experimental gameplay needs to be enabled |

For the full version matrix, upgrading/downgrading, and "which file edits need a server restart" see [`docs/04-兼容与版本.md`](docs/04-兼容与版本.md).
The version-numbering rules (`vX.Y.Z`, when which digit goes up) are on that page too.

## Quick start

### Option one: auto_init (recommended)

```
/summon minecraft:zombie ~ ~ ~ {data:{dvh:{max_health:40d, health:40d}}, NoAI:1b}
```

### Option two: api/create (the traditional way, for any entity)

```
/execute as @n run function doom.virtual.health:api/create {with:{max_health:21.5, health:20}}
```

### Binding a Bossbar (optional)

```
/execute as @e[tag=virtual_health_entity] run function doom.bossbar:api/create {with:{name:'"Boss"',color:red,style:progress,visible:"true",targets:"@a"}}
```

### Damage / heal / invulnerability / multiplier

```
/execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/add_health {points:-500}
/execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/add_health_pct {pct:-25}
/execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/set_invulnerable {state:1b}
/execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/set_damage_mult {mult:200}
```

## Damage and healing mechanics

```
Health = 512f (vanilla probe, reset every tick)
  · takes a hit → Health drops
  · tick sampling: temp = Health × 2200, compared against baseline = 512 × 2200
  · delta = baseline - temp
  · delta × dvh.damage_mult / 2200 → mHP (×1000 scale)
  · dvh.health -= mHP
  · dvh.rem_damage += remainder (carried next time, prevents precision loss)
  · Health reset to 512f
  · dvh.health ≤ 0 → trigger_death

dvh.damage_mult defaults to 1000 = 100% damage
  mult=200  → 20% damage
  mult=500  → 50% damage
  mult=2000 → 200% damage (vulnerability)
```

Precision: 0.001 HP (mHP). Remainder compensation keeps long-run totals from drifting.

---

## API reference

### doom.virtual.health

All APIs run with `@s` as the virtual-health entity; a non-VH entity `return fail`s.

| Function | Parameters | Description |
| ---- | ---- | ---- |
| `api/create` | `{with:{max_health, health, on_death?}}` | Register virtual health (repeat calls return fail) |
| `api/remove` | `{with:{kill:1b/0b}}` | Remove virtual health; `kill:1b` also kills the entity (default 1b) |
| `api/add_health` | `{points:int}` | Add or subtract health; positive = heal / negative = damage |
| `api/add_health_pct` | `{pct:int}` | Add or subtract by percentage of max health (range ±100) |
| `api/set_health` | `{health:int}` | Force-set health (HP units, ≤0 triggers death) |
| `api/set_health_pct` | `{pct:int}` | Set health as a percentage of max health ([0,100]) |
| `api/set_max_health` | `{max_health:int}` | Set max health (HP units, floor 1000 mHP = 1 HP) |
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
| `debug` | (none) | Print detailed debug info (including bossbar / on_death) |
| `dvhentity` | `{target}` | Print an entity's status to the given player (`{target:"@s"}`) |

**Units**: `points` / `health` / `max_health` are all in **HP units** (internally ×1000 into mHP, fractions such as `points:-0.5` supported). The mHP APIs return the raw milli-value.

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

persist note: with `persist:1b` the health bar is not deleted automatically once the entity loses the VH tag (useful for deferred cleanup or keeping it across respawns).

### predicate checks

A predicate function `return 1`s when the condition holds. You **must set the `@s dvh.pp` / `@s dvh.pp_max` scoreboards first** (entity-level thresholds, [0,100]).

| Function | Condition |
| ---- | ---- |
| `predicate/is_invulnerable` | The entity is invulnerable |
| `predicate/below_percentage` | Health percentage < `@s dvh.pp` |
| `predicate/above_percentage` | Health percentage > `@s dvh.pp` |
| `predicate/between_percentage` | Health between `@s dvh.pp` and `@s dvh.pp_max` |
| `predicate/below_hp` | Health < `#dvh.hp_threshold` (HP units, pseudo-global) |
| `predicate/above_hp` | Health > `#dvh.hp_threshold` |
| `predicate/between_hp` | Health between `#dvh.hp_threshold_low` and `#dvh.hp_threshold_high` |

Example use (with `execute if`):

```
# trigger when health drops below 30%
scoreboard players set @e[tag=virtual_health_entity] dvh.pp 30
execute as @e[tag=virtual_health_entity] if function doom.virtual.health:api/predicate/below_percentage run say low HP!
```

---

## Death callback on_death

When it fires: runs when `dvh.health` drops to 0 (`trigger_death`).

Usage: `on_death` is an arbitrary command string, executed at the VH entity's position:

```
/execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/create {with:{max_health:100, health:100, on_death:"say I died"}}
```

Or at auto_init time:

```
/summon minecraft:zombie ~ ~ ~ {data:{dvh:{max_health:100d, health:100d, on_death:"function mypack:boss_death"}}, NoAI:1b}
```

Execution semantics:

- Equivalent to `execute at @s run <on_death command>`, where `@s` is the VH entity
- So do not write `@s[tag=virtual_health_entity]` (that selector is already invalid by the time the callback runs); just write `@s`
- After the callback runs, the entity is finished off by `damage out_of_world` (a direct damage if no attribution is set)
- If `on_death` is an empty string, it counts as no callback and the death flow runs directly
- Death attribution: with `on_death` set, UUID tracking is skipped (the `trigger_death` branch); otherwise it tracks `last_hurt_by_mob` and generates `damage ... by <uuid>` kill credit

Common forms:

```
on_death: "say A VH entity has died"
on_death: "function mypack:boss_killed"
on_death: "playsound minecraft:entity.wither.death master @a ~ ~ ~ 1 1"
on_death: "summon minecraft:item ~ ~ ~ {Item:{id:"minecraft:diamond",Count:1b}}"
```

## auto_init automatic initialization

When `/summon` gives the entity `data:{dvh:{...}}`, create + apply_trigger happen automatically on the first tick:

```
/summon minecraft:zombie ~ ~ ~ {data:{dvh:{max_health:"2000", health:"2000"}}, NoAI:1b}
```

- Supported fields: `max_health` / `health` / `on_death`
- Values may be numbers (double) or strings (e.g. `"2000"`, for mcdoc completion)
- Completion: Spyglass + the mcdoc plugin suggest keys at `data:{dvh:{`
- After auto_init, `apply_trigger` runs automatically (assigns the vitality trigger)

## vitality enchantment trigger

Purpose: the vitality enchantment sits on the entity's equipment so the in-game enchantment tick drives equipment bonuses / damage callbacks, replacing pure command polling.

- Enchantment file: `enchantment/vitality.json` (supported slots: saddle, mainhand)
- Riding entities (pig / horse / donkey / mule / skeleton horse / zombie horse / camel / strider) → mainhand slot
- Non-riding entities → saddle slot
- `api/apply_trigger` assigns it automatically by entity type, or you can call it yourself

The vitality enchantment's `minecraft:tick` effect drives `api/sync/equipment_bonus`:

- Scans `attribute_modifiers` (max_health) across the entity's 8 equipment slots
- Sums the bonuses → syncs them into `dvh.max_health` (computes the delta automatically, handles both increases and decreases)
- Enchantment level 255 (max_level), so items are never lost to stacking merges

Editing the enchantment JSON requires a server restart (`/reload` will not do it).

## Reading health

```
# read HP (÷1000)
execute store result score #hp obj run function doom.virtual.health:api/get_health
# read mHP (raw precision)
execute store result score #hp_mhp obj run function doom.virtual.health:api/get_health_mhp
# read percentage [0,100]
execute store result score #pct obj run function doom.virtual.health:api/get_percentage
# stats (write two scoreboards and scale)
execute as @e[tag=virtual_health_entity] run function doom.virtual.health:api/get_stats {damage_out:"#dmg", healing_out:"#heal", scale:1000}
```

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
| `dvh.damage_mult` | entity | Damage multiplier (×1000, default 1000 = 100%) |
| `dvh.saddle_bonus` | entity | Equipment bonus cache |
| `dvh.temp` | #virtual (fake player) | Internal temporary calculation |
| `dbb.temp` | #virtual (fake player) | bossbar temporary identifier |

## Tags

| Tag | Description |
| ---- | ---- |
| `virtual_health_entity` | VH entity marker |
| `dvh.invulnerable` | Invulnerable state |
| `dbb.has_bossbar` | Health bar already bound |

## mcdoc completion

3 mcdoc files provide Spyglass auto-completion:

| File | Completes |
| ---- | ---- |
| `mcdoc/doom.virtual.health.mcdoc` | `data modify storage doom.vh:ctx ...` |
| `mcdoc/doom.bossbar.mcdoc` | `data modify storage doom.dbb:ctx ...` |
| `mcdoc/doom.virtual.health.tags.mcdoc` | Function tag reference |

For example usage see `function/mcdoc.mcfunction`. mcdoc needs Spyglass + the `Misodee.vscode-mcdoc` extension.

## Known Edge Cases (boundary cases)

> ⚠️ Needs more player testing: these are the edge cases identified during code review, some already designed around and some limited by vanilla mechanics. Real-machine results are welcome in [Issues](https://github.com/DoomDecapitator/doom.virtual.health/issues).

### Numeric precision

| # | Scenario | Behaviour | Workaround |
|---|------|------|---------|
| E1 | `auto_init` NBT uses a double (e.g. `40d`) | The old macro expanded to `40.0`, which made scoreboard error out | Fixed to a `data get` version (accepts double/int/string) |
| E2 | `get_percentage` with health < 1 HP | Integer division, so the percentage may read 0 below 1 HP | For low health use `get_health_mhp` for exact readings |
| E3 | The scale of `get_percentage` / `get_stats` | `scale:0` divides by zero and errors | Use `scale:1` (mHP) or `scale:1000` (HP) |
| E4 | `add_health` with a large heal | Clamped to `max_health`, no overflow | `#max_safe` overflow protection is built in |
| E5 | `damage_mult` ceiling | Caps at 100000 (×100 = 10000%) | A ceiling guard is built in |

### Mechanic limits (vanilla limits, cannot be worked around)

| # | Scenario | Behaviour |
|---|------|------|
| E6 | Enormous single-tick damage (e.g. `/damage 999999`) | The Health probe detects at most a 512 HP delta per tick; the excess is truncated |
| E7 | Healing when the Health probe ceiling is 1024 | At most 512 HP restored per tick; the excess is lost |
| E8 | Entity in an unloaded chunk | tick detection pauses and virtual health does not change |
| E9 | Extremely small `damage_mult` (< 1%) | After flooring, a single hit may deal 0 |
| E10 | Entity killed directly by the `kill` command (bypassing VH) | `on_death` does not fire (vanilla kill never passes through the Health probe) |
| E11 | Entity has vanilla `Regeneration` / saturation regeneration | It triggers VH healing detection (a Health rise is read as healing) |
| E12 | Player entities | Supported, but a player death drops XP/inventory (vanilla behaviour, not controlled by VH) |

### Usage caveats

| # | Scenario | Behaviour |
|---|------|------|
| E13 | `on_death` command with complex quotes/macros | `$execute at @s run $(on_death)` macro expansion may break nested quotes |
| E14 | Multiple entities dying in the same tick | `trigger_death` uses global storage and runs synchronously, so there is no concurrency problem |
| E15 | `remove` immediately followed by `create` | You must wait 1 tick (vanilla entity NBT write delay) |
| E16 | bossbar `name` given a JSON array (multi-part text) | `$(name)` macro expansion may fail on nested quotes; use a single JSON object instead |

## Notes

- The `kill` parameter defaults to `{kill:1b}`, which kills the entity on removal; use `{kill:0b}` if you do not want that
- Never write `@s[tag=virtual_health_entity]` in the `on_death` callback (the selector is already invalid); use `@s` directly
- `add_health {points:<negative>}` has no effect on an invulnerable entity; `set_health` is unaffected by invulnerability
- Bossbar `api/create` called again returns fail
- The `scale` parameter: `scale:1` = mHP, `scale:1000` = HP
- Editing the enchantment JSON (vitality.json) requires a server restart
- Damage multiplier range `[1, 100000]` (×1000 scale)
- Test feedback: report anything unusual in [Issues](https://github.com/DoomDecapitator/doom.virtual.health/issues), with reproduction steps and version number

## File structure

```
doom.virtual.health/                ← the datapack body (1.21.5–26.2; the zip's top level also carries this name)
variants/
└── doom.virtual.health-26.3/       ← the 26.3-specific variant (command layer byte-identical to the above, one enchantment JSON changed)
```

`variants/` exists only to tell the two apart inside the repo. Both zips unzip to a standard datapack directory, so when installing, just drop the unzipped folder into `datapacks/` whole (do not put `variants/` in as well).

```
doom.virtual.health/                ← the datapack body (the zip's top level also carries this name)
├── pack.mcmeta                     ← the 1.21.5–26.2 form (sf 71–107 / min [71,0] / max 107)
├── mcdoc/                          ← 3 completion definitions
└── data/
    ├── minecraft/tags/function/    ← load.json · tick.json
    ├── doom.virtual.health/
    │   ├── enchantment/vitality.json
    │   └── function/               ← 51 mcfunction files
    │       ├── __load__ / __unload__ / __help__
    │       ├── debug / dvhentity / mcdoc
    │       ├── core/               ← main · detect_damage · setup
    │       ├── api/                ← create · remove · add/set/get · predicate/ · sync/
    │       └── internal/           ← apply_damage/heal · trigger_death · uuid_* · auto_create*
    └── doom.bossbar/function/      ← __load__ / __unload__ / __help__ · core/ · api/ · internal/
```

These top-level entries in the repo are for players and are not in the zip: `README.md` (this file) · `CHANGELOG.md` (version-by-version changes) · `dist/` (the built zips + checksums) ·
`docs/` (the player handbook) · `LICENSE` · `.github/` (the Issue forms).

## Where the docs are

| What you want | Where to go |
|---|---|
| The full install / upgrade / uninstall process | [`docs/01-安装.md`](docs/01-安装.md) |
| Every API with usage examples | [`docs/02-用法与API.md`](docs/02-用法与API.md) |
| storage layout, scoreboards, tags, NBT and mcdoc completion | [`docs/03-配置.md`](docs/03-配置.md) |
| Versions / `pack_format` / upgrading and downgrading / numbering rules | [`docs/04-兼容与版本.md`](docs/04-兼容与版本.md) |
| Licence, credits, AI collaboration and third-party boundaries | [`docs/05-致谢与许可.md`](docs/05-致谢与许可.md) |
| What changed in each version | [CHANGELOG.md](CHANGELOG.md) |
| The full document index | [`docs/README.md`](docs/README.md) |
| How to take that first-screen image | [`docs/图-首屏效果位.md`](docs/图-首屏效果位.md) |

The illustrated documentation site is at <https://doomdecapitator.github.io/doom.virtual.health/>, which is the repo's `docs/index.html`, published with the repo. If it will not open, the Markdown handbook in `docs/` says the same thing.

## Licence

[MIT](LICENSE): use it freely, modify it freely, bundle it into a modpack freely — just keep the copyright notice.
