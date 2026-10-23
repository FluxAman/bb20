/* ============================================================================
   BIGG BOSS FIGHT : FIGHTERS DATA, ACCURATE AI FACE FITTING & CANVAS RENDERER
   ============================================================================ */

const ROSTER_DATA = [
  {
    id: 0,
    name: "Baseer Ali",
    title: "Braid Hustler • BB S20",
    style: "Urban Kickboxing & Rapid OP Rush",
    voiceType: "OP",
    voicePitch: 1.05,
    voiceRate: 1.15,
    category: "OP Type",
    skin: "#cf8c5e",
    skinDark: "#9e5f38",
    stats: { pwr: 90, spd: 96, def: 84, rng: 86, spc: 92 },
    // Assets: AI Suit vs Classic Photo
    aiAssets: {
      head: "ai_braid_head",
      avatar: "ai_braid_avatar",
      bust: "ai_braid_bust"
    },
    classicAssets: {
      head: "braid_head",
      avatar: "braid_avatar",
      bust: "braid_bust"
    },
    // Tailored Face Fitting Parameters
    faceScale: 1.06,
    faceOffsetX: 1,
    faceOffsetY: 2,
    quote: '"OP BHAI OP! FULL POWER!"',
    outfit: "tactical_armor"
  },
  {
    id: 1,
    name: "Abhishek Malhan",
    title: "Zipper Boy • The Alpha",
    style: "Heavy Street Brawler & Electric God Fist",
    voiceType: "OP",
    voicePitch: 1.15,
    voiceRate: 1.18,
    category: "OP Type",
    skin: "#d9976c",
    skinDark: "#a9663d",
    stats: { pwr: 98, spd: 88, def: 90, rng: 84, spc: 95 },
    aiAssets: {
      head: "ai_zipper_head",
      avatar: "ai_zipper_avatar",
      bust: "ai_zipper_bust"
    },
    classicAssets: {
      head: "zipper_head",
      avatar: "zipper_avatar",
      bust: "zipper_bust"
    },
    faceScale: 1.05,
    faceOffsetX: 0,
    faceOffsetY: 1,
    quote: '"OP BOLTE! SYSTEM HANG OP!"',
    outfit: "orange_blue_zip"
  },
  {
    id: 2,
    name: "Qazi Bohemian",
    title: "Pink Robe • Mystic Rockstar",
    style: "Theatrical Capoeira & Sonic Mic Blasts",
    voiceType: "ROCKSTAR",
    voicePitch: 0.95,
    voiceRate: 1.05,
    category: "Rockstar Type",
    skin: "#dfa178",
    skinDark: "#b07149",
    stats: { pwr: 88, spd: 94, def: 82, rng: 96, spc: 94 },
    aiAssets: {
      head: "ai_boho_head",
      avatar: "ai_boho_avatar",
      bust: "ai_boho_bust"
    },
    classicAssets: {
      head: "boho_head",
      avatar: "boho_avatar",
      bust: "boho_bust"
    },
    faceScale: 1.08,
    faceOffsetX: 0,
    faceOffsetY: 2,
    quote: '"ROCKSTAR ENERGY! FEEL THE MUSIC!"',
    outfit: "pink_robe_beads"
  },
  {
    id: 3,
    name: "Qazi Emotional",
    title: "Gold Collar • Passionate Legend",
    style: "Counter-Striker & Heartbreak Symphony",
    voiceType: "ROCKSTAR",
    voicePitch: 0.88,
    voiceRate: 1.02,
    category: "Rockstar Type",
    skin: "#d8966b",
    skinDark: "#a76339",
    stats: { pwr: 96, spd: 84, def: 95, rng: 88, spc: 98 },
    aiAssets: {
      head: "ai_emotional_head",
      avatar: "ai_emotional_avatar",
      bust: "ai_emotional_bust"
    },
    classicAssets: {
      head: "emotional_head",
      avatar: "emotional_avatar",
      bust: "emotional_bust"
    },
    faceScale: 1.1,
    faceOffsetX: 0,
    faceOffsetY: 3,
    quote: '"DIL SE ROCKSTAR! NEVER GIVE UP!"',
    outfit: "white_gold_vest"
  }
];

