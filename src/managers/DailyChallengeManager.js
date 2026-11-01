/**
 * DailyChallengeManager
 * Manages daily fixed-seed challenges, daily personal best scores,
 * UTC date synchronization worldwide, and automatic midnight rollovers.
 */

import { GAME_CONFIG } from '../config.js';

class DailyChallengeManager {
  constructor() {
    this.todayStr = this.getTodayDateString();
    this.seed = this.generateSeed(this.todayStr);
    this.dailyBest = 0;
    this.previousDailyBest = 0;
    this.hasPlayedToday = false;
    this.load();
  }

  /**
   * UTC date string ensures all players worldwide share the exact same daily challenge seed
   */
  getTodayDateString() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getFormattedDate() {
    const now = new Date();
    return now.toLocaleDateString(undefined, {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  generateSeed(dateStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  checkDateRollover() {
    const currentToday = this.getTodayDateString();
    if (currentToday !== this.todayStr) {
      this.todayStr = currentToday;
      this.seed = this.generateSeed(this.todayStr);
      this.dailyBest = 0;
      this.previousDailyBest = 0;
      this.hasPlayedToday = false;

      try {
        localStorage.setItem(GAME_CONFIG.storageKeys.dailyDate, this.todayStr);
        localStorage.setItem(GAME_CONFIG.storageKeys.dailyBest, '0');
      } catch (e) {
        // storage unavailable
      }
    }
  }

  load() {
    this.checkDateRollover();

    try {
      const savedDate = localStorage.getItem(GAME_CONFIG.storageKeys.dailyDate);
      if (savedDate === this.todayStr) {
        const savedScore = localStorage.getItem(GAME_CONFIG.storageKeys.dailyBest);
        this.dailyBest = savedScore ? parseInt(savedScore, 10) || 0 : 0;
        this.previousDailyBest = this.dailyBest;
        this.hasPlayedToday = this.dailyBest > 0;
      } else {
        this.dailyBest = 0;
        this.previousDailyBest = 0;
        this.hasPlayedToday = false;
        localStorage.setItem(GAME_CONFIG.storageKeys.dailyDate, this.todayStr);
        localStorage.setItem(GAME_CONFIG.storageKeys.dailyBest, '0');
      }
    } catch (e) {
      this.dailyBest = 0;
      this.previousDailyBest = 0;
    }
  }

  saveDailyScore(score) {
    this.checkDateRollover();
    this.hasPlayedToday = true;
    let isNewRecord = false;

    if (score > this.dailyBest) {
      this.previousDailyBest = this.dailyBest;
      this.dailyBest = score;
      isNewRecord = true;
      try {
        localStorage.setItem(GAME_CONFIG.storageKeys.dailyDate, this.todayStr);
        localStorage.setItem(GAME_CONFIG.storageKeys.dailyBest, score.toString());
      } catch (e) {
        // storage unavailable
      }
    }

    return { isNewRecord, dailyBest: this.dailyBest, prevBest: this.previousDailyBest };
  }
}

export const dailyChallengeManager = new DailyChallengeManager();
