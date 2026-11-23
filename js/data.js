/* =========================================================
   핏룸 데이터 파일 (data.js)
   - 상품, 리뷰, 방명록, 공지, FAQ 같은 기본 데이터를 모아 둔 파일
   - 모든 페이지가 이 데이터를 같이 사용
   - 치수 단위: cm  (w = 가로, d = 깊이(세로), h = 높이)
   ========================================================= */

// 카테고리 이름 (샵 2차 메뉴와 같음)
const CATEGORIES = {
  bed: "침대·소파",
  desk: "책상·의자",
  storage: "수납·선반",
  table: "테이블"
};

// 카테고리별 샵 페이지 파일
const CATEGORY_PAGE = {
  bed: "shop_bed.html",
  desk: "shop_desk.html",
  storage: "shop_storage.html",
  table: "shop_table.html"
};

// 공간 유형 (리뷰, 회원가입, 공간별 추천에서 사용)
const ROOM_TYPES = {
  oneroom: "원룸",
  officetel: "오피스텔",
  tworoom: "투룸"
};

/* 상품 목록
   img      : 실제 사진 경로 (예: "images/products/desk01.jpg"), 비워 두면 그림으로 대체
   shape    : 사진이 없을 때 보여줄 그림 종류
   easyMove : 이사 친화 (분해 가능 + 25kg 이하)
   assemble : 조립 필요 여부
   best     : 메인 베스트 상품에 노출 */
