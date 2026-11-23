/* =========================================================
   핏 체크 스크립트 (fitcheck.js)
   - fitcheck.html     : 치수 입력 → 들어가는 가구 + 남는 공간 표시
   - fitcheck_set.html : 공간별 추천 조합 (<body data-mode="set">)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.mode === "set") renderSets();
  else initFitCheck();
});

/* ---------- 치수 입력 · 결과 ---------- */
function initFitCheck() {
  const form = document.querySelector("#fcForm");
  const inW = document.querySelector("#cW"), inD = document.querySelector("#cD"), inH = document.querySelector("#cH");
  const inType = document.querySelector("#cType");

  // 메인에서 넘어온 값(?w=&d=&h=&type=) → 없으면 저장한 내 방 치수
  const room = Store.get(KEY.myRoom, null);
  inW.value = param("w") || (room && room.w) || "";
  inD.value = param("d") || (room && room.d) || "";
  inH.value = param("h") || (room && room.h) || "";
  if (param("type")) inType.value = param("type");

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!Number(inW.value) || !Number(inD.value)) {
      showToast("가로와 세로는 꼭 입력해 주세요.");
      (!Number(inW.value) ? inW : inD).focus();
      return;
    }
    Store.set(KEY.myRoom, Object.assign({}, room, { w: Number(inW.value), d: Number(inD.value), h: Number(inH.value) || "" }));
    search();
  });
  inType.addEventListener("change", () => inW.value && inD.value && search());
  document.querySelectorAll("input[name=margin]").forEach(r => r.addEventListener("change", () => inW.value && inD.value && search()));

  // 메인에서 값을 가지고 왔으면 바로 결과 보여 주기
  if (param("w") && param("d")) search();
}

