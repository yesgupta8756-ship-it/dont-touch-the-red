/**
 * PatternGenerator
 * Orchestrates procedural wave choreography, fair hazard patterns,
 * tactical energy orb spawns, and dynamic difficulty progression.
 * Supports seeded PRNG for Daily Challenge mode.
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';
import { RedMine, LaserWall, SpinningCross, CrossfireDart, ChaserDrone } from '../entities/Obstacles.js';
import { Orb } from '../entities/Orb.js';
import { soundManager } from '../audio/SoundManager.js';

export class PatternGenerator {
  constructor(scene, prng = null) {
    this.scene = scene;
    this.prng = prng; // Optional Mulberry32 PRNG instance for daily challenge
    this.dangerLevel = 1;
    this.gameTimer = 0;
    this.nextWaveTimer = 1000;
    this.nextOrbTimer = 1400;
    this.timeScale = 1.0;
    this.isTimeWarped = false;
    this.timeWarpTimer = 0;
    this.lastPattern = null;
    this.laserWallActiveUntil = 0;
  }

  setPRNG(prng) {
    this.prng = prng;
  }

  random() {
    return this.prng ? this.prng.next() : Math.random();
  }

  randomBetween(min, max) {
    return this.prng ? this.prng.between(min, max) : Phaser.Math.Between(min, max);
  }

  randomFloat(min, max) {
    return this.prng ? this.prng.floatBetween(min, max) : Phaser.Math.FloatBetween(min, max);
  }

  randomPick(arr) {
    return this.prng ? this.prng.pick(arr) : Phaser.Utils.Array.GetRandom(arr);
  }

  reset() {
    this.dangerLevel = 1;
    this.gameTimer = 0;
    this.nextWaveTimer = 900;
    this.nextOrbTimer = 1200;
    this.timeScale = 1.0;
    this.isTimeWarped = false;
    this.timeWarpTimer = 0;
    this.lastPattern = null;
    this.laserWallActiveUntil = 0;
  }

  update(time, delta) {
    this.gameTimer += delta;

    if (this.isTimeWarped) {
      this.timeWarpTimer -= delta;
      if (this.timeWarpTimer <= 0) {
        this.isTimeWarped = false;
        this.timeScale = 1.0;
        this.scene.onTimeWarpEnd();
      }
    }

    const newDangerLevel = Math.min(10, 1 + Math.floor(this.gameTimer / 18000));
    if (newDangerLevel > this.dangerLevel) {
      this.dangerLevel = newDangerLevel;
      soundManager.playWarning();
      this.scene.onDangerLevelUp(this.dangerLevel);
    }

    this.nextWaveTimer -= delta;
    if (this.nextWaveTimer <= 0) {
      this.spawnRandomPattern();
      const baseDelay = Math.max(1800, 3600 - this.dangerLevel * 180);
      this.nextWaveTimer = baseDelay + this.randomBetween(-200, 300);
    }

    this.nextOrbTimer -= delta;
    if (this.nextOrbTimer <= 0) {
      this.spawnOrbGroup();
      this.nextOrbTimer = this.randomBetween(1800, 3000);
    }
  }

  getSpeedMultiplier() {
    const dangerBonus = 1 + (this.dangerLevel - 1) * 0.11;
    return this.timeScale * dangerBonus;
  }

  spawnRandomPattern() {
    const isLaserWallActive = this.gameTimer < this.laserWallActiveUntil;
    const patterns = ['mineRain', 'spinningCross'];

    if (!isLaserWallActive) {
      patterns.push('laserWall');
    }

    if (this.dangerLevel >= 2 && !isLaserWallActive) {
      patterns.push('crossfire');
    }
    if (this.dangerLevel >= 3) {
      patterns.push('sineWave');
      if (!isLaserWallActive) patterns.push('doubleWall');
    }
    if (this.dangerLevel >= 4) {
      patterns.push('chaserDrone', 'pincerMines');
    }
    if (this.dangerLevel >= 5 && !isLaserWallActive) {
      patterns.push('crossfireSalvo', 'dualSpinners');
    }

    const candidates = patterns.filter((p) => p !== this.lastPattern);
    const chosen = candidates.length > 0 ? this.randomPick(candidates) : patterns[0];
    this.lastPattern = chosen;

    this[chosen]();
  }

  // --- PATTERNS ---

  mineRain() {
    const count = 3 + Math.min(4, Math.floor(this.dangerLevel / 2));
    const speed = 210 + this.dangerLevel * 18;

    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 240, () => {
        if (!this.scene.player || !this.scene.player.isAlive) return;
        const x = this.randomBetween(60, GAME_CONFIG.width - 60);
        const vx = this.randomBetween(-35, 35);
        const size = this.randomFloat(0.85, 1.2);
        const mine = new RedMine(this.scene, x, -35, speed, vx, size);
        mine.setSpeedMultiplier(this.getSpeedMultiplier());
        this.scene.obstacles.add(mine);
      });
    }
  }

  laserWall() {
    const gapWidth = Math.max(140, 195 - this.dangerLevel * 6);
    const gapX = this.randomBetween(gapWidth / 2 + 50, GAME_CONFIG.width - gapWidth / 2 - 50);
    const speed = 190 + this.dangerLevel * 16;

    this.laserWallActiveUntil = this.gameTimer + (GAME_CONFIG.height / speed) * 1000 + 400;

    const wall = new LaserWall(this.scene, -25, gapX, gapWidth, speed);
    wall.setSpeedMultiplier(this.getSpeedMultiplier());
    this.scene.obstacles.add(wall);

    this.scene.time.delayedCall(350, () => {
      this.spawnOrbAt(gapX, -10, 'standard');
    });
  }

  doubleWall() {
    this.laserWall();
    this.scene.time.delayedCall(1350, () => {
      if (!this.scene.player || !this.scene.player.isAlive) return;
      this.laserWall();
    });
  }

  spinningCross() {
    const x = this.randomBetween(180, GAME_CONFIG.width - 180);
    const arms = this.randomPick([2, 3, 4]);
    const armLength = this.randomBetween(95, 120);
    const rotSpeed = (this.random() > 0.5 ? 1 : -1) * (1.6 + this.dangerLevel * 0.12);
    const vy = 120 + this.dangerLevel * 14;

    const spinner = new SpinningCross(this.scene, x, -armLength - 15, arms, armLength, rotSpeed, vy);
    spinner.setSpeedMultiplier(this.getSpeedMultiplier());
    this.scene.obstacles.add(spinner);
  }

  dualSpinners() {
    const armLength = 90;
    const spinner1 = new SpinningCross(this.scene, 220, -armLength - 15, 2, armLength, 1.7, 130);
    const spinner2 = new SpinningCross(this.scene, GAME_CONFIG.width - 220, -armLength - 15, 2, armLength, -1.7, 130);

    spinner1.setSpeedMultiplier(this.getSpeedMultiplier());
    spinner2.setSpeedMultiplier(this.getSpeedMultiplier());

    this.scene.obstacles.add(spinner1);
    this.scene.obstacles.add(spinner2);
  }

  crossfire() {
    const y = this.randomBetween(150, GAME_CONFIG.height - 180);
    const direction = this.random() > 0.5 ? 1 : -1;
    const dart = new CrossfireDart(this.scene, y, direction, 650 + this.dangerLevel * 25);
    dart.setSpeedMultiplier(this.getSpeedMultiplier());
    this.scene.obstacles.add(dart);
  }

  crossfireSalvo() {
    const count = 3;
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 450, () => {
        if (!this.scene.player || !this.scene.player.isAlive) return;
        this.crossfire();
      });
    }
  }

  chaserDrone() {
    const x = this.randomBetween(100, GAME_CONFIG.width - 100);
    const drone = new ChaserDrone(this.scene, x, -35, 210 + this.dangerLevel * 18);
    drone.setSpeedMultiplier(this.getSpeedMultiplier());
    this.scene.obstacles.add(drone);
  }

  sineWave() {
    const count = 5;
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 320, () => {
        if (!this.scene.player || !this.scene.player.isAlive) return;
        const x = GAME_CONFIG.width / 2 + Math.sin(i * 1.25) * 250;
        const mine = new RedMine(this.scene, x, -35, 225, 0, 0.95);
        mine.setSpeedMultiplier(this.getSpeedMultiplier());
        this.scene.obstacles.add(mine);
      });
    }
  }

  pincerMines() {
    const speed = 200 + this.dangerLevel * 14;
    const leftMine = new RedMine(this.scene, 50, -35, speed, 85, 1.05);
    const rightMine = new RedMine(this.scene, GAME_CONFIG.width - 50, -35, speed, -85, 1.05);

    leftMine.setSpeedMultiplier(this.getSpeedMultiplier());
    rightMine.setSpeedMultiplier(this.getSpeedMultiplier());

    this.scene.obstacles.add(leftMine);
    this.scene.obstacles.add(rightMine);
  }

  // --- ORBS ---

  spawnOrbGroup() {
    const roll = this.random();
    let type = 'standard';

    if (roll < 0.08) {
      type = 'shield';
    } else if (roll < 0.14) {
      type = 'timewarp';
    } else if (roll < 0.18) {
      type = 'emp';
    }

    const x = this.randomBetween(70, GAME_CONFIG.width - 70);
    const y = this.randomBetween(140, GAME_CONFIG.height - 180);

    this.spawnOrbAt(x, y, type);

    if (type === 'standard' && this.random() < 0.45) {
      this.spawnOrbAt(x + this.randomBetween(-70, 70), y + this.randomBetween(-70, 70), 'standard');
    }
  }

  spawnOrbAt(x, y, type = 'standard') {
    const clampedX = Phaser.Math.Clamp(x, 50, GAME_CONFIG.width - 50);
    const clampedY = Phaser.Math.Clamp(y, 120, GAME_CONFIG.height - 120);
    const orb = new Orb(this.scene, clampedX, clampedY, type);
    this.scene.orbs.add(orb);
  }

  applyTimeWarp(durationMs = 4500) {
    this.isTimeWarped = true;
    this.timeScale = 0.42;
    this.timeWarpTimer = durationMs;

    this.scene.obstacles.getChildren().forEach((obs) => {
      if (obs.setSpeedMultiplier) obs.setSpeedMultiplier(this.getSpeedMultiplier());
    });
  }
}