const PRODUCTS = [
  { id: 1,  name: "오크 슬림 책상", cat: "desk", shape: "desk", price: 89000, w: 120, d: 60, h: 74, weight: 18,
    easyMove: true, assemble: true, best: false, img: "images/products/desk01.jpg", material: "오크 원목, 오크 무늬목 상판", color: "내추럴 오크",
    desc: "깊이 60cm로 원룸 창가에도 부담 없이 들어가는 책상이에요. 상판 아래 얇은 서랍 두 칸에 자주 쓰는 물건을 넣어 둘 수 있어요." },
  { id: 2,  name: "선반형 접이식 책상", cat: "desk", shape: "desk", price: 69000, w: 90, d: 45, h: 76, weight: 14,
    easyMove: true, assemble: true, best: false, img: "images/products/desk02.jpg", material: "MDF, 스틸 프레임", color: "화이트 우드",
    desc: "상판을 접으면 옆의 2단 선반만 남아서 책장처럼 쓸 수 있어요. 책상이 필요할 때만 펴서 쓰는 좁은 방용 책상이에요." },
  { id: 3,  name: "부클레 라운드 체어", cat: "desk", shape: "chair", price: 129000, w: 52, d: 50, h: 78, weight: 6,
    easyMove: true, assemble: true, best: true, img: "images/products/chair01.jpg", material: "애쉬 원목(월넛 컬러), 부클레 패브릭", color: "아이보리 / 월넛",
    desc: "등을 감싸는 둥근 등받이와 부드러운 부클레 원단의 의자예요. 폭 52cm라 작은 책상이나 식탁에도 잘 어울려요." },
  { id: 4,  name: "수납형 슈퍼싱글 침대", cat: "bed", shape: "bed", price: 289000, w: 115, d: 205, h: 80, weight: 46,
    easyMove: false, assemble: true, best: true, img: "images/products/bed01.jpg", material: "고무나무 집성목", color: "라이트 메이플",
    desc: "침대 밑 큰 서랍 두 개로 옷장 하나만큼 수납할 수 있어요. 서랍을 열 공간(앞으로 60cm)을 함께 확인해 주세요." },
  { id: 5,  name: "코듀로이 1인 소파", cat: "bed", shape: "sofa", price: 249000, w: 95, d: 85, h: 75, weight: 24,
    easyMove: false, assemble: false, best: false, img: "images/products/sofa01.jpg", material: "코듀로이 패브릭, 우레탄 폼", color: "라이트 그레이",
    desc: "골이 굵은 코듀로이 원단의 넉넉한 1인 소파예요. 커버를 벗겨 세탁할 수 있어요." },
  { id: 6,  name: "슬라이딩 소파베드", cat: "bed", shape: "sofa", price: 329000, w: 150, d: 90, h: 85, weight: 38,
    easyMove: false, assemble: true, best: true, img: "images/products/sofa02.jpg", material: "패브릭, 원목 프레임", color: "샌드 베이지",
    desc: "아래 칸을 앞으로 당기면 150×190cm 침대가 돼요. 펼쳤을 때 앞쪽으로 100cm가 더 필요해요." },
  { id: 7,  name: "5단 화이트 책장", cat: "storage", shape: "shelf", price: 99000, w: 80, d: 30, h: 180, weight: 20,
    easyMove: true, assemble: true, best: true, img: "images/products/shelf01.jpg", material: "E0 등급 MDF", color: "화이트",
    desc: "깊이 30cm 얇은 책장이라 좁은 벽에도 세울 수 있어요. 칸이 넓어서 책, 바구니, 소품을 함께 정리하기 좋아요." },
  { id: 8,  name: "슬림 틈새 수납장", cat: "storage", shape: "drawer", price: 59000, w: 28, d: 40, h: 65, weight: 8,
    easyMove: true, assemble: true, best: false, img: "images/products/shelf02.jpg", material: "MDF, 무광 도장", color: "크림 화이트",
    desc: "폭 28cm라 침대 옆 좁은 틈에 쏙 들어가요. 둥근 모서리라 지나다니다 부딪혀도 덜 아파요." },
  { id: 9,  name: "3단 월넛 서랍장", cat: "storage", shape: "drawer", price: 219000, w: 80, d: 45, h: 100, weight: 35,
    easyMove: false, assemble: true, best: false, img: "images/products/drawer01.jpg", material: "월넛 무늬목, MDF", color: "월넛",
    desc: "손잡이 없이 홈으로 여는 깔끔한 서랍장이에요. 서랍 깊이가 넉넉해서 옷장 대신 쓰기 좋아요." },
  { id: 10, name: "2인 원형 식탁", cat: "table", shape: "table", price: 149000, w: 75, d: 75, h: 74, weight: 16,
    easyMove: true, assemble: true, best: false, img: "images/products/table01.jpg", material: "오크 무늬목, 원뿔형 받침", color: "라이트 오크",
    desc: "지름 75cm 원형에 가운데 받침 하나라 의자를 넣고 빼기 편해요. 두 명이 식사하기 딱 좋은 크기예요." },
  { id: 11, name: "화이트 접이식 좌식 테이블", cat: "table", shape: "lowtable", price: 35000, w: 80, d: 60, h: 32, weight: 6,
    easyMove: true, assemble: false, best: false, img: "images/products/table02.jpg", material: "자작 합판, 스틸 다리", color: "화이트",
    desc: "다리를 접어 세워 두면 공간을 거의 차지하지 않아요. 이사할 때도 한 손으로 들 수 있어요." },
  { id: 12, name: "구름 사이드 테이블", cat: "table", shape: "table", price: 79000, w: 45, d: 45, h: 50, weight: 4,
    easyMove: true, assemble: false, best: false, img: "images/products/table03.jpg", material: "강화 플라스틱, 무광 도장", color: "아이보리",
    desc: "구름 모양 상판이 귀여운 작은 테이블이에요. 소파나 침대 옆에 두고 컵, 책, 화분을 올려 두기 좋아요." },
  { id: 13, name: "크림 라운드 협탁", cat: "storage", shape: "drawer", price: 89000, w: 50, d: 40, h: 50, weight: 12,
    easyMove: true, assemble: false, best: false, img: "images/products/night01.jpg", material: "MDF, 월넛 원목 상판", color: "크림 / 월넛",
    desc: "둥근 모서리의 크림색 몸통에 월넛 상판을 얹은 2단 협탁이에요. 침대 옆 작은 자리에 잘 맞아요." },
  { id: 14, name: "원목 2단 협탁", cat: "storage", shape: "drawer", price: 139000, w: 55, d: 40, h: 60, weight: 18,
    easyMove: true, assemble: false, best: false, img: "images/products/night02.jpg", material: "재생 티크 원목", color: "내추럴 티크",
    desc: "나뭇결이 살아 있는 원목 협탁이에요. 조립 없이 받자마자 바로 쓸 수 있어요." },
  { id: 15, name: "오벌 접이식 좌식 테이블", cat: "table", shape: "lowtable", price: 45000, w: 90, d: 55, h: 30, weight: 5,
    easyMove: true, assemble: false, best: false, img: "images/products/table04.jpg", material: "자작 합판, 스틸 다리", color: "화이트",
    desc: "모서리 없는 둥근 상판이라 좁은 방에서도 부딪힐 걱정이 없어요. 다리를 접으면 두께가 4cm예요." },
  { id: 16, name: "3단 원형 사이드 테이블", cat: "table", shape: "table", price: 69000, w: 45, d: 45, h: 70, weight: 7,
    easyMove: true, assemble: true, best: false, img: "images/products/table05.jpg", material: "MDF 월넛 필름, 스틸 다리", color: "월넛 / 블랙",
    desc: "바닥 면적은 작지만 칸이 세 개라 수납이 넉넉해요. 소파 옆 협탁이나 스피커 거치대로 써도 좋아요." },
  { id: 17, name: "1인 소파베드 체어", cat: "bed", shape: "sofa", price: 189000, w: 75, d: 80, h: 80, weight: 18,
    easyMove: true, assemble: false, best: false, img: "images/products/sofa03.jpg", material: "패브릭, 원목 다리", color: "크림",
    desc: "평소에는 1인 의자, 펼치면 75×190cm 간이 침대가 돼요. 친구가 자고 갈 때 유용해요." },
  { id: 18, name: "코너 수납 책장", cat: "storage", shape: "shelf", price: 159000, w: 45, d: 35, h: 185, weight: 24,
    easyMove: true, assemble: true, best: false, img: "images/products/shelf03.jpg", material: "E0 등급 MDF", color: "화이트",
    desc: "위는 선반, 아래는 서랍 3칸인 키 큰 책장이에요. 폭 45cm라 방 모서리나 문 옆에 두기 좋아요." },
  { id: 19, name: "편백 수납 싱글 침대", cat: "bed", shape: "bed", price: 349000, w: 105, d: 205, h: 85, weight: 52,
    easyMove: false, assemble: true, best: false, img: "images/products/bed02.jpg", material: "편백 원목", color: "내추럴 편백",
    desc: "은은한 편백 향이 나는 원목 침대예요. 아래 서랍 세 칸에 이불과 계절 옷을 넣어 둘 수 있어요." },
  { id: 20, name: "월넛 1서랍 책상", cat: "desk", shape: "desk", price: 179000, w: 120, d: 60, h: 75, weight: 22,
    easyMove: true, assemble: true, best: false, img: "images/products/desk03.jpg", material: "월넛 원목", color: "월넛",
    desc: "가늘게 깎은 원목 다리와 가운데 서랍 하나로 군더더기 없는 책상이에요. 다리를 풀면 상판만 남아 이사할 때 편해요." },
  { id: 21, name: "월넛 원형 식탁", cat: "table", shape: "table", price: 169000, w: 90, d: 90, h: 75, weight: 24,
    easyMove: true, assemble: true, best: false, img: "images/products/table06.jpg", material: "월넛 무늬목, 원목 다리", color: "월넛",
    desc: "지름 90cm라 두 명은 넉넉하게, 세 명까지 앉을 수 있어요. 다리 사이 십자 보강대로 흔들림이 적어요." },
  { id: 22, name: "원목 4인 원형 테이블", cat: "table", shape: "table", price: 259000, w: 110, d: 110, h: 75, weight: 38,
    easyMove: false, assemble: true, best: false, img: "images/products/table07.jpg", material: "소나무 원목", color: "내추럴 브라운",
    desc: "지름 110cm 두꺼운 원목 상판이라 식탁 겸 작업 테이블로 쓰기 좋아요. 투룸 거실처럼 여유 있는 공간에 추천해요." }
];

