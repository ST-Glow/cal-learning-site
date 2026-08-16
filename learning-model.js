(function () {
  const ERROR_META = {
    "boundary-confusion": { label: "边界值混淆", level: 4, activity: "边界值专项练习" },
    "branch-direction": { label: "真假路径混淆", level: 2, activity: "双分支基础补学" },
    "flow-code-mismatch": { label: "流程图与代码不一致", level: 3, activity: "流程代码对应练习" },
    "nested-order": { label: "嵌套顺序错误", level: 5, activity: "嵌套结构复习" },
    indentation: { label: "代码层次不清", level: 5, activity: "缩进层次练习" },
    "low-confidence": { label: "正确但信心不足", level: 5, activity: "迁移挑战" },
    overconfidence: { label: "信心与结果不一致", level: 3, activity: "诊断性复习" }
  };

  const HINTS = {
    "boundary-confusion": [
      "先只观察 120cm：它是否满足“低于120cm”？",
      "把119、120、121分别代入“身高 < 120cm”，比较三个判断结果。",
      "条件骨架：如果 height < 120，输出半价票；否则进入非半价路径。请补出120cm的结果。"
    ],
    "branch-direction": [
      "先说出条件成立时应该去哪一个票口。",
      "用116cm检查“是”路径，用138cm检查“否”路径，再核对两个出口。",
      "半成品：身高 < 120cm？是 → 半价票；否 → ______。"
    ],
    "flow-code-mismatch": [
      "找出流程图中的菱形，它应该对应代码中的哪一行？",
      "依次对照：菱形对应if，成立路径对应if代码块，不成立路径对应else。",
      "代码骨架：if height < 120: 半价票；else: ______。再和流程图两条出口核对。"
    ],
    "nested-order": [
      "用“116cm且有学生证”的游客检查：哪一种优惠应该优先？",
      "先判断身高；只有身高不低于120cm时，才需要继续检查学生证。",
      "半成品：if 身高<120 → 半价；else → if 有学生证 → ______；否则 → 全价。"
    ],
    indentation: [
      "先找出第二次判断属于第一次判断的哪一条路径。",
      "学生证判断位于外层else里面，因此它和输出都要比外层代码多缩进一级。",
      "层次骨架：外层if为0级，外层输出和内层if为1级，内层两个输出为2级。"
    ],
    "low-confidence": [
      "你的答案已经表现出正确理解，可以用一个新例子再验证一次。",
      "试着向同学解释“条件—路径—结果”，讲清楚就是掌握的证据。",
      "选择一个生活规则，写成“如果……否则……”，再用两组数据验证。"
    ],
    overconfidence: [
      "先暂停看结果，不急着改答案：预测和实际从哪一步开始不同？",
      "把判断条件、输入值、成立与否逐项写出来，再检查所选路径。",
      "按这个表复查：输入____；条件____；结果成立/不成立；因此走____路径。"
    ]
  };

  function defaultModel() {
    return {
      mastery: { branch: 0, flowchart: 0, boundary: 0, nested: 0, transfer: 0 },
      errorTypes: {},
      history: [],
      confidenceGap: "",
      recommendations: [],
      updatedAt: ""
    };
  }

  function ensure(state) {
    state.learnerModel = {
      ...defaultModel(),
      ...(state.learnerModel || {}),
      mastery: { ...defaultModel().mastery, ...(state.learnerModel?.mastery || {}) },
      errorTypes: { ...(state.learnerModel?.errorTypes || {}) },
      history: Array.isArray(state.learnerModel?.history) ? state.learnerModel.history : [],
      recommendations: Array.isArray(state.learnerModel?.recommendations) ? state.learnerModel.recommendations : []
    };
    state.inquiry = state.inquiry || {};
    [4, 5].forEach(level => {
      state.inquiry[level] = {
        prediction: "",
        experiments: [],
        citedEvidence: [],
        explanation: "",
        correction: "",
        transfer: "",
        ...(state.inquiry[level] || {})
      };
    });
    return state.learnerModel;
  }

  function recordError(state, type, level, detail = "") {
    ensure(state);
    if (!ERROR_META[type]) return;
    const current = state.learnerModel.errorTypes[type] || { count: 0, hintLevel: 0, levels: [], lastSeen: "", active: true };
    current.count += 1;
    current.active = true;
    current.hintLevel = Math.min(3, current.hintLevel + 1);
    current.levels = [...new Set([...current.levels, Number(level)].filter(Boolean))];
    current.lastSeen = new Date().toISOString();
    current.detail = String(detail || "").slice(0, 180);
    state.learnerModel.errorTypes[type] = current;
    state.learnerModel.history.push({
      type,
      level: Number(level) || null,
      detail: current.detail,
      hintLevel: current.hintLevel,
      at: current.lastSeen
    });
    state.learnerModel.history = state.learnerModel.history.slice(-60);
    recalculate(state);
  }

  function resolveError(state, type, level = null, detail = "已通过新的答案或配置完成修正") {
    if (!state.learnerModel) ensure(state);
    const current = state.learnerModel.errorTypes[type];
    if (!current || current.active === false) return;
    current.active = false;
    current.resolvedAt = new Date().toISOString();
    state.learnerModel.history.push({
      type,
      level: Number(level) || null,
      detail,
      hintLevel: current.hintLevel || 1,
      resolved: true,
      at: current.resolvedAt
    });
    state.learnerModel.history = state.learnerModel.history.slice(-60);
  }

  function diagnoseMission(state, level, saved) {
    ensure(state);
    const found = [];
    const applicable = {
      1: ["branch-direction"],
      2: ["branch-direction"],
      3: ["boundary-confusion", "branch-direction", "flow-code-mismatch"],
      4: ["boundary-confusion", "branch-direction"],
      5: ["nested-order"]
    }[level] || [];
    if ([1, 2, 3, 4].includes(level)) {
      if (saved.operator === "lte") found.push("boundary-confusion");
      if (saved.trueExit && saved.falseExit && (saved.trueExit !== "half" || saved.falseExit !== "full")) {
        found.push("branch-direction");
      }
      if (level === 3 && (saved.operator !== "lt" || saved.trueExit !== "half" || saved.falseExit !== "full")) {
        found.push("flow-code-mismatch");
      }
    }
    if (level === 5 && saved.order && saved.order !== "height-first") found.push("nested-order");
    applicable.forEach(type => {
      if (found.includes(type)) recordError(state, type, level, missionDetail(saved));
      else resolveError(state, type, level);
    });
    recalculate(state);
    return [...new Set(found)];
  }

  function diagnoseKnowledge(state, level, segment, answers) {
    const maps = {
      2: ["branch-direction", "flow-code-mismatch"],
      3: ["flow-code-mismatch", "boundary-confusion"],
      5: ["nested-order", "indentation"]
    };
    segment.questions.forEach((item, index) => {
      const type = maps[level][index];
      if (Number(answers[index]) !== item.answer) recordError(state, type, level, item.q);
      else resolveError(state, type, level);
    });
    recalculate(state);
  }

  function missionDetail(saved) {
    const wrong = (saved.lastRun || []).filter(item => !item.correct)
      .map(item => `${item.visitor?.height || "?"}cm:${item.actual || "未出票"}→${item.expected || "未知"}`);
    return wrong.join("；") || `条件:${saved.operator || saved.order || "未设置"}`;
  }

  function scoreMission(state, level, property) {
    const mission = state.game?.missions?.[level];
    return mission?.earned?.[property] ? 100 : mission?.attempts ? 45 : 0;
  }

  function knowledgeScore(state, key) {
    const segment = state.knowledge?.segments?.[key];
    return segment?.submitted ? Math.round((segment.score || 0) / 2 * 100) : 0;
  }

  function average(values) {
    const active = values.filter(value => Number.isFinite(value));
    return active.length ? Math.round(active.reduce((sum, value) => sum + value, 0) / active.length) : 0;
  }

  function recalculate(state) {
    const model = ensure(state);
    model.mastery = {
      branch: average([knowledgeScore(state, "branch"), scoreMission(state, 1, "accuracy"), scoreMission(state, 2, "logic")]),
      flowchart: average([knowledgeScore(state, "flowCode"), scoreMission(state, 2, "accuracy"), scoreMission(state, 3, "logic")]),
      boundary: average([knowledgeScore(state, "flowCode"), scoreMission(state, 4, "accuracy"), scoreMission(state, 4, "logic")]),
      nested: average([knowledgeScore(state, "nested"), scoreMission(state, 4, "logic"), state.completed?.includes(4) ? 100 : 0]),
      transfer: average([scoreMission(state, 5, "accuracy"), scoreMission(state, 5, "logic"), state.completed?.includes(5) ? 100 : 0])
    };

    const quizPercent = state.quizSubmitted ? (Number(state.quizScore) || 0) / 5 * 100 : null;
    const ratings = Object.values(state.selfRating || {}).map(Number).filter(Boolean);
    const confidence = ratings.length ? average(ratings.map(value => value / 5 * 100)) : null;
    model.confidenceGap = "";
    if (quizPercent !== null && confidence !== null) {
      if (quizPercent >= 70 && confidence <= 45) model.confidenceGap = "low-confidence";
      if (quizPercent < 60 && confidence >= 75) model.confidenceGap = "overconfidence";
    }
    ["low-confidence", "overconfidence"].forEach(type => {
      if (type !== model.confidenceGap) resolveError(state, type);
    });
    if (model.confidenceGap && !model.errorTypes[model.confidenceGap]) {
      model.errorTypes[model.confidenceGap] = { count: 1, hintLevel: 1, levels: [], lastSeen: new Date().toISOString(), detail: "测验与自评差异", active: true };
    } else if (model.confidenceGap) {
      model.errorTypes[model.confidenceGap].active = true;
    }
    model.recommendations = buildRecommendations(state, model);
    model.updatedAt = new Date().toISOString();
    return model;
  }

  function buildRecommendations(state, model) {
    const activeErrors = Object.entries(model.errorTypes)
      .filter(([, value]) => value.count > 0 && value.active !== false)
      .sort((a, b) => b[1].count - a[1].count || String(b[1].lastSeen).localeCompare(String(a[1].lastSeen)));
    const recommendations = [];
    activeErrors.forEach(([type]) => {
      const meta = ERROR_META[type];
      if (meta && !recommendations.some(item => item.level === meta.level)) {
        recommendations.push({
          type,
          level: meta.level,
          title: meta.activity,
          reason: recommendationReason(type),
          tone: type === "low-confidence" ? "encourage" : "review"
        });
      }
    });
    if (!recommendations.length) {
      if (!(state.completed || []).length) {
        recommendations.push({ type: "start", level: 1, title: "从生活规则出发", reason: "先认识条件怎样决定不同的出票结果。", tone: "review" });
        recommendations.push({ type: "branch-direction", level: 2, title: "认识菱形与两条路径", reason: "完成基础关后继续搭建判断闸机。", tone: "review" });
      } else if ((state.completed || []).length < 3) {
        recommendations.push({ type: "flow-code-mismatch", level: 3, title: "流程代码对应练习", reason: "把生活规则连接到流程图和if-else代码。", tone: "review" });
      } else if ((model.mastery.nested || 0) < 70) {
        recommendations.push({ type: "nested-order", level: 5, title: "嵌套结构复习", reason: "用冲突游客检查两座闸机的先后顺序。", tone: "review" });
      } else {
        recommendations.push({ type: "transfer", level: 5, title: "创意规则拓展", reason: "你已经掌握基础规则，可以设计新的优惠条件。", tone: "challenge" });
      }
    }
    if (recommendations.length < 2 && state.completed?.length >= 4 && !recommendations.some(item => item.level === 5)) {
      recommendations.push({ type: "transfer", level: 5, title: "迁移挑战", reason: "把分支判断应用到新的生活规则。", tone: "challenge" });
    }
    return recommendations.slice(0, 2);
  }

  function recommendationReason(type) {
    return ({
      "boundary-confusion": "你在120cm附近出现过判断分歧，建议用119、120、121重新验证。",
      "branch-direction": "真假出口曾经连接错误，建议用一高一矮两位游客复查。",
      "flow-code-mismatch": "流程图与代码曾出现不一致，建议同步观察菱形与if。",
      "nested-order": "优惠优先级曾出现冲突，建议用116cm且有学生证的游客验证。",
      indentation: "代码层次还不够清楚，建议复习内外两层缩进。",
      "low-confidence": "你的结果不错，可以用迁移任务建立更多信心。",
      overconfidence: "自评和测验结果存在差异，建议逐步核对条件与路径。"
    })[type] || "根据最近的学习记录生成。";
  }

  function currentDiagnosis(state, level) {
    const model = recalculate(state);
    const candidates = Object.entries(model.errorTypes)
      .filter(([type, value]) => value.count > 0 && value.active !== false && (!level || value.levels?.includes(Number(level)) || ERROR_META[type]?.level === Number(level)))
      .sort((a, b) => b[1].count - a[1].count || b[1].hintLevel - a[1].hintLevel);
    if (!candidates.length) return null;
    const [type, value] = candidates[0];
    return {
      type,
      label: ERROR_META[type]?.label || type,
      hintLevel: Math.max(1, Math.min(3, value.hintLevel || 1)),
      hint: HINTS[type]?.[Math.max(0, Math.min(2, (value.hintLevel || 1) - 1))] || "",
      recommendedActivity: ERROR_META[type]?.activity || ""
    };
  }

  function thinkingEligible(state, level) {
    ensure(state);
    if (Number(level) === 5 && state.project && window.CrossDisciplinaryLab) {
      const project = window.CrossDisciplinaryLab.ensureProjectState(state.project);
      const explanation = String(project.personalReflection || project.fairnessEvidence?.conflictExplanation || "").trim();
      const cases = project.fairnessEvidence?.caseIds || [];
      const hasEvidence = Array.isArray(project.datasetResults) && project.datasetResults.length >= 12 && cases.length >= 2;
      return {
        earned: hasEvidence && explanation.length >= 8 && project.revisions.length >= 1,
        hasEvidence,
        hasLength: explanation.length >= 8,
        hasConcept: /数据|质疑|公平|收入|优惠|条件|顺序|边界|冲突|修改|修订/.test(explanation)
      };
    }
    if (Number(level) === 4 && state.lab && window.RuleLab) {
      const lab = window.RuleLab.ensureLab(state);
      const text = `${lab.reflection || ""} ${lab.fairnessReason || ""}`.trim();
      const hasEvidence = Boolean(lab.fairnessVisitor) && lab.reflection.trim().length >= 8;
      return {
        earned: hasEvidence && text.length >= 8 && /公平|证据|收入|优惠|边界|顺序|120|119|121/.test(text),
        hasEvidence,
        hasLength: text.length >= 8,
        hasConcept: /公平|证据|收入|优惠|边界|顺序|120|119|121/.test(text)
      };
    }
    const explanation = String(state.worksheet?.entries?.[level]?.explanation || state.game?.missions?.[level]?.review || "").trim();
    const evidence = state.game?.missions?.[level]?.lastRun || [];
    const keywordRules = {
      1: /身高|条件|轨道|路径|票/,
      2: /菱形|是|否|路径|判断/,
      3: /流程图|菱形|if|else|代码|条件/,
      4: /120|边界|收入|优惠|公平|顺序|证据/,
      5: /公平|条件|顺序|测试|优惠|收入|游客/
    };
    return {
      earned: evidence.length > 0 && explanation.length >= 8 && keywordRules[level].test(explanation),
      hasEvidence: evidence.length > 0,
      hasLength: explanation.length >= 8,
      hasConcept: keywordRules[level].test(explanation)
    };
  }

  function evidenceText(item) {
    if (!item) return "";
    const visitor = item.visitor || {};
    const ticket = value => ({ half: "半价票", student: "学生票", full: "全价票", custom: "创意票" })[value] || value || "未知";
    return `${visitor.name || "游客"}（${visitor.height || "?"}cm${visitor.student ? "、有学生证" : ""}）：实际${ticket(item.actual)}，应为${ticket(item.expected)}，${item.correct ? "结果正确" : "路径错误"}`;
  }

  function exportV4(state) {
    const model = recalculate(state);
    return {
      schemaVersion: 4,
      title: "《智慧乐园票价公约》跨学科学习记录",
      exportedAt: new Date().toISOString(),
      learner: { ...(state.learner || {}) },
      progress: {
        completed: [...(state.completed || [])],
        completedCount: state.completed?.length || 0,
        totalStars: window.TicketGame?.totalStars(state) || 0,
        missions: structuredClone(state.game?.missions || {})
      },
      diagnostics: structuredClone(model),
      inquiryEvidence: structuredClone(state.inquiry || {}),
      assessment: {
        quiz: structuredClone(state.quiz || {}),
        quizSubmitted: Boolean(state.quizSubmitted),
        quizScore: Number(state.quizScore) || 0,
        selfRating: structuredClone(state.selfRating || {}),
        feedback: structuredClone(state.feedback || null),
        knowledge: structuredClone(state.knowledge || {})
      },
      worksheet: structuredClone(state.worksheet || {}),
      project: structuredClone(state.project || null)
    };
  }

  function normalizeRecord(raw) {
    if (!raw || typeof raw !== "object") throw new Error("记录格式无效");
    if (Number(raw.schemaVersion) === 4) return raw;
    if (Number(raw.schemaVersion) === 3) {
      return {
        ...raw,
        schemaVersion: 4,
        migratedFrom: 3,
        project: { legacyReadOnly: true, note: "该记录来自v3，仅保留旧版创意任务与学习证据。" }
      };
    }
    const source = raw.state && typeof raw.state === "object" ? raw.state : raw;
    const missions = source.game?.missions || {};
    const completed = source.completed || [];
    const totalStars = Object.values(missions).reduce((sum, mission) => sum + Number(mission?.bestStars || 0), 0);
    return {
      schemaVersion: 4,
      migratedFrom: Number(raw.schemaVersion || source.worksheet?.version || 2),
      title: raw.title || "旧版分支判断学习记录",
      exportedAt: raw.exportedAt || new Date(0).toISOString(),
      learner: source.learner || {},
      progress: { completed, completedCount: completed.length, totalStars, missions },
      diagnostics: source.learnerModel || defaultModel(),
      inquiryEvidence: source.inquiry || {},
      assessment: {
        quiz: source.quiz || {},
        quizSubmitted: Boolean(source.quizSubmitted),
        quizScore: Number(source.quizScore) || 0,
        selfRating: source.selfRating || {},
        feedback: source.feedback || null,
        knowledge: source.knowledge || {}
      },
      worksheet: source.worksheet || {},
      project: { legacyReadOnly: true, note: "该记录由v2或更早版本迁移，仅保留旧版学习证据。" }
    };
  }

  window.LearningModel = {
    ERROR_META,
    ensure,
    recordError,
    resolveError,
    diagnoseMission,
    diagnoseKnowledge,
    recalculate,
    currentDiagnosis,
    thinkingEligible,
    evidenceText,
    exportV4,
    exportV3: exportV4,
    normalizeRecord
  };
})();
