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
      selector: ".hero",
      title: "01 真实任务：从票价冲突出发",
      text: "项目面向小学五年级，用智慧乐园售票冲突提出驱动问题。学生最终不是记住一个答案，而是要设计一套计算机能执行、数学上可检验、游客能理解的票价公约。",
      placement: "bottom"
    },
    {
      page: "home",
      selector: "#home-route-preview",
      title: "02 学习全景：三课时四阶段",
      text: "课程依次经历情境导入、新知讲解、跨学科探究和项目评价。五个递进任务把生活规则、流程图、代码、边界测试与公约设计连成一条完整学习路径。",
      placement: "top"
    },
    {
      page: "home",
      selector: "#assistant-button",
      title: "03 CAL支架：提示而不代替思考",
      text: "小柿老师会结合当前关卡、知识检查和错误记录提供追问式帮助。支架按“方向提示—关键线索—半成品”逐级出现，帮助学生自己修正，而不是直接生成完整答案。",
      placement: "left"
    },
    {
      page: "map",
      level: 1,
      view: "challenge",
      selector: ".level1-game .track-board",
      title: "04 情境游戏：看见条件与路径",
      text: "学生先观察游客身高并预测票种，再安装条件芯片、选择“是／否”出口并启动闸机。游戏把抽象的“条件—真假路径—出票结果”变成可观察、可操作、可重试的过程。",
      placement: "top"
    },
    {
      page: "map",
      level: 2,
      view: "learn",
      selector: ".knowledge-courseware",
      title: "05 新知讲解：从规则抽象出双分支",
      text: "学生先阅读校正版课件，理解条件成立与不成立会进入两条不同路径，并认识开始框、输入框、判断菱形、操作框和箭头。这里先建立概念，再进入游戏操作。",
      placement: "right"
    },
    {
      page: "map",
      level: 2,
      view: "learn",
      selector: ".knowledge-guide",
      title: "06 掌握学习：知识检查连接补学",
      text: "右侧把本节知识压缩成两条关键结论，并配有数字人讲解和两道即时检查题。答错后会显示解释，学生可以返回课件补学、重新作答，再进入闸机挑战。",
      placement: "left"
    },
    {
      page: "map",
      level: 2,
      view: "challenge",
      selector: ".level2-game .track-board",
      title: "07 流程图搭建：让结构真正运行",
      text: "学生不是照抄流程图，而是拖放节点、连接“是／否”分支，再让116cm与120cm游客实际运行。系统用路径回放指出缺少节点、出口错误或边界混淆。",
      placement: "top"
    },
    {
      page: "map",
      level: 3,
      view: "learn",
      selector: ".knowledge-courseware",
      title: "08 新知进阶：流程图对应if／else",
      text: "第二组新知把判断菱形对应到if条件，把两条流程路径对应到if与else代码块。学生同时学习缩进、执行顺序，以及统一规则height < 120的准确写法。",
      placement: "right"
    },
    {
      page: "map",
      level: 3,
      view: "learn",
      selector: ".knowledge-guide",
      title: "09 边界知识：119／120／121为什么重要",
      text: "知识检查专门追问120cm应走哪条路径，引导学生区分“小于”和“小于等于”。119、120、121三个相邻值随后会成为检验算法是否准确的最小测试组。",
      placement: "left"
    },
    {
      page: "map",
      level: 3,
      view: "challenge",
      selector: ".level3-game .track-board",
      title: "10 图码联动：把路径写成算法",
      text: "同一个游客同时经过流程图和if／else代码，节点与代码行同步高亮。学生要先预测、再运行、最后补全代码，从而建立生活语言、图形表示和程序表示之间的对应关系。",
      placement: "top"
    },
    {
      page: "map",
      level: 4,
      view: "challenge",
      selector: ".rule-lab",
      title: "11 跨学科探究：用证据检验规则",
      text: "规则实验室把知识带入真实约束：学生用119、120、121厘米排查边界错误，再比较“先身高”与“先身份”造成的票种、收入和受影响游客差异，并写出公平解释。",
      placement: "top"
    },
    {
      page: "map",
      level: 5,
      view: "challenge",
      projectStep: 1,
      selector: ".project-step-nav",
      title: "12 项目任务：四步完成票价公约",
      text: "小组依次完成设计规则、数学检查、公平说明和同伴修改。条件构建器把变量、比较符、票价、优先级与默认票拆开呈现，每一步只解决一个核心问题，降低五年级学生的认知负担。",
      placement: "top"
    },
    {
      page: "map",
      level: 5,
      view: "challenge",
      projectStep: 2,
      selector: ".project-metrics",
      title: "13 数学证据：数据必须改变方案",
      text: "系统批量运行12名公开游客，自动计算逐人票价、总收入、优惠人数、冲突数和边界覆盖率。若收入低于160元、优惠少于5人或结果不唯一，方案就不能通过，学生必须返回修改。",
      placement: "top"
    },
    {
      page: "map",
      level: 5,
      view: "challenge",
      projectStep: 3,
      selector: ".fairness-lab",
      title: "14 公平证据：不能只写“我觉得”",
      text: "学生必须引用至少两名具体游客，说明相同条件的人是否得到一致结果、边界是否清晰、无关差别是否被排除，以及同时满足多项优惠时为什么采用当前优先顺序。",
      placement: "top"
    },
    {
      page: "map",
      level: 5,
      view: "challenge",
      projectStep: 4,
      selector: ".audit-lab",
      title: "15 同伴反例：让质疑推动修订",
      text: "另一小组使用隐藏边界或多条件冲突案例发起反例挑战，指出问题类型并提出建议。原小组必须保留修改前规则、修改后规则与理由，形成可以追溯的算法调试证据链。",
      placement: "top"
    },
    {
      page: "worksheet",
      selector: ".worksheet-layout",
      title: "16 过程证据：电子任务单持续成长",
      text: "任务单不是课后补填，而是贯穿学习全过程，自动汇总每关预测、知识要点、错误订正、数学计算、公平论证和修订记录。学生可以继续修改，也可以打印或导出作品证据。",
      placement: "top"
    },
    {
      page: "evaluation",
      selector: ".evaluation-layout",
      title: "17 学习评价：小组成果与个人理解并重",
      text: "评价按信息科技60分、数学25分、社会责任15分组织，既检查方案能否运行，也检查计算证据、公平案例和修订过程；同时保留个人小测、自评与反思，避免只评价小组最终答案。",
      placement: "top"
    },
    {
      page: "teacher",
      selector: ".teacher-dashboard",
      title: "18 教师诊断：看见跨学科证据",
      text: "教师端汇总知识掌握、逻辑正确率、边界覆盖、收入约束、公平证据和修订次数，既能查看全班趋势，也能定位具体学习困难，为分层补学、小组指导和后续教学调整提供依据。",
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
      collapse: document.getElementById("tour-collapse"),
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
    document.body.classList.toggle("presentation-tour-active", mode === "presentation");
    document.body.style.overflow = "hidden";
    const ui = elements();
    ui.root.dataset.mode = nextMode;
    ui.card.classList.remove("collapsed");
    ui.collapse?.setAttribute("aria-expanded", "true");
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
    if (ui.collapse) {
      const expanded = !ui.card.classList.contains("collapsed");
      ui.collapse.textContent = expanded ? "收起说明" : "展开说明";
      ui.collapse.setAttribute("aria-expanded", String(expanded));
    }
    ui.previous.disabled = current === 0;
    ui.next.textContent = current === activeSteps().length - 1 ? (mode === "presentation" ? "完成并返回首页" : "完成引导") : "下一步";
    return ui;
  }

  function highlight(target, step) {
    const rect = target.getBoundingClientRect();
    const ui = writeCard(step);
    const padding = step.selector === "#assistant-button" ? 2 : (mode === "presentation" ? 16 : 8);
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
    window.Live2DAssistant?.refreshLayout?.();
  }

  function showMissingTarget(step) {
    const ui = writeCard(step, true);
    ui.spotlight.style.opacity = "0";
    ui.card.style.width = `${Math.min(mode === "presentation" ? 560 : 440, window.innerWidth - 36)}px`;
    ui.card.style.left = "50%";
    ui.card.style.top = "50%";
    ui.card.style.transform = "translate(-50%, -50%)";
  }

  function positionCard(card, target, placement) {
    const gap = 18;
    const margin = 18;
    const collapsed = card.classList.contains("collapsed");
    const cardWidth = Math.min(collapsed ? (mode === "presentation" ? 560 : 500) : (mode === "presentation" ? 560 : 390), window.innerWidth - margin * 2);
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

  function toggleCard() {
    if (!visible) return;
    const ui = elements();
    ui.card.classList.toggle("collapsed");
    const expanded = !ui.card.classList.contains("collapsed");
    ui.collapse.textContent = expanded ? "收起说明" : "展开说明";
    ui.collapse.setAttribute("aria-expanded", String(expanded));
    const step = activeSteps()[current];
    const target = document.querySelector(step.selector);
    if (target) requestAnimationFrame(() => highlight(target, step));
  }

  function finish(completed = false) {
    const finishedMode = mode;
    visible = false;
    renderToken += 1;
    elements().root.classList.add("hidden");
    document.body.classList.remove("presentation-tour-active");
    window.CAL_CLOSE_MODALS?.();
    document.body.style.overflow = previousOverflow;
    if (finishedMode === "presentation") {
      window.CAL_RESTORE_PRESENTATION_STATE?.(presentationSnapshot, { returnHome: completed });
      presentationSnapshot = null;
      window.setTimeout(() => window.Live2DAssistant?.refreshLayout?.(), 80);
    } else {
      window.CAL_TOUR_FINISHED?.();
    }
  }

  function init() {
    document.getElementById("tour-next")?.addEventListener("click", next);
    document.getElementById("tour-previous")?.addEventListener("click", previous);
    document.getElementById("tour-collapse")?.addEventListener("click", toggleCard);
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
