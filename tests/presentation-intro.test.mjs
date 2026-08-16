import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = name => readFile(new URL(`../${name}`, import.meta.url), "utf8");

test("介绍页包含7页汇报与自动讲解入口", async () => {
  const source = await read("intro.html");
  assert.equal((source.match(/<section class="slide(?: [^"]*)?"/g) || []).length, 7);
  assert.match(source, /index\.html\?presentation=1/);
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /AI-IMAGE-PLACEHOLDER: cover-hero/);
  assert.match(source, /assets\/intro-slides\/slide-2-content\.png/);
  assert.match(source, /assets\/intro-slides\/slide-3-focus\.png/);
  assert.match(source, /assets\/intro-slides\/slide-4-goals\.png/);
  assert.match(source, /document\.body\.classList\.toggle\('image-slide'/);
});

test("项目讲解精简为10步跨学科证据路线", async () => {
  const source = await read("usage-tour.js");
  const block = source.match(/const presentationSteps = \[[\s\S]*?\n  \];/)?.[0] || "";
  assert.equal((block.match(/title: "/g) || []).length, 10);
  for (const selector of [
    ".level1-game .canvas-action-dock",
    ".level3-game .canvas-action-dock",
    ".rule-lab .lab-steps",
    ".project-metrics",
    ".rubric-groups",
    ".teacher-dashboard"
  ]) {
    assert.match(block, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(block, /video:/);
});

test("查询参数启动演示且演示导航不写入学习记录", async () => {
  const source = await read("app.js");
  assert.match(source, /get\("presentation"\) === "1"/);
  assert.match(source, /startPresentation\(\)/);
  assert.match(source, /if \(!options\.transient\) saveState\(\)/);
  assert.match(source, /CAL_CAPTURE_PRESENTATION_STATE/);
  assert.match(source, /CAL_RESTORE_PRESENTATION_STATE/);
});
