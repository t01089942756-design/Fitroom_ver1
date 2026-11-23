/* =========================================================
   마이페이지 스크립트 (mypage.js)  - 로그인 필요
   주소 끝의 #이름으로 탭 전환: #orders #room #wish #reviews #qna #profile
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const user = requireLogin();
  if (!user) return;

  const TABS = { orders: tabOrders, room: tabRoom, wish: tabWish, reviews: tabReviews, qna: tabQna, profile: tabProfile };

  function me() { return getMembers().find(m => m.id === user.id) || { name: user.name }; }

  function renderTop() {
    const m = me();
    const orders = Store.get(KEY.orders, []).filter(o => o.userId === user.id);
    const room = Store.get(KEY.myRoom, null);
    document.querySelector("#myTop").innerHTML = `
      <div class="my-hello">
        <span class="avatar big">${escapeHTML(m.name).charAt(0)}</span>
        <div>
          <p class="my-name"><b>${escapeHTML(m.name)}</b>님, 안녕하세요</p>
          <p class="muted">${m.roomType ? ROOM_TYPES[m.roomType] + " 거주 · " : ""}가입일 ${m.joined || "-"}</p>
        </div>
      </div>
      <ul class="my-stats">
        <li><a href="#orders"><b>${orders.length}</b><span>주문</span></a></li>
        <li><a href="#wish"><b>${getWish().length}</b><span>찜</span></a></li>
        <li><a href="#reviews"><b>${Store.get(KEY.reviews, []).filter(r => r.userId === user.id).length}</b><span>리뷰</span></a></li>
        <li><a href="#room"><b>${room && room.w ? `${room.w}×${room.d}` : "-"}</b><span>내 방 치수</span></a></li>
      </ul>`;
  }

  function show() {
    const tab = TABS[location.hash.slice(1)] ? location.hash.slice(1) : "orders";
    document.querySelectorAll("#myMenu a").forEach(a => a.classList.toggle("on", a.dataset.tab === tab));
    renderTop();
    TABS[tab](document.querySelector("#myBody"), user, me);
  }
  window.addEventListener("hashchange", show);
  show();
});

/* 주문 내역 */
function tabOrders(box, user) {
  const orders = Store.get(KEY.orders, []).filter(o => o.userId === user.id);
  box.innerHTML = `<h2 class="h-sub">주문 내역</h2>` + (orders.length ? orders.map(o => `
    <article class="my-order">
      <div class="mo-head"><p><b>${o.date}</b> · 주문 번호 ${o.no}</p><span class="state done">${o.status}</span></div>
      <ul class="od-items">
        ${o.items.map(i => {
          const p = getProduct(i.id);
          return `<li>
            <a href="detail.html?id=${p.id}" class="ct-thumb">${productThumb(p)}</a>
            <div class="ct-info"><a href="detail.html?id=${p.id}" class="ct-name">${p.name}</a><p class="muted">${dimText(p)} · ${i.qty}개</p></div>
            <div class="mo-act"><b>${formatPrice(i.price * i.qty)}</b><a href="review_write.html?product=${p.id}" class="btn btn-line btn-xs">리뷰 쓰기</a></div>
          </li>`;
        }).join("")}
      </ul>
      <p class="mo-foot">${o.pay} · 배송비 ${o.ship ? formatPrice(o.ship) : "무료"} · 총 <b>${formatPrice(o.total)}</b><span class="muted"> · ${escapeHTML(o.to.addr)}</span></p>
    </article>`).join("") : empty("아직 주문한 상품이 없어요", "shop.html", "쇼핑하러 가기"));
}

