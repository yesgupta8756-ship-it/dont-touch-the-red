/**
 * Orb Entity
 * Blue energy orbs (and rare powerup variants) with magnetic attraction,
 * pulsing animations, shockwave collection ripples, and floating combo popups.
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';
import { soundManager } from '../audio/SoundManager.js';

export class Orb extends Phaser.GameObjects.Container {
  constructor(scene, x, y, type = 'standard') {
    super(scene, x, y);

    this.scene = scene;
    this.type = type; // 'standard' (blue), 'shield', 'emp', 'timewarp'
    this.radius = 15;
    this.magnetRadius = 150;
    this.magnetSpeed = 540;
    this.isCollected = false;

    this.createVisuals();

    // Physics
    scene.physics.world.enable(this);
    this.body.setCircle(this.radius, -this.radius, -this.radius);

    scene.add.existing(this);
    this.setDepth(15);

    this.baseY = y;
    this.floatOffset = Math.random() * Math.PI * 2;
  }

  createVisuals() {
    let texturePrefix = 'orb_blue';
    if (this.type === 'shield') texturePrefix = 'orb_shield';
    else if (this.type === 'emp') texturePrefix = 'orb_emp';
    else if (this.type === 'timewarp') texturePrefix = 'orb_timewarp';

    // Outer glow aura
    this.aura = this.scene.add.image(0, 0, `${texturePrefix}_aura`);
    this.aura.setScale(1.25);
    this.aura.setAlpha(0.7);
    this.add(this.aura);

    // Core orb
    this.core = this.scene.add.image(0, 0, `${texturePrefix}_core`);
    this.core.setScale(0.95);
    this.add(this.core);

    // Orbiting mini spark
    this.spark = this.scene.add.image(10, -10, 'player_spark');
    this.spark.setScale(0.45);
    this.add(this.spark);

    // Dynamic pulse tween
    this.scene.tweens.add({
      targets: this.aura,
      scale: 1.5,
      alpha: 0.95,
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  collect(player) {
    if (this.isCollected) return null;
    this.isCollected = true;

    // Shockwave ripple ring
    const wave = this.scene.add.image(this.x, this.y, 'shockwave_ring').setDepth(30);
    const waveTint = this.type === 'shield' ? 0xffcc00 : this.type === 'emp' ? 0xbd00ff : this.type === 'timewarp' ? 0x00ffaa : 0x00f0ff;
    wave.setTint(waveTint);

    this.scene.tweens.add({
      targets: wave,
      scale: { from: 0.2, to: 1.8 },
      alpha: { from: 1, to: 0 },
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => wave.destroy()
    });

    // Collection particle burst
    const burstColor = this.type === 'shield' ? 'spark_particle' : 'orb_particle';
    const burst = this.scene.add.particles(this.x, this.y, burstColor, {
      speed: { min: 90, max: 260 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.3, end: 0 },
      blendMode: 'ADD',
      lifespan: 480,
      quantity: 20
    });
    burst.explode();

    let result = { type: this.type };

    if (this.type === 'standard') {
      const scoreData = this.scene.scoreManager.addOrbScore();
      soundManager.playOrbCollect(scoreData.combo);
      result.score = scoreData.points;
      result.combo = scoreData.combo;

      const comboTag = scoreData.combo > 1 ? ` x${scoreData.combo}` : '';
      const tierName = scoreData.tier.name ? ` ${scoreData.tier.name}!` : '';
      this.showScorePopup(`+${scoreData.points}${comboTag}${tierName}`, scoreData.tier.color);
    } else if (this.type === 'shield') {
      player.setShield(true);
      this.showScorePopup('SHIELD ACTIVE!', '#ffcc00');
    } else if (this.type === 'emp') {
      soundManager.playEmp();
      this.scene.detonateEmp();
      this.showScorePopup('EMP BLAST!', '#bd00ff');
    } else if (this.type === 'timewarp') {
      soundManager.playNearMiss();
      this.scene.activateTimeWarp();
      this.showScorePopup('SLOW MOTION!', '#00ffaa');
    }

    this.destroy();
    return result;
  }

  showScorePopup(text, colorHex) {
    const popup = this.scene.add.text(this.x, this.y - 10, text, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '18px',
      fontWeight: '900',
      color: colorHex,
      stroke: '#000000',
      strokeThickness: 3.5,
      shadow: { color: colorHex, blur: 8, fill: true }
    }).setOrigin(0.5).setDepth(45);

    this.scene.tweens.add({
      targets: popup,
      y: popup.y - 50,
      alpha: 0,
      scale: { from: 0.8, to: 1.35 },
      duration: 800,
      ease: 'Back.easeOut',
      onComplete: () => popup.destroy()
    });
  }

  update(time, delta, player) {
    if (this.isCollected) return;

    // Orbit spark rotation
    const angle = time * 0.005 + this.floatOffset;
    this.spark.x = Math.cos(angle) * 11;
    this.spark.y = Math.sin(angle) * 11;

    // Magnetic pull toward player
    if (player && player.isAlive) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < this.magnetRadius) {
        const pullFactor = (1 - dist / this.magnetRadius) * this.magnetSpeed * (delta / 1000);
        this.x += (dx / dist) * pullFactor * 1.9;
        this.y += (dy / dist) * pullFactor * 1.9;
        this.body.reset(this.x, this.y);
      }
    }
  }
}
