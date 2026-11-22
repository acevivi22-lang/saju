// 원국 분석: 오행 분포, 신강·신약, 용신, 격국, 신살, 합충
import { STEM, BR, BR_EL, BR_MAIN, HIDDEN, EL_KO, mod, stemEl, tenGod, pname, sixty, isClash, isHarmony, isWonjin, isHyung, isStemHap, isStemClash } from "./core.js";

export const GROUPS = ["bi","sik","jae","gwan","in"];
export const GROUP_KO = { bi:"비겁", sik:"식상", jae:"재성", gwan:"관성", in:"인성" };
export const GROUP_OF_GOD = { "비견":"bi","겁재":"bi","식신":"sik","상관":"sik","편재":"jae","정재":"jae","편관":"gwan","정관":"gwan","편인":"in","정인":"in" };
export const groupElement = (de, g) => mod(de + GROUPS.indexOf(g), 5);
export const elementGroup = (de, e) => GROUPS[mod(e - de, 5)];

const HIDDEN_RATIO = { 2: [0.3, 0.7], 3: [0.2, 0.2, 0.6] };
export const STAGE = ["장생","목욕","관대","건록","제왕","쇠","병","사","묘","절","태","양"];
const STAGE_START = [11,6,2,9,2,9,5,0,8,3];
export const stageOf = (s, b) => STAGE[s % 2 === 0 ? mod(b - STAGE_START[s], 12) : mod(STAGE_START[s] - b, 12)];

export const GWIN = {0:[1,7],4:[1,7],6:[1,7],1:[0,8],5:[0,8],2:[11,9],3:[11,9],7:[2,6],8:[5,3],9:[5,3]}; // 천을귀인
export const MUNCHANG = [5,6,8,9,8,9,11,0,2,3];
export const grpOfBranch = b => [0,2,1,3][b % 4]; // 0:申子辰 1:寅午戌 2:巳酉丑 3:亥卯未
export const YEOKMA = [2,8,11,5], DOHWA = [9,3,6,0], HWAGAE = [4,10,1,7];

export function positions(c) {
  const P = [["년", c.year], ["월", c.month], ["일", c.day], ["시", c.hour]].filter(x => x[1]);
  return P;
}

