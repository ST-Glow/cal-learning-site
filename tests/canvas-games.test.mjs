import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = name => readFile(new URL(`../${name}`, import.meta.url), "utf8");

test("切换到挑战时重置滚动并自动对齐游戏顶部", async () => {
  const source = await read("app.js");
  assert.match(source, /levelStage\.scrollTop = 0/);
  assert.match(source, /levelStage\.querySelector\("\.ticket-game"\)/);
});

test("三关画布都提供可点击的无障碍操作区", async () => {
  const [level1, level2, level3] = await Promise.all([
    read("level1-canvas.js"),
    read("level2-canvas.js"),
    read("level3-canvas.js")
  ]);
  assert.match(level1, /level1-action-dock/);
  assert.match(level2, /level2-action-dock/);
  assert.match(level3, /level3-action-dock/);
});

test("拖拽接线使用Pointer Events并包含120厘米边界游客", async () => {
  const [level2, missions] = await Promise.all([
    read("level2-canvas.js"),
    read("ticket-game.js")
  ]);
  assert.match(level2, /pointerdown/);
  assert.match(level2, /setPointerCapture/);
  assert.match(missions, /name: "冬冬"[^\n]+height: 120/);
});

test("画布游戏采用整行主舞台布局", async () => {
  const source = await read("styles.css");
  assert.match(source, /\.level1-game \.track-board,[\s\S]+grid-column: 1 \/ -1/);
  assert.match(source, /aspect-ratio: 900 \/ 430/);
});

test("接线游戏的节点、线路和反馈条互不遮挡", async () => {
  const [game, styles] = await Promise.all([
    read("level2-canvas.js"),
    read("styles.css")
  ]);
  assert.match(game, /yes: \{ x: 385, y: 224/);
  assert.match(game, /no: \{ x: 515, y: 224/);
  assert.ok(game.indexOf("drawConnections();") < game.indexOf("drawMachine();"));
  assert.match(styles, /\.level1-game \.track-message,[\s\S]+position: relative/);
  assert.match(styles, /\.level2-game \.level2-ready-overlay \{[\s\S]+position: relative/);
});
