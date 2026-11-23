/* =========================================================
   핏룸 메인페이지 스크립트 (main.js)
   - 핏 체크 입력 → 평면도 실시간 표시, 들어가는 가구 수 표시
   - 찾기 버튼 → fitcheck.html로 치수 전달
   - 공간별 추천, 카테고리, 베스트 상품, 리뷰, 방명록 그리기
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initFitCheck();
  renderRooms();
  renderCategories();
  renderBest();
  renderReviews();
  renderGuestbook();
});

/* ---------- ② 핏 체크 ---------- */
function initFitCheck() {
  const form = document.querySelector("#fitForm");
  const inW = document.querySelector("#fitW");
  const inD = document.querySelector("#fitD");
  const inH = document.querySelector("#fitH");
  const inType = document.querySelector("#fitType");
  const live = document.querySelector("#fitLive");

  // 저장해 둔 내 방 치수가 있으면 미리 채우기
  const saved = Store.get(KEY.myRoom, null);
  if (saved) {
    inW.value = saved.w || "";
    inD.value = saved.d || "";
    inH.value = saved.h || "";
  }

  // 입력할 때마다 평면도와 개수 갱신
  function update() {
    const w = Number(inW.value);
    const d = Number(inD.value);
    const h = Number(inH.value);
    const type = inType.value;

    drawSpot(w, d);

    if (!w || !d) {
      live.innerHTML = "가로·세로를 입력하면 들어가는 가구 수를 바로 알려드려요.";
      live.classList.remove("ok", "none");
      return;
    }
    const list = PRODUCTS.filter(p => (type === "all" || p.cat === type) && fits(p, w, d, h));
    if (list.length > 0) {
      live.innerHTML = `지금 입력한 자리에 들어가는 가구 <b>${list.length}개</b>`;
      live.className = "fit-live ok";
    } else {
      live.innerHTML = "이 자리에 들어가는 가구가 없어요. 조금 더 넓은 자리를 재 볼까요?";
      live.className = "fit-live none";
    }
  }
  [inW, inD, inH].forEach(el => el.addEventListener("input", update));
  inType.addEventListener("change", update);

  // 자주 찾는 자리 버튼
  document.querySelectorAll("[data-preset]").forEach(btn => {
    btn.addEventListener("click", () => {
      const [w, d, h, type] = btn.dataset.preset.split(",");
      inW.value = w;
      inD.value = d;
      inH.value = h;
      inType.value = type;
      update();
    });
  });

  // 찾기 → fitcheck.html?w=120&d=60&h=&type=desk
  form.addEventListener("submit", e => {
    e.preventDefault();
    const w = Number(inW.value);
    const d = Number(inD.value);
    if (!w || !d) {
      showToast("가로와 세로는 꼭 입력해 주세요.");
      (!w ? inW : inD).focus();
      return;
    }
    if (w > 999 || d > 999 || Number(inH.value) > 999) {
      showToast("치수는 999cm 이하로 입력해 주세요.");
      return;
    }
    Store.set(KEY.myRoom, { w: w, d: d, h: Number(inH.value) || "" });
    const q = new URLSearchParams({ w: w, d: d, h: inH.value, type: inType.value });
    location.href = "fitcheck.html?" + q.toString();
  });

  update();
}

/* 평면도에 놓을 자리 그리기
   방 300×260cm, 1cm = 1.2px, 오른쪽 위 구석 기준 */
function drawSpot(w, d) {
  const spot = document.querySelector("#spot");
  const label = document.querySelector("#spotLabel");
  const cap = document.querySelector("#planCap");
  const SCALE = 1.2, RIGHT = 416, TOP = 44, ROOM_W = 300, ROOM_H = 260;

  if (!w || !d) {
    spot.setAttribute("x", RIGHT - 140);
    spot.setAttribute("width", 140);
    spot.setAttribute("height", 72);
    spot.classList.remove("on", "over");
    label.setAttribute("x", RIGHT - 70);
    label.setAttribute("y", TOP + 92);
    label.textContent = "놓을 자리";
    cap.textContent = "예시 원룸 300×260cm · 입력한 자리가 점선으로 그려져요";
    return;
  }

  const over = w > ROOM_W - 2 || d > ROOM_H - 2;
  const pw = Math.min(w, ROOM_W - 2) * SCALE;
  const ph = Math.min(d, ROOM_H - 2) * SCALE;
  spot.setAttribute("x", RIGHT - pw);
  spot.setAttribute("width", pw);
  spot.setAttribute("height", ph);
  spot.classList.add("on");
  spot.classList.toggle("over", over);

  // 라벨은 자리 아래쪽(공간이 없으면 안쪽)에 표시
  const below = TOP + ph + 22;
  label.setAttribute("x", Math.max(RIGHT - pw / 2, 120));
  label.setAttribute("y", below < 345 ? below : TOP + ph / 2 + 6);
  label.textContent = `${w} × ${d} cm`;
  cap.textContent = over
    ? "예시 방(300×260cm)보다 커요. 치수를 다시 확인해 주세요."
    : "예시 원룸 300×260cm 안에 입력한 자리를 그렸어요";
}

