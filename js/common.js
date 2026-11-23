/* =========================================================
   핏룸 공통 스크립트 (common.js)
   - 모든 페이지에 들어가는 상단 메뉴(헤더), 하위 메뉴 탭, 푸터를 그려 줌
   - 로그인 상태, 장바구니 개수, 저장소(localStorage) 기능
   - 상품 카드, 치수 비교(핏 체크) 함수
   페이지에 <div id="header"></div>, <div id="pageHead"></div>,
   <div id="footer"></div> 만 넣으면 자동으로 채워짐
   ========================================================= */

/* ---------- 1. 메뉴 구조 (사이트맵 그대로) ---------- */
const MENU = [
  { name: "브랜드 소개", href: "about.html", sub: [
      ["브랜드 스토리", "about.html#story"],
      ["핏룸이 해결하는 문제", "about.html#problem"],
      ["핏 체크 사용법", "about.html#guide"] ] },
  { name: "샵", href: "shop.html", also: ["detail.html"], sub: [
      ["전체 상품", "shop.html"],
      ["침대·소파", "shop_bed.html"],
      ["책상·의자", "shop_desk.html"],
      ["수납·선반", "shop_storage.html"],
      ["테이블", "shop_table.html"] ] },
  { name: "핏 체크", href: "fitcheck.html", point: true, sub: [
      ["치수 입력·결과", "fitcheck.html"],
      ["공간별 추천 조합", "fitcheck_set.html"] ] },
  { name: "리뷰", href: "review.html", sub: [
      ["전체 리뷰", "review.html"],
      ["포토 리뷰", "review_photo.html"],
      ["리뷰 쓰기", "review_write.html"] ] },
  { name: "방명록", href: "guestbook.html", sub: [
      ["방명록 보기", "guestbook.html"],
      ["방명록 쓰기", "guestbook_write.html"] ] },
  { name: "고객센터", href: "support.html", sub: [
      ["배송·반품 안내", "support.html"],
      ["공지사항", "notice.html"],
      ["자주 묻는 질문", "faq.html"],
      ["1:1 문의", "qna.html"] ] }
];

/* ---------- 2. 저장소 (localStorage) ---------- */
const Store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }
};

// 저장소 키 이름 모음
const KEY = {
  user: "fitroom_user",           // 로그인한 회원 {id, name}
  members: "fitroom_members",     // 가입한 회원 목록
  cart: "fitroom_cart",           // 장바구니 [{id, qty}]
  guestbook: "fitroom_guestbook", // 방명록 글
  reviews: "fitroom_reviews",     // 사용자가 쓴 리뷰
  myRoom: "fitroom_myroom",       // 저장한 내 방 치수
  wish: "fitroom_wish",           // 찜 목록 [상품 id]
  orders: "fitroom_orders",       // 주문 내역
  qna: "fitroom_qna",             // 1:1 문의
  savedId: "fitroom_saved_id"     // 로그인 화면 아이디 저장
};

// 배송비 기준
const SHIP_FREE = 100000;   // 10만 원 이상 무료
const SHIP_FEE = 5000;

