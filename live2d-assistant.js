(function () {
  const runtimeScripts = [
    "assets/live2d/vendor/live2dcubismcore.min.js",
    "assets/live2d/vendor/pixi.min.js",
    "assets/live2d/vendor/cubism4.min.js"
  ];
  let app;
  let model;
  let resizeObserver;
  let speechTimer;
  let initPromise;
  let scheduled = false;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-live2d-src="${src}"]`);
      if (existing?.dataset.loaded === "true") {
        resolve();
        return;
      }
      const script = existing || document.createElement("script");
      script.dataset.live2dSrc = src;
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve();
      }, { once: true });
      script.addEventListener("error", () => reject(new Error(`Unable to load ${src}`)), { once: true });
      if (!existing) {
        script.src = src;
        script.async = false;
        document.head.appendChild(script);
      }
    });
  }

  async function loadRuntime() {
    if (window.PIXI?.live2d?.Live2DModel) return;
    for (const src of runtimeScripts) await loadScript(src);
  }

  function fitModel(canvas) {
    if (!model) return;
    const character = canvas.closest(".live2d-character");
    const width = character?.clientWidth || canvas.clientWidth || 220;
    const height = character?.clientHeight || canvas.clientHeight || 300;
    app.renderer.resize(width, height);
    const originalWidth = model.internalModel?.originalWidth || model.width || 1;
    const originalHeight = model.internalModel?.originalHeight || model.height || 1;
    const scale = Math.min(width / originalWidth, height / originalHeight) * 0.96;
    model.scale.set(scale);
    model.anchor.set(0.5, 1);
    model.position.set(width / 2, height - 2);
  }

  async function initRuntime() {
    const canvas = document.getElementById("live2d-canvas");
    const fallback = document.getElementById("live2d-fallback");
    const character = canvas?.closest(".live2d-character");
    if (!canvas) return;
    fallback?.classList.remove("hidden");
    character?.setAttribute("aria-busy", "true");

    try {
      await loadRuntime();
    } catch (error) {
      console.warn("Live2D runtime failed to load.", error);
      fallback?.classList.remove("hidden");
      character?.setAttribute("aria-busy", "false");
      return;
    }

    try {
      app = new PIXI.Application({
        view: canvas,
        autoStart: true,
        transparent: true,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        width: canvas.clientWidth || 220,
        height: canvas.clientHeight || 300
      });
      model = await PIXI.live2d.Live2DModel.from("assets/live2d/model/assistant.model3.json", {
        autoInteract: true
      });
      app.stage.addChild(model);
      fitModel(canvas);
      const character = canvas.closest(".live2d-character");
      resizeObserver = new ResizeObserver(() => requestAnimationFrame(() => fitModel(canvas)));
      resizeObserver.observe(character || canvas);
      fallback?.classList.add("hidden");
      character?.classList.add("ready");
      character?.setAttribute("aria-busy", "false");
    } catch (error) {
      console.warn("Live2D assistant failed to load.", error);
      fallback?.classList.remove("hidden");
      character?.setAttribute("aria-busy", "false");
    }
  }

  function ensureLoaded() {
    if (!initPromise) initPromise = initRuntime();
    return initPromise;
  }

  function scheduleInit() {
    if (scheduled) return;
    scheduled = true;
    const run = () => ensureLoaded();
    const button = document.getElementById("assistant-button");
    button?.addEventListener("pointerenter", run, { once: true });
    button?.addEventListener("focus", run, { once: true });
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(run, { timeout: 2200 });
    } else {
      window.setTimeout(run, 1200);
    }
  }

  function setSpeaking(active) {
    if (active) ensureLoaded();
    document.querySelector(".live2d-character")?.classList.toggle("speaking", Boolean(active));
    if (!model?.internalModel?.coreModel) return;
    clearInterval(speechTimer);
    const coreModel = model.internalModel.coreModel;
    const mouthIndex = coreModel.getParameterIndex?.("ParamMouthOpenY");
    if (!active || mouthIndex == null || mouthIndex < 0) {
      if (mouthIndex >= 0) coreModel.setParameterValueByIndex(mouthIndex, 0);
      return;
    }
    let open = false;
    speechTimer = setInterval(() => {
      open = !open;
      coreModel.setParameterValueByIndex(mouthIndex, open ? 0.65 : 0.12);
    }, 150);
    setTimeout(() => setSpeaking(false), 2400);
  }

  window.Live2DAssistant = { ensureLoaded, init: ensureLoaded, scheduleInit, setSpeaking };
})();
