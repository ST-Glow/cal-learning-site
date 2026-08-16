const STORAGE_KEY = "cal-branch-training-v1";

const levelMeta = [
  { id: 1, title: "认识售票规则", subtitle: "帮助游客选对岔道", color: "#ff8a4c" },
  { id: 2, title: "安装身高闸机", subtitle: "配置菱形判断闸机", color: "#3978f6" },
  { id: 3, title: "智能闸机联动", subtitle: "让轨道和代码同步", color: "#7567e8" },
  { id: 4, title: "规则检验实验室", subtitle: "用边界值、收入与公平证据检验规则", color: "#16a085" },
  { id: 5, title: "智慧乐园票价公约", subtitle: "用算法、数学与公平证据完成方案", color: "#ffb000" }
];

const phaseMeta = [
  { id: 1, title: "情境导入", subtitle: "领取售票员任务", icon: "🎟", color: "#ff6b6b", image: "assets/images/stages/stage-intro.webp", levels: [1] },
  { id: 2, title: "新知讲解", subtitle: "探索流程与代码", icon: "📖", color: "#29a4d9", image: "assets/images/stages/stage-knowledge.webp", levels: [2, 3] },
  { id: 3, title: "跨学科探究", subtitle: "用实验与数学证据检验规则", icon: "🔬", color: "#ffb633", image: "assets/images/stages/stage-practice.webp", levels: [4] },
  { id: 4, title: "项目评价", subtitle: "设计·检验·反思", icon: "✓", color: "#4f7c68", image: "assets/images/stages/stage-extension.webp", levels: [5] }
];

const knowledgeSegments = {
  2: {
    key: "branch",
    title: "双分支与判断路径",
    pages: [2, 3],
    summaries: [
      "程序遇到条件时，会在“成立”和“不成立”两条路径中选择一条执行。",
      "流程图使用菱形表示判断，菱形必须连接“是”和“否”两条出口。"
    ],
    questions: [
      { q: "116cm 的游客经过“身高 < 120cm”判断后，条件是否成立？", options: ["成立", "不成立"], answer: 0, explanation: "116 小于 120，条件成立，应走向半价票。" },
      { q: "流程图中表示条件判断的图形是什么？", options: ["矩形", "菱形", "圆形"], answer: 1, explanation: "菱形提出一个可以回答“是/否”的判断问题。" }
    ]
  },
  3: {
    key: "flowCode",
    title: "流程图与 if-else",
    pages: [3, 4],
    summaries: [
      "流程图中的判断菱形对应代码中的 if 条件，两条路径对应 if 和 else。",
      "统一规则使用严格小于号：height < 120。边界值 119、120、121cm 能帮助我们检查条件是否写错。"
    ],
    questions: [
      { q: "流程图中的判断菱形，对应代码的哪一部分？", options: ["if 条件", "输出语句", "结束符号"], answer: 0, explanation: "if 后面的条件决定程序选择哪条执行路径。" },
      { q: "规则是“低于120cm半价”，120cm 应走哪条路径？", options: ["条件成立", "条件不成立"], answer: 1, explanation: "120 不小于 120，因此条件不成立，不能购买半价票。" }
    ]
  },
  5: {
    key: "nested",
    title: "判断顺序与嵌套分支",
    pages: [5, 7],
    summaries: [
      "先判断身高，只有身高达到120cm后，才继续判断是否持有学生证。",
      "嵌套分支是在一条分支路径中继续判断，代码用缩进表示所属层次。"
    ],
    questions: [
      { q: "116cm 且有学生证的游客，应该优先获得什么票？", options: ["半价票", "学生票", "全价票"], answer: 0, explanation: "先执行身高规则，低于120cm优先进入半价票路径。" },
      { q: "嵌套代码为什么需要缩进？", options: ["表示代码所属层次", "让代码运行更快", "改变字体颜色"], answer: 0, explanation: "缩进帮助我们看清内层判断属于外层的哪一条路径。" }
    ]
  }
};

const worksheetPrompts = [
  "闸机根据什么信息选择轨道？",
  "为什么菱形必须有“是/否”两条路径？",
  "流程图菱形与代码 if 有什么关系？",
  "120cm 和判断顺序怎样影响票价与公平？",
  "哪一条数学证据或同伴质疑改变了你的算法？"
];

function emptyKnowledgeSegment() {
  return { answers: {}, submitted: false, score: 0, completedAt: "" };
}

function emptyWorksheetEntry() {
  return { prediction: "", keyPoint: "", correction: "", explanation: "" };
}

const defaultState = {
  learner: { name: "", className: "", group: "", id: "" },
  currentPage: "home",
  currentLevel: 1,
  completed: [],
  attempts: {},
  hints: {},
  answers: {
    level1: { xiaoming: "", sister: "", logic: [] },
    level2: { nodes: {} },
    level3: { height: 116, prediction: "", result: "", codeComplete: false },
    level4: { program: "", explanation: "", tests: [] },
    task: { offer: "", price: "", condition: "", order: "", fairness: "", pseudocode: "", members: "", roles: "", tests: [] }
  },
  lab: {},
  quiz: {},
  quizSubmitted: false,
  quizScore: 0,
  selfRating: {},
  feedback: null,
  certificate: false,
  game: { muted: false, reduceMotion: false, missions: {} },
  knowledge: {
    segments: {
      branch: emptyKnowledgeSegment(),
      flowCode: emptyKnowledgeSegment(),
      nested: emptyKnowledgeSegment()
    },
    activeViews: { 2: "learn", 3: "learn", 5: "learn" },
    pageIndexes: { branch: 0, flowCode: 0, nested: 0 },
    videoOpened: false
  },
  worksheet: {
    version: 3,
    filter: "all",
    entries: {
      1: emptyWorksheetEntry(), 2: emptyWorksheetEntry(), 3: emptyWorksheetEntry(),
      4: emptyWorksheetEntry(), 5: emptyWorksheetEntry()
    }
  },
  learnerModel: null,
  inquiry: {},
  project: null,
  introSeen: false
};

