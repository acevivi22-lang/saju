// 만세력 계산 핵심: 절기(태양 황경), 사주 네 기둥, 대운, 월운 목록
export const STEM = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
export const STEM_KO = ["갑","을","병","정","무","기","경","신","임","계"];
export const BR = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
export const BR_KO = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
export const ANIMAL = ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
export const EL_KO = ["목","화","토","금","수"];
export const EL_HAN = ["木","火","土","金","水"];
export const BR_EL = [4,2,0,0,2,1,1,2,3,3,2,4];
export const BR_MAIN = [9,5,0,1,4,2,3,5,6,7,4,8];          // 지장간 정기
export const HIDDEN = [[8,9],[9,7,5],[4,2,0],[0,1],[1,9,4],[4,6,2],[2,5,3],[3,1,5],[4,8,6],[6,7],[7,3,4],[4,0,8]]; // 여기·중기·정기
export const TERM = ["입춘","경칩","청명","입하","망종","소서","입추","백로","한로","입동","대설","소한"];

export const mod = (a, n) => ((a % n) + n) % n;
export const stemEl = s => Math.floor(s / 2);
export const pname = p => `${STEM[p[0]]}${BR[p[1]]}`;
export const pko = p => `${STEM_KO[p[0]]}${BR_KO[p[1]]}`;
export const sixty = (s, b) => mod(6 * s - 5 * b, 60);
export const fromSixty = n => [mod(n, 10), mod(n, 12)];

const GOD_TABLE = [["비견","겁재"],["식신","상관"],["편재","정재"],["편관","정관"],["편인","정인"]];
export function tenGod(day, other) {
  const r = mod(stemEl(other) - stemEl(day), 5), same = (day % 2) === (other % 2);
  return GOD_TABLE[r][same ? 0 : 1];
}

// ---------- 천문 ----------
export const jdFromMs = ms => ms / 86400000 + 2440587.5;
export function sunLong(jd) {
  const T = (jd - 2451545) / 36525, rad = Math.PI / 180;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * rad;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
  const om = (125.04 - 1934.136 * T) * rad;
  return mod(L0 + C - 0.00569 - 0.00478 * Math.sin(om), 360);
}
export const termIdx = jd => Math.floor(mod(sunLong(jd + 69 / 86400) - 315, 360) / 30); // 0 = 寅월(입춘~)

// dir=+1: 다음 절기 시작 jd, dir=-1: 지금 절기가 시작된 jd
export function findTerm(jd, dir) {
  const start = termIdx(jd); let a = jd, b = jd;
  for (let i = 0; i < 80; i++) { b = a + dir * 0.5; if (termIdx(b) !== start) break; a = b; }
  let lo = Math.min(a, b), hi = Math.max(a, b);
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2, inStart = termIdx(m) === start;
    if (dir > 0) { inStart ? lo = m : hi = m; } else { inStart ? hi = m : lo = m; }
  }
  return hi;
}
export function jdToKST(jd) {
  const d = new Date((jd - 2440587.5) * 86400000 + 9 * 3600000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), min: d.getUTCMinutes() };
}
export const jdnOf = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / 86400000) + 2440588;
export const dayPillarJDN = j => [mod(j + 9, 10), mod(j + 1, 12)];
export const yearPillar = Y => [mod(Y - 4, 10), mod(Y - 4, 12)];

function yearMonth(jd, calY, calM) {
  const t = termIdx(jd); let y = calY;
  if (calM <= 2 && t >= 10) y = calY - 1;
  const ys = mod(y - 4, 10), yb = mod(y - 4, 12);
  const ms = mod((ys % 5) * 2 + 2 + t, 10), mb = mod(t + 2, 12);
  return { sajuYear: y, year: [ys, yb], month: [ms, mb], tIdx: t };
}

function isKoreaDST(y, m, d, h) {
  const v = y * 1e6 + m * 1e4 + d * 100 + h;
  return (y === 1987 && v >= 1987051002 && v < 1987101103) || (y === 1988 && v >= 1988050802 && v < 1988100903);
}

