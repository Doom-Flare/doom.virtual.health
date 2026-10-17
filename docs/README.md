# 文档索引 · doom.virtual.health
English: `docs/README.en.md`

> 想直接装：去 [`../dist/`](../dist) 下 `doom.virtual.health-v3.1.1.zip`（1.21.5–26.2）或 `doom.virtual.health-v3.1.1-mc26.3.zip`（26.3），解压后把 `doom.virtual.health/` 丢进 `datapacks/` → `/reload`。
> 想先看代码：源码就是数据包本体 [`../doom.virtual.health/`](../doom.virtual.health)，63 个 mcfunction。没有生成器，也没有 `src/`。
> 想看图文站：<https://doom-flare.github.io/doom.virtual.health/>。就是本目录的 `index.html`，随仓库一起发布。
> 想知道每版改了什么：看 [`../CHANGELOG.md`](../CHANGELOG.md)。

| 文档 | 讲什么 | 读它的时机 |
|---|---|---|
| [01-安装](01-安装.md) | 单人 / 服务器两条路径、怎么确认装上了、怎么卸干净、装不上怎么查 | 第一次装 |
| [02-用法与API](02-用法与API.md) | 全部 API：create / remove / add / set / get / predicate / bossbar、`auto_init`、`on_death`、vitality 触发器 | 要写命令的时候 |
| [03-配置](03-配置.md) | storage 布局、实体 NBT（`data:{dvh:{…}}`）、计分板与标签清单、mcdoc 补全怎么开 | 要接自己的包 / 要补全 |
| [04-兼容与版本](04-兼容与版本.md) | `pack_format` 与 `supported_formats`、版本矩阵、升级降级、改哪些文件要重启服务器、版本号规则 | 换版本 / 选包 / 发布 |
| [05-致谢与许可](05-致谢与许可.md) | 许可是 MIT、AI 协作口径、第三方边界、致谢 | 要转发 / 要商用 |
| [图-首屏效果位](图-首屏效果位.md) | README 第一屏那张图要拍什么、怎么拍、放哪里 | 要帮这个仓库补图 |

## 口径说明

- 版本号：`vX.Y.Z`。当前 `v3.1.1`。文档里出现版本号的地方，就是那一版的实际行为。
- “仓库本体”指哪份：指 [`../doom.virtual.health/`](../doom.virtual.health)。它与 [`../dist/`](../dist) 里的 zip 逐字节相同，
  所以文档不用区分“仓库版”和“下载版”，它们是同一份。
- 本包没有生成器：改包 = 直接改 `doom.virtual.health/data/doom.virtual.health/function/` 里的 mcfunction。
  改完想让 zip 跟上，需要重新压一个（**zip 内顶层目录必须是 `doom.virtual.health/`**）；
  仓库自带的打包/验收脚本在私有开发仓库（不对外），口径是“zip 内每个条目与仓库本体逐字节相同”。
- 仓库里不会有的东西：测试台、真机验收日志、逐轮报告、构建脚本的中间产物，这些不进玩家向仓库。

## 遇到问题

先对一下 [04-兼容与版本](04-兼容与版本.md) 里的版本矩阵，以及 [02-用法与API](02-用法与API.md) 末尾的「已知 Edge Cases」与「注意事项」，
再去仓库的 [Issues](https://github.com/Doom-Flare/doom.virtual.health/issues) 报，那里有表单，会问你要版本、复现步骤和日志。