let state = loadState();
TicketGame.ensureGameState(state);
migrateLearningState();
let draggedLogic = null;
let draggedNode = null;
let draggedOrder = null;
let assistantBusy = false;
const assistantConversation = [];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return deepMerge(structuredClone(defaultState), saved || {});
  } catch {
    return structuredClone(defaultState);
  }
}

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source || {})) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      target[key] = deepMerge(target[key] || {}, value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function migrateLearningState() {
  LearningModel.ensure(state);
  state.project = CrossDisciplinaryLab.ensureProjectState(state.project);
  if (window.RuleLab) window.RuleLab.ensureLab(state);
  state.knowledge = deepMerge(structuredClone(defaultState.knowledge), state.knowledge || {});
  state.worksheet = deepMerge(structuredClone(defaultState.worksheet), state.worksheet || {});
  state.worksheet.version = 4;
  if (Array.isArray(state.completed)) {
    state.completed = [...new Set(state.completed.map(id => {
      const num = Number(id);
      if (num === 5) return 4;
      if (num === 6) return 5;
      return num;
    }).filter(num => Number.isInteger(num) && num >= 1 && num <= 5))].sort((a, b) => a - b);
  }
  if (Number(state.currentLevel) === 6) state.currentLevel = 5;
  else if (Number(state.currentLevel) === 5) state.currentLevel = 4;
  if (state.worksheet?.entries) {
    const old5 = state.worksheet.entries[5];
    const old6 = state.worksheet.entries[6];
    if (old5 && !state.worksheet.entries[4]) state.worksheet.entries[4] = old5;
    if (old6) state.worksheet.entries[5] = old6;
    else delete state.worksheet.entries[5];
    delete state.worksheet.entries[6];
  }
  for (let level = 1; level <= 5; level += 1) {
    const entry = state.worksheet.entries[level] || (state.worksheet.entries[level] = emptyWorksheetEntry());
    const mission = state.game.missions[level];
    if (!entry.explanation && mission.review) entry.explanation = mission.review;
    if (!mission.review && entry.explanation) mission.review = entry.explanation;
    updateThinkingStar(level, false);
  }
  LearningModel.recalculate(state);
}

function updateThinkingStar(level, persist = true) {
  const mission = state.game.missions[level];
  const entry = state.worksheet.entries[level];
  mission.review = entry?.explanation || "";
  const thinking = LearningModel.thinkingEligible(state, level);
  mission.earned.thinking = thinking.earned;
  const currentStars = Number(mission.earned.accuracy) + Number(mission.earned.logic) + Number(thinking.earned);
  mission.bestStars = Math.max(mission.bestStars || 0, currentStars);
  if (persist) saveState();
}

function saveState() {
  LearningModel.recalculate(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateGlobalUI();
}

function createLearnerId() {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `CAL-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  const region = document.getElementById("toast-region");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  region.append(toast);
  setTimeout(() => toast.remove(), 3200);
}

function markAttempt(level) {
  state.attempts[level] = (state.attempts[level] || 0) + 1;
}

function markComplete(level) {
  if (!state.completed.includes(level)) state.completed.push(level);
  state.completed.sort((a, b) => a - b);
  saveState();
  showToast(`第 ${level} 项训练已完成，任务单已更新。`);
}

async function submitLearningData(type, payload) {
  const endpoint = window.CAL_CONFIG?.submissionEndpoint?.trim();
  if (!endpoint) return { stored: "local" };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      learner: state.learner,
      learnerId: state.learner.id,
      submittedAt: new Date().toISOString(),
      payload
    })
  });
  if (!response.ok) throw new Error(`提交失败：${response.status}`);
  return { stored: "remote" };
}

function switchPage(page, options = {}) {
  document.querySelectorAll(".page").forEach(el => el.classList.toggle("active", el.dataset.page === page));
  document.querySelectorAll("[data-nav]").forEach(el => el.classList.toggle("active", el.dataset.nav === page));
  document.body.dataset.currentPage = page;
  state.currentPage = page;
  if (page === "map" && options.level) state.currentLevel = Number(options.level);
  if (page === "map") renderMap();
  if (page === "worksheet") renderWorksheet();
  if (page === "evaluation") renderEvaluation();
  if (page === "resources") closePdf();
  if (page === "teacher") renderTeacherDashboard();
  if (page === "performance") renderPerformanceDashboard();
  updateAssistantContext();
  if (!options.transient) saveState();
  window.scrollTo({ top: 0, behavior: options.instant ? "auto" : "smooth" });
}

function capturePresentationState() {
  return {
    page: state.currentPage || "home",
    level: Number(state.currentLevel) || 1,
    activeViews: { ...(state.knowledge?.activeViews || {}) },
    projectStep: Number(state.project?.activeStep) || 1
  };
}

function navigatePresentation(step = {}) {
  const page = step.page || "home";
  if (page === "map" && step.level) {
    const level = Number(step.level);
    state.currentLevel = level;
    if (step.view && state.knowledge?.activeViews) state.knowledge.activeViews[level] = step.view;
    if (level === 5 && step.projectStep && state.project) {
      state.project.activeStep = Math.min(4, Math.max(1, Number(step.projectStep)));
    }
  }
  switchPage(page, { instant: true, level: step.level, transient: true });
}

function restorePresentationState(snapshot, options = {}) {
  if (!snapshot) return;
  state.currentLevel = Number(snapshot.level) || 1;
  if (state.knowledge) state.knowledge.activeViews = { ...(snapshot.activeViews || {}) };
  if (state.project) state.project.activeStep = Number(snapshot.projectStep) || 1;
  const destination = options.returnHome ? "home" : (snapshot.page || "home");
  switchPage(destination, { instant: true, level: state.currentLevel, transient: true });
}

function updateGlobalUI() {
  const completedCount = state.completed.length;
  const progress = Math.round((completedCount / levelMeta.length) * 100);
  const totalStars = TicketGame.totalStars(state);
  document.getElementById("profile-name").textContent = state.learner.name || "新学员";
  document.getElementById("profile-avatar").textContent = state.learner.name ? state.learner.name.slice(0, 1) : "新";
  document.getElementById("overall-progress-text").textContent = `${progress}% · ${totalStars}★`;
  document.getElementById("overall-progress-bar").style.width = `${progress}%`;
  renderHomeRoute();
}

function renderHomeRoute() {
  const container = document.getElementById("home-route-preview");
  container.innerHTML = levelMeta.map(level => {
    const complete = state.completed.includes(level.id);
    return `
      <article class="route-card ${complete ? "complete" : ""}" style="--level-color:${level.color}" tabindex="0" role="button" data-open-level="${level.id}">
        <span class="route-status">${complete ? "✓" : level.id}</span>
        <span class="level-number">0${level.id}</span>
        <h3>${level.title}</h3>
        <p>${level.subtitle}</p>
      </article>`;
  }).join("");
}

function renderRecommendations(targetId, placement) {
  const container = document.getElementById(targetId);
  if (!container) return;
  const model = LearningModel.recalculate(state);
  const recommendations = model.recommendations || [];
  container.innerHTML = `
    <div class="adaptive-heading">
      <span class="adaptive-icon" aria-hidden="true">AI</span>
      <div><strong>今日学习建议</strong><small>根据知识检查、闯关路径和自评自动生成</small></div>
      <button type="button" class="adaptive-why" data-adaptive-why>为什么推荐？</button>
    </div>
    <div class="adaptive-list">
      ${recommendations.map(item => `
        <button type="button" data-recommend-level="${item.level}" class="${item.tone || "review"}">
          <span>${item.level === 5 ? "项目" : `第${item.level}关`}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.reason)}</small>
          <b>开始练习 →</b>
        </button>`).join("")}
    </div>
    ${placement === "map" ? `<div class="mastery-mini">${Object.entries(model.mastery).map(([key, value]) =>
      `<span title="${key}">${Math.round(value)}%</span>`).join("")}</div>` : ""}`;
}

function showRecommendationReason() {
  const model = LearningModel.recalculate(state);
  const diagnosis = LearningModel.currentDiagnosis(state, state.currentPage === "map" ? state.currentLevel : null);
  const message = diagnosis
    ? `系统发现“${diagnosis.label}”出现过${state.learnerModel.errorTypes[diagnosis.type].count}次，因此推荐对应练习。推荐只是一条建议，你仍可以自由选择其他关卡。`
    : "系统综合知识检查、闯关星级、尝试次数和自我评价生成建议。推荐不会锁定关卡，你可以按自己的节奏学习。";
  showToast(message);
}

function renderMap() {
  document.body.dataset.currentLevel = String(state.currentLevel);
  const phase = phaseForLevel(state.currentLevel);
  document.getElementById("level-sidebar").innerHTML = phaseMeta.map(item => {
    const phaseComplete = item.id === 4
      ? state.completed.includes(5) && state.quizSubmitted
      : item.levels.length > 0 && item.levels.every(level => state.completed.includes(level));
    return `
      <button class="level-tab ${phase.id === item.id ? "active" : ""} ${phaseComplete ? "complete" : ""}" data-phase="${item.id}" style="--phase-color:${item.color}">
        <span class="level-tab-number">${item.icon}</span>
        <span><strong>${item.title}</strong><small>${item.subtitle}</small></span>
        <span class="level-tab-status">${phaseComplete ? "✓" : item.id}</span>
      </button>`;
  }).join("");

  document.getElementById("player-kicker").textContent = `STAGE ${String(phase.id).padStart(2, "0")}`;
  document.getElementById("player-phase-title").textContent = phase.title;
  document.getElementById("player-level-title").textContent = levelMeta[state.currentLevel - 1].title;
  const learningTabs = phase.levels.map((levelId, index) => {
    const level = levelMeta[levelId - 1];
    return `<button class="substep-tab ${state.currentLevel === levelId ? "active" : ""} ${state.completed.includes(levelId) ? "complete" : ""}" data-level="${levelId}">
      <span>${index + 1}</span>${phase.id === 4 ? "小组项目" : level.title}${state.completed.includes(levelId) ? " ✓" : ""}
    </button>`;
  }).join("");
  const evaluationTab = phase.id === 4
    ? `<button class="substep-tab ${state.quizSubmitted ? "complete" : ""}" data-open-final-evaluation><span>2</span>个人评价${state.quizSubmitted ? " ✓" : ""}</button>`
    : "";
  document.getElementById("substep-tabs").innerHTML = learningTabs + evaluationTab;
  document.getElementById("stage-dots").innerHTML = phaseMeta.map(item => `<span class="${item.id === phase.id ? "active" : ""}" style="--dot-color:${item.color}"></span>`).join("");
  renderRecommendations("map-recommendations", "map");

  // Level 5 is now the merged project-and-evaluation stage. It should open
  // directly to the student project instead of being hidden behind the old
  // nested-branch lesson tabs.
  const learningSegment = state.currentLevel === 5 ? null : knowledgeSegments[state.currentLevel];
  const activeView = learningSegment ? state.knowledge.activeViews[state.currentLevel] || "learn" : "challenge";
  const levelContent = learningSegment
    ? renderLearningLevel(state.currentLevel, activeView)
    : renderChallenge(state.currentLevel);
  const levelStage = document.getElementById("level-stage");
  levelStage.innerHTML = lessonShell(levelMeta[state.currentLevel - 1], levelContent);
  // Switching from a long knowledge page to a game used to preserve the old
  // inner scroll offset, so the challenge appeared halfway down the canvas.
  levelStage.scrollTop = 0;
  document.getElementById("previous-stage").disabled = state.currentLevel === 1;
  document.getElementById("next-stage").textContent = state.currentLevel === 5 ? "完成个人评价 →" : "下一站 →";
  attachLevelHandlers();
  requestAnimationFrame(() => {
    const game = levelStage.querySelector(".ticket-game");
    if (!game) return;
    const stageBox = levelStage.getBoundingClientRect();
    const gameBox = game.getBoundingClientRect();
    levelStage.scrollTop = Math.max(0, levelStage.scrollTop + gameBox.top - stageBox.top - 10);
  });
}

function renderLearningLevel(level, activeView) {
  const segment = knowledgeSegments[level];
  const saved = state.knowledge.segments[segment.key];
  const complete = Boolean(saved.completedAt);
  return `
    <div class="learning-mode-tabs" role="tablist" aria-label="${segment.title}">
      <button type="button" class="${activeView === "learn" ? "active" : ""}" data-learning-view="learn" role="tab">
        <span>1</span> 知识学习 ${complete ? "✓" : ""}
      </button>
      <button type="button" class="${activeView === "challenge" ? "active" : ""}" data-learning-view="challenge" role="tab">
        <span>2</span> 闸机挑战
      </button>
    </div>
    ${activeView === "learn" ? renderKnowledgePanel(level) : `
      ${complete ? "" : `<div class="knowledge-skip-note"><strong>建议先完成知识学习。</strong>你仍可以体验游戏，遇到困难时可随时返回查看课件。</div>`}
      ${renderChallenge(level)}
    `}`;
}

function renderChallenge(level) {
  if (Number(level) === 5) return renderProjectLab();
  if (Number(level) === 4 && window.RuleLab) return window.RuleLab.render(state, state.game.missions[4]);
  return TicketGame.render(level, state);
}

function renderInquiryPanel(level) {
  const inquiry = state.inquiry[level];
  const content = level === 4 ? {
    question: "为什么120cm最容易暴露条件芯片的错误？",
    prediction: "先预测：程序A（<120）和程序B（≤120）中，哪一个符合规则？",
    transfer: "如果规则写错，120cm的游客可能多付或少付多少钱？怎样用测试数据证明规则公平？"
  } : {
    question: "为什么判断顺序会改变票价和收入？哪一种顺序更公平？",
    prediction: "先预测：116cm且有学生证的游客，应该优先获得哪一种票？",
    transfer: "如果加入老人票，怎样用收入和公平证据决定判断顺序？"
  };
  const orderComparison = level === 5 ? renderOrderComparison() : "";
  return `
    <section class="inquiry-lab" data-inquiry-level="${level}">
      <div class="inquiry-heading">
        <div><span class="eyebrow">INQUIRY EVIDENCE</span><h3>探究证据站</h3></div>
        <span>问题 → 预测 → 实验 → 证据 → 解释</span>
      </div>
      <div class="inquiry-question"><strong>探究问题</strong><p>${content.question}</p></div>
      <div class="inquiry-grid">
        <label><span>1. 我的预测</span><small>${content.prediction}</small>
          <textarea rows="2" data-inquiry-field="prediction" placeholder="运行闸机前先写下预测">${escapeHtml(inquiry.prediction)}</textarea>
        </label>
        <div class="inquiry-experiments">
          <span>2. 实验与证据</span><small>启动闸机后，运行记录会自动出现在这里。</small>
          <div id="inquiry-experiment-list">${inquiryExperimentMarkup(level)}</div>
        </div>
        <label><span>3. 根据证据解释</span><small>解释哪种规则或顺序更准确，以及为什么。</small>
          <textarea rows="3" data-inquiry-field="explanation" placeholder="我观察到……这说明……">${escapeHtml(inquiry.explanation)}</textarea>
        </label>
        <label><span>4. 修正与迁移</span><small>${content.transfer}</small>
          <textarea rows="3" data-inquiry-field="transfer" placeholder="修改后的规则或新的测试方法">${escapeHtml(inquiry.transfer)}</textarea>
        </label>
      </div>
      ${orderComparison}
    </section>`;
}

function renderOrderComparison() {
  const comparisons = CrossDisciplinaryLab.compareBaselineOrders();
  return `<div class="order-comparison">
    <div class="record-zone-title"><span>¥</span><div><strong>顺序会改变谁享受哪种优惠</strong><small>同一组游客、同一组票价，只改变判断顺序</small></div></div>
    <div class="order-comparison-grid">
      ${comparisons.map(item => `<article>
        <h4>${item.label}</h4>
        <strong>总收入 ${item.metrics.totalIncome} 元</strong>
        <p>${item.results.map(result => `${escapeHtml(result.visitor.name)}：${result.ticketLabel}${result.price}元`).join("；")}</p>
      </article>`).join("")}
    </div>
    <p class="comparison-note">观察“妹妹（116cm且有学生证）”的票种是否改变，再解释哪一种顺序更符合先处理儿童优惠的规则。</p>
  </div>`;
}

function inquiryExperimentMarkup(level) {
  const experiments = state.inquiry[level]?.experiments || [];
  if (!experiments.length) return `<p class="inquiry-empty">尚无实验记录，请先配置并启动下方闸机。</p>`;
  return experiments.map((item, index) => `
    <label class="inquiry-evidence-item">
      <input type="checkbox" data-inquiry-evidence="${index}" ${state.inquiry[level].citedEvidence.includes(index) ? "checked" : ""}>
      <span>${escapeHtml(LearningModel.evidenceText(item))}</span>
    </label>`).join("");
}

function renderKnowledgePanel(level) {
  const segment = knowledgeSegments[level];
  const saved = state.knowledge.segments[segment.key];
  const pageIndex = Math.min(state.knowledge.pageIndexes[segment.key] || 0, segment.pages.length - 1);
  const page = segment.pages[pageIndex];
  const videoUrl = window.CAL_CONFIG?.knowledgeVideoUrl?.trim();
  const videoLabel = window.CAL_CONFIG?.knowledgeVideoLabel || "观看数字人讲解";
  return `
    <section class="knowledge-lesson" data-knowledge-level="${level}">
      <div class="knowledge-courseware">
        <div class="knowledge-panel-heading">
          <div><span class="game-label">校正版学生课件</span><h3>${segment.title}</h3></div>
          <span>${pageIndex + 1} / ${segment.pages.length}</span>
        </div>
        <div class="courseware-frame">
          <img
            src="assets/courseware/student-slides/slide-${page}.png"
            alt="${escapeHtml(segment.title)}精选课件第 ${page} 页"
            loading="eager"
          >
        </div>
        <div class="courseware-controls">
          <button type="button" class="secondary-button" data-knowledge-page="-1" ${pageIndex === 0 ? "disabled" : ""}>← 上一页</button>
          <span>第 ${page} 页</span>
          <button type="button" class="secondary-button" data-knowledge-page="1" ${pageIndex === segment.pages.length - 1 ? "disabled" : ""}>下一页 →</button>
        </div>
      </div>
      <aside class="knowledge-guide">
        <span class="eyebrow">LEARN BEFORE PLAY</span>
        <h3>先学规则，再启动闸机</h3>
        <ul class="knowledge-summary">
          ${segment.summaries.map(item => `<li>${item}</li>`).join("")}
        </ul>
        <button type="button" class="video-link-button" id="knowledge-video-link" ${videoUrl ? "" : "disabled"}>
          <span>▶</span><strong>${videoUrl ? escapeHtml(videoLabel) : "视频待接入"}</strong>
        </button>
        ${videoUrl ? "" : `<p class="video-fallback-text"><strong>文字讲解：</strong>${segment.summaries.join(" ")}</p>`}
        <div class="knowledge-check">
          <div class="panel-title"><span>✓</span> 两题知识检查</div>
          ${segment.questions.map((item, qi) => `
            <fieldset>
              <legend>${qi + 1}. ${item.q}</legend>
              ${item.options.map((option, oi) => `
                <label class="knowledge-option">
                  <input type="radio" name="knowledge-${qi}" value="${oi}" ${Number(saved.answers[qi]) === oi ? "checked" : ""}>
                  <span>${option}</span>
                </label>`).join("")}
              ${saved.submitted ? `<p class="knowledge-explanation ${Number(saved.answers[qi]) === item.answer ? "correct" : "wrong"}">${Number(saved.answers[qi]) === item.answer ? "回答正确。" : "再想一想。"}${item.explanation}</p>` : ""}
            </fieldset>`).join("")}
          <button type="button" class="secondary-button full-width" id="submit-knowledge-check">${saved.submitted ? `重新检查（${saved.score}/2）` : "提交知识检查"}</button>
        </div>
        <button type="button" class="primary-button full-width" id="finish-knowledge">
          ${saved.completedAt ? "再次进入闸机挑战 →" : "我已完成学习，开始挑战 →"}
        </button>
      </aside>
    </section>`;
}

function phaseForLevel(levelId) {
  return phaseMeta.find(phase => phase.levels.includes(Number(levelId))) || phaseMeta[0];
}

function lessonShell(level, content) {
  const phase = phaseForLevel(level.id);
  return `
    <article class="lesson-card">
      <div class="stage-visual" style="--stage-color:${phase.color}">
        <img src="${phase.image}" alt="${phase.title}卡通场景">
        <div class="stage-visual-copy">
          <span>${phase.icon} ${phase.title}</span>
          <strong>${level.title}</strong>
          <small>${level.subtitle}</small>
        </div>
      </div>
      <header class="lesson-header">
        <div>
          <span class="eyebrow">LEVEL ${String(level.id).padStart(2, "0")}</span>
          <h2>${level.title}</h2>
          <p>${level.subtitle}</p>
        </div>
        <div class="lesson-badge" style="background:${level.color}">${level.id === 5 ? "GO" : `0${level.id}`}</div>
      </header>
      ${content}
    </article>`;
}

function renderLevel1() {
  const answer = state.answers.level1;
  const logic = answer.logic || [];
  return lessonShell(levelMeta[0], `
    <div class="instruction-box"><strong>训练目标：</strong>先根据身高预测票种，再把“条件—选择—结果”排成一句完整的判断规则。</div>
    <div class="choice-grid">
      ${characterCard("xiaoming", "小明", 138, "男孩", answer.xiaoming)}
      ${characterCard("sister", "妹妹", 116, "女孩", answer.sister)}
    </div>
    <div class="logic-builder">
      <h3>把生活规则排成正确顺序</h3>
      <p>可以拖动卡片，也可以依次点击卡片填入空位。</p>
      <div class="logic-bank">
        ${["条件：身高低于120cm", "选择：如果成立", "结果：购买半价票"].map((text, i) => `<button class="logic-card" draggable="true" data-logic="${i}" ${logic.includes(i) ? "disabled" : ""}>${text}</button>`).join("")}
      </div>
      <div class="logic-slots" aria-label="逻辑排序区">
        ${[0,1,2].map((_, i) => `<button class="logic-slot ${logic[i] !== undefined ? "filled" : ""}" data-logic-slot="${i}">${logic[i] !== undefined ? ["条件：身高低于120cm", "选择：如果成立", "结果：购买半价票"][logic[i]] : `${i + 1}. 放入卡片`}</button>`).join("")}
      </div>
    </div>
    <div class="lesson-actions">
      <button class="primary-button" id="check-level1">检查答案</button>
      <button class="secondary-button" id="reset-level1">重新排列</button>
      <button class="secondary-button hint-toggle" data-hint="1">提示模式</button>
    </div>
    <div class="feedback-box hidden" id="feedback-level1" aria-live="polite"></div>
  `);
}

function characterCard(key, name, height, icon, selected) {
  return `
    <section class="character-card">
      <div class="character-top">
        <div class="character-avatar" aria-hidden="true">${icon === "男孩" ? "👦" : "👧"}</div>
        <div><h3>${name}</h3><p>身高 <strong>${height}cm</strong></p></div>
      </div>
      <div class="ticket-options" data-character="${key}">
        <button class="option-button ${selected === "half" ? "selected" : ""}" data-ticket="half">半价票</button>
        <button class="option-button ${selected === "full" ? "selected" : ""}" data-ticket="full">全价票</button>
      </div>
    </section>`;
}

function renderLevel2() {
  const nodes = state.answers.level2.nodes || {};
  const nodeLabels = { start: "开始", input: "输入身高", decision: "身高 < 120cm？", half: "购买半价票", full: "购买全价票", end: "结束" };
  return lessonShell(levelMeta[1], `
    <div class="instruction-box"><strong>训练目标：</strong>把流程图节点放到正确位置，再让一位 116cm 的游客沿路线运行。</div>
    <div class="flow-node-demo">
      <div><strong>圆角框</strong><small>开始 / 结束</small></div>
      <div><strong>平行四边形</strong><small>输入信息</small></div>
      <div><strong>菱形框</strong><small>判断条件</small></div>
      <div><strong>矩形框</strong><small>执行操作</small></div>
      <div><strong>箭头</strong><small>执行方向</small></div>
    </div>
    <div class="flow-builder">
      <div class="node-bank">
        ${Object.entries(nodeLabels).map(([key, label]) => `<button class="flow-node ${key === "decision" ? "decision" : key === "start" || key === "end" ? "round" : "process"}" draggable="true" data-node="${key}"><span>${label}</span></button>`).join("")}
      </div>
      <div class="flow-canvas" id="flow-canvas">
        ${flowSlot("start", "wide", nodes, nodeLabels)}
        ${flowSlot("input", "wide", nodes, nodeLabels)}
        ${flowSlot("decision", "wide", nodes, nodeLabels)}
        ${flowSlot("half", "branch", nodes, nodeLabels, "是")}
        ${flowSlot("full", "branch", nodes, nodeLabels, "否")}
        ${flowSlot("end", "wide", nodes, nodeLabels)}
      </div>
    </div>
    <div class="lesson-actions">
      <button class="primary-button" id="check-level2">检查并运行</button>
      <button class="secondary-button" id="reset-level2">清空流程图</button>
      <button class="secondary-button hint-toggle" data-hint="2">提示模式</button>
    </div>
    <div class="feedback-box hidden" id="feedback-level2" aria-live="polite"></div>
  `);
}

function flowSlot(expected, classes, nodes, labels, branch = "") {
  const current = nodes[expected];
  const shape = current || expected;
  const shapeClass = shape === "decision" ? "decision-slot" : shape === "input" ? "input-slot" : shape === "start" || shape === "end" ? "terminal-slot" : "";
  const content = current ? labels[current] : `放入“${labels[expected]}”`;
  return `<button class="flow-slot ${classes} ${shapeClass} ${current ? "filled" : ""}" data-flow-slot="${expected}">
    ${branch ? `<span class="branch-label">${branch}</span>` : ""}
    ${shape === "decision" ? `<span class="decision-diamond"><span>${content}</span></span>` : `<span class="flow-slot-content">${content}</span>`}
  </button>`;
}

function renderLevel3() {
  const answer = state.answers.level3;
  return lessonShell(levelMeta[2], `
    <div class="instruction-box"><strong>训练目标：</strong>先预测，再运行。观察流程图和代码如何同时沿着同一条路径工作。</div>
    <div class="simulator">
      <div class="control-panel">
        <label>游客身高（cm）<input id="sim-height" type="number" min="60" max="220" value="${answer.height || 116}"></label>
        <div class="quick-values">
          ${[116,120,138].map(v => `<button class="chip-button" data-height="${v}">${v}cm</button>`).join("")}
        </div>
        <p><strong>先预测票种：</strong></p>
        <div class="prediction-row">
          <button class="option-button ${answer.prediction === "half" ? "selected" : ""}" data-prediction="half">半价票</button>
          <button class="option-button ${answer.prediction === "full" ? "selected" : ""}" data-prediction="full">全价票</button>
        </div>
        <button class="primary-button full-width" id="run-simulator" style="margin-top:16px">运行售票机</button>
        <div class="explain-panel" id="sim-explanation">输入身高并选择预测，点击运行查看判断路径。</div>
      </div>
      <div class="run-visual">
        <div class="mini-flow">
          <div class="mini-flow-node" data-flow-step="input">输入身高</div><span>→</span>
          <div class="mini-flow-node" data-flow-step="condition">身高 &lt; 120？</div>
        </div>
        <div class="mini-flow">
          <div class="mini-flow-node" data-flow-step="half">是：半价票</div><span>或</span>
          <div class="mini-flow-node" data-flow-step="full">否：全价票</div>
        </div>
        <pre class="code-block"><code><span class="code-line" data-code-step="condition">if (height &lt; 120) {</span><span class="code-line" data-code-step="half">    输出("半价票");</span><span class="code-line">} else {</span><span class="code-line" data-code-step="full">    输出("全价票");</span><span class="code-line">}</span></code></pre>
      </div>
    </div>
    <div class="code-completion">
      <h3>补全代码</h3>
      <pre class="code-block"><code>if (height <select class="inline-select" id="code-operator"><option value="">选择条件</option><option value="<">&lt; 120</option><option value="<=">≤ 120</option></select>) {
    输出(<select class="inline-select" id="code-true"><option value="">选择结果</option><option value="half">"半价票"</option><option value="full">"全价票"</option></select>);
} <select class="inline-select" id="code-else"><option value="">选择关键词</option><option value="else">else</option><option value="if">if</option></select> {
    输出("全价票");
}</code></pre>
    </div>
    <div class="lesson-actions">
      <button class="primary-button" id="check-level3">提交本关</button>
      <button class="secondary-button hint-toggle" data-hint="3">提示模式</button>
    </div>
    <div class="feedback-box hidden" id="feedback-level3" aria-live="polite"></div>
  `);
}

function renderLevel4() {
  const answer = state.answers.level4;
  const rows = answer.tests.length ? answer.tests : [119,120,121].map(height => ({ height }));
  return lessonShell(levelMeta[3], `
    <div class="instruction-box"><strong>训练目标：</strong>比较两段程序，用 119、120、121 三个数测试规则边界。</div>
    <div class="program-compare">
      <button class="program-card ${answer.program === "A" ? "selected" : ""}" data-program="A">
        <strong>程序 A</strong><code>if (height &lt; 120) 半价票<br>else 全价票</code>
      </button>
      <button class="program-card ${answer.program === "B" ? "selected" : ""}" data-program="B">
        <strong>程序 B</strong><code>if (height ≤ 120) 半价票<br>else 全价票</code>
      </button>
    </div>
    <table class="test-table">
      <thead><tr><th>输入身高</th><th>规则期望</th><th>程序 A</th><th>程序 B</th><th>发现</th></tr></thead>
      <tbody>
        ${rows.map(({height}) => {
          const expected = height < 120 ? "半价票" : "全价票";
          const a = height < 120 ? "半价票" : "全价票";
          const b = height <= 120 ? "半价票" : "全价票";
          return `<tr><td>${height}cm</td><td>${expected}</td><td>${a}</td><td>${b}</td><td>${a === b ? "结果相同" : `<span class="status-fail">程序 B 不符合规则</span>`}</td></tr>`;
        }).join("")}
      </tbody>
    </table>
    <label style="display:grid;gap:8px;margin-top:20px;font-weight:800">为什么必须测试 120cm？
      <textarea id="boundary-explanation" rows="3" placeholder="请用一句话说明">${escapeHtml(answer.explanation)}</textarea>
    </label>
    <div class="lesson-actions">
      <button class="primary-button" id="check-level4">提交实验结论</button>
      <button class="secondary-button hint-toggle" data-hint="4">提示模式</button>
    </div>
    <div class="feedback-box hidden" id="feedback-level4" aria-live="polite"></div>
  `);
}

function renderLevel5() {
  const order = state.answers.level5.order || ["height", "student"];
  const labels = { height: "先判断：身高是否低于 120cm", student: "再判断：是否持有学生证" };
  return lessonShell(levelMeta[4], `
    <div class="instruction-box"><strong>训练目标：</strong>将学生票加入规则。记住：半价票规则优先，达到 120cm 后才继续判断学生证。</div>
    <h3>1. 拖动条件，排列判断顺序</h3>
    <div class="sortable-list" id="condition-order">
      ${order.map(key => `<div class="sort-item" draggable="true" data-order="${key}"><span class="sort-grip">☷☷</span><strong>${labels[key]}</strong></div>`).join("")}
    </div>
    <h3>2. 用四组游客检查规则</h3>
    <div class="visitor-grid">
      ${[
        ["妹妹",116,true],["小明",138,true],["叔叔",176,false],["小雨",120,true]
      ].map(([name,height,student], i) => `<div class="visitor-card"><span>${i % 2 ? "🧑" : "👧"}</span><strong>${name}</strong><small>${height}cm<br>${student ? "有" : "无"}学生证</small><b>${ticketFor(height, student)}</b></div>`).join("")}
    </div>
    <h3>3. 点击代码行，调整缩进层次</h3>
    <p>内层判断要比外层判断多缩进一级。每点击一次，代码向右移动一级。</p>
    <div class="indent-builder" id="indent-builder">
      ${[
        ["if (height < 120) {",0],
        ['输出("半价票");',1],
        ["} else {",0],
        ["if (hasStudentCard) {",1],
        ['输出("学生票");',2],
        ["} else {",1],
        ['输出("全价票");',2],
        ["}",1],
        ["}",0]
      ].map(([line, correct], i) => {
        const current = state.answers.level5.indent[i] ?? 0;
        return `<div class="indent-line indent-${current}" data-indent-index="${i}" data-correct="${correct}">${escapeHtml(line)}</div>`;
      }).join("")}
    </div>
    <div class="flow-compare">
      <div class="flow-example correct"><strong>合理顺序</strong><p>先看身高。低于 120cm 直接半价；否则再看学生证。</p></div>
      <div class="flow-example wrong"><strong>容易出错的顺序</strong><p>先看学生证，可能让 116cm 且有学生证的游客错买学生票。</p></div>
    </div>
    <div class="lesson-actions">
      <button class="primary-button" id="check-level5">检查升级规则</button>
      <button class="secondary-button" id="level5-video">观看知识讲解</button>
      <button class="secondary-button hint-toggle" data-hint="5">提示模式</button>
    </div>
    <div class="feedback-box hidden" id="feedback-level5" aria-live="polite"></div>
  `);
}

function ticketFor(height, hasStudentCard) {
  if (height < 120) return "半价票";
  return hasStudentCard ? "学生票" : "全价票";
}

function renderProjectLab() {
  const project = CrossDisciplinaryLab.ensureProjectState(state.project);
  state.project = project;
  const preview = CrossDisciplinaryLab.evaluatePolicy(project.policy);
  const evaluation = project.datasetResults.length ? {
    results: project.datasetResults,
    metrics: project.metrics,
    constraints: preview.constraints
  } : preview;
  const acceptance = CrossDisciplinaryLab.projectAcceptance(project);
  const activeStep = Math.min(4, Math.max(1, Number(project.activeStep) || 1));
  const stepDone = {
    1: project.datasetResults.length === 12,
    2: project.mathEvidence.calculation.trim().length >= 12,
    3: project.fairnessEvidence.caseIds.length >= 2 && project.fairnessEvidence.principle.trim().length >= 8,
    4: project.revisions.length >= 1 && project.personalReflection.trim().length >= 8
  };
  const stepLabels = ["设计规则", "数学检查", "公平说明", "同伴修改与评价"];
  return `
    <section class="project-brief student-project-brief" aria-labelledby="project-driving-question">
      <div>
        <span class="eyebrow">四人小组任务</span>
        <h3 id="project-driving-question">怎样制定一套计算机能执行、游客能看懂的票价规则？</h3>
        <p>按四步完成。每一步只解决一个问题，页面会保存小组的答案。</p>
      </div>
      <div class="subject-evidence" aria-label="跨学科证据">
        <span><strong>信息科技</strong>把规则写成分支算法</span>
        <span><strong>数学</strong>计算收入和优惠人数</span>
        <span><strong>公共责任</strong>用游客案例说明公平</span>
      </div>
    </section>
    <nav class="project-step-nav" aria-label="票价公约任务步骤">
      ${stepLabels.map((label, index) => {
        const step = index + 1;
        return `<button type="button" class="${activeStep === step ? "active" : ""} ${stepDone[step] ? "complete" : ""}" data-project-step="${step}"><span>${stepDone[step] ? "✓" : step}</span>${label}</button>`;
      }).join("")}
    </nav>
    <form id="project-lab-form" class="project-lab-form">
      <section class="project-lab-section project-step-panel ${activeStep === 1 ? "active" : ""}" data-project-panel="1">
        <div class="project-section-heading"><span>1</span><div><h3>信息科技：把规则写清楚</h3><p>先选优惠，再决定票价和判断顺序。数字1表示最先判断。</p></div></div>
        <aside class="project-scaffold">
          <strong>本步要完成</strong>
          <ol><li>至少启用两种优惠。</li><li>检查儿童规则是“身高 &lt; 120厘米”。</li><li>点击“运行12名游客”。</li></ol>
          <details><summary>不会时看提示</summary><p>可以先保留儿童票10元和学生票15元，再增加一种优惠；不同规则不能使用相同的判断顺序。</p></details>
        </aside>
        <div class="policy-builder">
          ${project.policy.rules.map(rule => renderPolicyRule(rule)).join("")}
          <div class="policy-default"><strong>默认分支</strong><span>以上条件都不成立 → 全价票 20 元</span></div>
        </div>
        <label>决策流程与伪代码
          <textarea name="projectPseudocode" rows="10" placeholder="系统可以生成骨架，但请根据小组方案检查和修改。">${escapeHtml(project.pseudocode || CrossDisciplinaryLab.generatePseudocode(project.policy))}</textarea>
        </label>
        <div class="project-actions">
          <button type="button" class="primary-button" id="run-project-policy">运行12名游客</button>
          <button type="button" class="secondary-button" id="generate-project-code">按当前规则生成伪代码</button>
          <button type="button" class="secondary-button" data-project-step="2">下一步：数学检查 →</button>
        </div>
      </section>

      <section class="project-lab-section project-step-panel math-lab ${activeStep === 2 ? "active" : ""}" data-project-panel="2">
        <div class="project-section-heading"><span>2</span><div><h3>数学：用数字检查方案</h3><p>程序给出统计结果，小组要写出可以复核的计算过程。</p></div></div>
        <aside class="project-scaffold">
          <strong>先看两个数</strong>
          <p>总收入至少160元；获得优惠的游客至少5人。红色表示还要回到第1步修改。</p>
          <details><summary>计算句式</summary><p>“12张票的价格相加是____元，其中____人票价低于20元，所以方案____要求。”</p></details>
        </aside>
        <div class="project-metrics">
          ${projectMetric("总收入", `${evaluation.metrics.totalIncome}元`, evaluation.metrics.totalIncome >= 160)}
          ${projectMetric("优惠人数", `${evaluation.metrics.discountedCount}人`, evaluation.metrics.discountedCount >= 5)}
          ${projectMetric("冲突案例", `${evaluation.metrics.collisionCount}人`, true, "由优先级解决")}
          ${projectMetric("边界覆盖", `${evaluation.metrics.boundaryCoverage}%`, evaluation.metrics.boundaryCoverage === 100)}
        </div>
        <div class="constraint-strip">
          ${Object.values(preview.constraints).map(item => `<span class="${item.pass ? "pass" : "fail"}">${item.pass ? "✓" : "!"} ${item.label}</span>`).join("")}
        </div>
        <div class="project-table-wrap">
          <table class="project-data-table">
            <thead><tr><th>游客</th><th>关键信息</th><th>命中规则</th><th>出票结果</th></tr></thead>
            <tbody>${evaluation.results.map(projectResultRow).join("")}</tbody>
          </table>
        </div>
        <div class="two-columns">
          <label>我的计算<textarea name="mathCalculation" rows="3" placeholder="把12张票相加：10+15+……=____元；有____人获得优惠。">${escapeHtml(project.mathEvidence.calculation)}</textarea></label>
          <label>比较前后方案<textarea name="mathComparison" rows="3" placeholder="修改____以后，总收入从____变成____，优惠人数从____变成____。">${escapeHtml(project.mathEvidence.comparison)}</textarea></label>
        </div>
        <div class="project-step-actions"><button type="button" class="secondary-button" data-project-step="1">← 返回规则</button><button type="button" class="primary-button" data-project-step="3">下一步：公平说明 →</button></div>
      </section>

      <section class="project-lab-section project-step-panel fairness-lab ${activeStep === 3 ? "active" : ""}" data-project-panel="3">
        <div class="project-section-heading"><span>3</span><div><h3>公共责任：用案例说明公平</h3><p>不能只写“我觉得公平”，要用具体游客说明规则是否一致。</p></div></div>
        <aside class="project-scaffold">
          <strong>公平检查三问</strong>
          <ol><li>同样条件的人，结果一样吗？</li><li>120厘米等边界写清楚了吗？</li><li>同时符合两项优惠时，先后顺序公开了吗？</li></ol>
        </aside>
        <label>我们的公平原则<textarea name="fairnessPrinciple" rows="2" placeholder="对满足相同条件的游客，我们都……；不使用与票价无关的信息。">${escapeHtml(project.fairnessEvidence.principle)}</textarea></label>
        <fieldset class="fairness-cases"><legend>选择至少2名游客作为证据</legend>
          ${CrossDisciplinaryLab.PUBLIC_VISITORS.map(visitor => `<label><input type="checkbox" name="fairnessCase" value="${visitor.id}" ${project.fairnessEvidence.caseIds.includes(visitor.id) ? "checked" : ""}><span>${visitor.name}<small>${visitor.focus}</small></span></label>`).join("")}
        </fieldset>
        <label>用案例解释冲突<textarea name="fairnessConflict" rows="3" placeholder="例如：小芽同时符合儿童和学生优惠，我们先判断____，因为____。">${escapeHtml(project.fairnessEvidence.conflictExplanation)}</textarea></label>
        <div class="project-step-actions"><button type="button" class="secondary-button" data-project-step="2">← 返回数学检查</button><button type="button" class="primary-button" data-project-step="4">下一步：同伴修改 →</button></div>
      </section>

      <section class="project-lab-section project-step-panel audit-lab ${activeStep === 4 ? "active" : ""}" data-project-panel="4">
        <div class="project-section-heading"><span>4</span><div><h3>综合实践：同伴挑战、修改和评价</h3><p>另一小组负责找问题，本小组根据证据修改，最后每个人完成反思。</p></div></div>
        <aside class="project-scaffold">
          <strong>四人分工建议</strong>
          <p>规则员检查算法，计算员核对数据，审查员提出反例，汇报员整理理由。每个人都要能说出一条修改证据。</p>
          <details><summary>同伴怎样提问</summary><p>不要直接给答案，可以问：“哪一位游客能证明你们的判断顺序不会产生冲突？”</p></details>
        </aside>
        <div class="two-columns">
          <label>审查小组/同学<input name="auditReviewer" value="${escapeHtml(project.peerAudit.reviewer)}" placeholder="例如：第3小组"></label>
          <label>问题类型<select name="auditIssueType"><option value="">请选择</option>${["边界不清","优先级冲突","收入不足","优惠覆盖不足","公平证据不足","计算错误"].map(value => `<option ${project.peerAudit.issueType === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
        </div>
        <label>同伴找到的反例<textarea name="auditCounterexample" rows="2" placeholder="例如：119厘米、60岁并持学生证的游客会得到什么票？">${escapeHtml(project.peerAudit.counterexample)}</textarea></label>
        <label>同伴建议<textarea name="auditSuggestion" rows="2" placeholder="请重新检查____，因为这位游客同时符合____。">${escapeHtml(project.peerAudit.suggestion)}</textarea></label>
        <div class="project-actions">
          <button type="button" class="secondary-button" id="run-hidden-cases">运行隐藏反例</button>
          <button type="button" class="secondary-button" id="export-audit-card">导出同伴审查卡</button>
        </div>
        ${project.hiddenResults.length ? `<div class="hidden-case-results"><strong>隐藏反例结果</strong>${project.hiddenResults.map(item => `<span>${escapeHtml(item.visitor.name)}：${item.ticketLabel}${item.price}元 · 命中${item.matchedRules.length}项条件</span>`).join("")}</div>` : ""}
        <label>我们的修改理由<input name="revisionReason" value="${escapeHtml(project.revisionReason)}" placeholder="因为____的数据/质疑，我们把____改成____。"></label>
        <button type="button" class="primary-button" id="record-project-revision">记录一次算法修订</button>
        <div class="revision-timeline">
          ${project.revisions.length ? project.revisions.slice().reverse().map((item, index) => `<article><strong>修订${project.revisions.length - index}</strong><p>${escapeHtml(item.reason)}</p><small>修改前：${escapeHtml(item.before)}<br>修改后：${escapeHtml(item.after)}</small></article>`).join("") : "<p>尚未记录修订。先运行初始方案，再根据数据或同伴质疑修改。</p>"}
        </div>
        <div class="project-final-check">
          <h4>最后检查</h4>
          <div class="two-columns"><label>小组成员<input name="projectMembers" value="${escapeHtml(project.members)}" placeholder="填写4位成员"></label><label>每个人的任务<input name="projectRoles" value="${escapeHtml(project.roles)}" placeholder="规则员、计算员、审查员、汇报员"></label></div>
          <label>2分钟汇报提纲<textarea name="projectDefense" rows="3" placeholder="先说算法规则，再说数学结果，最后回应公平问题。">${escapeHtml(project.defense)}</textarea></label>
          <label>我的个人反思<textarea name="personalReflection" rows="2" placeholder="____这条数据或质疑，让我们把____改成____。">${escapeHtml(project.personalReflection)}</textarea></label>
        </div>
        <div class="acceptance-checks">
          ${Object.values(acceptance.checks).map(item => `<span class="${item.pass ? "pass" : "pending"}">${item.pass ? "✓" : "○"} ${item.label}</span>`).join("")}
        </div>
        <div class="project-step-actions">
          <button type="button" class="secondary-button" data-project-step="3">← 返回公平说明</button>
          <button type="submit" class="primary-button">提交小组方案</button>
          <button type="button" class="secondary-button" id="open-final-check">进入个人小测与自评 →</button>
        </div>
      </section>
    </form>`;
}

function renderPolicyRule(rule) {
  const meta = CrossDisciplinaryLab.RULE_META[rule.id];
  const numeric = ["child", "elder"].includes(rule.id);
  const operators = rule.id === "child"
    ? [["lt", "<"], ["lte", "≤"]]
    : [["gte", "≥"], ["gt", ">"]];
  const plainCondition = rule.id === "student" ? "持有学生证" : "与家庭成员同行";
  return `<article class="policy-rule" data-rule-id="${rule.id}">
    <label class="rule-toggle"><input type="checkbox" name="ruleEnabled" value="${rule.id}" ${rule.enabled ? "checked" : ""}><span><strong>${meta.label}</strong><small>勾选后使用这条规则</small></span></label>
    <div class="policy-condition-editor">
      <span>条件</span>
      ${numeric ? `<div><strong>${meta.fieldLabel}</strong><select name="ruleOperator-${rule.id}" aria-label="${meta.label}比较符">${operators.map(([value, label]) => `<option value="${value}" ${rule.operator === value ? "selected" : ""}>${label}</option>`).join("")}</select><input type="number" name="ruleThreshold-${rule.id}" value="${rule.threshold}" min="0" max="220" aria-label="${meta.label}阈值"><small>${meta.valueLabel}</small></div>` : `<strong>${plainCondition}</strong>`}
    </div>
    <label>优惠票价<input type="number" name="rulePrice-${rule.id}" value="${rule.price}" min="0" max="20" step="1"><small>0—20元整数</small></label>
    <label>判断顺序<select name="rulePriority-${rule.id}">${[1,2,3,4].map(value => `<option value="${value}" ${rule.priority === value ? "selected" : ""}>第${value}个</option>`).join("")}</select><small>不能与其他规则重复</small></label>
  </article>`;
}

function projectMetric(label, value, pass, note = "") {
  return `<article class="${pass ? "pass" : "fail"}"><span>${label}</span><strong>${value}</strong>${note ? `<small>${note}</small>` : ""}</article>`;
}

function projectResultRow(item) {
  const visitor = item.visitor;
  const hit = item.matchedRules.length ? item.matchedRules.map(id => CrossDisciplinaryLab.RULE_META[id]?.label || id).join("、") : "无（默认分支）";
  const facts = [`${visitor.height}cm`, `${visitor.age}岁`, visitor.student ? "有学生证" : "无学生证", visitor.family ? "家庭同行" : "非家庭同行"];
  return `<tr class="${item.collision ? "collision" : ""}"><td><strong>${escapeHtml(visitor.name)}</strong><small>${escapeHtml(visitor.focus || "")}</small></td><td>${facts.join(" · ")}</td><td>${hit}${item.collision ? "<small>同时符合多项，按顺序出票</small>" : ""}</td><td><strong>${item.ticketLabel}</strong><br>${item.price}元</td></tr>`;
}

function attachLevelHandlers() {
  document.querySelectorAll("[data-phase]").forEach(btn => btn.addEventListener("click", () => {
    const phase = phaseMeta[Number(btn.dataset.phase) - 1];
    state.currentLevel = phase.levels[0];
    saveState();
    renderMap();
    updateAssistantContext();
  }));
  document.querySelectorAll(".level-tab").forEach(btn => btn.addEventListener("click", () => {
    if (!btn.dataset.level) return;
    state.currentLevel = Number(btn.dataset.level);
    saveState();
    renderMap();
    updateAssistantContext();
  }));
  document.querySelectorAll(".substep-tab").forEach(btn => btn.addEventListener("click", () => {
    if (btn.hasAttribute("data-open-final-evaluation")) {
      switchPage("evaluation");
      return;
    }
    state.currentLevel = Number(btn.dataset.level);
    saveState();
    renderMap();
    updateAssistantContext();
  }));
  document.getElementById("previous-stage").addEventListener("click", () => {
    if (state.currentLevel <= 1) return;
    state.currentLevel -= 1;
    saveState();
    renderMap();
  });
  document.getElementById("next-stage").addEventListener("click", () => {
    if (state.currentLevel >= 5) {
      switchPage("evaluation");
      return;
    }
    state.currentLevel += 1;
    saveState();
    renderMap();
  });
  document.querySelectorAll("[data-learning-view]").forEach(button => button.addEventListener("click", () => {
    const view = button.dataset.learningView;
    const segment = knowledgeSegments[state.currentLevel];
    if (view === "challenge" && segment && !state.knowledge.segments[segment.key].completedAt) {
      showToast("建议先完成知识学习。你可以先体验游戏，遇到困难再回来复习。");
    }
    state.knowledge.activeViews[state.currentLevel] = view;
    saveState();
    renderMap();
  }));
  const learningSegment = state.currentLevel === 5 ? null : knowledgeSegments[state.currentLevel];
  const activeView = learningSegment ? state.knowledge.activeViews[state.currentLevel] || "learn" : "challenge";
  if (learningSegment && activeView === "learn") {
    attachKnowledgePanel(state.currentLevel);
  } else if (state.currentLevel === 5) {
    attachProjectLab();
  } else if (state.currentLevel === 4 && window.RuleLab) {
    window.RuleLab.attach(state.currentLevel, {
      state,
      save: saveState,
      complete: markComplete,
      toast: showToast,
      rerender: renderMap,
      evaluateThinking: level => LearningModel.thinkingEligible(state, level).earned,
      syncThinking: level => {
        const entry = state.worksheet.entries[level];
        entry.explanation = state.game.missions[level].review;
        updateThinkingStar(level);
      }
    });
  } else {
    TicketGame.attach(state.currentLevel, {
      state,
      save: saveState,
      complete: markComplete,
      toast: showToast,
      rerender: renderMap,
      onRunComplete: handleGameRunComplete,
      evaluateThinking: level => LearningModel.thinkingEligible(state, level).earned,
      syncThinking: level => {
        const entry = state.worksheet.entries[level];
        entry.explanation = state.game.missions[level].review;
        updateThinkingStar(level);
      }
    });
    attachInquiryPanel(state.currentLevel);
  }
}

function handleGameRunComplete(level, mission) {
  LearningModel.diagnoseMission(state, level, mission);
  if ([4, 5].includes(Number(level))) {
    state.inquiry[level].experiments = structuredClone(mission.lastRun || []);
    state.inquiry[level].explanation ||= state.worksheet.entries[level].explanation || mission.review || "";
    const list = document.getElementById("inquiry-experiment-list");
    if (list) {
      list.innerHTML = inquiryExperimentMarkup(level);
      attachInquiryEvidenceInputs(level);
    }
    const explanation = document.querySelector('[data-inquiry-field="explanation"]');
    if (explanation && !explanation.value) explanation.value = state.inquiry[level].explanation;
  }
}

function attachInquiryPanel(level) {
  if (![4, 5].includes(Number(level))) return;
  document.querySelectorAll("[data-inquiry-field]").forEach(field => field.addEventListener("input", () => {
    state.inquiry[level][field.dataset.inquiryField] = field.value;
    if (field.dataset.inquiryField === "explanation") {
      state.worksheet.entries[level].explanation = field.value;
      state.game.missions[level].review = field.value;
      const review = document.getElementById("game-review-text");
      if (review) review.value = field.value;
      updateThinkingStar(level, false);
    }
    saveState();
  }));
  attachInquiryEvidenceInputs(level);
}

function attachInquiryEvidenceInputs(level) {
  document.querySelectorAll("[data-inquiry-evidence]").forEach(input => input.addEventListener("change", () => {
    const index = Number(input.dataset.inquiryEvidence);
    const selected = new Set(state.inquiry[level].citedEvidence || []);
    if (input.checked) selected.add(index);
    else selected.delete(index);
    state.inquiry[level].citedEvidence = [...selected].sort((a, b) => a - b);
    saveState();
  }));
}

function attachKnowledgePanel(level) {
  const segment = knowledgeSegments[level];
  const saved = state.knowledge.segments[segment.key];
  document.querySelectorAll("[data-knowledge-page]").forEach(button => button.addEventListener("click", () => {
    const current = state.knowledge.pageIndexes[segment.key] || 0;
    state.knowledge.pageIndexes[segment.key] = Math.max(0, Math.min(segment.pages.length - 1, current + Number(button.dataset.knowledgePage)));
    saveState();
    renderMap();
  }));
  const videoButton = document.getElementById("knowledge-video-link");
  if (videoButton && !videoButton.disabled) {
    videoButton.addEventListener("click", () => {
      state.knowledge.videoOpened = true;
      saveState();
      openMedia("知识讲解");
    });
  }
  document.getElementById("submit-knowledge-check").addEventListener("click", () => {
    const answers = {};
    let complete = true;
    segment.questions.forEach((_, index) => {
      const selected = document.querySelector(`input[name="knowledge-${index}"]:checked`);
      if (!selected) complete = false;
      else answers[index] = Number(selected.value);
    });
    if (!complete) return showToast("请先完成两道知识检查题。");
    saved.answers = answers;
    saved.score = segment.questions.reduce((score, item, index) => score + (answers[index] === item.answer ? 1 : 0), 0);
    saved.submitted = true;
    LearningModel.diagnoseKnowledge(state, level, segment, answers);
    saveState();
    renderMap();
  });
  document.getElementById("finish-knowledge").addEventListener("click", () => {
    if (!saved.submitted) showToast("还没有提交知识检查，你仍可以先进入挑战。");
    saved.completedAt ||= new Date().toISOString();
    state.knowledge.activeViews[level] = "challenge";
    saveState();
    renderMap();
  });
}

function feedback(id, message, type = "") {
  const el = document.getElementById(id);
  el.className = `feedback-box ${type}`;
  el.innerHTML = message;
}

function attachLevel1() {
  document.querySelectorAll("[data-character] .option-button").forEach(btn => btn.addEventListener("click", () => {
    const key = btn.closest("[data-character]").dataset.character;
    state.answers.level1[key] = btn.dataset.ticket;
    saveState();
    renderMap();
  }));
  document.querySelectorAll("[data-logic]").forEach(card => {
    card.addEventListener("dragstart", () => draggedLogic = Number(card.dataset.logic));
    card.addEventListener("click", () => {
      const logic = state.answers.level1.logic;
      if (!logic.includes(Number(card.dataset.logic)) && logic.length < 3) logic.push(Number(card.dataset.logic));
      saveState();
      renderMap();
    });
  });
  document.querySelectorAll("[data-logic-slot]").forEach(slot => {
    slot.addEventListener("dragover", e => e.preventDefault());
    slot.addEventListener("drop", () => {
      const index = Number(slot.dataset.logicSlot);
      const logic = state.answers.level1.logic.filter(v => v !== draggedLogic);
      logic[index] = draggedLogic;
      state.answers.level1.logic = logic.filter(v => v !== undefined);
      saveState();
      renderMap();
    });
    slot.addEventListener("click", () => {
      const index = Number(slot.dataset.logicSlot);
      state.answers.level1.logic.splice(index, 1);
      saveState();
      renderMap();
    });
  });
  document.getElementById("reset-level1").addEventListener("click", () => {
    state.answers.level1.logic = [];
    saveState(); renderMap();
  });
  document.getElementById("check-level1").addEventListener("click", () => {
    markAttempt(1);
    const a = state.answers.level1;
    const correct = a.xiaoming === "full" && a.sister === "half" && JSON.stringify(a.logic) === "[0,1,2]";
    if (correct) {
      feedback("feedback-level1", "<strong>✓ 判断正确！</strong> 你已经把生活中的购票规则整理成了“条件—选择—结果”。", "success");
      markComplete(1);
    } else {
      const issue = !a.xiaoming || !a.sister ? "还有人物没有选择票种。" : "重新比较人物身高与 120cm，并检查卡片是否按“先条件、再选择、后结果”排列。";
      feedback("feedback-level1", `<strong>再想一想：</strong>${issue}`, "error");
      saveState();
    }
  });
}

function attachLevel2() {
  document.querySelectorAll("[data-node]").forEach(node => {
    node.addEventListener("dragstart", () => draggedNode = node.dataset.node);
    node.addEventListener("click", () => {
      const next = ["start","input","decision","half","full","end"].find(key => !state.answers.level2.nodes[key]);
      if (next) state.answers.level2.nodes[next] = node.dataset.node;
      saveState(); renderMap();
    });
  });
  document.querySelectorAll("[data-flow-slot]").forEach(slot => {
    slot.addEventListener("dragover", e => e.preventDefault());
    slot.addEventListener("drop", () => {
      state.answers.level2.nodes[slot.dataset.flowSlot] = draggedNode;
      saveState(); renderMap();
    });
    slot.addEventListener("click", () => {
      delete state.answers.level2.nodes[slot.dataset.flowSlot];
      saveState(); renderMap();
    });
  });
  document.getElementById("reset-level2").addEventListener("click", () => {
    state.answers.level2.nodes = {};
    saveState(); renderMap();
  });
  document.getElementById("check-level2").addEventListener("click", async () => {
    markAttempt(2);
    const nodes = state.answers.level2.nodes;
    const expected = ["start","input","decision","half","full","end"];
    const correct = expected.every(key => nodes[key] === key);
    if (!correct) {
      feedback("feedback-level2", "<strong>流程还没有接通。</strong>判断菱形必须分出“是”和“否”两条路径，每个位置也要放入对应节点。", "error");
      saveState();
      return;
    }
    const canvas = document.getElementById("flow-canvas");
    const runner = document.createElement("div");
    runner.className = "flow-runner";
    runner.textContent = "人";
    canvas.append(runner);
    const path = ["start","input","decision","half","end"];
    for (const key of path) {
      const slot = canvas.querySelector(`[data-flow-slot="${key}"]`);
      runner.style.left = `${slot.offsetLeft + slot.offsetWidth / 2 - 17}px`;
      runner.style.top = `${slot.offsetTop + slot.offsetHeight / 2 - 17}px`;
      await new Promise(resolve => setTimeout(resolve, 520));
    }
    feedback("feedback-level2", "<strong>✓ 路线正确！</strong>116cm 小于 120cm，所以程序沿“是”路径到达半价票。", "success");
    markComplete(2);
  });
}

function attachLevel3() {
  document.querySelectorAll("[data-height]").forEach(btn => btn.addEventListener("click", () => {
    document.getElementById("sim-height").value = btn.dataset.height;
    state.answers.level3.height = Number(btn.dataset.height);
    saveState();
  }));
  document.querySelectorAll("[data-prediction]").forEach(btn => btn.addEventListener("click", () => {
    state.answers.level3.prediction = btn.dataset.prediction;
    saveState(); renderMap();
  }));
  document.getElementById("sim-height").addEventListener("change", e => {
    state.answers.level3.height = Number(e.target.value);
    saveState();
  });
  document.getElementById("run-simulator").addEventListener("click", async () => {
    const height = Number(document.getElementById("sim-height").value);
    if (!height || height < 60 || height > 220) return showToast("请输入 60 至 220cm 之间的身高。");
    if (!state.answers.level3.prediction) return showToast("请先预测票种，再运行售票机。");
    state.answers.level3.height = height;
    const result = height < 120 ? "half" : "full";
    state.answers.level3.result = result;
    document.querySelectorAll("[data-flow-step], [data-code-step]").forEach(el => el.classList.remove("active"));
    for (const step of ["input", "condition", result]) {
      document.querySelectorAll(`[data-flow-step="${step}"], [data-code-step="${step}"]`).forEach(el => el.classList.add("active"));
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    const correctPrediction = result === state.answers.level3.prediction;
    document.getElementById("sim-explanation").innerHTML = `<strong>${correctPrediction ? "预测正确" : "预测与结果不同"}：</strong>${height} ${height < 120 ? "小于" : "不小于"} 120，所以条件为“${height < 120 ? "成立" : "不成立"}”，程序输出${result === "half" ? "半价票" : "全价票"}。`;
    saveState();
  });
  document.getElementById("check-level3").addEventListener("click", () => {
    markAttempt(3);
    const op = document.getElementById("code-operator").value;
    const truth = document.getElementById("code-true").value;
    const elseValue = document.getElementById("code-else").value;
    const hasRun = Boolean(state.answers.level3.result);
    if (hasRun && op === "<" && truth === "half" && elseValue === "else") {
      state.answers.level3.codeComplete = true;
      feedback("feedback-level3", "<strong>✓ 图和代码成功对应！</strong>判断菱形对应 if 条件，两条路径对应 if 和 else 中的输出。", "success");
      markComplete(3);
    } else {
      feedback("feedback-level3", `<strong>还差一点：</strong>${!hasRun ? "请先运行一次售票机。" : "检查边界规则、条件成立时的票种，以及表示“否则”的关键词。"}`, "error");
      saveState();
    }
  });
}

function attachLevel4() {
  document.querySelectorAll("[data-program]").forEach(card => card.addEventListener("click", () => {
    state.answers.level4.program = card.dataset.program;
    saveState(); renderMap();
  }));
  document.getElementById("boundary-explanation").addEventListener("input", e => {
    state.answers.level4.explanation = e.target.value;
    saveState();
  });
  document.getElementById("check-level4").addEventListener("click", () => {
    markAttempt(4);
    const explanation = document.getElementById("boundary-explanation").value.trim();
    state.answers.level4.explanation = explanation;
    state.answers.level4.tests = [119,120,121].map(height => ({
      height,
      expected: height < 120 ? "半价票" : "全价票",
      programA: height < 120 ? "半价票" : "全价票",
      programB: height <= 120 ? "半价票" : "全价票"
    }));
    const mentionsBoundary = /120|边界|临界|小于|等于/.test(explanation);
    if (state.answers.level4.program === "A" && explanation.length >= 8 && mentionsBoundary) {
      feedback("feedback-level4", "<strong>✓ 找到边界错误！</strong>程序 A 符合规则。120cm 正好位于条件变化的位置，最容易暴露“&lt;”和“≤”的差别。", "success");
      markComplete(4);
    } else {
      feedback("feedback-level4", `<strong>请继续检查：</strong>${state.answers.level4.program !== "A" ? "统一规则是“低于 120cm”，请观察 120cm 在两段程序中的结果。" : "请说明 120cm 为什么能帮助区分两个条件。"}`, "error");
      saveState();
    }
  });
}

function attachLevel5() {
  document.querySelectorAll("[data-order]").forEach(item => {
    item.addEventListener("dragstart", () => draggedOrder = item.dataset.order);
    item.addEventListener("dragover", e => e.preventDefault());
    item.addEventListener("drop", () => {
      const target = item.dataset.order;
      const order = state.answers.level5.order.filter(key => key !== draggedOrder);
      order.splice(order.indexOf(target), 0, draggedOrder);
      state.answers.level5.order = order;
      saveState(); renderMap();
    });
  });
  document.querySelectorAll("[data-indent-index]").forEach(line => line.addEventListener("click", () => {
    const index = Number(line.dataset.indentIndex);
    const current = state.answers.level5.indent[index] ?? 0;
    state.answers.level5.indent[index] = (current + 1) % 3;
    saveState(); renderMap();
  }));
  document.getElementById("level5-video").addEventListener("click", () => openMedia("知识讲解"));
  document.getElementById("check-level5").addEventListener("click", () => {
    markAttempt(5);
    const correctIndent = [0,1,0,1,2,1,2,1,0];
    const current = correctIndent.map((_, i) => state.answers.level5.indent[i] ?? 0);
    const orderCorrect = JSON.stringify(state.answers.level5.order) === '["height","student"]';
    const indentCorrect = current.every((value, i) => value === correctIndent[i]);
    state.answers.level5.visitorResults = [
      {name:"妹妹", result:"半价票"}, {name:"小明", result:"学生票"},
      {name:"叔叔", result:"全价票"}, {name:"小雨", result:"学生票"}
    ];
    if (orderCorrect && indentCorrect) {
      feedback("feedback-level5", "<strong>✓ 升级成功！</strong>你先处理身高规则，再在外层 else 中判断学生证；缩进也清楚表示了两层结构。", "success");
      markComplete(5);
    } else {
      feedback("feedback-level5", `<strong>检查两件事：</strong>${!orderCorrect ? "半价票规则应先于学生证规则。" : ""}${!indentCorrect ? " 内层 if 及其输出应比外层代码多缩进一级。" : ""}`, "error");
      saveState();
    }
  });
}

function attachProjectLab() {
  const form = document.getElementById("project-lab-form");
  if (!form) return;

  document.querySelectorAll("[data-project-step]").forEach(button => button.addEventListener("click", () => {
    collectProjectForm(form);
    const target = Math.min(4, Math.max(1, Number(button.dataset.projectStep) || 1));
    state.project.activeStep = target;
    saveState();
    renderMap();
  }));

  document.getElementById("open-final-check")?.addEventListener("click", () => {
    collectProjectForm(form);
    saveState();
    switchPage("evaluation");
  });

  document.getElementById("run-project-policy").addEventListener("click", () => {
    collectProjectForm(form);
    const evaluated = CrossDisciplinaryLab.evaluatePolicy(state.project.policy);
    state.project.datasetResults = evaluated.results;
    state.project.metrics = evaluated.metrics;
    state.project.mathEvidence.totalIncome = evaluated.metrics.totalIncome;
    state.project.mathEvidence.discountedCount = evaluated.metrics.discountedCount;
    state.game.missions[5].attempts = Number(state.game.missions[5].attempts || 0) + 1;
    state.game.missions[5].lastRun = evaluated.results.map(item => ({
      visitor: item.visitor,
      actual: item.ticketId === "full" ? "full" : "custom",
      expected: item.ticketId === "full" ? "full" : "custom",
      correct: true,
      price: item.price,
      matchedRules: item.matchedRules
    }));
    state.game.missions[5].earned.accuracy = evaluated.metrics.allConstraintsPass;
    state.game.missions[5].earned.logic = evaluated.metrics.uniqueOutcomes && evaluated.metrics.boundaryCoverage === 100;
    saveState();
    showToast(evaluated.metrics.allConstraintsPass ? "12名游客运行完成，当前方案满足全部硬约束。" : "运行完成。请根据红色约束提示继续修改方案。");
    renderMap();
  });

  document.getElementById("generate-project-code").addEventListener("click", () => {
    collectProjectForm(form);
    state.project.pseudocode = CrossDisciplinaryLab.generatePseudocode(state.project.policy);
    saveState();
    renderMap();
    showToast("已按当前优先级生成伪代码骨架，请小组逐行检查。");
  });

  document.getElementById("run-hidden-cases").addEventListener("click", () => {
    collectProjectForm(form);
    const hidden = CrossDisciplinaryLab.evaluatePolicy(state.project.policy, CrossDisciplinaryLab.HIDDEN_VISITORS);
    state.project.hiddenResults = hidden.results;
    saveState();
    renderMap();
    showToast("隐藏反例已运行。请检查多条件游客的优先级是否符合你们的公平原则。");
  });

  document.getElementById("record-project-revision").addEventListener("click", () => {
    collectProjectForm(form);
    const reason = state.project.revisionReason.trim();
    if (reason.length < 4) return showToast("请先写明哪条数据或质疑促使你修改（至少4个字）。");
    if (CrossDisciplinaryLab.policiesEqual(state.project.lastPolicy, state.project.policy)) {
      return showToast("当前规则与上一版相同，请先修改条件、票价或优先级。");
    }
    state.project.revisions.push(CrossDisciplinaryLab.buildRevision(state.project.lastPolicy, state.project.policy, reason));
    state.project.lastPolicy = structuredClone(state.project.policy);
    state.project.revisionReason = "";
    saveState();
    renderMap();
    showToast("本次算法修订已加入证据链。");
  });

  document.getElementById("export-audit-card").addEventListener("click", () => {
    collectProjectForm(form);
    const payload = {
      title: "智慧乐园票价公约同伴审查卡",
      exportedAt: new Date().toISOString(),
      group: state.learner.group || "未填写小组",
      policy: state.project.policy,
      policySummary: CrossDisciplinaryLab.policySummary(state.project.policy),
      metrics: CrossDisciplinaryLab.evaluatePolicy(state.project.policy).metrics,
      peerAudit: state.project.peerAudit,
      fairnessEvidence: state.project.fairnessEvidence
    };
    downloadJson(payload, `${state.learner.group || "小组"}-票价公约同伴审查卡.json`);
    saveState();
    showToast("同伴审查卡已导出，可交给另一小组填写或核对。");
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    collectProjectForm(form);
    const acceptance = CrossDisciplinaryLab.projectAcceptance(state.project);
    if (!acceptance.pass) {
      const pending = Object.values(acceptance.checks).filter(item => !item.pass).map(item => item.label).slice(0, 3);
      saveState();
      return showToast(`方案包还缺少：${pending.join("；")}${Object.values(acceptance.checks).filter(item => !item.pass).length > 3 ? "……" : ""}`);
    }
    state.project.datasetResults = acceptance.evaluation.results;
    state.project.metrics = acceptance.evaluation.metrics;
    state.project.submittedAt = new Date().toISOString();
    state.answers.task = {
      offer: "智慧乐园票价公约",
      price: "基础票20元",
      condition: CrossDisciplinaryLab.policySummary(state.project.policy),
      order: state.project.policy.rules.slice().sort((a, b) => a.priority - b.priority).map(rule => rule.id).join("→"),
      fairness: state.project.fairnessEvidence.principle,
      pseudocode: state.project.pseudocode,
      members: state.project.members,
      roles: state.project.roles,
      tests: state.project.datasetResults.map(item => ({ input: item.visitor.id, expected: `${item.ticketLabel}${item.price}元` }))
    };
    state.worksheet.entries[5].explanation = state.project.personalReflection;
    state.game.missions[5].review = state.project.personalReflection;
    state.game.missions[5].earned.accuracy = true;
    state.game.missions[5].earned.logic = true;
    updateThinkingStar(5, false);
    markComplete(5);
    try {
      const result = await submitLearningData("creative-task-v2", structuredClone(state.project));
      if (result.stored === "remote") showToast("跨学科方案包已提交到在线收集端。");
      else showToast("跨学科方案包已保存在当前浏览器，可导出学习记录提交。");
    } catch {
      showToast("在线提交失败，方案包已在本地保存，可导出学习记录后提交。");
    }
    renderMap();
  });
}

function collectProjectForm(form) {
  const data = new FormData(form);
  const enabled = new Set(data.getAll("ruleEnabled"));
  const previousPolicy = CrossDisciplinaryLab.normalizePolicy(state.project.policy);
  const previousGeneratedCode = CrossDisciplinaryLab.generatePseudocode(previousPolicy);
  const current = structuredClone(previousPolicy);
  current.rules = current.rules.map(rule => ({
    ...rule,
    enabled: enabled.has(rule.id),
    operator: data.get(`ruleOperator-${rule.id}`) || rule.operator,
    threshold: ["student", "family"].includes(rule.id) ? true : Number(data.get(`ruleThreshold-${rule.id}`)),
    price: Number(data.get(`rulePrice-${rule.id}`)),
    priority: Number(data.get(`rulePriority-${rule.id}`))
  }));
  const policyChanged = !CrossDisciplinaryLab.policiesEqual(previousPolicy, current);
  if (policyChanged) {
    state.project.datasetResults = [];
    state.project.hiddenResults = [];
    state.project.metrics = null;
  }
  state.project.policy = current;
  const enteredCode = String(data.get("projectPseudocode") || "").trim();
  state.project.pseudocode = policyChanged && (!state.project.pseudocode || enteredCode === previousGeneratedCode)
    ? CrossDisciplinaryLab.generatePseudocode(current)
    : enteredCode;
  state.project.mathEvidence = {
    ...state.project.mathEvidence,
    calculation: String(data.get("mathCalculation") || "").trim(),
    comparison: String(data.get("mathComparison") || "").trim()
  };
  state.project.fairnessEvidence = {
    principle: String(data.get("fairnessPrinciple") || "").trim(),
    caseIds: data.getAll("fairnessCase"),
    conflictExplanation: String(data.get("fairnessConflict") || "").trim()
  };
  state.project.peerAudit = {
    reviewer: String(data.get("auditReviewer") || "").trim(),
    issueType: String(data.get("auditIssueType") || "").trim(),
    counterexample: String(data.get("auditCounterexample") || "").trim(),
    suggestion: String(data.get("auditSuggestion") || "").trim()
  };
  state.project.revisionReason = String(data.get("revisionReason") || "").trim();
  state.project.members = String(data.get("projectMembers") || "").trim();
  state.project.roles = String(data.get("projectRoles") || "").trim();
  state.project.defense = String(data.get("projectDefense") || "").trim();
  state.project.personalReflection = String(data.get("personalReflection") || "").trim();
}

function downloadJson(value, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function showHint(level) {
  state.hints[level] = (state.hints[level] || 0) + 1;
  const diagnosis = LearningModel.currentDiagnosis(state, level);
  const hints = {
    1: "先找条件：谁的身高低于 120cm？条件成立后会执行哪个结果？",
    2: "流程从“开始”向下执行。判断框之后必须分为“是”和“否”两条路。",
    3: "统一规则使用严格小于号“<”。条件不成立时需要使用 else。",
    4: "先完成边界排错，再比较两种顺序的收入与优惠人数，最后用一位游客说明公平。",
    5: "先运行12名游客，再用总收入、优惠人数和一名冲突游客说明当前方案哪里需要修改。"
  };
  showToast(`${diagnosis ? `${diagnosis.label} · ${diagnosis.hintLevel}级提示` : "提示"}：${diagnosis?.hint || hints[level]}`);
  saveState();
}

function renderWorksheet() {
  TicketGame.ensureGameState(state);
  const mission = level => state.game.missions[level];
  const knowledgeForLevel = level => {
    const segment = knowledgeSegments[level];
    return segment ? state.knowledge.segments[segment.key] : null;
  };
  const runSummary = level => {
    const latest = mission(level).lastRun || [];
    if (!latest.length) return "尚未运行游客队列";
    return latest.map(item => `${item.visitor.name}：${item.correct ? "正确到达" : "误入"}${item.actual === "half" ? "半价票" : item.actual === "student" ? "学生票" : item.actual === "custom" ? "创意票" : "全价票"}`).join("；");
  };
  const pendingCount = levelMeta.filter(level => !LearningModel.thinkingEligible(state, level.id).earned).length;
  const correctionCount = levelMeta.filter(level => {
    const entry = state.worksheet.entries[level.id];
    return mission(level.id).lastRun?.some(item => !item.correct) || entry.correction.trim();
  }).length;
  const filters = [
    ["all", "全部档案", levelMeta.length],
    ["pending", "待补充", pendingCount],
    ["correction", "纠错记录", correctionCount]
  ];
  const visibleLevels = levelMeta.filter(level => {
    const entry = state.worksheet.entries[level.id];
    const hasError = mission(level.id).lastRun?.some(item => !item.correct);
    if (state.worksheet.filter === "pending") return !LearningModel.thinkingEligible(state, level.id).earned;
    if (state.worksheet.filter === "correction") return hasError || entry.correction.trim();
    return true;
  });
  document.getElementById("worksheet-content").innerHTML = `
    <div class="worksheet-toolbar">
      <div>
        <span class="eyebrow">MISSION RECORDS</span>
        <h2>我的五段闯关记录</h2>
      </div>
      <div class="worksheet-filters" role="group" aria-label="筛选任务单">
        ${filters.map(([value, label, count]) => `<button type="button" class="${state.worksheet.filter === value ? "active" : ""}" data-worksheet-filter="${value}">${label}<span>${count}</span></button>`).join("")}
      </div>
    </div>
    <div class="learning-timeline">
      ${visibleLevels.length ? visibleLevels.map(level => {
        const entry = state.worksheet.entries[level.id];
        const savedMission = mission(level.id);
        const knowledge = knowledgeForLevel(level.id);
        const hasError = savedMission.lastRun?.some(item => !item.correct);
        const thinkingEvidence = LearningModel.thinkingEligible(state, level.id);
        const thinkingComplete = thinkingEvidence.earned;
        const diagnoses = state.learnerModel.history.filter(item => item.level === level.id).slice(-3).reverse();
        return `
          <article class="worksheet-section learning-record ${hasError ? "has-error" : ""}" data-worksheet-level="${level.id}" style="--record-color:${level.color}">
            <div class="timeline-marker">${level.id}</div>
            <header>
              <div class="record-heading">
                <span class="record-kicker">训练档案 ${String(level.id).padStart(2, "0")}</span>
                <h2>${level.title}</h2>
                <p>${level.subtitle}</p>
              </div>
              <div class="record-status">
                <span data-record-stars>${savedMission.bestStars}/3 ★</span>
                <strong data-thinking-status class="${thinkingComplete ? "complete" : ""}">${thinkingComplete ? "思考星已获得" : "待完成解释"}</strong>
              </div>
            </header>
            <div class="record-zone record-departure">
              <div class="record-zone-title"><span>01</span><div><strong>出发前</strong><small>先预测，再写下本关规则</small></div></div>
              <div class="record-grid">
                <label>我的预测
                  <textarea rows="2" data-worksheet-field="prediction" placeholder="运行闸机前，我认为……">${escapeHtml(entry.prediction)}</textarea>
                </label>
                <label>知识要点
                  <textarea rows="2" data-worksheet-field="keyPoint" placeholder="用自己的话写下本关规则">${escapeHtml(entry.keyPoint)}</textarea>
                </label>
              </div>
            </div>
            <div class="record-zone record-proof">
              <div class="record-zone-title"><span>02</span><div><strong>闸机记录</strong><small>系统自动收集的学习证据</small></div></div>
              <div class="system-evidence">
                <div class="evidence-badges">
                  <span>尝试 ${savedMission.attempts || 0} 次</span>
                  <span data-evidence-stars>最佳 ${savedMission.bestStars}/3 星</span>
                  ${knowledge ? `<span>知识检查 ${knowledge.submitted ? `${knowledge.score}/2` : "未提交"}</span>` : ""}
                </div>
                <p>${escapeHtml(runSummary(level.id))}</p>
                ${savedMission.lastRun?.length ? `<div class="evidence-citations">
                  <strong>引用一条证据到解释中：</strong>
                  ${savedMission.lastRun.map((item, index) => `<button type="button" data-cite-evidence="${index}">${escapeHtml(item.visitor.name)} ${item.visitor.height}cm</button>`).join("")}
                </div>` : ""}
              </div>
            </div>
            <div class="record-zone record-review">
              <div class="record-zone-title"><span>03</span><div><strong>复盘站</strong><small>把错误变成下一次成功的线索</small></div></div>
              <div class="review-grid">
                <label class="correction-field">错误修正 ${hasError ? `<small>发现过错误路径，请记录怎样修改。</small>` : ""}
                  <textarea rows="3" data-worksheet-field="correction" placeholder="第一次哪里出错？后来怎样修改？">${escapeHtml(entry.correction)}</textarea>
                </label>
                <label class="explanation-field"><b>${worksheetPrompts[level.id - 1]}</b>
                  <textarea rows="3" data-worksheet-field="explanation" placeholder="引用一条运行证据，并用关键概念说明理由">${escapeHtml(entry.explanation)}</textarea>
                  <small>${thinkingStatusText(thinkingEvidence, entry.explanation)}</small>
                </label>
              </div>
              ${level.id === 5 ? renderProjectWorksheetEvidence() : ""}
              ${diagnoses.length ? `<div class="diagnosis-trail"><strong>诊断与修正记录</strong>${diagnoses.map(item =>
                `<span class="${item.resolved ? "resolved" : ""}">${escapeHtml(LearningModel.ERROR_META[item.type]?.label || item.type)} · ${item.resolved ? "已修正" : `${item.hintLevel}级提示`}${item.detail ? ` · ${escapeHtml(item.detail)}` : ""}</span>`).join("")}</div>` : ""}
            </div>
          </article>`;
      }).join("") : `<div class="worksheet-empty">当前筛选条件下没有任务记录。</div>`}
    </div>`;
  document.querySelectorAll("[data-worksheet-filter]").forEach(button => button.addEventListener("click", () => {
    state.worksheet.filter = button.dataset.worksheetFilter;
    saveState();
    renderWorksheet();
  }));
  document.querySelectorAll("[data-worksheet-field]").forEach(field => field.addEventListener("input", () => {
    const level = Number(field.closest("[data-worksheet-level]").dataset.worksheetLevel);
    const key = field.dataset.worksheetField;
    state.worksheet.entries[level][key] = field.value;
    if (key === "explanation") {
      state.game.missions[level].review = field.value;
      updateThinkingStar(level, false);
      const note = field.parentElement.querySelector("small");
      const eligibility = LearningModel.thinkingEligible(state, level);
      const complete = eligibility.earned;
      if (note) note.textContent = thinkingStatusText(eligibility, field.value);
      const card = field.closest("[data-worksheet-level]");
      const status = card.querySelector("[data-thinking-status]");
      const stars = card.querySelector("[data-record-stars]");
      const evidenceStars = card.querySelector("[data-evidence-stars]");
      if (status) {
        status.textContent = complete ? "思考星已获得" : "待完成解释";
        status.classList.toggle("complete", complete);
      }
      if (stars) stars.textContent = `${state.game.missions[level].bestStars}/3 ★`;
      if (evidenceStars) evidenceStars.textContent = `最佳 ${state.game.missions[level].bestStars}/3 星`;
      const thinkingCount = levelMeta.filter(item => LearningModel.thinkingEligible(state, item.id).earned).length;
      document.getElementById("worksheet-thinking-stat").textContent = `${thinkingCount}/${levelMeta.length}`;
      document.getElementById("worksheet-star-stat").textContent = `${TicketGame.totalStars(state)}/15`;
      const pendingBadge = document.querySelector('[data-worksheet-filter="pending"] span');
      if (pendingBadge) pendingBadge.textContent = levelMeta.length - thinkingCount;
    }
    saveState();
  }));
  document.querySelectorAll("[data-cite-evidence]").forEach(button => button.addEventListener("click", () => {
    const card = button.closest("[data-worksheet-level]");
    const level = Number(card.dataset.worksheetLevel);
    const item = state.game.missions[level].lastRun[Number(button.dataset.citeEvidence)];
    const citation = `【证据】${LearningModel.evidenceText(item)}`;
    const field = card.querySelector('[data-worksheet-field="explanation"]');
    const current = field.value.trim();
    if (!current.includes(citation)) field.value = current ? `${current}\n${citation}` : citation;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    button.classList.add("cited");
  }));
  const progress = Math.round(state.completed.length / levelMeta.length * 100);
  const totalStars = TicketGame.totalStars(state);
  const thinkingCount = levelMeta.filter(level => LearningModel.thinkingEligible(state, level.id).earned).length;
  document.getElementById("worksheet-completed-stat").textContent = `${state.completed.length}/${levelMeta.length}`;
  document.getElementById("worksheet-star-stat").textContent = `${totalStars}/15`;
  document.getElementById("worksheet-thinking-stat").textContent = `${thinkingCount}/${levelMeta.length}`;
  document.getElementById("passport-name").textContent = state.learner.name || "未来工程师";
  document.getElementById("learner-summary").innerHTML = `
    <dt>姓名</dt><dd>${escapeHtml(state.learner.name || "未填写")}</dd>
    <dt>班级</dt><dd>${escapeHtml(state.learner.className || "未填写")}</dd>
    <dt>小组</dt><dd>${escapeHtml(state.learner.group || "未填写")}</dd>
    <dt>编号</dt><dd>${escapeHtml(state.learner.id || "尚未生成")}</dd>`;
  const ring = document.getElementById("completion-ring");
  ring.style.background = `conic-gradient(var(--yellow) ${progress}%, rgba(255,255,255,.13) ${progress}%)`;
  ring.querySelector("span").textContent = `${progress}%`;
  document.getElementById("worksheet-tip").textContent = progress === 100 ? "所有学习任务都已汇入，可以进行最终评价。" : `还剩 ${levelMeta.length - state.completed.length} 项任务，继续沿闯关地图前进吧。`;
}

function renderProjectWorksheetEvidence() {
  const project = CrossDisciplinaryLab.ensureProjectState(state.project);
  const metrics = project.metrics || CrossDisciplinaryLab.evaluatePolicy(project.policy).metrics;
  const caseNames = project.fairnessEvidence.caseIds.map(id => CrossDisciplinaryLab.PUBLIC_VISITORS.find(visitor => visitor.id === id)?.name || id);
  return `<div class="project-worksheet-evidence">
    <strong>跨学科方案包证据</strong>
    <dl>
      <dt>数学证据</dt><dd>总收入${metrics.totalIncome}元；优惠${metrics.discountedCount}人；边界覆盖${metrics.boundaryCoverage}%</dd>
      <dt>规则依据</dt><dd>${escapeHtml(CrossDisciplinaryLab.policySummary(project.policy))}</dd>
      <dt>公平案例</dt><dd>${caseNames.length ? escapeHtml(caseNames.join("、")) : "尚未选择"}</dd>
      <dt>公平性质疑</dt><dd>${escapeHtml(project.peerAudit.counterexample || "尚未记录同伴反例")}</dd>
      <dt>同伴建议</dt><dd>${escapeHtml(project.peerAudit.suggestion || "尚未记录")}</dd>
      <dt>修改记录</dt><dd>${project.revisions.length}次${project.revisions.length ? `；最近一次：${escapeHtml(project.revisions.at(-1).reason)}` : ""}</dd>
    </dl>
  </div>`;
}

function thinkingStatusText(status, value = "") {
  if (status.earned) return `${String(value).trim().length} 字符 · 已引用证据并使用关键概念`;
  const missing = [];
  if (!status.hasEvidence) missing.push("先运行闸机取得证据");
  if (!status.hasLength) missing.push("解释至少8个字符");
  if (!status.hasConcept) missing.push("写出本关关键概念");
  return `${String(value).trim().length}/8 字符 · ${missing.join("；")}`;
}

function ticketLabel(value) {
  return ({half:"半价票", full:"全价票", student:"学生票"})[value] || "未选择";
}

const quizData = [
  { q: "1. 分支判断最核心的作用是什么？", options: ["让程序重复执行", "让程序根据条件选择路径", "让程序停止运行"], answer: 1 },
  { q: "2. 流程图中，哪种图形表示判断条件？", options: ["菱形", "圆角框", "矩形"], answer: 0 },
  { q: "3. 规则是“身高低于 120cm 买半价票”，120cm 应该买什么票？", options: ["半价票", "继续按非半价规则判断", "两种都可以"], answer: 1 },
  { q: "4. 为什么嵌套代码需要缩进？", options: ["让代码颜色更好看", "表示代码所属的层次", "让程序运行更快"], answer: 1 },
  { q: "5. 设计新优惠规则时，哪种做法最好？", options: ["不测试就直接使用", "只测试一个普通值", "说明顺序并测试边界和冲突情况"], answer: 2 }
];

function renderEvaluation() {
  document.getElementById("quiz-panel").innerHTML = `
    <span class="eyebrow">个人小测</span>
    <h2>五题检查我是否真正理解</h2>
    ${quizData.map((item, qi) => `
      <section class="quiz-question">
        <h3>${item.q}</h3>
        <div class="quiz-options">
          ${item.options.map((option, oi) => {
            const selected = Number(state.quiz[qi]) === oi;
            let className = selected ? "selected" : "";
            if (state.quizSubmitted && oi === item.answer) className += " correct";
            if (state.quizSubmitted && selected && oi !== item.answer) className += " wrong";
            return `<button class="quiz-option ${className}" data-question="${qi}" data-option="${oi}">${String.fromCharCode(65 + oi)}. ${option}</button>`;
          }).join("")}
        </div>
      </section>`).join("")}
    <button class="primary-button full-width" id="submit-quiz">${state.quizSubmitted ? `重新提交（当前 ${state.quizScore}/5）` : "提交测验"}</button>
    <div class="feedback-box ${state.quizSubmitted ? "" : "hidden"}" id="quiz-feedback">${quizFeedback()}</div>`;
  document.querySelectorAll(".quiz-option").forEach(btn => btn.addEventListener("click", () => {
    state.quiz[btn.dataset.question] = Number(btn.dataset.option);
    state.quizSubmitted = false;
    saveState(); renderEvaluation();
  }));
  document.getElementById("submit-quiz").addEventListener("click", submitQuiz);
  renderRatings();
  if (state.feedback) {
    const form = document.getElementById("feedback-form");
    Object.entries(state.feedback).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value;
    });
  }
  updateCertificate();
}

function submitQuiz() {
  if (Object.keys(state.quiz).length < quizData.length) return showToast("请先完成全部五道题。");
  state.quizScore = quizData.reduce((score, item, i) => score + (Number(state.quiz[i]) === item.answer ? 1 : 0), 0);
  state.quizSubmitted = true;
  const quizErrorMap = ["branch-direction", "flow-code-mismatch", "boundary-confusion", "indentation", "nested-order"];
  quizData.forEach((item, index) => {
    if (Number(state.quiz[index]) !== item.answer) LearningModel.recordError(state, quizErrorMap[index], index + 1, item.q);
  });
  saveState();
  renderEvaluation();
}

function quizFeedback() {
  if (!state.quizSubmitted) return "";
  const wrong = quizData.map((item, i) => Number(state.quiz[i]) === item.answer ? null : i + 1).filter(Boolean);
  if (!wrong.length) return "<strong>满分！</strong>你已经能够把生活规则、流程图、代码和测试连成完整的解决过程。";
  if (state.quizScore >= 3) return `<strong>掌握得不错。</strong>建议回看第 ${wrong.join("、")} 题对应的关卡，再说一遍理由。`;
  return `<strong>需要再练习。</strong>先回到闯关地图复习流程图、边界值和嵌套顺序，再重新挑战。`;
}

function renderRatings() {
  const items = ["我能把规则写成分支算法", "我会用边界值测试规则", "我能计算收入和优惠人数", "我能用游客案例说明公平"];
  document.getElementById("self-rating").innerHTML = items.map((item, i) => `
    <div class="rating-row"><span>${item}</span><span class="stars" data-rating="${i}">
      ${[1,2,3,4,5].map(v => `<button type="button" class="${(state.selfRating[i] || 0) >= v ? "active" : ""}" data-value="${v}" aria-label="${v} 星">★</button>`).join("")}
    </span></div>`).join("");
  document.querySelectorAll("[data-rating] button").forEach(btn => btn.addEventListener("click", () => {
    state.selfRating[btn.parentElement.dataset.rating] = Number(btn.dataset.value);
    LearningModel.recalculate(state);
    saveState(); renderEvaluation();
  }));
}

function updateCertificate() {
  const stars = TicketGame.totalStars(state);
  const eligible = state.completed.length === levelMeta.length && state.quizSubmitted && state.quizScore >= 3 && stars >= 6;
  state.certificate = Boolean(eligible);
  const el = document.getElementById("certificate");
  el.classList.toggle("hidden", !eligible);
  if (eligible) {
    const title = TicketGame.awardTitle(stars);
    document.getElementById("certificate-name").textContent = state.learner.name || "优秀学员";
    document.getElementById("certificate-title").textContent = title;
    document.getElementById("certificate-stars").textContent = `${stars} / 15 颗闯关星`;
    document.getElementById("certificate-achievement").textContent = `能够把公共规则写成分支算法，用数学证据检验约束，并根据公平性质疑修订智慧乐园票价公约。`;
    document.getElementById("certificate-id").textContent = `${state.learner.className || "班级未填写"} · ${state.learner.id || "CAL-LEARNER"} · 测验 ${state.quizScore}/5 · ${new Date().toLocaleDateString("zh-CN")}`;
    saveState();
  }
}

function renderAssistantWelcome() {
  const messages = document.getElementById("assistant-messages");
  if (!messages.children.length) {
    messages.innerHTML = `<div class="message bot">你好，我是小柿老师。你可以告诉我卡在哪一步，我会结合当前课件和闸机任务，先用问题和提示帮助你自己找到答案。</div>`;
  }
}

function updateAssistantContext() {
  const pageLabels = {home:"学习首页",worksheet:"电子任务单",resources:"资源中心",evaluation:"学习评价",performance:"我的表现",teacher:"教师视角"};
  const context = state.currentPage === "map" ? `当前：第 ${state.currentLevel} 项 · ${levelMeta[state.currentLevel - 1].title}` : `当前：${pageLabels[state.currentPage] || "学习网站"}`;
  document.getElementById("assistant-context").textContent = context;
  const prompts = state.currentPage === "map"
    ? ["给我一个提示", "为什么这样判断？", "帮我检查思路"]
    : ["我应该从哪里开始？", "什么是分支判断？", "如何查看学习进度？"];
  document.getElementById("quick-prompts").innerHTML = prompts.map(text => `<button type="button">${text}</button>`).join("");
  document.querySelectorAll("#quick-prompts button").forEach(btn => btn.addEventListener("click", () => askAssistant(btn.textContent)));
}

function assistantLearningContext() {
  const segment = knowledgeSegments[state.currentLevel];
  const mission = state.game.missions[state.currentLevel];
  const diagnosis = LearningModel.currentDiagnosis(state, state.currentPage === "map" ? state.currentLevel : null);
  return {
    page: state.currentPage,
    pageLabel: ({home:"学习首页",map:"闯关地图",worksheet:"电子任务单",resources:"资源中心",evaluation:"学习评价",performance:"我的表现",teacher:"教师视角"})[state.currentPage],
    level: state.currentPage === "map" ? state.currentLevel : null,
    levelTitle: state.currentPage === "map" ? levelMeta[state.currentLevel - 1].title : "",
    learningMode: state.currentPage === "map" && segment ? state.knowledge.activeViews[state.currentLevel] : "",
    completedLevels: state.completed.length,
    totalStars: TicketGame.totalStars(state),
    attempts: state.currentPage === "map" ? (mission?.attempts || state.attempts[state.currentLevel] || 0) : 0,
    knowledgeScore: segment ? state.knowledge.segments[segment.key]?.score : null,
    knowledgeSubmitted: segment ? state.knowledge.segments[segment.key]?.submitted : false,
    thinkingCompleted: state.currentPage === "map"
      ? LearningModel.thinkingEligible(state, state.currentLevel).earned
      : false,
    errorType: diagnosis?.type || "",
    errorLabel: diagnosis?.label || "",
    hintLevel: diagnosis?.hintLevel || 0,
    expectedRule: "身高 < 120cm 为半价票；否则继续判断学生证",
    recentInputs: state.currentPage === "map"
      ? (mission?.lastRun || []).slice(-3).map(item => ({ height: item.visitor?.height, student: item.visitor?.student, actual: item.actual, expected: item.expected }))
      : [],
    recommendedActivity: diagnosis?.recommendedActivity || state.learnerModel.recommendations?.[0]?.title || "",
    confidenceGap: state.learnerModel.confidenceGap || ""
    ,projectMetrics: state.currentPage === "map" && state.currentLevel === 5
      ? CrossDisciplinaryLab.evaluatePolicy(state.project.policy).metrics
      : null
  };
}

function localAssistantReply(question) {
  const diagnosis = LearningModel.currentDiagnosis(state, state.currentPage === "map" ? state.currentLevel : null);
  if (diagnosis && /提示|检查|不会|不懂|错|卡/.test(question)) {
    return `${diagnosis.label} · ${diagnosis.hintLevel}级提示：${diagnosis.hint}`;
  }
  if (/答案|直接|告诉我/.test(question)) {
    return "我先不直接公布闯关答案。请先圈出判断条件，再说一说：条件成立和不成立时分别应该走哪条路？";
  }
  if (/边界|120|小于|等于/.test(question)) {
    return "把 119、120、121 分别代入“身高 < 120cm”试试看。哪一个数刚好让判断结果发生变化？";
  }
  if (state.currentPage === "map" && state.currentLevel === 5 && /答案|最佳|怎么改|公平|收入|优惠|条件|顺序|方案/.test(question)) {
    const metrics = CrossDisciplinaryLab.evaluatePolicy(state.project.policy).metrics;
    if (metrics.totalIncome < 160) return `先别急着改全部规则。当前总收入是${metrics.totalIncome}元：哪一项优惠人数较多、票价又较低？先只调整一项，再重新运行12名游客。`;
    if (metrics.discountedCount < 5) return `当前只有${metrics.discountedCount}人获得优惠。请从游客表中找出一类有共同、可观察条件的人，再判断增加这项优惠是否仍能守住160元收入底线。`;
    return "请从表中指出一位同时符合两项条件的游客：如果调换这两项规则的优先级，他的票种和总收入会怎样变化？";
  }
  if (/缩进|嵌套|学生证|顺序/.test(question)) {
    return "先用“116cm 且有学生证”的游客检查优惠优先级。确定先判断身高后，再看看学生证判断应该放在哪一条路径里面。";
  }
  if (/流程图|菱形|路径/.test(question)) {
    return "菱形里应该放一个能回答“是或否”的问题。再检查菱形是不是连接了两条带标签的出口。";
  }
  const hints = {
    1: "先比较两个人的身高与 120cm，再预测他们会走向哪个票口。",
    2: "先安装“身高 < 120cm”条件，再分别设置成立和不成立的出口。",
    3: "让同一个身高同时经过流程图和代码，观察高亮是否走在同一条路径。",
    4: "先完成边界排错，再比较两种顺序的收入与优惠人数，最后用一位游客说明公平。",
    5: "先运行12名游客，再用总收入、优惠人数和一名冲突游客说明当前方案哪里需要修改。"
  };
  return state.currentPage === "map"
    ? `${hints[state.currentLevel]} 你愿意先说说自己的预测吗？`
    : "建议从闯关地图开始，每关按照“先预测、再运行、最后解释”的顺序学习。";
}

async function requestAssistantReply(question) {
  const endpoint = window.CAL_CONFIG?.assistantEndpoint?.trim();
  if (!endpoint) return { reply: localAssistantReply(question), source: "local" };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      history: assistantConversation.slice(-6),
      context: assistantLearningContext()
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.reply) throw new Error(data.error || "智能助手暂时无法连接");
  return data;
}

async function askAssistant(question) {
  if (assistantBusy) return;
  const messages = document.getElementById("assistant-messages");
  messages.insertAdjacentHTML("beforeend", `<div class="message user">${escapeHtml(question)}</div>`);
  messages.insertAdjacentHTML("beforeend", `<div class="message bot pending" id="assistant-pending">小柿老师正在想一个适合你的提示……</div>`);
  messages.scrollTop = messages.scrollHeight;
  assistantBusy = true;
  const submit = document.querySelector("#assistant-form button");
  if (submit) submit.disabled = true;
  assistantConversation.push({ role: "user", content: question });
  try {
    const result = await requestAssistantReply(question);
    const reply = result.reply.trim();
    assistantConversation.push({ role: "assistant", content: reply });
    document.getElementById("assistant-pending")?.remove();
    messages.insertAdjacentHTML("beforeend", `<div class="message bot">${escapeHtml(reply).replaceAll("\n", "<br>")}</div>`);
    const greeting = document.getElementById("live2d-greeting");
    if (greeting) greeting.textContent = reply.length > 28 ? `${reply.slice(0, 28)}……` : reply;
    window.Live2DAssistant?.setSpeaking(true);
    document.getElementById("assistant-note").textContent = result.source === "deepseek"
      ? "由 DeepSeek 提供推理支持，小柿老师会优先引导你自己思考。"
      : "当前使用本地教学提示；配置 DeepSeek 后会获得更灵活的引导。";
  } catch {
    const reply = localAssistantReply(question);
    document.getElementById("assistant-pending")?.remove();
    messages.insertAdjacentHTML("beforeend", `<div class="message bot">${escapeHtml(reply)}</div>`);
    document.getElementById("assistant-note").textContent = "DeepSeek 暂时未连接，已切换为本地教学提示。";
    window.Live2DAssistant?.setSpeaking(true);
  } finally {
    assistantBusy = false;
    if (submit) submit.disabled = false;
    messages.scrollTop = messages.scrollHeight;
  }
}

function openModal(id) {
  document.getElementById("modal-backdrop").classList.remove("hidden");
  document.getElementById(id).classList.remove("hidden");
  document.body.style.overflow = "hidden";
  setTimeout(() => document.getElementById(id).querySelector("input,button,select,textarea")?.focus(), 50);
}

function closeModals() {
  document.getElementById("modal-backdrop").classList.add("hidden");
  document.querySelectorAll(".modal").forEach(el => el.classList.add("hidden"));
  document.body.style.overflow = "";
}

function openMedia(title = "任务导入") {
  const content = document.getElementById("media-content");
  document.getElementById("media-title").textContent = title;
  const videoUrl = window.CAL_CONFIG?.videos?.[title];
  if (videoUrl) {
    content.innerHTML = `
      <video controls playsinline preload="metadata" style="width:100%;border-radius:18px;background:#17263e">
        <source src="${escapeHtml(videoUrl)}" type="video/mp4">
        当前浏览器无法播放该视频。
      </video>
      <p style="color:var(--muted);line-height:1.7"><strong>字幕摘要：</strong>${videoFallback(title)}</p>`;
    openModal("media-modal");
    return;
  }
  content.innerHTML = `
    <div class="media-placeholder">
      <div>
        <div class="play-symbol">▶</div>
        <h3>${title}</h3>
        <p>数字人视频尚未放入项目。将视频文件放到 <code>assets/videos/</code> 后，在 <code>config.js</code> 中填写路径即可。</p>
        <p><strong>当前提供文字替代：</strong>${videoFallback(title)}</p>
      </div>
    </div>`;
  openModal("media-modal");
}

function videoFallback(title) {
  if (title.includes("情景导入")) return "从智慧乐园售票任务出发，了解本节课需要解决的真实问题和学习目标。";
  if (title.includes("知识讲解")) return "围绕分支判断、流程图、if-else 代码和边界值测试梳理核心知识。";
  if (title.includes("老师讲解")) return "由老师结合课程内容进行完整讲解，帮助你梳理分支判断的规则、流程与学习重点。";
  if (title.includes("嵌套")) return "先判断身高，只有身高达到 120cm 时，才进入学生证判断。内层代码通过更深的缩进表示层次。";
  if (title.includes("总结")) return "条件决定路径，流程图表达路径，代码执行路径，测试帮助我们确认路径是否正确。";
  return "你将通过五项任务学习分支判断，并用算法、数学证据和公平原则完成智慧乐园票价公约。";
}

function closePdf() {
  document.getElementById("pdf-viewer").classList.add("hidden");
}

function exportRecord() {
  const data = LearningModel.exportV4(state);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.learner.name || "学员"}-智慧乐园票价公约学习记录.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function renderTeacherDashboard() {
  const container = document.getElementById("teacher-dashboard");
  TeacherDashboard.render(container);
  document.getElementById("teacher-import-files")?.addEventListener("change", async event => {
    const files = [...event.target.files];
    if (!files.length) return;
    const values = await Promise.all(files.map(async file => {
      try {
        return { name: file.name, data: JSON.parse(await file.text()) };
      } catch {
        return { name: file.name, data: null };
      }
    }));
    const result = TeacherDashboard.importRecords(values);
    const message = `导入完成：新增 ${result.added}，更新 ${result.updated}，忽略 ${result.ignored}${result.invalid.length ? `，无效 ${result.invalid.length}` : ""}。`;
    showToast(message);
    if (result.invalid.length) console.warn("无效学习记录：", result.invalid);
    renderTeacherDashboard();
  });
  document.getElementById("teacher-export-csv")?.addEventListener("click", () => TeacherDashboard.exportCsv());
  document.getElementById("teacher-load-demo")?.addEventListener("click", () => {
    TeacherDashboard.loadDemo();
    renderTeacherDashboard();
    showToast("已载入五年级（2）班示例数据。");
  });
  document.getElementById("teacher-clear-records")?.addEventListener("click", () => {
    if (!window.confirm("确定清空当前浏览器中的教师汇总记录吗？学生导出的文件不会被删除。")) return;
    TeacherDashboard.clear();
    renderTeacherDashboard();
    showToast("教师端本地汇总数据已清空。");
  });
}

function renderPerformanceDashboard() {
  const container = document.getElementById("performance-dashboard");
  if (!container) return;
  const currentRecord = LearningModel.exportV3(state);
  PerformanceDashboard.render(container, currentRecord);
  document.querySelector("[data-performance-level]")?.addEventListener("click", event => {
    switchPage("map", { level: Number(event.currentTarget.dataset.performanceLevel) || 1 });
  });
  document.getElementById("performance-import-files")?.addEventListener("change", async event => {
    const files = [...event.target.files];
    if (!files.length) return;
    const values = await Promise.all(files.map(async file => {
      try {
        return { name: file.name, data: JSON.parse(await file.text()) };
      } catch {
        return { name: file.name, data: null };
      }
    }));
    const result = TeacherDashboard.importRecords(values);
    showToast(`学习记录已更新：新增 ${result.added}，更新 ${result.updated}，忽略 ${result.ignored}${result.invalid.length ? `，无效 ${result.invalid.length}` : ""}。`);
    renderPerformanceDashboard();
  });
}

function initEvents() {
  document.addEventListener("click", event => {
    const nav = event.target.closest("[data-nav]");
    if (nav) switchPage(nav.dataset.nav);
    const openLevel = event.target.closest("[data-open-level]");
    if (openLevel) switchPage("map", { level: openLevel.dataset.openLevel });
    const recommendation = event.target.closest("[data-recommend-level]");
    if (recommendation) switchPage("map", { level: recommendation.dataset.recommendLevel });
    if (event.target.closest("[data-adaptive-why]")) showRecommendationReason();
    if (event.target.closest("[data-open-help]")) openModal("help-modal");
  });
  document.addEventListener("keydown", event => {
    const card = event.target.closest("[data-open-level]");
    if (card && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      switchPage("map", { level: card.dataset.openLevel });
    }
    if (event.key === "Escape") {
      closeModals();
      document.getElementById("assistant-panel").classList.add("hidden");
    }
  });
  document.getElementById("start-learning").addEventListener("click", () => {
    if (!state.learner.name) openModal("profile-modal");
    else switchPage("map", { level: state.currentLevel });
  });
  document.getElementById("profile-button").addEventListener("click", () => {
    const form = document.getElementById("profile-form");
    form.elements.name.value = state.learner.name;
    form.elements.className.value = state.learner.className;
    form.elements.group.value = state.learner.group;
    openModal("profile-modal");
  });
  document.getElementById("profile-form").addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.learner = {
      name: data.get("name").trim(),
      className: data.get("className").trim(),
      group: data.get("group").trim(),
      id: state.learner.id || createLearnerId()
    };
    saveState();
    closeModals();
    switchPage("map", { level: state.currentLevel });
  });
  document.getElementById("help-button").addEventListener("click", () => window.UsageTour?.start());
  document.getElementById("presentation-button").addEventListener("click", () => window.UsageTour?.startPresentation());
  document.getElementById("teacher-button").addEventListener("click", () => switchPage("teacher"));
  document.querySelectorAll("[data-close-modal]").forEach(btn => btn.addEventListener("click", closeModals));
  document.getElementById("modal-backdrop").addEventListener("click", closeModals);
  document.getElementById("intro-video-button").addEventListener("click", () => openMedia("情景导入"));
  document.getElementById("open-gu-tao-video").addEventListener("click", () => openMedia("老师讲解"));
  document.getElementById("open-video-library").addEventListener("click", () => {
    document.getElementById("media-title").textContent = "数字人微课";
    document.getElementById("media-content").innerHTML = `
      <div class="video-list">
        ${Object.keys(window.CAL_CONFIG?.videos || {}).map((title, i) => `<button type="button" data-video-title="${title}"><span><strong>${i + 1}. ${title}</strong><br><small>${videoFallback(title)}</small></span><span>播放 ▶</span></button>`).join("")}
      </div>`;
    openModal("media-modal");
    document.querySelectorAll("[data-video-title]").forEach(btn => btn.addEventListener("click", () => openMedia(btn.dataset.videoTitle)));
  });
  document.getElementById("open-extension").addEventListener("click", () => {
    document.getElementById("media-title").textContent = "生活中的分支判断";
    document.getElementById("media-content").innerHTML = `
      <div class="video-list">
        <button><span><strong>红绿灯</strong><br><small>如果是绿灯，就通行；否则停下等待。</small></span></button>
        <button><span><strong>体温检测</strong><br><small>如果体温高于 37.3℃，就进一步检查；否则正常通行。</small></span></button>
        <button><span><strong>会员折扣</strong><br><small>如果是会员，就按会员价结算；否则按原价结算。</small></span></button>
      </div>`;
    openModal("media-modal");
  });
  document.getElementById("open-pdf").addEventListener("click", () => {
    document.getElementById("pdf-viewer-title").textContent = "《分支判断》原型教学课件";
    document.getElementById("pdf-viewer-object").data = "《分支判断》原型教学课件.pdf";
    document.getElementById("pdf-viewer").classList.remove("hidden");
  });
  document.getElementById("open-corrected-slides").addEventListener("click", () => {
    state.knowledge.activeViews[2] = "learn";
    state.knowledge.pageIndexes.branch = 0;
    switchPage("map", { level: 2 });
  });
  document.getElementById("close-pdf").addEventListener("click", closePdf);
  document.getElementById("print-worksheet").addEventListener("click", () => window.print());
  document.getElementById("export-worksheet").addEventListener("click", exportRecord);
  document.getElementById("assistant-button").addEventListener("click", () => {
    const panel = document.getElementById("assistant-panel");
    panel.classList.toggle("hidden");
    renderAssistantWelcome();
    updateAssistantContext();
    if (!panel.classList.contains("hidden")) document.getElementById("assistant-input").focus();
  });
  document.getElementById("close-assistant").addEventListener("click", () => document.getElementById("assistant-panel").classList.add("hidden"));
  document.getElementById("assistant-form").addEventListener("submit", event => {
    event.preventDefault();
    const input = document.getElementById("assistant-input");
    const question = input.value.trim();
    if (!question) return;
    askAssistant(question);
    input.value = "";
  });
  document.getElementById("feedback-form").addEventListener("submit", async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    state.feedback = data;
    saveState();
    try {
      const result = await submitLearningData("feedback", data);
      showToast(result.stored === "remote" ? "反馈已提交并保存。" : "反馈已保存在当前浏览器中。");
    } catch {
      showToast("网络提交失败，反馈已在本地保存，可稍后重试。");
    }
    updateCertificate();
  });
  document.getElementById("print-certificate").addEventListener("click", () => window.print());
  document.querySelectorAll("img").forEach(image => image.addEventListener("error", () => {
    image.classList.add("media-load-error");
    image.alt = image.alt ? `${image.alt}（图片暂时无法加载）` : "图片暂时无法加载";
  }));
}

