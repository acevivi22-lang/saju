import { STEM, STEM_KO, BR, BR_KO, ANIMAL, EL_KO, EL_HAN, BR_EL, BR_MAIN, HIDDEN, TERM, mod, stemEl, tenGod, pname, pko,
  computeChart, pillarsAt, monthsOfSajuYear, daewoonAt, isClash, isHarmony } from "./core.js";
import { analyze, gyeokguk, sinsalAndRelations, positions, stageOf, GROUP_KO } from "./analysis.js";
import { CATS, GOOD, CARE, LAYERS, gradeOf, dayFortune, monthFortune, yearFortune, daewoonFortune, upcomingMonths, dwPillar } from "./fortune.js";
import { sections, QUESTIONS, answer, GOD, scoreChip, ELX, BOOST } from "./reading.js";
import { iljuReading, luckyToday, hoursOfDay, dayKeywords, monthLines, compatibility, compatHtml } from "./extras.js";

const $ = id => document.getElementById(id);
const KEY = "saju.v2";
const SAMPLE = { id: "sample", name: "", date: "1998-03-15", time: "14:30", noTime: false, gender: "M", lng: 127.0, yaja: false };

// ---------- 저장 ----------
function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && Array.isArray(s.profiles)) return s;
    const old = JSON.parse(localStorage.getItem("saju-profile") || "null"); // 예전 한 장짜리 버전
    if (old && old.date && !old.sample) { const p = { ...old, id: uid() }; delete p.sample; return { profiles: [p], active: p.id }; }
  } catch (e) {}
  return { profiles: [], active: null };
}
function saveStore() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
const uid = () => Math.random().toString(36).slice(2, 9);

let store = loadStore();
const st = { tab: "today", view: todayKST(), calCat: "total", flowCat: "total", todayCat: "total", layerOn: { natal: true, dw: true, yr: true, mo: true, dy: true }, thread: [], askMode: "q", partner: null };
let ctx = null;

function todayKST() { const d = new Date(Date.now() + 9 * 3600000); return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]; }
const fmt = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const activeProfile = () => store.profiles.find(p => p.id === store.active) || store.profiles[0] || SAMPLE;

function buildCtx() {
  const p = activeProfile();
  const c = computeChart(p), a = analyze(c);
  ctx = { p, c, a, gy: gyeokguk(c), sr: sinsalAndRelations(c), today: todayKST() };
  st.thread = [];
}

// ---------- 공통 조각 ----------
const glyph = (ch, el, size = "") => `<div class="glyph ${size} e${el}">${ch}</div>`;
const pillarGlyphs = (p, size) => glyph(STEM[p[0]], stemEl(p[0]), size) + glyph(BR[p[1]], BR_EL[p[1]], size);
const dots = (lv, care) => `<span class="dots${care ? " care" : ""}" aria-label="${lv}단계">${[1,2,3,4,5].map(i => `<i class="${i <= lv ? "on" : ""}"></i>`).join("")}</span>`;
const catOf = id => CATS.find(k => k.id === id);
const isCare = id => catOf(id).t === "ca";
function catChips(sel, key) {
  return CATS.map(k => `<button type="button" class="chip${k.t === "ca" ? " care" : ""}" data-${key}="${k.id}" aria-pressed="${sel === k.id}">${k.name}</button>`).join("");
}

// ---------- 헤더 ----------
function renderHeader() {
  const { p, c } = ctx;
  $("title").textContent = p.name ? `${p.name}의 만세력` : "나의 만세력";
  $("subtitle").textContent = `${p.date} ${p.noTime ? "(시각 모름)" : p.time} · ${p.gender === "M" ? "남" : "여"} · ${ANIMAL[c.year[1]]}띠 · ${[c.year, c.month, c.day, c.hour].filter(Boolean).map(pname).join(" ")}`;
  $("sampleNote").hidden = store.profiles.length > 0;
}

