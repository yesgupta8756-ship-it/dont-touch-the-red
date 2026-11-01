/**
 * BootScene
 * Generates all neon cyber textures procedurally using HTML5 Canvas
 * and transitions immediately into MenuScene with zero asset loading latency.
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.generateProceduralTextures();
    this.scene.start('MenuScene');
  }

  generateProceduralTextures() {
    // 1. Player Textures
    this.createRadialTexture('player_core', 40, [
      { stop: 0, color: 'rgba(255, 255, 255, 1)' },
      { stop: 0.35, color: 'rgba(0, 240, 255, 1)' },
      { stop: 0.75, color: 'rgba(0, 119, 255, 0.95)' },
      { stop: 1, color: 'rgba(0, 34, 68, 0)' }
    ]);

    this.createRadialTexture('player_aura', 72, [
      { stop: 0, color: 'rgba(0, 240, 255, 0.85)' },
      { stop: 0.45, color: 'rgba(0, 119, 255, 0.4)' },
      { stop: 0.8, color: 'rgba(0, 68, 150, 0.15)' },
      { stop: 1, color: 'rgba(0, 34, 68, 0)' }
    ]);

    this.createStarSparkTexture('player_spark', 26, '#ffffff', '#00f0ff');

    this.createRadialTexture('spark_particle', 16, [
      { stop: 0, color: '#ffffff' },
      { stop: 0.4, color: '#00f0ff' },
      { stop: 1, color: 'rgba(0, 119, 255, 0)' }
    ]);

    this.createRadialTexture('player_trail_wisp', 24, [
      { stop: 0, color: 'rgba(0, 240, 255, 0.7)' },
      { stop: 0.6, color: 'rgba(0, 119, 255, 0.25)' },
      { stop: 1, color: 'rgba(0, 40, 80, 0)' }
    ]);

    // Shockwave Ripple Ring (for orb collection, explosions, near misses)
    this.createShockwaveTexture('shockwave_ring', 96);

    // Shield Aura & Satellite Nodes
    this.createShieldTexture('shield_aura', 64);
    this.createRadialTexture('shield_node', 14, [
      { stop: 0, color: '#ffffff' },
      { stop: 0.5, color: '#00f0ff' },
      { stop: 1, color: 'rgba(0, 240, 255, 0)' }
    ]);

    // 2. Energy Orbs (Blue standard)
    this.createRadialTexture('orb_blue_core', 34, [
      { stop: 0, color: '#ffffff' },
      { stop: 0.4, color: '#00f0ff' },
      { stop: 0.8, color: '#0055ff' },
      { stop: 1, color: 'rgba(0, 50, 150, 0)' }
    ]);

    this.createRadialTexture('orb_blue_aura', 58, [
      { stop: 0, color: 'rgba(0, 240, 255, 0.75)' },
      { stop: 0.55, color: 'rgba(0, 100, 255, 0.3)' },
      { stop: 1, color: 'rgba(0, 20, 60, 0)' }
    ]);

    this.createRadialTexture('orb_particle', 16, [
      { stop: 0, color: '#ffffff' },
      { stop: 0.4, color: '#00f0ff' },
      { stop: 1, color: 'rgba(0, 240, 255, 0)' }
    ]);

    // Shield Powerup Orb (Gold)
    this.createRadialTexture('orb_shield_core', 34, [
      { stop: 0, color: '#ffffff' },
      { stop: 0.4, color: '#ffea00' },
      { stop: 0.8, color: '#ff9900' },
      { stop: 1, color: 'rgba(150, 80, 0, 0)' }
    ]);

    this.createRadialTexture('orb_shield_aura', 58, [
      { stop: 0, color: 'rgba(255, 230, 0, 0.8)' },
      { stop: 0.6, color: 'rgba(255, 140, 0, 0.3)' },
      { stop: 1, color: 'rgba(80, 40, 0, 0)' }
    ]);

    // EMP Powerup Orb (Violet)
    this.createRadialTexture('orb_emp_core', 34, [
      { stop: 0, color: '#ffffff' },
      { stop: 0.4, color: '#e056fd' },
      { stop: 0.8, color: '#be2edd' },
      { stop: 1, color: 'rgba(120, 0, 150, 0)' }
    ]);

    this.createRadialTexture('orb_emp_aura', 58, [
      { stop: 0, color: 'rgba(224, 86, 253, 0.8)' },
      { stop: 0.6, color: 'rgba(190, 46, 221, 0.3)' },
      { stop: 1, color: 'rgba(60, 0, 80, 0)' }
    ]);

    // Time Warp Powerup Orb (Emerald)
    this.createRadialTexture('orb_timewarp_core', 34, [
      { stop: 0, color: '#ffffff' },
      { stop: 0.4, color: '#00ffaa' },
      { stop: 0.8, color: '#00bb77' },
      { stop: 1, color: 'rgba(0, 100, 60, 0)' }
    ]);

    this.createRadialTexture('orb_timewarp_aura', 58, [
      { stop: 0, color: 'rgba(0, 255, 170, 0.8)' },
      { stop: 0.6, color: 'rgba(0, 180, 110, 0.3)' },
      { stop: 1, color: 'rgba(0, 60, 30, 0)' }
    ]);

    // 3. Red Hazard Textures
    this.createSpikedHazardTexture('hazard_mine_core', 44);

    this.createRadialTexture('hazard_mine_aura', 70, [
      { stop: 0, color: 'rgba(255, 0, 85, 0.88)' },
      { stop: 0.5, color: 'rgba(200, 0, 60, 0.35)' },
      { stop: 1, color: 'rgba(80, 0, 20, 0)' }
    ]);

    this.createDebrisTexture('red_debris', 18, '#ff0055');

    // Warning Badge Icon
    this.createWarningTexture('hazard_warning', 36);

    // Laser flare tip
    this.createRadialTexture('laser_flare', 28, [
      { stop: 0, color: '#ffffff' },
      { stop: 0.4, color: '#ff0055' },
      { stop: 1, color: 'rgba(255, 0, 85, 0)' }
    ]);

    // 4. Background & UI Textures
    this.createGridTexture('cyber_grid', 64, 64);
    this.createStarTexture('cyber_star', 8);
    this.createTrophyTexture('trophy_gold', 48);
    this.createSheenTexture('btn_sheen', 60, 80);
    this.createShareIconTexture('share_icon', 36);
    this.createMedalTexture('medal_icon', 36);
  }

  createShareIconTexture(key, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;

    // Node 1 (right top), Node 2 (right bottom), Node 3 (left middle)
    const n1 = { x: 26, y: 10 };
    const n2 = { x: 26, y: 26 };
    const n3 = { x: 10, y: 18 };

    // Connecting lines
    ctx.beginPath();
    ctx.moveTo(n1.x, n1.y);
    ctx.lineTo(n3.x, n3.y);
    ctx.lineTo(n2.x, n2.y);
    ctx.stroke();

    // Node circles
    ctx.fillStyle = '#ffffff';
    [n1, n2, n3].forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    this.textures.addCanvas(key, canvas);
  }

  createMedalTexture(key, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;

    // Ribbons
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(half - 6, half + 4);
    ctx.lineTo(half - 10, size - 2);
    ctx.lineTo(half - 2, size - 6);
    ctx.lineTo(half, half + 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0077ff';
    ctx.beginPath();
    ctx.moveTo(half + 6, half + 4);
    ctx.lineTo(half + 10, size - 2);
    ctx.lineTo(half + 2, size - 6);
    ctx.lineTo(half, half + 8);
    ctx.closePath();
    ctx.fill();

    // Medal circle
    ctx.fillStyle = '#ffcc00';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(half, half - 3, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Center star
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(half, half - 3, 3, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas(key, canvas);
  }

  createRadialTexture(key, size, stops) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const radius = size / 2;

    const grad = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    stops.forEach((s) => grad.addColorStop(s.stop, s.color));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas(key, canvas);
  }

  createStarSparkTexture(key, size, coreColor, glowColor) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;

    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(half, half, half * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(half, 2);
    ctx.lineTo(half, size - 2);
    ctx.moveTo(2, half);
    ctx.lineTo(size - 2, half);
    ctx.stroke();

    this.textures.addCanvas(key, canvas);
  }

  createShockwaveTexture(key, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;
    const radius = half - 5;

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(half, half, radius, 0, Math.PI * 2);
    ctx.stroke();

    this.textures.addCanvas(key, canvas);
  }

  createShieldTexture(key, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;
    const r = half - 4;

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.95)';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;

    // Hexagonal ring
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = half + r * Math.cos(angle);
      const y = half + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Inner circle ring
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(half, half, r * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    this.textures.addCanvas(key, canvas);
  }

  createSpikedHazardTexture(key, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;
    const rOuter = half - 2;
    const rInner = half * 0.58;
    const spikes = 8;

    ctx.fillStyle = '#ff0055';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? rOuter : rInner;
      const angle = (Math.PI / spikes) * i;
      const x = half + r * Math.cos(angle);
      const y = half + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner glowing core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(half, half, 4.5, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas(key, canvas);
  }

  createWarningTexture(key, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;

    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 8;

    // Triangle
    ctx.beginPath();
    ctx.moveTo(half, 4);
    ctx.lineTo(size - 4, size - 6);
    ctx.lineTo(4, size - 6);
    ctx.closePath();
    ctx.fill();

    // Exclamation mark
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(half - 2, 12, 4, 10);
    ctx.beginPath();
    ctx.arc(half, 26, 2.5, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas(key, canvas);
  }

  createDebrisTexture(key, size, color) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(2, 2);
    ctx.lineTo(size - 2, 4);
    ctx.lineTo(size / 2, size - 2);
    ctx.closePath();
    ctx.fill();

    this.textures.addCanvas(key, canvas);
  }

  createGridTexture(key, w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.09)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);

    // Glowing intersections
    ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.fillRect(0, 0, 3, 3);
    ctx.fillRect(w - 3, 0, 3, 3);
    ctx.fillRect(0, h - 3, 3, 3);
    ctx.fillRect(w - 3, h - 3, 3, 3);

    this.textures.addCanvas(key, canvas);
  }

  createStarTexture(key, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;

    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.8)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    this.textures.addCanvas(key, canvas);
  }

  createTrophyTexture(key, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;

    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ffea00';
    ctx.shadowBlur = 10;

    // Cup body
    ctx.beginPath();
    ctx.moveTo(half - 14, 10);
    ctx.lineTo(half + 14, 10);
    ctx.lineTo(half + 11, 26);
    ctx.bezierCurveTo(half + 9, 34, half - 9, 34, half - 11, 26);
    ctx.closePath();
    ctx.fill();

    // Stem & Base
    ctx.fillRect(half - 3, 33, 6, 8);
    ctx.fillRect(half - 12, 41, 24, 4);

    // Handles
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(half - 14, 18, 6, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(half + 14, 18, 6, Math.PI * 1.5, Math.PI * 0.5);
    ctx.stroke();

    this.textures.addCanvas(key, canvas);
  }

  createSheenTexture(key, w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    this.textures.addCanvas(key, canvas);
  }
}
