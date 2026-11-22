// 운 점수: 대운·세운·월운·일진 네 층을 각각 0~100으로 매긴 뒤 가중합.
// 같은 일진이라도 그 해·그 달·그 대운이 받쳐주지 않으면 높은 점수가 나오지 않는다.
import { BR, BR_KO, BR_EL, BR_MAIN, stemEl, tenGod, mod, pillarsAt, daewoonAt, monthsOfSajuYear, yearPillar,
  isClash, isHarmony, isWonjin, isHyung, isStemHap, isStemClash, pname } from "./core.js";
import { CALIB } from "./calib.js";
import { GROUP_OF_GOD, GWIN, MUNCHANG, YEOKMA, DOHWA, grpOfBranch } from "./analysis.js";

export const CATS = [
  { id: "total", name: "종합", t: "do", tip: "전체적인 운의 흐름" },
  { id: "money", name: "재물", t: "do", tip: "수입, 거래, 판매, 투자 기회" },
  { id: "work",  name: "일·성과", t: "do", tip: "추진, 성과, 직장·사업의 진전" },
  { id: "study", name: "학업·시험", t: "do", tip: "공부, 시험, 자격, 연구" },
  { id: "love",  name: "연애·인연", t: "do", tip: "이성 인연, 만남, 관계 진전" },
  { id: "doc",   name: "계약·문서", t: "do", tip: "계약, 서류, 공식 절차, 윗사람" },
  { id: "move",  name: "이동·변화", t: "do", tip: "이사, 여행, 이직, 새 환경" },
  { id: "health",name: "건강·안전", t: "ca", tip: "과로, 사고, 무리한 운동·운전" },
  { id: "talk",  name: "구설·마찰", t: "ca", tip: "말실수, 언쟁, 윗사람과의 충돌" },
  { id: "loss",  name: "손재·지출", t: "ca", tip: "충동구매, 빌려주기, 보증, 동업 갈등" }
];
export const GOOD = CATS.filter(c => c.t === "do" && c.id !== "total");
export const CARE = CATS.filter(c => c.t === "ca");

// 층별 가중치 (합 1). 5단계(80점 이상)는 네 층이 모두 좋아야 나온다.
export const LAYERS = [
  { id: "dw", name: "대운", w: 0.2 },
  { id: "yr", name: "세운", w: 0.25 },
  { id: "mo", name: "월운", w: 0.25 },
  { id: "dy", name: "일진", w: 0.3 }
];
export const GRADES = [
  { min: 80, lv: 5, name: "최상" },
  { min: 66, lv: 4, name: "좋음" },
  { min: 50, lv: 3, name: "보통" },
  { min: 35, lv: 2, name: "약함" },
  { min: 0,  lv: 1, name: "낮음" }
];
export const CARE_GRADES = [
  { min: 80, lv: 5, name: "매우 주의" },
  { min: 66, lv: 4, name: "주의" },
  { min: 50, lv: 3, name: "보통" },
  { min: 35, lv: 2, name: "낮음" },
  { min: 0,  lv: 1, name: "거의 없음" }
];
export const gradeOf = (score, care) => (care ? CARE_GRADES : GRADES).find(g => score >= g.min);

const GOD_PTS = {
  "비견": { work: 1.5, move: 1, loss: 1.5 },
  "겁재": { work: 1.5, loss: 3, talk: 1 },
  "식신": { money: 1.5, study: 1, work: 1, love: 0.5 },
  "상관": { talk: 3, work: 1.5, move: 1, love: 0.5 },
  "편재": { money: 3, move: 1.5, loss: 1 },
  "정재": { money: 2.5, doc: 1.5 },
  "편관": { work: 2, health: 3, talk: 1 },
  "정관": { work: 2.5, doc: 2.5 },
  "편인": { study: 3, health: 1, move: 0.5 },
  "정인": { study: 2.5, doc: 2 }
};

