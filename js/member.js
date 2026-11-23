/* =========================================================
   회원 스크립트 (member.js)
   - login.html : 로그인, 아이디 저장, 로그인 후 원래 페이지로 돌아가기
   - join.html  : 약관 동의, 입력값 검사, 아이디 중복 확인, 가입
   - find.html  : 아이디 찾기, 비밀번호 재설정
   서버가 없어서 회원 정보는 localStorage "fitroom_members"에 저장
   (과제용이라 비밀번호를 그대로 저장함. 실제 사이트에서는 서버에서 암호화해야 함)
   ========================================================= */

// 입력값 규칙
const RULE = {
  id: /^[a-z0-9]{4,12}$/,
  pw: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^01[016789]-\d{3,4}-\d{4}$/
};

document.addEventListener("DOMContentLoaded", () => {
  const mode = document.body.dataset.mode;
  if (mode === "login") initLogin();
  if (mode === "join") initJoin();
  if (mode === "find") initFind();

  // 비밀번호 보기 / 숨기기
  document.querySelectorAll("[data-eye]").forEach(b => {
    b.addEventListener("click", () => {
      const input = document.getElementById(b.dataset.eye);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      b.textContent = show ? "숨기기" : "보기";
    });
  });
});

/* ---------- 로그인 ---------- */
function initLogin() {
  const id = document.querySelector("#lgId"), pw = document.querySelector("#lgPw");
  const save = document.querySelector("#lgSave"), err = document.querySelector("#lgErr");

  // 이미 로그인했으면 메인으로
  if (currentUser()) { location.replace("index.html"); return; }

  const saved = Store.get(KEY.savedId, "");
  if (saved) { id.value = saved; save.checked = true; pw.focus(); } else id.focus();

  document.querySelector("#lgDemo").addEventListener("click", () => {
    id.value = DEMO_MEMBER.id;
    pw.value = DEMO_MEMBER.pw;
  });

  document.querySelector("#loginForm").addEventListener("submit", e => {
    e.preventDefault();
    if (!id.value.trim() || !pw.value) { err.textContent = "아이디와 비밀번호를 입력해 주세요."; return; }
    const m = getMembers().find(x => x.id === id.value.trim() && x.pw === pw.value);
    if (!m) {
      err.textContent = "아이디 또는 비밀번호가 맞지 않아요.";
      pw.value = "";
      pw.focus();
      return;
    }
    Store.set(KEY.user, { id: m.id, name: m.name });
    Store.set(KEY.savedId, save.checked ? m.id : "");
    const next = param("next");
    // 다른 사이트 주소로 보내지 않도록 우리 파일 이름만 허용
    location.href = next && /^[a-z_]+\.html/.test(next) ? next : "index.html";
  });
}

