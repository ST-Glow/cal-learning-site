(function () {
  const STORAGE_KEY = "cal-teacher-dashboard-v1";
  const masteryLabels = {
    branch: "双分支",
    flowchart: "流程图",
    boundary: "边界值",
    nested: "嵌套",
    transfer: "迁移应用"
  };
  const teacherExcludedErrorTypes = new Set(["low-confidence", "overconfidence"]);

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
      ["202601", "林晓雨", 5, 14, 5, [92, 90, 88, 84, 78], "", 0],
      ["202602", "陈子涵", 5, 13, 4, [88, 85, 74, 82, 76], "boundary-confusion", 2],
      ["202603", "王一诺", 4, 11, 4, [82, 78, 72, 68, 60], "nested-order", 2],
      ["202604", "李明轩", 4, 10, 3, [76, 70, 64, 62, 55], "flow-code-mismatch", 3],
      ["202605", "周可欣", 5, 12, 5, [86, 82, 80, 75, 72], "", 0],
      ["202606", "赵宇辰", 4, 9, 3, [72, 68, 58, 52, 45], "boundary-confusion", 3],
      ["202607", "孙诗琪", 3, 8, 2, [66, 62, 54, 48, 42], "branch-direction", 4],
      ["202608", "吴嘉乐", 4, 10, 4, [80, 76, 70, 66, 58], "indentation", 2],
      ["202609", "郑雨桐", 3, 7, 3, [68, 60, 52, 40, 35], "flow-code-mismatch", 3],
      ["202610", "何俊熙", 5, 15, 5, [96, 94, 92, 90, 86], "", 0],
      ["202611", "冯思源", 4, 8, 3, [70, 65, 56, 50, 44], "boundary-confusion", 4],
      ["202612", "蒋依晨", 4, 10, 4, [78, 74, 68, 64, 57], "nested-order", 2]
    ];
    const activities = {
      "boundary-confusion": ["边界值专项练习", 4],
      "branch-direction": ["双分支基础补学", 2],
      "flow-code-mismatch": ["流程代码对应练习", 3],
      "nested-order": ["嵌套结构复习", 5],
      indentation: ["缩进层次练习", 5]
    };

    return learners.map(([id, name, completedCount, stars, quizScore, mastery, mainError, errorCount], index) => {
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
      const recommendation = activities[mainError] || (completedCount === 5 ? ["创意规则拓展", 5] : ["继续当前学习路径", completedCount + 1]);
      const missions = Object.fromEntries([1, 2, 3, 4, 5].map(level => [
        level,
        { attempts: level <= completedCount ? 1 + ((index + level) % 3) : 0 }
      ]));
      const projectCompleted = completedCount === 5;
      const projectIncome = projectCompleted ? 158 + ((index * 5) % 25) : 0;
      return {
        schemaVersion: 4,
        title: "《智慧乐园票价公约》示例学习记录",
        exportedAt: `2026-06-${String(12 - (index % 5)).padStart(2, "0")}T09:00:00.000Z`,
        learner: { id, name, className: "五年级（2）班", group: `${(index % 4) + 1}组` },
        progress: { completed, completedCount, totalStars: stars, missions },
        diagnostics: {
          mastery: { branch: mastery[0], flowchart: mastery[1], boundary: mastery[2], nested: mastery[3], transfer: mastery[4] },
          errorTypes,
          recommendations: [{ type: mainError || "transfer", level: recommendation[1], title: recommendation[0] }]
        },
        assessment: { quizSubmitted: true, quizScore, quiz: {}, selfRating: {}, feedback: null, knowledge: {} },
        inquiryEvidence: {},
        worksheet: {},
        project: projectCompleted ? {
          metrics: {
            totalIncome: projectIncome,
            discountedCount: 5 + (index % 4),
            collisionCount: 2 + (index % 3),
            boundaryCoverage: index % 5 === 0 ? 83 : 100,
            uniqueOutcomes: index % 6 !== 0,
            allConstraintsPass: projectIncome >= 160 && index % 5 !== 0 && index % 6 !== 0
          },
          fairnessEvidence: {
            principle: index % 4 === 0 ? "" : "相同条件采用相同规则，并用具体游客核对。",
            caseIds: index % 4 === 0 ? ["H120"] : ["H119", "A60"]
          },
          peerAudit: { reviewer: "同伴小组", counterexample: "多条件游客", suggestion: "重新核对优先级" },
          revisions: Array.from({ length: index % 3 }, (_, revision) => ({ reason: `第${revision + 1}次修订` }))
        } : null
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
    const completedRate = count ? Math.round(records.reduce((sum, record) => sum + (record.progress?.completedCount || 0), 0) / (count * 5) * 100) : 0;
    const averageStars = count ? (records.reduce((sum, record) => sum + Number(record.progress?.totalStars || 0), 0) / count).toFixed(1) : "0.0";
    const averageQuiz = count ? (records.reduce((sum, record) => sum + Number(record.assessment?.quizScore || 0), 0) / count).toFixed(1) : "0.0";
    const mastery = Object.fromEntries(Object.keys(masteryLabels).map(key => [
      key,
      average(records.map(record => record.diagnostics?.mastery?.[key] || 0))
    ]));
    const levels = [1, 2, 3, 4, 5].map(level => {
      const completed = records.filter(record => record.progress?.completed?.includes(level)).length;
      const attempts = average(records.map(record => record.progress?.missions?.[level]?.attempts || 0));
      return { level, completed, rate: count ? Math.round(completed / count * 100) : 0, attempts };
    });
    const errors = {};
    records.forEach(record => Object.entries(record.diagnostics?.errorTypes || {}).forEach(([key, value]) => {
      if (teacherExcludedErrorTypes.has(key)) return;
      errors[key] = (errors[key] || 0) + Number(value?.count || 0);
    }));
    const errorRanking = Object.entries(errors).sort((a, b) => b[1] - a[1]);
    const boundaryMistakes = records.filter(record => record.diagnostics?.errorTypes?.["boundary-confusion"]?.count > 0).length;
    const projectRecords = records.filter(record => record.project && !record.project.legacyReadOnly);
    const evidenceDimensions = [
      ["算法运行结果", record => Boolean(record.project?.metrics)],
      ["数学计算证据", record => Number.isFinite(Number(record.project?.metrics?.totalIncome)) && Number.isFinite(Number(record.project?.metrics?.discountedCount))],
      ["公平案例证据", record => (record.project?.fairnessEvidence?.caseIds || []).length >= 2 && String(record.project?.fairnessEvidence?.principle || "").trim().length >= 8],
      ["同伴审查记录", record => String(record.project?.peerAudit?.counterexample || "").trim().length > 0 && String(record.project?.peerAudit?.suggestion || "").trim().length > 0],
      ["有理由的修订", record => (record.project?.revisions || []).some(item => String(item?.reason || "").trim().length > 0)]
    ];
    const evidence = evidenceDimensions.map(([label, predicate]) => ({
      label,
      rate: projectRecords.length ? Math.round(projectRecords.filter(predicate).length / projectRecords.length * 100) : 0
    }));
    const evidenceCompleteness = average(evidence.map(item => item.rate));
    const project = {
      count: projectRecords.length,
      logicCorrectness: average(projectRecords.map(record => record.project?.metrics?.uniqueOutcomes ? 100 : 0)),
      boundaryCoverage: average(projectRecords.map(record => record.project?.metrics?.boundaryCoverage || 0)),
      incomePassRate: projectRecords.length ? Math.round(projectRecords.filter(record => Number(record.project?.metrics?.totalIncome || 0) >= 160).length / projectRecords.length * 100) : 0,
      conflictResolutionRate: projectRecords.length ? Math.round(projectRecords.filter(record => record.project?.metrics?.uniqueOutcomes).length / projectRecords.length * 100) : 0,
      fairnessEvidenceRate: projectRecords.length ? Math.round(projectRecords.filter(record => (record.project?.fairnessEvidence?.caseIds || []).length >= 2 && String(record.project?.fairnessEvidence?.principle || "").trim().length >= 8).length / projectRecords.length * 100) : 0,
      averageRevisions: projectRecords.length ? (projectRecords.reduce((sum, record) => sum + Number(record.project?.revisions?.length || 0), 0) / projectRecords.length).toFixed(1) : "0.0"
    };
    return { count, completedRate, averageStars, averageQuiz, mastery, levels, errorRanking, evidence, evidenceCompleteness, boundaryMistakes, project };
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
        ${statCard(`${data.completedRate}%`, "总体完成率", "五关综合")}
        ${statCard(`${data.averageStars}/15`, "平均星数", "准确·逻辑·思考")}
        ${statCard(`${data.averageQuiz}/5`, "平均测验", "总结评价")}
      </div>
      <section class="teacher-panel interdisciplinary-panel">
        <div class="teacher-panel-heading"><div><span class="eyebrow">INTERDISCIPLINARY EVIDENCE</span><h3>票价公约跨学科证据</h3></div><small>${data.project.count}份v4项目记录</small></div>
        <div class="interdisciplinary-metrics">
          ${statCard(`${data.project.logicCorrectness}%`, "逻辑唯一性", "优先级与默认分支")}
          ${statCard(`${data.project.boundaryCoverage}%`, "边界覆盖", "身高与年龄六个边界")}
          ${statCard(`${data.project.incomePassRate}%`, "收入达标", "不少于160元")}
          ${statCard(`${data.project.conflictResolutionRate}%`, "冲突解决", "多条件游客有唯一结果")}
          ${statCard(`${data.project.fairnessEvidenceRate}%`, "公平证据", "至少引用2名游客")}
          ${statCard(data.project.averageRevisions, "平均修订", "数据或同伴质疑驱动")}
        </div>
      </section>
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
        <section class="teacher-panel evidence-panel">
          <div class="teacher-panel-heading"><div><span class="eyebrow">EVIDENCE</span><h3>项目证据完整度</h3></div><small>平均完整度 ${data.evidenceCompleteness}%</small></div>
          <div class="dashboard-bars">
            ${data.evidence.map(item => barRow(item.label, item.rate, `${item.rate}%`)).join("")}
          </div>
        </section>
      </div>
      <section class="teacher-panel student-table-panel">
        <div class="teacher-panel-heading"><div><span class="eyebrow">LEARNERS</span><h3>学生诊断与推荐</h3></div><small>可导出CSV用于课后分析</small></div>
        <div class="teacher-table-wrap">
          <table class="teacher-table">
            <thead><tr><th>学生</th><th>班级</th><th>完成</th><th>星数</th><th>测验</th><th>项目收入</th><th>边界覆盖</th><th>公平证据</th><th>修订</th><th>主要错误</th><th>推荐任务</th></tr></thead>
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

  function studentRow(record) {
    const errors = Object.entries(record.diagnostics?.errorTypes || {})
      .filter(([key]) => !teacherExcludedErrorTypes.has(key))
      .sort((a, b) => Number(b[1]?.count || 0) - Number(a[1]?.count || 0));
    const error = errors[0]?.[0];
    const recommendations = (record.diagnostics?.recommendations || []).map(item => item.title).join("、") || "继续当前路径";
    return `<tr>
      <td>${escape(record.learner?.name || "未命名")}</td>
      <td>${escape(record.learner?.className || "-")}</td>
      <td>${record.progress?.completedCount || 0}/5</td>
      <td>${record.progress?.totalStars || 0}/15</td>
      <td>${record.assessment?.quizSubmitted ? `${record.assessment.quizScore}/5` : "未测验"}</td>
      <td>${record.project?.metrics ? `${record.project.metrics.totalIncome || 0}元` : "旧版/未提交"}</td>
      <td>${record.project?.metrics ? `${record.project.metrics.boundaryCoverage || 0}%` : "-"}</td>
      <td>${record.project?.fairnessEvidence ? `${record.project.fairnessEvidence.caseIds?.length || 0}例` : "-"}</td>
      <td>${record.project?.revisions?.length || 0}</td>
      <td>${escape(window.LearningModel.ERROR_META[error]?.label || "暂无")}</td>
      <td>${escape(recommendations)}</td>
    </tr>`;
  }

  function emptyMarkup() {
    return `<div class="teacher-empty">
      <span>DATA</span>
      <h3>导入学生学习记录后生成班级仪表盘</h3>
      <p>支持新版v4跨学科记录，也会把v3及更早记录迁移为只读学习证据。重复或更旧的记录会被忽略。</p>
      <ol><li>学生在电子任务单点击“导出学习记录”</li><li>教师一次选择多个JSON文件</li><li>网页在本地生成统计图表并可导出CSV</li></ol>
    </div>`;
  }

  function exportCsv() {
    const headings = ["学生编号", "姓名", "班级", "小组", "完成关卡", "星数", "测验成绩", "项目收入", "优惠人数", "边界覆盖率", "冲突解决", "公平案例数", "修订次数", "主要错误", "推荐任务"];
    const rows = records.map(record => {
      const errors = Object.entries(record.diagnostics?.errorTypes || {})
        .filter(([key]) => !teacherExcludedErrorTypes.has(key))
        .sort((a, b) => Number(b[1]?.count || 0) - Number(a[1]?.count || 0));
      return [
        record.learner?.id || "",
        record.learner?.name || "",
        record.learner?.className || "",
        record.learner?.group || "",
        record.progress?.completedCount || 0,
        record.progress?.totalStars || 0,
        record.assessment?.quizSubmitted ? record.assessment.quizScore : "",
        record.project?.metrics?.totalIncome || "",
        record.project?.metrics?.discountedCount || "",
        record.project?.metrics?.boundaryCoverage || "",
        record.project?.metrics ? (record.project.metrics.uniqueOutcomes ? "是" : "否") : "",
        record.project?.fairnessEvidence?.caseIds?.length || "",
        record.project?.revisions?.length || "",
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
