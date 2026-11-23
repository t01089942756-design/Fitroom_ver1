/* =========================================================
   고객센터 스크립트 (support.js)
   - support.html : 최신 공지 한 줄
   - notice.html  : 공지 목록, 제목을 누르면 내용 펼치기 (data-mode="notice")
   - faq.html     : 분류 탭, 검색, 아코디언 (data-mode="faq")
   - qna.html     : 1:1 문의 작성, 내 문의 내역 (data-mode="qna", 로그인 필요)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const mode = document.body.dataset.mode;
  if (mode === "notice") initNotice();
  else if (mode === "faq") initFaq();
  else if (mode === "qna") initQna();
  else {
    const n = NOTICES[0];
    document.querySelector("#csNotice").textContent = `[${n.tag}] ${n.title}`;
  }
});

/* ---------- 공지사항 ---------- */
function initNotice() {
  const tbody = document.querySelector("#ntList");
  const list = NOTICES.slice().sort((a, b) => b.top - a.top || b.id - a.id);
  tbody.innerHTML = list.map(n => `
    <tr class="nt-row${n.top ? " top" : ""}" data-id="${n.id}">
      <td class="c-no">${n.top ? '<span class="badge badge-oak">중요</span>' : n.id}</td>
      <td class="c-tag">${n.tag}</td>
      <td class="nt-title"><button type="button">${n.title}</button></td>
      <td class="c-date">${n.date}</td>
    </tr>
    <tr class="nt-body" hidden><td colspan="4"><p>${escapeHTML(n.body).replace(/\n/g, "<br>")}</p></td></tr>`).join("");

  tbody.addEventListener("click", e => {
    const row = e.target.closest(".nt-row");
    if (!row) return;
    const body = row.nextElementSibling;
    body.hidden = !body.hidden;
    row.classList.toggle("open", !body.hidden);
  });
}

/* ---------- 아코디언 공통: 질문을 누르면 답 펼치기 ---------- */
function bindAccordion(box) {
  box.addEventListener("click", e => {
    const q = e.target.closest(".acc-q");
    if (!q) return;
    const li = q.parentElement;
    const open = !li.classList.contains("open");
    box.querySelectorAll(".acc > li.open").forEach(o => o.classList.remove("open"));
    li.classList.toggle("open", open);
  });
}

/* ---------- 자주 묻는 질문 ---------- */
function initFaq() {
  const cats = ["전체"].concat([...new Set(FAQS.map(f => f.cat))]);
  let cat = "전체";
  const chips = document.querySelector("#faqChips");
  const search = document.querySelector("#faqSearch");
  const box = document.querySelector("#faqList");

  chips.innerHTML = cats.map(c => `<button type="button" class="chip${c === cat ? " on" : ""}" data-cat="${c}">${c}</button>`).join("");

  function render() {
    const word = search.value.trim();
    const list = FAQS.filter(f => (cat === "전체" || f.cat === cat) && (!word || (f.q + f.a).includes(word)));
    const mark = s => word ? escapeHTML(s).split(escapeHTML(word)).join(`<mark>${escapeHTML(word)}</mark>`) : escapeHTML(s);
    box.innerHTML = list.length ? list.map(f => `
      <li>
        <button type="button" class="acc-q"><span class="acc-cat">${f.cat}</span><span class="acc-mark">Q</span>${mark(f.q)}</button>
        <div class="acc-a"><span class="acc-mark">A</span><p>${mark(f.a)}</p></div>
      </li>`).join("") : `<li class="empty"><p class="empty-title">'${escapeHTML(word)}'에 대한 질문이 없어요</p></li>`;
  }

  chips.addEventListener("click", e => {
    const b = e.target.closest(".chip");
    if (!b) return;
    chips.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c === b));
    cat = b.dataset.cat;
    render();
  });
  search.addEventListener("input", render);
  bindAccordion(box);
  render();
}

/* ---------- 1:1 문의 ---------- */
function initQna() {
  const user = requireLogin();
  if (!user) return;

  // 내 주문을 관련 주문으로 고를 수 있게
  const orders = Store.get(KEY.orders, []).filter(o => o.userId === user.id);
  document.querySelector("#qOrder").innerHTML += orders.map(o =>
    `<option value="${o.no}">${o.no} · ${getProduct(o.items[0].id).name}${o.items.length > 1 ? ` 외 ${o.items.length - 1}건` : ""}</option>`).join("");

  const body = document.querySelector("#qBody");
  body.addEventListener("input", () => (document.querySelector("#qLen").textContent = body.value.length));

  const box = document.querySelector("#qnaList");
  function render() {
    const mine = Store.get(KEY.qna, []).filter(q => q.userId === user.id);
    box.innerHTML = mine.length ? mine.map(q => `
      <li>
        <button type="button" class="acc-q">
          <span class="state ${q.answer ? "done" : ""}">${q.answer ? "답변 완료" : "답변 대기"}</span>
          <span class="acc-cat">${q.type}</span>${escapeHTML(q.title)}<span class="acc-date">${q.date}</span>
        </button>
        <div class="acc-a">
          <p>${escapeHTML(q.body).replace(/\n/g, "<br>")}</p>
          ${q.order ? `<p class="muted">관련 주문: ${q.order}</p>` : ""}
          <p class="muted">${q.answer || "평일 하루 안에 답변드릴게요."}</p>
        </div>
      </li>`).join("") : `<li class="empty-small">아직 남긴 문의가 없어요.</li>`;
  }
  bindAccordion(box);

  document.querySelector("#qnaForm").addEventListener("submit", e => {
    e.preventDefault();
    const type = document.querySelector("#qType").value;
    const title = document.querySelector("#qTitle").value.trim();
    const err = document.querySelector("#qErr");
    let msg = "";
    if (!type) msg = "문의 유형을 선택해 주세요.";
    else if (!title) msg = "제목을 입력해 주세요.";
    else if (body.value.trim().length < 5) msg = "내용을 5자 이상 적어 주세요.";
    err.textContent = msg;
    if (msg) return;

    const list = Store.get(KEY.qna, []);
    list.unshift({
      id: Date.now(), userId: user.id, type, title, body: body.value.trim(),
      order: document.querySelector("#qOrder").value, mail: document.querySelector("#qMail").checked,
      date: today(), answer: ""
    });
    Store.set(KEY.qna, list);
    e.target.reset();
    document.querySelector("#qLen").textContent = 0;
    showToast("문의가 등록되었어요.");
    render();
  });

  render();
}
