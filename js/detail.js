/* =========================================================
   상품 상세 스크립트 (detail.js)
   - 주소 detail.html?id=1 의 id로 상품을 찾아서 화면을 그림
   - 치수 도면, 내 공간 맞춤 확인, 수량, 찜, 장바구니, 바로 구매, 상품 리뷰
   ========================================================= */

const P = getProduct(param("id"));

// 페이지 상단 제목을 카테고리 이름으로 (common.js가 그리기 전에 바꿔 둠)
if (P) {
  document.body.dataset.title = CATEGORIES[P.cat];
  document.title = `${P.name} | 핏룸 Fit Room`;
}

document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector("#detail");

  if (!P) {
    box.innerHTML = `
      <div class="empty">
        <p class="empty-title">상품을 찾을 수 없어요</p>
        <p>주소가 잘못되었거나 판매가 끝난 상품이에요.</p>
        <a href="shop.html" class="btn btn-green">전체 상품 보기</a>
      </div>`;
    return;
  }

  const reviews = allReviews().filter(r => r.productId === P.id);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const thumb = P.img ? `<img src="${P.img}" alt="${escapeHTML(P.name)}">` : shapeSVG(P.shape);

  box.innerHTML = `
    <div class="dt">
      <div class="dt-gallery">
        <div class="dt-thumb">${thumb}<span class="card-dim">W ${P.w} · D ${P.d} · H ${P.h}</span></div>
        <div class="dt-draw">${drawing(P)}</div>
      </div>

      <div class="dt-info">
        <p class="card-cat">${CATEGORIES[P.cat]}</p>
        <h2 class="dt-name">${escapeHTML(P.name)}</h2>
        <p class="dt-rate">
          ${reviews.length
            ? `<span class="stars">${stars(Math.round(avg))}</span> <b>${avg.toFixed(1)}</b> · <a href="#dReview">리뷰 ${reviews.length}개</a>`
            : `<span class="muted">아직 리뷰가 없어요</span>`}
        </p>
        <p class="dt-price">${formatPrice(P.price)}</p>
        <div class="dt-badges">
          ${P.easyMove ? '<span class="badge">이사 친화</span>' : ""}
          <span class="badge badge-line">${P.assemble ? "조립 필요" : "조립 없이 사용"}</span>
        </div>

        <table class="dt-spec">
          <tr><th>치수</th><td><b>${dimText(P)}</b> <span class="muted">(가로×깊이×높이)</span></td></tr>
          <tr><th>무게</th><td>${P.weight}kg</td></tr>
          <tr><th>소재</th><td>${P.material}</td></tr>
          <tr><th>색상</th><td>${P.color}</td></tr>
          <tr><th>배송</th><td>결제 후 3~5일 · ${P.price >= SHIP_FREE ? "무료 배송" : "배송비 5,000원 (10만 원 이상 무료)"}</td></tr>
        </table>

        <div class="dt-fit">
          <p class="dt-fit-title">내 공간에 들어갈까?</p>
          <div class="dt-fit-row">
            <label>가로<input type="number" id="dW" placeholder="cm"></label>
            <label>세로<input type="number" id="dD" placeholder="cm"></label>
            <label>높이<input type="number" id="dH" placeholder="선택"></label>
          </div>
          <p class="dt-fit-result" id="fitResult">놓을 자리의 치수를 입력해 보세요.</p>
        </div>

        <div class="dt-buy">
          <div class="qty">
            <button type="button" id="minus" aria-label="수량 빼기">−</button>
            <input type="number" id="qty" value="1" min="1" max="10">
            <button type="button" id="plus" aria-label="수량 더하기">+</button>
          </div>
          <p>총 상품 금액 <b id="total">${formatPrice(P.price)}</b></p>
        </div>

        <div class="dt-btns">
          <button type="button" class="wish-btn${isWished(P.id) ? " on" : ""}" id="wish" aria-label="찜하기">♥</button>
          <button type="button" class="btn btn-line" id="addCart">장바구니</button>
          <button type="button" class="btn btn-oak" id="buyNow">바로 구매</button>
        </div>
      </div>
    </div>

    <nav class="dt-tabs">
      <a href="#dDesc">상품 설명</a>
      <a href="#dShip">배송·반품</a>
      <a href="#dReview">리뷰 ${reviews.length}</a>
    </nav>

    <section class="dt-sec" id="dDesc">
      <h3 class="h-sub">상품 설명</h3>
      <p class="dt-desc">${P.desc}</p>
      <ul class="dt-points">
        <li><span>바닥에서 차지하는 면적</span><b>${(P.w * P.d / 10000).toFixed(2)}㎡</b></li>
        <li><span>현관문(폭 80cm) 통과</span><b>${Math.min(P.w, P.d, P.h) <= 80 || P.assemble ? "가능" : "확인 필요"}</b></li>
        <li><span>혼자 옮기기</span><b>${P.weight <= 15 ? "쉬움" : P.weight <= 25 ? "보통" : "2인 이상"}</b></li>
      </ul>
    </section>

    <section class="dt-sec" id="dShip">
      <h3 class="h-sub">배송·반품</h3>
      <table class="tbl">
        <tr><th>배송 기간</th><td>결제 후 3~5일 (침대·소파는 설치 기사님이 날짜를 맞춰 연락드려요)</td></tr>
        <tr><th>배송비</th><td>10만 원 이상 무료 · 그보다 적으면 5,000원</td></tr>
        <tr><th>반품</th><td>받은 날부터 7일 안, 조립하지 않은 상태일 때 가능</td></tr>
        <tr><th>반품 배송비</th><td>단순 변심은 고객 부담, 불량·오배송은 핏룸 부담</td></tr>
      </table>
    </section>

    <section class="dt-sec" id="dReview">
      <div class="h-row">
        <h3 class="h-sub">리뷰 ${reviews.length}</h3>
        <a href="review_write.html?product=${P.id}" class="btn btn-line btn-sm">리뷰 쓰기</a>
      </div>
      <div class="rv-list">
        ${reviews.length ? reviews.map(r => `
          <article class="rv-item">
            <div class="rv-body">
              <p class="stars">${stars(r.rating)}</p>
              <p class="rv-text">${escapeHTML(r.text)}</p>
              <p class="rv-meta"><b>${escapeHTML(r.name)}</b> · ${r.date} · 내 방 ${escapeHTML(reviewRoomText(r))}</p>
            </div>
            ${r.img || r.photo ? `<div class="rv-photo">${reviewPhoto(r)}</div>` : ""}
          </article>`).join("") : `<p class="empty-small">첫 번째 리뷰를 남겨 주세요.</p>`}
      </div>
    </section>`;

  initFit();
  initBuy();
  renderRelated();
});