// Load any custom user-edited names and settings from localStorage
try {
  ROSTER_DATA.forEach(c => {
    const savedName = localStorage.getItem("bb_char_name_" + c.id);
    if (savedName) c.name = savedName;
    const savedTitle = localStorage.getItem("bb_char_title_" + c.id);
    if (savedTitle) c.title = savedTitle;
    const savedScale = localStorage.getItem("bb_char_scale_" + c.id);
    if (savedScale) c.faceScale = parseFloat(savedScale);
    const savedOffsetY = localStorage.getItem("bb_char_offy_" + c.id);
    if (savedOffsetY) c.faceOffsetY = parseFloat(savedOffsetY);
  });
} catch (e) {}

// Global Active Suit Mode: "ai" or "classic"
window.activeSuitMode = localStorage.getItem("bb_suit_mode") || "ai";

// Preloaded Image Cache
const textureCache = {};
function getTexture(assetKey) {
  if (textureCache[assetKey]) return textureCache[assetKey];
  const img = new Image();
  if (window.GAME_ASSETS && window.GAME_ASSETS[assetKey]) {
    img.src = window.GAME_ASSETS[assetKey];
  } else {
    img.src = `./assets/images/${assetKey}.png`;
  }
  textureCache[assetKey] = img;
  return img;
}

// Helper to get active asset for character
function getCharAsset(char, type) {
  const isAI = window.activeSuitMode === "ai";
  const dict = isAI ? char.aiAssets : char.classicAssets;
  return dict[type] || char.aiAssets[type];
}

// 8 Distinct Combat Moves with Realistic Tekken Frame Data & Mechanics
const MOVE_DATA = {
  LP:    { startup: 4, active: 6,  recovery: 8,  dmg: 8,  heal: 6,  range: 95,  level: "high", knockback: 8,  launch: 0,   name: "Flash Jab" },
  RP:    { startup: 6, active: 9,  recovery: 12, dmg: 16, heal: 11, range: 105, level: "mid",  knockback: 18, launch: -9,  name: "Electric God Fist" },
  LK:    { startup: 7, active: 10, recovery: 12, dmg: 14, heal: 10, range: 118, level: "low",  knockback: 14, launch: -5,  name: "Spinning Low Kick" },
  RK:    { startup: 9, active: 11, recovery: 14, dmg: 18, heal: 12, range: 125, level: "high", knockback: 25, launch: -11, name: "Tornado Roundhouse" },
  FLY:   { startup: 8, active: 14, recovery: 15, dmg: 22, heal: 15, range: 145, level: "mid",  knockback: 32, launch: -10, name: "Flying Dragon Strike" },
  THROW: { startup: 5, active: 8,  recovery: 16, dmg: 24, heal: 18, range: 88,  level: "unblockable", knockback: 36, launch: -12, name: "Bigg Boss Slam" },
  SWORD: { startup: 5, active: 11, recovery: 13, dmg: 26, heal: 20, range: 148, level: "mid",  knockback: 32, launch: -10, name: "Blade Slash" },
  PARRY: { startup: 2, active: 14, recovery: 10, dmg: 0,  heal: 0,  range: 90,  level: "parry", knockback: 0, launch: 0, name: "Perfect Parry" },
  SP:    { startup: 10, active: 22, recovery: 22, dmg: 34, heal: 24, range: 150, level: "mid", knockback: 45, launch: -14, name: "10-Hit Rage Art" }
};

function drawRoundRect(ctx, x, y, w, h, r) {
  const radius = typeof r === "number" ? r : 6;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3), 16);
  let G = parseInt(color.substring(3,5), 16);
  let B = parseInt(color.substring(5,7), 16);
  R = Math.max(0, Math.min(255, Math.floor(R * (100 + percent) / 100)));
  G = Math.max(0, Math.min(255, Math.floor(G * (100 + percent) / 100)));
  B = Math.max(0, Math.min(255, Math.floor(B * (100 + percent) / 100)));
  const RR = (R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16));
  const GG = (G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16));
  const BB = (B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16));
  return "#" + RR + GG + BB;
}

/* ============================================================================
   REALISTIC FIGHTER MODEL CANVAS RENDERER WITH TAILORED AI SUIT COMPATIBILITY
   ============================================================================ */
