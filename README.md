# Gomoku Web Game

A lightweight browser-based Gomoku game with a simple robot opponent.

## Play

- Local file: open `index.html` in your browser
- Local server:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`.

- GitHub Pages:
  - Intended URL: `https://nealyip.github.io/gomoku/`
  - If the page is not live yet, enable it in repository `Settings -> Pages` with:
    - Source: `Deploy from a branch`
    - Branch: `main`
    - Folder: `/ (root)`

## Features

- 15 x 15 Gomoku board
- Human vs robot gameplay
- Win detection for five in a row
- Simple attack-and-defend robot scoring
- Move counter
- Restart button
- Last robot move highlight toggle
- Mobile-friendly layout

## How To Play

1. You play black and move first.
2. Click any empty intersection to place a stone.
3. The robot responds automatically.
4. Connect five stones in a row to win.

## Files

- `index.html` - page structure
- `style.css` - visual design and responsive layout
- `script.js` - game rules, rendering, and robot logic

## Tech

- Vanilla HTML
- Vanilla CSS
- Vanilla JavaScript