// ---------- 오늘 ----------
const WD = ["일","월","화","수","목","금","토"];
function renderToday() {
  const { c, a } = ctx, ds = c.day[0];
  const [y, m, d] = st.view;
  $("viewDate").value = fmt(y, m, d);
  const f = dayFortune(c, a, y, m, d);
  const dg = tenGod(ds, f.P.day[0]), dgb = tenGod(ds, BR_MAIN[f.P.day[1]]);
  const tk = ctx.today, isToday = y === tk[0] && m === tk[1] && d === tk[2];
  const g = gradeOf(f.s.total);
  const sel = st.todayCat, selCare = isCare(sel);
  const layerPillar = { dw: f.dw.pillar, yr: f.P.year, mo: f.P.month, dy: f.P.day };
  const lrows = LAYERS.map(L => {
    const v = f.layers[L.id].s[sel];
    return `<div class="lrow"><span>${L.name}${L.id === "dw" && f.dw.pre ? "<small class='muted'>*</small>" : ""}</span><span class="hj">${pname(layerPillar[L.id])}</span><span class="track${selCare ? " care" : ""}"><i style="width:${v}%"></i></span><span class="v">${v}</span></div>`;
  }).join("");
  const crow = k => {
    const v = f.s[k.id], gg = gradeOf(v, k.t === "ca");
    return `<button type="button" class="catrow${k.t === "ca" ? " care" : ""}${sel === k.id ? " on" : ""}" data-tcat="${k.id}"><span class="n">${k.name}</span><span class="track${k.t === "ca" ? " care" : ""}"><i style="width:${v}%"></i></span><span class="v">${v}</span>${dots(gg.lv, k.t === "ca")}</button>`;
  };
  const goods = GOOD.filter(k => f.s[k.id] >= 66).sort((x, y) => f.s[y.id] - f.s[x.id]).slice(0, 3);
  const cares = CARE.filter(k => f.s[k.id] >= 66).sort((x, y) => f.s[y.id] - f.s[x.id]);
  const why = [["일진", f.layers.dy.why], ["월운", f.layers.mo.why], ["세운", f.layers.yr.why], ["대운", f.layers.dw.why]].filter(x => x[1].length);
  const lack = [0,1,2,3,4].filter(e => a.counts[e] === 0);
  const fill = lack.filter(e => [stemEl(f.P.day[0]), BR_EL[f.P.day[1]]].includes(e));
  const lk = luckyToday(c, a, f.P);
  const hrs = hoursOfDay(c, a, f.P);
  const hBest = hrs.slice().sort((x, z) => z.s.total - x.s.total).slice(0, 2);
  const hWorst = hrs.slice().sort((x, z) => x.s.total - z.s.total)[0];
  const week = [];
  for (let i = 0; i < 7; i++) { const t = new Date(Date.UTC(y, m - 1, d + i)); week.push(dayFortune(c, a, t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate())); }

  $("todayBody").innerHTML = `
  <div class="card">
    <div class="hero">
      <div class="gz">${pillarGlyphs(f.P.day)}<small>${pko(f.P.day)}일</small></div>
      <div>
        <div class="eyebrow">${isToday ? "오늘" : `${m}월 ${d}일`} · ${dg}의 날</div>
        <div class="big"><b class="word g${g.lv}">${g.name}</b><span>${f.s.total}점</span></div>
        <div class="kw">${dayKeywords(dg).map(k => `<span>#${k}</span>`).join("")}</div>
      </div>
    </div>
    <p>${GOD[dg].day}${dgb !== dg ? ` 바탕에는 ${dgb}(${GOD[dgb].kw})의 기운이 깔려 있어요.` : ""}</p>
    ${fill.length ? `<p class="small">원국에 없는 ${fill.map(ELX).join("·")} 기운이 들어와 평소 부족한 부분이 채워지는 날이에요.</p>` : ""}
    <div class="todo">
      ${goods.length ? `<p><b>이런 일 하기 좋아요</b> · ${goods.map(k => k.tip).join(" / ")}</p>` : `<p class="muted">특별히 튀는 기운 없이 평범한 날이에요. 하던 일을 꾸준히 하면 됩니다.</p>`}
      ${cares.length ? `<p class="ca"><b>이건 조심하세요</b> · ${cares.map(k => k.tip).join(" / ")}</p>` : ""}
    </div>
  </div>

  <div class="card">
    <h3>오늘의 행운</h3>
    <div class="lucky">
      <div><span>색</span><b>${lk.color}</b></div>
      <div><span>숫자</span><b>${lk.nums.join(", ")}</b></div>
      <div><span>방향</span><b>${lk.dir}</b></div>
      <div><span>음식</span><b>${lk.food}</b></div>
      <div><span>소품</span><b>${lk.item}</b></div>
    </div>
    <p class="muted small">이 사주에 가장 필요한 ${ELX(lk.main)} 기운을 채우는 것들이에요. ${lk.helpToday ? "오늘은 일진도 반가운 기운이라 효과가 더 좋아요." : ""}</p>
  </div>

  <div class="card">
    <h3>시간대별 운</h3>
    <p><b>좋은 시간</b> · ${hBest.map(h => `${h.label} (${BR_KO[h.hb]}시, ${h.god})`).join(", ")}</p>
    <p class="ca"><b>피하면 좋은 시간</b> · ${hWorst.label} (${BR_KO[hWorst.hb]}시)${hWorst.why.length ? ` — ${hWorst.why[0]}` : ""}</p>
    <div class="hours">${hrs.map(h => { const gg = gradeOf(h.s.total); return `<div class="hr1"><i class="g${gg.lv}"></i><span>${BR_KO[h.hb]}</span></div>`; }).join("")}</div>
    <p class="muted small">중요한 연락·미팅·결제는 좋은 시간에 맞추면 좋아요. 시진은 한국 표준시 기준(자시 23:30~01:30)이에요.</p>
  </div>

  <div class="card">
    <h3>이번 주 흐름</h3>
    <div class="week">${week.map((w, i) => { const gg = gradeOf(w.s.total); const wd = new Date(Date.UTC(w.y, w.m - 1, w.d)).getUTCDay(); const gd = tenGod(ds, w.P.day[0]); return `<button type="button" class="wk${i === 0 ? " on" : ""}" data-date="${fmt(w.y, w.m, w.d)}"><span class="${wd === 0 ? "sun" : ""}">${WD[wd]} ${w.d}</span><i class="g${gg.lv}"></i><b>${gg.name}</b><small>${dayKeywords(gd)[0]}</small></button>`; }).join("")}</div>
  </div>

  <details class="sec"><summary>점수 자세히 보기</summary><div class="body">
    <h3>점수 구성 · ${catOf(sel).name}</h3>
    <div class="lrows">${lrows}</div>
    <p class="explain">${catOf(sel).name} ${f.s[sel]}점은 대운 20% · 세운 25% · 월운 25% · 일진 30%를 합친 점수예요. 80점 이상은 네 층이 모두 받쳐줄 때만 나와요.${f.dw.pre ? " *대운 시작 전이라 월주를 대신 썼어요." : ""}</p>
    <h3>분야별 <span class="muted small" style="font-weight:400">· 누르면 위 구성이 바뀌어요</span></h3>
    <div class="catrows">${CATS.filter(k => k.t === "do").map(crow).join("")}</div>
    <div class="hr"></div>
    <div class="catrows">${CARE.map(crow).join("")}</div>
    ${why.length ? `<h3>이 날 작용하는 것</h3><ul class="notes">${why.map(([n, w]) => `<li><b>${n}</b> ${w.join(", ")}</li>`).join("")}</ul>` : ""}
  </div></details>`;
}

// ---------- 달력 ----------
function renderCal() {
  const { c, a } = ctx;
  const [y, m, selD] = st.view, tk = ctx.today;
  $("calTitle").textContent = `${y}년 ${m}월`;
  $("calCats").innerHTML = catChips(st.calCat, "ccat");
  const care = isCare(st.calCat);
  // 이 달의 대운·세운·월운
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const p1 = pillarsAt(y, m, 1), p2 = pillarsAt(y, m, last);
  const mos = [];
  [p1, p2].forEach(pp => { const mo = monthsOfSajuYear(pp.sajuYear)[pp.tIdx]; if (!mos.some(x => x.start === mo.start)) mos.push(mo); });
  const mf = mos.map(mo => monthFortune(c, a, mo));
  const yf = yearFortune(c, a, p1.sajuYear);
  $("calCtx").innerHTML = `대운 ${mf[0].dw.pre ? "전" : pname(mf[0].dw.pillar)} ${mf[0].layers.dw.s[st.calCat]} · 세운 ${pname(p1.year)} ${mf[0].layers.yr.s[st.calCat]} · ` +
    mf.map(x => `${x.mo.startDate.m}/${x.mo.startDate.d} ${x.mo.term}~ ${pname(x.mo.pillar)}월 ${x.layers.mo.s[st.calCat]}`).join(" · ");
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  let h = ["일","월","화","수","목","금","토"].map((w, i) => `<div class="wd ${i === 0 ? "sun" : ""}">${w}</div>`).join("");
  for (let i = 0; i < first; i++) h += `<div class="cell blank" aria-hidden="true"></div>`;
  for (let d = 1; d <= last; d++) {
    const f = dayFortune(c, a, y, m, d), v = f.s[st.calCat], g = gradeOf(v, care);
    const isT = y === tk[0] && m === tk[1] && d === tk[2];
    h += `<button type="button" class="cell g${g.lv}${care ? " care" : ""}${isT ? " today" : ""}${d === selD ? " sel" : ""}" data-d="${d}" aria-label="${m}월 ${d}일 ${catOf(st.calCat).name} ${v}점">
      <span class="t"><span class="dn">${d}</span><span class="gz">${pname(f.P.day)}</span></span><span class="s">${v}</span></button>`;
  }
  $("cal").innerHTML = h;
  const G = care ? ["거의 없음","낮음","보통","주의","매우 주의"] : ["낮음","약함","보통","좋음","최상"];
  $("legend").innerHTML = `<span>${catOf(st.calCat).name}</span>` + [1,2,3,4,5].map(i => `<span class="sw" style="background:var(--${care ? "c" : "g"}${i})"></span>${G[i - 1]}`).join(" ");
  // 고른 날 요약
  const f = dayFortune(c, a, y, m, selD);
  const goods = GOOD.filter(k => f.s[k.id] >= 66).sort((x, z) => f.s[z.id] - f.s[x.id]).slice(0, 3);
  const cares = CARE.filter(k => f.s[k.id] >= 66);
  $("calPick").innerHTML = `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h3>${m}월 ${selD}일 ${pname(f.P.day)}일</h3>${scoreChip(f.s.total)}</div>
    <p class="small">대운 ${f.layers.dw.s.total} · 세운 ${f.layers.yr.s.total} · 월운 ${f.layers.mo.s.total} · 일진 ${f.layers.dy.s.total}</p>
    ${goods.length ? `<p class="small"><b>좋음</b> ${goods.map(k => `${k.name} ${f.s[k.id]}`).join(", ")}</p>` : ""}
    ${cares.length ? `<p class="small" style="color:var(--warn)"><b>주의</b> ${cares.map(k => `${k.name} ${f.s[k.id]}`).join(", ")}</p>` : ""}
    <button class="btn" type="button" data-go="today">이 날 자세히 보기</button></div>`;
}

// ---------- 흐름 ----------
function bars(items, care, many) {
  return `<div class="bars${many ? " many" : ""}${care ? " care" : ""}">${items.map(it => {
    const g = gradeOf(it.v, care);
    return `<div class="b${it.now ? " now" : ""}" title="${it.title || ""}"><em>${it.v}</em><i class="g${g.lv}" style="height:${Math.max(4, it.v)}%"></i><span>${it.label}</span></div>`;
  }).join("")}</div>`;
}
function renderFlow() {
  const { c, a } = ctx, ds = c.day[0], cat = st.flowCat, care = isCare(cat), cn = catOf(cat).name;
  $("flowCats").innerHTML = catChips(cat, "fcat");
  const [ty, tm, td] = ctx.today;
  const cdw = daewoonAt(c, Date.UTC(ty, tm - 1, td));
  $("dwRow").innerHTML = c.daewoon.map(d => {
    const f = daewoonFortune(c, a, d), now = cdw && cdw.age === d.age;
    return `<div class="dwc${now ? " now" : ""}"><span class="age">${d.age}세~</span>${glyph(STEM[d.pillar[0]], stemEl(d.pillar[0]), "xs")}${glyph(BR[d.pillar[1]], BR_EL[d.pillar[1]], "xs")}<span>${tenGod(ds, d.pillar[0])}</span>${scoreChip(f.s[cat], care)}</div>`;
  }).join("");
  const nowY = pillarsAt(ty, tm, td).sajuYear;
  const yrs = []; for (let Y = nowY - 2; Y <= nowY + 9; Y++) { const f = yearFortune(c, a, Y); yrs.push({ v: f.s[cat], label: `'${String(Y).slice(2)}`, now: Y === nowY, title: `${Y}년 ${pname(f.pillar)} ${f.s[cat]}점` }); }
  $("yrTitle").textContent = `세운 · ${cn} · ${nowY - 2}~${nowY + 9}년`;
  $("yrChart").innerHTML = bars(yrs, care) + `<p class="muted small">대운(40%)과 세운(60%)을 합친 해 점수예요.</p>`;
  const ml = monthLines(c, a, nowY);
  $("mlTitle").textContent = `${nowY}년 월별 운세`;
  $("mlList").innerHTML = ml.map(x => { const g = gradeOf(x.f.s.total); const cur = x.mo.start <= pillarsAt(ty, tm, td).jd && pillarsAt(ty, tm, td).jd < x.mo.end; return `<li class="${cur ? "now" : ""}"><div class="mh"><b>${x.mo.startDate.m}월</b><span class="muted small">${x.mo.startDate.m}/${x.mo.startDate.d}~ ${pname(x.mo.pillar)}</span><span class="word g${g.lv}">${g.name}</span></div><p>${x.txt}</p><p class="small muted">잘 풀리는 쪽: ${x.best.name}${x.f.s[x.care.id] >= 66 ? ` · 조심: ${x.care.name}` : ""}${x.notes.length ? ` · ${x.notes.join(", ")}` : ""}</p></li>`; }).join("");
  const ms = upcomingMonths(c, a, ty, tm, td, 24);
  $("moTitle").textContent = `월운 · ${cn} · 앞으로 24개월`;
  $("moChart").innerHTML = bars(ms.map((f, i) => ({ v: f.s[cat], label: `${f.mo.startDate.m}월`, now: i === 0, title: `${f.mo.startDate.y}.${f.mo.startDate.m}.${f.mo.startDate.d}~ ${pname(f.mo.pillar)}월 ${f.s[cat]}점` })), care, true) +
    `<p class="muted small">각 막대는 절기 기준 한 달(예: 12월 = 대설~소한). 대운·세운·월운을 합친 점수예요.</p>`;
  renderElements();
}
const EL_LAYERS = [{ id: "natal", name: "원국", ws: 1, wb: 1 }, { id: "dw", name: "대운", ws: 1, wb: 2 }, { id: "yr", name: "세운", ws: .6, wb: .6 }, { id: "mo", name: "월운", ws: .4, wb: .4 }, { id: "dy", name: "일진", ws: .3, wb: .3 }];
function renderElements() {
  const { c } = ctx, [y, m, d] = st.view;
  const P = pillarsAt(y, m, d), dw = dwPillar(c, Date.UTC(y, m - 1, d));
  const L = {}; EL_LAYERS.forEach(l => L[l.id] = [0,0,0,0,0]);
  const put = (id, p) => { const l = EL_LAYERS.find(x => x.id === id); L[id][stemEl(p[0])] += l.ws; L[id][BR_EL[p[1]]] += l.wb; };
  positions(c).forEach(([, p]) => put("natal", p));
  put("dw", dw.pillar); put("yr", P.year); put("mo", P.month); put("dy", P.day);
  $("elTitle").textContent = `${m}월 ${d}일의 오행`;
  $("layers").innerHTML = EL_LAYERS.map((l, i) => `<button type="button" class="layer" data-layer="${l.id}" aria-pressed="${st.layerOn[l.id]}"><span class="sw op${i}"></span>${l.name}</button>`).join("");
  const tot = [0,0,0,0,0]; EL_LAYERS.forEach(l => { if (st.layerOn[l.id]) L[l.id].forEach((v, i) => tot[i] += v); });
  const maxT = Math.max(...tot, 1), all = tot.reduce((x, y) => x + y, 0) || 1, nat = L.natal, natS = nat.reduce((x, y) => x + y, 0);
  const f1 = n => Number.isInteger(n) ? String(n) : n.toFixed(1);
  $("elRows").innerHTML = [0,1,2,3,4].map(e => `<div class="srow"><span>${EL_KO[e]} ${EL_HAN[e]}</span><div class="strack">${EL_LAYERS.map((l, i) => st.layerOn[l.id] && L[l.id][e] > 0 ? `<div class="seg f${e} op${i}" style="width:${L[l.id][e] / maxT * 100}%"></div>` : "").join("")}</div><span class="val">${f1(tot[e])} <small class="muted">${Math.round(tot[e] / all * 100)}%</small></span></div>`).join("");
  const notes = [];
  [0,1,2,3,4].forEach(e => {
    const b = nat[e] / natS, af = tot[e] / all;
    if (nat[e] === 0 && tot[e] > 0) notes.push(`원국에 없던 ${ELX(e)} 기운이 운에서 ${f1(tot[e])}만큼 들어와 채워지고 있어요.`);
    else if (af - b >= 0.06) notes.push(`${ELX(e)} 비중이 원국 ${Math.round(b * 100)}% → ${Math.round(af * 100)}%로 커졌어요.`);
    else if (af - b <= -0.06) notes.push(`${ELX(e)} 비중이 원국 ${Math.round(b * 100)}% → ${Math.round(af * 100)}%로 줄었어요.`);
  });
  if (!notes.length) notes.push("원국과 비교해 큰 변화 없이 비슷한 균형이 이어져요.");
  $("elNotes").innerHTML = notes.map(n => `<li>${n}</li>`).join("");
}

