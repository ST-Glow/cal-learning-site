(function () {
  let app;
  let model;
  let resizeObserver;
  let speechTimer;

  function fitModel(canvas) {
    if (!model) return;
    const width = canvas.clientWidth || 220;
    const height = canvas.clientHeight || 300;
    app.renderer.resize(width, height);
    const originalWidth = model.internalModel?.originalWidth || model.width || 1;
    const originalHeight = model.internalModel?.originalHeight || model.height || 1;
    const scale = Math.min(width / originalWidth, height / originalHeight) * 1.08;
    model.scale.set(scale);
    model.anchor.set(0.5, 1);
    model.position.set(width / 2, height + 4);
  }

  async function init() {
    const canvas = document.getElementById("live2d-canvas");
    const fallback = document.getElementById("live2d-fallback");
    if (!canvas || !window.PIXI?.live2d?.Live2DModel) {
      fallback?.classList.remove("hidden");
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
      resizeObserver = new ResizeObserver(() => fitModel(canvas));
      resizeObserver.observe(canvas);
      fallback?.classList.add("hidden");
      document.querySelector(".live2d-character")?.classList.add("ready");
    } catch (error) {
      console.warn("Live2D assistant failed to load.", error);
      fallback?.classList.remove("hidden");
    }
  }

  function setSpeaking(active) {
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

  window.Live2DAssistant = { init, setSpeaking };
})();