export function analyze(c) {
  const ds = c.day[0], de = stemEl(ds);
  // 보이는 여덟 글자 단순 개수
  const counts = [0,0,0,0,0];
  positions(c).forEach(([, p]) => { counts[stemEl(p[0])]++; counts[BR_EL[p[1]]]++; });

  // 가중 오행: 천간 1, 지지는 자리별 가중치를 지장간 비율로 나눔 (월지 3, 일지 1.5)
  const wEl = [0,0,0,0,0];
  const items = [];
  const addStem = (name, s, w) => { wEl[stemEl(s)] += w; items.push({ name, el: stemEl(s), w }); };
  const addBranch = (name, b, w) => {
    const hs = HIDDEN[b], r = HIDDEN_RATIO[hs.length];
    hs.forEach((s, i) => { wEl[stemEl(s)] += w * r[i]; items.push({ name, el: stemEl(s), w: w * r[i] }); });
  };
  addStem("년간", c.year[0], 1); addBranch("년지", c.year[1], 1);
  addStem("월간", c.month[0], 1); addBranch("월지", c.month[1], 3);
  addBranch("일지", c.day[1], 1.5);
  if (c.hour) { addStem("시간", c.hour[0], 1); addBranch("시지", c.hour[1], 1); }
  const tot = items.reduce((a, x) => a + x.w, 0);
  const sup = items.filter(x => x.el === de || x.el === mod(de + 4, 5)).reduce((a, x) => a + x.w, 0);
  const ratio = sup / tot;
  const strength = ratio < 0.3 ? "극신약" : ratio < 0.45 ? "신약" : ratio < 0.55 ? "중화" : ratio < 0.7 ? "신강" : "극신강";
  const strong = ratio >= 0.5;

  const grpW = {}; GROUPS.forEach((g, i) => grpW[g] = wEl[mod(de + i, 5)]);
  // 일간 자신을 제외한 비겁 무게
  const grpCount = { bi:0, sik:0, jae:0, gwan:0, in:0 };
  positions(c).forEach(([n, p]) => {
    if (n !== "일") grpCount[GROUP_OF_GOD[tenGod(ds, p[0])]]++;
    grpCount[GROUP_OF_GOD[tenGod(ds, BR_MAIN[p[1]])]]++;
  });

  // 용신(억부): 신강하면 설기·극하는 쪽, 신약하면 생조하는 쪽
  let yongGrp, yongWhy;
  if (strong) {
    if (grpW.in > grpW.bi) { yongGrp = "jae"; yongWhy = "나를 돕는 기운 중 인성(배움·도움)이 특히 두꺼워, 인성을 눌러 균형을 잡는 재성이 필요합니다"; }
    else if (grpW.gwan >= 0.8) { yongGrp = "gwan"; yongWhy = "비겁(나와 같은 기운)이 강해, 그 힘을 다잡아 줄 관성이 필요합니다"; }
    else { yongGrp = "sik"; yongWhy = "비겁(나와 같은 기운)이 강하고 관성이 약해, 넘치는 힘을 밖으로 풀어줄 식상이 필요합니다"; }
  } else {
    const heavy = ["sik","jae","gwan"].sort((a, b) => grpW[b] - grpW[a])[0];
    if (heavy === "jae") { yongGrp = "bi"; yongWhy = "재성(돈·현실)이 무거워 내가 감당하기 벅찬 구조라, 같은 편이 되어 줄 비겁이 필요합니다"; }
    else if (heavy === "gwan") { yongGrp = "in"; yongWhy = "관성(압박·책임)이 무거워, 그 압박을 나를 키우는 힘으로 바꿔 줄 인성이 필요합니다"; }
    else { yongGrp = "in"; yongWhy = "식상(표현·소모)으로 힘이 많이 빠져나가, 나를 다시 채워 줄 인성이 필요합니다"; }
  }

  // 오행별 호불호 점수
  const k = Math.max(-1, Math.min(1, (ratio - 0.5) * 2.5));
  const raw = [0,0,0,0,0].map((_, e) => {
    const g = elementGroup(de, e);
    return (g === "bi" || g === "in") ? -k : k;
  });
  const yongEl = groupElement(de, yongGrp);
  raw[yongEl] += 0.6;
  raw[mod(yongEl + 4, 5)] += 0.2; // 용신을 생하는 오행
  // 조후: 한겨울·한여름 출생 보정
  const mb = c.month[1];
  let johu = null;
  if ([11,0,1].includes(mb) && wEl[1] < 1.2) { raw[1] += 0.4; johu = "겨울에 태어나 차가운 사주라 화(火)의 따뜻함이 조후로 반가워요."; }
  if ([5,6,7].includes(mb) && wEl[4] < 1.2) { raw[4] += 0.4; johu = "여름에 태어나 뜨거운 사주라 수(水)의 시원함이 조후로 반가워요."; }
  const maxAbs = Math.max(0.8, ...raw.map(Math.abs));
  const fav = raw.map(v => Math.max(-1, Math.min(1, v / maxAbs)));

  const order = [0,1,2,3,4].filter(e => e !== yongEl).sort((a, b) => fav[b] - fav[a]);
  const role = {}; role[yongEl] = "용신";
  role[order[0]] = fav[order[0]] > 0 ? "희신" : "한신";
  role[order[3]] = "기신";
  role[order[2]] = fav[order[2]] < 0 ? "구신" : "한신";
  role[order[1]] = "한신";

  return { counts, wEl, ratio, strength, strong, grpW, grpCount, yongGrp, yongEl, yongWhy, johu, fav, role, de, ds };
}

// 격국: 월지 지장간 중 천간에 드러난 것 우선
export function gyeokguk(c) {
  const ds = c.day[0];
  const shown = [c.year[0], c.month[0], c.hour ? c.hour[0] : null].filter(x => x !== null);
  const hs = HIDDEN[c.month[1]].slice().reverse(); // 정기 → 중기 → 여기
  let pick = hs.find(s => shown.includes(s));
  const transparent = pick !== undefined;
  if (!transparent) pick = BR_MAIN[c.month[1]];
  let god = tenGod(ds, pick);
  let name = god + "격";
  if (god === "비견") name = "건록격"; if (god === "겁재") name = "양인격";
  return { god, name, transparent, stem: pick };
}

