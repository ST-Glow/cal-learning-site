(function () {
  const quickSteps = [
    { page: "home", selector: ".main-nav", title: "六个学习区域", text: "顶部导航可以进入闯关地图、电子任务单、资源中心、学习评价和我的表现，学习过程中的数据会自动保存。", placement: "bottom" },
    { page: "home", selector: ".hero-copy", title: "从真实任务开始", text: "学生从智慧乐园售票情境进入课程，通过生活规则理解条件如何决定不同结果。", placement: "right" },
    { page: "home", selector: ".hero-scene", title: "插画与教师讲解", text: "主题插画帮助学生建立任务情境，点击视频入口可以观看教师讲解，再进入后续学习。", placement: "left" },
    { page: "home", selector: "#profile-button", title: "个人学习档案", text: "学生可以填写姓名和班级，信息用于学习记录、个人成长榜与学习证书。", placement: "bottom" },
    { page: "home", selector: "#assistant-button", title: "智能学习助手", text: "小柿老师会结合当前页面和学习诊断提供分层提示，引导学生自己找到答案。", placement: "left" }
  ];

  const presentationSteps = [
    {
      page: "home",
      selector: ".hero-copy",
      title: "01 真实任务：从票价冲突出发",
      text: "项目面向小学五年级。学生不是记住一条票价规则，而是要把规则写成计算机能执行、游客能看懂的票价公约。",
      placement: "right"
    },
    {
      page: "map",
      level: 1,
      view: "challenge",
      selector: ".level1-game .canvas-action-dock",
      title: "02 情境游戏：看见条件与路径",
      text: "学生先预测游客应走哪条岔道，再运行闸机验证。游戏把“条件—真假路径—出票结果”变成可观察、可重试的过程。",
      placement: "top"
    },
    {
      page: "map",
      level: 3,
      view: "challenge",
      selector: ".level3-game .canvas-action-dock",
      title: "03 图码联动：把路径写成算法",
      text: "同一个身高同时经过流程图和 if/else 代码，节点与代码行同步高亮，帮助学生建立图形表示和符号表示之间的联系。",
      placement: "top"
    },
    {
      page: "map",
      level: 4,
      view: "challenge",
      selector: ".rule-lab .lab-steps",
      title: "04 跨学科探究：用证据检验规则",
      text: "学生用119、120、121厘米排查边界错误，再比较不同判断顺序造成的票种、收入和公平差异。",
      placement: "top"
    },
    {
      page: "map",
      level: 5,
      view: "challenge",
      projectStep: 1,
      selector: ".project-step-nav",
      title: "05 四步项目脚手架",
      text: "小组依次完成设计规则、数学检查、公平说明和同伴修改。每一步只解决一个问题，降低五年级学生的认知负担。",
      placement: "top"
    },
    {
      page: "map",
      level: 5,
      view: "challenge",
      projectStep: 2,
      selector: ".project-metrics",
      title: "06 数学证据：数据必须改变方案",
      text: "系统运行12名游客，自动计算总收入、优惠人数、冲突案例和边界覆盖。未达到160元或5人优惠时，学生必须返回修改算法。",
      placement: "top"
    },
    {
      page: "map",
      level: 5,
      view: "challenge",
      projectStep: 3,
      selector: ".fairness-lab .project-section-heading",
      title: "07 公平证据：不能只写“我觉得”",
      text: "学生至少引用两名具体游客，说明相同条件是否得到一致结果，以及多项优惠冲突时为什么采用当前优先顺序。",
      placement: "top"
    },
    {
      page: "map",
      level: 5,
      view: "challenge",
      projectStep: 4,
      selector: ".audit-lab .project-section-heading",
      title: "08 同伴反例：让质疑推动修订",
      text: "另一小组用隐藏冲突案例发起反例挑战，原小组记录修改前后规则和理由，形成可以追溯的调试证据链。",
      placement: "top"
    },
    {
      page: "evaluation",
      selector: ".rubric-groups",
      title: "09 学习评价：小组成果与个人理解并重",
      text: "评价按信息科技60分、数学25分、社会责任15分组织，同时保留个人小测、自评和反思，避免只评价最终答案。",
      placement: "top"
    },
    {
      page: "teacher",
      selector: ".teacher-dashboard",
      title: "10 教师诊断：看见跨学科证据",
      text: "教师端汇总逻辑正确率、边界覆盖、收入约束、公平证据和修订次数，为补学建议和后续教学调整提供依据。",
      placement: "top"
    }
  ];

  let current = 0;
  let visible = false;
  let mode = "quick";
  let previousOverflow = "";
  let renderToken = 0;
  let presentationSnapshot = null;

  function activeSteps() {
    return mode === "presentation" ? presentationSteps : quickSteps;
  }

  function elements() {
    return {
      root: document.getElementById("usage-tour"),
      spotlight: document.getElementById("tour-spotlight"),
      card: document.getElementById("tour-guide-card"),
      count: document.getElementById("tour-guide-count"),
      eyebrow: document.querySelector("#tour-guide-card .eyebrow"),
      title: document.getElementById("tour-guide-title"),
      text: document.getElementById("tour-guide-text"),
      skip: document.getElementById("tour-skip"),
      previous: document.getElementById("tour-previous"),
      next: document.getElementById("tour-next")
    };
  }

  function start() {
    begin("quick");
  }

  function startPresentation() {
    begin("presentation");
  }

  function begin(nextMode) {
    if (window.innerWidth < 900) {
      if (nextMode === "presentation") window.CAL_SWITCH_PAGE?.("home", { instant: true });
      return;
    }
    mode = nextMode;
    current = 0;
    visible = true;
    previousOverflow = document.body.style.overflow;
    presentationSnapshot = mode === "presentation" ? window.CAL_CAPTURE_PRESENTATION_STATE?.() : null;
    closePanels();
    document.body.style.overflow = "hidden";
    elements().root.classList.remove("hidden");
    showStep();
  }

  function closePanels() {
    document.getElementById("assistant-panel")?.classList.add("hidden");
    document.querySelectorAll(".modal").forEach(item => item.classList.add("hidden"));
    document.getElementById("modal-backdrop")?.classList.add("hidden");
    document.body.style.overflow = "";
  }

  function showStep() {
    if (!visible) return;
    const token = ++renderToken;
    const step = activeSteps()[current];
    const pageChanged = document.body.dataset.currentPage !== step.page;
    window.CAL_CLOSE_MODALS?.();
    document.body.style.overflow = "hidden";
    if (mode === "presentation") {
      window.CAL_PRESENTATION_NAVIGATE?.(step);
    } else if (pageChanged || step.level) {
      window.CAL_SWITCH_PAGE?.(step.page, { instant: true, level: step.level });
    }
    const renderDelay = pageChanged || step.level || step.projectStep ? 120 : 30;
    setTimeout(() => locateTarget(step, token, 0), renderDelay);
  }

  function locateTarget(step, token, attempt) {
    if (!visible || token !== renderToken) return;
    const target = document.querySelector(step.selector);
    if (!target && attempt < 12) {
      setTimeout(() => locateTarget(step, token, attempt + 1), 60);
      return;
    }
    if (!target) {
      showMissingTarget(step);
      return;
    }
    target.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
    requestAnimationFrame(() => requestAnimationFrame(() => highlight(target, step)));
  }

  function writeCard(step, missing = false) {
    const ui = elements();
    ui.count.textContent = `${current + 1} / ${activeSteps().length}`;
    ui.eyebrow.textContent = mode === "presentation" ? "8-MINUTE PRESENTATION" : "QUICK GUIDE";
    ui.title.textContent = step.title;
    ui.text.textContent = missing ? `${step.text} 当前区域暂未完成加载，可以继续下一步。` : step.text;
    ui.skip.textContent = mode === "presentation" ? "结束讲解" : "跳过引导";
    ui.previous.disabled = current === 0;
    ui.next.textContent = current === activeSteps().length - 1 ? (mode === "presentation" ? "完成并返回首页" : "完成引导") : "下一步";
    return ui;
  }

  function highlight(target, step) {
    const rect = target.getBoundingClientRect();
    const ui = writeCard(step);
    const padding = step.selector === "#assistant-button" ? 2 : 8;
    const left = Math.max(8, rect.left - padding);
    const top = Math.max(8, rect.top - padding);
    const width = Math.min(window.innerWidth - left - 8, Math.max(32, rect.width + padding * 2));
    const height = Math.min(window.innerHeight - top - 8, Math.max(32, rect.height + padding * 2));
    ui.spotlight.style.opacity = "1";
    ui.spotlight.style.left = `${left}px`;
    ui.spotlight.style.top = `${top}px`;
    ui.spotlight.style.width = `${width}px`;
    ui.spotlight.style.height = `${height}px`;
    positionCard(ui.card, { left, top, width, height }, step.placement);
  }

  function showMissingTarget(step) {
    const ui = writeCard(step, true);
    ui.spotlight.style.opacity = "0";
    ui.card.style.width = `${Math.min(440, window.innerWidth - 36)}px`;
    ui.card.style.left = "50%";
    ui.card.style.top = "50%";
    ui.card.style.transform = "translate(-50%, -50%)";
  }

  function positionCard(card, target, placement) {
    const gap = 18;
    const margin = 18;
    const cardWidth = Math.min(mode === "presentation" ? 440 : 390, window.innerWidth - margin * 2);
    card.style.transform = "none";
    card.style.width = `${cardWidth}px`;
    const cardHeight = card.offsetHeight || 270;
    let left = target.left;
    let top = target.top + target.height + gap;
    if (placement === "top") top = target.top - cardHeight - gap;
    if (placement === "left") {
      left = target.left - cardWidth - gap;
      top = target.top + target.height / 2 - cardHeight / 2;
    }
    if (placement === "right") {
      left = target.left + target.width + gap;
      top = target.top + target.height / 2 - cardHeight / 2;
    }
    if (placement === "bottom") left = target.left + target.width / 2 - cardWidth / 2;
    left = Math.max(margin, Math.min(window.innerWidth - cardWidth - margin, left));
    top = Math.max(margin, Math.min(window.innerHeight - cardHeight - margin, top));
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  }

  function next() {
    if (current >= activeSteps().length - 1) {
      finish(true);
      return;
    }
    current += 1;
    showStep();
  }

  function previous() {
    if (current <= 0) return;
    current -= 1;
    showStep();
  }

  function finish(completed = false) {
    const finishedMode = mode;
    visible = false;
    renderToken += 1;
    elements().root.classList.add("hidden");
    window.CAL_CLOSE_MODALS?.();
    document.body.style.overflow = previousOverflow;
    if (finishedMode === "presentation") {
      window.CAL_RESTORE_PRESENTATION_STATE?.(presentationSnapshot, { returnHome: completed });
      presentationSnapshot = null;
    } else {
      window.CAL_TOUR_FINISHED?.();
    }
  }

  function init() {
    document.getElementById("tour-next")?.addEventListener("click", next);
    document.getElementById("tour-previous")?.addEventListener("click", previous);
    document.getElementById("tour-skip")?.addEventListener("click", () => finish(false));
    window.addEventListener("resize", () => {
      if (visible) showStep();
    });
    document.addEventListener("keydown", event => {
      if (!visible) return;
      if (event.key === "Escape") finish(false);
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    });
  }

  window.UsageTour = { init, start, startPresentation, finish };
})();
