/**
 * DON'T TOUCH THE RED
 * Main Game Entry Point
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { soundManager } from './audio/SoundManager.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  backgroundColor: '#060713',
  physics: GAME_CONFIG.physics,
  scene: [BootScene, MenuScene, GameScene, PauseScene, GameOverScene]
};

// Start the game
window.addEventListener('DOMContentLoaded', () => {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.style.display = 'none';
  }

  const game = new Phaser.Game(config);

  // Resume Web Audio on first pointer or key event
  const unlockAudio = () => {
    soundManager.initContext();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };

  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
});
