/* ============================================================================
   BIGG BOSS FIGHT : REALISTIC 3D STAGE, LIGHTING & PARTICLE FX ENGINE
   ============================================================================ */

class ArenaEngine {
  constructor() {
    this.particles = [];
    this.vitalityOrbs = [];
    this.callouts = [];
    this.spotlights = [
      { angle: -0.45, speed: 0.012, color: 'rgba(0, 229, 255, 0.18)' },
      { angle: 0.45, speed: -0.014, color: 'rgba(255, 204, 0, 0.18)' },
      { angle: 0.1, speed: 0.018, color: 'rgba(255, 0, 119, 0.16)' }
    ];
  }

  // Draw Realistic 3D Bigg Boss Eviction Arena
  drawArena(ctx, timer, p1, cpu) {
    const w = 1080;
    const groundY = 485;

    // 1. Atmospheric Deep Background Gradient
    const bgGrad = ctx.createRadialGradient(w / 2, 220, 40, w / 2, 220, 680);
    bgGrad.addColorStop(0, "#230e38");
    bgGrad.addColorStop(0.5, "#120622");
    bgGrad.addColorStop(1, "#05020a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, groundY);

    // 2. Stage Lighting Truss Structure & Silhouette Crowd
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1.5;
    for (let tx = 40; tx < w; tx += 60) {
      ctx.beginPath();
      ctx.moveTo(tx, 0);
      ctx.lineTo(tx + 30, 90);
      ctx.lineTo(tx + 60, 0);
      ctx.stroke();
    }
    ctx.strokeRect(0, 85, w, 6);

    // Audience Silhouettes in Darkness
    ctx.fillStyle = "rgba(7, 4, 15, 0.85)";
    for (let ax = 20; ax < w; ax += 32) {
      const bob = Math.sin(timer * 0.05 + ax) * 3;
      ctx.beginPath();
      ctx.arc(ax, 385 + bob, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(ax - 13, 396 + bob, 26, 45);
    }

    // 3. Volumetric Moving Stage Spotlights
    this.spotlights.forEach((spot, idx) => {
      spot.angle += spot.speed;
      const originX = (idx + 1) * (w / 4);
      const targetX = originX + Math.sin(spot.angle) * 360;

      ctx.save();
      const coneGrad = ctx.createRadialGradient(originX, 10, 10, targetX, groundY, 260);
      coneGrad.addColorStop(0, spot.color);
      coneGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coneGrad;

      ctx.beginPath();
      ctx.moveTo(originX - 25, 0);
      ctx.lineTo(targetX - 95, groundY);
      ctx.lineTo(targetX + 95, groundY);
      ctx.lineTo(originX + 25, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // 4. Central Glowing Bigg Boss Golden Eye Emblem
    ctx.save();
    ctx.translate(w / 2, 230);

    // Volumetric Outer Pulse
    const pulse = Math.sin(timer * 0.04) * 6;
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 30 + pulse * 2;

    // Golden Eye Outline
    ctx.strokeStyle = "#ffcc00";
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(-160, 0);
    ctx.quadraticCurveTo(0, -95 - pulse, 160, 0);
    ctx.quadraticCurveTo(0, 95 + pulse, -160, 0);
    ctx.stroke();

    // Inner Neon Cyan Sclera
    ctx.fillStyle = "rgba(0, 229, 255, 0.22)";
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Red Camera Pupil with Blinking Tally
    const pupilX = Math.sin(timer * 0.03) * 12;
    ctx.fillStyle = "#ff2222";
    ctx.beginPath();
    ctx.arc(pupilX, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(pupilX + 5, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. High-Tech Glass Floor & Stage Reflections
    const floorGrad = ctx.createLinearGradient(0, groundY - 20, 0, 640);
    floorGrad.addColorStop(0, "#1f1032");
    floorGrad.addColorStop(0.15, "#10081d");
    floorGrad.addColorStop(1, "#050308");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, groundY - 20, w, 175);

    // Glowing Stage Platform Front Edge
    ctx.strokeStyle = "rgba(255, 204, 0, 0.75)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();

    // LED Runway Strips
    ctx.fillStyle = "rgba(0, 229, 255, 0.4)";
    ctx.fillRect(80, groundY, w - 160, 2);

    // 6. Draw Upside-Down Floor Reflections of Fighters
    if (p1 && cpu) {
      window.renderFighter(ctx, p1, true);
      window.renderFighter(ctx, cpu, true);
    }
  }

  // Directional Impact Sparks & Particles
  spawnSparks(x, y, color, count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 10;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        gravity: 0.38,
        color: color,
        size: 3 + Math.random() * 4,
        life: 20 + Math.random() * 14,
        maxLife: 34
      });
    }
  }

  // Dust Shockwave on Jump / Landing
  spawnDust(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: -0.8 - Math.random() * 1.5,
        gravity: -0.02,
        color: "rgba(180, 160, 210, 0.45)",
        size: 6 + Math.random() * 7,
        life: 18 + Math.random() * 8,
        maxLife: 26
      });
    }
  }

  // Streaming Vitality Soul Orbs (Vampiric Life-Transfer)
  spawnVitalityStream(fromX, fromY, toX, toY, amount) {
    const count = Math.min(10, Math.max(4, Math.floor(amount / 2)));
    for (let i = 0; i < count; i++) {
      this.vitalityOrbs.push({
        fromX: fromX,
        fromY: fromY,
        toX: toX,
        toY: toY,
        x: fromX,
        y: fromY,
        progress: 0,
        speed: 0.035 + Math.random() * 0.02,
        arcHeight: -60 - Math.random() * 50,
        color: i % 2 === 0 ? "#00ff88" : "#80ffea",
        size: 5 + Math.random() * 3
      });
    }
  }

  // Floating Combat Text Callouts
  spawnCallout(x, y, text, color) {
    this.callouts.push({
      x: x,
      y: y,
      text: text,
      color: color,
      life: 42,
      maxLife: 42,
      vy: -1.4
    });
  }

  // Update & Draw All Active Particles
  updateAndDrawParticles(ctx) {
    // 1. Standard Sparks & Dust
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life--;

      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // 2. Vitality Soul Orbs (Curving trajectory towards attacker)
    for (let j = this.vitalityOrbs.length - 1; j >= 0; j--) {
      const orb = this.vitalityOrbs[j];
      orb.progress += orb.speed;

      // Parabolic Arc
      const t = orb.progress;
      orb.x = orb.fromX + (orb.toX - orb.fromX) * t;
      orb.y = orb.fromY + (orb.toY - orb.fromY) * t + Math.sin(t * Math.PI) * orb.arcHeight;

      ctx.save();
      ctx.shadowColor = orb.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = orb.color;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
      ctx.fill();

      // Trailing glow tail
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.size * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (orb.progress >= 1) {
        this.vitalityOrbs.splice(j, 1);
      }
    }

    // 3. Floating Callout Text
    for (let k = this.callouts.length - 1; k >= 0; k--) {
      const c = this.callouts[k];
      c.y += c.vy;
      c.life--;

      const alpha = Math.min(1, c.life / (c.maxLife * 0.4));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = "900 22px 'Rajdhani', Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4.5;
      ctx.strokeText(c.text, c.x, c.y);
      ctx.fillStyle = c.color;
      ctx.fillText(c.text, c.x, c.y);
      ctx.restore();

      if (c.life <= 0) this.callouts.splice(k, 1);
    }
  }
}

window.ArenaEngine = ArenaEngine;
