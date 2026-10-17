# Changelog · doom.virtual.health

中文: `CHANGELOG.md`

> Scope: only player-visible changes are recorded: what changed, why, and what you can verify.
> Version numbering: `vX.Y.Z` (release) · `vX.Y.Z-beta.N` / `-rc.N` (prerelease); the Minecraft version is not stuffed into the version number,
> it lives in `pack.mcmeta` and [`docs/04-兼容与版本.md`](docs/04-兼容与版本.md).
> Target environment: Minecraft 1.21.5 – 26.3 (multi-version, shipped as two variants).

---

## v3.1.1 · attribution and link tidy-up (repack) · 2026-10-16

- [`dist/doom.virtual.health-v3.1.1.zip`](dist/doom.virtual.health-v3.1.1.zip): 1.21.5 – 26.2 (primary)
- [`dist/doom.virtual.health-v3.1.1-mc26.3.zip`](dist/doom.virtual.health-v3.1.1-mc26.3.zip): 26.3 only
 · sha256 `7de698051b48a820896d720ac6176f6de27735b3343dffd22cb489feb5ac12b6`
 · sha256 `92a6171b30ea1836e343dd66afc4f15d7ba059c6274f3743d1fab87f128e8e05`

> The command layer is byte-identical to v3.1.0; not a single character changed in the 63 mcfunction files.
> This release only tidies the author name and repository links inside the pack README (old username → `Doom_Flare`), then repacks the zips and recomputes their sha256 as the rules require.

### What you can verify

- All 92 entries of `dist/doom.virtual.health-v3.1.1.zip` are byte-identical to the same-named files under [`doom.virtual.health/`](doom.virtual.health) (0 differences).
- All 92 entries of `dist/doom.virtual.health-v3.1.1-mc26.3.zip` are byte-identical to the same-named files under [`variants/doom.virtual.health-26.3/`](variants/doom.virtual.health-26.3) (0 differences).
- Compared with v3.1.0, only `README.md` inside the pack differs; the other 91 entries are byte-identical.

---

## v3.1.0 · multi-version support (1.21.5 → 26.3) · 2026-10-05

Downloads:
- [`dist/doom.virtual.health-v3.1.0.zip`](dist/doom.virtual.health-v3.1.0.zip): 1.21.5 – 26.2 (primary)
  · sha256 `cd556d2b946fb4a8c24a37c242c4e0cedf6f9eb3d296614c0ad17af02032145b`
- [`dist/doom.virtual.health-v3.1.0-mc26.3.zip`](dist/doom.virtual.health-v3.1.0-mc26.3.zip): 26.3 only
  · sha256 `51bcccbc04d4742c689140863c166aa50e13a683c587735f4e4f741344db8816`

> Gameplay behaviour is identical to v3.0.0; not a single character changed in the 63 mcfunction files.
> What this release changes is whether it installs at all. 26.3 changed two things that would **stop the server from starting**.

### 1. Multi-version support table (MC version → which variant)

| MC version | data pack format | Which one | Enchantment JSON `vitality.json` |
|---|---|---|---|
| 1.21.5 | 71 | `v3.1.0` (repo root `doom.virtual.health/`) | as-is |
| 1.21.6 | 80 | same as above | as-is |
| 1.21.7 / 1.21.8 | 81 | same as above | as-is |
| 1.21.9 / 1.21.10 | 88.0 | same as above | as-is |
| 1.21.11 | 94.1 | same as above | as-is |
| 26.1 / 26.1.1 / 26.1.2 | 101.1 | same as above | as-is |
| 26.2 | 107.1 | same as above | as-is |
| 26.3 | 121.0 | `v3.1.0-mc26.3` (repo [variants/doom.virtual.health-26.3/](variants/doom.virtual.health-26.3)) | fixed for the 26.3 schema |
| 1.21.4 and older | ≤ 61 | ❌ not supported | — |

Why the split is unavoidable: 26.3 changed the JSON shape of the `enchantment` registry,
`condition` → `type`, and `requirements` from an array to a single object.
One JSON file cannot satisfy both sides (26.2 and earlier need the old form, 26.3 only accepts the new one) ⇒ a split is the only option.
The command layer is byte-identical between the two; the only difference is `pack.mcmeta` + `enchantment/vitality.json`.

> ⚠️ The old variant is unchanged: the `vitality.json` of the primary `v3.1.0` build is
> byte-identical to v3.0.0 (sha256 `38ac2a65…bafe1`), i.e. "the old version was not broken for 26.3's sake" ✓

### 2. What this round fixed (two hard breakages)

① The schema of `enchantment/vitality.json` changed in 26.3, which **stops the server from starting** ✗✗

```
[Worker-Main-18/ERROR]: Registry loading errors:
> Errors in registry minecraft:enchantment:
>> Errors in element doom.virtual.health:vitality:
Failed to parse doom.virtual.health:vitality from pack file/doom.virtual.health
Caused by: Not a JSON object: [{"condition":"minecraft:entity_properties",...}]
[main/WARN]: Failed to load datapacks, can't proceed with server load.
```
⇒ This is not "a feature silently stops working", it is the whole server refusing to start ✗.