// 공간별 추천 조합 (메인, 핏 체크 > 공간별 추천에서 사용)
const ROOM_SETS = [
  { key: "oneroom", img: "images/rooms/room03.jpg", name: "원룸", size: "5~7평", room: "300×350cm", desc: "침대 + 책상 + 슬림 수납",
    tip: "침대를 벽에 붙이고 창가에 책상을 두면 가운데 동선이 넓게 남아요.", ids: [4, 1, 8],
    plan: '<rect x="8" y="8" width="104" height="84"/><rect x="8" y="8" width="34" height="56" class="f"/><rect x="82" y="8" width="30" height="16" class="f"/>' },
  { key: "officetel", img: "images/rooms/room04.jpg", name: "오피스텔", size: "7~9평", room: "320×420cm", desc: "소파베드 + 접이식 책상 + 선반",
    tip: "낮에는 소파베드를 접어 거실처럼 쓰고, 책상은 필요할 때만 펴서 써요.", ids: [6, 2, 7],
    plan: '<rect x="8" y="8" width="104" height="84"/><rect x="8" y="8" width="46" height="26" class="f"/><rect x="88" y="8" width="24" height="12" class="f"/><path d="M78 92V60h34"/>' },
  { key: "tworoom", img: "images/rooms/room05.jpg", name: "투룸 작은방", size: "방 3~4평", room: "270×320cm", desc: "슈퍼싱글 + 서랍장 + 사이드 테이블",
    tip: "작은방은 침대를 한쪽 구석에 두고, 서랍장으로 옷장을 대신하면 넓게 쓸 수 있어요.", ids: [4, 9, 12],
    plan: '<rect x="8" y="8" width="104" height="84"/><path d="M60 8v84"/><rect x="8" y="8" width="34" height="58" class="f"/><rect x="60" y="8" width="20" height="14" class="f"/>' }
];

