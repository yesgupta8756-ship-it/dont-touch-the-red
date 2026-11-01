/**
 * DON'T TOUCH THE RED - Game Configuration
 * Commercial-grade arcade settings, palette, responsive dimensions, and progression curves.
 */

export const GAME_CONFIG = {
  width: 900,
  height: 960,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  colors: {
    bgDark: 0x05060f,
    bgCard: 0x0a0f28,
    neonCyan: 0x00f0ff,
    neonCyanHex: '#00f0ff',
    neonRed: 0xff0055,
    neonRedHex: '#ff0055',
    neonBlue: 0x0077ff,
    neonBlueHex: '#0077ff',
    neonGold: 0xffcc00,
    neonGoldHex: '#ffcc00',
    neonPurple: 0xbd00ff,
    neonPurpleHex: '#bd00ff',
    neonGreen: 0x00ffaa,
    neonGreenHex: '#00ffaa',
    white: 0xffffff,
    whiteHex: '#ffffff',
    textMuted: '#7f93b0'
  },
  player: {
    radius: 17,
    speed: 480,
    friction: 0.88,
    nearMissRadius: 42
  },
  scoring: {
    orbBaseScore: 100,
    nearMissScore: 50,
    comboWindowMs: 3800,
    maxCombo: 8
  },
  comboTiers: [
    { combo: 1, name: '', color: '#00f0ff' },
    { combo: 2, name: 'GOOD', color: '#00f0ff' },
    { combo: 3, name: 'GREAT', color: '#38b6ff' },
    { combo: 4, name: 'SUPER', color: '#a855f7' },
    { combo: 5, name: 'ULTRA', color: '#ffcc00' },
    { combo: 6, name: 'MEGA', color: '#ff8800' },
    { combo: 7, name: 'HYPER', color: '#ff0077' },
    { combo: 8, name: 'MAX POWER!', color: '#ffea00' }
  ],
  ranks: [
    { minScore: 15000, rank: 'S+', title: 'CYBER LEGEND', color: '#ffea00' },
    { minScore: 10000, rank: 'S', title: 'APEX DODGER', color: '#ffcc00' },
    { minScore: 6000, rank: 'A', title: 'GRID MASTER', color: '#00f0ff' },
    { minScore: 3000, rank: 'B', title: 'RUNNER', color: '#0077ff' },
    { minScore: 1000, rank: 'C', title: 'ROOKIE', color: '#a855f7' },
    { minScore: 0, rank: 'D', title: 'INITIATE', color: '#64748b' }
  ],
  storageKeys: {
    highScore: 'dont_touch_red_highscore',
    previousHighScore: 'dont_touch_red_prev_highscore',
    dailyDate: 'dont_touch_red_daily_date',
    dailyBest: 'dont_touch_red_daily_best',
    achievements: 'dont_touch_red_achievements',
    lifetimeOrbs: 'dont_touch_red_lifetime_orbs',
    soundMuted: 'dont_touch_red_muted',
    totalPlays: 'dont_touch_red_plays',
    highCombo: 'dont_touch_red_highcombo'
  }
};
