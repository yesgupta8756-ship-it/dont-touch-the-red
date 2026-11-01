/**
 * Red Obstacles
 * High-voltage neon hazards: Falling Mines, Sweeping Laser Walls, Spinning Cross Beams,
 * Telegraphed Crossfire Darts, and Chaser Drones with near-miss detection and warning indicators.
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export class ObstacleBase extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene = scene;
    this.isDead = false;
    this.nearMissChecked = false;
    this.speedMultiplier = 1;
    scene.add.existing(this);
    this.setDepth(12);
  }

  setSpeedMultiplier(mult) {
    this.speedMultiplier = mult;
  }

  checkNearMiss(player) {
    if (this.nearMissChecked || !player || !player.isAlive) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const dangerDist = (this.hitRadius || 20) + player.radius;
    const nearMissThreshold = dangerDist + GAME_CONFIG.player.nearMissRadius;

    if (dist <= nearMissThreshold && dist > dangerDist) {
      this.nearMissChecked = true;
      if (player.triggerNearMissArc) {
        player.triggerNearMissArc(this.x, this.y);
      }
      this.scene.onNearMiss(this.x, this.y);
    }
  }

  explode() {
    if (this.isDead) return;
    this.isDead = true;

    // Disintegration particles
    const burst = this.scene.add.particles(this.x, this.y, 'red_debris', {
      speed: { min: 70, max: 220 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.1, end: 0 },
      lifespan: 500,
      quantity: 14
    });
    burst.explode();

    this.destroy();
  }
}

/**
 * 1. Red Mine / Asteroid
 * Pulsing spiked red orb that falls or drifts diagonally with glowing trail
 */
