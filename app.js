const STORAGE_KEY = "cal-branch-training-v1";

const levelMeta = [
  { id: 1, title: "认识售票规则", subtitle: "帮助游客选对岔道", color: "#ff8a4c" },
  { id: 2, title: "安装身高闸机", subtitle: "配置菱形判断闸机", color: "#3978f6" },
  { id: 3, title: "智能闸机联动", subtitle: "让轨道和代码同步", color: "#7567e8" },
  { id: 4, title: "边界值故障排查", subtitle: "用测试找到错误", color: "#16a085" },
  { id: 5, title: "学生票双重闸机", subtitle: "理解顺序与嵌套", color: "#ef5da8" },
  { id: 6, title: "设计我的智慧票站", subtitle: "完成小组最终任务", color: "#ffb000" }
];

const phaseMeta = [
  { id: 1, title: "情境导入", subtitle: "领取售票员任务", icon: "🎟", color: "#ff6b6b", image: "assets/images/stages/stage-intro.webp", levels: [1] },
  { id: 2, title: "新知讲解", subtitle: "探索流程与代码", icon: "📖", color: "#29a4d9", image: "assets/images/stages/stage-knowledge.webp", levels: [2, 3] },
  { id: 3, title: "实践探究", subtitle: "测试并升级规则", icon: "🔬", color: "#ffb633", image: "assets/images/stages/stage-practice.webp", levels: [4, 5] },
  { id: 4, title: "学习拓展", subtitle: "设计创意优惠", icon: "🧩", color: "#71bb48", image: "assets/images/stages/stage-extension.webp", levels: [6] },
  { id: 5, title: "总结评价", subtitle: "挑战测验领证书", icon: "🏅", color: "#7567e8", image: "assets/images/stages/stage-summary.webp", levels: [] }
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
  "为什么必须测试 120cm？",
  "为什么先判断身高，再判断学生证？",
  "你的新优惠规则为什么公平？"
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
    level5: { order: ["height", "student"], indent: [], visitorResults: [] },
    task: { offer: "", price: "", condition: "", order: "", fairness: "", pseudocode: "", members: "", roles: "", tests: [] }
  },
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
      4: emptyWorksheetEntry(), 5: emptyWorksheetEntry(), 6: emptyWorksheetEntry()
    }
  },
  learnerModel: null,
  inquiry: {},
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
  state.knowledge = deepMerge(structuredClone(defaultState.knowledge), state.knowledge || {});
  state.worksheet = deepMerge(structuredClone(defaultState.worksheet), state.worksheet || {});
  state.worksheet.version = 3;
  for (let level = 1; level <= 6; level += 1) {
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
  saveState();
  window.scrollTo({ top: 0, behavior: options.instant ? "auto" : "smooth" });
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
  container.innerHTML = levelMeta.slice(0, 5).map(level => {
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
          <span>${item.level === 6 ? "拓展" : `第${item.level}关`}</span>
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
  const phase = phaseForLevel(state.currentLevel);
  document.getElementById("level-sidebar").innerHTML = phaseMeta.map(item => {
    const phaseComplete = item.id === 5
      ? state.certificate
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
  document.getElementById("substep-tabs").innerHTML = phase.levels.map((levelId, index) => {
    const level = levelMeta[levelId - 1];
    return `<button class="substep-tab ${state.currentLevel === levelId ? "active" : ""} ${state.completed.includes(levelId) ? "complete" : ""}" data-level="${levelId}">
      <span>${index + 1}</span>${level.title}${state.completed.includes(levelId) ? " ✓" : ""}
    </button>`;
  }).join("");
  document.getElementById("stage-dots").innerHTML = phaseMeta.map(item => `<span class="${item.id === phase.id ? "active" : ""}" style="--dot-color:${item.color}"></span>`).join("");
  renderRecommendations("map-recommendations", "map");

  const learningSegment = knowledgeSegments[state.currentLevel];
  const activeView = learningSegment ? state.knowledge.activeViews[state.currentLevel] || "learn" : "challenge";
  const levelContent = learningSegment
    ? renderLearningLevel(state.currentLevel, activeView)
    : renderChallenge(state.currentLevel);
  document.getElementById("level-stage").innerHTML = lessonShell(levelMeta[state.currentLevel - 1], levelContent);
  document.getElementById("previous-stage").disabled = state.currentLevel === 1;
  document.getElementById("next-stage").textContent = state.currentLevel === 6 ? "进入总结评价 →" : "下一站 →";
  attachLevelHandlers();
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
  return `${[4, 5].includes(Number(level)) ? renderInquiryPanel(Number(level)) : ""}${TicketGame.render(level, state)}`;
}

function renderInquiryPanel(level) {
  const inquiry = state.inquiry[level];
  const content = level === 4 ? {
    question: "为什么120cm最容易暴露条件芯片的错误？",
    prediction: "先预测：程序A（<120）和程序B（≤120）中，哪一个符合规则？",
    transfer: "如果规则改成“年龄低于12岁享受儿童票”，你会测试哪些数据？"
  } : {
    question: "为什么要先判断身高，再判断学生证？",
    prediction: "先预测：116cm且有学生证的游客，应该优先获得哪一种票？",
    transfer: "如果再加入老人票，你准备把年龄判断放在什么位置？"
  };
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
    </section>`;
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
        <div class="lesson-badge" style="background:${level.color}">${level.id === 6 ? "GO" : `0${level.id}`}</div>
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

function renderFinalTask() {
  const task = state.answers.task;
  const tests = task.tests.length ? task.tests : [{input:"",expected:""},{input:"",expected:""},{input:"",expected:""}];
  return lessonShell(levelMeta[5], `
    <div class="instruction-box"><strong>最终任务：</strong>在原有规则上增加一种优惠。先说明规则和顺序，再写伪代码，并用至少三组数据测试。</div>
    <div class="task-builder">
      <form class="task-form" id="creative-task-form">
        <div class="two-columns">
          <label>新增优惠对象<input name="offer" value="${escapeHtml(task.offer)}" placeholder="例如：老人票" required></label>
          <label>票价或折扣<input name="price" value="${escapeHtml(task.price)}" placeholder="例如：半价" required></label>
        </div>
        <label>判断条件<input name="condition" value="${escapeHtml(task.condition)}" placeholder="例如：年龄达到 60 岁" required></label>
        <label>判断顺序<textarea name="order" rows="2" placeholder="先判断什么，再判断什么？" required>${escapeHtml(task.order)}</textarea></label>
        <label>公平性说明<textarea name="fairness" rows="2" placeholder="为什么这样设计是合理的？" required>${escapeHtml(task.fairness)}</textarea></label>
        <label>伪代码<textarea name="pseudocode" rows="7" placeholder="如果……&#10;    输出……&#10;否则……" required>${escapeHtml(task.pseudocode)}</textarea></label>
        <div class="two-columns">
          <label>小组成员<input name="members" value="${escapeHtml(task.members)}" placeholder="填写成员姓名" required></label>
          <label>任务分工<input name="roles" value="${escapeHtml(task.roles)}" placeholder="规则、流程图、测试……" required></label>
        </div>
        <h3>测试数据</h3>
        <div id="task-test-rows">
          ${tests.map((row, i) => testRow(row, i)).join("")}
        </div>
        <button class="secondary-button" type="button" id="add-test-row">+ 增加测试</button>
        <button class="primary-button full-width" type="submit" style="margin-top:14px">生成作品摘要并提交</button>
      </form>
      <div class="task-preview">
        <div class="summary-ticket" id="task-summary">
          <span class="eyebrow">GROUP PROJECT</span>
          <h3>${task.offer ? escapeHtml(task.offer) : "等待设计创意优惠"}</h3>
          <dl>
            <dt>票价</dt><dd>${task.price ? escapeHtml(task.price) : "—"}</dd>
            <dt>条件</dt><dd>${task.condition ? escapeHtml(task.condition) : "—"}</dd>
            <dt>判断顺序</dt><dd>${task.order ? escapeHtml(task.order) : "—"}</dd>
            <dt>公平性</dt><dd>${task.fairness ? escapeHtml(task.fairness) : "—"}</dd>
            <dt>小组成员</dt><dd>${task.members ? escapeHtml(task.members) : "—"}</dd>
          </dl>
        </div>
      </div>
    </div>
  `);
}

function testRow(row, i) {
  return `<div class="test-row" data-test-row="${i}">
    <input name="testInput" value="${escapeHtml(row.input)}" placeholder="输入条件" required>
    <input name="testExpected" value="${escapeHtml(row.expected)}" placeholder="预期票种" required>
    <button type="button" class="remove-row" aria-label="删除测试数据">×</button>
  </div>`;
}

function attachLevelHandlers() {
  document.querySelectorAll("[data-phase]").forEach(btn => btn.addEventListener("click", () => {
    const phase = phaseMeta[Number(btn.dataset.phase) - 1];
    if (phase.id === 5) {
      switchPage("evaluation");
      return;
    }
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
    if (state.currentLevel >= 6) {
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
  const learningSegment = knowledgeSegments[state.currentLevel];
  const activeView = learningSegment ? state.knowledge.activeViews[state.currentLevel] || "learn" : "challenge";
  if (learningSegment && activeView === "learn") {
    attachKnowledgePanel(state.currentLevel);
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

function attachFinalTask() {
  const form = document.getElementById("creative-task-form");
  document.getElementById("add-test-row").addEventListener("click", () => {
    const rows = document.getElementById("task-test-rows");
    rows.insertAdjacentHTML("beforeend", testRow({input:"", expected:""}, rows.children.length));
    attachRemoveRows();
  });
  attachRemoveRows();
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const data = new FormData(form);
    const inputs = data.getAll("testInput").map(v => v.trim());
    const expected = data.getAll("testExpected").map(v => v.trim());
    const tests = inputs.map((input, i) => ({ input, expected: expected[i] })).filter(row => row.input && row.expected);
    if (tests.length < 3) return showToast("最终任务至少需要三组完整测试数据。");
    state.answers.task = {
      offer: data.get("offer").trim(),
      price: data.get("price").trim(),
      condition: data.get("condition").trim(),
      order: data.get("order").trim(),
      fairness: data.get("fairness").trim(),
      pseudocode: data.get("pseudocode").trim(),
      members: data.get("members").trim(),
      roles: data.get("roles").trim(),
      tests
    };
    markComplete(6);
    try {
      const result = await submitLearningData("creative-task", state.answers.task);
      if (result.stored === "remote") showToast("小组作品已提交到在线收集端。");
    } catch {
      showToast("在线提交失败，作品已在本地保存，可导出学习记录后提交。");
    }
    renderMap();
  });
}

function attachRemoveRows() {
  document.querySelectorAll(".remove-row").forEach(button => button.onclick = () => {
    const rows = document.getElementById("task-test-rows");
    if (rows.children.length <= 3) return showToast("至少保留三组测试数据。");
    button.closest(".test-row").remove();
  });
}

function showHint(level) {
  state.hints[level] = (state.hints[level] || 0) + 1;
  const diagnosis = LearningModel.currentDiagnosis(state, level);
  const hints = {
    1: "先找条件：谁的身高低于 120cm？条件成立后会执行哪个结果？",
    2: "流程从“开始”向下执行。判断框之后必须分为“是”和“否”两条路。",
    3: "统一规则使用严格小于号“<”。条件不成立时需要使用 else。",
    4: "重点只看 120cm：它在“<120”和“≤120”中的判断结果相反。",
    5: "想一想：116cm 且有学生证的人，哪种优惠应该优先？内层代码要再向右缩进。"
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
        <h2>我的六段闯关记录</h2>
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
      document.getElementById("worksheet-star-stat").textContent = `${TicketGame.totalStars(state)}/18`;
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
  document.getElementById("worksheet-star-stat").textContent = `${totalStars}/18`;
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
    <span class="eyebrow">KNOWLEDGE QUIZ</span>
    <h2>五题检验你的判断力</h2>
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
  const items = ["我能解释双分支", "我能读懂流程图", "我会测试边界值", "我能理解嵌套顺序"];
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
    document.getElementById("certificate-stars").textContent = `${stars} / 18 颗闯关星`;
    document.getElementById("certificate-achievement").textContent = `能够配置判断闸机、检验边界值，并运用双分支与嵌套分支设计智慧票站。`;
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
    4: "重点比较两段程序对 120cm 的输出，不必一次检查所有数字。",
    5: "用“低于 120cm 且有学生证”的游客测试判断顺序。",
    6: "新规则需要写清条件、优先级，并准备普通值、边界值和冲突值。"
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
  if (title.includes("古涛")) return "由古涛老师结合课程内容进行完整讲解，帮助你梳理分支判断的规则、流程与学习重点。";
  if (title.includes("嵌套")) return "先判断身高，只有身高达到 120cm 时，才进入学生证判断。内层代码通过更深的缩进表示层次。";
  if (title.includes("总结")) return "条件决定路径，流程图表达路径，代码执行路径，测试帮助我们确认路径是否正确。";
  return "你将扮演智慧乐园售票员，通过五项训练学会让程序根据条件做出正确选择。";
}

function closePdf() {
  document.getElementById("pdf-viewer").classList.add("hidden");
}

function exportRecord() {
  const data = LearningModel.exportV3(state);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.learner.name || "学员"}-分支判断学习记录.json`;
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
  document.getElementById("open-gu-tao-video").addEventListener("click", () => openMedia("古涛老师讲解"));
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
  if (!state.introSeen) {
    setTimeout(() => window.UsageTour?.start(), 500);
  }
}

init();
