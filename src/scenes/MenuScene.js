/**
 * MenuScene
 * Commercial-quality neon arcade title screen with glowing logo,
 * Daily Challenge mode toggle & stats, Achievements drawer modal,
 * animated shimmering PLAY button, and smooth scene transitions.
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';
import { soundManager } from '../audio/SoundManager.js';
import { dailyChallengeManager } from '../managers/DailyChallengeManager.js';
import { achievementManager } from '../managers/AchievementManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.selectedMode = 'endless'; // 'endless' or 'daily'
  }

  create() {
    const { width, height } = GAME_CONFIG;

    this.cameras.main.fadeIn(350, 4, 5, 13);

    // 1. Layered Background
    this.createBackground(width, height);

    // 2. Sound Mute Button (Top Right)
    this.createSoundButton(width - 55, 45);

    // 3. Neon Cyber Title Header
    const titleY = 145;

    const subtitleTop = this.add.text(width / 2, titleY - 50, "DON'T TOUCH", {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '44px',
      fontWeight: '900',
      letterSpacing: 4,
      color: '#ffffff',
      stroke: '#00f0ff',
      strokeThickness: 3.5,
      shadow: { color: '#00f0ff', blur: 18, fill: true, stroke: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: subtitleTop,
      scale: { from: 0.98, to: 1.02 },
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const theRed = this.add.text(width / 2, titleY + 16, "THE RED", {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '70px',
      fontWeight: '900',
      letterSpacing: 6,
      color: '#ff0055',
      stroke: '#ffffff',
      strokeThickness: 3,
      shadow: { color: '#ff0055', blur: 30, stroke: true, fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: theRed,
      scaleX: { from: 1, to: 1.04 },
      scaleY: { from: 1, to: 1.03 },
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(width / 2, titleY + 76, "HIGH-VOLTAGE CYBER DODGE", {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '18px',
      fontWeight: '700',
      letterSpacing: 5,
      color: '#00f0ff'
    }).setOrigin(0.5);

    // 4. Mode Selection Pills (Endless Arcade vs Daily Challenge)
    this.createModeSelector(width / 2, 280);

    // 5. Dynamic Stats / Challenge Card (Switches with mode)
    this.createModeStatsCard(width / 2, 360);

    // 6. Achievements Button (Quick Access Bar)
    this.createAchievementsBar(width / 2, 435);

    // 7. Visual "How To Play" Guide Cards
    this.createInstructionCard(width / 2, 530);

    // 8. Professional Animated "PLAY NOW" Neon Button
    this.createPlayButton(width / 2, 695);

    // 9. Controls hints
    this.add.text(width / 2, 785, "DESKTOP: WASD / ARROWS / MOUSE  •  MOBILE: TOUCH & DRAG", {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '15px',
      fontWeight: '600',
      letterSpacing: 1.5,
      color: '#70809b'
    }).setOrigin(0.5);

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    this.input.keyboard.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard.on('keydown-M', () => this.toggleSound());
  }

  createBackground(w, h) {
    this.stars = [];
    for (let i = 0; i < 40; i++) {
      const star = this.add.image(
        Phaser.Math.Between(10, w - 10),
        Phaser.Math.Between(10, h - 10),
        'cyber_star'
      );
      star.setAlpha(Phaser.Math.FloatBetween(0.2, 0.7));
      star.setScale(Phaser.Math.FloatBetween(0.5, 1.2));
      this.stars.push(star);

      this.tweens.add({
        targets: star,
        alpha: { from: 0.1, to: 0.8 },
        duration: Phaser.Math.Between(1200, 2800),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1500)
      });
    }

    this.bgGrid = this.add.tileSprite(w / 2, h / 2, w, h, 'cyber_grid');

    this.motes = this.add.particles(0, 0, 'spark_particle', {
      x: { min: 20, max: w - 20 },
      y: { min: 20, max: h - 20 },
      speed: { min: 10, max: 35 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.35, end: 0 },
      blendMode: 'ADD',
      lifespan: 2500,
      frequency: 180
    });
  }

  createModeSelector(x, y) {
    const w = 240;
    const h = 42;

    this.modeButtons = {};

    // Endless Button
    this.modeButtons.endless = this.createPillButton(
      x - 130,
      y,
      w,
      h,
      '⚡ ENDLESS ARCADE',
      this.selectedMode === 'endless',
      () => this.switchMode('endless')
    );

    // Daily Challenge Button
    this.modeButtons.daily = this.createPillButton(
      x + 130,
      y,
      w,
      h,
      '📅 DAILY CHALLENGE',
      this.selectedMode === 'daily',
      () => this.switchMode('daily')
    );
  }

  createPillButton(x, y, w, h, label, isActive, callback) {
    const container = this.add.container(x, y);
    const gfx = this.add.graphics();

    const draw = (active, hover) => {
      gfx.clear();
      const r = 10;
      if (active) {
        gfx.fillStyle(0x00f0ff, 0.25);
        gfx.fillRoundedRect(-w / 2, -h / 2, w, h, r);
        gfx.lineStyle(2, 0x00f0ff, 1);
        gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
      } else {
        gfx.fillStyle(hover ? 0x162040 : 0x0a1028, 0.85);
        gfx.fillRoundedRect(-w / 2, -h / 2, w, h, r);
        gfx.lineStyle(1.5, hover ? 0x00f0ff : 0x223560, 0.7);
        gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
      }
    };

    draw(isActive, false);
    container.add(gfx);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      letterSpacing: 1.5,
      color: isActive ? '#00f0ff' : '#8b9bb4'
    }).setOrigin(0.5);
    container.add(text);

    const hit = this.add.zone(0, 0, w, h).setInteractive({ cursor: 'pointer' });
    hit.on('pointerover', () => {
      if (this.selectedMode !== (label.includes('ENDLESS') ? 'endless' : 'daily')) {
        draw(false, true);
        text.setColor('#ffffff');
      }
    });
    hit.on('pointerout', () => {
      const isNowActive = this.selectedMode === (label.includes('ENDLESS') ? 'endless' : 'daily');
      draw(isNowActive, false);
      text.setColor(isNowActive ? '#00f0ff' : '#8b9bb4');
    });
    hit.on('pointerdown', () => {
      soundManager.playClick();
      callback();
    });
    container.add(hit);

    return { container, gfx, text, draw };
  }

  switchMode(mode) {
    if (this.selectedMode === mode) return;
    this.selectedMode = mode;

    // Redraw mode pills
    this.modeButtons.endless.draw(mode === 'endless', false);
    this.modeButtons.endless.text.setColor(mode === 'endless' ? '#00f0ff' : '#8b9bb4');

    this.modeButtons.daily.draw(mode === 'daily', false);
    this.modeButtons.daily.text.setColor(mode === 'daily' ? '#00f0ff' : '#8b9bb4');

    // Refresh stats card
    this.updateModeStatsCard();

    // Refresh Play Button
    if (this.btnText && this.btnBg) {
      this.btnText.setText(mode === 'daily' ? 'PLAY DAILY' : 'PLAY NOW');
      this.drawButtonGfx(this.btnBg, 0, 0, 340, 70, false);
    }
  }

  createModeStatsCard(x, y) {
    this.statsCardContainer = this.add.container(x, y);
    this.updateModeStatsCard();
  }

  updateModeStatsCard() {
    this.statsCardContainer.removeAll(true);
    const w = 540;
    const h = 76;
    const card = this.add.graphics();

    card.fillStyle(0x0a102e, 0.85);
    card.fillRoundedRect(-w / 2, -h / 2, w, h, 14);

    if (this.selectedMode === 'endless') {
      card.lineStyle(2, 0x00f0ff, 0.45);
      card.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
      this.statsCardContainer.add(card);

      const trophy = this.add.image(-200, 0, 'trophy_gold').setScale(0.8);
      this.statsCardContainer.add(trophy);

      const highScore = this.loadHighScore();
      const totalPlays = this.loadTotalPlays();

      const label = this.add.text(-145, -16, 'ALL-TIME BEST', {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '14px',
        fontWeight: '700',
        letterSpacing: 2,
        color: '#8b9bb4'
      });
      this.statsCardContainer.add(label);

      const score = this.add.text(-145, 6, highScore.toLocaleString(), {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '28px',
        fontWeight: '900',
        color: '#00f0ff'
      });
      this.statsCardContainer.add(score);

      const playsLabel = this.add.text(160, -14, 'TOTAL RUNS', {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: 2,
        color: '#8b9bb4'
      }).setOrigin(0.5);
      this.statsCardContainer.add(playsLabel);

      const playsCount = this.add.text(160, 8, totalPlays.toString(), {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '20px',
        fontWeight: '700',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.statsCardContainer.add(playsCount);
    } else {
      // Daily Challenge Card
      card.lineStyle(2, 0xffaa00, 0.6);
      card.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
      this.statsCardContainer.add(card);

      const medal = this.add.image(-200, 0, 'medal_icon').setScale(1.1);
      this.statsCardContainer.add(medal);

      const dateStr = dailyChallengeManager.getFormattedDate();
      const dailyBest = dailyChallengeManager.dailyBest;

      const dateLabel = this.add.text(-145, -16, `TODAY'S MISSION (${dateStr})`, {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '13px',
        fontWeight: '700',
        letterSpacing: 2,
        color: '#ffcc00'
      });
      this.statsCardContainer.add(dateLabel);

      const scoreText = dailyBest > 0 ? dailyBest.toLocaleString() : 'UNPLAYED TODAY';
      const scoreColor = dailyBest > 0 ? '#ffea00' : '#8899aa';

      const score = this.add.text(-145, 6, scoreText, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: dailyBest > 0 ? '28px' : '20px',
        fontWeight: '900',
        color: scoreColor
      });
      this.statsCardContainer.add(score);

      const desc = this.add.text(150, 0, 'FIXED SEED\nWORLDWIDE', {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '13px',
        fontWeight: '700',
        align: 'center',
        letterSpacing: 1.5,
        color: '#ffaa00'
      }).setOrigin(0.5);
      this.statsCardContainer.add(desc);
    }
  }

  createAchievementsBar(x, y) {
    const w = 540;
    const h = 42;
    const bar = this.add.container(x, y);

    const gfx = this.add.graphics();
    const draw = (hover) => {
      gfx.clear();
      gfx.fillStyle(hover ? 0x162448 : 0x0b1230, 0.85);
      gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
      gfx.lineStyle(1.5, hover ? 0x00f0ff : 0x223565, 0.8);
      gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    };
    draw(false);
    bar.add(gfx);

    const unlocked = achievementManager.getUnlockedCount();
    const total = 5;

    const label = this.add.text(0, 0, `🏆 ACHIEVEMENTS: ${unlocked} / ${total} UNLOCKED  (CLICK TO VIEW)`, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      letterSpacing: 2,
      color: '#00f0ff'
    }).setOrigin(0.5);
    bar.add(label);

    const hit = this.add.zone(0, 0, w, h).setInteractive({ cursor: 'pointer' });
    hit.on('pointerover', () => {
      draw(true);
      label.setColor('#ffffff');
    });
    hit.on('pointerout', () => {
      draw(false);
      label.setColor('#00f0ff');
    });
    hit.on('pointerdown', () => {
      soundManager.playClick();
      this.showAchievementsModal();
    });
    bar.add(hit);
  }

  showAchievementsModal() {
    const { width, height } = GAME_CONFIG;

    if (this.modalContainer) {
      this.modalContainer.destroy();
    }

    this.modalContainer = this.add.container(0, 0).setDepth(100);

    // Backdrop
    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x030510, 0.88);
    backdrop.fillRect(0, 0, width, height);
    backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    this.modalContainer.add(backdrop);

    // Modal Card
    const cardW = 580;
    const cardH = 530;
    const card = this.add.graphics();
    card.fillStyle(0x0a102c, 0.98);
    card.fillRoundedRect(width / 2 - cardW / 2, height / 2 - cardH / 2, cardW, cardH, 18);
    card.lineStyle(2, 0x00f0ff, 0.7);
    card.strokeRoundedRect(width / 2 - cardW / 2, height / 2 - cardH / 2, cardW, cardH, 18);
    this.modalContainer.add(card);

    // Title
    const title = this.add.text(width / 2, height / 2 - 220, '🏆 ACHIEVEMENTS', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '28px',
      fontWeight: '900',
      letterSpacing: 3,
      color: '#00f0ff',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.modalContainer.add(title);

    // List of 5 achievements
    const list = achievementManager.getAll();
    const startY = height / 2 - 150;

    list.forEach((ach, idx) => {
      const itemY = startY + idx * 72;
      const isUn = ach.isUnlocked;

      const itemBg = this.add.graphics();
      itemBg.fillStyle(isUn ? 0x0f1d40 : 0x070c20, 0.9);
      itemBg.fillRoundedRect(width / 2 - 250, itemY - 26, 500, 58, 10);
      itemBg.lineStyle(1.5, isUn ? 0x00f0ff : 0x243355, isUn ? 0.8 : 0.4);
      itemBg.strokeRoundedRect(width / 2 - 250, itemY - 26, 500, 58, 10);
      this.modalContainer.add(itemBg);

      // Icon & Checkmark
      const statusIcon = isUn ? '✓' : '🔒';
      const statusColor = isUn ? '#00f0ff' : '#64748b';
      const status = this.add.text(width / 2 - 220, itemY + 3, statusIcon, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '20px',
        fontWeight: '900',
        color: statusColor
      }).setOrigin(0.5);
      this.modalContainer.add(status);

      // Title & Desc
      const achTitle = this.add.text(width / 2 - 180, itemY - 12, ach.title, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '15px',
        fontWeight: '700',
        color: isUn ? '#ffffff' : '#8899aa'
      });
      this.modalContainer.add(achTitle);

      const achDesc = this.add.text(width / 2 - 180, itemY + 8, ach.desc, {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '13px',
        color: isUn ? '#00f0ff' : '#6b7280'
      });
      this.modalContainer.add(achDesc);

      // Progress bar if applicable
      if (ach.progress && !isUn) {
        const p = ach.progress;
        const pText = this.add.text(width / 2 + 180, itemY + 3, `${p.current}/${p.target}`, {
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '12px',
          fontWeight: '700',
          color: '#ffcc00'
        }).setOrigin(0.5);
        this.modalContainer.add(pText);
      }
    });

    // Close Button
    const closeBtnY = height / 2 + 225;
    const closeGfx = this.add.graphics();
    closeGfx.fillStyle(0x00f0ff, 1);
    closeGfx.fillRoundedRect(width / 2 - 100, closeBtnY - 22, 200, 44, 10);
    this.modalContainer.add(closeGfx);

    const closeText = this.add.text(width / 2, closeBtnY, 'CLOSE', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '16px',
      fontWeight: '900',
      letterSpacing: 2,
      color: '#05060f'
    }).setOrigin(0.5);
    this.modalContainer.add(closeText);

    const closeHit = this.add.zone(width / 2, closeBtnY, 200, 44).setInteractive({ cursor: 'pointer' });
    closeHit.on('pointerdown', () => {
      soundManager.playClick();
      this.modalContainer.destroy();
      this.modalContainer = null;
    });
    this.modalContainer.add(closeHit);
  }

  loadHighScore() {
    try {
      const saved = localStorage.getItem(GAME_CONFIG.storageKeys.highScore);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch (e) {
      return 0;
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

  createInstructionCard(x, y) {
    const card = this.add.graphics();
    const w = 540;
    const h = 150;
    card.fillStyle(0x0a0e26, 0.7);
    card.fillRoundedRect(x - w / 2, y - h / 2, w, h, 14);
    card.lineStyle(1.5, 0x1d274d, 0.85);
    card.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 14);

    // Row 1: Player Orb
    this.add.image(x - 200, y - 38, 'player_core').setScale(0.75);
    this.add.text(x - 155, y - 46, "CYBER ORB", {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      fontWeight: '700',
      color: '#00f0ff'
    });
    this.add.text(x - 155, y - 29, "Steer your glowing orb with keys or touch. Graze hazards for Close Calls!", {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      color: '#94a3b8'
    });

    // Row 2: Red Hazards
    this.add.image(x - 200, y + 4, 'hazard_mine_core').setScale(0.7);
    this.add.text(x - 155, y - 4, "RED HAZARDS", {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      fontWeight: '700',
      color: '#ff0055'
    });
    this.add.text(x - 155, y + 13, "Lethal on contact! Dodge lasers, crossfire darts & spinning beams.", {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      color: '#94a3b8'
    });

    // Row 3: Blue Energy Orbs
    this.add.image(x - 200, y + 46, 'orb_blue_core').setScale(0.75);
    this.add.text(x - 155, y + 38, "ENERGY ORBS", {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      fontWeight: '700',
      color: '#00f0ff'
    });
    this.add.text(x - 155, y + 55, "Collect blue orbs to escalate Combo Multipliers up to x8 MAX POWER!", {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      color: '#94a3b8'
    });
  }

  createPlayButton(x, y) {
    const btnW = 340;
    const btnH = 70;

    this.btnContainer = this.add.container(x, y);

    this.btnBg = this.add.graphics();
    this.drawButtonGfx(this.btnBg, 0, 0, btnW, btnH, false);
    this.btnContainer.add(this.btnBg);

    // Animated Sheen Beam
    this.sheen = this.add.image(-btnW / 2 - 40, 0, 'btn_sheen');
    this.sheen.setScale(1, btnH / 80);
    this.sheen.setAlpha(0.65);
    this.btnContainer.add(this.sheen);

    this.tweens.add({
      targets: this.sheen,
      x: btnW / 2 + 40,
      duration: 1100,
      repeat: -1,
      repeatDelay: 2200,
      ease: 'Sine.easeInOut'
    });

    const playLabel = this.selectedMode === 'daily' ? 'PLAY DAILY' : 'PLAY NOW';
    this.btnText = this.add.text(0, 0, playLabel, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '25px',
      fontWeight: '900',
      letterSpacing: 4,
      color: '#05060f'
    }).setOrigin(0.5);
    this.btnContainer.add(this.btnText);

    const hitArea = this.add.zone(x, y, btnW, btnH).setInteractive({ cursor: 'pointer' });

    hitArea.on('pointerover', () => {
      this.drawButtonGfx(this.btnBg, 0, 0, btnW, btnH, true);
      soundManager.playClick();
      this.tweens.add({
        targets: this.btnContainer,
        scale: 1.06,
        duration: 140,
        ease: 'Quad.easeOut'
      });
    });

    hitArea.on('pointerout', () => {
      this.drawButtonGfx(this.btnBg, 0, 0, btnW, btnH, false);
      this.tweens.add({
        targets: this.btnContainer,
        scale: 1,
        duration: 140,
        ease: 'Quad.easeOut'
      });
    });

    hitArea.on('pointerdown', () => {
      this.startGame();
    });

    this.tweens.add({
      targets: this.btnContainer,
      scaleX: 1.025,
      scaleY: 1.025,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  drawButtonGfx(gfx, x, y, w, h, isHover) {
    gfx.clear();
    const radius = 16;
    const color = this.selectedMode === 'daily' ? 0xffcc00 : 0x00f0ff;

    if (isHover) {
      gfx.fillStyle(color, 1);
      gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, radius);
      gfx.lineStyle(3, 0xffffff, 1);
      gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, radius);
    } else {
      gfx.fillStyle(color, 0.95);
      gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, radius);
      gfx.lineStyle(2, 0xffffff, 0.7);
      gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, radius);
    }
  }

  createSoundButton(x, y) {
    this.soundBtnBg = this.add.graphics();
    this.soundIcon = this.add.text(x, y, soundManager.isMuted ? '🔇' : '🔊', {
      fontSize: '22px'
    }).setOrigin(0.5);

    const size = 48;
    this.drawSoundBtn(x, y, size);

    const hit = this.add.zone(x, y, size, size).setInteractive({ cursor: 'pointer' });
    hit.on('pointerdown', () => this.toggleSound());
  }

  drawSoundBtn(x, y, size) {
    this.soundBtnBg.clear();
    this.soundBtnBg.fillStyle(0x0a102e, 0.85);
    this.soundBtnBg.fillCircle(x, y, size / 2);
    this.soundBtnBg.lineStyle(2, 0x00f0ff, 0.7);
    this.soundBtnBg.strokeCircle(x, y, size / 2);
  }

  toggleSound() {
    const isMuted = soundManager.toggleMute();
    this.soundIcon.setText(isMuted ? '🔇' : '🔊');
    soundManager.playClick();
  }

  startGame() {
    soundManager.playClick();
    soundManager.startAmbientBgm();
    this.cameras.main.fadeOut(300, 4, 5, 13);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', {
        mode: this.selectedMode
      });
    });
  }

  update(time, delta) {
    if (this.bgGrid) {
      this.bgGrid.tilePositionY -= 0.6;
    }
  }
}
