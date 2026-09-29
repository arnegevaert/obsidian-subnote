# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This repo is currently the stock **Obsidian sample plugin** template (`manifest.json` id is still `sample-plugin`, class is still `MyPlugin`), not yet customized into the "subnote" plugin the repo name implies. When adding real functionality, replace the sample command/modal/setting scaffolding in `src/main.ts` and `src/settings.ts` rather than building alongside it.

A detailed `AGENTS.md` already exists at the repo root with the full set of conventions (manifest rules, versioning/release process, UX copy guidelines, mobile constraints, security/privacy policy). Read it — this file only summarizes what's needed day-to-day.

## Commands

```bash
npm install       # install deps
npm run dev        # esbuild in watch mode, compiles src/main.ts -> main.js
npm run build       # tsc -noEmit -skipLibCheck, then esbuild production build (minified, no sourcemap)
npm run lint        # eslint . (uses eslint-plugin-obsidianmd)
npm version patch|minor|major   # bumps manifest.json + package.json + versions.json (via version-bump.mjs), stages the files
```

There is no test suite/framework configured — `npm run build` (type check) and `npm run lint` are the only automated checks. CI (`.github/workflows/lint.yml`) runs `npm run build` and `npm run lint` on Node 20/22/24 for every push and PR.

To manually verify a change in Obsidian: run `npm run build`, then copy `main.js`, `manifest.json`, and `styles.css` into `<Vault>/.obsidian/plugins/<plugin-id>/`, reload Obsidian, and enable the plugin.

## Architecture

- **Entry point**: `src/main.ts` — exports the default `Plugin` subclass, handles `onload`/`onunload`, loads/saves settings via `this.loadData()`/`this.saveData()`, and registers commands/ribbon icons/status bar items/settings tab. Keep this file to plugin lifecycle only; put feature logic in separate modules (`commands/`, `ui/`, `utils/`, etc. — none exist yet).
- **Settings**: `src/settings.ts` — defines the settings interface, `DEFAULT_SETTINGS`, and the `PluginSettingTab` subclass. Settings are merged with `Object.assign({}, DEFAULT_SETTINGS, await loadData())` in `main.ts`.
- **Build**: `esbuild.config.mjs` bundles `src/main.ts` into a single CJS `main.js` at the repo root, banner-stamped as generated. `obsidian`, `electron`, all `@codemirror/*`/`@lezer/*` packages, and Node builtins are marked external (provided by the Obsidian runtime) — do not bundle these. Production builds are minified with no sourcemap; dev builds have inline sourcemaps and are rebuilt on file change via `context.watch()`.
- **Release artifacts**: `main.js`, `manifest.json`, and `styles.css` are the only files that ship — never commit `main.js` (it's generated) or `node_modules`. `versions.json` maps plugin version → minimum required Obsidian app version; `manifest.json`'s `id` must never change after release.
- **Linting**: `eslint.config.mts` (flat config) extends `eslint-plugin-obsidianmd`'s recommended rules, with browser globals and type-aware linting rooted at the repo's `tsconfig.json`.
- **TypeScript**: strict mode, ES2021 target/lib + DOM, ESNext modules, `noUncheckedIndexedAccess` and `noImplicitReturns` on. Only `src/**/*.ts` is included.

## Conventions specific to this repo

- Indentation is tabs (width 4), single quotes, LF line endings, final newline required (`.editorconfig`).
- `.npmrc` sets `tag-version-prefix=""` — release git tags must match `manifest.json`'s version exactly, no leading `v`.
- Register all event listeners, DOM events, and intervals via `this.registerEvent` / `this.registerDomEvent` / `this.registerInterval` so they're cleaned up automatically on plugin unload — don't wire raw `addEventListener`/`setInterval` in a way that needs manual teardown.
- Avoid Node/Electron APIs unless `isDesktopOnly` is intentionally set to `true` in `manifest.json`; the plugin currently targets both desktop and mobile.
- No network calls, remote code execution/eval, or vault access outside plugin scope without a clear user-facing reason, explicit opt-in, and documentation in `README.md`/settings (Obsidian developer policy).