// ---------- 풀이 ----------
function renderRead() {
  const { c, a, sr } = ctx, ds = c.day[0];
  const cols = [["시주", c.hour, "시"], ["일주", c.day, "일"], ["월주", c.month, "월"], ["년주", c.year, "년"]];
  const pillarsHtml = cols.map(([lab, pp]) => {
    if (!pp) return `<div class="pcol"><span class="lab">${lab}</span><span class="god">&nbsp;</span><div class="glyph sm" style="background:var(--bg);color:var(--muted)">?</div><div class="glyph sm" style="background:var(--bg);color:var(--muted)">?</div><span class="god">&nbsp;</span><span class="ko">모름</span></div>`;
    const isDay = lab === "일주";
    return `<div class="pcol${isDay ? " day" : ""}"><span class="lab">${lab}</span><span class="god">${isDay ? "나" : tenGod(ds, pp[0])}</span>${glyph(STEM[pp[0]], stemEl(pp[0]), "sm")}${glyph(BR[pp[1]], BR_EL[pp[1]], "sm")}<span class="god">${tenGod(ds, BR_MAIN[pp[1]])}</span><span class="ko">${pko(pp)}</span></div>`;
  }).join("");
  const wsum = a.wEl.reduce((x, y) => x + y, 0);
  const ebars = [0,1,2,3,4].map(e => `<div class="ebar"><span>${EL_KO[e]} ${EL_HAN[e]}</span><div class="tr"><i class="f${e}" style="width:${a.wEl[e] / wsum * 100}%"></i></div><span>${a.counts[e]}자</span></div>`).join("");
  const dcols = cols.filter(x => x[1]);
  const row = (label, fn) => `<tr><th>${label}</th>${dcols.map(([, pp, n]) => `<td>${fn(pp, n)}</td>`).join("")}</tr>`;
  $("chartCard").innerHTML = `
    <h3>사주팔자</h3><div class="pillars">${pillarsHtml}</div>
    <h4 style="margin-top:4px">오행 <span class="muted small" style="font-weight:400">· 막대는 지장간과 자리 무게(월지 3배)를 반영한 비율</span></h4><div class="ebars">${ebars}</div>
    <div class="tbl deep"><table>
      <tr><th></th>${dcols.map(([lab]) => `<th>${lab}</th>`).join("")}</tr>
      ${row("지장간", pp => `<span class="hj">${HIDDEN[pp[1]].map(s => STEM[s]).join(" ")}</span><br><span class="muted small">${HIDDEN[pp[1]].map(s => tenGod(ds, s)).join(" ")}</span>`)}
      ${row("12운성", pp => stageOf(ds, pp[1]))}
      ${row("신살", (pp, n) => (sr.sinsal[n] || []).map(([x, k]) => `<span class="badge ${k}">${x}</span>`).join("") || "<span class='muted'>-</span>")}
    </table></div>
    ${sr.rel.length ? `<h4>원국 안의 합·충·형</h4><ul class="rel">${sr.rel.map(r => `<li><b>${r.tag}</b> ${r.txt}</li>`).join("")}</ul>` : `<p class="small muted">원국 안에 눈에 띄는 합·충·형이 없어 구조가 안정적인 편이에요.</p>`}
    <p class="muted small">공망: ${sr.gongmang.map(b => BR[b]).join(" ")} · 천을귀인(돕는 사람) · 문창(공부·글) · 도화(매력) · 역마(이동) · 화개(학문·예술) · 양인·괴강(강한 추진력) · 백호(강한 기운, 사고 조심) · 공망(그 자리가 비거나 늦게 채워짐)</p>`;
  const il = iljuReading(c);
  const secs = [{ title: `일주 풀이 · ${il.name}`, html: il.html }, ...sections(ctx)];
  $("readBody").innerHTML = secs.map((s, i) => `<details class="sec" ${i < 2 ? "open" : ""}><summary>${s.title}</summary><div class="body">${s.html}</div></details>`).join("");
}