/* ---------- 3. 작은 도우미 함수 ---------- */
function currentFile() {
  const f = location.pathname.split("/").pop();
  return f === "" ? "index.html" : f;
}
function formatPrice(n) { return n.toLocaleString("ko-KR") + "원"; }
function dimText(p) { return `${p.w}×${p.d}×${p.h}cm`; }
function getProduct(id) { return PRODUCTS.find(p => p.id === Number(id)); }
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
// 주소의 ?이름=값 읽기
function param(name) { return new URLSearchParams(location.search).get(name); }
// 오늘 날짜 "2026.11.17"
function today() {
  const t = new Date();
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`;
}
function stars(n) { return "★".repeat(n) + "☆".repeat(5 - n); }
function shippingFee(sum) { return sum === 0 || sum >= SHIP_FREE ? 0 : SHIP_FEE; }

/* ---------- 회원 ---------- */
// 가입한 회원 목록 (체험용 회원은 항상 포함)
function getMembers() {
  const list = Store.get(KEY.members, []);
  if (!list.some(m => m.id === DEMO_MEMBER.id)) list.push(DEMO_MEMBER);
  return list;
}
function saveMembers(list) { Store.set(KEY.members, list); }
function currentUser() { return Store.get(KEY.user, null); }
// 로그인이 필요한 페이지: 로그인 안 했으면 로그인 화면으로 보내고, 로그인 후 돌아오게 함
function requireLogin() {
  const user = currentUser();
  if (!user) {
    location.replace("login.html?next=" + encodeURIComponent(currentFile() + location.search));
    return null;
  }
  return user;
}

/* ---------- 찜 ---------- */
function getWish() { return Store.get(KEY.wish, []); }
function isWished(id) { return getWish().includes(Number(id)); }
function toggleWish(id) {
  id = Number(id);
  let list = getWish();
  list = list.includes(id) ? list.filter(x => x !== id) : list.concat(id);
  Store.set(KEY.wish, list);
  return list.includes(id);
}

/* ---------- 리뷰 · 방명록 ---------- */
// 내가 쓴 리뷰 + 기본 리뷰 (최신이 앞)
function allReviews() { return Store.get(KEY.reviews, []).concat(REVIEWS); }
function getGuestbook() { return Store.get(KEY.guestbook, null) || GUESTBOOK_SEED.slice(); }
function reviewRoomText(r) { return `${ROOM_TYPES[r.type] || ""} ${r.room}`.trim(); }
// 리뷰 사진: 직접 올린 사진이 있으면 사진, 없으면 상품 그림
function reviewPhoto(r) {
  if (r.img) return `<img src="${r.img}" alt="리뷰 사진">`;
  const p = getProduct(r.productId);
  if (p && p.img) return `<img src="${p.img}" alt="${escapeHTML(p.name)}">`;
  return `<div class="photo-ph">${shapeSVG(p ? p.shape : "desk")}</div>`;
}

/* 핏 체크 핵심: 공간(w, d, h)에 가구 p가 들어가는지
   - 가구를 90도 돌려 놓는 경우도 확인
   - h(높이)를 비워 두면 높이는 따지지 않음
   - margin: 사방 여유 공간(cm) */
function fits(p, w, d, h, margin = 0) {
  const W = w - margin * 2, D = d - margin * 2;
  const flat = (p.w <= W && p.d <= D) || (p.d <= W && p.w <= D);
  const tall = !h || p.h <= h;
  return flat && tall;
}

/* 들어가는지 + 남는 공간 자세히
   rotated: 90도 돌려야 들어가는지 / leftW, leftD, leftH: 남는 cm
   들어가지 않으면 needW, needD, needH: 더 필요한 cm */
function fitInfo(p, w, d, h, margin = 0) {
  const W = w - margin * 2, D = d - margin * 2;
  const normal = p.w <= W && p.d <= D;
  const turn = p.d <= W && p.w <= D;
  const tallOk = !h || p.h <= h;
  const rotated = !normal && turn;
  const pw = rotated ? p.d : p.w, pd = rotated ? p.w : p.d;
  if ((normal || turn) && tallOk) {
    return { ok: true, rotated, pw, pd, leftW: W - pw, leftD: D - pd, leftH: h ? h - p.h : null };
  }
  // 덜 모자란 방향 기준으로 얼마나 더 필요한지
  const a = Math.max(p.w - W, 0) + Math.max(p.d - D, 0);
  const b = Math.max(p.d - W, 0) + Math.max(p.w - D, 0);
  const useTurn = b < a;
  return {
    ok: false, rotated: useTurn,
    pw: useTurn ? p.d : p.w, pd: useTurn ? p.w : p.d,
    needW: Math.max((useTurn ? p.d : p.w) - W, 0),
    needD: Math.max((useTurn ? p.w : p.d) - D, 0),
    needH: h ? Math.max(p.h - h, 0) : 0,
    gap: Math.min(a, b) + (h ? Math.max(p.h - h, 0) : 0)
  };
}

/* ---------- 4. 상품 그림 (사진이 없을 때) ---------- */
const SHAPES = {
  bed: '<rect x="14" y="40" width="92" height="18" rx="2"/><path d="M14 40V20h14v20M28 40h78"/><rect x="31" y="31" width="22" height="9" rx="3"/><path d="M18 58v8M102 58v8"/>',
  desk: '<path d="M10 28h100M16 28v40M104 28v40"/><rect x="70" y="28" width="34" height="18"/><path d="M83 37h8"/>',
  chair: '<rect x="42" y="10" width="36" height="28" rx="5"/><path d="M38 48h44M60 38v10M44 48v22M76 48v22"/>',
  sofa: '<rect x="18" y="26" width="84" height="22" rx="6"/><rect x="10" y="36" width="14" height="24" rx="4"/><rect x="96" y="36" width="14" height="24" rx="4"/><path d="M24 50h72M24 60v8M96 60v8"/>',
  shelf: '<rect x="38" y="6" width="44" height="66"/><path d="M38 22h44M38 38h44M38 54h44"/>',
  drawer: '<rect x="34" y="12" width="52" height="52" rx="2"/><path d="M34 29h52M34 46h52M56 20h8M56 37h8M56 55h8M38 64v6M82 64v6"/>',
  table: '<ellipse cx="60" cy="28" rx="40" ry="9"/><path d="M60 37v30M46 70h28"/>',
  lowtable: '<rect x="14" y="38" width="92" height="8" rx="2"/><path d="M20 46v16M100 46v16"/>'
};
// 상품 사진이 있으면 사진, 없으면 선 그림
function productThumb(p) {
  return p.img ? `<img src="${p.img}" alt="${escapeHTML(p.name)}">` : shapeSVG(p.shape);
}
function shapeSVG(shape) {
  return `<svg viewBox="0 0 120 80" class="shape" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${SHAPES[shape] || SHAPES.desk}</g></svg>`;
}

/* ---------- 5. 상품 카드 (메인, 샵, 핏 체크 결과에서 같이 사용) ---------- */
function productCard(p) {
  const thumb = p.img
    ? `<img src="${p.img}" alt="${escapeHTML(p.name)}">`
    : shapeSVG(p.shape);
  return `
    <article class="card">
      <div class="card-media">
        <a class="card-thumb" href="detail.html?id=${p.id}">
          ${thumb}
          <span class="card-dim">W ${p.w} · D ${p.d} · H ${p.h}</span>
        </a>
      </div>
      <div class="card-body">
        <p class="card-cat">${CATEGORIES[p.cat]}</p>
        <h3 class="card-name"><a href="detail.html?id=${p.id}">${escapeHTML(p.name)}</a></h3>
        <p class="card-size">${dimText(p)} <span>· ${p.weight}kg</span></p>
        <div class="card-foot">
          <strong class="card-price">${formatPrice(p.price)}</strong>
          ${p.easyMove ? '<span class="badge">이사 친화</span>' : ""}
        </div>
        <button type="button" class="btn-cart" data-cart="${p.id}">장바구니 담기</button>
      </div>
    </article>`;
}

/* ---------- 6. 장바구니 ---------- */
function getCart() { return Store.get(KEY.cart, []); }
function cartCount() { return getCart().reduce((sum, item) => sum + item.qty, 0); }
function addToCart(id) {
  const cart = getCart();
  const found = cart.find(item => item.id === Number(id));
  if (found) found.qty += 1;
  else cart.push({ id: Number(id), qty: 1 });
  Store.set(KEY.cart, cart);
  updateCartBadge();
}
function updateCartBadge() {
  const badge = document.querySelector("#cartBadge");
  if (!badge) return;
  const n = cartCount();
  badge.textContent = n;
  badge.hidden = n === 0;
}

// 어느 페이지든 "장바구니 담기" 버튼을 누르면 동작
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-cart]");
  if (!btn) return;
  const p = getProduct(btn.dataset.cart);
  addToCart(btn.dataset.cart);
  showToast(`'${p.name}'을(를) 장바구니에 담았어요.`);
});

/* ---------- 7. 알림 메시지 (토스트) ---------- */
function showToast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- 8. 현재 페이지가 어느 메뉴에 속하는지 ---------- */
function findSection() {
  const file = currentFile();
  return MENU.find(m =>
    m.href === file ||
    (m.also && m.also.includes(file)) ||
    m.sub.some(s => s[1].split("#")[0] === file)
  );
}

/* ---------- 9. 헤더 (상단 메뉴) ---------- */
function renderHeader() {
  const box = document.querySelector("#header");
  if (!box) return;
  const section = findSection();
  const user = Store.get(KEY.user, null);

  const gnb = MENU.map(m => `
    <li class="gnb-item${m === section ? " on" : ""}${m.point ? " point" : ""}">
      <a href="${m.href}" class="gnb-link">${m.name}</a>
      <div class="sub">
        ${m.sub.map(s => `<a href="${s[1]}">${s[0]}</a>`).join("")}
      </div>
    </li>`).join("");

  const util = user
    ? `<span class="hello"><b>${escapeHTML(user.name)}</b>님</span>
       <a href="mypage.html">마이페이지</a>
       <a href="#" id="logoutBtn">로그아웃</a>`
    : `<a href="login.html">로그인</a>
       <a href="join.html">회원가입</a>`;

  box.innerHTML = `
    <div class="topbar">
      <div class="inner">
        <span>10만 원 이상 <b>무료 배송</b></span>
        <span>치수만 입력하면 <b>내 방에 맞는 가구</b>만 골라 드려요</span>
        <span>받은 날부터 <b>7일 반품</b></span>
      </div>
    </div>
    <header class="hd">
      <div class="inner hd-in">
        <a href="index.html" class="logo" aria-label="핏룸 홈">
          <span class="logo-en">FIT ROOM</span>
          <span class="logo-ko">핏룸 · 내 방에 맞는 가구</span>
        </a>
        <nav class="gnb" aria-label="주 메뉴"><ul>${gnb}</ul></nav>
        <div class="util">
          ${util}
          <a href="cart.html" class="cart-link" aria-label="장바구니">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
            <span id="cartBadge" class="cart-badge" hidden>0</span>
          </a>
        </div>
      </div>
    </header>`;

  // 드롭다운: 마우스를 올리면 열리고, 벗어나면 잠깐 뒤 닫힘
  box.querySelectorAll(".gnb-item").forEach(li => {
    let timer;
    li.addEventListener("mouseenter", () => {
      clearTimeout(timer);
      box.querySelectorAll(".gnb-item.open").forEach(o => o !== li && o.classList.remove("open"));
      li.classList.add("open");
    });
    li.addEventListener("mouseleave", () => {
      timer = setTimeout(() => li.classList.remove("open"), 120);
    });
  });

  // 로그아웃
  const logout = box.querySelector("#logoutBtn");
  if (logout) {
    logout.addEventListener("click", e => {
      e.preventDefault();
      Store.remove(KEY.user);
      showToast("로그아웃되었어요.");
      renderHeader();
    });
  }

  // 스크롤하면 헤더에 그림자
  window.addEventListener("scroll", () => {
    const hd = document.querySelector(".hd");
    if (hd) hd.classList.toggle("scrolled", window.scrollY > 10);
  });

  updateCartBadge();
}

/* ---------- 10. 서브 페이지 상단 (제목 + 위치 + 2차 메뉴 탭) ---------- */
function renderPageHead() {
  const box = document.querySelector("#pageHead");
  if (!box) return;
  const section = findSection();
  const title = document.body.dataset.title || document.title.split("|")[0].trim();
  const desc = document.body.dataset.desc || "";
  const file = currentFile();
  const hash = location.hash;

  let tabs = "";
  if (section) {
    tabs = `<div class="lnb">${section.sub.map((s, i) => {
      const [f, h] = s[1].split("#");
      // #앵커가 있는 탭은 주소의 #과 같을 때(없으면 첫 번째 탭) 표시
      const on = f === file && (!h || hash === "#" + h || (!hash && i === 0));
      return `<a href="${s[1]}" class="${on ? "on" : ""}">${s[0]}</a>`;
    }).join("")}</div>`;
  }

  // 메뉴마다 다른 배경 사진
  const PHOTO = { "브랜드 소개": "room02", "샵": "room03", "핏 체크": "room05", "리뷰": "room04", "방명록": "room06", "고객센터": "room07" };
  const photo = `images/rooms/${(section && PHOTO[section.name]) || "room01"}.jpg`;

  box.innerHTML = `
    <div class="page-head" style="background-image:url('${photo}')">
      <div class="inner">
        <p class="crumb"><a href="index.html">홈</a>${section ? ` <span>/</span> <a href="${section.href}">${section.name}</a>` : ""} <span>/</span> ${escapeHTML(title)}</p>
        <h1>${escapeHTML(title)}</h1>
        ${desc ? `<p class="page-desc">${escapeHTML(desc)}</p>` : ""}
      </div>
    </div>
    ${tabs ? `<div class="lnb-wrap"><div class="inner">${tabs}</div></div>` : ""}`;

  // 같은 페이지 안에서 #앵커 탭을 누르면 탭 표시만 바꿈
  window.addEventListener("hashchange", renderPageHead, { once: true });
}

/* ---------- 11. 푸터 ---------- */
function renderFooter() {
  const box = document.querySelector("#footer");
  if (!box) return;
  const shop = MENU[1].sub.map(x => `<a href="${x[1]}">${x[0]}</a>`).join("");
  box.innerHTML = `
    <footer class="ft">
      <div class="inner ft-top">
        <div class="ft-brand">
          <p class="ft-logo">FIT ROOM</p>
          <p>핏룸 · ROOM-FIT FURNITURE</p>
          <p>내 방에 딱 맞는 가구를 치수로 찾는 가구 쇼핑몰.<br>작은 방에서도 넓게, 이사 가도 오래.</p>
        </div>
        <div class="ft-col">
          <p class="ft-label">SHOP</p>
          ${shop}
        </div>
        <div class="ft-col">
          <p class="ft-label">GUIDE</p>
          <a href="about.html">브랜드 소개</a>
          <a href="fitcheck.html">핏 체크</a>
          <a href="fitcheck_set.html">공간별 추천</a>
          <a href="review.html">리뷰</a>
          <a href="guestbook.html">방명록</a>
        </div>
        <div class="ft-col">
          <p class="ft-label">CUSTOMER CARE</p>
          <p class="ft-tel">1588-0000</p>
          <p>평일 10:00 ~ 18:00 · 점심 12:00 ~ 13:00<br>주말·공휴일 휴무</p>
          <a href="faq.html">자주 묻는 질문</a>
          <a href="qna.html">1:1 문의</a>
        </div>
      </div>
      <div class="ft-bottom">
        <div class="inner">
          <p><a href="support.html">배송·반품 안내</a> · <a href="#">이용약관</a> · <a href="#"><b>개인정보처리방침</b></a> · 웹 프로그래밍 과제용 사이트로 실제 판매하지 않습니다</p>
          <p>Copyright © 2026 hsy (2435027 호세영). All rights reserved.</p>
        </div>
      </div>
    </footer>`;
}

/* ---------- 12. 페이지가 열리면 공통 영역 그리기 ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderPageHead();
  renderFooter();
});