/* ---------- ④ 공간별 추천 ---------- */
function renderRooms() {
  document.querySelector("#roomCards").innerHTML = ROOM_SETS.map(r => {
    const items = r.ids.map(id => getProduct(id));
    const total = items.reduce((s, p) => s + p.price, 0);
    return `
      <a class="room" href="fitcheck_set.html#${r.key}">
        <div class="room-photo">
          <img src="${r.img}" alt="${r.name} 분위기 사진">
          <svg viewBox="0 0 120 100" class="room-plan" aria-hidden="true"><g>${r.plan}</g></svg>
        </div>
        <div class="room-info">
          <p class="room-size">${r.size}</p>
          <h3>${r.name}</h3>
          <p class="room-desc">${r.desc}</p>
          <ul>${items.map(p => `<li><i class="mini">${productThumb(p)}</i><em>${p.name}</em> <span>${p.w}×${p.d}</span></li>`).join("")}</ul>
          <p class="room-total"><span>세트 합계</span><b>${formatPrice(total)}</b></p>
        </div>
      </a>`;
  }).join("");
}

/* ---------- ⑤ 카테고리 바로가기 ---------- */
function renderCategories() {
  const icon = { bed: "bed", desk: "desk", storage: "shelf", table: "table" };
  const photo = { bed: 4, desk: 1, storage: 7, table: 10 };   // 대표 상품 id
  document.querySelector("#catTiles").innerHTML = Object.keys(CATEGORIES).map(key => {
    const count = PRODUCTS.filter(p => p.cat === key).length;
    return `
      <a class="cat" href="${CATEGORY_PAGE[key]}">
        <span class="cat-circle">${productThumb(getProduct(photo[key])) || shapeSVG(icon[key])}</span>
        <span class="cat-name">${CATEGORIES[key]}</span>
        <span class="cat-count">${count}개 상품</span>
      </a>`;
  }).join("");
}

/* ---------- ⑥ 베스트 상품 ---------- */
function renderBest() {
  const best = PRODUCTS.filter(p => p.best).slice(0, 4);
  document.querySelector("#bestList").innerHTML = best.map(productCard).join("");
}

/* ---------- ⑦ 리뷰 미리보기 ---------- */
function renderReviews() {
  const all = allReviews().slice(0, 3);
  document.querySelector("#reviewList").innerHTML = all.map(r => {
    const p = getProduct(r.productId);
        return `
      <article class="review">
        <p class="stars" aria-label="별점 ${r.rating}점">${stars(r.rating)}</p>
        <p class="review-txt">"${escapeHTML(r.text)}"</p>
        <div class="review-room">
          <span>내 방 크기</span><b>${escapeHTML(reviewRoomText(r))}</b>
        </div>
        <div class="review-foot">
          ${p ? `<a href="detail.html?id=${p.id}" class="rv-thumb">${productThumb(p)}</a>` : `<span class="avatar">${escapeHTML(r.name).charAt(0)}</span>`}
          <div>
            <p class="who">${escapeHTML(r.name)} · ${r.date}</p>
            ${p ? `<a href="detail.html?id=${p.id}" class="what">${p.name}</a>` : ""}
          </div>
        </div>
      </article>`;
  }).join("");
}

/* ---------- ⑧ 방명록 미리보기 ---------- */
function renderGuestbook() {
  const list = getGuestbook();
  document.querySelector("#guestCount").textContent = list.length;
  document.querySelector("#guestList").innerHTML = list.slice(0, 3).map(g => `
    <li>
      <span class="g-name">${escapeHTML(g.name)}</span>
      <span class="g-text">${escapeHTML(g.text)}</span>
      <span class="g-date">${g.date}</span>
    </li>`).join("");
}
