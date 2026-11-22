// 사람들이 많이 찾는 읽을거리: 일주론, 행운 정보, 좋은 시간, 이번 주, 월별 운세 문장, 궁합
import { STEM, STEM_KO, BR, BR_KO, ANIMAL, EL_KO, EL_HAN, BR_EL, BR_MAIN, mod, stemEl, tenGod, pname, pko,
  isClash, isHarmony, isWonjin, isHyung, isStemHap, computeChart, monthsOfSajuYear, pillarsAt } from "./core.js";
import { analyze, stageOf, GROUP_OF_GOD, GROUP_KO, GWIN, grpOfBranch, DOHWA, YEOKMA, groupElement } from "./analysis.js";
import { scorePillar, gradeOf, dayFortune, monthFortune, GOOD, CARE } from "./fortune.js";
import { DM, GOD, STAGE_TXT, BOOST, ELX } from "./reading.js";

const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1); return (c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28) ? a : b; };
const P = arr => arr.filter(Boolean).map(x => `<p>${x}</p>`).join("");
const COLOR_WORD = ["푸른", "붉은", "누런", "하얀", "검은"];
const ANIMAL_IMG = ["물가의 쥐처럼 영리하고 눈치가 빠른", "묵묵히 밭을 가는 소처럼 성실한", "숲의 호랑이처럼 당당한", "풀밭의 토끼처럼 섬세하고 재빠른", "구름을 부르는 용처럼 스케일이 큰", "똬리 튼 뱀처럼 신중하고 깊은", "들판을 달리는 말처럼 활동적인", "온순한 양처럼 부드럽지만 고집 있는", "재주 많은 원숭이처럼 영리한", "새벽을 알리는 닭처럼 꼼꼼하고 깔끔한", "집을 지키는 개처럼 의리 있는", "넉넉한 돼지처럼 복을 모으는"];

// 일지 십신 = 생활 속 나, 배우자 자리
const DZ_GOD = {
  "비견": { me: "집에서도 내 방식이 분명하고, 혼자 해결하려는 독립심이 강해요.", love: "연인과도 친구처럼 동등한 관계를 원해요. 간섭받는 걸 싫어하고, 각자의 시간을 존중해 주는 사람과 잘 맞아요." },
  "겁재": { me: "승부욕과 자존심이 생활 곳곳에 드러나요. 손해 보는 걸 특히 못 참는 편이에요.", love: "좋아하면 적극적이고 질투도 있는 편이에요. 경쟁 상대가 생기면 오히려 마음이 커져요." },
  "식신": { me: "먹고 즐기는 데 진심이고, 생활에 여유와 취미가 있어야 행복한 사람이에요.", love: "다정하고 잘 챙겨주는 연애를 해요. 같이 맛집 다니고 편하게 노는 관계가 오래가요." },
  "상관": { me: "말솜씨와 감각이 좋고, 불합리한 걸 그냥 넘기지 못해요.", love: "표현이 솔직하고 재미있는 연인이에요. 대신 서운하면 말이 날카로워지니, 다툼 뒤 먼저 풀어주는 습관이 관계를 지켜요." },
  "편재": { me: "활동 반경이 넓고 사람을 잘 사귀어요. 돈 감각이 빠르고 스케일이 커요.", love: "통이 크고 이벤트를 잘하는 연애를 해요. 인기가 있는 편이라 한 사람에게 마음을 정하는 게 숙제예요." },
  "정재": { me: "알뜰하고 계획적이에요. 생활이 정돈되어 있어야 마음이 편해요.", love: "한 사람에게 성실한 연애를 해요. 현실적으로 미래를 같이 그릴 수 있는 사람을 원해요." },
  "편관": { me: "스스로에게 엄격하고 책임감이 강해요. 압박 속에서 더 집중하는 타입이에요.", love: "강하고 믿음직한 사람에게 끌려요. 관계에서 긴장감이 있을 수 있지만, 서로 지켜주는 관계가 되면 단단해요." },
  "정관": { me: "반듯하고 예의 바르며 원칙을 지켜요. 남의 시선과 체면도 신경 쓰는 편이에요.", love: "믿을 수 있는 사람과 안정적인 연애를 원해요. 결혼을 진지하게 생각하는 편이에요." },
  "편인": { me: "혼자만의 세계와 생각이 깊어요. 남들이 안 하는 분야에 끌리고 직관이 좋아요.", love: "말보다 마음이 통하는 사람을 원해요. 혼자 있는 시간이 꼭 필요해서, 그걸 이해해 주는 사람과 맞아요." },
  "정인": { me: "배우는 걸 좋아하고 마음이 따뜻해요. 주변의 도움을 잘 받는 복이 있어요.", love: "보살핌을 주고받는 포근한 연애를 해요. 정서적으로 기댈 수 있는 사람에게 마음이 가요." }
};