// 기본 리뷰 (리뷰 쓰기 페이지에서 쓴 글은 localStorage에 추가 저장)
// photo: true면 사진 대신 상품 그림을 보여 줌
const REVIEWS = [
  { name: "지은", productId: 1, rating: 5, type: "oneroom", room: "300×350", date: "2026.11.10", photo: true,
    text: "창가 자리 폭이 125cm라 120cm 책상이 딱 들어갔어요. 핏 체크 아니었으면 140짜리 샀을 거예요." },
  { name: "민수", productId: 7, rating: 4, type: "officetel", room: "280×400", date: "2026.11.07", photo: true,
    text: "현관문 통과 걱정했는데 분해돼서 와서 편했어요. 조립은 혼자 30분 정도 걸렸어요." },
  { name: "하늘", productId: 4, rating: 5, type: "tworoom", room: "270×320", date: "2026.11.03", photo: true,
    text: "서랍 열 공간까지 생각해서 여유 있게 옵션으로 찾았더니 딱 맞았어요. 수납이 정말 많이 돼요." },
  { name: "도윤", productId: 11, rating: 4, type: "oneroom", room: "320×320", date: "2026.10.29", photo: false,
    text: "이사 갈 때도 접어서 들고 가면 돼서 이사 친화 배지 보고 샀어요." },
  { name: "서연", productId: 8, rating: 5, type: "oneroom", room: "290×330", date: "2026.10.25", photo: true,
    text: "침대 옆 30cm 틈에 넣으려고 샀는데 정말 딱 맞아요. 모서리가 둥글어서 밤에 부딪혀도 안 아파요." },
  { name: "준호", productId: 6, rating: 4, type: "officetel", room: "330×420", date: "2026.10.20", photo: false,
    text: "펼쳤을 때 길이까지 미리 확인하고 샀어요. 쿠션은 조금 단단한 편이에요." },
  { name: "유나", productId: 10, rating: 5, type: "tworoom", room: "300×360", date: "2026.10.14", photo: true,
    text: "원형이라 좁은 주방에서도 지나다니기 편해요. 색감이 사진이랑 똑같아요." },
  { name: "태민", productId: 3, rating: 3, type: "officetel", room: "300×400", date: "2026.10.08", photo: false,
    text: "디자인은 정말 예쁜데 오래 앉으면 등받이가 조금 낮게 느껴져요." }
];

// 기본 방명록 (방명록 쓰기 페이지에서 쓴 글은 localStorage "fitroom_guestbook"에 저장)
const GUESTBOOK_SEED = [
  { id: 3, name: "지은", text: "이런 사이트 기다렸어요! 치수로 찾는 게 진짜 편해요.", date: "2026.11.14", pw: "" },
  { id: 2, name: "민수", text: "책상 카테고리 상품이 더 늘어났으면 좋겠어요.", date: "2026.11.13", pw: "" },
  { id: 1, name: "하늘", text: "이사 친화 배지 덕분에 고르기 쉬웠어요.", date: "2026.11.12", pw: "" }
];

