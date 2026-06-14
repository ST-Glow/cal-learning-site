(function () {
  const quickSteps = [
    { page: "home", selector: ".main-nav", title: "六个学习区域", text: "顶部导航可以快速进入闯关地图、电子任务单、资源中心、学习评价和我的表现，学习过程中的数据会自动保存。", placement: "bottom" },
    { page: "home", selector: ".hero-copy", title: "从情境任务开始", text: "学生从智慧乐园售票情境进入课程，通过生活规则理解条件如何决定不同结果。", placement: "right" },
    { page: "home", selector: ".hero-scene", title: "插画与教师讲解", text: "主题插画帮助学生建立任务情境，点击视频入口可以观看教师讲解，再进入后续学习。", placement: "left" },
    { page: "home", selector: "#profile-button", title: "个人学习档案", text: "学生可以填写姓名和班级，信息用于学习记录、个人成长榜与学习证书。", placement: "bottom" },
    { page: "home", selector: "#assistant-button", title: "智能学习助手", text: "小柿老师会结合当前页面和学习诊断提供分层提示，引导学生自己找到答案。", placement: "left" }
  ];

  const presentationSteps = [
    { page: "home", selector: ".hero", title: "项目首页：建立真实任务情境", text: "本项目以智慧乐园售票站为情境，学生需要把生活中的票价规则转换为流程图和分支代码。首页集中呈现学习目标、任务入口和数字化教学资源。", placement: "bottom" },
    { page: "home", selector: "#media-content video", video: "情景导入", title: "视频演示：情景导入", text: "首页可以直接打开情景导入视频。录制时点击播放器即可展示学生如何在正式学习前了解任务背景与学习目标。", placement: "right" },
    { page: "map", level: 2, selector: ".course-player", title: "闯关地图：结构化学习路径", text: "课程按照情境导入、新知讲解、实践探究、学习拓展和总结评价逐步推进。每个关卡都包含预测、操作验证和解释反思。", placement: "left" },
    { page: "map", level: 2, selector: "#media-content video", video: "知识讲解", title: "视频演示：知识讲解", text: "在新知讲解关卡中，学生可以随时打开知识讲解视频，结合课件学习分支判断、流程图、代码和边界值测试。", placement: "right" },
    { page: "map", selector: ".map-adaptive-card", title: "个性化学习推荐", text: "系统依据知识检查、闯关表现和错误类型生成学习建议，推荐内容用于补学和挑战，但不会限制学生自由选择关卡。", placement: "bottom" },
    { page: "worksheet", selector: ".worksheet-banner-tools", title: "电子任务单：自动汇集学习证据", text: "任务单自动统计完成关卡、星星和思考记录。学生可以持续修改预测、证据和解释，并导出完整学习记录。", placement: "left" },
    { page: "worksheet", selector: ".worksheet-layout", title: "过程性记录与学习护照", text: "这里保留每一关的思考过程，右侧学习护照同步显示个人进度，让评价不仅关注答案，也关注学习过程。", placement: "top" },
    { page: "resources", selector: ".resource-courseware", title: "资源中心：核心课件与学习支持", text: "资源中心整合学生课件、教师参考资料、微课视频和生活迁移案例，学生可以根据需要选择不同形式的学习支持。", placement: "bottom" },
    { page: "resources", selector: ".resource-video", title: "教师讲解视频", text: "微课放映站已经接入教师讲解视频，支持在网站内直接播放，便于学生课前预习和课后复习。", placement: "left" },
    { page: "resources", selector: "#media-content video", video: "古涛老师讲解", title: "视频演示：教师完整讲解", text: "资源中心还收录了古涛老师的完整讲解视频。三段视频统一使用站内播放器，学生不需要离开学习平台。", placement: "right" },
    { page: "evaluation", selector: ".evaluation-layout", title: "学习评价：测验、自评与反馈", text: "总结评价综合知识测验、自我评价和资源体验反馈，形成知识掌握与学习感受相结合的评价证据。", placement: "top" },
    { page: "performance", selector: ".performance-hero", title: "我的表现：个人学习画像", text: "系统汇总完成关卡、星星、测验、思考记录和常见错误，用友好的语言生成个人学习画像与下一步补学建议。", placement: "bottom" },
    { page: "performance", selector: ".growth-ranking-panel", title: "个人成长榜：突出进步积累", text: "成长榜只展示个人维度，根据星星、关卡、思考记录、测验和自评计算成长值，强调持续进步，不设置小组排名或负面评价。", placement: "top" },
    { page: "teacher", selector: ".teacher-dashboard", title: "教师视角：班级学习诊断", text: "教师可以导入学生学习记录，查看知识掌握度、关卡完成情况、高频错误和补学建议，为后续教学调整提供依据。", placement: "top" },
    { page: "teacher", selector: "#assistant-button", title: "智能助手：贯穿学习全过程", text: "右下角的小柿老师能够感知当前页面、关卡与诊断结果，通过递进提示支持学生自主思考。以上就是本项目的主要功能。", placement: "left" }
  ];

  let current = 0;
  let visible = false;
  let mode = "quick";
  let previousOverflow = "";
  let renderToken = 0;

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
    if (window.innerWidth < 900) return;
    mode = nextMode;
    current = 0;
    visible = true;
    previousOverflow = document.body.style.overflow;
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
    if (!step.video) {
      window.CAL_CLOSE_MODALS?.();
      document.body.style.overflow = "hidden";
    }
    if (pageChanged || step.level) window.CAL_SWITCH_PAGE?.(step.page, { instant: true, level: step.level });
    setTimeout(() => {
      if (!visible || token !== renderToken) return;
      if (step.video) window.CAL_OPEN_MEDIA?.(step.video);
      const target = document.querySelector(step.selector);
      if (!target) {
        next();
        return;
      }
      target.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
      requestAnimationFrame(() => highlight(target, step));
    }, pageChanged ? 120 : 20);
  }

  function highlight(target, step) {
    const rect = target.getBoundingClientRect();
    const ui = elements();
    const padding = step.selector === "#assistant-button" ? 2 : 8;
    const left = Math.max(8, rect.left - padding);
    const top = Math.max(8, rect.top - padding);
    const width = Math.min(window.innerWidth - left - 8, rect.width + padding * 2);
    const height = Math.min(window.innerHeight - top - 8, rect.height + padding * 2);
    ui.spotlight.style.left = `${left}px`;
    ui.spotlight.style.top = `${top}px`;
    ui.spotlight.style.width = `${width}px`;
    ui.spotlight.style.height = `${height}px`;
    ui.count.textContent = `${current + 1} / ${activeSteps().length}`;
    ui.eyebrow.textContent = mode === "presentation" ? "PROJECT PRESENTATION" : "QUICK GUIDE";
    ui.title.textContent = step.title;
    ui.text.textContent = step.text;
    ui.skip.textContent = mode === "presentation" ? "结束讲解" : "跳过引导";
    ui.previous.disabled = current === 0;
    ui.next.textContent = current === activeSteps().length - 1 ? (mode === "presentation" ? "结束讲解" : "完成引导") : "下一步";
    positionCard(ui.card, { left, top, width, height }, step.placement);
  }

  function positionCard(card, target, placement) {
    const gap = 18;
    const margin = 18;
    const cardWidth = Math.min(mode === "presentation" ? 440 : 390, window.innerWidth - margin * 2);
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
      finish();
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

  function finish() {
    const finishedMode = mode;
    visible = false;
    renderToken += 1;
    elements().root.classList.add("hidden");
    window.CAL_CLOSE_MODALS?.();
    document.body.style.overflow = previousOverflow;
    if (finishedMode === "presentation") window.CAL_SWITCH_PAGE?.("home", { instant: true });
    else window.CAL_TOUR_FINISHED?.();
  }

  function init() {
    document.getElementById("tour-next")?.addEventListener("click", next);
    document.getElementById("tour-previous")?.addEventListener("click", previous);
    document.getElementById("tour-skip")?.addEventListener("click", finish);
    window.addEventListener("resize", () => {
      if (visible) showStep();
    });
    document.addEventListener("keydown", event => {
      if (!visible) return;
      if (event.key === "Escape") finish();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    });
  }

  window.UsageTour = { init, start, startPresentation, finish };
})();
