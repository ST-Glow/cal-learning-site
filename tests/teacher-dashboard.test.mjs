import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = name => readFile(new URL(`../${name}`, import.meta.url), "utf8");

test("教师视角使用可观察的项目证据完整度替代信心指标", async () => {
  const source = await read("teacher-dashboard.js");
  assert.match(source, /项目证据完整度/);
  assert.match(source, /算法运行结果/);
  assert.match(source, /数学计算证据/);
  assert.match(source, /公平案例证据/);
  assert.match(source, /同伴审查记录/);
  assert.match(source, /有理由的修订/);
  assert.doesNotMatch(source, /信心与成绩差异/);
  assert.doesNotMatch(source, /<span class="eyebrow">CONFIDENCE<\/span>/);
});

test("教师错误统计和导出不把信心差异当作学习错误", async () => {
  const source = await read("teacher-dashboard.js");
  assert.match(source, /teacherExcludedErrorTypes/);
  assert.match(source, /\["low-confidence", "overconfidence"\]/);
  assert.match(source, /filter\(\(\[key\]\) => !teacherExcludedErrorTypes\.has\(key\)\)/);
});
