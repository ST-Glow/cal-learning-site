(function () {
  const GATE_X = 450;
  const GATE_Y = 205;
  const START_X = 95;
  const START_Y = 210;
  const VISITOR_STOP_X = 350;
  const BOOTHS = {
    half: { label: "半价票口", color: "#ff9b54", dark: "#d97a2f", x: 120, y: 315, w: 170, h: 100 },
    full: { label: "全价票口", color: "#29a4d9", dark: "#1877a8", x: 610, y: 315, w: 170, h: 100 }
  };
  const CHIP_OPTIONS = [
    { id: "lt", label: "身高 < 120cm", desc: "低于120厘米", x: 150, y: 170, w: 260, h: 90 },
    { id: "lte", label: "身高 ≤ 120cm", desc: "不超过120厘米", x: 490, y: 170, w: 260, h: 90 }
  ];

  let context = null;
  let saved = null;
  let canvas = null;
  let ctx = null;
  let rafId = 0;
  let lastTime = 0;
  let time = 0;

  let phase = "idle"; // idle | setup | run | result
  let sub = "idle"; // toGate | await | toBooth | celebrate
  let chipSelected = null;
  let chipFirstTryCorrect = true;
  let allFirstTryCorrect = true;
  let visitorIndex = 0;
  let visitor = null;
  let visitorX = START_X;
  let visitorMoving = false;
  let visitorArrived = false;
  let firstTry = true;
  let celebrateTimer = 0;
  let shakeTimer = 0;
  let shakePower = 0;
  let message = "";
  let particles = [];
  let lastRun = [];
  let resultInfo = null;
  let statusText = "";
  let successFlash = 0;
  let visitorTargetX = 0;
  let fullscreenHandler = null;

  function render(mission, savedState, state) {
    saved = savedState;
    return `
      <section class="ticket-game level1-game" data-game-level="1">
        <div class="game-story">
          <div>
            <span class="game-label">智慧乐园闸机大作战 · 第 1 关</span>
            <h3>${escape(mission.title)}</h3>
            <p>${escape(mission.story)} 这次不用拖动闸机，直接用鼠标把游客送到正确的票口。</p>
          </div>
          <div class="mission-stars" aria-label="本关最佳星级">${starMarkup(savedState.bestStars || 0)}</div>
        </div>

        <div class="game-layout">
          <aside class="visitor-queue">
            <div class="panel-title"><span>1</span> 游客队列</div>
            ${mission.visitors.map((item, index) => queueCard(item, index)).join("")}
          </aside>

          <div class="track-board level1-track">
            <canvas id="level1-canvas" width="900" height="430" aria-label="智慧乐园鼠标分流小游戏：请选择条件芯片并把游客送到正确票口"></canvas>
            <div class="level1-start-overlay" id="level1-start-overlay">
              <button class="primary-button game-run" id="game-run">▶ 开始游戏</button>
            </div>
            <div class="level1-canvas-tip">🖱 用鼠标点击屏幕上的按钮</div>
            <div class="track-message" id="track-message">点击“开始游戏”，先选择正确的条件芯片。</div>
            <div class="canvas-action-dock" id="level1-action-dock" aria-label="情境导入游戏操作">
              <span id="level1-action-prompt">开始后可在这里点按操作</span>
              <div class="canvas-action-group" data-level1-actions="chip">
                <button type="button" class="chip-button" data-level1-chip="lt" disabled>身高 &lt; 120cm</button>
                <button type="button" class="chip-button" data-level1-chip="lte" disabled>身高 ≤ 120cm</button>
              </div>
              <div class="canvas-action-group hidden" data-level1-actions="booth">
                <button type="button" class="chip-button" data-level1-booth="half" disabled>半价票口</button>
                <button type="button" class="chip-button" data-level1-booth="full" disabled>全价票口</button>
              </div>
            </div>
          </div>

          <aside class="gate-console level1-console">
            <div class="panel-title"><span>2</span> 玩法说明</div>
            <ul class="level1-rules">
              <li><b>第一步：</b>安装正确的条件芯片。</li>
              <li><b>第二步：</b>游客到达闸机后，点击正确的票口。</li>
              <li><b>规则：</b>身高 < 120cm → 半价票口；否则 → 全价票口。</li>
            </ul>
            <div class="level1-status" id="level1-status" aria-live="polite">等待开始</div>
          </aside>
        </div>

        <div class="game-controls">
          <button class="secondary-button" id="game-reset">重新开始</button>
          <button class="secondary-button game-fullscreen-btn" id="game-fullscreen">⛶ 全屏</button>
        </div>

        <div class="game-review">
          <div>
            <span class="panel-title"><span>3</span> 通关复盘</span>
            <p>${escape(mission.review)}</p>
            <textarea id="game-review-text" rows="2" placeholder="写下你的发现，获得思考星">${escape(savedState.review || "")}</textarea>
            <div class="game-review-actions">
              <button type="button" class="primary-button" id="game-review-submit">提交复盘</button>
              <small id="game-review-status" aria-live="polite">提交后将重新评定思考星</small>
            </div>
          </div>
          <div class="review-map">
            <code>如果 身高 &lt; 120：半价票<br>否则：全价票</code>
          </div>
        </div>

        <div class="game-result hidden" id="game-result" aria-live="polite"></div>
      </section>`;
  }

  function queueCard(item, index) {
    return `
      <article class="queue-card" data-visitor-card="${index}">
        <span class="queue-number">${index + 1}</span>
        <span class="queue-avatar">${item.icon}</span>
        <div><strong>${escape(item.name)}</strong><small>${item.height}cm${item.student ? " · 有学生证" : ""}</small></div>
      </article>`;
  }

  function starMarkup(count) {
    return [1, 2, 3].map(index => `<span class="${index <= count ? "earned" : ""}">★</span>`).join("");
  }

  function attach(level, options) {
    cancelAnimationFrame(rafId);
    context = options;
    saved = options.state.game.missions[level];
    canvas = document.getElementById("level1-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    phase = "idle";
    sub = "idle";
    chipSelected = null;
    chipFirstTryCorrect = true;
    allFirstTryCorrect = true;
    visitorIndex = 0;
    visitor = null;
    visitorX = START_X;
    visitorMoving = false;
    visitorArrived = false;
    firstTry = true;
    celebrateTimer = 0;
    shakeTimer = 0;
    shakePower = 0;
    particles = [];
    lastRun = [];
    resultInfo = null;
    statusText = saved.lastRun?.length ? "已完成一次，可重新开始" : "等待开始";
    updateStatus(statusText);

    canvas.addEventListener("click", handleCanvasClick);
    canvas.tabIndex = 0;
    canvas.addEventListener("keydown", handleCanvasKeydown);

    document.querySelectorAll("[data-level1-chip]").forEach(button => button.addEventListener("click", () => {
      selectChip(button.dataset.level1Chip);
    }));
    document.querySelectorAll("[data-level1-booth]").forEach(button => button.addEventListener("click", () => {
      chooseBooth(button.dataset.level1Booth);
    }));

    document.getElementById("game-run").addEventListener("click", startGame);
    document.getElementById("game-reset").addEventListener("click", resetGame);
    bindFullscreen();

    const reviewText = document.getElementById("game-review-text");
    const reviewSubmit = document.getElementById("game-review-submit");
    reviewText.addEventListener("input", event => {
      saved.review = event.target.value;
      if (context.syncThinking) context.syncThinking(context.level);
      else save();
    });
    reviewSubmit.addEventListener("click", submitReview);

    lastTime = performance.now();
    updateActionDock();
    rafId = requestAnimationFrame(loop);
  }

  function bindFullscreen() {
    const button = document.getElementById("game-fullscreen");
    if (!button) return;
    const section = button.closest(".ticket-game");
    const updateText = () => {
      button.textContent = document.fullscreenElement === section ? "⛶ 退出全屏" : "⛶ 全屏";
    };
    button.addEventListener("click", () => {
      if (document.fullscreenElement === section) {
        document.exitFullscreen().catch(() => {});
      } else if (section && section.requestFullscreen) {
        section.requestFullscreen().catch(() => {});
      }
    });
    if (fullscreenHandler) document.removeEventListener("fullscreenchange", fullscreenHandler);
    fullscreenHandler = updateText;
    document.addEventListener("fullscreenchange", fullscreenHandler);
  }

  function save() {
    if (context && context.save) context.save();
  }

  function setMessage(text) {
    message = text;
    const el = document.getElementById("track-message");
    if (el) el.textContent = text;
  }

  function updateStatus(text) {
    statusText = text;
    const el = document.getElementById("level1-status");
    if (el) el.textContent = text;
  }

  function startGame() {
    if (phase === "setup" || phase === "run") return;
    saved.attempts = Number(saved.attempts || 0) + 1;
    saved.lastRun = [];
    lastRun = [];
    chipSelected = null;
    chipFirstTryCorrect = true;
    allFirstTryCorrect = true;
    visitorIndex = 0;
    visitor = null;
    visitorX = START_X;
    visitorMoving = false;
    visitorArrived = false;
    firstTry = true;
    celebrateTimer = 0;
    particles = [];
    resultInfo = null;
    phase = "setup";
    sub = "idle";
    const overlay = document.getElementById("level1-start-overlay");
    if (overlay) overlay.classList.add("hidden");
    const result = document.getElementById("game-result");
    if (result) result.classList.add("hidden");
    setMessage("请先选择正确的条件芯片：身高 < 120cm 还是 ≤ 120cm？");
    updateStatus("第一步：安装条件芯片");
    updateActionDock();
    save();
  }

  function resetGame() {
    phase = "idle";
    sub = "idle";
    chipSelected = null;
    chipFirstTryCorrect = true;
    allFirstTryCorrect = true;
    visitorIndex = 0;
    visitor = null;
    visitorX = START_X;
    visitorMoving = false;
    visitorArrived = false;
    firstTry = true;
    celebrateTimer = 0;
    particles = [];
    lastRun = [];
    resultInfo = null;
    saved.operator = "";
    saved.trueExit = "";
    saved.falseExit = "";
    saved.lastRun = [];
    document.querySelectorAll("[data-visitor-card]").forEach(card => card.classList.remove("active"));
    const result = document.getElementById("game-result");
    if (result) result.classList.add("hidden");
    const overlay = document.getElementById("level1-start-overlay");
    if (overlay) overlay.classList.remove("hidden");
    setMessage("点击“开始游戏”，先选择正确的条件芯片。");
    updateStatus("等待开始");
    updateActionDock();
    save();
  }

  function selectChip(chipId) {
    if (phase !== "setup") return;
    if (chipId === "lt") {
      chipSelected = "lt";
      phase = "run";
      sub = "idle";
      setMessage("芯片安装正确！下面请把游客送到正确的票口。");
      updateStatus("第二步：为游客选择票口");
      nextVisitor();
    } else {
      chipFirstTryCorrect = false;
      shakeTimer = 0.5;
      shakePower = 8;
      setMessage("再想想：120cm 应该算“小于120”还是“不小于120”？正确芯片是“身高 < 120cm”。");
      updateStatus("条件芯片不对，再试一次");
      beep(180, 0.15);
    }
    updateActionDock();
    save();
  }

  function nextVisitor() {
    if (visitorIndex >= context.mission.visitors.length) {
      finishGame();
      return;
    }
    visitor = context.mission.visitors[visitorIndex];
    visitorX = START_X;
    visitorMoving = true;
    visitorArrived = false;
    firstTry = true;
    sub = "toGate";
    markActiveVisitor(visitorIndex);
    setMessage(`${visitor.name} 来了：身高 ${visitor.height}cm。请点击正确的票口！`);
    updateStatus(`正在服务：${visitor.name}（${visitorIndex + 1}/${context.mission.visitors.length}）`);
    updateActionDock();
  }

  function chooseBooth(choice) {
    if (phase !== "run" || sub !== "await" || !visitor) return;
    const expected = visitor.height < 120 ? "half" : "full";
    const correct = choice === expected;
    if (!correct) {
      firstTry = false;
      allFirstTryCorrect = false;
      shakeTimer = 0.5;
      shakePower = 8;
      setMessage(`${visitor.name} 身高 ${visitor.height}cm，应该去${expected === "half" ? "半价票口" : "全价票口"}。再试一次。`);
      beep(180, 0.15);
      updateActionDock();
      return;
    }

    const result = {
      visitor: { ...visitor },
      expected,
      actual: choice,
      correct: true,
      checks: [{
        label: "身高 < 120cm",
        value: `${visitor.height}cm`,
        result: visitor.height < 120,
        text: `身高 < 120cm｜输入：${visitor.height}cm｜${visitor.height < 120 ? "成立" : "不成立"}`
      }],
      paths: ["path-start", choice === "half" ? "path-half" : "path-full"]
    };
    lastRun.push(result);
    saved.lastRun.push(result);
    visitorTargetX = BOOTHS[choice].x + BOOTHS[choice].w / 2;
    visitorMoving = true;
    visitorArrived = false;
    sub = "toBooth";
    setMessage(`正确！${visitor.name} 去${BOOTHS[choice].label}。`);
    beep(820, 0.1);
    spawnConfetti(BOOTHS[choice].x + BOOTHS[choice].w / 2, BOOTHS[choice].y);
    updateActionDock();
    save();
  }

  function finishGame() {
    const accuracy = allFirstTryCorrect;
    const logic = chipSelected === "lt";
    const thinking = context.evaluateThinking ? Boolean(context.evaluateThinking(context.level)) : saved.review.trim().length >= 8;
    saved.operator = chipSelected || "lt";
    saved.trueExit = "half";
    saved.falseExit = "full";
    saved.earned = { accuracy, logic, thinking };
    const stars = Number(accuracy) + Number(logic) + Number(thinking);
    saved.bestStars = Math.max(saved.bestStars || 0, stars);
    save();
    phase = "result";
    sub = "idle";
    updateStatus(`本轮完成：${stars}/3 星`);
    resultInfo = { stars, accuracy, logic, thinking };
    updateActionDock();
    showResult(stars, accuracy, logic, thinking);
    if (accuracy && logic && context.complete) context.complete(context.level);
  }

  function showResult(stars, accuracy, logic, thinking) {
    const result = document.getElementById("game-result");
    if (!result) return;
    result.classList.remove("hidden");
    result.innerHTML = `
      <div class="result-stars">${starMarkup(stars)}</div>
      <h3>${stars === 3 ? "三星通关！" : stars ? "闸机测试完成" : "继续调试闸机"}</h3>
      <div class="star-reasons">
        ${starReason("准确星", accuracy, "每位游客第一次就进入正确票口")}
        ${starReason("逻辑星", logic, "最终安装了正确的条件芯片“身高 < 120cm”")}
        ${starReason("思考星", thinking, "引用运行证据并用关键概念解释")}
      </div>
      <p>本关最佳：${saved.bestStars}/3 星</p>`;
    if (stars > 0) beep(980, 0.12);
  }

  function starReason(name, earned, reason) {
    return `<div class="${earned ? "earned" : ""}"><span>★</span><strong>${name}</strong><small>${reason}</small></div>`;
  }

  function submitReview() {
    const reviewText = document.getElementById("game-review-text");
    const status = document.getElementById("game-review-status");
    if (!saved.lastRun.length) {
      status.textContent = "请先完成一次闸机测试，再提交复盘。";
      context.toast("请先完成一次闸机测试，再提交通关复盘。");
      return;
    }
    saved.review = reviewText.value.trim();
    if (saved.review.length < 8) {
      status.textContent = "还需写得更具体一些（至少 8 个字）。";
      reviewText.focus();
      context.toast("复盘至少写 8 个字，并说明你观察到的条件或路径。");
      return;
    }
    const thinking = context.evaluateThinking ? Boolean(context.evaluateThinking(context.level)) : true;
    saved.earned.thinking = thinking;
    const stars = Number(saved.earned.accuracy) + Number(saved.earned.logic) + Number(thinking);
    saved.bestStars = Math.max(saved.bestStars || 0, stars);
    save();
    status.textContent = thinking ? "复盘已提交，获得思考星！" : "已保存。请结合运行结果，并使用本关关键概念说明原因。";
    showResult(stars, saved.earned.accuracy, saved.earned.logic, thinking);
    context.toast(thinking ? "复盘提交成功，获得思考星！" : "复盘已保存，再补充运行证据和关键概念即可获得思考星。");
  }

  function markActiveVisitor(index) {
    document.querySelectorAll("[data-visitor-card]").forEach(card =>
      card.classList.toggle("active", Number(card.dataset.visitorCard) === index));
  }

  function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (phase === "setup") {
      CHIP_OPTIONS.forEach(option => {
        if (x >= option.x && x <= option.x + option.w && y >= option.y && y <= option.y + option.h) {
          selectChip(option.id);
        }
      });
      return;
    }

    if (phase === "run" && sub === "await") {
      Object.entries(BOOTHS).forEach(([key, booth]) => {
        if (x >= booth.x && x <= booth.x + booth.w && y >= booth.y && y <= booth.y + booth.h) {
          chooseBooth(key);
        }
      });
    }
  }

  function handleCanvasKeydown(event) {
    if (!["1", "2", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const first = event.key === "1" || event.key === "ArrowLeft";
    if (phase === "setup") selectChip(first ? "lt" : "lte");
    else if (phase === "run" && sub === "await") chooseBooth(first ? "half" : "full");
  }

  function updateActionDock() {
    const prompt = document.getElementById("level1-action-prompt");
    const chipGroup = document.querySelector('[data-level1-actions="chip"]');
    const boothGroup = document.querySelector('[data-level1-actions="booth"]');
    const chipButtons = document.querySelectorAll("[data-level1-chip]");
    const boothButtons = document.querySelectorAll("[data-level1-booth]");
    if (!prompt || !chipGroup || !boothGroup) return;
    const choosingChip = phase === "setup";
    const choosingBooth = phase === "run" && sub === "await";
    chipGroup.classList.toggle("hidden", !choosingChip);
    boothGroup.classList.toggle("hidden", !choosingBooth);
    chipButtons.forEach(button => { button.disabled = !choosingChip; });
    boothButtons.forEach(button => { button.disabled = !choosingBooth; });
    if (choosingChip) prompt.textContent = "第1步：选择判断条件（键盘 1 / 2）";
    else if (choosingBooth) prompt.textContent = `${visitor?.name || "游客"} ${visitor?.height || ""}cm：选择票口（键盘 1 / 2）`;
    else if (phase === "result") prompt.textContent = "本轮完成，可重新开始挑战三星";
    else if (phase === "run") prompt.textContent = "游客正在移动，请观察判断路径";
    else prompt.textContent = "点击“开始游戏”进入任务";
  }

  function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    time += dt;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function update(dt) {
    if (shakeTimer > 0) shakeTimer -= dt;
    if (successFlash > 0) successFlash -= dt;

    if (phase === "run" && visitorMoving) {
      const target = sub === "toGate" ? VISITOR_STOP_X : (sub === "toBooth" ? visitorTargetX : visitorX);
      const speed = sub === "toBooth" ? 260 : 180;
      const dx = target - visitorX;
      if (Math.abs(dx) < 2) {
        visitorX = target;
        visitorMoving = false;
        if (sub === "toGate") {
          visitorArrived = true;
          sub = "await";
          updateActionDock();
        } else if (sub === "toBooth") {
          sub = "celebrate";
          celebrateTimer = 0.9;
          visitorArrived = false;
          successFlash = 0.6;
        }
      } else {
        visitorX += Math.sign(dx) * speed * dt;
      }
    }

    if (sub === "celebrate") {
      celebrateTimer -= dt;
      if (celebrateTimer <= 0) {
        sub = "idle";
        visitorIndex += 1;
        nextVisitor();
      }
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, 900, 430);

    // 安装芯片前把背景虚化/压暗，让芯片选项更突出
    const canBlur = typeof ctx.filter === "string";
    if (phase === "setup" && canBlur) ctx.filter = "blur(6px)";

    drawBackground();
    drawBooths();
    drawGate();
    drawVisitor();
    drawParticles();

    if (phase === "setup") {
      if (canBlur) ctx.filter = "none";
      ctx.fillStyle = "rgba(23,50,75,.38)";
      ctx.fillRect(0, 0, 900, 430);
      drawChipOptions();
    } else if (canBlur) {
      ctx.filter = "none";
    }
  }

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, 430);
    sky.addColorStop(0, "#bfe9ff");
    sky.addColorStop(0.65, "#e8f8ff");
    sky.addColorStop(1, "#d9f2d0");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 900, 430);

    // sun
    ctx.save();
    ctx.shadowColor = "rgba(255,200,80,.8)";
    ctx.shadowBlur = 30;
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.arc(790, 70, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // clouds
    drawCloud(120, 60, 0.9);
    drawCloud(420, 95, 0.7);
    drawCloud(680, 45, 1.1);

    // ground
    ctx.fillStyle = "#9edc8f";
    ctx.fillRect(0, 330, 900, 100);
    ctx.fillStyle = "#7cc96f";
    ctx.fillRect(0, 330, 900, 8);

    // trees
    drawTree(40, 300);
    drawTree(850, 310);
    drawTree(780, 315);

    // station silhouette
    ctx.fillStyle = "#f7c873";
    roundRect(ctx, 360, 230, 180, 110, 16);
    ctx.fill();
    ctx.fillStyle = "#e5a94f";
    roundRect(ctx, 360, 230, 180, 20, 10);
    ctx.fill();
    ctx.fillStyle = "#fff";
    roundRect(ctx, 420, 275, 60, 65, 8);
    ctx.fill();
  }

  function drawCloud(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.arc(25, -8, 28, 0, Math.PI * 2);
    ctx.arc(55, 0, 22, 0, Math.PI * 2);
    ctx.arc(28, 8, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawTree(x, y) {
    ctx.fillStyle = "#8a5a3b";
    roundRect(ctx, x - 9, y, 18, 34, 6);
    ctx.fill();
    ctx.fillStyle = "#5fae54";
    ctx.beginPath();
    ctx.arc(x, y - 8, 30, 0, Math.PI * 2);
    ctx.arc(x - 26, y + 4, 22, 0, Math.PI * 2);
    ctx.arc(x + 26, y + 4, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGate() {
    const gx = GATE_X;
    const gy = GATE_Y;
    ctx.save();
    ctx.shadowColor = "rgba(24,49,83,.25)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#fff3a8";
    ctx.strokeStyle = "#183153";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(gx, gy - 70);
    ctx.lineTo(gx + 95, gy);
    ctx.lineTo(gx, gy + 70);
    ctx.lineTo(gx - 95, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#183153";
    ctx.font = "bold 16px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("判断闸机", gx, gy - 32);
    ctx.font = "bold 17px 'Microsoft YaHei', sans-serif";
    ctx.fillText("身高 < 120cm ?", gx, gy + 2);
    ctx.font = "13px 'Microsoft YaHei', sans-serif";
    ctx.fillStyle = "#6d4b00";
    ctx.fillText(chipSelected ? (chipSelected === "lt" ? "芯片：< 120" : "芯片：≤ 120") : "等待安装芯片", gx, gy + 34);
  }

  function drawBooths() {
    Object.entries(BOOTHS).forEach(([key, booth]) => {
      const active = phase === "run" && sub === "await";
      const wrongFlash = shakeTimer > 0 && active;
      ctx.save();
      if (wrongFlash) {
        ctx.translate((Math.random() - 0.5) * shakePower, (Math.random() - 0.5) * shakePower);
      }
      ctx.shadowColor = "rgba(0,0,0,.18)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = booth.color;
      ctx.strokeStyle = "#183153";
      ctx.lineWidth = 4;
      roundRect(ctx, booth.x, booth.y, booth.w, booth.h, 18);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff";
      ctx.font = "bold 22px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(booth.label, booth.x + booth.w / 2, booth.y + 44);
      ctx.font = "14px 'Microsoft YaHei', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.fillText(key === "half" ? "身高 < 120cm" : "身高 ≥ 120cm", booth.x + booth.w / 2, booth.y + 72);
      ctx.restore();
    });
  }

  function drawChipOptions() {
    CHIP_OPTIONS.forEach(option => {
      ctx.save();
      ctx.shadowColor = "rgba(24,49,83,.25)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = option.id === "lt" ? "#e8f7ea" : "#fff0e8";
      ctx.strokeStyle = option.id === "lt" ? "#4caf6e" : "#e08a5a";
      ctx.lineWidth = 4;
      roundRect(ctx, option.x, option.y, option.w, option.h, 20);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#17324b";
      ctx.font = "bold 24px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(option.label, option.x + option.w / 2, option.y + 42);
      ctx.font = "14px 'Microsoft YaHei', sans-serif";
      ctx.fillStyle = "#60758c";
      ctx.fillText(option.desc, option.x + option.w / 2, option.y + 68);
      ctx.restore();
    });
  }

  function drawVisitor() {
    if (!visitor || phase === "idle" || phase === "result") return;
    const bounce = visitorMoving ? Math.sin(time * 12) * 3 : 0;
    const x = visitorX;
    const y = START_Y + bounce;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.2)";
    ctx.shadowBlur = 8;
    ctx.font = "46px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(visitor.icon || "🧒", x, y - 24);
    ctx.restore();

    // name tag
    ctx.fillStyle = "rgba(255,255,255,.9)";
    roundRect(ctx, x - 40, y - 58, 80, 24, 12);
    ctx.fill();
    ctx.fillStyle = "#17324b";
    ctx.font = "bold 13px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${visitor.name} ${visitor.height}cm`, x, y - 41);
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function spawnConfetti(x, y) {
    const colors = ["#ffd447", "#ff9b54", "#29a4d9", "#71bb48", "#ef5da8"];
    for (let i = 0; i < 24; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 220;
      particles.push({
        x,
        y: y + 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 120,
        size: 4 + Math.random() * 5,
        color: colors[i % colors.length],
        life: 0.7 + Math.random() * 0.6,
        maxLife: 1.3
      });
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function beep(frequency, duration) {
    if (!context || context.state.game.muted) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audio = new AudioContext();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      gain.gain.setValueAtTime(0.05, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + duration);
      oscillator.onended = () => audio.close();
    } catch {}
  }

  function escape(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  window.Level1Canvas = {
    render,
    attach
  };
})();
