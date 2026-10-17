# Doc index · doom.virtual.health

中文: `docs/README.md`

> Want to install it right away: grab [`../dist/`](../dist) `doom.virtual.health-v3.1.1.zip` (1.21.5–26.2) or `doom.virtual.health-v3.1.1-mc26.3.zip` (26.3), unzip, drop `doom.virtual.health/` into `datapacks/` → `/reload`.
> Want to read the code first: the source is the datapack itself, [`../doom.virtual.health/`](../doom.virtual.health), 63 mcfunction files. No generator, no `src/`.
> Want the illustrated site: <https://doom-flare.github.io/doom.virtual.health/>. That is this directory's `index.html`, published with the repo.
> Want to know what changed in each version: see [`../CHANGELOG.md`](../CHANGELOG.md).

| Document | What it covers | When to read it |
|---|---|---|
| [01 · Installation and uninstallation](01-安装.md) | The single-player / server paths, how to confirm it installed, how to uninstall cleanly, what to check when it will not install | First install |
| [02 · Usage and API](02-用法与API.md) | Every API: create / remove / add / set / get / predicate / bossbar, `auto_init`, `on_death`, the vitality trigger | When you are about to write commands |
| [03 · Configuration](03-配置.md) | storage layout, entity NBT (`data:{dvh:{…}}`), the scoreboard and tag lists, how to turn on mcdoc completion | When hooking up your own pack / when you want completion |
| [04 · Compatibility and versions](04-兼容与版本.md) | `pack_format` and `supported_formats`, the version matrix, upgrading and downgrading, which file edits need a server restart, the version-numbering rules | Switching versions / picking a build / releasing |
| [05 · Credits and licence](05-致谢与许可.md) | The licence is MIT, the AI-collaboration stance, third-party boundaries, credits | Reposting / commercial use |
| [Hero image slot](图-首屏效果位.md) | What the README's first-screen image should show, how to take it, where to put it | Helping this repo with the missing image |

## Conventions

- Version numbers: `vX.Y.Z`. Currently `v3.1.1`. Wherever a version number appears in the docs, it describes that version's actual behaviour.
- Which build counts as "the repo body": [`../doom.virtual.health/`](../doom.virtual.health). It is byte-identical to the zip under [`../dist/`](../dist),
  so the docs do not distinguish "repo version" from "download version"; they are the same thing.
- This pack has no generator: editing the pack = editing the mcfunction files under `doom.virtual.health/data/doom.virtual.health/function/` directly.
  To bring the zip along after an edit, you need to repack it (**the top-level directory inside the zip must be `doom.virtual.health/`**);
  the repo's own packaging/acceptance scripts live in a private development repo (not public), and their rule is "every entry inside the zip is byte-identical to the repo body".
- Things this repo will never contain: test rigs, real-machine acceptance logs, round-by-round reports, intermediate build-script outputs — none of those go into a player-facing repo.

## Running into problems

First check the version matrix in [04 · Compatibility and versions](04-兼容与版本.md), and the "Known Edge Cases" and "Notes" sections at the end of [02 · Usage and API](02-用法与API.md),
then report it in the repo's [Issues](https://github.com/Doom-Flare/doom.virtual.health/issues), where a form will ask you for the version, reproduction steps and logs.
