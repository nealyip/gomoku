# AGENTS.md

## Project Context

This repository contains a static Gomoku web game deployed on GitHub Pages.

## Working Rules

- When updating `style.css` or `script.js`, also update the asset version reference in `index.html`.
- Prefer cache-busting query strings such as `style.css?v=...` and `script.js?v=...` because GitHub Pages does not provide custom cache-control headers.
- Preserve mobile layout compatibility when changing UI or layout code.
- Keep the game lightweight and browser-first. Avoid adding unnecessary dependencies unless explicitly requested.
- Do not change gameplay rules or AI behavior unless the user asks for it.
- Keep SEO / GEO metadata intact unless the user asks to revise search-facing copy.

## Deployment Notes

- The site is intended to be served from GitHub Pages at `https://nealyip.github.io/gomoku/`.
- Static verification files such as Google Search Console HTML files may need to remain in the repository root.
