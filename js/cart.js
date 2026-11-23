/* =========================================================
   장바구니 · 주문 스크립트 (cart.js)
   - cart.html  : 선택, 수량 변경, 삭제, 배송비 계산, 선택 상품 주문
   - order.html : 주문서 작성, 결제(흉내), 주문 완료 (data-mode="order", 로그인 필요)
   주소 형식: order.html?items=1:2,4:1  (상품id:수량)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.mode === "order") initOrder();
  else initCart();
});

/* 휴대폰 번호 자동 - 넣기 */
function phoneFormat(v) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  return n.length < 4 ? n : n.length < 8 ? `${n.slice(0, 3)}-${n.slice(3)}` : `${n.slice(0, 3)}-${n.slice(3, n.length - 4)}-${n.slice(-4)}`;
}

/* 결제 금액 상자 */
function summaryHTML(sum, btn) {
  const ship = shippingFee(sum);
  const left = SHIP_FREE - sum;
  return `
    <h3>결제 금액</h3>
    <dl>
      <dt>상품 금액</dt><dd>${formatPrice(sum)}</dd>
      <dt>배송비</dt><dd>${ship ? formatPrice(ship) : "무료"}</dd>
    </dl>
    <div class="ship-bar">
      <i style="width:${Math.min(sum / SHIP_FREE * 100, 100)}%"></i>
    </div>
    <p class="ship-msg">${sum === 0 ? "상품을 선택해 주세요." : left > 0 ? `<b>${formatPrice(left)}</b> 더 담으면 무료 배송이에요.` : "무료 배송 조건을 채웠어요!"}</p>
    <dl class="sum-total"><dt>결제 예정 금액</dt><dd>${formatPrice(sum + ship)}</dd></dl>
    ${btn}`;
}

/* ---------- 장바구니 ---------- */
function initCart() {
  const selected = new Set(getCart().map(i => i.id));

  function render() {
    const cart = getCart().filter(i => getProduct(i.id));
    document.querySelector("#cartWrap").hidden = cart.length === 0;
    document.querySelector("#ctEmpty").hidden = cart.length > 0;
    if (!cart.length) return;

    document.querySelector("#ctList").innerHTML = cart.map(i => {
      const p = getProduct(i.id);
      return `
        <li class="ct-item" data-id="${p.id}">
          <label class="check"><input type="checkbox" class="ct-chk" ${selected.has(p.id) ? "checked" : ""}><span></span></label>
          <a href="detail.html?id=${p.id}" class="ct-thumb">${p.img ? `<img src="${p.img}" alt="">` : shapeSVG(p.shape)}</a>
          <div class="ct-info">
            <p class="card-cat">${CATEGORIES[p.cat]}</p>
            <a href="detail.html?id=${p.id}" class="ct-name">${escapeHTML(p.name)}</a>
            <p class="card-size">${dimText(p)} <span>· ${p.weight}kg</span></p>
          </div>
          <div class="qty">
            <button type="button" data-act="minus" aria-label="수량 빼기">−</button>
            <input type="number" value="${i.qty}" min="1" max="10" class="ct-qty">
            <button type="button" data-act="plus" aria-label="수량 더하기">+</button>
          </div>
          <p class="ct-price">${formatPrice(p.price * i.qty)}</p>
          <button type="button" class="ct-del" data-act="del" aria-label="삭제">×</button>
        </li>`;
    }).join("");

    const chosen = cart.filter(i => selected.has(i.id));
    const sum = chosen.reduce((s, i) => s + getProduct(i.id).price * i.qty, 0);
    document.querySelector("#ctSel").textContent = chosen.length;
    document.querySelector("#ctTotal").textContent = cart.length;
    document.querySelector("#ctAll").checked = chosen.length === cart.length;
    document.querySelector("#ctSummary").innerHTML = summaryHTML(sum, `
      <button type="button" class="btn btn-oak full" id="ctOrder" ${chosen.length ? "" : "disabled"}>선택 상품 주문하기 (${chosen.length})</button>
      <a href="fitcheck.html" class="btn btn-line full">내 방에 들어가는지 확인</a>`);
    const btn = document.querySelector("#ctOrder");
    btn.addEventListener("click", () => {
      location.href = "order.html?from=cart&items=" + chosen.map(i => `${i.id}:${i.qty}`).join(",");
    });
  }

  function setQty(id, n) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    item.qty = Math.min(Math.max(Number(n) || 1, 1), 10);
    Store.set(KEY.cart, cart);
    updateCartBadge();
    render();
  }
  function remove(ids) {
    Store.set(KEY.cart, getCart().filter(i => !ids.includes(i.id)));
    ids.forEach(id => selected.delete(id));
    updateCartBadge();
    render();
  }

  const list = document.querySelector("#ctList");
  list.addEventListener("click", e => {
    const li = e.target.closest(".ct-item");
    const act = e.target.closest("[data-act]");
    if (!li || !act) return;
    const id = Number(li.dataset.id);
    const qty = Number(li.querySelector(".ct-qty").value);
    if (act.dataset.act === "minus") setQty(id, qty - 1);
    if (act.dataset.act === "plus") setQty(id, qty + 1);
    if (act.dataset.act === "del") { remove([id]); showToast("상품을 뺐어요."); }
  });
  list.addEventListener("change", e => {
    const li = e.target.closest(".ct-item");
    if (!li) return;
    const id = Number(li.dataset.id);
    if (e.target.classList.contains("ct-qty")) setQty(id, e.target.value);
    if (e.target.classList.contains("ct-chk")) {
      e.target.checked ? selected.add(id) : selected.delete(id);
      render();
    }
  });
  document.querySelector("#ctAll").addEventListener("change", e => {
    getCart().forEach(i => (e.target.checked ? selected.add(i.id) : selected.delete(i.id)));
    render();
  });
  document.querySelector("#ctDelSel").addEventListener("click", () => {
    if (!selected.size) { showToast("삭제할 상품을 선택해 주세요."); return; }
    remove([...selected]);
    showToast("선택한 상품을 뺐어요.");
  });

  render();
}