/* 내 방 치수 */
function tabRoom(box) {
  const room = Store.get(KEY.myRoom, {}) || {};
  box.innerHTML = `
    <h2 class="h-sub">내 방 치수</h2>
    <p class="muted">저장해 두면 메인, 핏 체크, 샵 필터, 상품 상세에 자동으로 채워져요. 이사하면 새 방 치수로 바꿔 주세요.</p>
    <form id="roomForm" class="form-card plain" novalidate>
      <div class="field">
        <span class="label">집 구조</span>
        <div class="radio-row">
          ${Object.keys(ROOM_TYPES).map(k => `<label class="radio"><input type="radio" name="rType" value="${k}" ${room.type === k ? "checked" : ""}><span>${ROOM_TYPES[k]}</span></label>`).join("")}
        </div>
      </div>
      <div class="field">
        <span class="label">가구 놓을 자리 (가로 × 세로 × 높이)</span>
        <div class="size-in three">
          <div class="unit"><input type="number" id="rW" class="input" value="${room.w || ""}" placeholder="가로"><i>cm</i></div><span>×</span>
          <div class="unit"><input type="number" id="rD" class="input" value="${room.d || ""}" placeholder="세로"><i>cm</i></div><span>×</span>
          <div class="unit"><input type="number" id="rH" class="input" value="${room.h || ""}" placeholder="높이(선택)"><i>cm</i></div>
        </div>
      </div>
      <div class="form-btns left">
        <button type="submit" class="btn btn-oak">저장하기</button>
        <a href="fitcheck.html" class="btn btn-line" id="rGo">이 치수로 핏 체크</a>
      </div>
    </form>`;
  box.querySelector("#roomForm").addEventListener("submit", e => {
    e.preventDefault();
    const w = Number(box.querySelector("#rW").value), d = Number(box.querySelector("#rD").value);
    if (!w || !d) { showToast("가로와 세로를 입력해 주세요."); return; }
    const type = (box.querySelector("input[name=rType]:checked") || {}).value || "";
    Store.set(KEY.myRoom, { w, d, h: Number(box.querySelector("#rH").value) || "", type });
    showToast("내 방 치수를 저장했어요.");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
}

/* 찜 목록 */
function tabWish(box) {
  const items = getWish().map(getProduct).filter(Boolean);
  box.innerHTML = `<h2 class="h-sub">찜 목록</h2>` + (items.length
    ? `<div class="card-grid g3">${items.map(p => productCard(p).replace("</article>",
        `<button type="button" class="wish-x" data-unwish="${p.id}" aria-label="찜 빼기">♥</button></article>`)).join("")}</div>`
    : empty("찜한 가구가 없어요. 상품 상세에서 ♥를 눌러 보세요.", "shop.html", "상품 보러 가기"));
  box.querySelectorAll("[data-unwish]").forEach(b => b.addEventListener("click", () => {
    toggleWish(b.dataset.unwish);
    showToast("찜 목록에서 뺐어요.");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }));
}

/* 내 리뷰 */
function tabReviews(box, user) {
  const mine = Store.get(KEY.reviews, []).filter(r => r.userId === user.id);
  box.innerHTML = `<h2 class="h-sub">내 리뷰</h2>` + (mine.length ? `<div class="rv-list">${mine.map(r => {
    const p = getProduct(r.productId);
    return `
      <article class="rv-item">
        <div class="rv-body">
          <div class="rv-top"><span class="stars">${stars(r.rating)}</span><a href="detail.html?id=${p.id}" class="rv-product">${p.name}</a></div>
          <p class="rv-text">${escapeHTML(r.text)}</p>
          <p class="rv-meta">${r.date} <span class="rv-room">내 방 ${escapeHTML(reviewRoomText(r))}</span>
            <button type="button" class="link-btn danger" data-del="${r.id}">삭제</button></p>
        </div>
        ${r.img ? `<div class="rv-photo">${reviewPhoto(r)}</div>` : ""}
      </article>`;
  }).join("")}</div>` : empty("아직 쓴 리뷰가 없어요", "review_write.html", "리뷰 쓰기"));
  box.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
    Store.set(KEY.reviews, Store.get(KEY.reviews, []).filter(r => String(r.id) !== b.dataset.del));
    showToast("리뷰를 삭제했어요.");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }));
}