function renderFighter(ctx, fighter, isReflection = false) {
  const char = fighter.data;
  const x = fighter.x;
  const y = fighter.y;
  const facing = fighter.facing;
  const state = fighter.state;
  const timer = fighter.animTimer;
  const isCrouching = state === "crouch" || state === "LK";
  const scale = 1.35;

  ctx.save();
  ctx.translate(x, y);

  if (isReflection) {
    ctx.scale(facing * scale, -scale * 0.45);
    ctx.globalAlpha = 0.22;
    ctx.filter = "blur(1.5px)";
  } else {
    ctx.scale(facing * scale, scale);
  }

  const breath = Math.sin(timer * 0.1) * 2.2;
  let crouchY = isCrouching ? 32 : 0;
  let torsoLean = 0;
  let headTilt = 0;

  let lShoulder = 0.35, lElbow = -0.85;
  let rShoulder = -0.25, rElbow = -1.05;
  let lHip = -0.18, lKnee = 0.25;
  let rHip = 0.22, rKnee = 0.2;

  if (state === "walk") {
    const w = Math.sin(timer * 0.36);
    lHip = w * 0.6; rHip = -w * 0.6;
    lKnee = Math.max(0, -w * 0.5); rKnee = Math.max(0, w * 0.5);
    lShoulder = -w * 0.4; rShoulder = w * 0.4;
  } else if (state === "crouch") {
    crouchY = 36; torsoLean = 0.2;
    lHip = -0.8; lKnee = 1.35; rHip = -0.6; rKnee = 1.25;
  } else if (state === "block") {
    torsoLean = -0.1;
    lShoulder = -0.9; lElbow = -1.35; rShoulder = -1.05; rElbow = -1.45;
  } else if (state === "LP") {
    torsoLean = 0.22; lShoulder = -1.55; lElbow = -0.05; rShoulder = 0.3; rElbow = -1.1;
  } else if (state === "RP") {
    torsoLean = 0.35; rShoulder = -2.15; rElbow = -0.2; lShoulder = 0.6; lElbow = -1.0;
  } else if (state === "LK") {
    crouchY = 26; torsoLean = -0.3; lHip = -1.75; lKnee = 0.05; rHip = 0.2; rKnee = 0.3;
  } else if (state === "RK") {
    torsoLean = 0.32; rHip = -1.8; rKnee = 0.08; lHip = -0.4; lKnee = 0.8;
  } else if (state === "FLY") {
    torsoLean = -0.38; rHip = -1.7; rKnee = 0.05; lHip = 0.5; lKnee = 0.9;
    lShoulder = -1.2; rShoulder = 0.5;
  } else if (state === "THROW") {
    torsoLean = 0.42; lShoulder = -1.45; lElbow = -0.18; rShoulder = -1.4; rElbow = -0.18;
  } else if (state === "SWORD") {
    // Dynamic Samurai / Tekken Blade Strike Pose
    torsoLean = 0.38;
    lShoulder = -0.9; lElbow = -0.35;
    rShoulder = -1.95; rElbow = -0.15;
    rHip = -1.15; rKnee = 0.2; lHip = 0.3; lKnee = 0.6;
  } else if (state === "SP") {
    const flurry = Math.sin(timer * 1.5);
    torsoLean = 0.32;
    lShoulder = -1.5 + flurry * 0.4; lElbow = -0.1;
    rShoulder = -1.5 - flurry * 0.4; rElbow = -0.1;
    rHip = -1.3 + flurry * 0.3; rKnee = 0.1;
  } else if (state === "hit") {
    torsoLean = -0.42; headTilt = -0.35;
    lShoulder = 0.6; lElbow = -0.3; rShoulder = -0.4; rElbow = -0.2;
  } else if (state === "ko") {
    ctx.translate(0, -14);
    ctx.rotate(-Math.PI / 2.05);
  }

  // Soft 3D Ground Drop Shadow
  if (!isReflection) {
    const shadowScale = Math.max(0.4, 1 - Math.abs(fighter.y - 485) / 300);
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 52 * shadowScale, 12 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dynamic Blade Cutting Arc Motion Trail
  if (state === "SWORD" && !isReflection) {
    ctx.save();
    ctx.strokeStyle = char.voiceType === "OP" ? "rgba(0, 229, 255, 0.55)" : "rgba(255, 0, 119, 0.55)";
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(25, -60, 80, -1.3, 0.9);
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(25, -60, 80, -1.2, 0.8);
    ctx.stroke();
    ctx.restore();
  }

  const hipY = -86 + crouchY + breath * 0.5;

  function drawAnatomicalLimb(x1, y1, angle1, len1, angle2, len2, w1, w2, color1, color2, isLeg, extraProp) {
    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(angle1);

    const upperGrad = ctx.createLinearGradient(-w1/2, 0, w1/2, 0);
    upperGrad.addColorStop(0, color1);
    upperGrad.addColorStop(0.35, shadeColor(color1, 20));
    upperGrad.addColorStop(1, shadeColor(color1, -25));
    ctx.fillStyle = upperGrad;
    drawRoundRect(ctx, -w1 / 2, 0, w1, len1, 8);

    ctx.translate(0, len1);
    ctx.rotate(angle2);

    const lowerGrad = ctx.createLinearGradient(-w2/2, 0, w2/2, 0);
    lowerGrad.addColorStop(0, color2);
    lowerGrad.addColorStop(0.4, shadeColor(color2, 18));
    lowerGrad.addColorStop(1, shadeColor(color2, -28));
    ctx.fillStyle = lowerGrad;
    drawRoundRect(ctx, -w2 / 2, 0, w2, len2, 7);

    ctx.translate(0, len2);

    if (isLeg) {
      ctx.fillStyle = extraProp || "#ff6600";
      drawRoundRect(ctx, -10, -4, 29, 14, 5);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-10, 7, 29, 3);
      ctx.fillStyle = "#111";
      ctx.fillRect(-2, -3, 8, 4);
    } else {
      ctx.fillStyle = "#16161a";
      ctx.fillRect(-w2 / 2, -6, w2, 6);
      ctx.fillStyle = char.skin;
      ctx.beginPath();
      ctx.arc(1, 6, 9.5, 0, Math.PI * 2);
      ctx.fill();

      // Blade in Hand when in SWORD state or sword extraProp
      if (state === "SWORD" || extraProp === "sword") {
        ctx.save();
        ctx.rotate(-0.82);

        // Golden Crossguard (Tsuba)
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(-7, -4, 14, 5);

        // Wrapped Handle (Tsuka)
        ctx.fillStyle = "#1a1824";
        ctx.fillRect(-3.5, 1, 7, 20);
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(-4, 19, 8, 3); // Pommel

        // Razor Sharp Chrome Steel Blade
        const bladeGrad = ctx.createLinearGradient(-3, -85, 4, -4);
        bladeGrad.addColorStop(0, "#ffffff");
        bladeGrad.addColorStop(0.35, "#e8effc");
        bladeGrad.addColorStop(1, "#8ea6c4");
        ctx.fillStyle = bladeGrad;

        ctx.beginPath();
        ctx.moveTo(-3, -4);
        ctx.lineTo(-3.5, -85);
        ctx.quadraticCurveTo(0, -94, 4.5, -88); // Curved Katana Tip (Kissaki)
        ctx.lineTo(3, -4);
        ctx.closePath();
        ctx.fill();

        // Gleaming Edge Highlight
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(3, -4);
        ctx.lineTo(4, -88);
        ctx.stroke();

        // Dynamic Radiant Energy Aura (Cyan for OP, Magenta for Rockstar)
        if (!isReflection) {
          ctx.strokeStyle = char.voiceType === "OP" ? "rgba(0, 229, 255, 0.85)" : "rgba(255, 0, 119, 0.85)";
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(-3, -4);
          ctx.lineTo(-3.5, -85);
          ctx.quadraticCurveTo(0, -94, 4.5, -88);
          ctx.lineTo(3, -4);
          ctx.stroke();
        }
        ctx.restore();
      }

      if ((state === "RP" || state === "SP") && !isReflection) {
        ctx.strokeStyle = char.voiceType === "OP" ? "#00ffff" : "#ff0077";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(1, 6, 14, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (char.outfit === "pink_robe_beads" && extraProp === "mic" && state !== "SWORD") {
        ctx.save();
        ctx.rotate(0.35);
        ctx.fillStyle = "#1f1f24";
        ctx.fillRect(-3, -20, 6, 26);
        ctx.fillStyle = "#555";
        ctx.beginPath();
        ctx.arc(0, -23, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(-2, -18, 4, 3);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // Outfit Palettes (AI Combat Suit vs Classic)
  let pantsColor = "#142852", sleeveColor = "#ff6a00", armColor = "#163675", shoeColor = "#ff6a00";
  if (char.outfit === "tactical_armor" || char.outfit === "white_tee_strap") {
    pantsColor = "#1a1e26";
    sleeveColor = window.activeSuitMode === "ai" ? "#22242c" : "#ffffff";
    armColor = window.activeSuitMode === "ai" ? "#1a1c22" : char.skin;
    shoeColor = "#222";
  } else if (char.outfit === "white_gold_vest") {
    pantsColor = "#121216";
    sleeveColor = "#ffffff";
    armColor = "#f4f0e6";
    shoeColor = "#c9a43b";
  } else if (char.outfit === "pink_robe_beads") {
    pantsColor = "#261a30";
    sleeveColor = "#d63b70";
    armColor = char.skin;
    shoeColor = "#2b1c24";
  }

  // 1. BACK LEG
  drawAnatomicalLimb(-10, hipY, lHip, 42, lKnee, 40, 20, 16, pantsColor, pantsColor, true, shoeColor);

  ctx.save();
  ctx.translate(0, hipY);
  ctx.rotate(torsoLean);

  // 2. BACK ARM
  drawAnatomicalLimb(-14, -62, lShoulder, 34, lElbow, 32, 16, 14, sleeveColor, armColor, false, "");

  // 3. V-TAPER TORSO & SUIT
  const torsoTop = -72, torsoH = 72;

  function drawVTorso(fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(-24, torsoTop + 6);
    ctx.quadraticCurveTo(-24, torsoTop, -16, torsoTop);
    ctx.lineTo(16, torsoTop);
    ctx.quadraticCurveTo(24, torsoTop, 24, torsoTop + 6);
    ctx.lineTo(19, torsoTop + torsoH);
    ctx.lineTo(-19, torsoTop + torsoH);
    ctx.closePath();
    ctx.fill();
  }

  if (char.outfit === "tactical_armor" || char.outfit === "white_tee_strap") {
    if (window.activeSuitMode === "ai") {
      // High-Tech Tactical Combat Suit
      drawVTorso("#1a1c24");
      ctx.fillStyle = "#2a2d38";
      ctx.fillRect(-18, torsoTop + 14, 36, 38);
      // Tactical Cross Straps & Buckle
      ctx.strokeStyle = "#ffcc00";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-20, torsoTop + 24); ctx.lineTo(20, torsoTop + 24);
      ctx.stroke();
      ctx.fillStyle = "#111";
      ctx.fillRect(-6, torsoTop + 20, 12, 8);
    } else {
      // Classic White Tee & Black Strap
      drawVTorso("#f6f8fb");
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-15, torsoTop + 26); ctx.quadraticCurveTo(-7, torsoTop + 30, 0, torsoTop + 24);
      ctx.moveTo(15, torsoTop + 26);  ctx.quadraticCurveTo(7, torsoTop + 30, 0, torsoTop + 24);
      ctx.stroke();
      ctx.strokeStyle = "#151518";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(18, torsoTop + 2); ctx.lineTo(-18, torsoTop + torsoH - 2);
      ctx.stroke();
    }
  } else if (char.outfit === "orange_blue_zip") {
    drawVTorso("#153678");
    ctx.fillStyle = "#ff6a00";
    ctx.beginPath();
    ctx.moveTo(-24, torsoTop + 6);
    ctx.lineTo(24, torsoTop + 6);
    ctx.lineTo(21, torsoTop + 34);
    ctx.lineTo(-21, torsoTop + 34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-22, torsoTop + 32, 44, 4);
    ctx.fillRect(-4, torsoTop + 2, 8, torsoH - 2);
    ctx.fillStyle = "#111";
    ctx.fillRect(-1.5, torsoTop + 2, 3, torsoH - 2);

    ctx.strokeStyle = "#e8e8e8";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-18, torsoTop + 16); ctx.lineTo(-6, torsoTop + 22);
    ctx.moveTo(6, torsoTop + 22);   ctx.lineTo(18, torsoTop + 16);
    ctx.stroke();
  } else if (char.outfit === "pink_robe_beads") {
    drawVTorso("#f9f9f9");
    ctx.fillStyle = char.skin;
    ctx.beginPath();
    ctx.moveTo(-11, torsoTop); ctx.lineTo(11, torsoTop); ctx.lineTo(0, torsoTop + 32);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#d63b70";
    ctx.fillRect(-23, torsoTop + 2, 13, torsoH + 8);
    ctx.fillRect(10, torsoTop + 2, 13, torsoH + 8);

    ctx.strokeStyle = "#4a3225";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, torsoTop + 6, 14, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (char.outfit === "white_gold_vest") {
    drawVTorso("#ffffff");
    ctx.fillStyle = "#d4af37";
    ctx.fillRect(-23, torsoTop + 2, 12, torsoH - 2);
    ctx.fillRect(11, torsoTop + 2, 12, torsoH - 2);
    ctx.strokeStyle = "#15151a";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-18, torsoTop + 2); ctx.lineTo(5, torsoTop + torsoH);
    ctx.stroke();
  }

  // Champion Belt
  ctx.fillStyle = "#111";
  ctx.fillRect(-19, torsoTop + torsoH - 5, 38, 6);

  // Sheathed Katana on Fighter's Back (Visible when not actively attacking with Sword)
  if (state !== "SWORD" && !isReflection) {
    ctx.save();
    ctx.translate(4, torsoTop + 24);
    ctx.rotate(0.55);
    ctx.fillStyle = "#14141e";
    drawRoundRect(ctx, -3, -64, 6, 90, 3);
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(-4.5, -66, 9, 4);
    ctx.fillRect(-4, 24, 8, 4);
    ctx.fillStyle = "#1a1828";
    ctx.fillRect(-2.5, -84, 5, 18);
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(-3, -85, 6, 2.5);
    ctx.restore();
  }

  // 4. ACCURATELY FITTED PHOTOGRAPHIC / AI HEAD ATTACHMENT
  ctx.save();
  ctx.translate(0, torsoTop - 8);
  ctx.rotate(headTilt);

  // Muscular Neck
  ctx.fillStyle = char.skinDark;
  ctx.fillRect(-9, -8, 18, 14);

  // Render Head with User Adjustments (faceScale, faceOffsetX, faceOffsetY)
  const headAssetKey = getCharAsset(char, "head");
  const headImg = getTexture(headAssetKey);
  if (headImg && headImg.complete && headImg.naturalWidth > 0) {
    ctx.save();
    const baseW = 44 * (char.faceScale || 1.0);
    const baseH = 46 * (char.faceScale || 1.0);
    const offX = char.faceOffsetX || 0;
    const offY = (char.faceOffsetY || 0) + 4;
    ctx.drawImage(headImg, -baseW / 2 + offX, -baseH + offY, baseW, baseH);
    ctx.restore();
  } else {
    ctx.fillStyle = char.skin;
    ctx.beginPath();
    ctx.ellipse(0, -22, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // End Head

  // 5. FRONT ARM (Wields Sword if state is SWORD)
  drawAnatomicalLimb(13, -60, rShoulder, 34, rElbow, 32, 17, 14, sleeveColor, armColor, false, state === "SWORD" ? "sword" : (char.outfit === "pink_robe_beads" ? "mic" : ""));
  ctx.restore(); // End Torso

  // 6. FRONT LEG
  drawAnatomicalLimb(10, hipY, rHip, 42, rKnee, 40, 20, 16, pantsColor, pantsColor, true, shoeColor);
  ctx.restore();
}

/* ============================================================================
   FIGHTER INSTANCE & COMBAT PHYSICS CLASS
   ============================================================================ */
class Fighter {
  constructor(charData, startX, isCPU = false) {
    this.data = charData;
    this.x = startX;
    this.y = 485;
    this.vx = 0;
    this.vy = 0;
    this.facing = isCPU ? -1 : 1;
    this.isCPU = isCPU;
    this.maxHealth = 160;
    this.health = 160;
    this.ghostHealth = 160;
    this.roundsWon = 0;
    this.totalLifeStolen = 0;
    this.state = "idle";
    this.stateTimer = 0;
    this.animTimer = 0;
    this.hitRegistered = false;
    this.hitstopFrames = 0;
    this.comboHits = 0;
    this.comboTimer = 0;
    this.aiCooldown = 0;
  }

  resetForRound(startX, facing) {
    this.x = startX;
    this.y = 485;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;
    this.health = this.maxHealth;
    this.ghostHealth = this.maxHealth;
    this.state = "idle";
    this.stateTimer = 0;
    this.hitstopFrames = 0;
    this.comboHits = 0;
  }

  startAttack(type) {
    if (this.state === "hit" || this.state === "ko" || window.matchEnded) return;

    const canCancel = (this.state === "LP" && (type === "RP" || type === "LK" || type === "SWORD")) ||
                      (this.state === "RP" && (type === "RK" || type === "FLY" || type === "SWORD")) ||
                      (this.state === "LK" && (type === "FLY" || type === "SWORD"));
    if (MOVE_DATA[this.state] && !canCancel) return;

    this.state = type;
    this.stateTimer = 0;
    this.hitRegistered = false;

    if (type === "SWORD") {
      this.vx = this.facing * 9;
      window.soundEngine.playSwordDraw();
      setTimeout(() => window.soundEngine.playSwordSwing(), 50);
    } else if (type === "FLY") {
      this.vx = this.facing * 12;
      if (this.y >= 485) this.vy = -9;
      window.soundEngine.playWhoosh();
    } else if (type === "LK" || type === "RK") {
      this.vx = this.facing * 7;
      if (this.y >= 485 && type === "LK") this.vy = -6;
      window.soundEngine.playWhoosh();
    } else if (type === "RP") {
      this.vx = this.facing * 5.5;
      window.soundEngine.playElectricZap();
    } else {
      this.vx = this.facing * 4;
    }

    window.soundEngine.triggerCharacterVoice(this.data, "attack");
    window.gameEngine.spawnCallout(
      this.x, this.y - 150,
      this.data.voiceType + "!",
      this.data.voiceType === "OP" ? "#00e5ff" : "#ff0077"
    );
  }

  update(opponent) {
    if (this.hitstopFrames > 0) {
      this.hitstopFrames--;
      return;
    }

    this.animTimer++;
    this.stateTimer++;

    if (this.ghostHealth > this.health) {
      this.ghostHealth -= 0.65;
      if (this.ghostHealth < this.health) this.ghostHealth = this.health;
    }

    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer === 0) this.comboHits = 0;
    }

    if (!MOVE_DATA[this.state] && this.state !== "ko") {
      this.facing = opponent.x >= this.x ? 1 : -1;
    }

    if (this.y < 485 || this.vy < 0) {
      this.y += this.vy;
      this.vy += 0.75;
      if (this.y >= 485) {
        this.y = 485;
        this.vy = 0;
        window.gameEngine.spawnDust(this.x, 485);
      }
    }

    this.x += this.vx;
    this.vx *= 0.82;

    if (this.x < 70) {
      this.x = 70;
      if (Math.abs(this.vx) > 8) window.gameEngine.spawnSparks(70, this.y - 80, "#ffcc00", 12);
    }
    if (this.x > 1010) {
      this.x = 1010;
      if (Math.abs(this.vx) > 8) window.gameEngine.spawnSparks(1010, this.y - 80, "#ffcc00", 12);
    }

    const dist = Math.abs(this.x - opponent.x);
    if (dist < 60 && Math.abs(this.y - opponent.y) < 65) {
      const push = (60 - dist) * 0.5;
      if (this.x < opponent.x) { this.x -= push; opponent.x += push; }
      else { this.x += push; opponent.x -= push; }
    }

    if (this.state === "ko") return;

    if (MOVE_DATA[this.state]) {
      const move = MOVE_DATA[this.state];
      const total = move.startup + move.active + move.recovery;
      if (this.stateTimer >= move.startup && this.stateTimer <= move.startup + move.active && !this.hitRegistered) {
        this.checkHit(opponent, move);
      }
      if (this.stateTimer >= total) {
        this.state = "idle";
        this.stateTimer = 0;
      }
      return;
    }

    if (this.state === "hit") {
      if (this.stateTimer > 16 && this.y >= 485) {
        this.state = "idle";
        this.stateTimer = 0;
      }
      return;
    }

    if (!this.isCPU) {
      const input = window.inputState;
      if (input.stepLeftFrames > 0) input.stepLeftFrames--;
      if (input.stepRightFrames > 0) input.stepRightFrames--;

      const movingLeft = input.left || input.stepLeftFrames > 0;
      const movingRight = input.right || input.stepRightFrames > 0;

      if (input.block) {
        this.state = "block";
      } else if (input.down && this.y >= 485) {
        this.state = "crouch";
      } else {
        if (input.up && this.y >= 485) {
          this.vy = -14;
          window.gameEngine.spawnDust(this.x, 485);
        }
        if (movingLeft) {
          this.vx = -6.5;
          this.state = "walk";
        } else if (movingRight) {
          this.vx = 6.5;
          this.state = "walk";
        } else {
          this.state = "idle";
        }
      }
    } else {
      this.updateCPU(opponent);
    }
  }

  updateCPU(player) {
    this.aiCooldown--;
    const dx = player.x - this.x;
    const absDx = Math.abs(dx);

    if (MOVE_DATA[player.state] && absDx < 130 && Math.random() < 0.12) {
      this.state = MOVE_DATA[player.state].level === "high" ? "crouch" : "block";
      this.aiCooldown = 18;
      return;
    }

    if (this.aiCooldown > 0) {
      if (this.state === "walk") this.vx = Math.sign(dx) * 4.2;
      return;
    }

    if (absDx > 140) {
      if (Math.random() < 0.22) {
        this.startAttack("FLY");
        this.aiCooldown = 32;
      } else {
        this.state = "walk";
        this.vx = Math.sign(dx) * 4.6;
        this.aiCooldown = 14;
      }
    } else {
      const r = Math.random();
      if (r < 0.20) this.startAttack("LP");
      else if (r < 0.38) this.startAttack("RP");
      else if (r < 0.52) this.startAttack("LK");
      else if (r < 0.66) this.startAttack("RK");
      else if (r < 0.80) this.startAttack("SWORD");
      else if (r < 0.90) this.startAttack("THROW");
      else this.startAttack("SP");
      this.aiCooldown = 26;
    }
  }

  checkHit(target, move) {
    if (target.state === "ko" || window.matchEnded) return;

    const reachX = this.x + this.facing * (move.range * 0.64);
    if (Math.abs(reachX - target.x) <= move.range * 0.65 && Math.abs(this.y - target.y) < 95) {
      if (move.level === "high" && target.state === "crouch") {
        window.gameEngine.spawnCallout(target.x, target.y - 120, "DUCKED!", "#ffcc00");
        this.hitRegistered = true;
        return;
      }

      this.hitRegistered = true;
      const isBlocked = target.state === "block" && move.level !== "low" && move.level !== "unblockable";

      if (isBlocked) {
        target.health = Math.max(1, target.health - Math.ceil(move.dmg * 0.2));
        target.vx = this.facing * (move.knockback * 0.45);
        this.hitstopFrames = 3;
        window.soundEngine.playImpact(false, true);
        window.gameEngine.spawnSparks((this.x + target.x) / 2, target.y - 80, "#00e5ff", 12);
        window.gameEngine.spawnCallout(target.x, target.y - 130, "BLOCKED", "#00e5ff");
      } else {
        const juggleBonus = target.y < 480 ? 1.25 : 1.0;
        const finalDmg = Math.round(move.dmg * juggleBonus);

        target.health = Math.max(0, target.health - finalDmg);
        target.state = "hit";
        target.stateTimer = 0;
        target.vx = this.facing * move.knockback;
        if (move.launch < 0) target.vy = move.launch;

        const healAmt = move.heal || Math.round(finalDmg * 0.75);
        this.health = Math.min(this.maxHealth, this.health + healAmt);
        this.totalLifeStolen += healAmt;

        this.hitstopFrames = move.dmg >= 16 ? 6 : 4;
        target.hitstopFrames = this.hitstopFrames;
        window.gameEngine.screenShake = move.dmg >= 16 ? 12 : 7;

        this.comboHits++;
        this.comboTimer = 75;
        if (this.comboHits >= 2) {
          window.gameEngine.spawnCallout(
            this.x, this.y - 180,
            `${this.comboHits} HITS! ${this.data.voiceType}!`,
            "#ffcc00"
          );
        }

        if (move.name === "Blade Slash") {
          window.soundEngine.playSwordSlice();
          window.gameEngine.spawnCallout(this.x, this.y - 190, "CRITICAL BLADE SLASH!", "#ffd700");
        } else {
          window.soundEngine.playImpact(move.dmg >= 16, false);
        }
        window.soundEngine.playLifeHeal();
        setTimeout(() => window.soundEngine.triggerCharacterVoice(target.data, "hit"), 80);

        window.gameEngine.spawnVitalityStream(target.x, target.y - 80, this.x, this.y - 80, healAmt);

        const sparkColor = this.data.voiceType === "OP" ? "#00ffff" : "#ff0077";
        window.gameEngine.spawnSparks((this.x + target.x) / 2, target.y - 82, sparkColor, 24);

        window.gameEngine.spawnCallout(target.x, target.y - 130, `-${finalDmg} HP`, "#ff3333");
        window.gameEngine.spawnCallout(this.x, this.y - 150, `+${healAmt} LIFE UP!`, "#00ff88");

        if (target.health <= 0) {
          target.state = "ko";
          window.gameEngine.handleRoundKO(this, target);
        }
      }
    }
  }
}

window.ROSTER_DATA = ROSTER_DATA;
window.Fighter = Fighter;
window.renderFighter = renderFighter;
window.getCharAsset = getCharAsset;
