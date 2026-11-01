/**
 * GameOverScene
 * Commercial-grade Game Over screen with rolling final score, Personal Best & Previous Best,
 * arcade rank grading badge, high score celebration, Retry button,
 * and Web Share API / Clipboard fallback Challenge System.
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';
import { soundManager } from '../audio/SoundManager.js';
import { dailyChallengeManager } from '../managers/DailyChallengeManager.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.highScore = data.highScore || 0;
    this.previousHighScore = data.previousHighScore || this.highScore;
    this.isNewRecord = data.isNewRecord || false;
    this.mode = data.mode || 'endless';
    this.timeSurvived = data.timeSurvived || '00:00';
    this.orbs = data.orbs || 0;
    this.nearMisses = data.nearMisses || 0;
    this.maxCombo = data.maxCombo || 1;
    this.rank = data.rank || GAME_CONFIG.ranks[GAME_CONFIG.ranks.length - 1];
  }

  create() {
    const { width, height } = GAME_CONFIG;

    this.cameras.main.fadeIn(350, 4, 5, 13);

    // 1. Red Tint Cyber Background
    this.bgGrid = this.add.tileSprite(width / 2, height / 2, width, height, 'cyber_grid');
    this.bgGrid.setTint(this.mode === 'daily' ? 0xff6600 : 0xff1144);

    const vignette = this.add.graphics();
    vignette.fillStyle(0x04050e, 0.78);
    vignette.fillRect(0, 0, width, height);

    // 2. Header
    const headerY = 125;
    const alertLabel = this.mode === 'daily'
      ? `DAILY MISSION ENDED • ${dailyChallengeManager.getFormattedDate()}`
      : 'CRITICAL COLLISION';

    this.add.text(width / 2, headerY - 32, alertLabel, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '17px',
      fontWeight: '700',
      letterSpacing: 4,
      color: this.mode === 'daily' ? '#ffaa00' : '#ff0055'
    }).setOrigin(0.5);

    const titleText = this.add.text(width / 2, headerY + 16, 'GAME OVER', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '56px',
      fontWeight: '900',
      letterSpacing: 4,
      color: '#ffffff',
      stroke: this.mode === 'daily' ? '#ffaa00' : '#ff0055',
      strokeThickness: 4,
      shadow: { color: this.mode === 'daily' ? '#ffaa00' : '#ff0055', blur: 30, fill: true, stroke: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: titleText,
      scale: { from: 0.95, to: 1.02 },
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 3. New Record Celebration or Rank Badge
    if (this.isNewRecord) {
      this.createNewRecordBanner(width / 2, headerY + 74);
      soundManager.playRankFanfare();
    } else {
      this.createRankBadge(width / 2, headerY + 74);
    }

    // 4. Polished Stats Card with Rolling Score & Personal vs Previous Best
    this.createStatsCard(width / 2, 430);

    // 5. Action Buttons (Retry, Share Challenge, and Menu)
    this.createActionButtons(width / 2, 695);

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-SPACE', () => this.replay());
    this.input.keyboard.on('keydown-ENTER', () => this.replay());
  }

  createRankBadge(x, y) {
    const rankBadge = this.add.container(x, y);

    const text = this.add.text(0, 0, `RANK ${this.rank.rank}: ${this.rank.title}`, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '17px',
      fontWeight: '900',
      letterSpacing: 3,
      color: this.rank.color,
      backgroundColor: '#0d1330',
      padding: { x: 16, y: 7 }
    }).setOrigin(0.5);

    rankBadge.add(text);
  }

  createNewRecordBanner(x, y) {
    const label = this.mode === 'daily' ? '★ NEW DAILY RECORD! ★' : '★ NEW PERSONAL BEST! ★';
    const badge = this.add.text(x, y, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '19px',
      fontWeight: '900',
      letterSpacing: 3,
      color: '#ffea00',
      backgroundColor: '#3a2b00',
      padding: { x: 18, y: 8 }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: badge,
      scale: { from: 1, to: 1.08 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Golden sparkles
    this.add.particles(x, y, 'spark_particle', {
      speed: { min: 40, max: 140 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 },
      lifespan: 650,
      frequency: 110,
      quantity: 1
    });
  }

  createStatsCard(x, y) {
    const w = 580;
    const h = 330;
    const card = this.add.graphics();
    card.fillStyle(0x0a0e28, 0.94);
    card.fillRoundedRect(x - w / 2, y - h / 2, w, h, 18);
    card.lineStyle(2, 0x1e2c56, 0.9);
    card.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 18);

    // Primary Final Score Display
    this.add.text(x, y - 110, 'FINAL SCORE', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '15px',
      fontWeight: '700',
      letterSpacing: 3,
      color: '#8b9bb4'
    }).setOrigin(0.5);

    this.scoreDisplay = this.add.text(x, y - 68, '0', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '48px',
      fontWeight: '900',
      color: '#00f0ff'
    }).setOrigin(0.5);

    // Smooth Score Rolling Animation
    const target = this.finalScore;
    const duration = Math.min(1400, Math.max(500, target * 0.15));
    const startTime = Date.now();

    const timer = this.time.addEvent({
      delay: 25,
      repeat: Math.floor(duration / 25),
      callback: () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const current = Math.floor(target * progress);
        this.scoreDisplay.setText(current.toLocaleString());
        soundManager.playScoreCountTick();
        if (progress >= 1) {
          this.scoreDisplay.setText(target.toLocaleString());
          timer.destroy();
        }
      }
    });

    // Separator line
    const sep = this.add.graphics();
    sep.lineStyle(1.5, 0x1d294a, 0.85);
    sep.lineBetween(x - 240, y - 26, x + 240, y - 26);

    // Secondary 4-stat grid
    const leftX = x - 145;
    const rightX = x + 145;

    // Row 1: Personal Best & Previous Best
    const bestTitle = this.mode === 'daily' ? 'DAILY BEST' : 'PERSONAL BEST';
    this.renderMiniStat(leftX, y + 14, bestTitle, this.highScore.toLocaleString(), '#ffea00');
    this.renderMiniStat(rightX, y + 14, 'PREVIOUS BEST', this.previousHighScore.toLocaleString(), '#94a3b8');

    // Row 2: Survival Time & Max Combo
    this.renderMiniStat(leftX, y + 74, 'TIME SURVIVED', this.timeSurvived, '#ffffff');
    this.renderMiniStat(rightX, y + 74, 'MAX COMBO', `x${this.maxCombo}`, '#ffcc00');

    // Row 3: Orbs & Near Misses
    this.renderMiniStat(leftX, y + 124, 'ORBS COLLECTED', this.orbs.toString(), '#00f0ff');
    this.renderMiniStat(rightX, y + 124, 'CLOSE CALLS', this.nearMisses.toString(), '#ff0055');
  }

  renderMiniStat(x, y, label, val, color) {
    this.add.text(x, y - 10, label, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '12px',
      fontWeight: '700',
      letterSpacing: 2,
      color: '#70809b'
    }).setOrigin(0.5);

    this.add.text(x, y + 12, val, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '19px',
      fontWeight: '700',
      color: color
    }).setOrigin(0.5);
  }

  createActionButtons(x, y) {
    const btnW = 340;
    const btnH = 64;

    // 1. RETRY / PLAY AGAIN (Primary with Sheen)
    this.playContainer = this.add.container(x, y - 10);

    const playGfx = this.add.graphics();
    const drawPlay = (hover) => {
      playGfx.clear();
      playGfx.fillStyle(hover ? 0x00f0ff : 0x00d4ff, 1);
      playGfx.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);
      playGfx.lineStyle(2, 0xffffff, 1);
      playGfx.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);
    };
    drawPlay(false);
    this.playContainer.add(playGfx);

    const sheen = this.add.image(-btnW / 2 - 40, 0, 'btn_sheen');
    sheen.setScale(1, btnH / 80);
    sheen.setAlpha(0.65);
    this.playContainer.add(sheen);

    this.tweens.add({
      targets: sheen,
      x: btnW / 2 + 40,
      duration: 1100,
      repeat: -1,
      repeatDelay: 2000,
      ease: 'Sine.easeInOut'
    });

    const playLabel = this.mode === 'daily' ? 'RETRY DAILY RUN' : 'RETRY';
    const playText = this.add.text(0, 0, playLabel, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '22px',
      fontWeight: '900',
      letterSpacing: 3,
      color: '#060713'
    }).setOrigin(0.5);
    this.playContainer.add(playText);

    const playHit = this.add.zone(x, y - 10, btnW, btnH).setInteractive({ cursor: 'pointer' });
    playHit.on('pointerover', () => {
      drawPlay(true);
      soundManager.playClick();
      this.tweens.add({ targets: this.playContainer, scale: 1.05, duration: 120 });
    });
    playHit.on('pointerout', () => {
      drawPlay(false);
      this.tweens.add({ targets: this.playContainer, scale: 1, duration: 120 });
    });
    playHit.on('pointerdown', () => this.replay());

    // 2. Secondary Row: SHARE SCORE & MAIN MENU
    const secY = y + 70;

    // SHARE BUTTON
    this.createShareButton(x - 125, secY);

    // MAIN MENU BUTTON
    this.createMenuButton(x + 125, secY);
  }

  createShareButton(x, y) {
    const w = 230;
    const h = 50;
    const container = this.add.container(x, y);

    const gfx = this.add.graphics();
    const draw = (hover) => {
      gfx.clear();
      gfx.fillStyle(hover ? 0x0f2240 : 0x091428, 0.95);
      gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
      gfx.lineStyle(2, hover ? 0x00f0ff : 0x00a2ff, hover ? 1 : 0.6);
      gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    };
    draw(false);
    container.add(gfx);

    const icon = this.add.image(-70, 0, 'share_icon').setScale(0.8);
    container.add(icon);

    const text = this.add.text(10, 0, 'SHARE SCORE', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '15px',
      fontWeight: '900',
      letterSpacing: 2,
      color: '#00f0ff'
    }).setOrigin(0.5);
    container.add(text);

    const hit = this.add.zone(x, y, w, h).setInteractive({ cursor: 'pointer' });
    hit.on('pointerover', () => {
      draw(true);
      soundManager.playClick();
      this.tweens.add({ targets: container, scale: 1.05, duration: 120 });
    });
    hit.on('pointerout', () => {
      draw(false);
      this.tweens.add({ targets: container, scale: 1, duration: 120 });
    });
    hit.on('pointerdown', () => {
      this.shareScore();
    });
  }

  createMenuButton(x, y) {
    const w = 210;
    const h = 50;
    const container = this.add.container(x, y);

    const gfx = this.add.graphics();
    const draw = (hover) => {
      gfx.clear();
      gfx.fillStyle(hover ? 0x1e293b : 0x0f172a, 0.92);
      gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
      gfx.lineStyle(1.5, hover ? 0x00f0ff : 0x334155, hover ? 0.9 : 0.5);
      gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    };
    draw(false);
    container.add(gfx);

    const text = this.add.text(0, 0, 'MAIN MENU', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '15px',
      fontWeight: '700',
      letterSpacing: 2,
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(text);

    const hit = this.add.zone(x, y, w, h).setInteractive({ cursor: 'pointer' });
    hit.on('pointerover', () => {
      draw(true);
      soundManager.playClick();
      this.tweens.add({ targets: container, scale: 1.05, duration: 120 });
    });
    hit.on('pointerout', () => {
      draw(false);
      this.tweens.add({ targets: container, scale: 1, duration: 120 });
    });
    hit.on('pointerdown', () => this.gotoMenu());
  }

  shareScore() {
    soundManager.playClick();

    const title = "DON'T TOUCH THE RED ⚡";
    const modeTag = this.mode === 'daily'
      ? `📅 Daily Challenge (${dailyChallengeManager.getFormattedDate()})`
      : '🔥 Endless Arcade';

    const message = `Can you beat my score in DON'T TOUCH THE RED? ⚡\nI scored ${this.finalScore.toLocaleString()} points (${this.rank.rank}: ${this.rank.title})!\n${modeTag}\nPlay now:`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: title,
        text: message,
        url: shareUrl
      }).catch((err) => {
        if (err && err.name === 'AbortError') return;
        this.copyToClipboard(`${message} ${shareUrl}`);
      });
    } else {
      this.copyToClipboard(`${message} ${shareUrl}`);
    }
  }

  copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showShareToast("⚡ CHALLENGE COPIED TO CLIPBOARD!");
      }).catch(() => {
        this.fallbackCopy(text);
      });
    } else {
      this.fallbackCopy(text);
    }
  }

  fallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.showShareToast("⚡ CHALLENGE COPIED TO CLIPBOARD!");
    } catch (e) {
      this.showShareToast("CHALLENGE READY TO SHARE!");
    }
  }

  showShareToast(msg) {
    const { width } = GAME_CONFIG;
    const toastY = 825;

    const toast = this.add.container(width / 2, toastY).setDepth(90);

    const bg = this.add.graphics();
    bg.fillStyle(0x04081c, 0.95);
    bg.fillRoundedRect(-230, -22, 460, 44, 10);
    bg.lineStyle(2, 0x00f0ff, 0.9);
    bg.strokeRoundedRect(-230, -22, 460, 44, 10);
    toast.add(bg);

    const text = this.add.text(0, 0, msg, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      fontWeight: '900',
      letterSpacing: 2,
      color: '#00f0ff'
    }).setOrigin(0.5);
    toast.add(text);

    toast.setScale(0.8);
    toast.setAlpha(0);

    this.tweens.add({
      targets: toast,
      scale: 1,
      alpha: 1,
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(2200, () => {
          this.tweens.add({
            targets: toast,
            alpha: 0,
            y: toastY + 20,
            duration: 250,
            onComplete: () => toast.destroy()
          });
        });
      }
    });
  }

  replay() {
    soundManager.playClick();
    this.cameras.main.fadeOut(250, 4, 5, 13);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', {
        mode: this.mode
      });
    });
  }

  gotoMenu() {
    soundManager.playClick();
    this.cameras.main.fadeOut(250, 4, 5, 13);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }

  update() {
    if (this.bgGrid) {
      this.bgGrid.tilePositionY -= 0.5;
    }
  }
}
