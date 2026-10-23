/* ============================================================================
   BIGG BOSS FIGHT : MAIN GAME ENGINE, AI STUDIO, CAMERA, INPUTS & UI CONTROLLER
   ============================================================================ */

class GameEngine {
  constructor() {
    this.canvas = document.getElementById("fight-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.arena = new window.ArenaEngine();

    this.gameActive = false;
    this.matchEnded = false;
    this.p1Choice = 0;
    this.cpuChoice = 2;
    this.pickTarget = "P1";

    this.p1 = null;
    this.cpu = null;

    this.roundNum = 1;
    this.roundTimer = 60;
    this.lastSecondTick = 0;

    this.bannerText = "";
    this.bannerTimer = 0;
    this.slowMoFrames = 0;
    this.frameCounter = 0;
    this.screenShake = 0;

    this.camX = 540;
    this.camY = 320;
    this.camZoom = 1.0;

    this.controlMode = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) ? "phone" : "pc";
    this.swappedSides = false;
    this.listeningForKey = null;
    this.uploadingForId = null;
    this.studioEditingCharId = 0;

    this.inputState = {
      left: false,
      right: false,
      up: false,
      down: false,
      block: false,
      stepLeftFrames: 0,
      stepRightFrames: 0
    };
    window.inputState = this.inputState;

    this.keyBindings = {
      left: "KeyA",
      right: "KeyD",
      up: "KeyW",
      down: "KeyS",
      block: "Space",
      LP: "KeyU",
      RP: "KeyI",
      LK: "KeyJ",
      RK: "KeyK",
      FLY: "KeyH",
      THROW: "KeyT",
      SWORD: "KeyE",
      SP: "KeyO"
    };

    this.init();
  }

