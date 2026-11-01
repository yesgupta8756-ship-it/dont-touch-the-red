/**
 * AchievementManager
 * Tracks achievements, checks unlock conditions during gameplay,
 * provides toast callbacks, and persists progress in localStorage.
 */

import { GAME_CONFIG } from '../config.js';
import { soundManager } from '../audio/SoundManager.js';

export const ACHIEVEMENTS = [
  {
    id: 'first_survival',
    title: 'FIRST SURVIVAL',
    desc: 'Survive for at least 15 seconds in any mission',
    icon: '⚡',
    condition: (stats) => (stats.survivalSeconds || 0) >= 15
  },
  {
    id: 'score_1000',
    title: 'NEON NOVICE',
    desc: 'Score 1,000 points in a single run',
    icon: '🎯',
    condition: (stats) => (stats.score || 0) >= 1000
  },
  {
    id: 'score_5000',
    title: 'APEX DODGER',
    desc: 'Score 5,000 points in a single run',
    icon: '🏆',
    condition: (stats) => (stats.score || 0) >= 5000
  },
  {
    id: 'survive_60',
    title: 'CLOCKWORK REFLEXES',
    desc: 'Survive for 60 seconds in a single run',
    icon: '⏱️',
    condition: (stats) => (stats.survivalSeconds || 0) >= 60
  },
  {
    id: 'orbs_100',
    title: 'ENERGY SIPHON',
    desc: 'Collect 100 energy orbs in total',
    icon: '💎',
    condition: (stats) => (stats.lifetimeOrbs || 0) >= 100,
    getProgress: (stats) => ({ current: Math.min(100, stats.lifetimeOrbs || 0), target: 100 })
  }
];

class AchievementManager {
  constructor() {
    this.unlocked = {};
    this.lifetimeOrbs = 0;
    this.onUnlockCallback = null;
    this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(GAME_CONFIG.storageKeys.achievements);
      this.unlocked = saved ? JSON.parse(saved) : {};
    } catch (e) {
      this.unlocked = {};
    }

    try {
      const orbs = localStorage.getItem(GAME_CONFIG.storageKeys.lifetimeOrbs);
      this.lifetimeOrbs = orbs ? parseInt(orbs, 10) || 0 : 0;
    } catch (e) {
      this.lifetimeOrbs = 0;
    }
  }

  save() {
    try {
      localStorage.setItem(GAME_CONFIG.storageKeys.achievements, JSON.stringify(this.unlocked));
      localStorage.setItem(GAME_CONFIG.storageKeys.lifetimeOrbs, this.lifetimeOrbs.toString());
    } catch (e) {
      // storage unavailable
    }
  }

  addOrbs(count) {
    this.lifetimeOrbs += count;
    this.save();
    // Check if 100 orbs achievement unlocked
    this.check({ lifetimeOrbs: this.lifetimeOrbs });
  }

  setOnUnlock(callback) {
    this.onUnlockCallback = callback;
  }

  check(stats = {}) {
    const fullStats = {
      score: 0,
      survivalSeconds: 0,
      ...stats,
      lifetimeOrbs: this.lifetimeOrbs
    };

    ACHIEVEMENTS.forEach((ach) => {
      if (!this.unlocked[ach.id]) {
        if (ach.condition(fullStats)) {
          this.unlock(ach);
        }
      }
    });
  }

  unlock(ach) {
    this.unlocked[ach.id] = Date.now();
    this.save();
    soundManager.playRankFanfare();

    if (this.onUnlockCallback) {
      this.onUnlockCallback(ach);
    }
  }

  isUnlocked(id) {
    return !!this.unlocked[id];
  }

  getAll() {
    this.load();
    return ACHIEVEMENTS.map((ach) => ({
      ...ach,
      isUnlocked: !!this.unlocked[ach.id],
      unlockedAt: this.unlocked[ach.id] || null,
      progress: ach.getProgress ? ach.getProgress({ lifetimeOrbs: this.lifetimeOrbs }) : null
    }));
  }

  getUnlockedCount() {
    this.load();
    return Object.keys(this.unlocked).length;
  }
}

export const achievementManager = new AchievementManager();