/* 위에서 본 모습 / 앞에서 본 모습 도면 */
function drawing(p) {
  const S = 150 / Math.max(p.w, p.d, p.h);    // 가장 긴 변이 150px
  function view(title, a, b, la, lb) {
    const W = a * S, H = b * S;
    const x = (220 - W) / 2, y = 30 + (160 - H) / 2;
    return `
      <figure>
        <svg viewBox="0 0 220 210">
          <rect x="${x}" y="${y}" width="${W}" height="${H}" class="dw-box"/>
          <path d="M${x} 16h${W}M${x} 11v10M${x + W} 11v10" class="dw-line"/>
          <text x="110" y="10" text-anchor="middle" class="dw-txt">${la} ${a}</text>
          <path d="M${x + W + 14} ${y}v${H}M${x + W + 9} ${y}h10M${x + W + 9} ${y + H}h10" class="dw-line"/>
          <text x="${x + W + 22}" y="${y + H / 2 + 4}" class="dw-txt">${lb} ${b}</text>
        </svg>
        <figcaption>${title}</figcaption>
      </figure>`;
  }
  return view("위에서 본 모습", p.w, p.d, "가로", "깊이") + view("앞에서 본 모습", p.w, p.h, "가로", "높이");
}

/* 내 공간에 들어갈까? */
function initFit() {
  const w = document.querySelector("#dW"), d = document.querySelector("#dD"), h = document.querySelector("#dH");
  const out = document.querySelector("#fitResult");
  const room = Store.get(KEY.myRoom, null);
  if (room && room.w) { w.value = room.w; d.value = room.d; h.value = room.h || ""; }

  function check() {
    const W = Number(w.value), D = Number(d.value), H = Number(h.value);
    if (!W || !D) {
      out.className = "dt-fit-result";
      out.textContent = "놓을 자리의 치수를 입력해 보세요.";
      return;
    }
    const r = fitInfo(P, W, D, H);
    if (r.ok) {
      out.className = "dt-fit-result ok";
      out.innerHTML = `들어가요! 남는 공간 가로 <b>${r.leftW}cm</b> · 세로 <b>${r.leftD}cm</b>` +
        (r.leftH !== null ? ` · 높이 <b>${r.leftH}cm</b>` : "") +
        (r.rotated ? `<br><small>가구를 90도 돌려서 놓아야 해요.</small>` : "");
    } else {
      const need = [];
      if (r.needW) need.push(`가로 ${r.needW}cm`);
      if (r.needD) need.push(`세로 ${r.needD}cm`);
      if (r.needH) need.push(`높이 ${r.needH}cm`);
      out.className = "dt-fit-result no";
      out.innerHTML = `안 들어가요. <b>${need.join(", ")}</b>가 더 필요해요.`;
    }
  }
  [w, d, h].forEach(el => el.addEventListener("input", check));
  check();
}

/* 수량, 찜, 장바구니, 바로 구매 */
function initBuy() {
  const qty = document.querySelector("#qty");
  const total = document.querySelector("#total");

  function setQty(n) {
    n = Math.min(Math.max(Number(n) || 1, 1), 10);
    qty.value = n;
    total.textContent = formatPrice(P.price * n);
  }
  document.querySelector("#minus").addEventListener("click", () => setQty(Number(qty.value) - 1));
  document.querySelector("#plus").addEventListener("click", () => setQty(Number(qty.value) + 1));
  qty.addEventListener("change", () => setQty(qty.value));

  document.querySelector("#wish").addEventListener("click", e => {
    const on = toggleWish(P.id);
    e.currentTarget.classList.toggle("on", on);
    showToast(on ? "찜 목록에 담았어요." : "찜 목록에서 뺐어요.");
  });

  document.querySelector("#addCart").addEventListener("click", () => {
    for (let i = 0; i < Number(qty.value); i++) addToCart(P.id);
    showToast(`장바구니에 ${qty.value}개 담았어요.`);
  });

  document.querySelector("#buyNow").addEventListener("click", () => {
    location.href = `order.html?items=${P.id}:${qty.value}`;
  });
}

/* 같은 카테고리 다른 상품 */
function renderRelated() {
  const items = PRODUCTS.filter(p => p.cat === P.cat && p.id !== P.id).slice(0, 4);
  if (!items.length) return;
  document.querySelector("#relatedWrap").hidden = false;
  document.querySelector("#related").innerHTML = items.map(productCard).join("");
}