  init() {
    this.buildRosterUI();
    this.bindInputs();
    this.setControlMode(this.controlMode);
    this.updateKeybindLabels();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  spawnSparks(x, y, color, count) { this.arena.spawnSparks(x, y, color, count); }
  spawnDust(x, y) { this.arena.spawnDust(x, y); }
  spawnVitalityStream(fromX, fromY, toX, toY, amt) { this.arena.spawnVitalityStream(fromX, fromY, toX, toY, amt); }
  spawnCallout(x, y, text, color) { this.arena.spawnCallout(x, y, text, color); }

  // Toggle Between AI Tekken Suit Mode and Classic Photo Mode
  toggleSuitMode(mode) {
    window.activeSuitMode = mode;
    try { localStorage.setItem("bb_suit_mode", mode); } catch (e) {}
    document.getElementById("btn-suit-ai")?.classList.toggle("ai-active", mode === "ai");
    document.getElementById("btn-suit-classic")?.classList.toggle("active", mode === "classic");
    this.buildRosterUI();
  }

  // Build Character Select Screen Roster Cards
  buildRosterUI() {
    const grid = document.getElementById("roster-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const isAI = window.activeSuitMode === "ai";
    document.getElementById("btn-suit-ai")?.classList.toggle("ai-active", isAI);
    document.getElementById("btn-suit-classic")?.classList.toggle("active", !isAI);

    window.ROSTER_DATA.forEach((char, idx) => {
      const card = document.createElement("div");
      card.className = "roster-card";
      if (idx === this.p1Choice) card.classList.add("active-p1");
      if (idx === this.cpuChoice) card.classList.add("active-cpu");

      const isOp = char.voiceType === "OP";
      const badge = document.createElement("div");
      badge.className = `card-badge ${isOp ? "type-op" : "type-rockstar"}`;
      badge.textContent = isOp ? "⚡ OP TYPE" : "🎸 ROCKSTAR TYPE";
      card.appendChild(badge);

      const wrap = document.createElement("div");
      wrap.className = "card-portrait-wrap";
      const img = document.createElement("img");
      const bustKey = window.getCharAsset(char, "bust");
      img.src = window.GAME_ASSETS && window.GAME_ASSETS[bustKey] ? window.GAME_ASSETS[bustKey] : `./assets/images/${bustKey}.png`;
      img.alt = char.name;
      wrap.appendChild(img);
      card.appendChild(wrap);

      const info = document.createElement("div");
      info.className = "card-info";
      info.innerHTML = `
        <h3>${char.name}</h3>
        <p>${char.title}</p>
        <span class="type-pill ${isOp ? "type-op" : "type-rockstar"}">🔊 ${char.quote}</span>
      `;
      card.appendChild(info);

      // Action Button Row: AI Face Studio & Upload Photo
      const btnRow = document.createElement("div");
      btnRow.className = "card-btn-row";

      const studioBtn = document.createElement("button");
      studioBtn.className = "card-action-btn";
      studioBtn.innerHTML = "✨ AI Face & Suit Fit";
      studioBtn.onclick = (e) => {
        e.stopPropagation();
        this.openAIStudio(char.id);
      };
      btnRow.appendChild(studioBtn);

      const uploadBtn = document.createElement("button");
      uploadBtn.className = "card-action-btn";
      uploadBtn.innerHTML = "📸 Upload Face";
      uploadBtn.onclick = (e) => {
        e.stopPropagation();
        this.triggerFaceUpload(char.id);
      };
      btnRow.appendChild(uploadBtn);

      card.appendChild(btnRow);

      card.onclick = (e) => {
        if (e.shiftKey || this.pickTarget === "CPU") {
          this.cpuChoice = idx;
          window.soundEngine.triggerCharacterVoice(window.ROSTER_DATA[this.cpuChoice], "attack");
        } else {
          this.p1Choice = idx;
          window.soundEngine.triggerCharacterVoice(window.ROSTER_DATA[this.p1Choice], "attack");
        }
        this.updateSelectUI();
      };

      grid.appendChild(card);
    });

    this.updateSelectUI();
  }

  updateSelectUI() {
    const p1Char = window.ROSTER_DATA[this.p1Choice];
    const cpuChar = window.ROSTER_DATA[this.cpuChoice];

    // Update Editable Inputs
    const p1NameIn = document.getElementById("p1-name-input");
    const p1SubIn = document.getElementById("p1-sub-input");
    if (p1NameIn && document.activeElement !== p1NameIn) p1NameIn.value = p1Char.name;
    if (p1SubIn && document.activeElement !== p1SubIn) p1SubIn.value = p1Char.title;

    const cpuNameIn = document.getElementById("cpu-name-input");
    const cpuSubIn = document.getElementById("cpu-sub-input");
    if (cpuNameIn && document.activeElement !== cpuNameIn) cpuNameIn.value = cpuChar.name;
    if (cpuSubIn && document.activeElement !== cpuSubIn) cpuSubIn.value = cpuChar.title;

    // Badges & Avatars
    const p1AvKey = window.getCharAsset(p1Char, "avatar");
    document.getElementById("p1-voice-badge").textContent = `Voice: "${p1Char.voiceType}!"`;
    document.getElementById("p1-avatar-img").src = window.GAME_ASSETS && window.GAME_ASSETS[p1AvKey] ? window.GAME_ASSETS[p1AvKey] : `./assets/images/${p1AvKey}.png`;

    const cpuAvKey = window.getCharAsset(cpuChar, "avatar");
    document.getElementById("cpu-voice-badge").textContent = `Voice: "${cpuChar.voiceType}!"`;
    document.getElementById("cpu-avatar-img").src = window.GAME_ASSETS && window.GAME_ASSETS[cpuAvKey] ? window.GAME_ASSETS[cpuAvKey] : `./assets/images/${cpuAvKey}.png`;

    const cards = document.querySelectorAll(".roster-card");
    cards.forEach((c, i) => {
      c.classList.toggle("active-p1", i === this.p1Choice);
      c.classList.toggle("active-cpu", i === this.cpuChoice);
    });
  }

  // Handle User Editing Name directly from input
  onEditPlayerName(target, field, value) {
    const char = target === "P1" ? window.ROSTER_DATA[this.p1Choice] : window.ROSTER_DATA[this.cpuChoice];
    if (field === "name") {
      char.name = value || (target === "P1" ? "Player 1" : "CPU");
      try { localStorage.setItem("bb_char_name_" + char.id, char.name); } catch (e) {}
    } else {
      char.title = value || "";
      try { localStorage.setItem("bb_char_title_" + char.id, char.title); } catch (e) {}
    }
    // Update card title
    const cards = document.querySelectorAll(".roster-card");
    const targetIdx = target === "P1" ? this.p1Choice : this.cpuChoice;
    if (cards[targetIdx]) {
      const h3 = cards[targetIdx].querySelector(".card-info h3");
      const p = cards[targetIdx].querySelector(".card-info p");
      if (h3) h3.textContent = char.name;
      if (p) p.textContent = char.title;
    }
  }

  // AI Face & Suit Fitting Lab
  openAIStudio(charId) {
    this.studioEditingCharId = charId;
    const char = window.ROSTER_DATA[charId];

    document.getElementById("studio-char-name").textContent = char.name;
    document.getElementById("studio-name-input").value = char.name;
    document.getElementById("studio-title-input").value = char.title;

    const scaleSlider = document.getElementById("studio-scale-slider");
    const offYSlider = document.getElementById("studio-offy-slider");
    const scaleVal = document.getElementById("studio-scale-val");
    const offYVal = document.getElementById("studio-offy-val");

    if (scaleSlider) scaleSlider.value = char.faceScale || 1.0;
    if (offYSlider) offYSlider.value = char.faceOffsetY || 0;
    if (scaleVal) scaleVal.textContent = Math.round((char.faceScale || 1.0) * 100) + "%";
    if (offYVal) offYVal.textContent = (char.faceOffsetY || 0) + "px";

    this.updateStudioPreview();
    document.getElementById("ai-studio-modal").style.display = "flex";
  }

  closeAIStudio() {
    document.getElementById("ai-studio-modal").style.display = "none";
  }

  updateStudioPreview() {
    const char = window.ROSTER_DATA[this.studioEditingCharId];
    const previewImg = document.getElementById("studio-preview-img");
    const bustKey = window.getCharAsset(char, "bust");
    previewImg.src = window.GAME_ASSETS && window.GAME_ASSETS[bustKey] ? window.GAME_ASSETS[bustKey] : `./assets/images/${bustKey}.png`;
  }

  applyStudioSettings() {
    const char = window.ROSTER_DATA[this.studioEditingCharId];
    const nameIn = document.getElementById("studio-name-input").value;
    const titleIn = document.getElementById("studio-title-input").value;
    const scaleIn = parseFloat(document.getElementById("studio-scale-slider").value);
    const offYIn = parseFloat(document.getElementById("studio-offy-slider").value);

    char.name = nameIn || char.name;
    char.title = titleIn || char.title;
    char.faceScale = scaleIn;
    char.faceOffsetY = offYIn;

    try {
      localStorage.setItem("bb_char_name_" + char.id, char.name);
      localStorage.setItem("bb_char_title_" + char.id, char.title);
      localStorage.setItem("bb_char_scale_" + char.id, char.faceScale);
      localStorage.setItem("bb_char_offy_" + char.id, char.faceOffsetY);
    } catch (e) {}

    this.buildRosterUI();
    this.closeAIStudio();
    window.soundEngine.playLifeHeal();
  }

  togglePickTarget() {
    this.pickTarget = this.pickTarget === "P1" ? "CPU" : "P1";
    const el = document.getElementById("pick-mode-text");
    el.textContent = this.pickTarget === "P1" ? "PLAYER 1" : "CPU OPPONENT";
    el.style.color = this.pickTarget === "P1" ? "#00e5ff" : "#ff3333";
  }

  testSelectedVoices() {
    window.soundEngine.triggerCharacterVoice(window.ROSTER_DATA[this.p1Choice], "attack");
    setTimeout(() => {
      window.soundEngine.triggerCharacterVoice(window.ROSTER_DATA[this.cpuChoice], "attack");
    }, 600);
  }

  triggerFaceUpload(charId) {
    this.uploadingForId = charId;
    const input = document.getElementById("real-face-input");
    input.value = "";
    input.click();
  }

  setControlMode(mode) {
    this.controlMode = mode;
    document.getElementById("select-phone-mode-btn")?.classList.toggle("active", mode === "phone");
    document.getElementById("select-pc-mode-btn")?.classList.toggle("active", mode === "pc");
    document.getElementById("modal-phone-btn")?.classList.toggle("active", mode === "phone");
    document.getElementById("modal-pc-btn")?.classList.toggle("active", mode === "pc");
    document.getElementById("hud-phone-btn")?.classList.toggle("active", mode === "phone");
    document.getElementById("hud-pc-btn")?.classList.toggle("active", mode === "pc");

    if (this.gameActive && !this.matchEnded) {
      document.getElementById("phone-controls-hud").style.display = mode === "phone" ? "block" : "none";
      document.getElementById("pc-controls-hud").style.display = mode === "pc" ? "flex" : "none";
    }
  }

  openCustomizer() { document.getElementById("customizer-modal").style.display = "flex"; }
  closeCustomizer() {
    this.listeningForKey = null;
    document.getElementById("customizer-modal").style.display = "none";
  }

  toggleSwapSides() {
    this.swappedSides = !this.swappedSides;
    document.getElementById("phone-controls-hud").classList.toggle("swapped", this.swappedSides);
    document.getElementById("swap-sides-btn").textContent = this.swappedSides
      ? "Swapped (Attacks Left / D-Pad Right)"
      : "Standard (D-Pad Left / Attacks Right)";
  }

  toggleFullScreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  updateKeybindLabels() {
    const acts = ["left", "right", "up", "down", "block", "LP", "RP", "LK", "RK", "FLY", "THROW", "SWORD", "SP"];
    acts.forEach(act => {
      const lbl = document.getElementById("lbl-" + act);
      if (lbl) lbl.textContent = `[${this.keyBindings[act].replace("Key", "").replace("Arrow", "")}]`;
    });

    const grid = document.getElementById("keybind-grid");
    if (!grid) return;
    grid.innerHTML = "";
    const names = {
      left: "Move Left", right: "Move Right", up: "Jump", down: "Crouch",
      block: "Guard / Block", LP: "Flash Jab (LP)", RP: "Electric God Fist (RP)",
      LK: "Low Sweep (LK)", RK: "Tornado Kick (RK)", FLY: "Flying Kick",
      THROW: "Throw / Slam", SWORD: "Blade Slash (Katana) [E]", SP: "10-Hit Rage Art"
    };

    Object.keys(names).forEach(act => {
      const item = document.createElement("div");
      item.className = "keybind-item";
      item.innerHTML = `<span>${names[act]}</span>`;

      const btn = document.createElement("button");
      btn.className = "keybind-btn" + (this.listeningForKey === act ? " listening" : "");
      btn.textContent = this.listeningForKey === act ? "Press Key..." : this.keyBindings[act].replace("Key", "");
      btn.onclick = () => {
        this.listeningForKey = act;
        this.updateKeybindLabels();
      };
      item.appendChild(btn);
      grid.appendChild(item);
    });
  }

  handleFaceFile(file) {
    if (!file || this.uploadingForId === null) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const off = document.createElement("canvas");
        off.width = 160;
        off.height = 160;
        const octx = off.getContext("2d");
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = Math.max(0, (img.height - minSide) * 0.2);
        octx.drawImage(img, sx, sy, minSide, minSide, 0, 0, 160, 160);
        const dataUrl = off.toDataURL("image/png");

        const targetChar = window.ROSTER_DATA[this.uploadingForId];
        const newImg = new Image();
        newImg.onload = () => {
          textureCache[targetChar.aiAssets.head] = newImg;
          textureCache[targetChar.aiAssets.avatar] = newImg;
          textureCache[targetChar.aiAssets.bust] = newImg;
          textureCache[targetChar.classicAssets.head] = newImg;
          textureCache[targetChar.classicAssets.avatar] = newImg;
          textureCache[targetChar.classicAssets.bust] = newImg;
          try { localStorage.setItem("bb_face_" + this.uploadingForId, dataUrl); } catch (err) {}
          this.buildRosterUI();
        };
        newImg.src = dataUrl;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  bindInputs() {
    window.addEventListener("keydown", (e) => {
      if (this.listeningForKey) {
        e.preventDefault();
        this.keyBindings[this.listeningForKey] = e.code;
        this.listeningForKey = null;
        this.updateKeybindLabels();
        return;
      }

      // If typing in an editable name input, do not trigger combat moves
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) {
        return;
      }

      if (e.code === this.keyBindings.left || e.code === "ArrowLeft") this.inputState.left = true;
      if (e.code === this.keyBindings.right || e.code === "ArrowRight") this.inputState.right = true;
      if (e.code === this.keyBindings.up || e.code === "ArrowUp") this.inputState.up = true;
      if (e.code === this.keyBindings.down || e.code === "ArrowDown") this.inputState.down = true;
      if (e.code === this.keyBindings.block) this.inputState.block = true;

      if (!this.gameActive || !this.p1 || this.matchEnded) return;
      if (e.code === this.keyBindings.LP) this.p1.startAttack("LP");
      if (e.code === this.keyBindings.RP) this.p1.startAttack("RP");
      if (e.code === this.keyBindings.LK) this.p1.startAttack("LK");
      if (e.code === this.keyBindings.RK) this.p1.startAttack("RK");
      if (e.code === this.keyBindings.FLY) this.p1.startAttack("FLY");
      if (e.code === this.keyBindings.THROW) this.p1.startAttack("THROW");
      if (e.code === this.keyBindings.SWORD) this.p1.startAttack("SWORD");
      if (e.code === this.keyBindings.SP) this.p1.startAttack("SP");
    });

    window.addEventListener("keyup", (e) => {
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) {
        return;
      }
      if (e.code === this.keyBindings.left || e.code === "ArrowLeft") this.inputState.left = false;
      if (e.code === this.keyBindings.right || e.code === "ArrowRight") this.inputState.right = false;
      if (e.code === this.keyBindings.up || e.code === "ArrowUp") this.inputState.up = false;
      if (e.code === this.keyBindings.down || e.code === "ArrowDown") this.inputState.down = false;
      if (e.code === this.keyBindings.block) this.inputState.block = false;
    });

    document.querySelectorAll("[data-action]").forEach(btn => {
      const act = btn.dataset.action;
      const press = (e) => {
        e.preventDefault();
        this.inputState[act] = true;
        if (act === "left") this.inputState.stepLeftFrames = 10;
        if (act === "right") this.inputState.stepRightFrames = 10;
        if (act === "up" && this.gameActive && this.p1 && this.p1.y >= 485) this.p1.vy = -14;
        btn.classList.add("pressed");
      };
      const release = (e) => {
        e.preventDefault();
        this.inputState[act] = false;
        btn.classList.remove("pressed");
      };
      btn.addEventListener("pointerdown", press);
      btn.addEventListener("pointerup", release);
      btn.addEventListener("pointerleave", release);
      btn.addEventListener("pointercancel", release);
    });

    document.querySelectorAll("[data-atk]").forEach(btn => {
      const atk = btn.dataset.atk;
      const press = (e) => {
        e.preventDefault();
        btn.classList.add("pressed");
        if (this.gameActive && this.p1 && !this.matchEnded) this.p1.startAttack(atk);
      };
      const release = (e) => {
        e.preventDefault();
        btn.classList.remove("pressed");
      };
      btn.addEventListener("pointerdown", press);
      btn.addEventListener("pointerup", release);
      btn.addEventListener("pointerleave", release);
      btn.addEventListener("pointercancel", release);
    });

    const comboBtn = document.getElementById("mobile-combo-macro");
    if (comboBtn) {
      comboBtn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (!this.gameActive || !this.p1 || this.matchEnded) return;
        this.p1.startAttack("LP");
        setTimeout(() => { if (this.gameActive && this.p1) this.p1.startAttack("RP"); }, 140);
        setTimeout(() => { if (this.gameActive && this.p1) this.p1.startAttack("LK"); }, 290);
        setTimeout(() => { if (this.gameActive && this.p1) this.p1.startAttack("FLY"); }, 450);
      });
    }

