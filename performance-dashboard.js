(function () {
  const TOTAL_LEVELS = 6;
  const TOTAL_STARS = 18;
  const TOTAL_QUIZ = 5;
  const masteryLabels = {
    branch: "双分支判断",
    flowchart: "流程图与代码",
    boundary: "边界值判断",
    nested: "嵌套分支",
    transfer: "迁移应用"
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function thinkingCount(record) {
    const missions = Object.values(record.progress?.missions || {});
    const missionCount = missions.filter(mission => mission?.earned?.thinking).length;
    if (missionCount) return missionCount;
    const worksheetEntries = Object.values(record.worksheet?.entries || {});
    const worksheetCount = worksheetEntries.filter(entry => String(entry?.explanation || "").trim()).length;
    const inquiryEntries = Object.values(record.inquiryEvidence || {});
    const inquiryCount = inquiryEntries.filter(entry => String(entry?.explanation || "").trim()).length;
    return clamp(Math.max(worksheetCount, inquiryCount), 0, TOTAL_LEVELS);
  }

  function selfRatingCount(record) {
    return clamp(Object.values(record.assessment?.selfRating || {}).filter(value => Number(value) > 0).length, 0, 3);
  }

  function mainError(record) {
    return Object.entries(record.diagnostics?.errorTypes || {})
      .filter(([, value]) => Number(value?.count || 0) > 0 && value?.active !== false)
      .sort((a, b) => Number(b[1]?.count || 0) - Number(a[1]?.count || 0))[0]?.[0] || "";
  }

  function strongestMastery(record) {
    return Object.entries(record.diagnostics?.mastery || {})
      .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0]?.[0] || "branch";
  }

  function growthValue(record) {
    const stars = clamp(record.progress?.totalStars, 0, TOTAL_STARS);
    const completed = clamp(record.progress?.completedCount, 0, TOTAL_LEVELS);
    const quizScore = record.assessment?.quizSubmitted ? clamp(record.assessment?.quizScore, 0, TOTAL_QUIZ) : 0;
    return stars * 10 + completed * 5 + thinkingCount(record) * 3 + quizScore * 5 + selfRatingCount(record) * 3;
  }

  function recordKey(record) {
    return record.learner?.id || `${record.learner?.name || "未命名"}-${record.learner?.className || ""}`;
  }

  function collectRecords(currentRecord) {
    const values = [...(window.TeacherDashboard?.getRecords?.() || []), currentRecord].filter(Boolean);
    const unique = new Map();
    values.forEach(record => {
      const key = recordKey(record);
      const existing = unique.get(key);
      if (!existing || new Date(record.exportedAt || 0) >= new Date(existing.exportedAt || 0)) unique.set(key, record);
    });
    return [...unique.values()];
  }

  function metrics(record) {
    const completed = clamp(record.progress?.completedCount, 0, TOTAL_LEVELS);
    const stars = clamp(record.progress?.totalStars, 0, TOTAL_STARS);
    const quizScore = record.assessment?.quizSubmitted ? clamp(record.assessment?.quizScore, 0, TOTAL_QUIZ) : 0;
    const error = mainError(record);
    const recommendation = record.diagnostics?.recommendations?.[0]?.title || (completed < TOTAL_LEVELS ? `继续完成第 ${completed + 1} 关` : "挑战新的生活规则");
    return {
      completed,
      stars,
      progress: Math.round(completed / TOTAL_LEVELS * 100),
      quizScore,
      quizRate: record.assessment?.quizSubmitted ? Math.round(quizScore / TOTAL_QUIZ * 100) : 0,
      quizSubmitted: Boolean(record.assessment?.quizSubmitted),
      thinking: thinkingCount(record),
      error,
      errorLabel: window.LearningModel?.ERROR_META?.[error]?.label || (error ? error : "暂未发现重复错误"),
      recommendation,
      strongest: strongestMastery(record),
      growth: growthValue(record)
    };
  }

  function portraitText(record, data) {
    const strength = masteryLabels[data.strongest] || "分支判断";
    const practice = data.error
      ? `建议继续完成“${data.recommendation}”，把容易混淆的地方练得更熟。`
      : data.completed === TOTAL_LEVELS
        ? "你的学习路径很完整，可以尝试把分支判断应用到新的生活情境。"
        : `建议继续完成“${data.recommendation}”，收集更多学习证据。`;
    return `你已经完成了 ${data.completed}/${TOTAL_LEVELS} 个任务，收集了 ${data.stars}/${TOTAL_STARS} 颗星。你在${strength}方面表现较好，${practice}`;
  }

  function learningHighlight(record, data) {
    if (data.stars >= 16) return "闯关星星收集很出色";
    if (data.quizScore >= 4) return "知识测验掌握扎实";
    if (data.thinking >= 4) return "思考记录认真完整";
    if (data.completed >= 5) return "坚持完成学习任务";
    return `${masteryLabels[data.strongest] || "分支判断"}正在进步`;
  }

  function encouragement(data) {
    const remaining = TOTAL_LEVELS - data.completed;
    if (!remaining) return "六项任务已完成，继续挑战迁移应用徽章。";
    if (remaining === 1) return "距离下一枚完成徽章还差 1 个任务，继续加油！";
    return `再完成 ${remaining} 个任务即可点亮完整学习路线。`;
  }

  function render(container, currentRecord) {
    const current = metrics(currentRecord);
    const ranking = collectRecords(currentRecord)
      .map(record => ({ record, data: metrics(record) }))
      .sort((a, b) => b.data.growth - a.data.growth || b.data.stars - a.data.stars);
    const currentIndex = ranking.findIndex(item => recordKey(item.record) === recordKey(currentRecord));

    container.innerHTML = `
      <div class="performance-hero">
        <div>
          <span class="eyebrow">MY LEARNING GROWTH</span>
          <h1>我的表现</h1>
          <p>查看自己的学习足迹，把每一次尝试都变成下一步成长。</p>
        </div>
        <div class="performance-hero-illustration">
          <img src="assets/images/stages/stage-summary.webp" alt="学生完成学习任务并获得成长徽章">
          <span>记录每一步成长</span>
        </div>
        <div class="growth-score-card">
          <span>当前成长值</span>
          <strong>${current.growth}</strong>
          <small>${encouragement(current)}</small>
        </div>
      </div>

      <div class="performance-stat-grid">
        ${statCard(`${current.completed}/${TOTAL_LEVELS}`, "已完成关卡", "沿学习路线稳步前进")}
        ${statCard(`${current.stars}/${TOTAL_STARS}`, "已获得星星", "准确、逻辑与思考")}
        ${statCard(`${current.progress}%`, "学习进度", "按已完成关卡计算")}
        ${statCard(current.quizSubmitted ? `${current.quizRate}%` : "待完成", "知识测验正确率", current.quizSubmitted ? `${current.quizScore}/${TOTAL_QUIZ} 题正确` : "完成测验后更新")}
        ${statCard(`${current.thinking}/${TOTAL_LEVELS}`, "思考记录", "记录预测、证据与解释")}
      </div>

      <div class="performance-detail-grid">
        <section class="performance-panel portrait-card">
          <div class="performance-panel-heading">
            <div><span class="eyebrow">LEARNER PORTRAIT</span><h2>个人学习画像</h2></div>
            <span class="portrait-badge">持续成长</span>
          </div>
          <p>${escape(portraitText(currentRecord, current))}</p>
          <div class="portrait-tags">
            <span>学习亮点：${escape(learningHighlight(currentRecord, current))}</span>
            <span>最近关注：${escape(current.errorLabel)}</span>
          </div>
        </section>

        <section class="performance-panel next-task-card">
          <span class="eyebrow">NEXT STEP</span>
          <h2>下一步补学建议</h2>
          <strong>${escape(current.recommendation)}</strong>
          <p>${encouragement(current)}</p>
          <button class="primary-button" type="button" data-performance-level="${currentRecord.diagnostics?.recommendations?.[0]?.level || Math.min(current.completed + 1, TOTAL_LEVELS)}">前往学习任务 →</button>
        </section>
      </div>

      <section class="performance-panel growth-ranking-panel">
        <div class="performance-panel-heading">
          <div>
            <span class="eyebrow">PERSONAL GROWTH BOARD</span>
            <h2>个人成长榜</h2>
            <p>只比较个人学习记录，关注成长积累，不设置小组排名。</p>
          </div>
          <label class="secondary-button file-button performance-import">导入学习记录
            <input type="file" id="performance-import-files" accept=".json,application/json" multiple>
          </label>
        </div>
        <div class="current-ranking-note">
          <strong>我的成长位置：第 ${currentIndex + 1} 名</strong>
          <span>${encouragement(current)}</span>
        </div>
        <div class="growth-table-wrap">
          <table class="growth-table">
            <thead><tr><th>排名</th><th>学生姓名</th><th>成长值</th><th>已完成关卡</th><th>星星数</th><th>学习亮点</th></tr></thead>
            <tbody>
              ${ranking.map((item, index) => `
                <tr class="${recordKey(item.record) === recordKey(currentRecord) ? "is-current" : ""}">
                  <td><span class="rank-number">${index + 1}</span></td>
                  <td><strong>${escape(item.record.learner?.name || "新学员")}</strong>${recordKey(item.record) === recordKey(currentRecord) ? "<small>我</small>" : ""}</td>
                  <td><b>${item.data.growth}</b></td>
                  <td>${item.data.completed}/${TOTAL_LEVELS}</td>
                  <td>${item.data.stars}/${TOTAL_STARS}</td>
                  <td>${escape(learningHighlight(item.record, item.data))}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <p class="growth-formula">成长值 = 星星数 × 10 + 完成关卡数 × 5 + 思考记录数 × 3 + 测验正确题数 × 5 + 自评完成情况 × 3</p>
      </section>`;
  }

  function statCard(value, label, note) {
    return `<article><strong>${value}</strong><span>${label}</span><small>${note}</small></article>`;
  }

  function escape(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  window.PerformanceDashboard = { render, metrics, growthValue, collectRecords };
})();
