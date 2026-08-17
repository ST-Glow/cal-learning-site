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
  assert.match(source, /assets\/intro-slides\/slide-2-content\.webp/);
  assert.match(source, /assets\/intro-slides\/slide-3-focus\.webp/);
  assert.match(source, /assets\/intro-slides\/slide-4-goals\.webp/);
  assert.match(source, /document\.body\.classList\.toggle\('image-slide'/);
});

test("项目讲解精简为10步跨学科证据路线", async () => {
  const source = await read("usage-tour.js");
  const block = source.match(/const presentationSteps = \[[\s\S]*?\n  \];/)?.[0] || "";
  assert.equal((block.match(/title: "/g) || []).length, 10);
  for (const selector of [
    ".level1-game .track-board",
    ".level3-game .track-board",
    ".rule-lab",
    ".project-metrics",
    ".evaluation-layout",
    ".teacher-dashboard"
  ]) {
    assert.match(block, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(block, /video:/);
});

test("汇报讲解提供放大卡片和可收起演示模式", async () => {
  const [html, styles, tour] = await Promise.all([read("index.html"), read("styles.css"), read("usage-tour.js")]);
  assert.match(html, /id="tour-collapse"/);
  assert.match(styles, /data-mode="presentation"/);
  assert.match(styles, /font-size: 36px/);
  assert.match(tour, /mode === "presentation" \? 560 : 390/);
  assert.match(tour, /function toggleCard\(\)/);
});

test("数字人画布跟随容器缩放并保留完整人物", async () => {
  const [styles, assistant] = await Promise.all([read("styles.css"), read("live2d-assistant.js")]);
  assert.match(styles, /width: 100% !important/);
  assert.match(styles, /height: 100% !important/);
  assert.match(assistant, /character\?\.clientWidth/);
  assert.match(assistant, /\* 0\.96/);
  assert.match(assistant, /resizeObserver\.observe\(character \|\| canvas\)/);
});

test("首屏使用轻量图片并延迟加载数字人资源", async () => {
  const [html, intro, assistant] = await Promise.all([read("index.html"), read("intro.html"), read("live2d-assistant.js")]);
  assert.match(html, /smart-ticket-park\.webp/);
  assert.doesNotMatch(html, /assets\/live2d\/vendor\/live2dcubismcore\.min\.js/);
  assert.match(html, /<script defer src="app\.js"><\/script>/);
  assert.match(intro, /loading="lazy"/);
  assert.match(assistant, /requestIdleCallback/);
});

test("查询参数启动演示且演示导航不写入学习记录", async () => {
  const source = await read("app.js");
  assert.match(source, /get\("presentation"\) === "1"/);
  assert.match(source, /startPresentation\(\)/);
  assert.match(source, /if \(!options\.transient\) saveState\(\)/);
  assert.match(source, /CAL_CAPTURE_PRESENTATION_STATE/);
  assert.match(source, /CAL_RESTORE_PRESENTATION_STATE/);
});