export class RedMine extends ObstacleBase {
  constructor(scene, x, y, vy = 220, vx = 0, size = 1) {
    super(scene, x, y);

    this.hitRadius = 18 * size;
    this.vy = vy;
    this.vx = vx;
    this.rotSpeed = Phaser.Math.FloatBetween(-2.5, 2.5);

    // Visuals
    this.aura = this.scene.add.image(0, 0, 'hazard_mine_aura');
    this.aura.setScale(size * 1.15);
    this.aura.setAlpha(0.75);
    this.add(this.aura);

    this.core = this.scene.add.image(0, 0, 'hazard_mine_core');
    this.core.setScale(size);
    this.add(this.core);

    // Physics
    this.scene.physics.world.enable(this);
    this.body.setCircle(this.hitRadius, -this.hitRadius, -this.hitRadius);

    // Pulsing aura tween
    this.scene.tweens.add({
      targets: this.aura,
      scale: size * 1.45,
      alpha: 0.98,
      duration: 380 + Math.random() * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  update(time, delta, player) {
    if (this.isDead) return;

    const dt = delta / 1000;
    this.x += this.vx * this.speedMultiplier * dt;
    this.y += this.vy * this.speedMultiplier * dt;
    this.core.rotation += this.rotSpeed * dt;

    this.body.reset(this.x, this.y);
    this.checkNearMiss(player);

    if (this.y > GAME_CONFIG.height + 60 || this.x < -80 || this.x > GAME_CONFIG.width + 80) {
      this.destroy();
    }
  }
}

/**
 * 2. Sweeping Laser Wall
 * A wide laser barrier with a safe gap for player to dodge through,
 * accompanied by warning strobe beacons at top of screen.
 */
export class LaserWall extends ObstacleBase {
  constructor(scene, y, gapX, gapWidth = 150, vy = 190) {
    super(scene, 0, y);

    this.vy = vy;
    this.gapX = gapX;
    this.gapWidth = Math.max(135, gapWidth); // Guarantee fair clearance
    this.wallHeight = 22;
    this.hitRadius = 14;

    this.createSegments();

    this.scene.physics.world.enable(this);
    this.body.setAllowGravity(false);
  }

  createSegments() {
    const leftWidth = Math.max(0, this.gapX - this.gapWidth / 2);
    const rightStart = this.gapX + this.gapWidth / 2;
    const rightWidth = Math.max(0, GAME_CONFIG.width - rightStart);

    // Left laser bar
    if (leftWidth > 0) {
      this.leftGfx = this.scene.add.graphics();
      this.leftGfx.fillStyle(0xff0055, 0.92);
      this.leftGfx.fillRoundedRect(0, -this.wallHeight / 2, leftWidth, this.wallHeight, 6);
      this.leftGfx.lineStyle(2, 0xffffff, 0.9);
      this.leftGfx.strokeRoundedRect(0, -this.wallHeight / 2, leftWidth, this.wallHeight, 6);
      this.add(this.leftGfx);

      // Warning hazard hash marks
      this.leftGfx.lineStyle(2, 0x55001a, 0.75);
      for (let x = 12; x < leftWidth - 10; x += 22) {
        this.leftGfx.lineBetween(x, -this.wallHeight / 2 + 3, x + 9, this.wallHeight / 2 - 3);
      }
    }

    // Right laser bar
    if (rightWidth > 0) {
      this.rightGfx = this.scene.add.graphics();
      this.rightGfx.fillStyle(0xff0055, 0.92);
      this.rightGfx.fillRoundedRect(rightStart, -this.wallHeight / 2, rightWidth, this.wallHeight, 6);
      this.rightGfx.lineStyle(2, 0xffffff, 0.9);
      this.rightGfx.strokeRoundedRect(rightStart, -this.wallHeight / 2, rightWidth, this.wallHeight, 6);
      this.add(this.rightGfx);

      this.rightGfx.lineStyle(2, 0x55001a, 0.75);
      for (let x = rightStart + 12; x < GAME_CONFIG.width - 10; x += 22) {
        this.rightGfx.lineBetween(x, -this.wallHeight / 2 + 3, x + 9, this.wallHeight / 2 - 3);
      }
    }

    // Gap edge indicators (pulsing safe guide beacons)
    this.createGapMarker(this.gapX - this.gapWidth / 2, 0);
    this.createGapMarker(this.gapX + this.gapWidth / 2, 0);
  }

  createGapMarker(x, y) {
    const marker = this.scene.add.image(x, y, 'player_spark');
    marker.setScale(0.55);
    marker.setTint(0x00f0ff);
    this.add(marker);

    this.scene.tweens.add({
      targets: marker,
      scale: 0.85,
      alpha: 0.35,
      duration: 320,
      yoyo: true,
      repeat: -1
    });
  }

  checkCollisionWithPlayer(player) {
    if (this.isDead || !player || !player.isAlive) return false;

    const playerTop = player.y - player.radius;
    const playerBottom = player.y + player.radius;
    const wallTop = this.y - this.wallHeight / 2;
    const wallBottom = this.y + this.wallHeight / 2;

    // Check vertical overlap
    if (playerBottom >= wallTop && playerTop <= wallBottom) {
      const leftBoundary = this.gapX - this.gapWidth / 2;
      const rightBoundary = this.gapX + this.gapWidth / 2;
      const playerLeft = player.x - player.radius;
      const playerRight = player.x + player.radius;

      if (playerLeft < leftBoundary || playerRight > rightBoundary) {
        return true;
      }
    }

    // Near miss detection when gliding cleanly through gap
    if (!this.nearMissChecked && Math.abs(player.y - this.y) < 26) {
      const leftDist = Math.abs(player.x - (this.gapX - this.gapWidth / 2));
      const rightDist = Math.abs(player.x - (this.gapX + this.gapWidth / 2));
      if (leftDist < player.radius + 32 || rightDist < player.radius + 32) {
        this.nearMissChecked = true;
        this.scene.onNearMiss(player.x, this.y);
      }
    }

    return false;
  }

  update(time, delta, player) {
    if (this.isDead) return;

    this.y += this.vy * this.speedMultiplier * (delta / 1000);

    if (this.y > GAME_CONFIG.height + 60) {
      this.destroy();
    }
  }
}

/**
 * 3. Spinning Laser Cross
 * Rotating neon laser beams that spin around a central pivot with laser flares
 */
export class SpinningCross extends ObstacleBase {
  constructor(scene, x, y, arms = 3, armLength = 110, rotSpeed = 1.8, vy = 110) {
    super(scene, x, y);

    this.arms = arms;
    this.armLength = armLength;
    this.rotSpeed = rotSpeed;
    this.vy = vy;
    this.currentAngle = 0;
    this.hitRadius = armLength;

    // Center hub
    this.hubAura = this.scene.add.image(0, 0, 'hazard_mine_aura');
    this.hubAura.setScale(0.85);
    this.add(this.hubAura);

    this.hub = this.scene.add.image(0, 0, 'hazard_mine_core');
    this.hub.setScale(0.75);
    this.add(this.hub);

    // Laser beams container
    this.beamGfx = this.scene.add.graphics();
    this.add(this.beamGfx);

    this.renderBeams();
  }

  renderBeams() {
    this.beamGfx.clear();
    const step = (Math.PI * 2) / this.arms;

    for (let i = 0; i < this.arms; i++) {
      const angle = this.currentAngle + step * i;
      const endX = Math.cos(angle) * this.armLength;
      const endY = Math.sin(angle) * this.armLength;

      // Outer red glow line
      this.beamGfx.lineStyle(10, 0xff0055, 0.45);
      this.beamGfx.lineBetween(0, 0, endX, endY);

      // Core bright laser line
      this.beamGfx.lineStyle(4, 0xffffff, 0.95);
      this.beamGfx.lineBetween(0, 0, endX, endY);

      // Glowing tip
      this.beamGfx.fillStyle(0xff0055, 0.95);
      this.beamGfx.fillCircle(endX, endY, 6);
      this.beamGfx.fillStyle(0xffffff, 1);
      this.beamGfx.fillCircle(endX, endY, 2.5);
    }
  }

  checkCollisionWithPlayer(player) {
    if (this.isDead || !player || !player.isAlive) return false;

    const distToCenter = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (distToCenter > this.armLength + player.radius) return false;

    // Hub collision
    if (distToCenter < 18 + player.radius) return true;

    // Check line segment intersection for each arm
    const step = (Math.PI * 2) / this.arms;
    const pX = player.x - this.x;
    const pY = player.y - this.y;

    for (let i = 0; i < this.arms; i++) {
      const angle = this.currentAngle + step * i;
      const endX = Math.cos(angle) * this.armLength;
      const endY = Math.sin(angle) * this.armLength;

      const lineDist = this.pointToSegmentDistance(pX, pY, 0, 0, endX, endY);
      if (lineDist < player.radius + 5) {
        return true;
      }
      if (!this.nearMissChecked && lineDist < player.radius + 32) {
        this.nearMissChecked = true;
        this.scene.onNearMiss(player.x, player.y);
      }
    }

    return false;
  }

  pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    return Math.hypot(px - projX, py - projY);
  }

  update(time, delta, player) {
    if (this.isDead) return;

    const dt = delta / 1000;
    this.y += this.vy * this.speedMultiplier * dt;
    this.currentAngle += this.rotSpeed * this.speedMultiplier * dt;

    this.renderBeams();

    if (this.y > GAME_CONFIG.height + this.armLength + 50) {
      this.destroy();
    }
  }
}

/**
 * 4. Crossfire Dart
 * High-speed telegraphed projectile with 800ms warning beacon
 */
export class CrossfireDart extends ObstacleBase {
  constructor(scene, y, direction = 1, speed = 660) {
    const startX = direction === 1 ? -45 : GAME_CONFIG.width + 45;
    super(scene, startX, y);

    this.direction = direction; // 1 = Left to Right, -1 = Right to Left
    this.speed = speed;
    this.hitRadius = 15;
    this.isTelegraphing = true;
    this.telegraphDuration = 800; // Fair reaction window
    this.telegraphTimer = 0;

    // Edge Warning Icon (Alert beacon on screen border)
    const beaconX = direction === 1 ? 24 : GAME_CONFIG.width - 24;
    this.warningBeacon = this.scene.add.image(beaconX, y, 'hazard_warning').setDepth(40);
    this.scene.tweens.add({
      targets: this.warningBeacon,
      scale: { from: 0.8, to: 1.25 },
      alpha: { from: 0.5, to: 1 },
      duration: 180,
      yoyo: true,
      repeat: -1
    });

    // Dotted guide telegraph line across screen
    this.telegraphLine = this.scene.add.graphics();
    this.telegraphLine.setDepth(6);
    this.drawTelegraph();

    // Projectile visual
    this.core = this.scene.add.image(0, 0, 'hazard_mine_core');
    this.core.setScale(0.8);
    this.core.setVisible(false);
    this.add(this.core);

    this.aura = this.scene.add.image(0, 0, 'hazard_mine_aura');
    this.aura.setScale(1.15);
    this.aura.setVisible(false);
    this.add(this.aura);

    this.scene.physics.world.enable(this);
    this.body.setCircle(this.hitRadius, -this.hitRadius, -this.hitRadius);
  }

  drawTelegraph() {
    this.telegraphLine.clear();
    this.telegraphLine.lineStyle(2, 0xff0055, 0.45);
    for (let x = 0; x < GAME_CONFIG.width; x += 26) {
      this.telegraphLine.lineBetween(x, this.y, x + 13, this.y);
    }
  }

  update(time, delta, player) {
    if (this.isDead) return;

    if (this.isTelegraphing) {
      this.telegraphTimer += delta;
      const pulse = (Math.sin(time * 0.025) + 1) * 0.5;
      this.telegraphLine.setAlpha(0.35 + pulse * 0.6);

      if (this.telegraphTimer >= this.telegraphDuration) {
        this.isTelegraphing = false;
        if (this.telegraphLine && this.telegraphLine.active) this.telegraphLine.destroy();
        if (this.warningBeacon && this.warningBeacon.active) this.warningBeacon.destroy();

        this.core.setVisible(true);
        this.aura.setVisible(true);
      }
      return;
    }

    const dt = delta / 1000;
    this.x += this.direction * this.speed * this.speedMultiplier * dt;
    this.body.reset(this.x, this.y);

    this.checkNearMiss(player);

    if (this.direction === 1 && this.x > GAME_CONFIG.width + 60) {
      this.destroy();
    } else if (this.direction === -1 && this.x < -60) {
      this.destroy();
    }
  }

  destroy() {
    if (this.telegraphLine && this.telegraphLine.active) this.telegraphLine.destroy();
    if (this.warningBeacon && this.warningBeacon.active) this.warningBeacon.destroy();
    super.destroy();
  }
}

/**
 * 5. Chaser Seeker Drone
 * Tracks player position with pulsing target aura, charges forward, then self-destructs
 */
export class ChaserDrone extends ObstacleBase {
  constructor(scene, x, y, speed = 210) {
    super(scene, x, y);

    this.hitRadius = 15;
    this.speed = speed;
    this.lifeTimer = 0;
    this.maxLife = 5000;

    this.core = this.scene.add.image(0, 0, 'hazard_mine_core');
    this.core.setScale(0.85);
    this.add(this.core);

    this.aura = this.scene.add.image(0, 0, 'hazard_mine_aura');
    this.aura.setScale(1.2);
    this.add(this.aura);

    this.scene.physics.world.enable(this);
    this.body.setCircle(this.hitRadius, -this.hitRadius, -this.hitRadius);
  }

  update(time, delta, player) {
    if (this.isDead) return;

    this.lifeTimer += delta;
    if (this.lifeTimer >= this.maxLife) {
      this.explode();
      return;
    }

    if (player && player.isAlive) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      const dt = delta / 1000;
      this.x += Math.cos(angle) * this.speed * this.speedMultiplier * dt;
      this.y += Math.sin(angle) * this.speed * this.speedMultiplier * dt;
      this.rotation = angle;
    }

    this.body.reset(this.x, this.y);
    this.checkNearMiss(player);
  }
}