export function sinsalAndRelations(c) {
  const ds = c.day[0], P = positions(c);
  const sinsal = {}; P.forEach(([n]) => sinsal[n] = []);
  const g1 = grpOfBranch(c.year[1]), g2 = grpOfBranch(c.day[1]);
  P.forEach(([n, pp]) => {
    const b = pp[1], L = sinsal[n];
    if (GWIN[ds].includes(b)) L.push(["천을귀인", ""]);
    if (MUNCHANG[ds] === b) L.push(["문창귀인", ""]);
    if ((n !== "년" && b === DOHWA[g1]) || (n !== "일" && b === DOHWA[g2])) L.push(["도화", ""]);
    if ((n !== "년" && b === YEOKMA[g1]) || (n !== "일" && b === YEOKMA[g2])) L.push(["역마", ""]);
    if ((n !== "년" && b === HWAGAE[g1]) || (n !== "일" && b === HWAGAE[g2])) L.push(["화개", ""]);
    if (ds % 2 === 0 && stageOf(ds, b) === "제왕") L.push(["양인", "ca"]);
  });
  if (["庚辰","庚戌","壬辰","壬戌","戊戌"].includes(pname(c.day))) sinsal["일"].push(["괴강", "ca"]);
  P.forEach(([n, pp]) => { if (["甲辰","乙未","丙戌","丁丑","戊辰","壬戌","癸丑"].includes(pname(pp))) sinsal[n].push(["백호", "ca"]); });
  const dn = sixty(c.day[0], c.day[1]), xs = dn - dn % 10, gm = [mod(xs + 10, 12), mod(xs + 11, 12)];
  P.forEach(([n, pp]) => { if (n !== "일" && gm.includes(pp[1])) sinsal[n].push(["공망", "ca"]); });

  const rel = [];
  const ss = P.map(([n, pp]) => [n, pp[0]]), bs = P.map(([n, pp]) => [n, pp[1]]);
  for (let i = 0; i < ss.length; i++) for (let j = i + 1; j < ss.length; j++) {
    const a = ss[i][1], b = ss[j][1], tag = `${ss[i][0]}간 ${STEM[a]} · ${ss[j][0]}간 ${STEM[b]}`;
    if (isStemHap(a, b)) rel.push({ t: "합", tag, txt: `천간합 — 두 자리가 서로 끌어당겨 묶여요. 그 자리가 뜻하는 인연(${ss[i][0]}·${ss[j][0]})이 단단합니다.` });
    if (isStemClash(a, b)) rel.push({ t: "충", tag, txt: "천간충 — 생각과 방향이 부딪히는 자리. 결정을 내릴 때 마음이 두 갈래로 갈리기 쉬워요." });
  }
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
    const a = bs[i][1], b = bs[j][1], tag = `${bs[i][0]}지 ${BR[a]} · ${bs[j][0]}지 ${BR[b]}`;
    if (isClash(a, b)) rel.push({ t: "충", tag, txt: "충 — 두 자리가 맞부딪혀 이동·변동이 잦아요. 정체되지 않는 활동력의 원천이기도 합니다." });
    if (isHarmony(a, b)) rel.push({ t: "합", tag, txt: "육합 — 서로 맞물려 협력과 인연이 생기는 자리." });
    if (isWonjin(a, b)) rel.push({ t: "원진", tag, txt: "원진 — 이유 없이 서운함이 쌓이기 쉬운 관계. 말로 분명히 표현하는 게 좋아요." });
    if (isHyung(a, b)) rel.push({ t: "형", tag, txt: a === b ? "자형 — 스스로를 몰아붙이는 경향. 혼자 끙끙 앓지 않는 게 중요해요." : "형 — 마찰과 조정이 필요한 자리. 규칙·법·건강 관리를 꼼꼼히 하면 오히려 힘이 됩니다." });
  }
  const bset = bs.map(x => x[1]);
  [[8,0,4,"申子辰","수(水)"],[2,6,10,"寅午戌","화(火)"],[5,9,1,"巳酉丑","금(金)"],[11,3,7,"亥卯未","목(木)"]].forEach(([x, y, z, nm, el]) => {
    const n = [x, y, z].filter(v => bset.includes(v)).length;
    if (n === 3) rel.push({ t: "삼합", tag: nm, txt: `삼합 — 세 지지가 모여 ${el} 기운이 크게 강해지는 구조.` });
    else if (n === 2 && bset.includes(y)) rel.push({ t: "반합", tag: nm, txt: `반합 — ${el} 기운이 한쪽으로 모이는 경향.` });
  });
  return { sinsal, rel, gongmang: gm };
}