function init() {
  window.CAL_SWITCH_PAGE = switchPage;
  window.CAL_OPEN_MEDIA = openMedia;
  window.CAL_CLOSE_MODALS = closeModals;
  window.CAL_CAPTURE_PRESENTATION_STATE = capturePresentationState;
  window.CAL_PRESENTATION_NAVIGATE = navigatePresentation;
  window.CAL_RESTORE_PRESENTATION_STATE = restorePresentationState;
  window.CAL_TOUR_FINISHED = () => {
    if (state.introSeen) return;
    state.introSeen = true;
    saveState();
  };
  window.UsageTour?.init();
  initEvents();
  document.getElementById("assistant-title").textContent = window.CAL_CONFIG?.assistantName || "小柿老师";
  window.Live2DAssistant?.init();
  updateGlobalUI();
  updateAssistantContext();
  switchPage(state.currentPage || "home", { instant: true });
  const presentationRequested = new URLSearchParams(window.location.search).get("presentation") === "1";
  if (presentationRequested) {
    try {
      const cleanUrl = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState({}, "", cleanUrl);
    } catch {
      // file:// previews may not allow history replacement; the tour still works.
    }
    setTimeout(() => window.UsageTour?.startPresentation(), 500);
  } else if (!state.introSeen) {
    setTimeout(() => window.UsageTour?.start(), 500);
  }
}

init();