function search() {
  const w = Number(document.querySelector("#cW").value);
  const d = Number(document.querySelector("#cD").value);
  const h = Number(document.querySelector("#cH").value);
  const type = document.querySelector("#cType").value;
  const margin = Number(document.querySelector("input[name=margin]:checked").value);

  const pool = PRODUCTS.filter(p => type === "all" || p.cat === type);
  const ok = pool.map(p => ({ p, r: fitInfo(p, w, d, h, margin) })).filter(x => x.r.ok);
  ok.sort((a, b) => (a.r.leftW + a.r.leftD) - (b.r.leftW + b.r.leftD));   // 꼭 맞는 순
  const near = pool.map(p => ({ p, r: fitInfo(p, w, d, h, margin) }))
    .filter(x => !x.r.ok).sort((a, b) => a.r.gap - b.r.gap).slice(0, 3);

  document.querySelector("#fcGuide").hidden = true;
  document.querySelector("#fcResult").hidden = false;

  document.querySelector("#fcSummary").innerHTML = `
    <p><b>가로 ${w} × 세로 ${d}${h ? ` × 높이 ${h}` : ""}cm</b> 자리에
       ${margin ? "사방 5cm 여유를 두고 " : ""}들어가는 ${type === "all" ? "가구" : CATEGORIES[type]}
       <strong>${ok.length}개</strong></p>
    <p class="muted">꼭 맞는 순서로 보여 드려요 · 오크색 상자가 가구, 점선이 내 공간이에요</p>`;

  document.querySelector("#fcList").innerHTML = ok.length
    ? ok.map(x => fitRow(x.p, x.r, w, d, margin)).join("")
    : `<div class="empty"><p class="empty-title">이 자리에 들어가는 가구가 없어요</p><p>아래 가구는 조금만 더 넓으면 들어가요.</p></div>`;

  const nearBox = document.querySelector("#fcNear");
  nearBox.hidden = near.length === 0 || ok.length >= 6;
  document.querySelector("#fcNearList").innerHTML = near.map(x => fitRow(x.p, x.r, w, d, margin)).join("");

  document.querySelector("#fcResult").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* 결과 한 줄: 그림 · 평면 비교 · 정보 · 남는 공간 · 가격 */
function fitRow(p, r, w, d, margin) {
  const W = w - margin * 2, D = d - margin * 2;
  const bw = Math.max(W, r.pw), bd = Math.max(D, r.pd);
  const s = Math.min(150 / bw, 96 / bd);
  const plan = `
    <svg viewBox="0 0 160 104" class="fi-plan">
      <rect x="5" y="4" width="${W * s}" height="${D * s}" class="sp"/>
      <rect x="5" y="4" width="${r.pw * s}" height="${r.pd * s}" class="pd${r.ok ? "" : " over"}"/>
    </svg>`;

  let left;
  if (r.ok) {
    left = `<p class="fi-k">남는 공간</p>
      <p>가로 <b>${r.leftW}cm</b></p><p>세로 <b>${r.leftD}cm</b></p>
      ${r.leftH !== null ? `<p>높이 <b>${r.leftH}cm</b></p>` : ""}`;
  } else {
    left = `<p class="fi-k no">더 필요한 공간</p>
      ${r.needW ? `<p>가로 <b>${r.needW}cm</b></p>` : ""}
      ${r.needD ? `<p>세로 <b>${r.needD}cm</b></p>` : ""}
      ${r.needH ? `<p>높이 <b>${r.needH}cm</b></p>` : ""}`;
  }

  return `
    <article class="fit-item${r.ok ? "" : " is-near"}">
      <a class="fi-thumb" href="detail.html?id=${p.id}">${p.img ? `<img src="${p.img}" alt="">` : shapeSVG(p.shape)}</a>
      ${plan}
      <div class="fi-info">
        <p class="card-cat">${CATEGORIES[p.cat]}</p>
        <h3><a href="detail.html?id=${p.id}">${escapeHTML(p.name)}</a></h3>
        <p class="card-size">${dimText(p)}</p>
        <div class="fi-badges">
          ${r.rotated ? '<span class="badge badge-oak">돌려서 놓기</span>' : ""}
          ${p.easyMove ? '<span class="badge">이사 친화</span>' : ""}
        </div>
      </div>
      <div class="fi-left">${left}</div>
      <div class="fi-buy">
        <strong>${formatPrice(p.price)}</strong>
        <button type="button" class="btn btn-line btn-sm" data-cart="${p.id}">장바구니</button>
      </div>
    </article>`;
}

/* ---------- 공간별 추천 조합 ---------- */
function renderSets() {
  document.querySelector("#setNav").innerHTML = ROOM_SETS.map(s =>
    `<a href="#${s.key}">${s.name} <span>${s.size}</span></a>`).join("");

  document.querySelector("#setList").innerHTML = ROOM_SETS.map(s => {
    const items = s.ids.map(getProduct);
    const total = items.reduce((sum, p) => sum + p.price, 0);
    return `
      <section class="set" id="${s.key}">
        <div class="set-plan">
          <img src="${s.img}" alt="${s.name} 분위기 사진">
          <div class="set-mini">
            <svg viewBox="0 0 120 100" class="room-plan" aria-hidden="true"><g>${s.plan}</g></svg>
            <p>${s.name} 예시<br>${s.room}</p>
          </div>
        </div>
        <div class="set-info">
          <p class="room-size">${s.size}</p>
          <h2>${s.name}</h2>
          <p class="set-desc">${s.desc}</p>
          <p class="set-tip"><b>배치 팁</b> ${s.tip}</p>
          <ul class="set-items">
            ${items.map(p => `
              <li>
                <a href="detail.html?id=${p.id}" class="si-thumb">${productThumb(p)}</a>
                <div><a href="detail.html?id=${p.id}" class="si-name">${p.name}</a><p class="muted">${dimText(p)}</p></div>
                <b>${formatPrice(p.price)}</b>
              </li>`).join("")}
          </ul>
          <div class="set-foot">
            <p>세트 합계 <b>${formatPrice(total)}</b> ${total >= SHIP_FREE ? '<span class="badge">무료 배송</span>' : ""}</p>
            <div>
              <a href="fitcheck.html" class="btn btn-line btn-sm">내 방 치수로 확인</a>
              <button type="button" class="btn btn-oak btn-sm" data-set="${s.key}">세트 전체 담기</button>
            </div>
          </div>
        </div>
      </section>`;
  }).join("");

  document.querySelectorAll("[data-set]").forEach(btn => {
    btn.addEventListener("click", () => {
      const set = ROOM_SETS.find(s => s.key === btn.dataset.set);
      set.ids.forEach(addToCart);
      showToast(`${set.name} 세트 ${set.ids.length}개를 장바구니에 담았어요.`);
    });
  });
}