// 공지사항
const NOTICES = [
  { id: 5, tag: "이벤트", title: "첫 핏 체크 이벤트 - 치수 입력하고 3천원 쿠폰 받기", date: "2026.11.15", top: true,
    body: "11월 한 달 동안 핏 체크로 가구를 찾고 회원가입하시면 3,000원 할인 쿠폰을 드려요.\n쿠폰은 마이페이지에서 확인할 수 있어요." },
  { id: 4, tag: "배송", title: "11월 넷째 주 일부 지역 배송 지연 안내", date: "2026.11.12", top: false,
    body: "물량 증가로 제주·도서 지역 배송이 1~2일 늦어질 수 있어요.\n양해 부탁드립니다." },
  { id: 3, tag: "안내", title: "이사 친화 배지 기준이 바뀌었어요", date: "2026.11.05", top: false,
    body: "이제 '분해 가능 + 무게 25kg 이하' 두 가지를 모두 만족하는 가구에만 이사 친화 배지를 붙여요." },
  { id: 2, tag: "안내", title: "핏 체크에 '가구 돌려 놓기' 계산이 추가됐어요", date: "2026.10.28", top: false,
    body: "가구를 90도 돌려서 놓으면 들어가는 경우도 이제 결과에 함께 보여 드려요." },
  { id: 1, tag: "안내", title: "핏룸 오픈 안내", date: "2026.10.20", top: false,
    body: "내 방에 딱 맞는 가구를 치수로 찾는 쇼핑몰, 핏룸이 문을 열었어요.\n많이 이용해 주세요!" }
];

// 자주 묻는 질문
const FAQS = [
  { cat: "핏 체크", q: "치수는 어떻게 재야 하나요?", a: "가구를 놓을 자리의 가로(벽을 따라 잰 길이), 세로(벽에서 앞으로 나오는 깊이), 높이를 줄자로 재 주세요. 걸레받이나 콘센트처럼 튀어나온 부분이 있으면 그만큼 빼고 입력하는 게 좋아요." },
  { cat: "핏 체크", q: "'여유 있게' 옵션은 뭔가요?", a: "가구 사방에 5cm씩 여유를 두고 계산해요. 벽에 딱 붙이기 어렵거나 문, 서랍을 열 공간이 필요할 때 선택하세요." },
  { cat: "핏 체크", q: "가구를 돌려서 놓는 경우도 계산되나요?", a: "네. 가로와 세로를 바꿔서 놓았을 때 들어가는 가구도 결과에 함께 나와요." },
  { cat: "배송", q: "배송은 얼마나 걸리나요?", a: "결제 후 보통 3~5일 안에 도착해요. 대형 가구(침대, 소파)는 설치 기사님이 날짜를 맞춰 연락드려요." },
  { cat: "배송", q: "배송비는 얼마인가요?", a: "10만 원 이상 주문하면 무료 배송이고, 그보다 적으면 5,000원이 붙어요." },
  { cat: "배송", q: "엘리베이터가 없는 건물도 배송되나요?", a: "네, 배송돼요. 다만 3층 이상 계단으로 옮겨야 하는 대형 가구는 추가 비용이 생길 수 있어요." },
  { cat: "반품·교환", q: "받아 봤는데 크기가 안 맞으면 반품할 수 있나요?", a: "받은 날부터 7일 안에 조립하지 않은 상태라면 반품할 수 있어요. 고객센터 1:1 문의로 신청해 주세요." },
  { cat: "반품·교환", q: "반품 배송비는 누가 내나요?", a: "단순 변심이면 왕복 배송비를 고객님이, 상품 불량이나 오배송이면 핏룸이 부담해요." },
  { cat: "회원", q: "내 방 치수를 저장할 수 있나요?", a: "로그인 후 마이페이지 > 내 방 치수에서 저장할 수 있어요. 저장하면 메인과 핏 체크에 자동으로 채워져요." },
  { cat: "회원", q: "비밀번호를 잊어버렸어요.", a: "로그인 화면 아래 '아이디·비밀번호 찾기'에서 아이디와 이메일을 입력하면 새 비밀번호를 설정할 수 있어요." }
];

// 체험용 회원 (아이디: fitroom / 비밀번호: fit1234!)
const DEMO_MEMBER = {
  id: "fitroom", pw: "fit1234!", name: "김지은", email: "fitroom@test.com",
  phone: "010-1234-5678", roomType: "oneroom", joined: "2026.11.01"
};
