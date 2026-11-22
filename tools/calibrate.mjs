// 점수 보정표 생성: node tools/calibrate.mjs > js/calib.js
// 무작위 사주 × 무작위 날짜로 층별 원점수 분포를 구하고, 백분위를 0~100 점수에 맞춘다.
import { computeChart, monthsOfSajuYear } from "../js/core.js";
import { analyze } from "../js/analysis.js";
import { CATS, dayFortune, monthFortune, yearFortune, combineRaw } from "../js/fortune.js";

let seed = 20261122;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pad = n => String(n).padStart(2, "0");
const S = { one: {}, day: {}, month: {}, year: {} };
for (const l in S) CATS.forEach(k => S[l][k.id] = []);
const push = (l, v) => CATS.forEach(k => S[l][k.id].push(v[k.id]));

for (let i = 0; i < 500; i++) {
  const by = ri(1950, 2012);
  const p = { date: `${by}-${pad(ri(1, 12))}-${pad(ri(1, 28))}`, time: `${pad(ri(0, 23))}:${pad(ri(0, 59))}`, noTime: rnd() < 0.15, gender: rnd() < 0.5 ? "M" : "F", lng: 127, yaja: false };
  const c = computeChart(p), a = analyze(c);
  for (let j = 0; j < 200; j++) {
    const Y = by + ri(15, 60), M = ri(1, 12), D = ri(1, 28);
    const f = dayFortune(c, a, Y, M, D);
    push("day", combineRaw(f.layers, ["dw", "yr", "mo", "dy"]));
    push("one", f.layers.dy.v);
  }
  for (let j = 0; j < 40; j++) {
    const Y = by + ri(15, 60), ms = monthsOfSajuYear(Y), f = monthFortune(c, a, ms[ri(0, 11)]);
    push("month", combineRaw(f.layers, ["dw", "yr", "mo"]));
    push("one", f.layers.mo.v);
  }
  for (let j = 0; j < 30; j++) {
    const f = yearFortune(c, a, by + ri(15, 70));
    push("year", combineRaw(f.layers, ["dw", "yr"]));
    push("one", f.layers.yr.v);
  }
}
const PCT = [0, 0.05, 0.12, 0.35, 0.70, 0.93, 0.99, 1];
const out = {};
for (const l in S) {
  out[l] = {};
  for (const k in S[l]) {
    const arr = S[l][k].slice().sort((x, y) => x - y);
    const knots = PCT.map(q => +arr[Math.min(arr.length - 1, Math.floor(q * (arr.length - 1)))].toFixed(4));
    for (let i = 1; i < knots.length; i++) if (knots[i] <= knots[i - 1]) knots[i] = +(knots[i - 1] + 0.0001).toFixed(4);
    out[l][k] = knots;
  }
}
console.log("// tools/calibrate.mjs 로 생성. 직접 고치지 마세요.\nexport const CALIB = " + JSON.stringify(out) + ";");