/* ---------- 주문하기 ---------- */
function initOrder() {
  const user = requireLogin();
  if (!user) return;
  const $ = s => document.querySelector(s);

  // 주소에서 주문할 상품 읽기
  const items = (param("items") || "").split(",").map(x => {
    const [id, qty] = x.split(":").map(Number);
    return { id, qty: Math.min(Math.max(qty || 1, 1), 10) };
  }).filter(i => getProduct(i.id));

  if (!items.length) {
    $("#orderForm").hidden = true;
    $("#odEmpty").hidden = false;
    return;
  }

  const sum = items.reduce((s, i) => s + getProduct(i.id).price * i.qty, 0);
  const ship = shippingFee(sum);

  $("#odCount").textContent = `${items.length}개`;
  $("#odItems").innerHTML = items.map(i => {
    const p = getProduct(i.id);
    return `
      <li>
        <span class="ct-thumb">${productThumb(p)}</span>
        <div class="ct-info"><p class="ct-name">${escapeHTML(p.name)}</p><p class="muted">${dimText(p)} · ${i.qty}개</p></div>
        <b>${formatPrice(p.price * i.qty)}</b>
      </li>`;
  }).join("");

  $("#odSummary").innerHTML = summaryHTML(sum, `
    <label class="check agree"><input type="checkbox" id="odAgree"><span>주문 내용을 확인했고 결제에 동의해요 <em>(필수)</em></span></label>
    <p class="form-err" id="odErr"></p>
    <button type="submit" class="btn btn-oak full">${formatPrice(sum + ship)} 결제하기</button>`);

  // 회원 정보로 받는 분 채우기
  const me = getMembers().find(m => m.id === user.id) || {};
  function fillMe(on) {
    $("#odName").value = on ? me.name || "" : "";
    $("#odPhone").value = on ? me.phone || "" : "";
  }
  fillMe(true);
  $("#odSame").addEventListener("change", e => fillMe(e.target.checked));
  $("#odPhone").addEventListener("input", e => (e.target.value = phoneFormat(e.target.value)));
  $("#odZip").addEventListener("input", e => (e.target.value = e.target.value.replace(/\D/g, "")));
  document.querySelectorAll("input[name=odLift]").forEach(r =>
    r.addEventListener("change", () => ($("#odLiftNote").hidden = r.value !== "없음" || !r.checked)));

  $("#orderForm").addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#odErr");
    let msg = "", bad = null;
    if ($("#odName").value.trim().length < 2) { msg = "받는 분 이름을 입력해 주세요."; bad = "#odName"; }
    else if (!/^01[016789]-\d{3,4}-\d{4}$/.test($("#odPhone").value)) { msg = "연락처를 확인해 주세요."; bad = "#odPhone"; }
    else if (!/^\d{5}$/.test($("#odZip").value)) { msg = "우편번호 5자리를 입력해 주세요."; bad = "#odZip"; }
    else if (!$("#odAddr").value.trim()) { msg = "주소를 입력해 주세요."; bad = "#odAddr"; }
    else if (!$("#odAddr2").value.trim()) { msg = "상세 주소를 입력해 주세요."; bad = "#odAddr2"; }
    else if (!$("#odAgree").checked) { msg = "결제 동의에 체크해 주세요."; }
    err.textContent = msg;
    document.querySelectorAll(".is-bad").forEach(x => x.classList.remove("is-bad"));
    if (bad) { $(bad).classList.add("is-bad"); $(bad).focus(); }
    if (msg) return;

    const no = "FR" + today().replace(/\./g, "") + "-" + String(Date.now()).slice(-5);
    const orders = Store.get(KEY.orders, []);
    orders.unshift({
      no, userId: user.id, date: today(), status: "결제 완료",
      items: items.map(i => ({ id: i.id, qty: i.qty, price: getProduct(i.id).price })),
      sum, ship, total: sum + ship,
      pay: document.querySelector("input[name=odPay]:checked").value,
      to: {
        name: $("#odName").value.trim(), phone: $("#odPhone").value,
        addr: `(${$("#odZip").value}) ${$("#odAddr").value.trim()} ${$("#odAddr2").value.trim()}`,
        lift: document.querySelector("input[name=odLift]:checked").value, memo: $("#odMemo").value
      }
    });
    Store.set(KEY.orders, orders);

    // 장바구니에서 주문한 상품 빼기
    if (param("from") === "cart") {
      const ids = items.map(i => i.id);
      Store.set(KEY.cart, getCart().filter(c => !ids.includes(c.id)));
      updateCartBadge();
    }

    $("#orderForm").hidden = true;
    $("#odNo").textContent = no;
    $("#odDone").hidden = false;
    window.scrollTo(0, 0);
  });
}