Two schema changes (checked field by field against the vanilla 26.3 `data/minecraft/enchantment/bane_of_arthropods.json`):
1. `requirements` went from an "array" to a "single object": `[{...}]` → `{...}`
2. The predicate discriminator key was renamed: `"condition"` → `"type"`

> The change is located precisely at the `26.2 → 26.3` step (not "the whole 26.x line"):
> counting occurrences of `"condition"` across the vanilla enchantment JSON of 12 versions ⇒
> `56,56,56,56,55,55,60,65,65,65,**65**,**0**`. 26.2 still has 65 ✓, 26.3 drops to zero ✗.

> 🔴 This class is called a "loose → strict" breakage: `requirements` is a single object in all 12 vanilla versions ✓
> ⇒ this pack's original `[{...}]` array form was never compliant; it only survived because the old decoder "leniently accepted" it.
> Lesson: any form with no precedent in any vanilla version is a time bomb.

② `pack.mcmeta` was missing `min_format`/`max_format`: rejected outright from 1.21.9 on:
```
Couldn't load file/doom.virtual.health pack metadata:
  Pack declares support for version newer than 81, but is missing mandatory fields min_format and max_format
```
③ While there, the lower bound was tightened: the source pack declared `supported_formats 48–82`, but the code uses the `equipment:{}` form only introduced in 1.21.5
⇒ claiming a lower bound of 48 was wrong ✗ ⇒ this round tightens it to 71 (= 1.21.5), matching the real capability.

④ On 26.3 `supported_formats` is "forbidden" rather than "optional":
```
Pack key supported_formats is deprecated starting from pack format 82.
Remove supported_formats from your pack.mcmeta.
```
⇒ the boundary is "the declared range reaches 82+" ⇒ the 26.3 build was changed to the pure new form (keeping only `min_format`/`max_format`).
Re-running after the change: 0 deprecation warnings ✓.

### 3. Real-machine acceptance evidence

Three real-machine runs, each passing 12/12 assertions with 0 of the 8 load-error classes:

| Version | Java | Variant | 8 error classes | Summary line | Verdict |
|---|---|---|---|---|---|
| 1.21.5 | 21 | `v3.1.0` (legacy form) | all 0 ✓ | `pass=12 fail=0 total=12` | ✅ ALL PASS |
| 1.21.10 | 21 | `v3.1.0` (legacy form) | all 0 ✓ | `pass=12 fail=0 total=12` | ✅ ALL PASS |
| 26.3 | 25 | `v3.1.0-mc26.3` | all 0 ✓ | `pass=12 fail=0 total=12` | ✅ ALL PASS |

Key 26.3 comparison (proof that the schema fix really works):

| Point in time | Observation |
|---|---|
| Before the fix | ✗ `Failed to load datapacks, can't proceed with server load.` ⇒ the server would not start at all |
| After the fix | ✅ 0 `Registry loading errors` · server `Done` normally · suite 12/12 |

The 12 assertions cover: constants/targets / reading back `attribute max_health` 1024 / `Health*2200==1126400` /
end-to-end real damage / the `equipment.saddle` component path / bossbar sync / `out_of_world` hard kill /
a UUID hex damage actually killing the entity / 4 external API signatures callable.

### 4. What you can verify