// 원국 + 대운
export function computeChart(p) {
  const [Y, M, D] = p.date.split("-").map(Number);
  let hh = 12, mm = 0;
  if (!p.noTime && p.time) [hh, mm] = p.time.split(":").map(Number);
  let localMin = hh * 60 + mm;
  if (!p.noTime && isKoreaDST(Y, M, D, hh)) localMin -= 60;
  const jd = jdFromMs(Date.UTC(Y, M - 1, D, 0, 0) + (localMin - 540) * 60000);
  const ym = yearMonth(jd, Y, M);
  const corr = Math.round((p.lng - 135) * 4); // 진태양시 보정(분)
  const sd = new Date(Date.UTC(Y, M - 1, D, 0, 0) + (localMin + corr) * 60000);
  const sy = sd.getUTCFullYear(), sm = sd.getUTCMonth() + 1, sdd = sd.getUTCDate(), smin = sd.getUTCHours() * 60 + sd.getUTCMinutes();
  let jdn = jdnOf(sy, sm, sdd), hourStemDay;
  if (smin >= 23 * 60) { if (!p.yaja) jdn += 1; hourStemDay = dayPillarJDN(jdnOf(sy, sm, sdd) + 1)[0]; }
  else hourStemDay = dayPillarJDN(jdn)[0];
  const day = dayPillarJDN(jdn);
  let hour = null;
  if (!p.noTime) { const hb = Math.floor(mod(smin + 60, 1440) / 120); hour = [mod((hourStemDay % 5) * 2 + hb, 10), hb]; }
  const yangYear = ym.year[0] % 2 === 0;
  const forward = (yangYear && p.gender === "M") || (!yangYear && p.gender === "F");
  const tj = findTerm(jd, forward ? 1 : -1);
  const days = Math.abs(tj - jd);
  const startAge = Math.min(10, Math.max(1, Math.round(days / 3)));
  const mIdx = sixty(ym.month[0], ym.month[1]);
  const daewoon = [];
  for (let k = 1; k <= 10; k++) daewoon.push({ pillar: fromSixty(mIdx + (forward ? k : -k)), age: startAge + 10 * (k - 1) });
  return { birthMs: Date.UTC(Y, M - 1, D), birthYear: Y, year: ym.year, month: ym.month, day, hour, forward, startAge, daysToTerm: days, daewoon, corr, gender: p.gender };
}

// 어떤 날짜(한국 정오 기준)의 세운·월운·일진
export function pillarsAt(y, m, d) {
  const jd = jdFromMs(Date.UTC(y, m - 1, d, 3, 0));
  const ym = yearMonth(jd, y, m);
  return { year: ym.year, month: ym.month, day: dayPillarJDN(jdnOf(y, m, d)), tIdx: ym.tIdx, sajuYear: ym.sajuYear, jd };
}
export function termRangeAt(y, m, d) {
  const jd = jdFromMs(Date.UTC(y, m - 1, d, 3, 0));
  return { start: findTerm(jd, -1), end: findTerm(jd, 1) };
}

// 사주 연도 Y(입춘~다음 입춘)의 12개 월운
const monthCache = new Map();
export function monthsOfSajuYear(Y) {
  if (monthCache.has(Y)) return monthCache.get(Y);
  let s = findTerm(jdFromMs(Date.UTC(Y, 1, 15, 3)), -1); // 입춘
  const out = [];
  for (let i = 0; i < 12; i++) {
    const e = findTerm(s + 1, 1);
    const k = jdToKST(s + 1);
    const ym = yearMonth(s + 1, k.y, k.m);
    out.push({ idx: i, sajuYear: Y, pillar: ym.month, year: ym.year, start: s, end: e, term: TERM[i], startDate: jdToKST(s), endDate: jdToKST(e) });
    s = e;
  }
  monthCache.set(Y, out);
  return out;
}

// 만 나이 기준 현재 대운 (시작 전이면 null)
export function daewoonAt(c, ms) {
  const age = (ms - c.birthMs) / (365.2425 * 86400000);
  let cur = null;
  c.daewoon.forEach(d => { if (age >= d.age) cur = d; });
  return cur;
}
export const isClash = (a, b) => Math.abs(a - b) === 6;
export const isHarmony = (a, b) => mod(a + b, 12) === 1;
export const isWonjin = (a, b) => [[0,7],[1,6],[2,9],[3,8],[4,11],[5,10]].some(([x,y]) => (x===a&&y===b)||(x===b&&y===a));
const HYUNG = [[2,5],[5,8],[2,8],[1,10],[10,7],[1,7],[0,3]];
export const isHyung = (a, b) => (a === b && [4,6,9,11].includes(a)) || HYUNG.some(([x,y]) => (x===a&&y===b)||(x===b&&y===a));
export const isStemHap = (a, b) => mod(a - b, 10) === 5;
export const isStemClash = (a, b) => Math.abs(a - b) === 6 && a % 2 === b % 2;
