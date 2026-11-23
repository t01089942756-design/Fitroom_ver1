/* =========================================================
   방명록 스크립트 (guestbook.js)
   - guestbook.html       : 목록, 페이지 나누기, 비밀번호로 삭제
   - guestbook_write.html : 글쓰기 (data-mode="write")
   글은 localStorage "fitroom_guestbook"에 저장
   ========================================================= */

const GB_PER_PAGE = 5;

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.mode === "write") initGbWrite();
  else initGbList();
});

/* ---------- 목록 ---------- */
function initGbList() {
  let page = 1;
  const listBox = document.querySelector("#gbList");

  function render() {
    const list = getGuestbook();
    const pages = Math.max(1, Math.ceil(list.length / GB_PER_PAGE));
    if (page > pages) page = pages;
    document.querySelector("#gbCount").textContent = list.length;

    const part = list.slice((page - 1) * GB_PER_PAGE, page * GB_PER_PAGE);
    listBox.innerHTML = part.length ? part.map(g => `
      <li class="gb-item" data-id="${g.id}">
        <span class="avatar">${escapeHTML(g.name).charAt(0)}</span>
        <div class="gb-body">
          <p class="gb-top"><b>${escapeHTML(g.name)}</b><span class="muted">${g.date}</span></p>
          <p class="gb-text">${escapeHTML(g.text)}</p>
          ${g.pw ? `
          <div class="gb-del">
            <button type="button" class="link-btn" data-open>삭제</button>
            <span class="gb-del-form" hidden>
              <input type="password" class="input input-sm" maxlength="4" placeholder="비밀번호">
              <button type="button" class="btn btn-line btn-xs" data-del>확인</button>
            </span>
          </div>` : ""}
        </div>
      </li>`).join("") : `<li class="empty"><p class="empty-title">아직 방명록이 없어요</p><p>첫 번째 이야기를 남겨 주세요.</p></li>`;

    // 페이지 번호
    let html = "";
    for (let i = 1; i <= pages; i++) html += `<button type="button" class="${i === page ? "on" : ""}" data-page="${i}">${i}</button>`;
    document.querySelector("#gbPager").innerHTML = pages > 1 ? html : "";
  }

  document.querySelector("#gbPager").addEventListener("click", e => {
    const b = e.target.closest("[data-page]");
    if (!b) return;
    page = Number(b.dataset.page);
    render();
  });

  // 삭제: 버튼을 누르면 비밀번호 칸이 열리고, 맞으면 삭제
  listBox.addEventListener("click", e => {
    const item = e.target.closest(".gb-item");
    if (!item) return;
    if (e.target.closest("[data-open]")) {
      const form = item.querySelector(".gb-del-form");
      form.hidden = !form.hidden;
      if (!form.hidden) form.querySelector("input").focus();
    }
    if (e.target.closest("[data-del]")) {
      const pw = item.querySelector(".gb-del-form input").value;
      const list = getGuestbook();
      const g = list.find(x => String(x.id) === item.dataset.id);
      if (!g || g.pw !== pw) {
        showToast("비밀번호가 맞지 않아요.");
        return;
      }
      Store.set(KEY.guestbook, list.filter(x => x !== g));
      showToast("방명록을 삭제했어요.");
      render();
    }
  });

  if (param("done")) showToast("방명록이 등록되었어요. 고마워요!");
  render();
}

/* ---------- 글쓰기 ---------- */
function initGbWrite() {
  const name = document.querySelector("#gbName");
  const pw = document.querySelector("#gbPw");
  const text = document.querySelector("#gbText");
  const user = currentUser();
  if (user) name.value = user.name;

  text.addEventListener("input", () => (document.querySelector("#gbLen").textContent = text.value.length));

  // 빠른 입력 버튼
  document.querySelectorAll("#gbEmoji button").forEach(b => {
    b.addEventListener("click", () => {
      text.value = (text.value ? text.value + " " : "") + b.textContent;
      text.dispatchEvent(new Event("input"));
      text.focus();
    });
  });

  document.querySelector("#gbForm").addEventListener("submit", e => {
    e.preventDefault();
    const err = document.querySelector("#gbErr");
    let msg = "";
    if (name.value.trim().length < 2) msg = "닉네임을 2자 이상 입력해 주세요.";
    else if (!/^\d{4}$/.test(pw.value)) msg = "비밀번호는 숫자 4자리로 입력해 주세요.";
    else if (text.value.trim().length < 2) msg = "내용을 입력해 주세요.";
    err.textContent = msg;
    if (msg) return;

    const list = getGuestbook();
    list.unshift({ id: Date.now(), name: name.value.trim(), text: text.value.trim(), date: today(), pw: pw.value });
    Store.set(KEY.guestbook, list);
    location.href = "guestbook.html?done=1";
  });
}
