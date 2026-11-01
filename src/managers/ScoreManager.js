/**
 * ScoreManager
 * Manages game score, combos, best score and previous best persistence via localStorage,
 * session statistics, rank evaluations, and mode support (Endless vs Daily Challenge).
 */

import { GAME_CONFIG } from '../config.js';
import { dailyChallengeManager } from './DailyChallengeManager.js';
import { achievementManager } from './AchievementManager.js';

export class ScoreManager {
  constructor(mode = 'endless') {
    this.mode = mode; // 'endless' or 'daily'
    this.currentScore = 0;
    this.highScore = this.loadHighScore();
    this.previousHighScore = this.loadPreviousHighScore();
    this.sessionInitialBest = this.highScore;
    this.totalPlays = this.loadTotalPlays();
    this.combo = 1;
    this.maxCombo = 1;
    this.comboTimer = 0;
    this.comboWindow = GAME_CONFIG.scoring.comboWindowMs;
    this.orbsCollected = 0;
    this.nearMissCount = 0;
    this.startTime = 0;
    this.elapsedSeconds = 0;
    this.isNewRecord = false;
  }

  loadHighScore() {
    if (this.mode === 'daily') {
      dailyChallengeManager.load();
      return dailyChallengeManager.dailyBest;
    }
    try {
      const saved = localStorage.getItem(GAME_CONFIG.storageKeys.highScore);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch (e) {
      return 0;
    }
  }

  loadPreviousHighScore() {
    if (this.mode === 'daily') {
      dailyChallengeManager.load();
      return dailyChallengeManager.previousDailyBest;
    }
    try {
      const saved = localStorage.getItem(GAME_CONFIG.storageKeys.previousHighScore);
      return saved ? parseInt(saved, 10) || 0 : this.highScore;
    } catch (e) {
      return this.highScore;
    }
  }

  saveHighScore(score) {
    if (this.mode === 'daily') {
      this.isNewRecord = true;
      this.previousHighScore = this.sessionInitialBest;
      this.highScore = score;
      dailyChallengeManager.saveDailyScore(score);
      return;
    }

    try {
      if (score > this.highScore) {
        this.isNewRecord = true;
        this.previousHighScore = this.sessionInitialBest;
        this.highScore = score;
        localStorage.setItem(GAME_CONFIG.storageKeys.previousHighScore, this.previousHighScore.toString());
        localStorage.setItem(GAME_CONFIG.storageKeys.highScore, this.highScore.toString());
      }
    } catch (e) {
      // storage unavailable
    }
  }

  loadTotalPlays() {
    try {
      const saved = localStorage.getItem(GAME_CONFIG.storageKeys.totalPlays);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch (e) {
      return 0;
    }
  }

  incrementPlays() {
    this.totalPlays++;
    try {
      localStorage.setItem(GAME_CONFIG.storageKeys.totalPlays, this.totalPlays.toString());
    } catch (e) {
      // storage unavailable
    }
  }

  reset() {
    this.currentScore = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.comboTimer = 0;
    this.orbsCollected = 0;
    this.nearMissCount = 0;
    this.startTime = Date.now();
    this.elapsedSeconds = 0;
    this.isNewRecord = false;
    this.incrementPlays();

    this.highScore = this.loadHighScore();
    this.previousHighScore = this.loadPreviousHighScore();
    this.sessionInitialBest = this.highScore;
  }

  update(delta) {
    if (this.combo > 1) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.combo = 1;
        this.comboTimer = 0;
      }
    }
    this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    // Live achievement checks during gameplay
    achievementManager.check({
      score: this.currentScore,
      survivalSeconds: this.elapsedSeconds
    });
  }

  addOrbScore() {
    this.orbsCollected++;
    achievementManager.addOrbs(1);

    const points = GAME_CONFIG.scoring.orbBaseScore * this.combo;
    this.currentScore += points;

    // Increment combo
    this.combo = Math.min(this.combo + 1, GAME_CONFIG.scoring.maxCombo);
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
    this.comboTimer = this.comboWindow;

    this.checkRecord();
    return { points, combo: this.combo, tier: this.getComboTier() };
  }

  addNearMissScore() {
    this.nearMissCount++;
    const points = GAME_CONFIG.scoring.nearMissScore * this.combo;
    this.currentScore += points;
    this.checkRecord();
    return points;
  }

  checkRecord() {
    if (this.currentScore > this.highScore) {
      this.saveHighScore(this.currentScore);
    }
  }

  getComboTier() {
    const tier = GAME_CONFIG.comboTiers.find((t) => t.combo === this.combo);
    return tier || GAME_CONFIG.comboTiers[0];
  }

  getRank() {
    for (const r of GAME_CONFIG.ranks) {
      if (this.currentScore >= r.minScore) {
        return r;
      }
    }
    return GAME_CONFIG.ranks[GAME_CONFIG.ranks.length - 1];
  }

  getFormattedTime() {
    const mins = Math.floor(this.elapsedSeconds / 60);
    const secs = this.elapsedSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getComboProgress() {
    if (this.combo <= 1) return 0;
    return Math.max(0, Math.min(1, this.comboTimer / this.comboWindow));
  }
}
