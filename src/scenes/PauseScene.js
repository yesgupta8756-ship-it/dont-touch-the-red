/**
 * PauseScene
 * Semi-transparent cyber frosted glass overlay with Resume, Retry, Sound Toggle, and Menu options.
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';
import { soundManager } from '../audio/SoundManager.js';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    const { width, height } = GAME_CONFIG;

    // Dark backdrop overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x04050e, 0.85);
    overlay.fillRect(0, 0, width, height);

    // Dialog card
    const cardW = 460;
    const cardH = 430;
    const card = this.add.graphics();
    card.fillStyle(0x090d24, 0.96);
    card.fillRoundedRect(width / 2 - cardW / 2, height / 2 - cardH / 2, cardW, cardH, 18);
    card.lineStyle(2, 0x00f0ff, 0.6);
    card.strokeRoundedRect(width / 2 - cardW / 2, height / 2 - cardH / 2, cardW, cardH, 18);

    // Title
    this.add.text(width / 2, height / 2 - 145, 'GAME PAUSED', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '34px',
      fontWeight: '900',
      letterSpacing: 3,
      color: '#00f0ff',
      stroke: '#ffffff',
      strokeThickness: 2.5
    }).setOrigin(0.5);

    // Buttons
    this.createMenuButton(width / 2, height / 2 - 60, 'RESUME', 0x00f0ff, () => this.resumeGame());
    this.createMenuButton(width / 2, height / 2 + 10, 'RESTART', 0x0077ff, () => this.restartGame());
    this.createSoundToggleButton(width / 2, height / 2 + 80);
    this.createMenuButton(width / 2, height / 2 + 150, 'MAIN MENU', 0x1e293b, () => this.quitToMenu());

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
    this.input.keyboard.on('keydown-P', () => this.resumeGame());
  }

  createMenuButton(x, y, label, baseColor, callback) {
    const btnW = 320;
    const btnH = 54;

    const gfx = this.add.graphics();
    const draw = (hover) => {
      gfx.clear();
      if (hover) {
        gfx.fillStyle(0x00f0ff, 1);
        gfx.fillRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 12);
        gfx.lineStyle(2, 0xffffff, 1);
        gfx.strokeRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 12);
      } else {
        gfx.fillStyle(baseColor, 0.88);
        gfx.fillRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 12);
        gfx.lineStyle(1.5, 0x00f0ff, 0.4);
        gfx.strokeRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 12);
      }
    };

    draw(false);

    const textColor = baseColor === 0x00f0ff ? '#060713' : '#ffffff';
    const text = this.add.text(x, y, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '18px',
      fontWeight: '700',
      letterSpacing: 2,
      color: textColor
    }).setOrigin(0.5);

    const hit = this.add.zone(x, y, btnW, btnH).setInteractive({ cursor: 'pointer' });
    hit.on('pointerover', () => {
      draw(true);
      text.setColor('#060713');
      soundManager.playClick();
    });
    hit.on('pointerout', () => {
      draw(false);
      text.setColor(textColor);
    });
    hit.on('pointerdown', () => {
      soundManager.playClick();
      callback();
    });
  }

  createSoundToggleButton(x, y) {
    const btnW = 320;
    const btnH = 50;

    const gfx = this.add.graphics();
    const draw = (hover) => {
      gfx.clear();
      gfx.fillStyle(hover ? 0x1e293b : 0x121a36, 0.9);
      gfx.fillRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 12);
      gfx.lineStyle(1.5, 0x00f0ff, hover ? 0.8 : 0.4);
      gfx.strokeRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 12);
    };
    draw(false);

    const text = this.add.text(x, y, `AUDIO: ${soundManager.isMuted ? 'MUTED 🔇' : 'ON 🔊'}`, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '16px',
      fontWeight: '700',
      letterSpacing: 2,
      color: '#ffffff'
    }).setOrigin(0.5);

    const hit = this.add.zone(x, y, btnW, btnH).setInteractive({ cursor: 'pointer' });
    hit.on('pointerover', () => draw(true));
    hit.on('pointerout', () => draw(false));
    hit.on('pointerdown', () => {
      const isMuted = soundManager.toggleMute();
      text.setText(`AUDIO: ${isMuted ? 'MUTED 🔇' : 'ON 🔊'}`);
      soundManager.playClick();
    });
  }

  resumeGame() {
    this.scene.stop();
    this.scene.resume('GameScene');
  }

  restartGame() {
    this.scene.stop();
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
  }

  quitToMenu() {
    this.scene.stop();
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }
}
