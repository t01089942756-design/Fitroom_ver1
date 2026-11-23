/* =========================================================
   리뷰 스크립트 (review.js)
   - review.html       : 별점 요약, 공간 유형 필터, 정렬, 내 리뷰 삭제
   - review_photo.html : 사진 리뷰 모아 보기 + 크게 보기 창 (data-mode="photo")
   - review_write.html : 리뷰 쓰기, 사진 올리기 (data-mode="write", 로그인 필요)
   내가 쓴 리뷰는 localStorage "fitroom_reviews"에 저장
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const mode = document.body.dataset.mode;
  if (mode === "photo") initPhoto();
  else if (mode === "write") initWrite();
  else initList();
});

/* 리뷰 한 개 (목록용) */
function reviewItem(r) {
  const p = getProduct(r.productId);
  const user = currentUser();
  const mine = r.userId && user && r.userId === user.id;
  return `
    <article class="rv-item">
      <div class="rv-body">
        <div class="rv-top">
          <span class="stars">${stars(r.rating)}</span>
          ${p ? `<a href="detail.html?id=${p.id}" class="rv-product">${p.name}</a>` : ""}
        </div>
        <p class="rv-text">${escapeHTML(r.text)}</p>
        <p class="rv-meta">
          <b>${escapeHTML(r.name)}</b> · ${r.date}
          <span class="rv-room">내 방 ${escapeHTML(reviewRoomText(r))}</span>
          ${mine ? `<button type="button" class="link-btn danger" data-del="${r.id}">삭제</button>` : ""}
        </p>
      </div>
      ${r.img || r.photo ? `<div class="rv-photo">${reviewPhoto(r)}</div>` : ""}
    </article>`;
}

/* ---------- 전체 리뷰 ---------- */
function initList() {
  let type = "all";
  const sortSel = document.querySelector("#rvSort");

  function render() {
    const all = allReviews();

    // 별점 요약
    const avg = all.reduce((s, r) => s + r.rating, 0) / (all.length || 1);
    const bars = [5, 4, 3, 2, 1].map(n => {
      const c = all.filter(r => r.rating === n).length;
      return `<li><span>${n}점</span><i><em style="width:${all.length ? c / all.length * 100 : 0}%"></em></i><span>${c}</span></li>`;
    }).join("");
    document.querySelector("#rvSummary").innerHTML = `
      <div class="rv-avg"><b>${avg.toFixed(1)}</b><p class="stars">${stars(Math.round(avg))}</p><p class="muted">리뷰 ${all.length}개</p></div>
      <ul class="rv-bars">${bars}</ul>
      <div class="rv-note"><p><b>방 크기가 적힌 후기</b></p><p class="muted">모든 리뷰에 작성자의 방 크기가 함께 적혀 있어요. 우리 집과 비슷한 크기의 후기를 찾아보세요.</p></div>`;

    // 목록
    let list = type === "all" ? all.slice() : all.filter(r => r.type === type);
    if (sortSel.value === "high") list.sort((a, b) => b.rating - a.rating);
    if (sortSel.value === "low") list.sort((a, b) => a.rating - b.rating);
    document.querySelector("#rvList").innerHTML = list.length
      ? list.map(reviewItem).join("")
      : `<div class="empty"><p class="empty-title">아직 이 유형의 리뷰가 없어요</p></div>`;
  }

  document.querySelectorAll("#rvChips .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#rvChips .chip").forEach(c => c.classList.remove("on"));
      chip.classList.add("on");
      type = chip.dataset.type;
      render();
    });
  });
  sortSel.addEventListener("change", render);

  // 내 리뷰 삭제
  document.querySelector("#rvList").addEventListener("click", e => {
    const btn = e.target.closest("[data-del]");
    if (!btn) return;
    const mine = Store.get(KEY.reviews, []).filter(r => String(r.id) !== btn.dataset.del);
    Store.set(KEY.reviews, mine);
    showToast("리뷰를 삭제했어요.");
    render();
  });

  if (param("done")) showToast("리뷰가 등록되었어요. 고마워요!");
  render();
}