// ---------- 상담 ----------
function renderAsk() {
  $("askMode").innerHTML = `<button type="button" class="chip" data-mode="q" aria-pressed="${st.askMode === "q"}">질문하기</button><button type="button" class="chip" data-mode="match" aria-pressed="${st.askMode === "match"}">궁합 보기</button>`;
  $("qchips").hidden = st.askMode !== "q";
  if (st.askMode === "match") {
    const others = store.profiles.filter(p => p.id !== ctx.p.id);
    if (!others.length) {
      $("thread").innerHTML = `<div class="card"><h3>궁합 보기</h3><p>궁합을 보려면 상대방 생년월일이 필요해요. 오른쪽 위 사람 버튼에서 상대를 추가해 주세요. 추가한 뒤 다시 '나'를 선택하면 돼요.</p><button class="btn primary" type="button" id="addPartner">상대 추가하기</button></div>`;
      $("addPartner").onclick = () => openSheet(null);
      return;
    }
    if (!st.partner || !others.some(p => p.id === st.partner)) st.partner = others[0].id;
    const pp = others.find(p => p.id === st.partner);
    const r = compatibility(ctx.p, pp);
    $("thread").innerHTML = `<div class="chips scroll">${others.map(p => `<button type="button" class="chip" data-partner="${p.id}" aria-pressed="${p.id === st.partner}">${p.name || p.date}</button>`).join("")}</div>
      <div class="card">${compatHtml(r, ctx.p.name || "나", pp.name || "상대")}</div>`;
    return;
  }
  const name = ctx.p.name || "이분";
  const greet = `<div class="bubble a"><span class="who">상담</span><p>안녕하세요. ${name}의 사주(${[ctx.c.year, ctx.c.month, ctx.c.day, ctx.c.hour].filter(Boolean).map(pname).join(" ")})를 펼쳐 놓았어요. ${ctx.a.strength} 사주이고 용신은 ${ELX(ctx.a.yongEl)}입니다. 아래에서 궁금한 걸 골라 주세요. 대운·세운·월운을 모두 따져서 앞으로 2년 안의 시기를 짚어 드릴게요.</p></div>`;
  $("thread").innerHTML = greet + st.thread.map(t => `<div class="bubble q">${t.q}</div><div class="bubble a"><span class="who">상담</span>${t.a}</div>`).join("");
  $("qchips").innerHTML = QUESTIONS.map(q => `<button type="button" class="chip" data-q="${q.id}">${q.q}</button>`).join("");
}