// 한 기둥(운)이 원국에 주는 영향 → 카테고리별 0~100
export function scorePillar(c, a, P, ctx = {}) {
  const ds = c.day[0];
  const raw = {}; CATS.forEach(k => raw[k.id] = 0);
  const why = [];
  const gS = tenGod(ds, P[0]), gB = tenGod(ds, BR_MAIN[P[1]]);
  const eS = stemEl(P[0]), eB = BR_EL[P[1]];
  const favS = a.fav[eS], favB = a.fav[eB];
  const add = (pts, w, fav) => {
    for (const k in pts) {
      const care = CARE.some(x => x.id === k);
      raw[k] += pts[k] * w * (care ? 1 - 0.35 * fav : 1 + 0.45 * fav);
    }
  };
  add(GOD_PTS[gS], 0.45, favS);
  add(GOD_PTS[gB], 0.65, favB);
  // 배우자 별: 남자는 재성, 여자는 관성
  const spouse = c.gender === "M" ? "jae" : "gwan";
  if (GROUP_OF_GOD[gS] === spouse) raw.love += 1.2;
  if (GROUP_OF_GOD[gB] === spouse) raw.love += 1.5;

  let total = 50 + 40 * (0.45 * favS + 0.55 * favB);
  const b = P[1], s = P[0];
  const spot = [["일지", c.day[1]], ["월지", c.month[1]], ["년지", c.year[1]]];
  if (c.hour) spot.push(["시지", c.hour[1]]);
  spot.forEach(([n, nb]) => {
    if (isClash(b, nb)) {
      why.push(`${n} ${BR[nb]}${wa(nb)} 충`);
      if (n === "일지") { raw.health += 1.5; raw.move += 1.5; raw.love -= 1; raw.talk += 0.5; total -= 7; }
      else if (n === "월지") { raw.move += 1; raw.work += 0.5; raw.talk += 0.8; total -= 5; }
      else { raw.move += 0.5; total -= 2; }
    }
    if (isHarmony(b, nb)) {
      why.push(`${n} ${BR[nb]}${wa(nb)} 합`);
      if (n === "일지") { raw.love += 2; raw.doc += 0.5; total += 5; }
      else if (n === "월지") { raw.work += 1; raw.doc += 1; total += 3; }
      else { raw.doc += 0.5; total += 1; }
    }
    if ((n === "일지" || n === "월지") && isWonjin(b, nb)) { why.push(`${n} ${BR[nb]}${wa(nb)} 원진`); raw.talk += 1.2; raw.love -= 0.5; total -= 2; }
    if ((n === "일지" || n === "월지") && isHyung(b, nb)) { why.push(`${n} ${BR[nb]}${wa(nb)} ${b === nb ? "자형" : "형"}`); raw.health += 1; raw.talk += 1; total -= 3; }
  });
  if (isStemHap(s, ds)) { why.push("일간과 천간합"); raw.love += 1; raw.doc += 0.5; total += 2; }
  if (isStemClash(s, ds)) { why.push("일간과 천간충"); raw.health += 0.5; raw.talk += 0.5; total -= 4; }
  if (GWIN[ds].includes(b)) { why.push("천을귀인"); raw.doc += 1.5; raw.money += 0.8; raw.health -= 0.5; total += 5; }
  if (MUNCHANG[ds] === b) { why.push("문창귀인"); raw.study += 2; }
  const g1 = grpOfBranch(c.year[1]), g2 = grpOfBranch(c.day[1]);
  if (b === YEOKMA[g1] || b === YEOKMA[g2]) { why.push("역마"); raw.move += 2; }
  if (b === DOHWA[g1] || b === DOHWA[g2]) { why.push("도화"); raw.love += 2; }
  // 윗 층과의 충돌 (일진↔세운, 월운↔세운, 세운↔대운)
  if (ctx.upper && isClash(b, ctx.upper[1])) {
    why.push(`${ctx.upperName} ${BR[ctx.upper[1]]}${wa(ctx.upper[1])} 충`);
    raw.health += 1; raw.talk += 0.5; raw.move += 0.5; total -= 4;
  }

  const base = (favS * 0.45 + favB * 0.55 + 1) / 2; // 0~1
  const v = { total: total / 100 };
  CATS.forEach(k => {
    if (k.id === "total") return;
    const r = 1 - Math.exp(-Math.max(0, raw[k.id]) / 2.5);
    v[k.id] = k.t === "ca" ? r : 0.3 * base + 0.7 * r;
  });
  return { v, s: calibrate("one", v), why, gS, gB, favS, favB };
}
const wa = b => { const c = BR_KO[b].charCodeAt(0); return (c - 0xac00) % 28 ? "과" : "와"; };
const clamp = v => Math.max(0, Math.min(100, Math.round(v)));

// 대운이 시작되기 전에는 월주를 대운 자리로 쓴다
export function dwPillar(c, ms) {
  const d = daewoonAt(c, ms);
  return d ? { pillar: d.pillar, age: d.age, pre: false } : { pillar: c.month, age: 0, pre: true };
}

