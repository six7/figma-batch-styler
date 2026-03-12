# Copilot Instructions for Figma Batch Styler

## Project Overview

Batch Styler is a **Figma plugin** that enables batch editing of text and color styles in Figma documents. Users can update multiple styles at once (font family, weight, size, line height, letter spacing, colors via HSL/hex), search/filter styles by name, delete styles in bulk, and map missing font weights.

## Tech Stack

- **UI Framework**: Svelte 3
- **Language**: TypeScript and JavaScript
- **Bundler**: Rollup 1.x (two separate bundles for UI and worker threads)
- **CSS**: SCSS with PostCSS and CSSNano
- **Package Manager**: npm
- **UI Components**: `figma-plugin-ds-svelte` (Figma Design System for Svelte)

## Architecture

This is a Figma plugin with a **two-thread architecture**:

### Worker Thread (`src/code.ts` → `public/code.js`)
- Runs in Figma's main process with access to the Figma Plugin API
- Manages style objects directly (`figma.getLocalTextStyles()`, `figma.getLocalPaintStyles()`)
- Communicates with UI via `figma.ui.postMessage()` and `figma.ui.onmessage`
- Output format: CommonJS

### UI Thread (`src/main.js` → inlined into `public/index.html`)
- Rendered in a sandboxed iframe; **cannot** access the Figma API directly
- Communicates with worker via `parent.postMessage({ pluginMessage: ... }, "*")` and `onmessage`
- Output format: IIFE (all assets inlined into a single HTML file)

### Message Types
| Message | Direction | Purpose |
|---------|-----------|---------|
| `postStyles` | Worker → UI | Send all styles and available fonts |
| `update` | UI → Worker | Batch-update selected styles |
| `remove` | UI → Worker | Delete selected styles |
| `refresh` | UI → Worker | Reload the styles list |
| `trackEvent` | Worker → UI | Trigger Amplitude analytics |

### Plugin Manifest (`public/manifest.json`)
Defines the plugin ID, API version, and entry points (`code.js` and `index.html`).

## Source File Layout

All source files live in `src/`:

| File | Purpose |
|------|---------|
| `main.js` | Svelte app entry point — mounts `PluginUI` to `document.body` |
| `code.ts` | Plugin worker thread — Figma API interactions |
| `PluginUI.svelte` | Root UI component with tab navigation and top-level state |
| `TextStyles.svelte` | Text style editing form and batch update logic |
| `ColorStyles.svelte` | Color style editing form and batch update logic |
| `Selector.svelte` | Multi-select style picker |
| `Input.svelte` | Reusable text input component |
| `Loading.svelte` | Loading spinner |
| `NoneFound.svelte` | Empty state display |
| `MissingWeightsDialog.svelte` | Dialog for mapping unavailable font weights |
| `helpers.ts` | Utilities for LineHeight/LetterSpacing Figma type conversions |
| `color-helpers.js` | RGB ↔ HSL ↔ Hex color conversion functions |
| `figma.d.ts` | Figma Plugin API TypeScript type definitions |
| `template.html` | HTML template for the UI bundle |

Build output goes to `src/build/` (gitignored) and `public/`.

## Build & Development

```bash
npm install        # Install dependencies
npm run build      # Production build (minified)
npm run dev        # Watch mode with livereload
npm run start      # Serve public/ for local preview (called automatically by dev)
```

The Rollup config (`rollup.config.js`) produces two bundles:
1. **UI bundle**: Svelte → JS/CSS → inlined into a single HTML file via `rollup-plugin-html-bundle`
2. **Worker bundle**: TypeScript → CommonJS JS file

Production builds enable Terser minification. Dev builds enable livereload.

## Testing

There is no test framework currently configured. When adding tests, consider:
- Unit tests for `helpers.ts` and `color-helpers.js` utility functions
- Component tests for Svelte components

## Linting & Formatting

No linter or formatter is currently configured. The codebase follows these observed conventions — maintain them for consistency.

## Code Conventions

### Naming
- **Components**: PascalCase (`TextStyles.svelte`, `PluginUI.svelte`)
- **Functions/variables**: camelCase (`updateColorStyles`, `selectedStyles`)
- **CSS classes**: kebab-case (`.tab-button-active`, `.inner-wrapper`)

### Svelte Component Structure
Follow this ordering within `.svelte` files:
```svelte
<script>
  // 1. Imports
  // 2. Exported props (export let ...)
  // 3. Local state variables
  // 4. Reactive declarations ($: ...)
  // 5. Lifecycle hooks (onMount, etc.)
  // 6. Functions
</script>

<style lang="scss">
  /* Component-scoped SCSS */
</style>

<!-- Template markup -->
```

### State Management
- Use Svelte reactive declarations (`$:`) — no external state management library
- Pass data between components via props
- Communicate between UI and worker threads via message passing only

### Key Patterns

**Selective update payloads** — only include changed properties when sending updates to the worker:
```js
let values = {};
if (originalFamilyNames !== familyName) {
  values.familyName = familyName;
}
```

**Batch value distribution** — the `fillToLengthOfSelected` pattern repeats/cycles comma-separated input values across selected styles.

**Set deduplication** — use `[...new Set(array)]` to display unique values when multiple styles are selected.

**Color space conversions** — Figma uses normalized RGB `[0–1]`; the UI works in HSL and hex. All conversions go through `color-helpers.js`.

**Async font loading** — use `figma.loadFontAsync()` with `Promise.all()` before modifying text styles.

### Indentation & Formatting
- 2-space indentation
- Semicolons required
- Single quotes preferred in JS/TS; double quotes in HTML attributes

## Dependencies

When adding dependencies, prefer packages from the Svelte ecosystem and keep the bundle small since everything is inlined into a single HTML file for the plugin UI. Use `figma-plugin-ds-svelte` components for UI elements to maintain visual consistency with Figma's design system.

## TypeScript

The `tsconfig.json` targets ES6 with minimal configuration. Figma API types are provided by the local `src/figma.d.ts` declaration file rather than an npm package.

## Working with the Figma Plugin API

- The `figma` global is only available in the worker thread (`code.ts`), never in UI code
- Style updates require loading fonts first via `figma.loadFontAsync()`
- The plugin UI size is set to 400×780 pixels
- Always handle the case where fonts may not be available (see `MissingWeightsDialog.svelte`)