/* ---------- 포토 리뷰 ---------- */
function initPhoto() {
  const list = allReviews().filter(r => r.img || r.photo);
  document.querySelector("#phCount").textContent = list.length;
  document.querySelector("#phGrid").innerHTML = list.map((r, i) => {
    const p = getProduct(r.productId);
    return `
      <button type="button" class="ph-card" data-i="${i}">
        <div class="ph-img">${reviewPhoto(r)}</div>
        <div class="ph-info">
          <span class="stars">${stars(r.rating)}</span>
          <p class="ph-text">${escapeHTML(r.text)}</p>
          <p class="muted">${escapeHTML(r.name)} · ${p ? p.name : ""}</p>
        </div>
      </button>`;
  }).join("");

  const modal = document.querySelector("#phModal");
  document.querySelector("#phGrid").addEventListener("click", e => {
    const card = e.target.closest(".ph-card");
    if (!card) return;
    const r = list[card.dataset.i];
    const p = getProduct(r.productId);
    document.querySelector("#phBody").innerHTML = `
      <div class="ph-big">${reviewPhoto(r)}</div>
      <div class="ph-detail">
        <span class="stars">${stars(r.rating)}</span>
        <p class="rv-text">${escapeHTML(r.text)}</p>
        <p class="rv-meta"><b>${escapeHTML(r.name)}</b> · ${r.date}</p>
        <p class="rv-meta">내 방 ${escapeHTML(reviewRoomText(r))}</p>
        ${p ? `<a href="detail.html?id=${p.id}" class="btn btn-line btn-sm">${p.name} 보러 가기</a>` : ""}
      </div>`;
    modal.hidden = false;
  });
  // 닫기: X 버튼, 바깥 클릭, Esc 키
  document.querySelector("#phClose").addEventListener("click", () => (modal.hidden = true));
  modal.addEventListener("click", e => { if (e.target === modal) modal.hidden = true; });
  document.addEventListener("keydown", e => { if (e.key === "Escape") modal.hidden = true; });
}

/* ---------- 리뷰 쓰기 ---------- */
function initWrite() {
  const user = requireLogin();
  if (!user) return;

  const sel = document.querySelector("#rwProduct");
  sel.innerHTML = `<option value="">상품을 선택해 주세요</option>` +
    PRODUCTS.map(p => `<option value="${p.id}">${p.name} (${dimText(p)})</option>`).join("");
  if (param("product")) sel.value = param("product");

  // 회원가입 때 적은 집 구조, 저장한 방 크기 미리 채우기
  const members = getMembers();
  const me = members.find(m => m.id === user.id);
  if (me && me.roomType) document.querySelector("#rwType").value = me.roomType;

  // 별점
  let rating = 0;
  const starBtns = document.querySelectorAll("#rwStars button");
  const words = ["", "별로예요", "그저 그래요", "괜찮아요", "좋아요", "최고예요"];
  function paint(n) { starBtns.forEach(b => b.classList.toggle("on", Number(b.dataset.v) <= n)); }
  starBtns.forEach(b => {
    b.addEventListener("mouseenter", () => paint(Number(b.dataset.v)));
    b.addEventListener("click", () => {
      rating = Number(b.dataset.v);
      document.querySelector("#rwStarTxt").textContent = `${rating}점 · ${words[rating]}`;
    });
  });
  document.querySelector("#rwStars").addEventListener("mouseleave", () => paint(rating));

  // 글자 수
  const text = document.querySelector("#rwText");
  text.addEventListener("input", () => (document.querySelector("#rwCount").textContent = text.value.length));

  // 사진: 저장 공간을 아끼려고 가로 600px로 줄여서 저장
  let img = "";
  const pre = document.querySelector("#rwPreview"), rm = document.querySelector("#rwRemove");
  document.querySelector("#rwFile").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => {
        const scale = Math.min(1, 600 / im.width);
        const cv = document.createElement("canvas");
        cv.width = im.width * scale;
        cv.height = im.height * scale;
        cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
        img = cv.toDataURL("image/jpeg", 0.7);
        pre.innerHTML = `<img src="${img}" alt="미리보기">`;
        pre.hidden = rm.hidden = false;
      };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
  rm.addEventListener("click", () => {
    img = "";
    pre.hidden = rm.hidden = true;
    document.querySelector("#rwFile").value = "";
  });

  // 등록
  document.querySelector("#rwForm").addEventListener("submit", e => {
    e.preventDefault();
    const err = document.querySelector("#rwErr");
    const type = document.querySelector("#rwType").value;
    const w = Number(document.querySelector("#rwW").value), d = Number(document.querySelector("#rwD").value);
    let msg = "";
    if (!sel.value) msg = "상품을 선택해 주세요.";
    else if (!rating) msg = "별점을 눌러 주세요.";
    else if (!type) msg = "우리 집 구조를 선택해 주세요.";
    else if (!w || !d) msg = "방 크기(가로, 세로)를 입력해 주세요.";
    else if (text.value.trim().length < 10) msg = "후기를 10자 이상 적어 주세요.";
    err.textContent = msg;
    if (msg) return;

    const list = Store.get(KEY.reviews, []);
    list.unshift({
      id: Date.now(), userId: user.id, name: user.name, productId: Number(sel.value), rating,
      type, room: `${w}×${d}`, text: text.value.trim(), date: today(), img, photo: false
    });
    try {
      localStorage.setItem(KEY.reviews, JSON.stringify(list));
    } catch (ex) {
      err.textContent = "사진이 너무 커서 저장하지 못했어요. 다른 사진을 골라 주세요.";
      return;
    }
    location.href = "review.html?done=1";
  });
}