- The 92 entries inside `dist/doom.virtual.health-v3.1.0.zip` are byte-identical to the same-named files under [`doom.virtual.health/`](doom.virtual.health) in the repo (0 differences).
- The 92 entries inside `dist/doom.virtual.health-v3.1.0-mc26.3.zip` are byte-identical to the same-named files under [`variants/doom.virtual.health-26.3/`](variants/doom.virtual.health-26.3) in the repo (0 differences).
- Compared with v3.0.0, the primary build differs in exactly one file, `pack.mcmeta` (the other 90 are byte-identical),
  with zero changes to the command layer; the public contract (the `dvh.health` / `dvh.max_health` / `dvh.temp` objectives,
  the `doom.vh:const.hex_chars` storage, the 4 API function signatures and `add_health`'s `{points}` macro parameter) is unchanged to the character ✓.

---

## v3.0.0 · first real artifact attached + repo reshaped for players · 2026-09-30

Download: [`dist/doom.virtual.health-v3.0.0.zip`](dist/doom.virtual.health-v3.0.0.zip) · sha256 `d271d11b12752493c74bf2875146e84c106f261c4e3c2166a1e5a479cf47be93`

### 1. Version-number correspondence (read this part first)

- `v3.0` (the tag from 2026-08-05) is left untouched, but it never carried any artifact; it is only a tag, with no zip.
  Its Release page is now marked "⚠️ superseded by v3.0.0" so players do not think the attachment went missing.
- `v3.0.0` is the canonical three-part version number for this release line, and the first artifact you can actually download.
  The two are the same version with no functional difference.
- Under the SPEC version rules, this round's changes are PATCH-level (no new capability, nothing players need to change).

### 2. Repo reshaped for players (affects the repo only, not gameplay)

- The top level was reorganised into README.md · LICENSE · CHANGELOG.md · dist/ · docs/ · doom.virtual.health/ · .github/:
  the first screen answers "what is this / which do I download / how do I install it / where is the source", and carries a hero-image slot (see [`docs/图-首屏效果位.md`](docs/图-首屏效果位.md)).
- Added `dist/` (the built zips + `SHA256SUMS.txt`), `CHANGELOG.md` (this file), `.github/ISSUE_TEMPLATE/` (two forms, bug / feature request),
  `.gitignore` and `.gitattributes` (`* -text`, locking bytes against newline rewriting).
- Added the five-page `docs/` player handbook: Installation · Usage and API · Configuration · Compatibility and Versions · Credits and Licence.
- The documentation site is kept and keeps serving: `docs/index.html` and `docs/.nojekyll` stay in `docs/` unchanged,
  and GitHub Pages still publishes from `docs/` → <https://doom-flare.github.io/doom.virtual.health/>.
  The version marker in the page was updated from `v3.0` to `v3.0.0`; nothing else moved.
- The datapack body was already at the top-level `doom.virtual.health/`, its position unchanged, every mcfunction readable directly.

### 3. Pack body sync (the only in-pack byte change this round)

The pack body on GitHub was frozen at 2026-08-05 (the `v3.0` merge), while the working copy had been changed once more on 2026-09-27.
This release moves the latest working copy over as-is (91 files). Relative to the old in-repo version there are only 3 differences, none of which changes in-game behaviour:

- `mcdoc/doom.virtual.health.mcdoc`: 1496 B → 2628 B. Replaced the `[string]: any` "accepts anything" fallback with explicit key names
  (`with` / `uid0..3` / `uid_hex` / `on_death` / `state` / `_` / `trigger` / `b0..bf` / `h0..hf`),
  and added explanatory notes. Effect: a mistyped key name when writing `data modify storage doom.vh:ctx ...` is flagged on the spot, instead of silently creating a slot nobody reads.
  The slot list is aligned key by key with what `internal/uuid_hex` and `api/apply_trigger` actually use inside the pack (which is why it is more useful than the old version).
- `pack.mcmeta`: `supported_formats` rewritten from one line to several. The values are unchanged to the character (`min_inclusive: 48` · `max_inclusive: 82`),
  and even the description string `§cDVH v3.0 §7+ §9DBB` is unchanged (same version, not an old pack).
- `data/doom.virtual.health/function/__unload__.mcfunction`: removed the leading UTF-8 BOM.
  The old version of this file began with the 3 bytes `EF BB BF` while the other 90 files did not; removing it makes it consistent with the whole pack
  and avoids some tools/load paths treating the BOM as part of the first command.

> Note: the `mcdoc` and BOM changes are in-pack byte changes, so this release had to be cut (rather than "docs only"), which is exactly clause 3 of the release rules.

### 4. What you can verify (all the numbers can be recomputed)

- The pack body's 91 files (63 `.mcfunction` + 24 `.json` + 3 `.mcdoc` + `pack.mcmeta`),
  byte-identical to the latest working copy (0 differences).
- The 91 entries inside `dist/doom.virtual.health-v3.0.0.zip` are byte-identical to the same-named files under [`doom.virtual.health/`](doom.virtual.health) in the repo (0 differences).
- `dist/SHA256SUMS.txt`, the Release attachment digest, and the string at the top of this file are all the same value.
- The repo top level contains only allowlisted entries; the leak scan got 0 hits (see [`docs/README.md`](docs/README.md)).
- This release did not do real-machine load verification (this round only touched the repo shape and version numbers, never the runtime logic); the real-machine conclusions from the previous round still stand for v3.0.

---

## v3.0 · 2026-08-05 (tag kept · no artifact)

- Merged "DVH v3.0 unified": entity-level percentage thresholds `dvh.pp` / `dvh.pp_max`, the `auto_create` macro,
  `pack_format` raised to 81 (1.21.7 / 1.21.8), and a ceiling guard for `damage_mult` (H7).
- Two commits the same day filled in the documentation: the full API reference, the `on_death` section, and notes on vitality and predicates; fixed `auto_init`'s handling of doubles
  (switched to `data get`, accepting double / int / string), and added the "Known Edge Cases" section.
- This tag carries no zip. To use this version, download [`v3.0.0`](https://github.com/Doom-Flare/doom.virtual.health/releases/tag/v3.0.0).

## v2.x and earlier

Early versions (the three internal builds v1.1 / v2.1 / v3.0) only circulated in a local working copy; there are no artifacts on GitHub and they are no longer maintained. The API in the current pack has evolved several rounds past those versions,
so do not take a pack from an old directory; `dist/` in this repo is authoritative.