    document.getElementById("pad-size-slider")?.addEventListener("input", (e) => {
      document.documentElement.style.setProperty("--pad-scale", e.target.value);
    });
    document.getElementById("pad-opacity-slider")?.addEventListener("input", (e) => {
      document.documentElement.style.setProperty("--pad-opacity", e.target.value);
    });

    document.getElementById("real-face-input")?.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleFaceFile(e.target.files[0]);
      }
    });

    // Real-time Slider Listeners in AI Studio
    document.getElementById("studio-scale-slider")?.addEventListener("input", (e) => {
      document.getElementById("studio-scale-val").textContent = Math.round(parseFloat(e.target.value) * 100) + "%";
    });
    document.getElementById("studio-offy-slider")?.addEventListener("input", (e) => {
      document.getElementById("studio-offy-val").textContent = e.target.value + "px";
    });
  }

  startNewMatch() {
    window.soundEngine.init();
    this.matchEnded = false;
    document.getElementById("select-screen").style.display = "none";
    document.getElementById("victory-screen").style.display = "none";
    document.getElementById("hud-overlay").style.display = "flex";
    document.getElementById("top-action-bar").style.display = "flex";

    this.p1 = new window.Fighter(window.ROSTER_DATA[this.p1Choice], 320, false);
    this.cpu = new window.Fighter(window.ROSTER_DATA[this.cpuChoice], 760, true);

    this.roundNum = 1;
    this.gameActive = true;
    this.setControlMode(this.controlMode);

    const p1Data = window.ROSTER_DATA[this.p1Choice];
    const cpuData = window.ROSTER_DATA[this.cpuChoice];
    const p1AvKey = window.getCharAsset(p1Data, "avatar");
    const cpuAvKey = window.getCharAsset(cpuData, "avatar");

    document.getElementById("hud-p1-avatar").src = window.GAME_ASSETS && window.GAME_ASSETS[p1AvKey] ? window.GAME_ASSETS[p1AvKey] : `./assets/images/${p1AvKey}.png`;
    document.getElementById("hud-p1-name").textContent = p1Data.name.toUpperCase();
    document.getElementById("hud-p1-voice").textContent = `"${p1Data.voiceType}!"`;

    document.getElementById("hud-cpu-avatar").src = window.GAME_ASSETS && window.GAME_ASSETS[cpuAvKey] ? window.GAME_ASSETS[cpuAvKey] : `./assets/images/${cpuAvKey}.png`;
    document.getElementById("hud-cpu-name").textContent = cpuData.name.toUpperCase();
    document.getElementById("hud-cpu-voice").textContent = `"${cpuData.voiceType}!"`;

    this.startRound();
  }

  startRound() {
    this.matchEnded = false;
    this.p1.resetForRound(320, 1);
    this.cpu.resetForRound(760, -1);
    this.roundTimer = 60;
    this.lastSecondTick = performance.now();
    this.bannerText = `ROUND ${this.roundNum} • FIGHT!`;
    this.bannerTimer = 55;
    window.soundEngine.announce(`Round ${this.roundNum}. Fight!`);
    this.updateHUD();
  }

  backToSelect() {
    this.gameActive = false;
    this.matchEnded = false;
    document.getElementById("select-screen").style.display = "flex";
    document.getElementById("victory-screen").style.display = "none";
    document.getElementById("hud-overlay").style.display = "none";
    document.getElementById("pc-controls-hud").style.display = "none";
    document.getElementById("phone-controls-hud").style.display = "none";
    document.getElementById("top-action-bar").style.display = "none";
    this.updateSelectUI();
  }

  handleRoundKO(winner, loser) {
    this.slowMoFrames = 42;
    winner.roundsWon++;
    this.updateHUD();

    const lifePct = Math.round((winner.health / winner.maxHealth) * 100);
    const evalTag = lifePct === 100 ? "PERFECT!" : (lifePct <= 20 ? "GREAT FINISH!" : "K.O.!");
    this.bannerText = `${evalTag} • ${winner.data.name.toUpperCase()} WINS!`;
    this.bannerTimer = 110;
    window.soundEngine.announce(evalTag);
    window.soundEngine.playCrowdRoar();

    setTimeout(() => {
      if (!this.gameActive) return;
      if (winner.roundsWon >= 2) {
        this.showVictoryScreen(winner);
      } else {
        this.roundNum++;
        this.startRound();
      }
    }, 2200);
  }

  showVictoryScreen(winner) {
    this.matchEnded = true;
    document.getElementById("pc-controls-hud").style.display = "none";
    document.getElementById("phone-controls-hud").style.display = "none";

    const lifePct = Math.round((winner.health / winner.maxHealth) * 100);
    const isPerfect = lifePct === 100;
    const rankTitle = isPerfect ? "🏆 SSS • PERFECT VICTORY!" : (lifePct >= 70 ? "⚡ S • DOMINANT VICTORY!" : "🔥 A • BRUTAL VICTORY!");
    const score = (winner.health * 70) + (this.roundTimer * 120) + (winner.totalLifeStolen * 30);

    const isP1 = !winner.isCPU;
    const nameStr = winner.data.name.toUpperCase() + (isP1 ? " (YOU) WIN!" : " (CPU) WINS!");
    const avKey = window.getCharAsset(winner.data, "avatar");

    document.getElementById("vic-winner-portrait").src = window.GAME_ASSETS && window.GAME_ASSETS[avKey] ? window.GAME_ASSETS[avKey] : `./assets/images/${avKey}.png`;
    document.getElementById("vic-rank-title").textContent = rankTitle;
    document.getElementById("vic-winner-name").textContent = nameStr;

    const quoteBadge = document.getElementById("vic-voice-quote");
    quoteBadge.className = `vic-quote-badge ${winner.data.voiceType === "OP" ? "type-op" : "type-rockstar"}`;
    quoteBadge.textContent = `Signature Victory Callout: "${winner.data.voiceType}!"`;

    document.getElementById("vic-life-text").textContent = `${winner.health} / ${winner.maxHealth} HP (${lifePct}% REMAINING)`;
    document.getElementById("vic-life-bar").style.width = `${lifePct}%`;
    document.getElementById("vic-stolen-text").textContent = `+${winner.totalLifeStolen} HP Healed via Vampiric Attacks`;
    document.getElementById("vic-score-text").textContent = score.toLocaleString() + " PTS";

    document.getElementById("victory-screen").style.display = "flex";
    window.soundEngine.triggerCharacterVoice(winner.data, "attack");
  }

  updateHUD() {
    if (!this.p1 || !this.cpu) return;

    const p1Pct = Math.max(0, (this.p1.health / this.p1.maxHealth) * 100);
    const p1GhostPct = Math.max(0, (this.p1.ghostHealth / this.p1.maxHealth) * 100);
    document.getElementById("p1-real-bar").style.width = `${p1Pct}%`;
    document.getElementById("p1-ghost-bar").style.width = `${p1GhostPct}%`;
    document.getElementById("p1-hp-text").textContent = `${this.p1.health} / ${this.p1.maxHealth} HP`;

    const cpuPct = Math.max(0, (this.cpu.health / this.cpu.maxHealth) * 100);
    const cpuGhostPct = Math.max(0, (this.cpu.ghostHealth / this.cpu.maxHealth) * 100);
    document.getElementById("cpu-real-bar").style.width = `${cpuPct}%`;
    document.getElementById("cpu-ghost-bar").style.width = `${cpuGhostPct}%`;
    document.getElementById("cpu-hp-text").textContent = `${this.cpu.health} / ${this.cpu.maxHealth} HP`;

    document.getElementById("p1-dot-1").classList.toggle("won", this.p1.roundsWon >= 1);
    document.getElementById("p1-dot-2").classList.toggle("won", this.p1.roundsWon >= 2);
    document.getElementById("cpu-dot-1").classList.toggle("won", this.cpu.roundsWon >= 1);
    document.getElementById("cpu-dot-2").classList.toggle("won", this.cpu.roundsWon >= 2);

    document.getElementById("timer-digits").textContent = String(this.roundTimer).padStart(2, "0");
    document.getElementById("round-indicator").textContent = `ROUND ${this.roundNum}`;
  }

  gameLoop(timestamp) {
    requestAnimationFrame((t) => this.gameLoop(t));
    if (!this.gameActive || !this.p1 || !this.cpu) return;

    if (this.slowMoFrames > 0) {
      this.slowMoFrames--;
      if (this.slowMoFrames % 3 !== 0) return;
    }

    this.frameCounter++;

    if (!this.matchEnded && this.p1.state !== "ko" && this.cpu.state !== "ko") {
      if (timestamp - this.lastSecondTick >= 1000) {
        this.roundTimer = Math.max(0, this.roundTimer - 1);
        this.lastSecondTick = timestamp;
        this.updateHUD();
        if (this.roundTimer === 0) {
          const winner = this.p1.health >= this.cpu.health ? this.p1 : this.cpu;
          const loser = winner === this.p1 ? this.cpu : this.p1;
          loser.state = "ko";
          this.handleRoundKO(winner, loser);
        }
      }
    }

    if (!this.matchEnded) {
      this.p1.update(this.cpu);
      this.cpu.update(this.p1);
      this.updateHUD();
    }

    const midX = (this.p1.x + this.cpu.x) / 2;
    const dist = Math.abs(this.p1.x - this.cpu.x);
    const targetZoom = Math.max(0.95, Math.min(1.22, 1.25 - (dist / 1400)));

    this.camX += (midX - this.camX) * 0.08;
    this.camZoom += (targetZoom - this.camZoom) * 0.08;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, 1080, 640);

    ctx.save();

    if (this.screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
      this.screenShake *= 0.82;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    this.arena.drawArena(ctx, this.frameCounter, this.p1, this.cpu);
    window.renderFighter(ctx, this.p1, false);
    window.renderFighter(ctx, this.cpu, false);
    this.arena.updateAndDrawParticles(ctx);

    ctx.restore();

    if (this.bannerTimer > 0) {
      this.bannerTimer--;
      ctx.save();
      ctx.fillStyle = "rgba(10, 6, 20, 0.75)";
      ctx.fillRect(0, 235, 1080, 85);
      ctx.strokeStyle = "rgba(255, 204, 0, 0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 235, 1080, 85);

      ctx.font = "italic 900 42px 'Rajdhani', Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 6;
      ctx.strokeText(this.bannerText, 540, 290);
      ctx.fillStyle = "#ffcc00";
      ctx.fillText(this.bannerText, 540, 290);
      ctx.restore();
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.gameEngine = new GameEngine();
});
