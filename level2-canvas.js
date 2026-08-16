(function () {
  const START = { x: 70, y: 180 };
  const DIAMOND = { x: 450, y: 180 };
  const CHIP_SLOT = { x: 350, y: 150, w: 200, h: 48 };
  const PORTS = {
    yes: { x: 385, y: 224, label: "是" },
    no: { x: 515, y: 224, label: "否" }
  };
  const BOOTHS = {
    half: { label: "半价票口", color: "#ff9b54", dark: "#d97a2f", x: 110, y: 270, w: 160, h: 78 },
    full: { label: "全价票口", color: "#29a4d9", dark: "#1877a8", x: 630, y: 270, w: 160, h: 78 }
  };
  const CHIP_OPTIONS = [
    { id: "lt", label: "身高 < 120cm", x: 110, y: 360, w: 230, h: 58 },
    { id: "lte", label: "身高 ≤ 120cm", x: 560, y: 360, w: 230, h: 58 }
  ];

  let context = null;
  let saved = null;
  let canvas = null;
  let ctx = null;
  let rafId = 0;
  let lastTime = 0;
  let time = 0;

  let phase = "idle"; // idle | build | ready | test | result
  let sub = "idle"; // toDiamond | toBooth | celebrate
  let installed = { chip: null, yes: null, no: null };
  let drag = null;
  let everWrong = false;
  let readyTimer = 0;
  let visitorIndex = 0;
  let visitor = null;
  let visitorX = START.x;
  let visitorY = START.y;
  let visitorMoving = false;
  let visitorTargetX = START.x;
  let visitorTargetY = START.y;
  let celebrateTimer = 0;
  let shakeTimer = 0;
  let shakePower = 0;
  let particles = [];
  let lastRun = [];
  let message = "";
  let statusText = "";
  let resultInfo = null;
  let fullscreenHandler = null;

  function render(mission, savedState, state) {
    saved = savedState;
    return `
      <section class="ticket-game level2-game" data-game-level="2">
        <div class="game-story">
          <div>
            <span class="game-label">智慧乐园闸机大作战 · 第 2 关</span>
            <h3>${escape(mission.title)}</h3>
            <p>${escape(mission.story)} 这次要用拖拽的方式，把芯片和“是/否”管道接通。</p>
          </div>
          <div class="mission-stars" aria-label="本关最佳星级">${starMarkup(savedState.bestStars || 0)}</div>
        </div>

        <div class="game-layout">
          <aside class="visitor-queue">
            <div class="panel-title"><span>1</span> 游客队列</div>
            ${mission.visitors.map((item, index) => queueCard(item, index)).join("")}
          </aside>

          <div class="track-board level2-track">
            <canvas id="level2-canvas" width="900" height="430" aria-label="智慧乐园拖拽接线游戏：把条件芯片拖到菱形上，再把是/否管道拖到票口"></canvas>
            <div class="level2-start-overlay" id="level2-start-overlay">
              <button class="primary-button game-run" id="game-run">▶ 开始接线</button>
            </div>
            <div class="level2-ready-overlay hidden" id="level2-ready-overlay">
              <button class="primary-button" id="level2-run-test">▶ 运行测试</button>
              <button class="secondary-button" id="level2-edit">修改线路</button>
            </div>
            <div class="level1-canvas-tip">🖱 拖拽接线；触屏或键盘可用下方点按按钮</div>
            <div class="track-message" id="track-message">点击“开始接线”，把闸机线路接通。</div>
            <div class="canvas-action-dock" id="level2-action-dock" aria-label="接线游戏辅助操作">
              <span id="level2-action-prompt">开始后可拖拽，也可依次点按接线</span>
              <div class="canvas-action-group">
                <button type="button" class="chip-button" data-level2-action="chip" disabled>安装 &lt;120 芯片</button>
                <button type="button" class="chip-button" data-level2-action="yes" disabled>“是”→半价</button>
                <button type="button" class="chip-button" data-level2-action="no" disabled>“否”→全价</button>
              </div>
            </div>
          </div>

          <aside class="gate-console level2-console">
            <div class="panel-title"><span>2</span> 接线说明</div>
            <ul class="level1-rules">
              <li><b>1.</b> 把“身高 < 120cm”芯片拖到菱形上。</li>
              <li><b>2.</b> 从“是”口拖到半价票口。</li>
              <li><b>3.</b> 从“否”口拖到全价票口。</li>
              <li><b>规则：</b>身高 < 120cm → 半价；否则 → 全价。</li>
            </ul>
            <div class="level1-status" id="level2-status" aria-live="polite">等待开始</div>
          </aside>
        </div>

        <div class="game-controls">
          <button class="secondary-button" id="game-reset">重新接线</button>
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
    canvas = document.getElementById("level2-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    phase = "idle";
    sub = "idle";
    installed = { chip: null, yes: null, no: null };
    drag = null;
    everWrong = false;
    readyTimer = 0;
    visitorIndex = 0;
    visitor = null;
    visitorX = START.x;
    visitorY = START.y;
    visitorMoving = false;
    visitorTargetX = START.x;
    visitorTargetY = START.y;
    celebrateTimer = 0;
    shakeTimer = 0;
    particles = [];
    lastRun = [];
    resultInfo = null;
    statusText = "等待开始";
    updateStatus(statusText);

    canvas.tabIndex = 0;
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", cancelPointerDrag);
    canvas.addEventListener("keydown", handleCanvasKeydown);

    document.querySelectorAll("[data-level2-action]").forEach(button => button.addEventListener("click", () => {
      applyAccessibleConnection(button.dataset.level2Action);
    }));

    document.getElementById("game-run").addEventListener("click", startBuild);
    document.getElementById("level2-run-test").addEventListener("click", startTest);
    document.getElementById("level2-edit").addEventListener("click", () => {
      phase = "build";
      document.getElementById("level2-ready-overlay").classList.add("hidden");
      setMessage("可以继续修改线路，改完后再运行测试。");
      updateStatus(`已安装 ${Object.values(installed).filter(Boolean).length}/3`);
      updateActionDock();
    });
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
    const el = document.getElementById("level2-status");
    if (el) el.textContent = text;
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

  function startBuild() {
    if (phase === "build" || phase === "ready" || phase === "test") return;
    phase = "build";
    sub = "idle";
    installed = { chip: null, yes: null, no: null };
    drag = null;
    everWrong = false;
    readyTimer = 0;
    visitorIndex = 0;
    visitor = null;
    visitorX = START.x;
    visitorY = START.y;
    visitorMoving = false;
    visitorTargetX = START.x;
    visitorTargetY = START.y;
    particles = [];
    lastRun = [];
    resultInfo = null;
    saved.attempts = Number(saved.attempts || 0) + 1;
    saved.lastRun = [];
    document.getElementById("level2-start-overlay").classList.add("hidden");
    document.getElementById("level2-ready-overlay").classList.add("hidden");
    const result = document.getElementById("game-result");
    if (result) result.classList.add("hidden");
    setMessage("把“身高 < 120cm”芯片拖到菱形上，再把“是/否”管道拖到票口。");
    updateStatus("第一步：拖入条件芯片");
    updateActionDock();
    save();
  }

  function resetGame() {
    phase = "idle";
    sub = "idle";
    installed = { chip: null, yes: null, no: null };
    drag = null;
    everWrong = false;
    readyTimer = 0;
    visitorIndex = 0;
    visitor = null;
    visitorX = START.x;
    visitorY = START.y;
    visitorMoving = false;
    visitorTargetX = START.x;
    visitorTargetY = START.y;
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
    document.getElementById("level2-start-overlay").classList.remove("hidden");
    document.getElementById("level2-ready-overlay").classList.add("hidden");
    setMessage("点击“开始接线”，把闸机线路接通。");
    updateStatus("等待开始");
    updateActionDock();
    save();
  }

  function allInstalled() {
    return installed.chip && installed.yes && installed.no;
  }

  function allCorrect() {
    return installed.chip === "lt" && installed.yes === "half" && installed.no === "full";
  }

  function onPointerDown(event) {
    if (phase !== "build" && phase !== "ready") return;
    event.preventDefault();
    canvas.setPointerCapture?.(event.pointerId);
    if (phase === "ready") {
      phase = "build";
      document.getElementById("level2-ready-overlay").classList.add("hidden");
    }
    const pos = getPos(event);
    const chip = hitChip(pos);
    if (chip) {
      drag = { type: "chip", id: chip.id, x: pos.x, y: pos.y };
      return;
    }
    if (!installed.yes && hitPort(pos, "yes")) {
      drag = { type: "yes", x: pos.x, y: pos.y };
      return;
    }
    if (!installed.no && hitPort(pos, "no")) {
      drag = { type: "no", x: pos.x, y: pos.y };
      return;
    }
    // Allow re-drag from installed port to fix
    if (installed.yes && hitPort(pos, "yes")) {
      installed.yes = null;
      drag = { type: "yes", x: pos.x, y: pos.y };
      return;
    }
    if (installed.no && hitPort(pos, "no")) {
      installed.no = null;
      drag = { type: "no", x: pos.x, y: pos.y };
      return;
    }
  }

  function onPointerMove(event) {
    if (!drag) return;
    event.preventDefault();
    const pos = getPos(event);
    drag.x = pos.x;
    drag.y = pos.y;
  }

  function onPointerUp(event) {
    if (!drag) return;
    event.preventDefault();
    const pos = getPos(event);
    const currentDrag = drag;
    drag = null;
    canvas.releasePointerCapture?.(event.pointerId);

    if (currentDrag.type === "chip") {
      if (pos.x >= CHIP_SLOT.x && pos.x <= CHIP_SLOT.x + CHIP_SLOT.w &&
          pos.y >= CHIP_SLOT.y && pos.y <= CHIP_SLOT.y + CHIP_SLOT.h) {
        if (installed.chip && installed.chip !== currentDrag.id) everWrong = true;
        installed.chip = currentDrag.id;
        if (currentDrag.id !== "lt") everWrong = true;
        setMessage(installed.chip === "lt" ? "芯片装好了！再把“是/否”管道拖到票口。" : "这个芯片不太对，再试试“身高 < 120cm”。");
        updateStatus(`已安装 ${Object.values(installed).filter(Boolean).length}/3`);
      }
    } else {
      const boothKey = hitBooth(pos);
      if (boothKey) {
        const correct = currentDrag.type === "yes" ? boothKey === "half" : boothKey === "full";
        if (!correct) everWrong = true;
        installed[currentDrag.type] = boothKey;
        setMessage(correct
          ? `“${currentDrag.type === "yes" ? "是" : "否"}”管道接好了！`
          : `“${currentDrag.type === "yes" ? "是" : "否"}”应该接到${currentDrag.type === "yes" ? "半价票口" : "全价票口"}。`);
        updateStatus(`已安装 ${Object.values(installed).filter(Boolean).length}/3`);
      }
    }

    updateReadyState();
    updateActionDock();
    save();
  }

  function cancelPointerDrag(event) {
    drag = null;
    if (event?.pointerId !== undefined) canvas.releasePointerCapture?.(event.pointerId);
  }

  function updateReadyState() {
    if (!allInstalled()) return;
    phase = "ready";
    document.getElementById("level2-ready-overlay").classList.remove("hidden");
    setMessage(allCorrect() ? "线路全部正确！点击“运行测试”看看游客。" : "线路已经接满，但还有不对的地方。先运行测试看看结果，也可以继续修改。");
    updateStatus(allCorrect() ? "线路正确，可以测试" : "线路已满，建议先测试再修改");
  }

  function applyAccessibleConnection(action) {
    if (phase === "idle" || phase === "result") startBuild();
    if (phase === "test") return;
    if (phase === "ready") {
      phase = "build";
      document.getElementById("level2-ready-overlay").classList.add("hidden");
    }
    if (action === "chip") {
      installed.chip = "lt";
      setMessage("已安装“身高 < 120cm”芯片，继续连接是/否管道。");
    } else if (action === "yes") {
      installed.yes = "half";
      setMessage("已连接：“是”→半价票口。");
    } else if (action === "no") {
      installed.no = "full";
      setMessage("已连接：“否”→全价票口。");
    }
    updateStatus(`已安装 ${Object.values(installed).filter(Boolean).length}/3`);
    updateReadyState();
    updateActionDock();
    save();
  }

  function handleCanvasKeydown(event) {
    const action = { "1": "chip", "2": "yes", "3": "no" }[event.key];
    if (!action) return;
    event.preventDefault();
    applyAccessibleConnection(action);
  }

  function updateActionDock() {
    const prompt = document.getElementById("level2-action-prompt");
    const buttons = document.querySelectorAll("[data-level2-action]");
    if (!prompt) return;
    const editable = phase === "build" || phase === "ready";
    buttons.forEach(button => {
      const action = button.dataset.level2Action;
      const alreadyInstalled = action === "chip" ? installed.chip === "lt" :
        action === "yes" ? installed.yes === "half" : installed.no === "full";
      button.disabled = !editable || alreadyInstalled;
      button.classList.toggle("selected", alreadyInstalled);
    });
    if (phase === "idle") prompt.textContent = "点击“开始接线”，再拖拽或按 1 / 2 / 3";
    else if (phase === "test") prompt.textContent = "正在运行游客测试，请观察120cm边界案例";
    else if (phase === "result") prompt.textContent = "测试完成，可重新接线继续调试";
    else prompt.textContent = `接线进度 ${Object.values(installed).filter(Boolean).length}/3（键盘 1 / 2 / 3）`;
  }

  function getPos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function hitChip(pos) {
    for (const chip of CHIP_OPTIONS) {
      if (pos.x >= chip.x && pos.x <= chip.x + chip.w && pos.y >= chip.y && pos.y <= chip.y + chip.h) {
        return chip;
      }
    }
    return null;
  }

  function hitPort(pos, key) {
    const port = PORTS[key];
    return Math.hypot(pos.x - port.x, pos.y - port.y) < 30;
  }

  function hitBooth(pos) {
    for (const [key, booth] of Object.entries(BOOTHS)) {
      if (pos.x >= booth.x && pos.x <= booth.x + booth.w && pos.y >= booth.y && pos.y <= booth.y + booth.h) {
        return key;
      }
    }
    return null;
  }

  function startTest() {
    if (phase !== "ready") return;
    phase = "test";
    sub = "idle";
    visitorIndex = 0;
    readyTimer = 0;
    document.getElementById("level2-ready-overlay").classList.add("hidden");
    setMessage("测试开始！游客正在通过闸机……");
    updateStatus("测试中");
    updateActionDock();
    nextVisitor();
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
    visitorTargetX = DIAMOND.x - 50;
    visitorTargetY = DIAMOND.y;
    sub = "toDiamond";
    markActiveVisitor(visitorIndex);
    setMessage(`${visitor.name} 来了：身高 ${visitor.height}cm，正在通过闸机。`);
  }

  function choosePathFromInstalled(visitor) {
    const condition = installed.chip === "lte" ? visitor.height <= 120 : visitor.height < 120;
    const actual = condition ? installed.yes : installed.no;
    const expected = visitor.height < 120 ? "half" : "full";
    return { actual, expected, correct: actual === expected, condition };
  }

  function finishGame() {
    const logic = allCorrect();
    const accuracy = lastRun.every(item => item.correct);
    const thinking = context.evaluateThinking ? Boolean(context.evaluateThinking(context.level)) : saved.review.trim().length >= 8;
    saved.operator = installed.chip || "lt";
    saved.trueExit = installed.yes || "half";
    saved.falseExit = installed.no || "full";
    saved.earned = { accuracy, logic, thinking };
    const stars = Number(accuracy) + Number(logic) + Number(thinking);
    saved.bestStars = Math.max(saved.bestStars || 0, stars);
    save();
    phase = "result";
    sub = "idle";
    updateStatus(`测试完成：${stars}/3 星`);
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
      <h3>${stars === 3 ? "三星通关！" : stars ? "闸机接线完成" : "继续检查线路"}</h3>
      <div class="star-reasons">
        ${starReason("准确星", accuracy, "所有游客都进入正确票口")}
        ${starReason("逻辑星", logic, "最终芯片与是/否管道连接正确")}
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

    if (phase === "test" && visitorMoving) {
      const targetX = sub === "toDiamond" ? DIAMOND.x - 50 : visitorTargetX;
      const targetY = sub === "toDiamond" ? DIAMOND.y : visitorTargetY;
      const speed = 220;
      const dx = targetX - visitorX;
      const dy = targetY - visitorY;
      const dist = Math.hypot(dx, dy);
      if (dist < 3) {
        visitorX = targetX;
        visitorY = targetY;
        visitorMoving = false;
        if (sub === "toDiamond") {
          const result = choosePathFromInstalled(visitor);
          const boothKey = result.actual;
          lastRun.push({
            visitor: { ...visitor },
            expected: result.expected,
            actual: result.actual,
            correct: result.correct,
            checks: [{ label: "身高 < 120cm", value: `${visitor.height}cm`, result: result.condition, text: `身高 < 120cm｜输入：${visitor.height}cm｜${result.condition ? "成立" : "不成立"}` }],
            paths: ["path-start", boothKey === "half" ? "path-half" : "path-full"]
          });
          saved.lastRun.push(lastRun[lastRun.length - 1]);
          visitorTargetX = BOOTHS[boothKey].x + BOOTHS[boothKey].w / 2;
          visitorTargetY = BOOTHS[boothKey].y + BOOTHS[boothKey].h / 2;
          sub = "toBooth";
          visitorMoving = true;
          if (!result.correct) {
            setMessage(`${visitor.name} 去了${BOOTHS[boothKey].label}，但应该去${BOOTHS[result.expected].label}。线路还需要检查。`);
            beep(180, 0.15);
          } else {
            setMessage(`${visitor.name} 正确到达${BOOTHS[boothKey].label}！`);
            beep(820, 0.1);
            spawnConfetti(BOOTHS[boothKey].x + BOOTHS[boothKey].w / 2, BOOTHS[boothKey].y);
          }
          save();
        } else if (sub === "toBooth") {
          sub = "celebrate";
          celebrateTimer = 0.7;
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
    // Keep connected pipes behind the node and booths so they never cover
    // labels or the draggable connection points.
    drawConnections();
    drawMachine();
    drawChipOptions();
    drawVisitor();
    drawParticles();
  }

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, 430);
    sky.addColorStop(0, "#bfe9ff");
    sky.addColorStop(0.65, "#e8f8ff");
    sky.addColorStop(1, "#d9f2d0");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 900, 430);

    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.arc(790, 60, 34, 0, Math.PI * 2);
    ctx.fill();

    drawCloud(120, 50, 0.8);
    drawCloud(430, 90, 0.65);
    drawCloud(680, 40, 1);

    ctx.fillStyle = "#9edc8f";
    ctx.fillRect(0, 320, 900, 110);
    ctx.fillStyle = "#7cc96f";
    ctx.fillRect(0, 320, 900, 8);
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

  function drawMachine() {
    // start
    ctx.fillStyle = "#ffd447";
    ctx.strokeStyle = "#183153";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(START.x, START.y, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#183153";
    ctx.font = "bold 14px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("入口", START.x, START.y + 4);

    // diamond
    ctx.save();
    ctx.shadowColor = "rgba(24,49,83,.25)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#fff3a8";
    ctx.strokeStyle = "#183153";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(DIAMOND.x, DIAMOND.y - 70);
    ctx.lineTo(DIAMOND.x + 95, DIAMOND.y);
    ctx.lineTo(DIAMOND.x, DIAMOND.y + 70);
    ctx.lineTo(DIAMOND.x - 95, DIAMOND.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // chip slot
    ctx.save();
    ctx.fillStyle = installed.chip ? "#ffffff" : "rgba(255,255,255,.55)";
    ctx.strokeStyle = installed.chip ? "#4caf6e" : "#a7c3d6";
    ctx.lineWidth = 3;
    ctx.setLineDash(installed.chip ? [] : [5, 4]);
    roundRect(ctx, CHIP_SLOT.x, CHIP_SLOT.y, CHIP_SLOT.w, CHIP_SLOT.h, 12);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#60758c";
    ctx.font = "12px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(installed.chip ? (installed.chip === "lt" ? "身高 < 120cm" : "身高 ≤ 120cm") : "把芯片拖到这里", CHIP_SLOT.x + CHIP_SLOT.w / 2, CHIP_SLOT.y + 29);
    ctx.restore();

    ctx.fillStyle = "#183153";
    ctx.font = "bold 15px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("判断闸机", DIAMOND.x, DIAMOND.y - 43);

    // ports
    Object.entries(PORTS).forEach(([key, port]) => {
      const color = key === "yes" ? "#4caf6e" : "#e05a5a";
      ctx.fillStyle = color;
      ctx.strokeStyle = "#183153";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(port.x, port.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 15px 'Microsoft YaHei', sans-serif";
      ctx.fillText(port.label, port.x, port.y + 5);
    });

    // booths
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
      ctx.fillText(booth.label, booth.x + booth.w / 2, booth.y + 46);
    });
  }

  function drawConnections() {
    if (installed.yes) drawPipe(PORTS.yes, BOOTHS[installed.yes], "#4caf6e");
    if (installed.no) drawPipe(PORTS.no, BOOTHS[installed.no], "#e05a5a");
    if (drag) {
      const color = drag.type === "chip" ? "#d4a017" : (drag.type === "yes" ? "#4caf6e" : "#e05a5a");
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      if (drag.type === "chip") {
        ctx.moveTo(drag.x, drag.y);
        ctx.lineTo(CHIP_SLOT.x + CHIP_SLOT.w / 2, CHIP_SLOT.y + CHIP_SLOT.h / 2);
      } else {
        ctx.moveTo(PORTS[drag.type].x, PORTS[drag.type].y);
        ctx.lineTo(drag.x, drag.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  function drawPipe(from, booth, color) {
    const to = { x: booth.x + booth.w / 2, y: booth.y + booth.h / 2 };
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.bezierCurveTo(from.x, from.y + 48, to.x, to.y - 48, to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawChipOptions() {
    CHIP_OPTIONS.forEach(chip => {
      const active = installed.chip === chip.id;
      ctx.save();
      ctx.fillStyle = active ? "#ffe9c7" : (chip.id === "lt" ? "#e8f7ea" : "#fff0e8");
      ctx.strokeStyle = active ? "#d4a017" : (chip.id === "lt" ? "#4caf6e" : "#e08a5a");
      ctx.lineWidth = active ? 4 : 2;
      roundRect(ctx, chip.x, chip.y, chip.w, chip.h, 14);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#17324b";
      ctx.font = "bold 16px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(chip.label, chip.x + chip.w / 2, chip.y + 36);
    });
    ctx.fillStyle = "#60758c";
    ctx.font = "13px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("↑ 拖到上方芯片槽", 450, 394);
  }

  function drawVisitor() {
    if (!visitor || phase === "idle" || phase === "result" || phase === "build" || phase === "ready") return;
    const bounce = visitorMoving ? Math.sin(time * 12) * 3 : 0;
    const y = visitorY + bounce;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.2)";
    ctx.shadowBlur = 8;
    ctx.font = "42px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(visitor.icon || "🧒", visitorX, y - 20);
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,.9)";
    roundRect(ctx, visitorX - 38, y - 56, 76, 22, 11);
    ctx.fill();
    ctx.fillStyle = "#17324b";
    ctx.font = "bold 12px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${visitor.name} ${visitor.height}cm`, visitorX, y - 40);
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

  window.Level2Canvas = {
    render,
    attach
  };
})();