// ---------- 일주론 ----------
export function iljuReading(c) {
  const [s, b] = c.day, se = stemEl(s), dm = DM[s];
  const god = tenGod(s, BR_MAIN[b]), stage = stageOf(s, b);
  const name = `${COLOR_WORD[se]} ${ANIMAL[b]}`;
  const tags = [];
  if (stemEl(s) === BR_EL[b]) tags.push(["간여지동", "천간과 지지가 같은 오행이라 주관이 아주 뚜렷하고 고집이 셉니다. 남에게 휘둘리지 않는 대신, 배우자와는 서로의 영역을 나눠 두는 게 좋아요."]);
  if (["庚辰","庚戌","壬辰","壬戌","戊戌"].includes(pname(c.day))) tags.push(["괴강", "극단적으로 강한 기운이에요. 리더십과 카리스마가 있고, 큰일을 맡을수록 빛나요. 대신 타협이 어려워 적을 만들기 쉬워요."]);
  if (["甲辰","乙未","丙戌","丁丑","戊辰","壬戌","癸丑"].includes(pname(c.day))) tags.push(["백호", "기운이 세고 추진력이 강해요. 전문 분야에서 크게 쓰이는 기운이고, 평소 안전과 건강을 챙기면 좋아요."]);
  if (GWIN[s].includes(b)) tags.push(["일귀", "배우자 자리에 천을귀인이 있어요. 어려울 때 돕는 사람이 곁에 있고, 배우자 덕을 보는 사주로 봐요."]);
  if ([0,3,6,9].includes(b)) tags.push(["도화", "배우자 자리에 도화가 있어 사람을 끄는 매력이 있어요. 외모나 분위기에 신경 쓰는 편이에요."]);
  if ([2,5,8,11].includes(b)) tags.push(["역마", "배우자 자리에 역마가 있어 이동·여행·해외와 인연이 깊어요. 한곳에 오래 머물면 답답해해요."]);
  if ([1,4,7,10].includes(b)) tags.push(["화개", "배우자 자리에 화개가 있어 학문·예술·종교적 깊이가 있어요. 혼자만의 시간이 꼭 필요해요."]);
  const lucky = [mod(b + 4, 12), mod(b + 8, 12)], six = mod(1 - b, 12), clash = mod(b + 6, 12);
  return {
    name, title: `${pname(c.day)} 일주 · ${name}`,
    html: `<p class="lead">${STEM[s]}${BR[b]}(${STEM_KO[s]}${BR_KO[b]}) 일주는 <b>${name}</b>이에요. ${ANIMAL_IMG[b]} 기질에 ${dm.img}의 성품이 얹혀 있어요.</p>` +
      P([
        `<b>겉모습</b> · ${dm.core}`,
        `<b>속마음과 생활</b> · 배우자 자리인 일지에 ${god}${josa(god, "이", "가")} 있어요. ${DZ_GOD[god].me}`,
        `<b>12운성 ${stage}</b> · ${STAGE_TXT[stage]}. 일상의 에너지가 이런 결로 드러나요.`,
        `<b>연애할 때</b> · ${DZ_GOD[god].love}`
      ]) +
      (tags.length ? `<div class="tags">${tags.map(([t, d]) => `<p><span class="badge">${t}</span> ${d}</p>`).join("")}</div>` : "") +
      `<div class="advice"><b>잘 맞는 띠·일지</b>${ANIMAL[six]}(${BR[six]}) — 육합으로 끌리는 인연. ${lucky.map(x => `${ANIMAL[x]}(${BR[x]})`).join(", ")} — 삼합으로 손발이 잘 맞아요. <br>${ANIMAL[clash]}(${BR[clash]})와는 충이라 처음엔 끌려도 생활 방식이 부딪히기 쉬워요.</div>`
  };
}

