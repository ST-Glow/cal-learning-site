(function () {
  const START = { x: 80, y: 200 };
  const DIAMOND = { x: 400, y: 200 };
  const BOOTHS = {
    half: { label: "半价票口", color: "#ff9b54", dark: "#d97a2f", x: 620, y: 100, w: 160, h: 70 },
    full: { label: "全价票口", color: "#29a4d9", dark: "#1877a8", x: 620, y: 250, w: 160, h: 70 }
  };
  const PATH_BUTTONS = {
    yes: { label: "是", x: 500, y: 112, w: 120, h: 58 },
    no: { label: "否", x: 500, y: 250, w: 120, h: 58 }
  };
  const CODE_BUTTONS = {
    if: { label: "if 成立", x: 240, y: 360, w: 190, h: 52 },
    else: { label: "else 不成立", x: 470, y: 360, w: 190, h: 52 }
  };

  let context = null;
  let saved = null;
  let canvas = null;
  let ctx = null;
  let rafId = 0;
  let lastTime = 0;
  let time = 0;

  let phase = "idle"; // idle | run | result
  let sub = "idle"; // toDiamond | awaitPath | toBooth | awaitCode | celebrate
  let visitorIndex = 0;
  let visitor = null;
  let visitorX = START.x;
  let visitorY = START.y;
  let visitorMoving = false;
  let visitorTargetX = START.x;
  let visitorTargetY = START.y;
  let pathChoice = null;
  let pathCorrect = false;
  let codeChoice = null;
  let codeCorrect = false;
  let allPathFirstTry = true;
  let allCodeFirstTry = true;
  let firstPathTry = true;
  let firstCodeTry = true;
  let celebrateTimer = 0;
  let shakeTimer = 0;
  let shakePower = 0;
  let codeHighlight = "condition"; // condition | if | else
  let particles = [];
  let lastRun = [];
  let message = "";
  let statusText = "";
  let resultInfo = null;
  let fullscreenHandler = null;

  function render(mission, savedState, state) {
    saved = savedState;
    return `
      <section class="ticket-game level3-game" data-game-level="3">
        <div class="game-story">
          <div>
            <span class="game-label">智慧乐园闸机大作战 · 第 3 关</span>
            <h3>${escape(mission.title)}</h3>
            <p>${escape(mission.story)} 这次是流程图跑酷：选对“是/否”，再看懂 if/else 代码。</p>
          </div>
          <div class="mission-stars" aria-label="本关最佳星级">${starMarkup(savedState.bestStars || 0)}</div>
        </div>

        <div class="game-layout">
          <aside class="visitor-queue">
            <div class="panel-title"><span>1</span> 游客队列</div>
            ${mission.visitors.map((item, index) => queueCard(item, index)).join("")}
          </aside>

          <div class="track-board level3-track">
            <canvas id="level3-canvas" width="900" height="430" aria-label="智慧乐园流程图跑酷游戏：选择是/否路径并匹配if/else代码"></canvas>
            <div class="level3-start-overlay" id="level3-start-overlay">
              <button class="primary-button game-run" id="game-run">▶ 开始跑酷</button>
            </div>
            <div class="level1-canvas-tip">🖱 点击画布；触屏或键盘可用下方按钮</div>
            <div class="track-message" id="track-message">点击“开始跑酷”，帮助游客通过流程图。</div>
            <div class="canvas-action-dock" id="level3-action-dock" aria-label="流程图跑酷操作">
              <span id="level3-action-prompt">开始后在这里选择路径和代码</span>
              <div class="canvas-action-group" data-level3-actions="path">
                <button type="button" class="chip-button" data-level3-path="yes" disabled>是</button>
                <button type="button" class="chip-button" data-level3-path="no" disabled>否</button>
              </div>
              <div class="canvas-action-group hidden" data-level3-actions="code">
                <button type="button" class="chip-button" data-level3-code="if" disabled>if 成立</button>
                <button type="button" class="chip-button" data-level3-code="else" disabled>else 不成立</button>
              </div>
            </div>
          </div>

          <aside class="gate-console level3-console">
            <div class="panel-title"><span>2</span> 玩法说明</div>
            <ul class="level1-rules">
              <li><b>1.</b> 游客跑到判断菱形时，选择“是/否”。</li>
              <li><b>2.</b> 到达票口后，选择对应的代码分支。</li>
              <li><b>规则：</b>身高 < 120cm → 半价；否则 → 全价。</li>
            </ul>
            <div class="level1-status" id="level3-status" aria-live="polite">等待开始</div>
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
    canvas = document.getElementById("level3-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    phase = "idle";
    sub = "idle";
    visitorIndex = 0;
    visitor = null;
    visitorX = START.x;
    visitorY = START.y;
    visitorMoving = false;
    visitorTargetX = START.x;
    visitorTargetY = START.y;
    pathChoice = null;
    pathCorrect = false;
    codeChoice = null;
    codeCorrect = false;
    allPathFirstTry = true;
    allCodeFirstTry = true;
    firstPathTry = true;
    firstCodeTry = true;
    celebrateTimer = 0;
    shakeTimer = 0;
    shakePower = 0;
    codeHighlight = "condition";
    particles = [];
    lastRun = [];
    resultInfo = null;
    statusText = "等待开始";
    updateStatus(statusText);

    canvas.addEventListener("click", handleCanvasClick);
    canvas.tabIndex = 0;
    canvas.addEventListener("keydown", handleCanvasKeydown);

    document.querySelectorAll("[data-level3-path]").forEach(button => button.addEventListener("click", () => {
      choosePath(button.dataset.level3Path);
    }));
    document.querySelectorAll("[data-level3-code]").forEach(button => button.addEventListener("click", () => {
      chooseCode(button.dataset.level3Code);
    }));

    document.getElementById("game-run").addEventListener("click", startRun);
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
    const el = document.getElementById("level3-status");
    if (el) el.textContent = text;
  }

  function startRun() {
    if (phase === "run") return;
    phase = "run";
    sub = "idle";
    visitorIndex = 0;
    visitor = null;
    visitorX = START.x;
    visitorY = START.y;
    visitorMoving = false;
    visitorTargetX = START.x;
    visitorTargetY = START.y;
    pathChoice = null;
    pathCorrect = false;
    codeChoice = null;
    codeCorrect = false;
    allPathFirstTry = true;
    allCodeFirstTry = true;
    firstPathTry = true;
    firstCodeTry = true;
    celebrateTimer = 0;
    particles = [];
    lastRun = [];
    resultInfo = null;
    codeHighlight = "condition";
    saved.attempts = Number(saved.attempts || 0) + 1;
    saved.lastRun = [];
    document.getElementById("level3-start-overlay").classList.add("hidden");
    const result = document.getElementById("game-result");
    if (result) result.classList.add("hidden");
    setMessage("跑酷开始！第一位游客正在接近判断菱形……");
    updateStatus("跑酷中");
    nextVisitor();
    updateActionDock();
    save();
  }

  function resetGame() {
    phase = "idle";
    sub = "idle";
    visitorIndex = 0;
    visitor = null;
    visitorX = START.x;
    visitorY = START.y;
    visitorMoving = false;
    visitorTargetX = START.x;
    visitorTargetY = START.y;
    pathChoice = null;
    pathCorrect = false;
    codeChoice = null;
    codeCorrect = false;
    allPathFirstTry = true;
    allCodeFirstTry = true;
    firstPathTry = true;
    firstCodeTry = true;
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
    document.getElementById("level3-start-overlay").classList.remove("hidden");
    setMessage("点击“开始跑酷”，帮助游客通过流程图。");
    updateStatus("等待开始");
    updateActionDock();
    save();
  }

  function nextVisitor() {
    if (visitorIndex >= context.mission.visitors.length) {
      finishGame();
      return;
    }
    visitor = context.mission.visitors[visitorIndex];
    visitorX = START.x;
    visitorY = START.y;
    visitorMoving = true;
    visitorTargetX = DIAMOND.x - 60;
    visitorTargetY = DIAMOND.y;
    sub = "toDiamond";
    pathChoice = null;
    pathCorrect = false;
    codeChoice = null;
    codeCorrect = false;
    firstPathTry = true;
    firstCodeTry = true;
    codeHighlight = "condition";
    markActiveVisitor(visitorIndex);
    setMessage(`${visitor.name} 来了：身高 ${visitor.height}cm。跑到菱形时选择“是/否”。`);
    updateStatus(`跑酷中：${visitor.name}（${visitorIndex + 1}/${context.mission.visitors.length}）`);
    updateActionDock();
  }

  function expectedPath(visitor) {
    return visitor.height < 120 ? "yes" : "no";
  }

  function choosePath(choice) {
    if (phase !== "run" || sub !== "awaitPath" || !visitor) return;
    const expected = expectedPath(visitor);
    const correct = choice === expected;
    if (!correct) {
      firstPathTry = false;
      allPathFirstTry = false;
      shakeTimer = 0.5;
      shakePower = 8;
      setMessage(`${visitor.name} 身高 ${visitor.height}cm，应该选“${expected === "yes" ? "是" : "否"}”。再试一次。`);
      beep(180, 0.15);
      updateActionDock();
      return;
    }
    pathChoice = choice;
    pathCorrect = true;
    const boothKey = choice === "yes" ? "half" : "full";
    visitorTargetX = BOOTHS[boothKey].x + 30;
    visitorTargetY = BOOTHS[boothKey].y + 38;
    sub = "toBooth";
    visitorMoving = true;
    codeHighlight = choice === "yes" ? "if" : "else";
    setMessage(`选择正确！${visitor.name} 正在前往${BOOTHS[boothKey].label}。`);
    beep(820, 0.1);
    updateActionDock();
    save();
  }

  function chooseCode(choice) {
    if (phase !== "run" || sub !== "awaitCode" || !visitor) return;
    const expectedCode = pathChoice === "yes" ? "if" : "else";
    const correct = choice === expectedCode;
    if (!correct) {
      firstCodeTry = false;
      allCodeFirstTry = false;
      shakeTimer = 0.5;
      shakePower = 8;
      setMessage(`刚才走的是“${expectedCode === "if" ? "if 成立" : "else 不成立"}”分支，再选一次。`);
      beep(180, 0.15);
      updateActionDock();
      return;
    }
    codeChoice = choice;
    codeCorrect = true;
    const boothKey = pathChoice === "yes" ? "half" : "full";
    const result = {
      visitor: { ...visitor },
      expected: boothKey,
      actual: boothKey,
      correct: true,
      checks: [{
        label: "身高 < 120cm",
        value: `${visitor.height}cm`,
        result: visitor.height < 120,
        text: `身高 < 120cm｜输入：${visitor.height}cm｜${visitor.height < 120 ? "成立" : "不成立"}`
      }],
      paths: ["path-start", pathChoice === "yes" ? "path-half" : "path-full"]
    };
    lastRun.push(result);
    saved.lastRun.push(result);
    sub = "celebrate";
    celebrateTimer = 0.9;
    setMessage(`代码也选对了！${visitor.name} 成功到达${BOOTHS[boothKey].label}。`);
    beep(980, 0.12);
    spawnConfetti(BOOTHS[boothKey].x + BOOTHS[boothKey].w / 2, BOOTHS[boothKey].y);
    updateActionDock();
    save();
  }

  function finishGame() {
    const accuracy = allPathFirstTry;
    const logic = allCodeFirstTry;
    const thinking = context.evaluateThinking ? Boolean(context.evaluateThinking(context.level)) : saved.review.trim().length >= 8;
    saved.operator = "lt";
    saved.trueExit = "half";
    saved.falseExit = "full";
    saved.earned = { accuracy, logic, thinking };
    const stars = Number(accuracy) + Number(logic) + Number(thinking);
    saved.bestStars = Math.max(saved.bestStars || 0, stars);
    save();
    phase = "result";
    sub = "idle";
    updateStatus(`跑酷完成：${stars}/3 星`);
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
      <h3>${stars === 3 ? "三星通关！" : stars ? "跑酷完成" : "继续练习流程与代码"}</h3>
      <div class="star-reasons">
        ${starReason("准确星", accuracy, "每次路径选择第一次就正确")}
        ${starReason("逻辑星", logic, "每次代码分支第一次就匹配正确")}
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
      status.textContent = "请先完成一次跑酷，再提交复盘。";
      context.toast("请先完成一次跑酷，再提交通关复盘。");
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

    if (phase === "run" && sub === "awaitPath") {
      if (hitRect(x, y, PATH_BUTTONS.yes)) choosePath("yes");
      else if (hitRect(x, y, PATH_BUTTONS.no)) choosePath("no");
      return;
    }

    if (phase === "run" && sub === "awaitCode") {
      if (hitRect(x, y, CODE_BUTTONS.if)) chooseCode("if");
      else if (hitRect(x, y, CODE_BUTTONS.else)) chooseCode("else");
    }
  }

  function handleCanvasKeydown(event) {
    if (!["1", "2", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const first = event.key === "1" || event.key === "ArrowLeft";
    if (phase === "run" && sub === "awaitPath") choosePath(first ? "yes" : "no");
    else if (phase === "run" && sub === "awaitCode") chooseCode(first ? "if" : "else");
  }

  function updateActionDock() {
    const prompt = document.getElementById("level3-action-prompt");
    const pathGroup = document.querySelector('[data-level3-actions="path"]');
    const codeGroup = document.querySelector('[data-level3-actions="code"]');
    if (!prompt || !pathGroup || !codeGroup) return;
    const choosingPath = phase === "run" && sub === "awaitPath";
    const choosingCode = phase === "run" && sub === "awaitCode";
    pathGroup.classList.toggle("hidden", !choosingPath);
    codeGroup.classList.toggle("hidden", !choosingCode);
    document.querySelectorAll("[data-level3-path]").forEach(button => { button.disabled = !choosingPath; });
    document.querySelectorAll("[data-level3-code]").forEach(button => { button.disabled = !choosingCode; });
    if (choosingPath) prompt.textContent = `${visitor?.name || "游客"} ${visitor?.height || ""}cm：条件成立吗？（1=是，2=否）`;
    else if (choosingCode) prompt.textContent = `刚才的路径对应哪段代码？（1=if，2=else）`;
    else if (phase === "result") prompt.textContent = "跑酷完成，可重新开始挑战三星";
    else if (phase === "run") prompt.textContent = "游客正在移动，请观察流程图";
    else prompt.textContent = "点击“开始跑酷”进入任务";
  }

  function hitRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
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

    if (phase === "run" && visitorMoving) {
      const dx = visitorTargetX - visitorX;
      const dy = visitorTargetY - visitorY;
      const dist = Math.hypot(dx, dy);
      const speed = 230;
      if (dist < 4) {
        visitorX = visitorTargetX;
        visitorY = visitorTargetY;
        visitorMoving = false;
        if (sub === "toDiamond") {
          sub = "awaitPath";
          setMessage(`${visitor.name} 到菱形了！请选择“是 / 否”。`);
          codeHighlight = "condition";
          updateActionDock();
        } else if (sub === "toBooth") {
          sub = "awaitCode";
          setMessage(`到达${BOOTHS[pathChoice === "yes" ? "half" : "full"].label}！刚才走的是哪条代码分支？`);
          updateActionDock();
        }
      } else {
        visitorX += dx / dist * speed * dt;
        visitorY += dy / dist * speed * dt;
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
    drawBackground();
    drawFlowPaths();
    drawBooths();
    drawDiamond();
    if (phase === "run" && sub === "awaitPath") drawPathButtons();
    if (phase === "run" && sub === "awaitCode") drawCodeButtons();
    drawCodePanel();
    drawVisitor();
    drawParticles();
  }

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, 430);
    sky.addColorStop(0, "#c9e9ff");
    sky.addColorStop(0.6, "#eaf8ff");
    sky.addColorStop(1, "#d9f2d0");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 900, 430);

    // moving clouds
    const offset = (time * 18) % 100;
    drawCloud(60 + offset, 60, 0.9);
    drawCloud(420 + offset * 0.6, 95, 0.7);
    drawCloud(720 + offset * 0.4, 45, 1.1);

    ctx.fillStyle = "#9edc8f";
    ctx.fillRect(0, 330, 900, 100);
    ctx.fillStyle = "#7cc96f";
    ctx.fillRect(0, 330, 900, 8);

    // speed lines during run
    if (phase === "run") {
      ctx.strokeStyle = "rgba(255,255,255,.45)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i += 1) {
        const y = 50 + i * 55;
        const x = ((time * 120 + i * 180) % 900);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 40, y);
        ctx.stroke();
      }
    }
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

  function drawFlowPaths() {
    ctx.save();
    ctx.strokeStyle = "#6d8ca5";
    ctx.lineWidth = 5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(DIAMOND.x + 40, DIAMOND.y - 30);
    ctx.quadraticCurveTo(560, 60, BOOTHS.half.x - 10, BOOTHS.half.y + 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(DIAMOND.x + 40, DIAMOND.y + 30);
    ctx.quadraticCurveTo(560, 310, BOOTHS.full.x - 10, BOOTHS.full.y + 30);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // branch labels
    ctx.fillStyle = "#2e8b57";
    ctx.font = "bold 18px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("是", 520, 92);
    ctx.fillStyle = "#c0392b";
    ctx.fillText("否", 520, 330);
  }

  function drawDiamond() {
    const gx = DIAMOND.x;
    const gy = DIAMOND.y;
    ctx.save();
    ctx.shadowColor = "rgba(24,49,83,.25)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#fff3a8";
    ctx.strokeStyle = "#183153";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(gx, gy - 62);
    ctx.lineTo(gx + 88, gy);
    ctx.lineTo(gx, gy + 62);
    ctx.lineTo(gx - 88, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#183153";
    ctx.font = "bold 15px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("判断闸机", gx, gy - 12);
    ctx.font = "bold 14px 'Microsoft YaHei', sans-serif";
    ctx.fillText("身高<120?", gx, gy + 18);
  }

  function drawBooths() {
    Object.entries(BOOTHS).forEach(([key, booth]) => {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.18)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = booth.color;
      ctx.strokeStyle = "#183153";
      ctx.lineWidth = 4;
      roundRect(ctx, booth.x, booth.y, booth.w, booth.h, 16);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(booth.label, booth.x + booth.w / 2, booth.y + 44);
    });
  }

  function drawPathButtons() {
    Object.entries(PATH_BUTTONS).forEach(([key, btn]) => {
      const color = key === "yes" ? "#4caf6e" : "#e05a5a";
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.2)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = color;
      ctx.strokeStyle = "#183153";
      ctx.lineWidth = 3;
      roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 16);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 26px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + 38);
    });
  }

  function drawCodeButtons() {
    Object.entries(CODE_BUTTONS).forEach(([key, btn]) => {
      const active = (key === "if" && codeHighlight === "if") || (key === "else" && codeHighlight === "else");
      ctx.save();
      ctx.fillStyle = active ? "#fff3c7" : "#ffffff";
      ctx.strokeStyle = active ? "#d4a017" : "#7d9db5";
      ctx.lineWidth = active ? 4 : 2;
      roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 14);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#17324b";
      ctx.font = "bold 16px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + 34);
    });
  }

  function drawCodePanel() {
    ctx.fillStyle = "rgba(23,50,75,.88)";
    roundRect(ctx, 20, 340, 860, 82, 16);
    ctx.fill();

    const lines = [
      { text: "if height < 120:", key: "condition" },
      { text: "    ticket = \"半价票\"", key: "if" },
      { text: "else:", key: "else" },
      { text: "    ticket = \"全价票\"", key: "else" }
    ];

    ctx.font = "bold 14px Consolas, 'Courier New', monospace";
    ctx.textAlign = "left";
    lines.forEach((line, i) => {
      const y = 364 + i * 18;
      const active = codeHighlight === line.key && (phase === "run" || phase === "result");
      if (active) {
        ctx.fillStyle = "rgba(255,255,255,.16)";
        roundRect(ctx, 28, y - 13, 300, 18, 5);
        ctx.fill();
      }
      ctx.fillStyle = active ? "#ffe066" : "#cfe4f2";
      ctx.fillText(line.text, 34, y);
    });
  }

  function drawVisitor() {
    if (!visitor || phase === "idle" || phase === "result") return;
    const bounce = visitorMoving ? Math.sin(time * 12) * 3 : 0;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.2)";
    ctx.shadowBlur = 8;
    ctx.font = "42px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(visitor.icon || "🧒", visitorX, visitorY - 18 + bounce);
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,.9)";
    roundRect(ctx, visitorX - 38, visitorY - 52, 76, 22, 11);
    ctx.fill();
    ctx.fillStyle = "#17324b";
    ctx.font = "bold 12px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${visitor.name} ${visitor.height}cm`, visitorX, visitorY - 37);
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
    for (let i = 0; i < 20; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200;
      particles.push({
        x,
        y: y + 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        size: 4 + Math.random() * 5,
        color: colors[i % colors.length],
        life: 0.6 + Math.random() * 0.5,
        maxLife: 1.1
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

  window.Level3Canvas = {
    render,
    attach
  };
})();
