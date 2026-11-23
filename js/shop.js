/* =========================================================
   샵 목록 스크립트 (shop.js)
   - shop.html, shop_bed.html, shop_desk.html, shop_storage.html, shop_table.html 에서 사용
   - <body data-cat="desk"> 처럼 카테고리를 적어 두면 그 카테고리만 보여 줌
   - 필터: 내 공간 치수, 가격대, 이사 친화, 조립 여부 / 정렬
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const cat = document.body.dataset.cat || "all";
  const inW = document.querySelector("#fW");
  const inD = document.querySelector("#fD");
  const inH = document.querySelector("#fH");
  const move = document.querySelector("#fMove");
  const noAsm = document.querySelector("#fNoAsm");
  const sort = document.querySelector("#sort");
  const list = document.querySelector("#list");
  const empty = document.querySelector("#empty");
  const count = document.querySelector("#count");

  // 저장한 내 방 치수가 있으면 불러오기 버튼 보이기
  const room = Store.get(KEY.myRoom, null);
  const loadBtn = document.querySelector("#loadRoom");
  if (room && room.w) {
    loadBtn.hidden = false;
    loadBtn.textContent = `저장한 내 방 치수 불러오기 (${room.w}×${room.d})`;
    loadBtn.addEventListener("click", () => {
      inW.value = room.w;
      inD.value = room.d;
      inH.value = room.h || "";
      render();
    });
  }

  function render() {
    const w = Number(inW.value), d = Number(inD.value), h = Number(inH.value);
    const price = document.querySelector("input[name=price]:checked").value.split("-");

    let items = PRODUCTS.filter(p => cat === "all" || p.cat === cat);
    if (price.length === 2) items = items.filter(p => p.price >= Number(price[0]) && p.price <= Number(price[1]));
    if (w && d) items = items.filter(p => fits(p, w, d, h));
    if (move.checked) items = items.filter(p => p.easyMove);
    if (noAsm.checked) items = items.filter(p => !p.assemble);

    // 정렬
    const by = {
      rec: (a, b) => (b.best - a.best) || a.id - b.id,
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      small: (a, b) => a.w * a.d - b.w * b.d,
      light: (a, b) => a.weight - b.weight
    };
    items.sort(by[sort.value]);

    count.textContent = items.length;
    list.innerHTML = items.map(productCard).join("");
    empty.hidden = items.length > 0;
  }

  // 입력이 바뀔 때마다 다시 그리기
  document.querySelectorAll(".filter input, #sort").forEach(el => {
    el.addEventListener(el.type === "number" ? "input" : "change", render);
  });

  document.querySelector("#fReset").addEventListener("click", () => {
    inW.value = inD.value = inH.value = "";
    document.querySelector("input[name=price][value=all]").checked = true;
    move.checked = noAsm.checked = false;
    sort.value = "rec";
    render();
  });

  render();
});