// ---------- 행운 정보 ----------
const EL_NUM = [[3, 8], [2, 7], [5, 10], [4, 9], [1, 6]];
const EL_FOOD = ["신맛 — 새싹채소, 레몬, 매실", "쓴맛 — 커피, 다크초콜릿, 쑥", "단맛 — 고구마, 호박, 꿀", "매운맛 — 생강, 무, 양파", "짠맛 — 해산물, 미역, 검은콩"];
const EL_ITEM = ["나무 소재 소품, 식물", "캔들, 따뜻한 조명", "도자기, 흙빛 가죽", "금속 액세서리, 시계", "유리병 물, 검은 다이어리"];
export function luckyToday(c, a, P) {
  // 용신 + 오늘 들어온 오행 중 반가운 것
  const dayEls = [stemEl(P.day[0]), BR_EL[P.day[1]]];
  const good = [0,1,2,3,4].sort((x, y) => a.fav[y] - a.fav[x]);
  const main = a.yongEl, second = good.find(e => e !== main);
  const n = EL_NUM[main], n2 = EL_NUM[second];
  const helpToday = dayEls.some(e => a.fav[e] > 0.3);
  return { main, second, color: BOOST[main].color, dir: BOOST[main].dir, nums: [n[0], n2[1]], food: EL_FOOD[main], item: EL_ITEM[main], helpToday };
}

// ---------- 시간대별 운 ----------
const HOUR_LABEL = ["23:30~01:30","01:30~03:30","03:30~05:30","05:30~07:30","07:30~09:30","09:30~11:30","11:30~13:30","13:30~15:30","15:30~17:30","17:30~19:30","19:30~21:30","21:30~23:30"];
export function hoursOfDay(c, a, P) {
  const ds0 = P.day[0];
  return BR.map((_, hb) => {
    const hp = [mod((ds0 % 5) * 2 + hb, 10), hb];
    const r = scorePillar(c, a, hp, { upper: P.day, upperName: "일진" });
    return { hb, pillar: hp, label: HOUR_LABEL[hb], s: r.s, god: tenGod(c.day[0], BR_MAIN[hb]), why: r.why };
  });
}

// ---------- 하루 한마디 ----------
const DAY_KEY = {
  "비견": ["독립", "내 페이스", "동료"], "겁재": ["승부", "과감함", "지출 조심"], "식신": ["여유", "맛있는 것", "결과물"],
  "상관": ["아이디어", "말조심", "표현"], "편재": ["기회", "움직임", "사람"], "정재": ["정리", "성실", "마무리"],
  "편관": ["압박", "결단", "정면 돌파"], "정관": ["원칙", "인정", "공식 업무"], "편인": ["몰입", "직관", "혼자 시간"], "정인": ["배움", "도움", "휴식"]
};
export const dayKeywords = god => DAY_KEY[god];

// ---------- 월별 운세 문장 ----------
const MONTH_TXT = {
  "비견": "내 힘으로 밀고 나가는 달. 협업보다 혼자 하는 일이 잘 풀리고, 돈은 나눠 나가기 쉬워요.",
  "겁재": "경쟁과 승부의 달. 추진력은 좋지만 충동 지출과 동업 문제를 조심하세요.",
  "식신": "여유와 결과물의 달. 꾸준히 해 온 일이 모양을 갖추고, 몸과 마음이 편안해요.",
  "상관": "아이디어가 넘치는 달. 새로운 시도엔 좋지만 윗사람·규칙과 부딪히지 않게 말을 다듬으세요.",
  "편재": "기회가 움직이는 달. 사람을 만나고 시장에 나가면 돈 될 일이 보여요. 큰 결제는 한 번 더 따져보기.",
  "정재": "차곡차곡 쌓는 달. 정리·저축·마무리에 좋고, 성실하게 한 만큼 돌아와요.",
  "편관": "압박과 시험의 달. 일이 몰리지만 정면으로 처리하면 실력이 붙어요. 무리한 운동·운전은 조심.",
  "정관": "인정받는 달. 서류·계약·면접처럼 공식적인 일이 잘 풀려요.",
  "편인": "몰입과 연구의 달. 혼자 깊게 파는 공부에 좋고, 기분이 가라앉지 않게 산책을 챙기세요.",
  "정인": "배움과 회복의 달. 공부·자격·문서운이 좋고, 주변의 도움을 받기 쉬워요."
};
export function monthLines(c, a, Y) {
  return monthsOfSajuYear(Y).map(mo => {
    const f = monthFortune(c, a, mo);
    const gb = tenGod(c.day[0], BR_MAIN[mo.pillar[1]]);
    const best = GOOD.slice().sort((x, y) => f.s[y.id] - f.s[x.id])[0];
    const care = CARE.slice().sort((x, y) => f.s[y.id] - f.s[x.id])[0];
    const notes = f.layers.mo.why.filter(w => /충|합|귀인|역마|도화/.test(w)).slice(0, 2);
    return { mo, f, gb, txt: MONTH_TXT[gb], best, care, notes };
  });
}

