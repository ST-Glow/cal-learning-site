import test from "node:test";
import assert from "node:assert/strict";

await import("../cross-disciplinary-lab.js");
const Lab = globalThis.CrossDisciplinaryLab;

test("统一边界规则严格使用身高小于120厘米", () => {
  const policy = Lab.defaultPolicy();
  const at119 = Lab.evaluateVisitor({ id: "a", name: "119", height: 119, age: 10, student: true, family: false }, policy);
  const at120 = Lab.evaluateVisitor({ id: "b", name: "120", height: 120, age: 11, student: true, family: false }, policy);
  assert.equal(at119.ticketId, "child");
  assert.equal(at120.ticketId, "student");
});

test("初始方案覆盖12名游客并暴露优惠人数不足", () => {
  const result = Lab.evaluatePolicy(Lab.defaultPolicy());
  assert.equal(result.results.length, 12);
  assert.equal(result.metrics.totalIncome, 215);
  assert.equal(result.metrics.discountedCount, 4);
  assert.equal(result.metrics.collisionCount, 1);
  assert.equal(result.metrics.boundaryCoverage, 100);
  assert.equal(result.metrics.allConstraintsPass, false);
});

test("重复优先级会使唯一结果约束不通过", () => {
  const policy = Lab.defaultPolicy();
  policy.rules.find(rule => rule.id === "student").priority = policy.rules.find(rule => rule.id === "child").priority;
  const result = Lab.evaluatePolicy(policy);
  assert.equal(result.constraints.unique.pass, false);
  assert.equal(result.metrics.allConstraintsPass, false);
});

test("票价必须是0到20元整数", () => {
  const policy = Lab.defaultPolicy();
  policy.rules[0].price = 20.5;
  const result = Lab.evaluatePolicy(policy);
  assert.equal(result.constraints.prices.pass, false);
});

test("完整方案包需要公平案例、同伴审查和修订证据", () => {
  const project = Lab.defaultProject();
  const evaluated = Lab.evaluatePolicy(project.policy);
  project.datasetResults = evaluated.results;
  project.metrics = evaluated.metrics;
  project.pseudocode = Lab.generatePseudocode(project.policy);
  project.mathEvidence.calculation = "10+15+18+20+10+10+15+15+18+20+10+18=179元";
  project.fairnessEvidence = { principle: "相同条件的游客采用相同票价规则。", caseIds: ["H119", "A60"], conflictExplanation: "多项条件冲突时，按照公开的优先级只执行第一项。" };
  project.peerAudit = { reviewer: "第3组", counterexample: "119厘米且60岁并有学生证", issueType: "优先级冲突", suggestion: "说明多项优惠冲突时的选择依据" };
  const changed = Lab.defaultPolicy();
  changed.rules.find(rule => rule.id === "elder").enabled = true;
  changed.rules.find(rule => rule.id === "family").enabled = true;
  changed.rules[3].price = 17;
  project.policy = changed;
  project.revisions.push(Lab.buildRevision(project.lastPolicy, changed, "同伴反例提示家庭票优先级需要重新核对"));
  project.members = "甲、乙、丙、丁";
  project.roles = "规则建模、计算检验、反例审查、答辩整合";
  project.personalReflection = "同伴提出的多条件反例促使我们修改家庭票价格。";
  const acceptance = Lab.projectAcceptance(project);
  assert.equal(acceptance.pass, true);
});

test("v4方案可运行隐藏多条件反例", () => {
  const policy = Lab.defaultPolicy();
  policy.rules.forEach(rule => { rule.enabled = true; });
  const result = Lab.evaluatePolicy(policy, Lab.HIDDEN_VISITORS);
  assert.equal(result.results.length, 3);
  assert.equal(result.results[0].matchedRules.length, 4);
  assert.equal(result.results[0].ticketId, "child");
});
