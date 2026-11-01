/**
 * Player Entity
 * Glowing cyan cyber orb with multi-layer particle trails, physics-based smooth movement,
 * velocity squash & stretch, multi-device controls, near-miss effects, and orbiting shield system.
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';
import { soundManager } from '../audio/SoundManager.js';

export class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    this.scene = scene;
    this.radius = GAME_CONFIG.player.radius;
    this.speed = GAME_CONFIG.player.speed;
    this.isAlive = true;
    this.isShielded = false;
    this.isInvulnerable = false;

    // Movement state
    this.vx = 0;
    this.vy = 0;
    this.targetX = x;
    this.targetY = y;
    this.isPointerActive = false;
    this.pointerTouchOffsetY = -55; // Touch offset for mobile thumb visibility

    // Visual layers
    this.createVisuals();

    // Physics body
    scene.physics.world.enable(this);
    this.body.setCircle(this.radius, -this.radius, -this.radius);
    this.body.setCollideWorldBounds(true);

    // Multi-layer Particle Trail Emitters
    this.createTrailEmitters();

    // Input listeners
    this.initInputs();

    scene.add.existing(this);
  }

  createVisuals() {
    // 1. Outer diffuse aura (pulsing)
    this.aura = this.scene.add.image(0, 0, 'player_aura');
    this.aura.setScale(1.25);
    this.aura.setAlpha(0.65);
    this.add(this.aura);

    // 2. Core glowing sphere
    this.core = this.scene.add.image(0, 0, 'player_core');
    this.add(this.core);

    // 3. Inner bright star spark
    this.spark = this.scene.add.image(0, 0, 'player_spark');
    this.spark.setScale(0.75);
    this.add(this.spark);

    // 4. Multi-Layer Shield System
    this.shieldContainer = this.scene.add.container(0, 0);
    this.shieldGfx = this.scene.add.image(0, 0, 'shield_aura');
    this.shieldGfx.setScale(1.35);
    this.shieldContainer.add(this.shieldGfx);

    // 3 orbiting shield satellite nodes
    this.shieldNodes = [];
    for (let i = 0; i < 3; i++) {
      const node = this.scene.add.image(0, 0, 'shield_node');
      this.shieldNodes.push(node);
      this.shieldContainer.add(node);
    }
    this.shieldContainer.setVisible(false);
    this.add(this.shieldContainer);

    // Breathing glow animation
    this.scene.tweens.add({
      targets: [this.aura],
      scale: 1.45,
      alpha: 0.9,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createTrailEmitters() {
    // Layer 1: Diffuse plasma wisps
    this.wispEmitter = this.scene.add.particles(0, 0, 'player_trail_wisp', {
      follow: this,
      speed: { min: 10, max: 40 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 0.55, end: 0 },
      blendMode: 'ADD',
      lifespan: 350,
      frequency: 35,
      quantity: 1
    });
    this.wispEmitter.setDepth(9);

    // Layer 2: Sharp electric sparks
    this.trailEmitter = this.scene.add.particles(0, 0, 'spark_particle', {
      follow: this,
      speed: { min: 25, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.85, end: 0 },
      alpha: { start: 0.95, end: 0 },
      blendMode: 'ADD',
      lifespan: 280,
      frequency: 20,
      quantity: 1
    });
    this.trailEmitter.setDepth(10);

    this.setDepth(20);
  }

  initInputs() {
    // PC Keyboard
    const { UP, DOWN, LEFT, RIGHT, W, A, S, D } = Phaser.Input.Keyboard.KeyCodes;
    this.keys = this.scene.input.keyboard.addKeys({
      up: UP,
      down: DOWN,
      left: LEFT,
      right: RIGHT,
      w: W,
      a: A,
      s: S,
      d: D
    });

    // Mouse / Touch pointer drag
    this.scene.input.on('pointerdown', (pointer) => {
      if (!this.isAlive) return;
      this.isPointerActive = true;
      this.updatePointerTarget(pointer);
    });

    this.scene.input.on('pointermove', (pointer) => {
      if (!this.isAlive || !this.isPointerActive) return;
      if (pointer.isDown) {
        this.updatePointerTarget(pointer);
      }
    });

    this.scene.input.on('pointerup', () => {
      this.isPointerActive = false;
    });
  }

  updatePointerTarget(pointer) {
    const isTouch = pointer.wasTouch;
    const offsetY = isTouch ? this.pointerTouchOffsetY : 0;
    this.targetX = Phaser.Math.Clamp(pointer.x, this.radius, GAME_CONFIG.width - this.radius);
    this.targetY = Phaser.Math.Clamp(pointer.y + offsetY, this.radius + 65, GAME_CONFIG.height - this.radius - 20);
  }

  setShield(active) {
    this.isShielded = active;
    this.shieldContainer.setVisible(active);
    if (active) {
      soundManager.playShieldPickup();
    }
  }

  triggerNearMissArc(obsX, obsY) {
    // Quick electric lightning zap between player and obstacle
    const arcGfx = this.scene.add.graphics().setDepth(35);
    arcGfx.lineStyle(2, 0x00f0ff, 0.9);

    const midX = (this.x + obsX) / 2 + (Math.random() - 0.5) * 16;
    const midY = (this.y + obsY) / 2 + (Math.random() - 0.5) * 16;

    arcGfx.beginPath();
    arcGfx.moveTo(this.x, this.y);
    arcGfx.lineTo(midX, midY);
    arcGfx.lineTo(obsX, obsY);
    arcGfx.stroke();

    this.scene.time.delayedCall(80, () => {
      arcGfx.destroy();
    });
  }

  hitHazard() {
    if (!this.isAlive) return false;
    if (this.isInvulnerable) return false;

    // If shielded, absorb hit!
    if (this.isShielded) {
      this.setShield(false);
      soundManager.playShieldBreak();
      this.scene.cameras.main.shake(200, 0.018);

      // Shockwave ripple
      const wave = this.scene.add.image(this.x, this.y, 'shockwave_ring').setDepth(30);
      this.scene.tweens.add({
        targets: wave,
        scale: { from: 0.4, to: 2.2 },
        alpha: { from: 1, to: 0 },
        duration: 380,
        ease: 'Cubic.easeOut',
        onComplete: () => wave.destroy()
      });

      this.triggerInvulnerability(1500);
      return false;
    }

    // Lethal hit
    this.die();
    return true;
  }

  triggerInvulnerability(durationMs) {
    this.isInvulnerable = true;
    this.scene.tweens.add({
      targets: [this.core, this.aura, this.spark],
      alpha: 0.25,
      yoyo: true,
      repeat: Math.floor(durationMs / 120),
      duration: 60,
      onComplete: () => {
        this.isInvulnerable = false;
        this.core.setAlpha(1);
        this.aura.setAlpha(0.65);
        this.spark.setAlpha(0.75);
      }
    });
  }

  die() {
    if (!this.isAlive) return;
    this.isAlive = false;

    soundManager.playGameOver();
    this.scene.cameras.main.shake(450, 0.038);
    this.scene.cameras.main.flash(260, 255, 0, 85);

    // Stop trail emitters
    if (this.trailEmitter) this.trailEmitter.stop();
    if (this.wispEmitter) this.wispEmitter.stop();

    // Radial shockwave
    const deathWave = this.scene.add.image(this.x, this.y, 'shockwave_ring').setDepth(30);
    this.scene.tweens.add({
      targets: deathWave,
      scale: { from: 0.2, to: 3.5 },
      alpha: { from: 1, to: 0 },
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => deathWave.destroy()
    });

    // Burst death particles
    const deathBurst = this.scene.add.particles(this.x, this.y, 'spark_particle', {
      speed: { min: 80, max: 340 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 800,
      quantity: 48
    });
    deathBurst.explode();

    // Red glitch debris
    const debrisBurst = this.scene.add.particles(this.x, this.y, 'red_debris', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.3, end: 0 },
      lifespan: 750,
      quantity: 32
    });
    debrisBurst.explode();

    this.setVisible(false);
    this.body.setVelocity(0, 0);
  }

  update(time, delta) {
    if (!this.isAlive) return;

    const friction = GAME_CONFIG.player.friction;
    let moveX = 0;
    let moveY = 0;

    // Check keyboard inputs
    const k = this.keys;
    if (k.left.isDown || k.a.isDown) moveX -= 1;
    if (k.right.isDown || k.d.isDown) moveX += 1;
    if (k.up.isDown || k.w.isDown) moveY -= 1;
    if (k.down.isDown || k.s.isDown) moveY += 1;

    if (moveX !== 0 || moveY !== 0) {
      this.isPointerActive = false;

      if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071;
        moveY *= 0.7071;
      }

      this.vx = Phaser.Math.Linear(this.vx, moveX * this.speed, 0.24);
      this.vy = Phaser.Math.Linear(this.vy, moveY * this.speed, 0.24);

      this.x += this.vx * (delta / 1000);
      this.y += this.vy * (delta / 1000);
    } else if (this.isPointerActive) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 3) {
        const lerpFactor = Math.min(1, 15 * (delta / 1000));
        this.x += dx * lerpFactor;
        this.y += dy * lerpFactor;
        this.vx = dx * 10;
        this.vy = dy * 10;
      } else {
        this.vx = 0;
        this.vy = 0;
      }
    } else {
      this.vx *= friction;
      this.vy *= friction;
      this.x += this.vx * (delta / 1000);
      this.y += this.vy * (delta / 1000);
    }

    // Keep within play arena bounds (top HUD space accounted for)
    const minX = this.radius;
    const maxX = GAME_CONFIG.width - this.radius;
    const minY = 75 + this.radius;
    const maxY = GAME_CONFIG.height - this.radius - 10;

    this.x = Phaser.Math.Clamp(this.x, minX, maxX);
    this.y = Phaser.Math.Clamp(this.y, minY, maxY);

    // Sync physics body position
    this.body.reset(this.x, this.y);

    // Dynamic Velocity Squash & Stretch
    const speed = Math.hypot(this.vx, this.vy);
    const maxStretch = 0.18;
    const stretch = Math.min(maxStretch, (speed / this.speed) * maxStretch);
    if (speed > 40) {
      const angle = Math.atan2(this.vy, this.vx);
      this.rotation = angle;
      this.scaleX = 1 + stretch;
      this.scaleY = 1 - stretch * 0.7;
    } else {
      this.rotation = 0;
      this.scaleX = Phaser.Math.Linear(this.scaleX, 1, 0.2);
      this.scaleY = Phaser.Math.Linear(this.scaleY, 1, 0.2);
    }

    // Orbiting Shield Nodes animation
    if (this.isShielded) {
      const shieldOrbitRadius = 38;
      const t = time * 0.0035;
      for (let i = 0; i < this.shieldNodes.length; i++) {
        const nodeAngle = t + (Math.PI * 2 / 3) * i;
        this.shieldNodes[i].x = Math.cos(nodeAngle) * shieldOrbitRadius;
        this.shieldNodes[i].y = Math.sin(nodeAngle) * shieldOrbitRadius;
      }
      this.shieldGfx.rotation = -time * 0.0015;
    }

    // Dynamic Trail Rate
    if (this.trailEmitter) {
      this.trailEmitter.frequency = speed > 120 ? 14 : 35;
    }
  }

  destroy() {
    if (this.trailEmitter) this.trailEmitter.destroy();
    if (this.wispEmitter) this.wispEmitter.destroy();
    super.destroy();
  }
}