// ---------- 라우팅 ----------
function render() {
  renderHeader();
  document.querySelectorAll(".view").forEach(v => v.hidden = v.dataset.view !== st.tab);
  document.querySelectorAll("#tabbar button").forEach(b => { if (b.dataset.go === st.tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
  ({ today: renderToday, cal: renderCal, flow: renderFlow, read: renderRead, ask: renderAsk })[st.tab]();
}
function go(tab) { st.tab = tab; try { history.replaceState(null, "", "#" + tab); } catch (e) {} render(); window.scrollTo(0, 0); }

document.addEventListener("click", e => {
  const t = e.target.closest("[data-go],[data-shift],[data-tcat],[data-ccat],[data-fcat],[data-d],[data-layer],[data-q],[data-date],[data-mode],[data-partner]");
  if (!t) return;
  if (t.dataset.go) return go(t.dataset.go);
  if (t.dataset.shift) { const x = new Date(Date.UTC(st.view[0], st.view[1] - 1, st.view[2] + +t.dataset.shift)); st.view = [x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate()]; return render(); }
  if (t.dataset.tcat) { st.todayCat = t.dataset.tcat; st.detailOpen = true; render(); const dt = document.querySelector("#todayBody details"); if (dt) dt.open = true; return; }
  if (t.dataset.date) { st.view = t.dataset.date.split("-").map(Number); render(); window.scrollTo(0, 0); return; }
  if (t.dataset.ccat) { st.calCat = t.dataset.ccat; return render(); }
  if (t.dataset.fcat) { st.flowCat = t.dataset.fcat; return render(); }
  if (t.dataset.d) { st.view = [st.view[0], st.view[1], +t.dataset.d]; return render(); }
  if (t.dataset.layer) { const id = t.dataset.layer; st.layerOn[id] = !st.layerOn[id]; if (!Object.values(st.layerOn).some(Boolean)) st.layerOn.natal = true; return renderElements(); }
  if (t.dataset.mode) { st.askMode = t.dataset.mode; return renderAsk(); }
  if (t.dataset.partner) { st.partner = t.dataset.partner; return renderAsk(); }
  if (t.dataset.q) {
    const q = QUESTIONS.find(x => x.id === t.dataset.q);
    st.thread.push({ q: q.q, a: answer(q.id, ctx) });
    renderAsk();
    const as = $("thread").querySelectorAll(".bubble.q"); as[as.length - 1].scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
$("todayBtn").addEventListener("click", () => { st.view = todayKST(); render(); });
$("viewDate").addEventListener("change", e => { if (e.target.value) { st.view = e.target.value.split("-").map(Number); render(); } });
function shiftMonth(n) { const t = new Date(Date.UTC(st.view[0], st.view[1] - 1 + n, 1)); const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate(); st.view = [t.getUTCFullYear(), t.getUTCMonth() + 1, Math.min(st.view[2], last)]; render(); }
$("prevMonth").addEventListener("click", () => shiftMonth(-1));
$("nextMonth").addEventListener("click", () => shiftMonth(1));

// ---------- 사람 관리 ----------
let editing = null;
function openSheet(id) {
  editing = id === undefined ? (store.profiles.length ? store.active : null) : id;
  const list = store.profiles;
  $("plist").innerHTML = list.length ? list.map(p => `<li><button type="button" class="pick" data-pick="${p.id}" aria-current="${p.id === store.active}">${p.name || "이름 없음"} <span class="muted small">${p.date} ${p.gender === "M" ? "남" : "여"}</span></button><button type="button" class="btn" data-edit="${p.id}">수정</button></li>`).join("") : `<li class="muted small">아직 저장된 사람이 없어요. 아래에 생년월일을 넣어 주세요.</li>`;
  const p = list.find(x => x.id === editing) || { name: "", date: "", time: "", noTime: false, gender: "M", lng: 127.0, yaja: false };
  $("formTitle").textContent = editing ? "정보 수정" : "새로 추가";
  $("fName").value = p.name || ""; $("fDate").value = p.date || ""; $("fTime").value = p.noTime ? "" : (p.time || "");
  $("fNoTime").checked = !!p.noTime; $("fTime").disabled = !!p.noTime; $("fGender").value = p.gender; $("fPlace").value = Number(p.lng).toFixed(1); $("fYaja").checked = !!p.yaja;
  $("fDel").hidden = !editing;
  if (!$("sheet").open) $("sheet").showModal();
}
$("profileBtn").addEventListener("click", () => openSheet());
$("sheetClose").addEventListener("click", () => $("sheet").close());
$("sheet").addEventListener("click", e => {
  if (e.target === $("sheet")) return $("sheet").close();
  const pk = e.target.closest("[data-pick]"), ed = e.target.closest("[data-edit]");
  if (pk) { store.active = pk.dataset.pick; saveStore(); buildCtx(); render(); $("sheet").close(); }
  if (ed) openSheet(ed.dataset.edit);
});
$("fNew").addEventListener("click", () => openSheet(null));
$("fNoTime").addEventListener("change", e => { $("fTime").disabled = e.target.checked; });
$("fDel").addEventListener("click", () => {
  if (!editing || !confirm("이 사람을 삭제할까요?")) return;
  store.profiles = store.profiles.filter(p => p.id !== editing);
  if (store.active === editing) store.active = store.profiles[0] ? store.profiles[0].id : null;
  saveStore(); buildCtx(); render(); openSheet();
});
$("pform").addEventListener("submit", e => {
  e.preventDefault();
  if (!$("fDate").value) return;
  const noTime = $("fNoTime").checked || !$("fTime").value;
  const data = { name: $("fName").value.trim(), date: $("fDate").value, time: noTime ? "12:00" : $("fTime").value, noTime, gender: $("fGender").value, lng: parseFloat($("fPlace").value), yaja: $("fYaja").checked };
  if (editing) Object.assign(store.profiles.find(p => p.id === editing), data);
  else { const id = uid(); store.profiles.push({ id, ...data }); store.active = id; editing = id; }
  saveStore(); buildCtx(); render(); $("sheet").close();
});

// ---------- 시작 ----------
const hash = location.hash.slice(1);
if (["today","cal","flow","read","ask"].includes(hash)) st.tab = hash;
buildCtx(); render();
$("sampleNote").addEventListener("click", () => openSheet(null));
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