/* ---------- 회원가입 ---------- */
function initJoin() {
  const $ = s => document.querySelector(s);
  let idChecked = "";   // 중복 확인을 마친 아이디

  // 약관: 전체 동의 ↔ 개별 동의
  const all = $("#agAll"), ags = document.querySelectorAll(".ag");
  all.addEventListener("change", () => ags.forEach(a => (a.checked = all.checked)));
  ags.forEach(a => a.addEventListener("change", () => (all.checked = [...ags].every(x => x.checked))));

  // 안내 문구 표시
  function hint(id, msg, ok) {
    const p = document.querySelector(`.hint[data-for="${id}"]`);
    p.textContent = msg;
    p.className = "hint " + (ok ? "ok" : msg ? "bad" : "");
    document.getElementById(id).classList.toggle("is-bad", !ok && !!msg);
  }

  $("#jName").addEventListener("blur", e => hint("jName", e.target.value.trim().length >= 2 ? "" : "이름을 2자 이상 입력해 주세요.", true));

  $("#jId").addEventListener("input", e => {
    idChecked = "";
    const v = e.target.value;
    hint("jId", RULE.id.test(v) ? "중복 확인을 눌러 주세요." : "영문 소문자, 숫자로 4~12자 입력해 주세요.", false);
  });
  $("#jIdCheck").addEventListener("click", () => {
    const v = $("#jId").value.trim();
    if (!RULE.id.test(v)) { hint("jId", "영문 소문자, 숫자로 4~12자 입력해 주세요.", false); return; }
    if (getMembers().some(m => m.id === v)) { hint("jId", "이미 사용 중인 아이디예요.", false); return; }
    idChecked = v;
    hint("jId", "사용할 수 있는 아이디예요.", true);
  });

  // 비밀번호 강도 막대
  $("#jPw").addEventListener("input", e => {
    const v = e.target.value;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Za-z]/.test(v) && /\d/.test(v)) score++;
    if (/[^A-Za-z\d]/.test(v)) score++;
    if (v.length >= 12) score++;
    const bar = $("#jPwBar");
    bar.style.width = score * 25 + "%";
    bar.className = ["", "weak", "weak", "mid", "strong"][score];
    hint("jPw", RULE.pw.test(v) ? "안전한 비밀번호예요." : v ? "영문, 숫자, 특수문자를 모두 넣어 8자 이상으로 만들어 주세요." : "", RULE.pw.test(v));
    if ($("#jPw2").value) $("#jPw2").dispatchEvent(new Event("input"));
  });
  $("#jPw2").addEventListener("input", e => {
    const same = e.target.value === $("#jPw").value;
    hint("jPw2", same ? "비밀번호가 같아요." : "비밀번호가 서로 달라요.", same);
  });
  $("#jEmail").addEventListener("blur", e => hint("jEmail", !e.target.value || RULE.email.test(e.target.value) ? "" : "이메일 형식을 확인해 주세요.", true));

  // 휴대폰 번호: 숫자만 입력하면 - 자동
  $("#jPhone").addEventListener("input", e => {
    const n = e.target.value.replace(/\D/g, "").slice(0, 11);
    e.target.value = n.length < 4 ? n : n.length < 8 ? `${n.slice(0, 3)}-${n.slice(3)}` : `${n.slice(0, 3)}-${n.slice(3, n.length - 4)}-${n.slice(-4)}`;
  });

  $("#joinForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#jName").value.trim(), id = $("#jId").value.trim(), pw = $("#jPw").value;
    const email = $("#jEmail").value.trim(), phone = $("#jPhone").value;
    const err = $("#jErr");
    let msg = "";
    if (![...document.querySelectorAll(".ag[data-need]")].every(a => a.checked)) msg = "필수 약관에 동의해 주세요.";
    else if (name.length < 2) msg = "이름을 2자 이상 입력해 주세요.";
    else if (!RULE.id.test(id)) msg = "아이디를 확인해 주세요.";
    else if (idChecked !== id) msg = "아이디 중복 확인을 눌러 주세요.";
    else if (!RULE.pw.test(pw)) msg = "비밀번호를 규칙에 맞게 입력해 주세요.";
    else if (pw !== $("#jPw2").value) msg = "비밀번호 확인이 달라요.";
    else if (!RULE.email.test(email)) msg = "이메일을 확인해 주세요.";
    else if (!RULE.phone.test(phone)) msg = "휴대폰 번호를 확인해 주세요.";
    err.textContent = msg;
    if (msg) return;

    const roomType = (document.querySelector("input[name=jRoom]:checked") || {}).value || "";
    const members = getMembers();
    members.push({ id, pw, name, email, phone, roomType, marketing: $("#agMkt").checked, joined: today() });
    saveMembers(members);

    const w = Number($("#jW").value), d = Number($("#jD").value);
    if (w && d) Store.set(KEY.myRoom, { w, d, h: "", type: roomType });

    Store.set(KEY.user, { id, name });   // 가입하면 바로 로그인
    renderHeader();
    $("#joinForm").hidden = true;
    $("#doneName").textContent = name;
    $("#joinDone").hidden = false;
    window.scrollTo(0, 0);
  });
}

/* ---------- 아이디 · 비밀번호 찾기 ---------- */
function initFind() {
  const $ = s => document.querySelector(s);

  // 탭 전환
  document.querySelectorAll("#findTabs button").forEach(b => {
    b.addEventListener("click", () => {
      document.querySelectorAll("#findTabs button").forEach(x => x.classList.toggle("on", x === b));
      $("#findId").hidden = b.dataset.tab !== "id";
      $("#findPw").hidden = b.dataset.tab !== "pw";
    });
  });

  // 아이디 찾기: 앞 3글자만 보여 주고 나머지는 *
  $("#findId").addEventListener("submit", e => {
    e.preventDefault();
    const m = getMembers().find(x => x.name === $("#fiName").value.trim() && x.email === $("#fiEmail").value.trim());
    $("#fiErr").textContent = m ? "" : "일치하는 회원이 없어요.";
    $("#fiResult").hidden = !m;
    if (m) {
      const masked = m.id.slice(0, 3) + "*".repeat(m.id.length - 3);
      $("#fiResult").innerHTML = `회원님의 아이디는 <b>${masked}</b> 이에요. <span class="muted">(가입일 ${m.joined || "-"})</span>`;
    }
  });

  // 비밀번호 재설정: 1단계 확인 → 2단계 새 비밀번호
  let target = null;
  $("#findPw").addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#fpErr");
    if (!target) {
      target = getMembers().find(x => x.id === $("#fpId").value.trim() && x.email === $("#fpEmail").value.trim()) || null;
      if (!target) { err.textContent = "일치하는 회원이 없어요."; return; }
      err.textContent = "";
      $("#fpNew").hidden = false;
      $("#fpId").readOnly = $("#fpEmail").readOnly = true;
      $("#fpBtn").textContent = "비밀번호 바꾸기";
      $("#fpPw").focus();
      return;
    }
    const pw = $("#fpPw").value;
    if (!RULE.pw.test(pw)) { err.textContent = "영문, 숫자, 특수문자를 모두 넣어 8자 이상으로 만들어 주세요."; return; }
    if (pw !== $("#fpPw2").value) { err.textContent = "새 비밀번호 확인이 달라요."; return; }
    const members = getMembers();
    members.find(m => m.id === target.id).pw = pw;
    saveMembers(members);
    showToast("비밀번호를 바꿨어요. 새 비밀번호로 로그인해 주세요.");
    setTimeout(() => (location.href = "login.html"), 1200);
  });
}
