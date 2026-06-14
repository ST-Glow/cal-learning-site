(function () {
  const tickets = {
    half: { label: "半价票", color: "#ff9b54", x: 120, y: 345 },
    student: { label: "学生票", color: "#7567e8", x: 450, y: 345 },
    full: { label: "全价票", color: "#29a4d9", x: 780, y: 345 },
    custom: { label: "创意票", color: "#71bb48", x: 450, y: 345 }
  };

  const missions = [
    {
      title: "认识售票规则",
      story: "先观察游客信息，再设置闸机，让两辆小车驶入正确票口。",
      visitors: [
        { name: "妹妹", icon: "👧", height: 116, student: false },
        { name: "小明", icon: "👦", height: 138, student: false }
      ],
      type: "single",
      review: "闸机根据什么信息选择轨道？"
    },
    {
      title: "安装身高闸机",
      story: "为闸机安装正确的条件芯片，并设置“是”和“否”的出口。",
      visitors: [
        { name: "乐乐", icon: "🧒", height: 112, student: false },
        { name: "安安", icon: "👦", height: 145, student: false }
      ],
      type: "single",
      review: "为什么菱形必须有“是/否”两条路径？"
    },
    {
      title: "智能闸机联动",
      story: "先预测游客去向，再启动队列，观察流程与代码同步执行。",
      visitors: [
        { name: "小雨", icon: "👧", height: 116, student: false },
        { name: "冬冬", icon: "👦", height: 120, student: false },
        { name: "小明", icon: "🧒", height: 138, student: false }
      ],
      type: "single",
      code: true,
      review: "流程图菱形与代码 if 有什么关系？"
    },
    {
      title: "边界值故障排查",
      story: "119、120、121cm 三位游客来测试闸机，找出正确的条件芯片。",
      visitors: [
        { name: "119号", icon: "🧒", height: 119, student: false },
        { name: "120号", icon: "👧", height: 120, student: false },
        { name: "121号", icon: "👦", height: 121, student: false }
      ],
      type: "boundary",
      review: "为什么必须测试 120cm？"
    },
    {
      title: "学生票双重闸机",
      story: "安装两座判断闸机，让半价规则优先，再判断学生证。",
      visitors: [
        { name: "妹妹", icon: "👧", height: 116, student: true },
        { name: "小明", icon: "👦", height: 138, student: true },
        { name: "叔叔", icon: "🧑", height: 176, student: false },
        { name: "小雨", icon: "🧒", height: 120, student: true }
      ],
      type: "nested",
      review: "为什么先判断身高，再判断学生证？"
    },
    {
      title: "设计我的智慧票站",
      story: "增加一种原创优惠规则，配置闸机并完成至少三组游客测试。",
      visitors: [
        { name: "奶奶", icon: "👵", height: 158, student: false, age: 66, family: false, group: false },
        { name: "小队长", icon: "🧒", height: 135, student: true, age: 11, family: false, group: true },
        { name: "一家人", icon: "👨‍👩‍👧", height: 170, student: false, age: 38, family: true, group: false }
      ],
      type: "custom",
      review: "你的新优惠规则为什么公平？"
    }
  ];

  let context = null;
  let runtime = { paused: false, stopped: false, running: false, stepResolve: null };
  let runToken = 0;
  let audioContext = null;

  function defaultMissionState(level) {
    return {
      operator: "",
      trueExit: "",
      falseExit: "",
      order: "",
      customRule: "",
      review: "",
      predictions: {},
      bestStars: 0,
      earned: { accuracy: false, logic: false, thinking: false },
      attempts: 0,
      lastRun: []
    };
  }

  function ensureGameState(state) {
    if (!state.game) state.game = { muted: false, reduceMotion: false, missions: {} };
    if (!state.game.missions) state.game.missions = {};
    for (let level = 1; level <= 6; level += 1) {
      state.game.missions[level] = {
        ...defaultMissionState(level),
        ...(state.game.missions[level] || {}),
        earned: {
          accuracy: false,
          logic: false,
          thinking: false,
          ...(state.game.missions[level]?.earned || {})
        }
      };
    }
    return state.game;
  }

  function render(level, state) {
    ensureGameState(state);
    const mission = missions[level - 1];
    const saved = state.game.missions[level];
    const ticketSet = mission.type === "nested" ? ["half", "student", "full"] :
      mission.type === "custom" ? ["half", "custom", "full"] : ["half", "full"];

    return `
      <section class="ticket-game" data-game-level="${level}">
        <div class="game-story">
          <div>
            <span class="game-label">智慧乐园闸机大作战 · 第 ${level} 关</span>
            <h3>${mission.title}</h3>
            <p>${mission.story}</p>
          </div>
          <div class="mission-stars" aria-label="本关最佳星级">${starMarkup(saved.bestStars)}</div>
        </div>

        <div class="game-layout">
          <aside class="visitor-queue">
            <div class="panel-title"><span>1</span> 游客队列</div>
            ${mission.visitors.map((visitor, index) => visitorCard(visitor, index, saved, level)).join("")}
          </aside>

          <div class="track-board">
            ${trackSvg(mission, ticketSet)}
            ${mission.code ? `
              <div class="live-code" aria-label="同步执行代码">
                <span data-live-code="condition">if height &lt; 120:</span>
                <span data-live-code="true">&nbsp;&nbsp;ticket = "半价票"</span>
                <span data-live-code="false">else:</span>
                <span data-live-code="false">&nbsp;&nbsp;ticket = "全价票"</span>
              </div>` : ""}
            <div class="game-car hidden" id="game-car"><span id="game-car-icon">🧒</span></div>
            <div class="gate-bubble hidden" id="gate-bubble"></div>
            <div class="track-message" id="track-message">先在右侧配置闸机，再启动游客队列。</div>
          </div>

          <aside class="gate-console">
            <div class="panel-title"><span>2</span> 闸机控制台</div>
            ${gateControls(mission, saved, level)}
            <div class="game-settings">
              <label><input type="checkbox" id="game-muted" ${state.game.muted ? "checked" : ""}> 静音</label>
              <label><input type="checkbox" id="game-reduce-motion" ${state.game.reduceMotion ? "checked" : ""}> 减少动画</label>
            </div>
          </aside>
        </div>

        <div class="game-controls">
          <button class="primary-button game-run" id="game-run">▶ 启动闸机</button>
          <button class="secondary-button" id="game-pause" disabled>Ⅱ 暂停</button>
          <button class="secondary-button" id="game-step" disabled>单步运行</button>
          <button class="secondary-button" id="game-replay" ${saved.lastRun.length ? "" : "disabled"}>↺ 回放路径</button>
          <button class="secondary-button" id="game-reset">重新配置</button>
        </div>

        <div class="game-review">
          <div>
            <span class="panel-title"><span>3</span> 通关复盘</span>
            <p>${mission.review}</p>
            <textarea id="game-review-text" rows="2" placeholder="写下你的发现，获得思考星">${escape(saved.review)}</textarea>
          </div>
          <div class="review-map">
            ${reviewMarkup(mission, saved)}
          </div>
        </div>

        <div class="game-result hidden" id="game-result" aria-live="polite"></div>
      </section>`;
  }

  function visitorCard(visitor, index, saved, level) {
    const prediction = saved.predictions[index] || "";
    const predictionOptions = level === 5
      ? [["half", "半价"], ["student", "学生"], ["full", "全价"]]
      : level === 6
        ? [["half", "半价"], ["custom", "创意"], ["full", "全价"]]
        : [["half", "半价"], ["full", "全价"]];
    return `
      <article class="queue-card" data-visitor-card="${index}">
        <span class="queue-number">${index + 1}</span>
        <span class="queue-avatar">${visitor.icon}</span>
        <div><strong>${visitor.name}</strong><small>${visitor.height}cm${visitor.student ? " · 有学生证" : ""}${visitor.age ? ` · ${visitor.age}岁` : ""}</small></div>
        ${level === 3 ? `<div class="prediction-chips">${predictionOptions.map(([value, label]) =>
          `<button type="button" class="${prediction === value ? "selected" : ""}" data-game-prediction="${index}" data-value="${value}">${label}</button>`).join("")}</div>` : ""}
      </article>`;
  }

  function gateControls(mission, saved, level) {
    const operatorOptions = mission.type === "boundary"
      ? [["", "选择条件芯片"], ["lt", "身高 < 120cm"], ["lte", "身高 ≤ 120cm"]]
      : [["", "选择判断条件"], ["lt", "身高 < 120cm"], ["lte", "身高 ≤ 120cm"]];
    if (mission.type === "nested") {
      return `
        <label>闸机顺序
          <select id="game-order">
            <option value="">选择先后顺序</option>
            <option value="height-first" ${saved.order === "height-first" ? "selected" : ""}>先身高，后学生证</option>
            <option value="student-first" ${saved.order === "student-first" ? "selected" : ""}>先学生证，后身高</option>
          </select>
        </label>
        <div class="gate-rule-preview"><b>闸机 A</b><span>身高 &lt; 120cm？</span><b>闸机 B</b><span>持有学生证？</span></div>`;
    }
    if (mission.type === "custom") {
      return `
        <label>新增优惠规则
          <select id="game-custom-rule">
            <option value="">选择一种优惠</option>
            <option value="elder" ${saved.customRule === "elder" ? "selected" : ""}>60岁及以上 → 老人优惠票</option>
            <option value="family" ${saved.customRule === "family" ? "selected" : ""}>家庭同行 → 家庭优惠票</option>
            <option value="group" ${saved.customRule === "group" ? "selected" : ""}>团体游客 → 团体优惠票</option>
          </select>
        </label>
        <label>判断顺序
          <select id="game-order">
            <option value="">选择先后顺序</option>
            <option value="height-first" ${saved.order === "height-first" ? "selected" : ""}>先身高，再新增优惠</option>
            <option value="custom-first" ${saved.order === "custom-first" ? "selected" : ""}>先新增优惠，再身高</option>
          </select>
        </label>`;
    }
    return `
      <label>判断条件
        <select id="game-operator">${operatorOptions.map(([value, label]) =>
          `<option value="${value}" ${saved.operator === value ? "selected" : ""}>${label}</option>`).join("")}</select>
      </label>
      <label>条件成立（是）
        <select id="game-true-exit">
          <option value="">选择票口</option>
          <option value="half" ${saved.trueExit === "half" ? "selected" : ""}>半价票口</option>
          <option value="full" ${saved.trueExit === "full" ? "selected" : ""}>全价票口</option>
        </select>
      </label>
      <label>条件不成立（否）
        <select id="game-false-exit">
          <option value="">选择票口</option>
          <option value="half" ${saved.falseExit === "half" ? "selected" : ""}>半价票口</option>
          <option value="full" ${saved.falseExit === "full" ? "selected" : ""}>全价票口</option>
        </select>
      </label>`;
  }

  function trackSvg(mission, ticketSet) {
    const nested = mission.type === "nested" || mission.type === "custom";
    return `
      <svg class="ticket-track" viewBox="0 0 900 430" role="img" aria-label="智慧乐园售票闸机轨道">
        <defs>
          <filter id="track-shadow"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-opacity=".18"/></filter>
          <marker id="track-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#6d8ca5"/></marker>
        </defs>
        <rect x="12" y="12" width="876" height="406" rx="26" fill="#eaf8ff" stroke="#7eb9df" stroke-width="4"/>
        <circle cx="70" cy="205" r="34" fill="#ffd447" stroke="#183153" stroke-width="4"/>
        <text x="70" y="211" text-anchor="middle" class="svg-label">出发</text>
        <path id="path-start" class="track-line" d="M104 205 C180 205 215 205 280 205"/>
        <g class="svg-gate" filter="url(#track-shadow)">
          <polygon points="350,145 420,205 350,265 280,205" fill="#fff3a8" stroke="#183153" stroke-width="4"/>
          <text x="350" y="196" text-anchor="middle" class="svg-gate-title">判断闸机 A</text>
          <text x="350" y="218" text-anchor="middle" class="svg-gate-condition">${nested ? "身高条件" : "条件芯片"}</text>
        </g>
        <path id="path-half" class="track-line" d="M350 265 C340 315 230 330 150 345"/>
        ${nested ? `
          <path id="path-second" class="track-line" d="M420 205 C475 205 500 205 535 205"/>
          <g class="svg-gate" filter="url(#track-shadow)">
            <polygon points="605,145 675,205 605,265 535,205" fill="#e8e4ff" stroke="#183153" stroke-width="4"/>
            <text x="605" y="196" text-anchor="middle" class="svg-gate-title">判断闸机 B</text>
            <text x="605" y="218" text-anchor="middle" class="svg-gate-condition">${mission.type === "custom" ? "新增优惠" : "学生证"}</text>
          </g>
          <path id="path-student" class="track-line" d="M605 265 C590 315 520 330 450 345"/>
          <path id="path-full" class="track-line" d="M675 205 C745 215 770 275 780 345"/>
        ` : `<path id="path-full" class="track-line" d="M420 205 C550 205 680 285 780 345"/>`}
        ${ticketSet.map(key => ticketStation(key)).join("")}
      </svg>`;
  }

  function ticketStation(key) {
    const ticket = tickets[key];
    return `
      <g class="ticket-station" data-station="${key}" transform="translate(${ticket.x - 62} ${ticket.y - 28})">
        <rect width="124" height="58" rx="15" fill="${ticket.color}" stroke="#183153" stroke-width="4"/>
        <text x="62" y="35" text-anchor="middle" class="station-label">${ticket.label}</text>
      </g>`;
  }

  function reviewMarkup(mission, saved) {
    if (mission.type === "nested") {
      return `<code>如果 身高 &lt; 120：半价票<br>否则，如果 有学生证：学生票<br>否则：全价票</code>`;
    }
    if (mission.type === "custom") {
      return `<code>如果 身高 &lt; 120：半价票<br>否则，如果 满足新优惠：创意票<br>否则：全价票</code>`;
    }
    return `<code>如果 身高 &lt; 120：半价票<br>否则：全价票</code>`;
  }

  function starMarkup(count) {
    return [1, 2, 3].map(index => `<span class="${index <= count ? "earned" : ""}">★</span>`).join("");
  }

  function attach(level, options) {
    stopActiveRun();
    context = { level, mission: missions[level - 1], ...options };
    ensureGameState(context.state);
    runtime = { paused: false, stopped: false, running: false, stepResolve: null };
    const saved = context.state.game.missions[level];

    ["operator", "true-exit", "false-exit", "order", "custom-rule"].forEach(key => {
      const element = document.getElementById(`game-${key}`);
      if (!element) return;
      element.addEventListener("change", () => {
        const prop = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
        saved[prop] = element.value;
        persist();
      });
    });

    document.querySelectorAll("[data-game-prediction]").forEach(button => button.addEventListener("click", () => {
      saved.predictions[button.dataset.gamePrediction] = button.dataset.value;
      persist();
      document.querySelectorAll(`[data-game-prediction="${button.dataset.gamePrediction}"]`).forEach(item =>
        item.classList.toggle("selected", item === button));
    }));

    document.getElementById("game-review-text").addEventListener("input", event => {
      saved.review = event.target.value;
      if (context.syncThinking) context.syncThinking(context.level);
      else persist();
    });
    document.getElementById("game-muted").addEventListener("change", event => {
      context.state.game.muted = event.target.checked;
      persist();
    });
    document.getElementById("game-reduce-motion").addEventListener("change", event => {
      context.state.game.reduceMotion = event.target.checked;
      persist();
    });
    document.getElementById("game-run").addEventListener("click", runMission);
    document.getElementById("game-pause").addEventListener("click", togglePause);
    document.getElementById("game-step").addEventListener("click", stepOnce);
    document.getElementById("game-replay").addEventListener("click", replayLastRun);
    document.getElementById("game-reset").addEventListener("click", resetMission);
  }

  function persist() {
    context.save();
  }

  function readControls() {
    const saved = context.state.game.missions[context.level];
    const operator = document.getElementById("game-operator");
    const trueExit = document.getElementById("game-true-exit");
    const falseExit = document.getElementById("game-false-exit");
    const order = document.getElementById("game-order");
    const customRule = document.getElementById("game-custom-rule");
    if (operator) saved.operator = operator.value;
    if (trueExit) saved.trueExit = trueExit.value;
    if (falseExit) saved.falseExit = falseExit.value;
    if (order) saved.order = order.value;
    if (customRule) saved.customRule = customRule.value;
    saved.review = document.getElementById("game-review-text").value.trim();
    return saved;
  }

  function validateConfiguration(saved) {
    const type = context.mission.type;
    if (type === "nested") return saved.order ? "" : "请先选择两座闸机的判断顺序。";
    if (type === "custom") return saved.customRule && saved.order ? "" : "请先选择新增优惠和判断顺序。";
    if (!saved.operator || !saved.trueExit || !saved.falseExit) return "请先安装条件芯片，并设置“是/否”两个票口。";
    return "";
  }

  async function runMission() {
    if (runtime.running) return;
    const token = ++runToken;
    const saved = readControls();
    const error = validateConfiguration(saved);
    if (error) return context.toast(error);
    runtime.running = true;
    runtime.stopped = false;
    runtime.paused = false;
    saved.attempts += 1;
    saved.lastRun = [];
    setControlState(true);
    setMessage("闸机启动！正在读取第一位游客的信息……");
    clearTrackState();
    beep(420, 0.08);

    let accurate = true;
    for (let index = 0; index < context.mission.visitors.length; index += 1) {
      if (runtime.stopped || token !== runToken) return;
      const visitor = context.mission.visitors[index];
      markActiveVisitor(index);
      const result = evaluateVisitor(visitor, saved);
      saved.lastRun.push({ visitor, ...result });
      await animateVisitor(visitor, result, false, token);
      if (token !== runToken) return;
      if (result.actual !== result.expected) accurate = false;
      await controlledDelay(320);
    }

    if (token !== runToken) return;
    const logic = configurationCorrect(saved);
    if (context.onRunComplete) context.onRunComplete(context.level, saved, { accurate, logic });
    const thinking = context.evaluateThinking
      ? Boolean(context.evaluateThinking(context.level))
      : saved.review.trim().length >= 8;
    saved.earned = { accuracy: accurate, logic, thinking };
    const stars = Number(accurate) + Number(logic) + Number(thinking);
    saved.bestStars = Math.max(saved.bestStars, stars);
    persist();
    runtime.running = false;
    setControlState(false);
    showResult(stars, accurate, logic, thinking);
    if (accurate && logic) context.complete(context.level);
  }

  function evaluateVisitor(visitor, saved) {
    const expected = expectedTicket(visitor, saved);
    const type = context.mission.type;
    const checks = [];
    let actual;
    let paths = ["path-start"];

    if (type === "nested") {
      if (saved.order === "height-first") {
        const heightResult = visitor.height < 120;
        checks.push(checkText("身高 < 120cm", visitor.height, heightResult));
        if (heightResult) {
          actual = "half";
          paths.push("path-half");
        } else {
          paths.push("path-second");
          checks.push(checkText("持有学生证", visitor.student ? "有" : "无", visitor.student));
          actual = visitor.student ? "student" : "full";
          paths.push(visitor.student ? "path-student" : "path-full");
        }
      } else {
        checks.push(checkText("持有学生证", visitor.student ? "有" : "无", visitor.student));
        if (visitor.student) {
          actual = "student";
          paths.push("path-second", "path-student");
        } else {
          const heightResult = visitor.height < 120;
          checks.push(checkText("身高 < 120cm", visitor.height, heightResult));
          actual = heightResult ? "half" : "full";
          paths.push(heightResult ? "path-half" : "path-full");
        }
      }
    } else if (type === "custom") {
      const customMatch = matchesCustom(visitor, saved.customRule);
      if (saved.order === "height-first") {
        const heightResult = visitor.height < 120;
        checks.push(checkText("身高 < 120cm", visitor.height, heightResult));
        if (heightResult) {
          actual = "half";
          paths.push("path-half");
        } else {
          paths.push("path-second");
          checks.push(checkText(customLabel(saved.customRule), customValue(visitor, saved.customRule), customMatch));
          actual = customMatch ? "custom" : "full";
          paths.push(customMatch ? "path-student" : "path-full");
        }
      } else {
        checks.push(checkText(customLabel(saved.customRule), customValue(visitor, saved.customRule), customMatch));
        if (customMatch) {
          actual = "custom";
          paths.push("path-second", "path-student");
        } else {
          const heightResult = visitor.height < 120;
          checks.push(checkText("身高 < 120cm", visitor.height, heightResult));
          actual = heightResult ? "half" : "full";
          paths.push(heightResult ? "path-half" : "path-full");
        }
      }
    } else {
      const condition = saved.operator === "lte" ? visitor.height <= 120 : visitor.height < 120;
      checks.push(checkText(saved.operator === "lte" ? "身高 ≤ 120cm" : "身高 < 120cm", visitor.height, condition));
      actual = condition ? saved.trueExit : saved.falseExit;
      paths.push(actual === "half" ? "path-half" : "path-full");
    }

    return { expected, actual, checks, paths, correct: actual === expected };
  }

  function expectedTicket(visitor, saved) {
    if (context.mission.type === "nested") {
      if (visitor.height < 120) return "half";
      return visitor.student ? "student" : "full";
    }
    if (context.mission.type === "custom") {
      if (visitor.height < 120) return "half";
      return matchesCustom(visitor, saved.customRule) ? "custom" : "full";
    }
    return visitor.height < 120 ? "half" : "full";
  }

  function configurationCorrect(saved) {
    if (context.mission.type === "nested") return saved.order === "height-first";
    if (context.mission.type === "custom") return saved.order === "height-first" && Boolean(saved.customRule);
    return saved.operator === "lt" && saved.trueExit === "half" && saved.falseExit === "full";
  }

  function matchesCustom(visitor, rule) {
    if (rule === "elder") return (visitor.age || 0) >= 60;
    if (rule === "family") return Boolean(visitor.family);
    if (rule === "group") return Boolean(visitor.group);
    return false;
  }

  function customLabel(rule) {
    return ({ elder: "年龄 ≥ 60岁", family: "家庭同行", group: "团体游客" })[rule] || "新增优惠";
  }

  function customValue(visitor, rule) {
    if (rule === "elder") return `${visitor.age || 0}岁`;
    if (rule === "family") return visitor.family ? "是" : "否";
    if (rule === "group") return visitor.group ? "是" : "否";
    return "否";
  }

  function checkText(label, value, result) {
    return { label, value, result, text: `${label}｜输入：${value}｜${result ? "成立" : "不成立"}` };
  }

  async function animateVisitor(visitor, result, replay = false, token = runToken) {
    const car = document.getElementById("game-car");
    const icon = document.getElementById("game-car-icon");
    car.classList.remove("hidden", "success", "error");
    icon.textContent = visitor.icon;
    setMessage(`${visitor.name} 出发：身高 ${visitor.height}cm${visitor.student ? "，有学生证" : ""}`);

    for (let i = 0; i < result.paths.length; i += 1) {
      await waitIfPaused();
      if (token !== runToken) return;
      const pathId = result.paths[i];
      if (i > 0 && result.checks[i - 1]) {
        await showGateCheck(result.checks[i - 1]);
      }
      await animateAlongPath(pathId, token);
      if (!replay) beep(i === 0 ? 520 : 650, 0.06);
    }

    if (token !== runToken) return;
    car.classList.add(result.correct ? "success" : "error");
    highlightStation(result.actual, result.correct);
    setMessage(result.correct
      ? `${visitor.name} 顺利到达${ticketLabel(result.actual)}！`
      : `${visitor.name} 到了${ticketLabel(result.actual)}，但应该去${ticketLabel(result.expected)}。点击“回放路径”检查错误。`);
    beep(result.correct ? 820 : 180, result.correct ? 0.1 : 0.18);
  }

  async function animateAlongPath(pathId, token) {
    const path = document.getElementById(pathId);
    const car = document.getElementById("game-car");
    if (!path || !car) return;
    const length = path.getTotalLength();
    const reduceMotion = context.state.game.reduceMotion;
    const steps = reduceMotion ? 2 : 28;
    for (let step = 0; step <= steps; step += 1) {
      if (runtime.stopped || token !== runToken) return;
      const point = path.getPointAtLength(length * step / steps);
      car.style.left = `${point.x / 9}%`;
      car.style.top = `${point.y / 4.3}%`;
      if (!reduceMotion) await delay(20);
    }
  }

  async function showGateCheck(check) {
    const bubble = document.getElementById("gate-bubble");
    document.querySelectorAll("[data-live-code]").forEach(line => line.classList.remove("active"));
    document.querySelector('[data-live-code="condition"]')?.classList.add("active");
    bubble.className = `gate-bubble ${check.result ? "true" : "false"}`;
    bubble.innerHTML = `<strong>${check.result ? "条件成立 ✓" : "条件不成立 ✕"}</strong><span>${check.label}</span><small>输入：${check.value}</small>`;
    await controlledDelay(context.state.game.reduceMotion ? 80 : 380);
    document.querySelectorAll(`[data-live-code="${check.result ? "true" : "false"}"]`).forEach(line => line.classList.add("active"));
    await controlledDelay(context.state.game.reduceMotion ? 60 : 300);
    bubble.classList.add("hidden");
  }

  function togglePause() {
    if (!runtime.running) return;
    runtime.paused = !runtime.paused;
    document.getElementById("game-pause").textContent = runtime.paused ? "▶ 继续" : "Ⅱ 暂停";
    document.getElementById("game-step").disabled = !runtime.paused;
    if (!runtime.paused && runtime.stepResolve) {
      runtime.stepResolve();
      runtime.stepResolve = null;
    }
  }

  function stepOnce() {
    if (!runtime.paused || !runtime.stepResolve) return;
    const resolve = runtime.stepResolve;
    runtime.stepResolve = null;
    resolve();
  }

  async function waitIfPaused() {
    if (!runtime.paused) return;
    await new Promise(resolve => { runtime.stepResolve = resolve; });
  }

  async function controlledDelay(ms) {
    await waitIfPaused();
    await delay(ms);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function replayLastRun() {
    const saved = context.state.game.missions[context.level];
    if (!saved.lastRun.length || runtime.running) return;
    const token = ++runToken;
    runtime.running = true;
    setControlState(true);
    clearTrackState();
    for (let index = 0; index < saved.lastRun.length; index += 1) {
      if (token !== runToken) return;
      markActiveVisitor(index);
      await animateVisitor(saved.lastRun[index].visitor, saved.lastRun[index], true, token);
      await delay(250);
    }
    if (token !== runToken) return;
    runtime.running = false;
    setControlState(false);
  }

  function resetMission() {
    stopActiveRun();
    const saved = context.state.game.missions[context.level];
    Object.assign(saved, {
      operator: "",
      trueExit: "",
      falseExit: "",
      order: "",
      customRule: "",
      predictions: {},
      lastRun: []
    });
    persist();
    context.rerender();
  }

  function setControlState(running) {
    document.getElementById("game-run").disabled = running;
    document.getElementById("game-pause").disabled = !running;
    document.getElementById("game-step").disabled = true;
    document.getElementById("game-replay").disabled = running;
  }

  function stopActiveRun() {
    runToken += 1;
    runtime.stopped = true;
    runtime.paused = false;
    runtime.running = false;
    if (runtime.stepResolve) runtime.stepResolve();
    runtime.stepResolve = null;
  }

  function markActiveVisitor(index) {
    document.querySelectorAll("[data-visitor-card]").forEach(card =>
      card.classList.toggle("active", Number(card.dataset.visitorCard) === index));
  }

  function clearTrackState() {
    document.querySelectorAll(".ticket-station").forEach(station => station.classList.remove("correct", "wrong"));
    document.querySelectorAll("[data-live-code]").forEach(line => line.classList.remove("active"));
    document.querySelectorAll("[data-visitor-card]").forEach(card => card.classList.remove("active"));
    document.getElementById("game-result").classList.add("hidden");
  }

  function highlightStation(key, correct) {
    const station = document.querySelector(`[data-station="${key}"]`);
    if (station) station.classList.add(correct ? "correct" : "wrong");
  }

  function setMessage(text) {
    document.getElementById("track-message").textContent = text;
  }

  function showResult(stars, accurate, logic, thinking) {
    const saved = context.state.game.missions[context.level];
    const result = document.getElementById("game-result");
    result.classList.remove("hidden");
    result.innerHTML = `
      <div class="result-stars">${starMarkup(stars)}</div>
      <h3>${stars === 3 ? "三星通关！" : stars ? "闸机测试完成" : "继续调试闸机"}</h3>
      <div class="star-reasons">
        ${starReason("准确星", accurate, "全部游客进入正确票口")}
        ${starReason("逻辑星", logic, "条件与判断顺序正确")}
        ${starReason("思考星", thinking, "引用运行证据并用关键概念解释")}
      </div>
      <p>本关最佳：${saved.bestStars}/3 星 · 累计：${totalStars(context.state)}/18 星</p>`;
    if (stars > 0) beep(980, 0.12);
  }

  function starReason(name, earned, reason) {
    return `<div class="${earned ? "earned" : ""}"><span>★</span><strong>${name}</strong><small>${reason}</small></div>`;
  }

  function ticketLabel(key) {
    return tickets[key]?.label || "未知票口";
  }

  function totalStars(state) {
    ensureGameState(state);
    return Object.values(state.game.missions).reduce((sum, mission) => sum + (mission.bestStars || 0), 0);
  }

  function awardTitle(stars) {
    if (stars >= 15) return "乐园算法设计师";
    if (stars >= 10) return "智能闸机工程师";
    return "智慧乐园规则小达人";
  }

  function beep(frequency, duration) {
    if (!context || context.state.game.muted) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      gain.gain.setValueAtTime(0.05, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch {}
  }

  function escape(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  window.TicketGame = {
    ensureGameState,
    render,
    attach,
    totalStars,
    awardTitle
  };
})();
