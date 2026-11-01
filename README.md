# DON'T TOUCH THE RED ⚡

A commercial-quality, high-octane neon cyber arcade game built with **Phaser 3**, **HTML5**, **CSS**, **JavaScript (ES Modules)**, and **Vite**.

![Tech Stack](https://img.shields.io/badge/Phaser-3.90-blue?style=flat-square)
![Build Tool](https://img.shields.io/badge/Vite-8.3-green?style=flat-square)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Desktop%20%7C%20Mobile-cyan?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)

---

## 🎮 Game Overview

Command the **CYBER ORB** — an agile, reactive glowing neon sphere. Weave through lethal red obstacles, collect blue energy orbs to build up massive combos, compete in seeded daily challenges, unlock achievements, and challenge friends!

### Core Mechanics & Features
- **Dodge Lethal Red Hazards**: Any contact with red hazards is fatal (unless protected by an energy shield).
- **Collect Blue Energy Orbs**: Grants points and escalates your **Combo Multiplier** (`x1` ➔ `x8 MAX POWER!`).
- **Dynamic Combo Tiers**:
  - `x2`: GOOD (Cyan)
  - `x3`: GREAT (Electric Blue)
  - `x4`: SUPER (Purple)
  - `x5`: ULTRA (Gold)
  - `x6`: MEGA (Amber)
  - `x7`: HYPER (Ruby)
  - `x8`: MAX POWER! (Prismatic Yellow)
- **Near-Miss System**: Graze past red obstacles within hair-breadth proximity to trigger electric arc discharges, **"CLOSE CALL! +50"** bonus points, and camera micro-shakes.
- **Fair Difficulty Progression**: Hazard speed and wave density ramp up every 18 seconds (Level 1 ➔ 10+), while guaranteeing fair dodging clearance and avoiding impossible choke-points.
- **Tactical Powerups**:
  - 🛡️ **Shield**: Multi-layer hexagonal energy barrier with 3 rotating satellite nodes that absorbs 1 fatal hit.
  - ⏱️ **Time Warp**: Slows all active hazards by ~60% for 4.5 seconds with matrix tint.
  - 💥 **EMP Blast**: Detonates all on-screen red obstacles into harmless blue energy particles.

---

## 🌟 Player Retention & Social Features

### 1. 📅 Daily Challenge Mode
- **Fixed-Seed Deterministic Obstacles**: Every player worldwide faces the exact same sequence of obstacle waves, hazard speeds, and orb locations each calendar day.
- **Powered by Seeded PRNG**: Uses a deterministic 32-bit Mulberry32 algorithm keyed to the current UTC date string (`YYYY-MM-DD`).
- **Daily Personal Best**: Tracks and displays your daily record alongside today's date on the Start Screen and Game Over screen.
- **Quick Mode Switching**: Seamlessly toggle between **Endless Arcade** and **Daily Challenge** on the title screen.

### 2. 🏆 Achievement System
All progress is saved persistently in `localStorage` without requiring any account or backend:
1. ⚡ **FIRST SURVIVAL**: Complete your first run surviving for at least 15 seconds.
2. 🎯 **NEON NOVICE**: Score 1,000 points in a single run.
3. 🏆 **APEX DODGER**: Score 5,000 points in a single run.
4. ⏱️ **CLOCKWORK REFLEXES**: Survive for 60 seconds in a single run.
5. 💎 **ENERGY SIPHON**: Collect 100 energy orbs in total (features persistent progress tracking).

- **Real-Time Toast Notifications**: In-game animated achievement banners slide into view with sound fanfares whenever an achievement is unlocked during play.
- **Achievements Modal**: View unlocked/locked badges, conditions, and live orb progress directly from the title screen.

### 3. 📤 Social Sharing & Challenge System
- **Web Share API with Clipboard Fallback**:
  - Native share sheet opens automatically on mobile (iOS/Android) and supported desktop browsers.
  - Automatic fallback to clipboard copy with visual feedback toast on unsupported browsers.
- **Viral Challenge Copy**:
  - Includes: `"Can you beat my score in DON'T TOUCH THE RED? ⚡"`
  - Mentions the score, rank achieved, and game mode (Endless vs Daily Challenge date).
  - Includes game title and URL for instant challenge invites.

### 4. 📊 Personal Best & Previous Best Comparison
- The Game Over screen clearly displays:
  - **Final Score** (with rolling counter and audio ticks)
  - **Personal Best** (All-time or today's daily best)
  - **Previous Best** (Your best score prior to this game)
  - **Arcade Rank** (S+, S, A, B, C, D)
  - Time Survived, Orbs Collected, Max Combo, and Close Calls

---

## 🕹️ Controls

| Platform | Controls | Action |
| :--- | :--- | :--- |
| **Desktop Keyboard** | `Arrow Keys` or `W`, `A`, `S`, `D` | 8-directional smooth movement with velocity squash & stretch |
| **Desktop Mouse** | `Click & Drag` pointer | Steer Cyber Orb directly |
| **Mobile / Tablet** | `Touch & Drag` anywhere | Responsive touch steering with thumb offset for clear ball visibility |
| **Pause Game** | `P` or `ESC` or top HUD button | Pause / Resume menu with audio toggle |
| **Audio Toggle** | `M` or HUD speaker button | Toggle procedural sound effects & cyber synth music |
| **Quick Restart** | `SPACE` or `ENTER` | Instant start on Menu & Game Over screens |

---

## 🚀 Launching & Testing Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer).

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local Dev Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Build for Production
```bash
npm run build
```
Generates the optimized static distribution in `dist/`.

### 4. Preview Production Build
```bash
npm run preview
```
Serves the production bundle at **`http://localhost:4173`**.

---

## 📁 Project Structure

```
dont touch red/
├── index.html                   # HTML entry with viewport & meta tags
├── package.json                 # Project dependencies & npm scripts
├── vite.config.js               # Vite bundler configuration (relative base, ES2020)
├── public/
│   └── favicon.svg              # Neon glowing cyber orb SVG icon
└── src/
    ├── main.js                  # Phaser 3 Game initialization & Scale Manager
    ├── config.js                # Game configuration, storage keys, combo tiers, ranks
    ├── style.css                # Responsive arcade styling, ambient cyber glow, mobile optimizations
    ├── audio/
    │   └── SoundManager.js      # Procedural Web Audio API synthesizer (no external audio files needed)
    ├── entities/
    │   ├── Player.js            # Player orb, squash & stretch, dual-layer trail, shield nodes, arc FX
    │   ├── Orb.js               # Blue energy orbs & powerups with magnetic drift & shockwaves
    │   └── Obstacles.js         # Red hazards: Mines, Laser Walls, Spinners, Telegraphed Darts, Chasers
    ├── managers/
    │   ├── PRNG.js              # Deterministic Mulberry32 PRNG for daily fixed seeds
    │   ├── DailyChallengeManager.js # Daily seed generation, date sync & daily best tracking
    │   ├── AchievementManager.js    # 5 Achievements, live unlock checks & persistence
    │   ├── ScoreManager.js      # Score tracking, personal best vs previous best, localStorage
    │   └── PatternGenerator.js  # Procedural wave sequencer (supports seeded & random modes)
    └── scenes/
        ├── BootScene.js         # Procedural canvas texture generator (zero external assets)
        ├── MenuScene.js         # Title screen, mode selector pills, achievements modal, trophy card
        ├── GameScene.js         # Core loop, HUD, in-game achievement toast, rolling score counter
        ├── PauseScene.js        # Frosted glass pause menu with resume/retry/audio toggle
        └── GameOverScene.js     # Results breakdown, Personal vs Previous best, Web Share & Retry
```

---

## 💎 Technical Highlights

- **100% Free & In-Engine Procedural Textures**: All textures (glows, shields, mines, trophies, medals, share icons, stars, sheens) are rendered on HTML5 Canvas in `BootScene`. Zero external image dependencies.
- **Zero Backend Required**: All achievements, daily challenges, high scores, previous bests, and audio settings are safely stored in browser `localStorage`.
- **Cross-Platform Social Sharing**: Web Share API provides native sharing on iOS & Android devices, with automatic fallback to clipboard copy on desktop.
- **Tuned 60 FPS Performance**: Particle emitters and sound nodes are pooled and optimized to prevent frame drops on mid-range mobile and desktop devices.
