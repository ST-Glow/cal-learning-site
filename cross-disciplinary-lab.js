(function (root) {
  const FULL_PRICE = 20;
  const MIN_INCOME = 160;
  const MIN_DISCOUNTED = 5;

  const RULE_META = {
    child: { label: "儿童优惠", field: "height", fieldLabel: "身高", valueLabel: "厘米" },
    elder: { label: "老人优惠", field: "age", fieldLabel: "年龄", valueLabel: "岁" },
    student: { label: "学生优惠", field: "student", fieldLabel: "学生证", valueLabel: "" },
    family: { label: "家庭优惠", field: "family", fieldLabel: "家庭同行", valueLabel: "" }
  };

  const PUBLIC_VISITORS = [
    { id: "H119", name: "小芽", height: 119, age: 10, student: true, family: false, focus: "119cm；儿童与学生条件冲突" },
    { id: "H120", name: "小洲", height: 120, age: 11, student: true, family: false, focus: "120cm身高边界" },
    { id: "H121", name: "安安", height: 121, age: 12, student: false, family: true, focus: "121cm；家庭优惠" },
    { id: "A59", name: "林叔", height: 175, age: 59, student: false, family: false, focus: "59岁年龄边界" },
    { id: "A60", name: "周姨", height: 165, age: 60, student: false, family: false, focus: "60岁年龄边界" },
    { id: "A61", name: "陈伯", height: 168, age: 61, student: false, family: true, focus: "61岁；老人和家庭条件冲突" },
    { id: "C01", name: "乐乐", height: 135, age: 11, student: true, family: true, focus: "学生和家庭条件冲突" },
    { id: "C02", name: "小林", height: 142, age: 10, student: true, family: false, focus: "学生优惠普通值" },
    { id: "C03", name: "王阿姨", height: 160, age: 38, student: false, family: true, focus: "家庭优惠普通值" },
    { id: "C04", name: "赵叔", height: 173, age: 41, student: false, family: false, focus: "默认全价票" },
    { id: "C05", name: "孙奶", height: 158, age: 66, student: false, family: false, focus: "老人优惠普通值" },
    { id: "C06", name: "一家代表", height: 170, age: 37, student: false, family: true, focus: "家庭优惠普通值" }
  ];

  const HIDDEN_VISITORS = [
    { id: "X01", name: "反例甲", height: 119, age: 60, student: true, family: true, focus: "同时符合四项条件" },
    { id: "X02", name: "反例乙", height: 120, age: 59, student: false, family: false, focus: "两个边界的外侧" },
    { id: "X03", name: "反例丙", height: 121, age: 61, student: true, family: true, focus: "老人、学生和家庭冲突" }
  ];

  function defaultPolicy() {
    return {
      fullPrice: FULL_PRICE,
      rules: [
        { id: "child", enabled: true, operator: "lt", threshold: 120, price: 10, priority: 1 },
        { id: "elder", enabled: false, operator: "gte", threshold: 60, price: 10, priority: 2 },
        { id: "student", enabled: true, operator: "eq", threshold: true, price: 15, priority: 3 },
        { id: "family", enabled: false, operator: "eq", threshold: true, price: 18, priority: 4 }
      ]
    };
  }

  function defaultProject() {
    const policy = defaultPolicy();
    return {
      policy,
      lastPolicy: structuredClone(policy),
      datasetResults: [],
      hiddenResults: [],
      metrics: null,
      mathEvidence: { totalIncome: 0, discountedCount: 0, comparison: "", calculation: "" },
      fairnessEvidence: { principle: "", caseIds: [], conflictExplanation: "" },
      peerAudit: { reviewer: "", counterexample: "", issueType: "", suggestion: "" },
      revisions: [],
      pseudocode: "",
      members: "",
      roles: "",
      defense: "",
      personalReflection: "",
      revisionReason: "",
      activeStep: 1,
      submittedAt: ""
    };
  }

  function normalizePolicy(policy = {}) {
    const fallback = defaultPolicy();
    const incoming = Array.isArray(policy.rules) ? policy.rules : [];
    const rules = fallback.rules.map((base, index) => {
      const value = incoming.find(item => item.id === base.id) || incoming[index] || {};
      return {
        ...base,
        ...value,
        id: base.id,
        enabled: value.enabled === undefined ? base.enabled : Boolean(value.enabled),
        threshold: ["student", "family"].includes(base.id) ? true : Number(value.threshold ?? base.threshold),
        price: Number(value.price ?? base.price),
        priority: Number(value.priority ?? base.priority)
      };
    });
    return { fullPrice: FULL_PRICE, rules };
  }

  function ensureProjectState(project) {
    const base = defaultProject();
    const source = project && typeof project === "object" ? project : {};
    const merged = {
      ...base,
      ...source,
      policy: normalizePolicy(source.policy),
      lastPolicy: normalizePolicy(source.lastPolicy || source.policy),
      mathEvidence: { ...base.mathEvidence, ...(source.mathEvidence || {}) },
      fairnessEvidence: { ...base.fairnessEvidence, ...(source.fairnessEvidence || {}) },
      peerAudit: { ...base.peerAudit, ...(source.peerAudit || {}) },
      revisions: Array.isArray(source.revisions) ? source.revisions : [],
      datasetResults: Array.isArray(source.datasetResults) ? source.datasetResults : [],
      hiddenResults: Array.isArray(source.hiddenResults) ? source.hiddenResults : []
    };
    if (!Array.isArray(merged.fairnessEvidence.caseIds)) merged.fairnessEvidence.caseIds = [];
    merged.activeStep = Math.min(4, Math.max(1, Number(merged.activeStep) || 1));
    return merged;
  }

  function matchesRule(visitor, rule) {
    if (!rule.enabled) return false;
    if (rule.id === "student") return Boolean(visitor.student);
    if (rule.id === "family") return Boolean(visitor.family);
    const actual = Number(visitor[RULE_META[rule.id].field]);
    const target = Number(rule.threshold);
    if (rule.operator === "lt") return actual < target;
    if (rule.operator === "lte") return actual <= target;
    if (rule.operator === "gt") return actual > target;
    if (rule.operator === "gte") return actual >= target;
    return actual === target;
  }

  function evaluateVisitor(visitor, policy) {
    const normalized = normalizePolicy(policy);
    const activeRules = normalized.rules
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
    const matched = activeRules.filter(rule => matchesRule(visitor, rule));
    const selected = matched[0] || null;
    return {
      visitor: structuredClone(visitor),
      ticketId: selected?.id || "full",
      ticketLabel: selected ? RULE_META[selected.id].label : "全价票",
      price: selected ? Number(selected.price) : FULL_PRICE,
      matchedRules: matched.map(rule => rule.id),
      collision: matched.length > 1,
      path: [...activeRules.slice(0, selected ? activeRules.indexOf(selected) + 1 : activeRules.length).map(rule => rule.id), selected ? `出票:${selected.id}` : "出票:full"]
    };
  }

  function boundaryCoverage(results) {
    const heights = new Set(results.map(item => Number(item.visitor?.height)));
    const ages = new Set(results.map(item => Number(item.visitor?.age)));
    const requiredHeights = [119, 120, 121];
    const requiredAges = [59, 60, 61];
    const passed = [...requiredHeights.map(value => heights.has(value)), ...requiredAges.map(value => ages.has(value))].filter(Boolean).length;
    return { passed, total: 6, percent: Math.round(passed / 6 * 100), requiredHeights, requiredAges };
  }

  function evaluatePolicy(policy, visitors = PUBLIC_VISITORS) {
    const normalized = normalizePolicy(policy);
    const results = visitors.map(visitor => evaluateVisitor(visitor, normalized));
    const totalIncome = results.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const discountedCount = results.filter(item => item.price < FULL_PRICE).length;
    const collisionCount = results.filter(item => item.collision).length;
    const invalidPrices = normalized.rules.filter(rule => !Number.isInteger(rule.price) || rule.price < 0 || rule.price > FULL_PRICE);
    const duplicatePriorities = normalized.rules.filter(rule => rule.enabled)
      .some((rule, index, all) => all.findIndex(item => item.priority === rule.priority) !== index);
    const coverage = boundaryCoverage(results);
    const constraints = {
      prices: { pass: invalidPrices.length === 0, label: "所有票价均为0—20元整数" },
      income: { pass: totalIncome >= MIN_INCOME, label: `总收入不少于${MIN_INCOME}元` },
      discounted: { pass: discountedCount >= MIN_DISCOUNTED, label: `至少${MIN_DISCOUNTED}人获得优惠` },
      unique: { pass: !duplicatePriorities, label: "优先级唯一，所有游客只有一个最终票种" },
      boundary: { pass: coverage.percent === 100, label: "119/120/121cm与59/60/61岁全部覆盖" }
    };
    return {
      policy: normalized,
      results,
      metrics: {
        totalIncome,
        discountedCount,
        collisionCount,
        boundaryCoverage: coverage.percent,
        uniqueOutcomes: !duplicatePriorities,
        invalidPriceCount: invalidPrices.length,
        allConstraintsPass: Object.values(constraints).every(item => item.pass)
      },
      constraints
    };
  }

  function compareBaselineOrders() {
    const conflictVisitors = [
      { id: "O1", name: "妹妹", height: 116, age: 11, student: true, family: false },
      { id: "O2", name: "小明", height: 138, age: 11, student: true, family: false },
      { id: "O3", name: "叔叔", height: 176, age: 38, student: false, family: false },
      { id: "O4", name: "小雨", height: 120, age: 11, student: true, family: false }
    ];
    const make = order => ({
      fullPrice: FULL_PRICE,
      rules: order.map((id, index) => id === "child"
        ? { id, enabled: true, operator: "lt", threshold: 120, price: 10, priority: index + 1 }
        : { id, enabled: true, operator: "eq", threshold: true, price: 15, priority: index + 1 })
    });
    return [
      { id: "height-first", label: "先身高，后学生证", ...evaluatePolicy(make(["child", "student"]), conflictVisitors) },
      { id: "student-first", label: "先学生证，后身高", ...evaluatePolicy(make(["student", "child"]), conflictVisitors) }
    ];
  }

  function policySummary(policy) {
    const operator = { lt: "<", lte: "≤", gt: ">", gte: "≥", eq: "=" };
    return normalizePolicy(policy).rules
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority)
      .map(rule => {
        const meta = RULE_META[rule.id];
        const condition = ["student", "family"].includes(rule.id)
          ? `${meta.fieldLabel}=是`
          : `${meta.fieldLabel}${operator[rule.operator] || "="}${rule.threshold}${meta.valueLabel}`;
        return `${rule.priority}. ${condition}→${meta.label}${rule.price}元`;
      }).join("；") + `；否则→全价票${FULL_PRICE}元`;
  }

  function generatePseudocode(policy) {
    const operator = { lt: "<", lte: "<=", gt: ">", gte: ">=", eq: "==" };
    const lines = [];
    normalizePolicy(policy).rules.filter(rule => rule.enabled).sort((a, b) => a.priority - b.priority).forEach((rule, index) => {
      const meta = RULE_META[rule.id];
      const condition = ["student", "family"].includes(rule.id)
        ? `${meta.field} == true`
        : `${meta.field} ${operator[rule.operator] || "=="} ${rule.threshold}`;
      lines.push(`${index ? "否则如果" : "如果"} ${condition}：`);
      lines.push(`    输出“${meta.label}”，票价 = ${rule.price}`);
    });
    lines.push("否则：");
    lines.push(`    输出“全价票”，票价 = ${FULL_PRICE}`);
    return lines.join("\n");
  }

  function policiesEqual(a, b) {
    return JSON.stringify(normalizePolicy(a)) === JSON.stringify(normalizePolicy(b));
  }

  function buildRevision(before, after, reason) {
    return {
      before: policySummary(before),
      after: policySummary(after),
      reason: String(reason || "").trim(),
      at: new Date().toISOString()
    };
  }

  function projectAcceptance(project) {
    const value = ensureProjectState(project);
    const evaluation = evaluatePolicy(value.policy);
    const checks = {
      constraints: { pass: evaluation.metrics.allConstraintsPass, label: "公开数据满足全部硬约束" },
      pseudocode: { pass: String(value.pseudocode).trim().length >= 20, label: "伪代码完整表达优先顺序" },
      math: { pass: String(value.mathEvidence.calculation).trim().length >= 12, label: "数学计算过程可复核" },
      fairnessCases: { pass: value.fairnessEvidence.caseIds.length >= 2, label: "公平论证引用至少2名游客" },
      fairnessReason: { pass: String(value.fairnessEvidence.principle).trim().length >= 8 && String(value.fairnessEvidence.conflictExplanation).trim().length >= 12, label: "公平原则与冲突处理说明充分" },
      peerAudit: { pass: [value.peerAudit.reviewer, value.peerAudit.counterexample, value.peerAudit.suggestion].every(item => String(item).trim().length >= 2), label: "完成一轮同伴反例审查" },
      revision: { pass: value.revisions.length >= 1, label: "保留至少一次有理由的算法修订" },
      collaboration: { pass: String(value.members).trim().length >= 2 && String(value.roles).trim().length >= 4, label: "记录小组成员与协作分工" },
      reflection: { pass: String(value.personalReflection).trim().length >= 8, label: "完成个人反思" }
    };
    return { evaluation, checks, pass: Object.values(checks).every(item => item.pass) };
  }

  root.CrossDisciplinaryLab = {
    FULL_PRICE,
    MIN_INCOME,
    MIN_DISCOUNTED,
    RULE_META,
    PUBLIC_VISITORS,
    HIDDEN_VISITORS,
    defaultPolicy,
    defaultProject,
    normalizePolicy,
    ensureProjectState,
    evaluateVisitor,
    evaluatePolicy,
    compareBaselineOrders,
    policySummary,
    generatePseudocode,
    policiesEqual,
    buildRevision,
    projectAcceptance
  };
})(typeof window !== "undefined" ? window : globalThis);