export function combineRaw(layers, ids) {
  const ws = LAYERS.filter(l => ids.includes(l.id));
  const wsum = ws.reduce((a, l) => a + l.w, 0);
  const v = {};
  CATS.forEach(k => { v[k.id] = ws.reduce((a, l) => a + layers[l.id].v[k.id] * l.w, 0) / wsum; });
  return v;
}
// 원점수 → 0~100. 무작위 사주·날짜 수만 건을 돌려 얻은 분포로 보정(calib.js)해서,
// 같은 점수는 어느 해·어느 사람이든 같은 드묾을 뜻한다.
export function calibrate(level, v) {
  const out = {};
  CATS.forEach(k => {
    const knots = CALIB[level] && CALIB[level][k.id];
    if (!knots) { out[k.id] = Math.round(Math.max(0, Math.min(1, v[k.id])) * 100); return; }
    out[k.id] = Math.round(interp(knots, v[k.id]));
  });
  return out;
}
const TARGET = [0, 20, 35, 50, 66, 80, 92, 100];
function interp(knots, x) {
  if (x <= knots[0]) return 0;
  for (let i = 1; i < knots.length; i++) {
    if (x <= knots[i]) return TARGET[i - 1] + (TARGET[i] - TARGET[i - 1]) * (x - knots[i - 1]) / ((knots[i] - knots[i - 1]) || 1);
  }
  return 100;
}
function combine(layers, ids, level) { return calibrate(level, combineRaw(layers, ids)); }

// 하루 점수: 네 층 모두
const caches = new WeakMap();
export function dayFortune(c, a, y, m, d) {
  if (!caches.has(c)) caches.set(c, new Map());
  const dayCache = caches.get(c);
  const key = `${y}-${m}-${d}`;
  if (dayCache.has(key)) return dayCache.get(key);
  const P = pillarsAt(y, m, d);
  const dw = dwPillar(c, Date.UTC(y, m - 1, d));
  const layers = {
    dw: scorePillar(c, a, dw.pillar),
    yr: scorePillar(c, a, P.year, { upper: dw.pillar, upperName: "대운" }),
    mo: scorePillar(c, a, P.month, { upper: P.year, upperName: "세운" }),
    dy: scorePillar(c, a, P.day, { upper: P.year, upperName: "세운" })
  };
  const s = combine(layers, ["dw","yr","mo","dy"], "day");
  const r = { y, m, d, P, dw, layers, s };
  dayCache.set(key, r);
  return r;
}

// 한 달(월운) 점수: 대운·세운·월운
export function monthFortune(c, a, mo) {
  const mid = mo.start + (mo.end - mo.start) / 2;
  const ms = (mid - 2440587.5) * 86400000;
  const dw = dwPillar(c, ms);
  const yp = mo.year;
  const layers = {
    dw: scorePillar(c, a, dw.pillar),
    yr: scorePillar(c, a, yp, { upper: dw.pillar, upperName: "대운" }),
    mo: scorePillar(c, a, mo.pillar, { upper: yp, upperName: "세운" })
  };
  return { mo, dw, layers, s: combine(layers, ["dw","yr","mo"], "month") };
}

// 한 해(세운) 점수: 대운·세운 (해 중간 시점의 대운 기준)
export function yearFortune(c, a, Y) {
  const ms = Date.UTC(Y, 7, 1);
  const dw = dwPillar(c, ms);
  const yp = yearPillar(Y);
  const layers = { dw: scorePillar(c, a, dw.pillar), yr: scorePillar(c, a, yp, { upper: dw.pillar, upperName: "대운" }) };
  return { Y, pillar: yp, dw, layers, s: combine(layers, ["dw","yr"], "year") };
}

// 대운 하나의 점수
export function daewoonFortune(c, a, d) {
  const layer = scorePillar(c, a, d.pillar);
  return { d, layer, s: layer.s };
}

// 오늘부터 n개월 동안의 월운 목록
export function upcomingMonths(c, a, y, m, d, n = 24) {
  const now = pillarsAt(y, m, d);
  const out = [];
  let Y = now.sajuYear, i = now.tIdx;
  while (out.length < n) {
    const ms = monthsOfSajuYear(Y);
    for (; i < 12 && out.length < n; i++) out.push(monthFortune(c, a, ms[i]));
    Y++; i = 0;
  }
  return out;
}