// ---------- 궁합 ----------
const STEM_REL = {
  "비견": "같은 기운끼리라 친구처럼 편해요. 대화가 잘 통하지만, 둘 다 고집을 세우면 평행선을 달려요.",
  "겁재": "비슷하면서도 경쟁하는 관계예요. 자극이 되지만 주도권 다툼이 생기기 쉬워요.",
  "식신": "내가 상대를 편하게 챙겨주는 관계예요. 함께 있으면 여유롭고 즐거워요.",
  "상관": "내가 상대에게 솔직하게 표현하는 관계예요. 재밌지만 말이 지나치면 상대가 상처받을 수 있어요.",
  "편재": "내가 상대를 이끌고 넓게 챙기는 관계예요. 활동적인 데이트가 잘 맞아요.",
  "정재": "내가 상대를 아끼고 책임지는 관계예요. 안정적이고 현실적인 커플이에요.",
  "편관": "상대가 나를 강하게 이끄는 관계예요. 긴장감과 끌림이 함께 있어요.",
  "정관": "상대가 나를 바로잡아 주는 든든한 관계예요. 신뢰가 쌓이는 궁합이에요.",
  "편인": "상대가 나를 독특하게 이해해 주는 관계예요. 깊은 대화가 통하지만 거리감이 생길 때도 있어요.",
  "정인": "상대가 나를 품어 주는 관계예요. 편안하고 기대고 싶은 사람이에요."
};
export function compatibility(p1, p2) {
  const c1 = computeChart(p1), c2 = computeChart(p2), a1 = analyze(c1), a2 = analyze(c2);
  let score = 60;
  const good = [], care = [];
  const g12 = tenGod(c1.day[0], c2.day[0]), g21 = tenGod(c2.day[0], c1.day[0]);
  if (isStemHap(c1.day[0], c2.day[0])) { score += 12; good.push(`일간 ${STEM[c1.day[0]]}·${STEM[c2.day[0]]} 천간합 — 서로 자연스럽게 끌리는, 궁합에서 가장 반가운 조합이에요.`); }
  const spouse1 = c1.gender === "M" ? "jae" : "gwan";
  if (c1.gender !== c2.gender && GROUP_OF_GOD[g12] === spouse1) { score += 6; good.push(`상대 일간이 나에게 ${g12}${josa(g12, "이에요", "예요")}. 내 사주에서 배우자 별에 해당해서 연인·배우자로 자연스러운 자리예요.`); }
  if (["편관", "상관"].includes(g12) || ["편관", "상관"].includes(g21)) { score -= 4; care.push(`한쪽이 다른 쪽에게 ${["편관","상관"].includes(g12) ? g12 : g21}의 관계라, 말투와 주도권에서 긴장이 생기기 쉬워요.`); }
  const d1 = c1.day[1], d2 = c2.day[1];
  if (isHarmony(d1, d2)) { score += 10; good.push(`일지 ${BR[d1]}·${BR[d2]} 육합 — 생활 리듬과 정서가 잘 맞물려요. 함께 살기 좋은 궁합이에요.`); }
  if (grpOfBranch(d1) === grpOfBranch(d2) && d1 !== d2) { score += 6; good.push(`일지 ${BR[d1]}·${BR[d2]} 삼합 — 같은 목표를 향해 손발이 잘 맞아요.`); }
  if (isClash(d1, d2)) { score -= 12; care.push(`일지 ${BR[d1]}·${BR[d2]} 충 — 끌림은 강하지만 생활 방식이 정반대일 수 있어요. 서로의 공간과 방식을 인정하는 게 핵심이에요.`); }
  if (isWonjin(d1, d2)) { score -= 7; care.push(`일지 ${BR[d1]}·${BR[d2]} 원진 — 이유 없이 서운함이 쌓이기 쉬워요. 작은 것도 말로 확인하는 습관이 필요해요.`); }
  if (isHyung(d1, d2) && d1 !== d2) { score -= 5; care.push(`일지 ${BR[d1]}·${BR[d2]} 형 — 사소한 규칙과 예의에서 마찰이 나기 쉬워요.`); }
  const y1 = c1.year[1], y2 = c2.year[1];
  const tti = `${ANIMAL[y1]}띠와 ${ANIMAL[y2]}띠`;
  if (isHarmony(y1, y2) || (grpOfBranch(y1) === grpOfBranch(y2) && y1 !== y2)) { score += 4; good.push(`${tti}는 ${isHarmony(y1, y2) ? "육합" : "삼합"}으로 잘 맞는 띠 궁합이에요. 서로의 집안·주변 사람과도 무난해요.`); }
  if (isClash(y1, y2)) { score -= 4; care.push(`${tti}는 충이라 집안 분위기나 가치관 차이가 드러날 수 있어요.`); }
  if (isWonjin(y1, y2)) { score -= 3; care.push(`${tti}는 원진 관계라 사소한 오해가 쌓이지 않게 조심하세요.`); }
  // 오행 보완
  const share = (a, e) => a.wEl[e] / a.wEl.reduce((x, y) => x + y, 0);
  const fill12 = share(a2, a1.yongEl), fill21 = share(a1, a2.yongEl);
  if (fill12 >= 0.25) { score += 7; good.push(`상대 사주에 나의 용신 ${ELX(a1.yongEl)} 기운이 많아요. 함께 있으면 내가 편해지고 힘을 얻어요.`); }
  if (fill21 >= 0.25) { score += 7; good.push(`내 사주에 상대의 용신 ${ELX(a2.yongEl)} 기운이 많아요. 내가 상대에게 힘이 되어 주는 사람이에요.`); }
  const gi1 = +Object.keys(a1.role).find(e => a1.role[e] === "기신");
  if (share(a2, gi1) >= 0.3) { score -= 5; care.push(`상대 사주에 나에게 부담되는 ${ELX(gi1)} 기운이 많아요. 오래 붙어 있으면 지치는 순간이 있을 수 있으니 각자의 시간을 챙기세요.`); }
  score = Math.max(20, Math.min(98, Math.round(score)));
  const verdict = score >= 85 ? "아주 잘 맞는 궁합이에요." : score >= 72 ? "잘 맞는 편이에요. 좋은 점을 살리면 오래가요." : score >= 58 ? "무난한 궁합이에요. 노력에 따라 충분히 좋아져요." : "부딪힐 지점이 있는 궁합이에요. 차이를 알고 맞춰 가면 오히려 단단해질 수 있어요.";
  return { c1, c2, a1, a2, score, verdict, good, care, g12, g21 };
}
export function compatHtml(r, n1, n2) {
  return `<div class="compat-head"><div><span class="hj">${pname(r.c1.day)}</span><small>${n1}</small></div><b>${r.score}</b><div><span class="hj">${pname(r.c2.day)}</span><small>${n2}</small></div></div>
    <p class="lead" style="text-align:center">${r.verdict}</p>` +
    P([`<b>${n1} 입장에서</b> · ${STEM_REL[r.g12]}`, `<b>${n2} 입장에서</b> · ${STEM_REL[r.g21]}`]) +
    (r.good.length ? `<h4>잘 맞는 점</h4><ul class="notes">${r.good.map(x => `<li>${x}</li>`).join("")}</ul>` : "") +
    (r.care.length ? `<h4>맞춰 가야 할 점</h4><ul class="notes ca">${r.care.map(x => `<li>${x}</li>`).join("")}</ul>` : "") +
    `<p class="muted small">일간·일지·띠의 합충과 서로의 용신 보완을 기준으로 본 궁합이에요.</p>`;
}