/* 1:1 문의 */
function tabQna(box, user) {
  const list = Store.get(KEY.qna, []).filter(q => q.userId === user.id);
  box.innerHTML = `
    <div class="h-row"><h2 class="h-sub">1:1 문의</h2><a href="qna.html" class="btn btn-line btn-sm">문의하기</a></div>` +
    (list.length ? `<table class="board"><thead><tr><th class="c-tag">유형</th><th>제목</th><th class="c-date">작성일</th><th class="c-tag">상태</th></tr></thead><tbody>
      ${list.map(q => `<tr><td class="c-tag">${q.type}</td><td>${escapeHTML(q.title)}</td><td class="c-date">${q.date}</td>
        <td class="c-tag"><span class="state ${q.answer ? "done" : ""}">${q.answer ? "답변 완료" : "답변 대기"}</span></td></tr>`).join("")}
    </tbody></table>` : empty("남긴 문의가 없어요", "qna.html", "문의하기"));
}

/* 정보 수정 */
function tabProfile(box, user, me) {
  const m = me();
  box.innerHTML = `
    <h2 class="h-sub">정보 수정</h2>
    <form id="pfForm" class="form-card plain" novalidate>
      <div class="field"><span class="label">아이디</span><input class="input" value="${m.id}" disabled></div>
      <div class="field-row">
        <div class="field"><label class="label" for="pfName">이름</label><input id="pfName" class="input" value="${escapeHTML(m.name)}"></div>
        <div class="field"><label class="label" for="pfPhone">휴대폰 번호</label><input id="pfPhone" class="input" maxlength="13" value="${m.phone || ""}"></div>
      </div>
      <div class="field"><label class="label" for="pfEmail">이메일</label><input id="pfEmail" class="input" value="${m.email || ""}"></div>
      <div class="opt-box">
        <p class="opt-title">비밀번호 바꾸기 <small>바꿀 때만 입력하세요</small></p>
        <div class="field"><input type="password" id="pfOld" class="input" placeholder="지금 비밀번호"></div>
        <div class="field-row">
          <div class="field"><input type="password" id="pfNew" class="input" placeholder="새 비밀번호 (영문·숫자·특수문자 8자 이상)"></div>
          <div class="field"><input type="password" id="pfNew2" class="input" placeholder="새 비밀번호 확인"></div>
        </div>
      </div>
      <p class="form-err" id="pfErr"></p>
      <div class="form-btns left"><button type="submit" class="btn btn-oak">저장하기</button></div>
    </form>`;

  box.querySelector("#pfPhone").addEventListener("input", e => {
    const n = e.target.value.replace(/\D/g, "").slice(0, 11);
    e.target.value = n.length < 4 ? n : n.length < 8 ? `${n.slice(0, 3)}-${n.slice(3)}` : `${n.slice(0, 3)}-${n.slice(3, n.length - 4)}-${n.slice(-4)}`;
  });

  box.querySelector("#pfForm").addEventListener("submit", e => {
    e.preventDefault();
    const $ = s => box.querySelector(s);
    const err = $("#pfErr");
    const name = $("#pfName").value.trim(), phone = $("#pfPhone").value, email = $("#pfEmail").value.trim();
    const oldPw = $("#pfOld").value, newPw = $("#pfNew").value;
    let msg = "";
    if (name.length < 2) msg = "이름을 2자 이상 입력해 주세요.";
    else if (!/^01[016789]-\d{3,4}-\d{4}$/.test(phone)) msg = "휴대폰 번호를 확인해 주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) msg = "이메일을 확인해 주세요.";
    else if (newPw || oldPw) {
      if (oldPw !== m.pw) msg = "지금 비밀번호가 맞지 않아요.";
      else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(newPw)) msg = "새 비밀번호를 규칙에 맞게 입력해 주세요.";
      else if (newPw !== $("#pfNew2").value) msg = "새 비밀번호 확인이 달라요.";
    }
    err.textContent = msg;
    if (msg) return;

    const members = getMembers();
    const target = members.find(x => x.id === user.id);
    Object.assign(target, { name, phone, email });
    if (newPw) target.pw = newPw;
    saveMembers(members);
    Store.set(KEY.user, { id: user.id, name });
    renderHeader();
    showToast("회원 정보를 저장했어요.");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
}

function empty(text, href, label) {
  return `<div class="empty"><p class="empty-title">${text}</p><a href="${href}" class="btn btn-line btn-sm">${label}</a></div>`;
}
