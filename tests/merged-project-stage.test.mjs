import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = name => readFile(new URL(`../${name}`, import.meta.url), "utf8");

test("左侧导航将项目与评价合并为第四阶段", async () => {
  const source = await read("app.js");
  const phaseBlock = source.match(/const phaseMeta = \[[\s\S]*?\n\];/)?.[0] || "";
  assert.equal((phaseBlock.match(/\{ id:/g) || []).length, 4);
  assert.match(phaseBlock, /id: 4, title: "项目评价"/);
  assert.doesNotMatch(phaseBlock, /title: "总结评价"/);
  assert.match(source, /data-open-final-evaluation/);
  assert.equal((source.match(/state\.currentLevel === 5 \? null : knowledgeSegments/g) || []).length, 2);
});

test("跨学科项目使用四步学生脚手架", async () => {
  const [source, styles] = await Promise.all([read("app.js"), read("styles.css")]);
  for (const label of ["设计规则", "数学检查", "公平说明", "同伴修改与评价"]) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /信息科技：把规则写清楚/);
  assert.match(source, /数学：用数字检查方案/);
  assert.match(source, /公共责任：用案例说明公平/);
  assert.match(styles, /\.project-step-panel \{ display: none; \}/);
  assert.match(styles, /\.project-step-panel\.active \{ display: block; \}/);
});

test("项目步骤会写入并迁移学习记录", async () => {
  const source = await read("cross-disciplinary-lab.js");
  assert.match(source, /activeStep: 1/);
  assert.match(source, /merged\.activeStep = Math\.min\(4/);
});
