(function () {
  const BOUNDARY_VISITORS = [
    { id: "119", name: "119号", height: 119 },
    { id: "120", name: "120号", height: 120 },
    { id: "121", name: "121号", height: 121 }
  ];
  const FAIRNESS_VISITORS = [
    { id: "妹妹", label: "妹妹（116cm，有学生证）" },
    { id: "小明", label: "小明（138cm，有学生证）" },
    { id: "小雨", label: "小雨（120cm，有学生证）" }
  ];

  function defaultLab() {
    return {
      chip: "",
      incomeChoice: "",
      discountedCount: "",
      fairnessVisitor: "",
      fairnessReason: "",
      reflection: "",
      submitted: false,
      earned: { accuracy: false, logic: false, thinking: false },
      bestStars: 0,
      attempts: 0
    };
  }

  function ensureLab(state) {
    if (!state.lab) state.lab = {};
    state.lab = {
      ...defaultLab(),
      ...(state.lab || {}),
      earned: { ...defaultLab().earned, ...(state.lab?.earned || {}) }
    };
    return state.lab;
  }

  function boundaryPrice(chip, height) {
    const half = chip === "lte" ? height <= 120 : height < 120;
    return half ? 10 : 20;
  }

  function render(state, saved) {
    ensureLab(state);
    const lab = state.lab;
    const comparisons = window.CrossDisciplinaryLab ? window.CrossDisciplinaryLab.compareBaselineOrders() : [];
    const heightFirst = comparisons.find(item => item.id === "height-first");
    const studentFirst = comparisons.find(item => item.id === "student-first");

    return `
      <section class="rule-lab" data-lab-level="4">
        <div class="lab-intro">
          <span class="eyebrow">CROSS-DISCIPLINARY INQUIRY</span>
          <h3>规则检验实验室</h3>
          <p>先用边界值找出正确条件，再比较判断顺序对收入和公平的影响，最后写出你的数学证据与公平理由。</p>
        </div>

        <div class="lab-steps" aria-label="探究步骤">
          <span class="${lab.chip ? "done" : ""}">1 边界排错</span>
          <span class="${lab.incomeChoice && lab.discountedCount ? "done" : ""}">2 冲突实验</span>
          <span class="${lab.fairnessVisitor && lab.fairnessReason ? "done" : ""}">3 公平论证</span>
          <span class="${lab.reflection ? "done" : ""}">4 反思提交</span>
        </div>

        <form id="rule-lab-form" class="rule-lab-form">
          <section class="lab-section">
            <div class="lab-section-heading"><span>01</span><div><h3>边界值排错</h3><p>120cm 是最容易暴露芯片错误的位置。</p></div></div>
            <div class="lab-chip-options">
              ${[
                { id: "lt", label: "身高 < 120cm" },
                { id: "lte", label: "身高 ≤ 120cm" }
              ].map(option => `
                <label class="${lab.chip === option.id ? "selected" : ""}">
                  <input type="radio" name="labChip" value="${option.id}" ${lab.chip === option.id ? "checked" : ""}>
                  <span>${option.label}</span>
                </label>`).join("")}
            </div>
            <div class="lab-table-wrap">
              <table class="lab-table">
                <thead><tr><th>游客</th><th>身高</th><th>当前芯片结果</th><th>票价</th></tr></thead>
                <tbody>
                  ${BOUNDARY_VISITORS.map(visitor => {
                    const price = lab.chip ? boundaryPrice(lab.chip, visitor.height) : "—";
                    const ticket = lab.chip ? (price === 10 ? "半价票" : "全价票") : "—";
                    return `<tr><td>${visitor.name}</td><td>${visitor.height}cm</td><td>${ticket}</td><td>${price === "—" ? "—" : `${price}元`}</td></tr>`;
                  }).join("")}
                </tbody>
              </table>
            </div>
            <p class="lab-hint">提示：规则是“身高 &lt; 120cm”，所以 120cm 应该买全价票。</p>
          </section>

          <section class="lab-section">
            <div class="lab-section-heading"><span>02</span><div><h3>优惠冲突实验</h3><p>同一组游客，只改变判断顺序，观察票种和收入变化。</p></div></div>
            ${heightFirst && studentFirst ? `
              <div class="lab-compare-grid">
                <article>
                  <h4>${heightFirst.label}</h4>
                  <strong>总收入 ${heightFirst.metrics.totalIncome} 元</strong>
                  <ul>${heightFirst.results.map(item => `<li>${item.visitor.name}：${item.ticketLabel} ${item.price}元</li>`).join("")}</ul>
                </article>
                <article>
                  <h4>${studentFirst.label}</h4>
                  <strong>总收入 ${studentFirst.metrics.totalIncome} 元</strong>
                  <ul>${studentFirst.results.map(item => `<li>${item.visitor.name}：${item.ticketLabel} ${item.price}元</li>`).join("")}</ul>
                </article>
              </div>
              <div class="lab-questions">
                <label>哪种顺序总收入更高？
                  <select name="labIncomeChoice">
                    <option value="">请选择</option>
                    <option value="height-first" ${lab.incomeChoice === "height-first" ? "selected" : ""}>先身高，后学生证</option>
                    <option value="student-first" ${lab.incomeChoice === "student-first" ? "selected" : ""}>先学生证，后身高</option>
                  </select>
                </label>
                <label>两种顺序下，优惠人数分别是多少人？
                  <select name="labDiscountedCount">
                    <option value="">请选择</option>
                    <option value="2" ${lab.discountedCount === "2" ? "selected" : ""}>2人</option>
                    <option value="3" ${lab.discountedCount === "3" ? "selected" : ""}>3人</option>
                    <option value="4" ${lab.discountedCount === "4" ? "selected" : ""}>4人</option>
                  </select>
                </label>
              </div>
            ` : `<p class="lab-empty">正在准备实验数据……</p>`}
          </section>

          <section class="lab-section">
            <div class="lab-section-heading"><span>03</span><div><h3>公平论证</h3><p>选一位游客，说明为什么某种顺序更公平。</p></div></div>
            <label>选择一位游客作为证据
              <select name="labFairnessVisitor">
                <option value="">请选择游客</option>
                ${FAIRNESS_VISITORS.map(item => `<option value="${item.id}" ${lab.fairnessVisitor === item.id ? "selected" : ""}>${item.label}</option>`).join("")}
              </select>
            </label>
            <label>公平理由（用完整句子）
              <textarea name="labFairnessReason" rows="3" placeholder="例如：我认为先判断身高更公平，因为妹妹身高116cm，应该先享受儿童半价，而不是因为学生证变成学生票。">${escape(lab.fairnessReason)}</textarea>
            </label>
          </section>

          <section class="lab-section">
            <div class="lab-section-heading"><span>04</span><div><h3>反思与提交</h3><p>把这次探究中最重要的发现写下来。</p></div></div>
            <label>我的发现
              <textarea name="labReflection" rows="3" placeholder="例如：120cm 是边界值，判断顺序会影响收入和公平。">${escape(lab.reflection)}</textarea>
            </label>
            <div class="lab-acceptance" id="lab-acceptance"></div>
            <button type="submit" class="primary-button full-width">提交跨学科探究单</button>
          </section>
        </form>
      </section>`;
  }

  function attach(level, options) {
    const state = options.state;
    ensureLab(state);
    const lab = state.lab;
    const form = document.getElementById("rule-lab-form");
    if (!form) return;

    form.addEventListener("input", event => {
      const field = event.target.name;
      const value = event.target.value;
      if (field === "labChip") lab.chip = value;
      else if (field === "labIncomeChoice") lab.incomeChoice = value;
      else if (field === "labDiscountedCount") lab.discountedCount = value;
      else if (field === "labFairnessVisitor") lab.fairnessVisitor = value;
      else if (field === "labFairnessReason") lab.fairnessReason = value;
      else if (field === "labReflection") lab.reflection = value;
      options.save();
      renderAcceptance();
    });

    form.addEventListener("submit", event => {
      event.preventDefault();
      lab.attempts = Number(lab.attempts || 0) + 1;
      const accuracy = lab.chip === "lt" && lab.incomeChoice === "student-first" && lab.discountedCount === "3";
      const logic = Boolean(lab.fairnessVisitor) && lab.fairnessReason.trim().length >= 8;
      const thinking = lab.reflection.trim().length >= 8;
      lab.earned = { accuracy, logic, thinking };
      const stars = Number(accuracy) + Number(logic) + Number(thinking);
      lab.bestStars = Math.max(lab.bestStars || 0, stars);
      lab.submitted = true;
      const mission = state.game.missions[options.level];
      if (mission) {
        mission.earned = { ...lab.earned };
        mission.bestStars = Math.max(mission.bestStars || 0, stars);
        mission.review = lab.reflection;
        mission.lastRun = lab.fairnessVisitor ? [{ visitor: { name: lab.fairnessVisitor }, expected: "half", actual: "half", correct: true }] : [];
      }
      if (state.worksheet?.entries?.[options.level]) {
        state.worksheet.entries[options.level].explanation = lab.reflection;
      }
      options.save();
      renderAcceptance();
      options.toast(stars === 3 ? "跨学科探究单完成，获得三星！" : stars ? "探究单已提交，可以继续补充。" : "请根据提示完善探究单。");
      if (accuracy && logic && thinking && options.complete) options.complete(options.level);
    });

    renderAcceptance();

    function renderAcceptance() {
      const el = document.getElementById("lab-acceptance");
      if (!el) return;
      const checks = [
        { label: "边界芯片正确", pass: lab.chip === "lt" },
        { label: "收入与优惠人数正确", pass: lab.incomeChoice === "student-first" && lab.discountedCount === "3" },
        { label: "公平论证完整", pass: Boolean(lab.fairnessVisitor) && lab.fairnessReason.trim().length >= 8 },
        { label: "反思完整", pass: lab.reflection.trim().length >= 8 }
      ];
      el.innerHTML = `<div class="acceptance-checks">${checks.map(item => `<span class="${item.pass ? "pass" : "pending"}">${item.pass ? "✓" : "○"} ${item.label}</span>`).join("")}</div>`;
    }
  }

  function escape(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  window.RuleLab = {
    defaultLab,
    ensureLab,
    render,
    attach
  };
})();
