/**
 * GameScene
 * Core gameplay loop, physics collision detection, responsive readable HUD,
 * rolling score animations, dynamic combo multipliers, seeded PRNG for Daily Challenge,
 * in-game achievement unlock notifications, and smooth transitions.
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import { PatternGenerator } from '../managers/PatternGenerator.js';
import { LaserWall, SpinningCross } from '../entities/Obstacles.js';
import { soundManager } from '../audio/SoundManager.js';
import { dailyChallengeManager } from '../managers/DailyChallengeManager.js';
import { achievementManager } from '../managers/AchievementManager.js';
import { PRNG } from '../managers/PRNG.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.mode = data && data.mode ? data.mode : 'endless';
  }

  create() {
    const { width, height } = GAME_CONFIG;

    this.isGameOver = false;
    this.isPaused = false;
    this.displayedScore = 0;

    // Smooth scene entrance
    this.cameras.main.fadeIn(300, 4, 5, 13);

    // 1. Layered Animated Neon Background
    this.createBackground(width, height);

    // 2. Managers
    this.scoreManager = new ScoreManager(this.mode);
    this.scoreManager.reset();

    // PRNG setup for Daily Challenge
    const prng = this.mode === 'daily' ? new PRNG(dailyChallengeManager.seed) : null;
    this.patternGenerator = new PatternGenerator(this, prng);
    this.patternGenerator.reset();

    // Connect Achievement Toast Notification Listener
    achievementManager.setOnUnlock((ach) => this.showAchievementToast(ach));

    // 3. Entity Groups
    this.obstacles = this.add.group();
    this.orbs = this.add.group();

    // 4. Player Instance
    this.player = new Player(this, width / 2, height - 160);

    // 5. Responsive High-Visibility HUD Overlay
    this.createHUD(width, height);

    // 6. Keyboard Shortcuts
    this.input.keyboard.on('keydown-P', () => this.togglePause());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard.on('keydown-M', () => this.toggleSound());

    // Listen to resume from PauseScene
    this.events.on('resume', () => {
      this.isPaused = false;
    });

    soundManager.startAmbientBgm();
  }

  createBackground(w, h) {
    // Parallax stars
    this.stars = [];
    for (let i = 0; i < 35; i++) {
      const star = this.add.image(
        Phaser.Math.Between(20, w - 20),
        Phaser.Math.Between(20, h - 20),
        'cyber_star'
      ).setDepth(0);
      star.setAlpha(Phaser.Math.FloatBetween(0.2, 0.65));
      star.setScale(Phaser.Math.FloatBetween(0.5, 1.1));
      this.stars.push(star);
    }

    // Scrolling cyber grid
    this.bgGrid = this.add.tileSprite(w / 2, h / 2, w, h, 'cyber_grid').setDepth(1);

    // Arena Side Neon Boundary Rails
    const sideRails = this.add.graphics().setDepth(2);
    const railColor = this.mode === 'daily' ? 0xffaa00 : 0x00f0ff;
    sideRails.lineStyle(2, railColor, 0.35);
    sideRails.lineBetween(10, 75, 10, h - 10);
    sideRails.lineBetween(w - 10, 75, w - 10, h - 10);

    // Hazard corner brackets
    sideRails.lineStyle(3, 0xff0055, 0.55);
    sideRails.lineBetween(10, 75, 30, 75);
    sideRails.lineBetween(10, h - 10, 30, h - 10);
    sideRails.lineBetween(w - 10, 75, w - 30, 75);
    sideRails.lineBetween(w - 10, h - 10, w - 30, h - 10);
  }

  createHUD(w, h) {
    const hudY = 36;

    // Top Bar Backplate for high legibility
    const hudPlate = this.add.graphics().setDepth(45);
    hudPlate.fillStyle(0x06091a, 0.88);
    hudPlate.fillRect(0, 0, w, 74);
    hudPlate.lineStyle(1.5, this.mode === 'daily' ? 0xffaa00 : 0x00f0ff, 0.45);
    hudPlate.lineBetween(0, 74, w, 74);

    // 1. Current Score
    this.add.text(32, hudY - 14, 'SCORE', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      letterSpacing: 2,
      color: '#8293ad'
    }).setDepth(50);

    this.scoreText = this.add.text(32, hudY + 4, '0', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '28px',
      fontWeight: '900',
      color: '#00f0ff'
    }).setDepth(50);

    // 2. High Score / Daily Best
    const bestLabelText = this.mode === 'daily' ? 'DAILY BEST' : 'BEST';
    this.add.text(210, hudY - 14, bestLabelText, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      letterSpacing: 2,
      color: this.mode === 'daily' ? '#ffcc00' : '#8293ad'
    }).setDepth(50);

    this.bestScoreText = this.add.text(210, hudY + 6, this.scoreManager.highScore.toLocaleString(), {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '22px',
      fontWeight: '700',
      color: this.mode === 'daily' ? '#ffea00' : '#ffffff'
    }).setDepth(50);

    // 3. Dynamic Combo Multiplier Container (Center)
    this.comboContainer = this.add.container(420, hudY + 4).setDepth(50);

    this.comboBadgeGfx = this.add.graphics();
    this.comboContainer.add(this.comboBadgeGfx);

    this.comboText = this.add.text(0, -8, 'COMBO x1', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '15px',
      fontWeight: '900',
      color: '#00f0ff'
    }).setOrigin(0.5);
    this.comboContainer.add(this.comboText);

    this.comboTierText = this.add.text(0, 8, '', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '12px',
      fontWeight: '700',
      letterSpacing: 2,
      color: '#ffcc00'
    }).setOrigin(0.5);
    this.comboContainer.add(this.comboTierText);

    this.comboBarGfx = this.add.graphics();
    this.comboContainer.add(this.comboBarGfx);

    // 4. Danger Level Badge or Daily Mode Badge
    this.dangerBadge = this.add.text(610, hudY + 4, 'DANGER LV 1', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      fontWeight: '700',
      color: '#ff0055',
      backgroundColor: '#20000e',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(50);

    // 5. Shield active indicator
    this.shieldIndicator = this.add.text(w - 170, hudY + 4, '🛡️', {
      fontSize: '20px'
    }).setOrigin(0.5).setVisible(false).setDepth(50);

    // 6. Sound Button (Top Right)
    const soundBtnBg = this.add.graphics().setDepth(50);
    soundBtnBg.fillStyle(0x0c1230, 0.85);
    soundBtnBg.fillCircle(w - 110, hudY + 4, 20);
    soundBtnBg.lineStyle(1.5, 0x00f0ff, 0.5);
    soundBtnBg.strokeCircle(w - 110, hudY + 4, 20);

    this.soundBtn = this.add.text(w - 110, hudY + 4, soundManager.isMuted ? '🔇' : '🔊', {
      fontSize: '20px'
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' }).setDepth(51);
    this.soundBtn.on('pointerdown', () => this.toggleSound());

    // 7. Pause Button (Top Right)
    const pauseBtnBg = this.add.graphics().setDepth(50);
    pauseBtnBg.fillStyle(0x0c1230, 0.85);
    pauseBtnBg.fillCircle(w - 55, hudY + 4, 20);
    pauseBtnBg.lineStyle(1.5, 0x00f0ff, 0.5);
    pauseBtnBg.strokeCircle(w - 55, hudY + 4, 20);

    this.pauseBtn = this.add.text(w - 55, hudY + 4, '❚❚', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '18px',
      fontWeight: '900',
      color: '#00f0ff'
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' }).setDepth(51);
    this.pauseBtn.on('pointerdown', () => this.togglePause());
  }

  showAchievementToast(ach) {
    const { width } = GAME_CONFIG;
    const toastY = 110;

    const toast = this.add.container(width / 2, toastY).setDepth(80);

    const bg = this.add.graphics();
    bg.fillStyle(0x070e28, 0.95);
    bg.fillRoundedRect(-240, -26, 480, 52, 12);
    bg.lineStyle(2, 0xffcc00, 0.95);
    bg.strokeRoundedRect(-240, -26, 480, 52, 12);
    toast.add(bg);

    const icon = this.add.text(-215, 0, '🏆', { fontSize: '24px' }).setOrigin(0.5);
    toast.add(icon);

    const title = this.add.text(-185, -10, `ACHIEVEMENT UNLOCKED: ${ach.title}`, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      fontWeight: '900',
      color: '#ffcc00'
    });
    toast.add(title);

    const desc = this.add.text(-185, 8, ach.desc, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '12px',
      color: '#ffffff'
    });
    toast.add(desc);

    toast.setScale(0.8);
    toast.setAlpha(0);

    this.tweens.add({
      targets: toast,
      scale: 1,
      alpha: 1,
      duration: 350,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(2400, () => {
          this.tweens.add({
            targets: toast,
            y: toastY - 30,
            alpha: 0,
            duration: 350,
            ease: 'Cubic.easeIn',
            onComplete: () => toast.destroy()
          });
        });
      }
    });
  }

  updateHUD(delta) {
    // 1. Smooth Rolling Score Animation
    const targetScore = this.scoreManager.currentScore;
    if (this.displayedScore < targetScore) {
      const diff = targetScore - this.displayedScore;
      const step = Math.max(1, Math.ceil(diff * 0.18));
      this.displayedScore = Math.min(targetScore, this.displayedScore + step);
      this.scoreText.setText(this.displayedScore.toLocaleString());

      if (!this.scorePulsing) {
        this.scorePulsing = true;
        this.tweens.add({
          targets: this.scoreText,
          scale: 1.15,
          duration: 90,
          yoyo: true,
          onComplete: () => {
            this.scorePulsing = false;
          }
        });
      }
    } else {
      this.scoreText.setText(targetScore.toLocaleString());
    }

    this.bestScoreText.setText(this.scoreManager.highScore.toLocaleString());

    // 2. Combo Multiplier Visuals
    if (this.scoreManager.combo > 1) {
      this.comboContainer.setVisible(true);
      const tier = this.scoreManager.getComboTier();
      this.comboText.setText(`COMBO x${this.scoreManager.combo}`);
      this.comboText.setColor(tier.color);
      this.comboTierText.setText(tier.name);
      this.comboTierText.setColor(tier.color);

      const progress = this.scoreManager.getComboProgress();
      this.comboBarGfx.clear();
      this.comboBarGfx.fillStyle(0x1a233a, 0.8);
      this.comboBarGfx.fillRect(-55, 18, 110, 4);
      this.comboBarGfx.fillStyle(Phaser.Display.Color.HexStringToColor(tier.color).color, 1);
      this.comboBarGfx.fillRect(-55, 18, 110 * progress, 4);
    } else {
      this.comboContainer.setVisible(false);
    }

    // 3. Shield Indicator
    if (this.player) {
      this.shieldIndicator.setVisible(this.player.isShielded);
    }
  }

  onNearMiss(x, y) {
    soundManager.playNearMiss();
    const pts = this.scoreManager.addNearMissScore();

    const text = this.add.text(x, y - 10, `CLOSE CALL! +${pts}`, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '16px',
      fontWeight: '900',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 3.5,
      shadow: { color: '#ffcc00', blur: 10, fill: true }
    }).setOrigin(0.5).setDepth(45);

    this.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      scale: { from: 0.9, to: 1.25 },
      duration: 650,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy()
    });

    this.cameras.main.shake(120, 0.007);
  }

  onDangerLevelUp(level) {
    this.dangerBadge.setText(`DANGER LV ${level}`);

    const banner = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 80, `DANGER SURGE LV ${level}`, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '34px',
      fontWeight: '900',
      letterSpacing: 3,
      color: '#ff0055',
      stroke: '#ffffff',
      strokeThickness: 3.5,
      shadow: { color: '#ff0055', blur: 24, fill: true }
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: banner,
      scale: { from: 0.7, to: 1.2 },
      alpha: { from: 1, to: 0 },
      duration: 1250,
      ease: 'Cubic.easeOut',
      onComplete: () => banner.destroy()
    });
  }

  detonateEmp() {
    this.cameras.main.flash(300, 189, 0, 255);
    this.cameras.main.shake(300, 0.02);

    const obsList = [...this.obstacles.getChildren()];
    obsList.forEach((obs) => {
      if (obs && obs.explode) {
        obs.explode();
      }
    });
  }

  activateTimeWarp() {
    this.cameras.main.flash(200, 0, 255, 170);
    this.patternGenerator.applyTimeWarp(4500);

    if (this.bgGrid) {
      this.bgGrid.setTint(0x00ffaa);
    }
  }

  onTimeWarpEnd() {
    if (this.bgGrid) {
      this.bgGrid.clearTint();
    }
  }

  toggleSound() {
    const isMuted = soundManager.toggleMute();
    this.soundBtn.setText(isMuted ? '🔇' : '🔊');
    soundManager.playClick();
  }

  togglePause() {
    if (this.isGameOver) return;
    soundManager.playClick();
    this.isPaused = true;
    this.scene.launch('PauseScene');
    this.scene.pause();
  }

  handlePlayerDeath() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.time.delayedCall(1100, () => {
      this.cameras.main.fadeOut(350, 6, 0, 15);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameOverScene', {
          score: this.scoreManager.currentScore,
          highScore: this.scoreManager.highScore,
          previousHighScore: this.scoreManager.previousHighScore,
          isNewRecord: this.scoreManager.isNewRecord,
          mode: this.mode,
          timeSurvived: this.scoreManager.getFormattedTime(),
          orbs: this.scoreManager.orbsCollected,
          nearMisses: this.scoreManager.nearMissCount,
          maxCombo: this.scoreManager.maxCombo,
          rank: this.scoreManager.getRank()
        });
      });
    });
  }

  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;

    const bgSpeed = 1.25 * this.patternGenerator.getSpeedMultiplier();
    this.bgGrid.tilePositionY -= bgSpeed;

    this.scoreManager.update(delta);
    this.patternGenerator.update(time, delta);

    if (this.player) {
      this.player.update(time, delta);
    }

    const orbs = this.orbs.getChildren();
    for (let i = orbs.length - 1; i >= 0; i--) {
      const orb = orbs[i];
      if (!orb || !orb.active) continue;

      orb.update(time, delta, this.player);

      if (this.player && this.player.isAlive) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, orb.x, orb.y);
        if (dist < this.player.radius + orb.radius) {
          orb.collect(this.player);
        }
      }
    }

    const obstacles = this.obstacles.getChildren();
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      if (!obs || !obs.active) continue;

      obs.update(time, delta, this.player);

      if (this.player && this.player.isAlive) {
        let isCollision = false;

        if (obs instanceof LaserWall || obs instanceof SpinningCross) {
          isCollision = obs.checkCollisionWithPlayer(this.player);
        } else if (obs.body) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, obs.x, obs.y);
          if (dist < this.player.radius + (obs.hitRadius || 16)) {
            isCollision = true;
          }
        }

        if (isCollision) {
          const died = this.player.hitHazard();
          if (died) {
            this.handlePlayerDeath();
            break;
          }
        }
      }
    }

    this.updateHUD(delta);
  }
}
