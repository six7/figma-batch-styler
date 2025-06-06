# Copilot Instructions for Figma Batch Styler

## Project Overview
Batch Styler is a Figma plugin that allows users to batch update text and color styles. The plugin provides a UI for modifying multiple styles simultaneously, supporting changes to typography (font family, weight, size, line height, letter spacing) and colors (HSL, hex values).

## Architecture & Technology Stack
- **Frontend**: Svelte 3.x with TypeScript
- **Build Tool**: Rollup with multiple plugins (svelte, typescript, postcss, html-bundle)
- **Plugin Environment**: Figma Plugin API (code.ts runs in Figma's sandbox, UI components run in browser)
- **Styling**: PostCSS with cssnano for optimization
- **Development**: Live reload via rollup-plugin-livereload

## Key Files & Structure
- `src/code.ts` - Main plugin logic (Figma API interactions, style updates)
- `src/main.js` - UI entry point, mounts Svelte app
- `src/PluginUI.svelte` - Main UI component
- `src/figma.d.ts` - Figma API type definitions
- `public/manifest.json` - Figma plugin manifest
- `rollup.config.js` - Build configuration (dual output: UI bundle + plugin code)

## Development Workflow
1. `npm install` - Install dependencies
2. `npm run build` - Production build 
3. `npm run dev` - Development with live reload
4. Link `public/manifest.json` in Figma to test plugin

## Code Style & Patterns
- TypeScript for type safety
- Svelte reactive patterns for UI state
- Async/await for Figma API calls
- Event-driven communication between plugin code and UI via `figma.ui.postMessage`
- Color utilities in `color-helpers.js` for HSL/RGB/hex conversions

## Known Issues & Limitations
- **Build Warning**: Current build may fail due to svelte-color dependency compatibility issues
- **No Test Suite**: Project lacks automated tests
- **Legacy Dependencies**: Some packages are deprecated (rollup-plugin-terser, rollup-plugin-typescript)

## Development Notes
- Plugin code (`code.ts`) has access to Figma document but no DOM
- UI code runs in browser iframe with full DOM access  
- Communication between contexts via message passing
- Font loading requires async operations with Figma API
- Style updates batch processed for performance