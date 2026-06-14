(function () {
  const STORAGE_KEY = "cal-teacher-dashboard-v1";
  const masteryLabels = {
    branch: "双分支",
    flowchart: "流程图",
    boundary: "边界值",
    nested: "嵌套",
    transfer: "迁移应用"
  };

  let records = load();
  if (localStorage.getItem(STORAGE_KEY) === null) persist();

  function load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) return createDemoRecords();
      const value = JSON.parse(stored);
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function createDemoRecords() {
    const learners = [
      ["202601", "林晓雨", 6, 17, 5, [92, 90, 88, 84, 78], "", "", 0],
      ["202602", "陈子涵", 6, 16, 4, [88, 85, 74, 82, 76], "boundary-confusion", "", 2],
      ["202603", "王一诺", 5, 14, 4, [82, 78, 72, 68, 60], "nested-order", "", 2],
      ["202604", "李明轩", 5, 13, 3, [76, 70, 64, 62, 55], "flow-code-mismatch", "overconfidence", 3],
      ["202605", "周可欣", 6, 15, 5, [86, 82, 80, 75, 72], "low-confidence", "low-confidence", 1],
      ["202606", "赵宇辰", 4, 11, 3, [72, 68, 58, 52, 45], "boundary-confusion", "", 3],
      ["202607", "孙诗琪", 4, 10, 2, [66, 62, 54, 48, 42], "branch-direction", "overconfidence", 4],
      ["202608", "吴嘉乐", 5, 13, 4, [80, 76, 70, 66, 58], "indentation", "", 2],
      ["202609", "郑雨桐", 3, 8, 3, [68, 60, 52, 40, 35], "flow-code-mismatch", "", 3],
      ["202610", "何俊熙", 6, 18, 5, [96, 94, 92, 90, 86], "", "", 0],
      ["202611", "冯思源", 4, 9, 3, [70, 65, 56, 50, 44], "boundary-confusion", "", 4],
      ["202612", "蒋依晨", 5, 12, 4, [78, 74, 68, 64, 57], "nested-order", "low-confidence", 2]
    ];
    const activities = {
      "boundary-confusion": ["边界值专项练习", 4],
      "branch-direction": ["双分支基础补学", 2],
      "flow-code-mismatch": ["流程代码对应练习", 3],
      "nested-order": ["嵌套结构复习", 5],
      indentation: ["缩进层次练习", 5],
      "low-confidence": ["迁移挑战", 6],
      overconfidence: ["诊断性复习", 3]
    };

    return learners.map(([id, name, completedCount, stars, quizScore, mastery, mainError, confidenceGap, errorCount], index) => {
      const completed = Array.from({ length: completedCount }, (_, item) => item + 1);
      const errorTypes = {};
      if (mainError) {
        errorTypes[mainError] = {
          count: errorCount,
          hintLevel: Math.min(3, Math.max(1, errorCount - 1)),
          levels: [activities[mainError]?.[1] || 3],
          active: true,
          lastSeen: `2026-06-${String(12 - (index % 5)).padStart(2, "0")}T08:30:00.000Z`
        };
      }
      if (confidenceGap && confidenceGap !== mainError) {
        errorTypes[confidenceGap] = { count: 1, hintLevel: 1, levels: [], active: true };
      }
      const recommendation = activities[mainError] || (completedCount === 6 ? ["创意规则拓展", 6] : ["继续当前学习路径", completedCount + 1]);
      const missions = Object.fromEntries([1, 2, 3, 4, 5, 6].map(level => [
        level,
        { attempts: level <= completedCount ? 1 + ((index + level) % 3) : 0 }
      ]));
      return {
        schemaVersion: 3,
        title: "《分支判断》示例学习记录",
        exportedAt: `2026-06-${String(12 - (index % 5)).padStart(2, "0")}T09:00:00.000Z`,
        learner: { id, name, className: "五年级（2）班", group: `${(index % 4) + 1}组` },
        progress: { completed, completedCount, totalStars: stars, missions },
        diagnostics: {
          mastery: { branch: mastery[0], flowchart: mastery[1], boundary: mastery[2], nested: mastery[3], transfer: mastery[4] },
          errorTypes,
          confidenceGap,
          recommendations: [{ type: mainError || "transfer", level: recommendation[1], title: recommendation[0] }]
        },
        assessment: { quizSubmitted: true, quizScore, quiz: {}, selfRating: {}, feedback: null, knowledge: {} },
        inquiryEvidence: {},
        worksheet: {}
      };
    });
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function importRecords(values) {
    let added = 0;
    let updated = 0;
    let ignored = 0;
    const invalid = [];
    values.forEach(({ name, data }) => {
      try {
        const record = window.LearningModel.normalizeRecord(data);
        const learnerId = record.learner?.id || `${record.learner?.name || "unknown"}-${record.learner?.className || ""}`;
        if (!learnerId || learnerId.startsWith("unknown-")) throw new Error("缺少学生编号或姓名");
        const index = records.findIndex(item => (item.learner?.id || `${item.learner?.name}-${item.learner?.className || ""}`) === learnerId);
        if (index < 0) {
          records.push(record);
          added += 1;
        } else if (new Date(record.exportedAt || 0) > new Date(records[index].exportedAt || 0)) {
          records[index] = record;
          updated += 1;
        } else {
          ignored += 1;
        }
      } catch (error) {
        invalid.push(`${name}：${error.message}`);
      }
    });
    persist();
    return { added, updated, ignored, invalid };
  }

  function average(values) {
    const valid = values.map(Number).filter(Number.isFinite);
    return valid.length ? Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length) : 0;
  }

  function summary() {
    const count = records.length;
    const completedRate = count ? Math.round(records.reduce((sum, record) => sum + (record.progress?.completedCount || 0), 0) / (count * 6) * 100) : 0;
    const averageStars = count ? (records.reduce((sum, record) => sum + Number(record.progress?.totalStars || 0), 0) / count).toFixed(1) : "0.0";
    const averageQuiz = count ? (records.reduce((sum, record) => sum + Number(record.assessment?.quizScore || 0), 0) / count).toFixed(1) : "0.0";
    const mastery = Object.fromEntries(Object.keys(masteryLabels).map(key => [
      key,
      average(records.map(record => record.diagnostics?.mastery?.[key] || 0))
    ]));
    const levels = [1, 2, 3, 4, 5, 6].map(level => {
      const completed = records.filter(record => record.progress?.completed?.includes(level)).length;
      const attempts = average(records.map(record => record.progress?.missions?.[level]?.attempts || 0));
      return { level, completed, rate: count ? Math.round(completed / count * 100) : 0, attempts };
    });
    const errors = {};
    records.forEach(record => Object.entries(record.diagnostics?.errorTypes || {}).forEach(([key, value]) => {
      errors[key] = (errors[key] || 0) + Number(value?.count || 0);
    }));
    const errorRanking = Object.entries(errors).sort((a, b) => b[1] - a[1]);
    const confidence = {
      low: records.filter(record => record.diagnostics?.confidenceGap === "low-confidence"),
      highWrong: records.filter(record => record.diagnostics?.confidenceGap === "overconfidence")
    };
    const boundaryMistakes = records.filter(record => record.diagnostics?.errorTypes?.["boundary-confusion"]?.count > 0).length;
    return { count, completedRate, averageStars, averageQuiz, mastery, levels, errorRanking, confidence, boundaryMistakes };
  }

  function render(container) {
    const data = summary();
    container.innerHTML = `
      <div class="teacher-toolbar">
        <div>
          <span class="eyebrow">LOCAL CLASS ANALYTICS</span>
          <h2>班级学习数据概览</h2>
          <p>所有数据仅在当前浏览器中汇总，不会自动上传。</p>
        </div>
        <div class="teacher-actions">
          <button class="secondary-button" id="teacher-load-demo">恢复示例数据</button>
          <label class="primary-button file-button">导入学习记录
            <input type="file" id="teacher-import-files" accept=".json,application/json" multiple>
          </label>
          <button class="secondary-button" id="teacher-export-csv" ${data.count ? "" : "disabled"}>导出 CSV</button>
          <button class="text-button teacher-clear" id="teacher-clear-records" ${data.count ? "" : "disabled"}>清空本地数据</button>
        </div>
      </div>
      ${data.count ? dashboardMarkup(data) : emptyMarkup()}`;
  }

  function dashboardMarkup(data) {
    const errorMeta = window.LearningModel.ERROR_META;
    return `
      <div class="teacher-stat-grid">
        ${statCard(data.count, "已导入学生", "份学习记录")}
        ${statCard(`${data.completedRate}%`, "总体完成率", "六关综合")}
        ${statCard(`${data.averageStars}/18`, "平均星数", "准确·逻辑·思考")}
        ${statCard(`${data.averageQuiz}/5`, "平均测验", "总结评价")}
      </div>
      <div class="teacher-dashboard-grid">
        <section class="teacher-panel mastery-panel">
          <div class="teacher-panel-heading"><div><span class="eyebrow">MASTERY</span><h3>五类知识掌握度</h3></div><small>综合知识检查与闯关表现</small></div>
          <div class="dashboard-bars">
            ${Object.entries(data.mastery).map(([key, value]) => barRow(masteryLabels[key], value, `${value}%`)).join("")}
          </div>
        </section>
        <section class="teacher-panel">
          <div class="teacher-panel-heading"><div><span class="eyebrow">LEVELS</span><h3>各关完成与尝试</h3></div><small>定位教学难点</small></div>
          <div class="level-analysis">
            ${data.levels.map(item => `
              <div><span>第${item.level}关</span><strong>${item.rate}%</strong><small>平均尝试 ${item.attempts} 次</small>
                <i><b style="width:${item.rate}%"></b></i>
              </div>`).join("")}
          </div>
        </section>
        <section class="teacher-panel">
          <div class="teacher-panel-heading"><div><span class="eyebrow">DIAGNOSIS</span><h3>高频错误类型</h3></div><small>${data.boundaryMistakes} 人出现边界值混淆</small></div>
          <div class="error-ranking">
            ${data.errorRanking.length ? data.errorRanking.slice(0, 7).map(([key, count], index) => `
              <div><span>${index + 1}</span><strong>${errorMeta[key]?.label || key}</strong><b>${count} 次</b></div>`).join("") : "<p>暂未记录到错误类型。</p>"}
          </div>
        </section>
        <section class="teacher-panel confidence-panel">
          <div class="teacher-panel-heading"><div><span class="eyebrow">CONFIDENCE</span><h3>信心与成绩差异</h3></div><small>用于针对性鼓励和复习</small></div>
          ${studentList("正确但信心不足", data.confidence.low)}
          ${studentList("高信心但需复习", data.confidence.highWrong)}
        </section>
      </div>
      <section class="teacher-panel student-table-panel">
        <div class="teacher-panel-heading"><div><span class="eyebrow">LEARNERS</span><h3>学生诊断与推荐</h3></div><small>可导出CSV用于课后分析</small></div>
        <div class="teacher-table-wrap">
          <table class="teacher-table">
            <thead><tr><th>学生</th><th>班级</th><th>完成</th><th>星数</th><th>测验</th><th>主要错误</th><th>推荐任务</th></tr></thead>
            <tbody>${records.map(record => studentRow(record)).join("")}</tbody>
          </table>
        </div>
      </section>`;
  }

  function statCard(value, label, note) {
    return `<article><strong>${value}</strong><span>${label}</span><small>${note}</small></article>`;
  }

  function barRow(label, value, display) {
    return `<div class="dashboard-bar"><span>${label}</span><i><b style="width:${value}%"></b></i><strong>${display}</strong></div>`;
  }

  function studentList(title, list) {
    return `<div class="confidence-list"><strong>${title}<span>${list.length}</span></strong>
      <p>${list.length ? list.map(record => escape(record.learner?.name || record.learner?.id || "未命名")).join("、") : "暂无"}</p></div>`;
  }

  function studentRow(record) {
    const errors = Object.entries(record.diagnostics?.errorTypes || {}).sort((a, b) => Number(b[1]?.count || 0) - Number(a[1]?.count || 0));
    const error = errors[0]?.[0];
    const recommendations = (record.diagnostics?.recommendations || []).map(item => item.title).join("、") || "继续当前路径";
    return `<tr>
      <td>${escape(record.learner?.name || "未命名")}</td>
      <td>${escape(record.learner?.className || "-")}</td>
      <td>${record.progress?.completedCount || 0}/6</td>
      <td>${record.progress?.totalStars || 0}/18</td>
      <td>${record.assessment?.quizSubmitted ? `${record.assessment.quizScore}/5` : "未测验"}</td>
      <td>${escape(window.LearningModel.ERROR_META[error]?.label || "暂无")}</td>
      <td>${escape(recommendations)}</td>
    </tr>`;
  }

  function emptyMarkup() {
    return `<div class="teacher-empty">
      <span>DATA</span>
      <h3>导入学生学习记录后生成班级仪表盘</h3>
      <p>支持新版v3记录，也可以自动迁移当前网站导出的旧版JSON。重复或更旧的记录会被忽略。</p>
      <ol><li>学生在电子任务单点击“导出学习记录”</li><li>教师一次选择多个JSON文件</li><li>网页在本地生成统计图表并可导出CSV</li></ol>
    </div>`;
  }

  function exportCsv() {
    const headings = ["学生编号", "姓名", "班级", "小组", "完成关卡", "星数", "测验成绩", "主要错误", "推荐任务"];
    const rows = records.map(record => {
      const errors = Object.entries(record.diagnostics?.errorTypes || {}).sort((a, b) => Number(b[1]?.count || 0) - Number(a[1]?.count || 0));
      return [
        record.learner?.id || "",
        record.learner?.name || "",
        record.learner?.className || "",
        record.learner?.group || "",
        record.progress?.completedCount || 0,
        record.progress?.totalStars || 0,
        record.assessment?.quizSubmitted ? record.assessment.quizScore : "",
        errors.map(([key]) => window.LearningModel.ERROR_META[key]?.label || key).join("、"),
        (record.diagnostics?.recommendations || []).map(item => item.title).join("、")
      ];
    });
    const csv = "\ufeff" + [headings, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n");
    download(csv, `CAL班级学习数据-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8");
  }

  function clear() {
    records = [];
    persist();
  }

  function loadDemo() {
    records = createDemoRecords();
    persist();
  }

  function getRecords() {
    return structuredClone(records);
  }

  function csvCell(value) {
    return `"${String(value ?? "").replaceAll('"', '""')}"`;
  }

  function download(content, name, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }

  function escape(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  window.TeacherDashboard = { render, importRecords, exportCsv, clear, loadDemo, getRecords, summary };
})();
