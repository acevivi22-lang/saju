// 상담형 풀이: 원국·용신·대운·세운을 근거로 문장을 만든다
import { STEM, STEM_KO, BR, BR_KO, EL_KO, EL_HAN, BR_EL, BR_MAIN, HIDDEN, mod, stemEl, tenGod, pname, pko, monthsOfSajuYear, pillarsAt, daewoonAt } from "./core.js";
import { GROUP_KO, GROUP_OF_GOD, groupElement, stageOf, positions } from "./analysis.js";
import { gradeOf, yearFortune, monthFortune, daewoonFortune, upcomingMonths } from "./fortune.js";

export const ELX = (e) => `${EL_KO[e]}(${EL_HAN[e]})`;
const EL_FINAL = [true, false, false, true, false]; // 목 화 토 금 수 받침
export const ELJ = (e, a, b) => ELX(e) + (EL_FINAL[e] ? a : b);
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1); return (c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28) ? a : b; };
const P = arr => arr.filter(Boolean).map(x => `<p>${x}</p>`).join("");

export const DM = [
  { img: "큰 나무", core: "곧게 위로 뻗으려는 성장 욕구가 강하고, 명분과 자존심을 중요하게 여깁니다.", good: "무언가를 처음 시작하고 사람들을 이끄는 힘, 맡은 일에 대한 책임감", weak: "굽힐 줄 몰라 한 번 꺾이면 회복이 느리고, 남에게 도움을 청하는 걸 어려워해요", tip: "부러지지 않으려면 가지치기가 필요합니다. 목표를 크게 세우되, 중간에 방향을 조정하는 걸 실패로 여기지 마세요." },
  { img: "화초와 덩굴", core: "유연하고 생존력이 강해서 어떤 환경에서도 뿌리를 내립니다. 겉은 부드럽지만 속은 끈질겨요.", good: "적응력, 사람 사이를 조율하는 감각, 오래 버티는 끈기", weak: "눈치를 많이 보고, 결정을 미루거나 서운함을 속으로 쌓아두기 쉬워요", tip: "기댈 곳(사람·조직·지지대)을 잘 고르는 게 실력입니다. 내 의견을 한 문장으로 먼저 말하는 연습이 도움이 돼요." },
  { img: "하늘의 태양", core: "밝고 솔직하며 공평합니다. 숨기는 것 없이 드러내고, 사람들을 끌어당기는 힘이 있어요.", good: "추진력, 분위기를 띄우는 힘, 남을 돕는 마음", weak: "시작은 크고 마무리가 약하며, 감정이 얼굴과 말에 바로 드러나요", tip: "마감과 마무리를 대신 챙겨 줄 시스템(체크리스트, 꼼꼼한 파트너)을 곁에 두면 결과가 확 달라집니다." },
  { img: "촛불과 등불", core: "조용히 주변을 밝히는 섬세함과 집중력이 있습니다. 한 분야를 깊게 파고드는 사람이에요.", good: "몰입, 배려, 따뜻한 헌신, 정교한 손끝", weak: "예민해서 걱정이 많고, 남의 감정까지 떠안다가 쉽게 지쳐요", tip: "불은 바람을 막아야 오래 탑니다. 에너지를 뺏는 사람과 일은 과감히 정리하세요." },
  { img: "큰 산", core: "묵직하고 믿음직합니다. 쉽게 움직이지 않지만 한 번 정하면 오래 가요.", good: "신뢰, 포용력, 중재하는 힘, 인내", weak: "변화에 느리고 고집이 세며, 속마음을 잘 드러내지 않아 오해를 사기도 해요", tip: "산은 움직이지 않아도 됩니다. 대신 변화가 올 때 '언제까지 결정한다'는 기한을 스스로 정해 두세요." },
  { img: "기름진 밭", core: "실속 있고 현실 감각이 좋습니다. 사람과 일을 키워내는 힘이 있어요.", good: "꼼꼼한 관리, 사람을 키우는 능력, 현실적인 판단", weak: "걱정과 의심이 많고, 손해 보지 않으려다 기회를 놓치기도 해요", tip: "밭은 씨앗이 있어야 의미가 있습니다. 완벽하게 준비될 때까지 기다리지 말고 작게 심어 보세요." },
  { img: "원석과 칼", core: "결단력과 의리가 있고 맺고 끊음이 분명합니다. 다듬어질수록 빛나는 사람이에요.", good: "실행력, 위기에 강함, 의리와 정의감", weak: "말과 행동이 거칠게 비칠 수 있고, 타협을 어려워해요", tip: "쇠는 불로 단련됩니다. 힘든 환경을 피하기보다 '나를 다듬는 과정'으로 받아들일 때 크게 성장해요." },
  { img: "보석", core: "섬세하고 자존심이 강하며 완성도를 중요하게 여깁니다. 감각이 예리해요.", good: "미적 감각, 정확성, 품질에 대한 집착", weak: "상처를 잘 받고 비판에 예민하며, 완벽주의로 시작을 늦추기도 해요", tip: "보석은 깨끗한 물에 씻길 때 빛납니다. 나를 알아봐 주는 환경과 사람을 고르는 게 중요해요." },
  { img: "큰 강과 바다", core: "생각의 폭이 넓고 흐름을 읽습니다. 자유롭고 스케일이 커요.", good: "큰 그림을 보는 눈, 유연한 전략, 포용력", weak: "관심사가 넓어 산만해지기 쉽고, 한 가지를 끝까지 붙잡는 끈기가 약할 수 있어요", tip: "물은 둑이 있어야 힘이 됩니다. 루틴과 마감이라는 둑을 스스로 쌓아 두세요." },
  { img: "비와 이슬", core: "조용히 스며드는 지혜가 있습니다. 관찰력이 좋고 속이 깊어요.", good: "분석력, 공감, 기획력, 남들이 못 보는 걸 보는 눈", weak: "생각이 많아 실행이 늦고, 불안을 혼자 키우기 쉬워요", tip: "비는 내려야 의미가 있습니다. 생각을 기록하고, 작은 것부터 바로 실행하는 습관이 운을 엽니다." }
];

const SEASON = b => [11,0,1].includes(b) ? "겨울" : [2,3,4].includes(b) ? "봄" : [5,6,7].includes(b) ? "여름" : "가을";

export const STAGE_TXT = { "장생":"새로 시작하는 힘, 성장 가능성","목욕":"감수성과 변화, 멋과 유행에 민감","관대":"자신감과 의욕, 사회로 나서는 힘","건록":"자립과 실력, 스스로 일어서는 힘","제왕":"기운이 가장 센 자리, 주도권과 고집","쇠":"노련함과 안정, 한발 물러선 여유","병":"섬세함과 공감, 걱정이 많아지기 쉬움","사":"생각이 깊고 정적, 연구 기질","묘":"저장과 축적, 알뜰하고 속을 잘 안 드러냄","절":"단절과 새 출발, 변화가 잦음","태":"계획과 잉태, 아이디어가 많음","양":"보살핌을 받으며 자라는 힘, 순한 기질" };

export const GOD = {
  "비견":{kw:"독립·자기 힘",day:"내 뜻대로 밀고 나가기 좋은 날입니다. 친구나 동료와 엮이는 일이 생기기 쉬운데, 고집은 한 번 접어두는 게 좋아요.",period:"자립심과 경쟁심이 커지는 시기입니다. 혼자 힘으로 기반을 다지기 좋지만, 돈이 여러 갈래로 나가기 쉬워요."},
  "겁재":{kw:"경쟁·과감함",day:"승부욕이 올라오는 날입니다. 충동적인 지출이나 내기는 피하고, 그 기운을 운동이나 마감에 쓰세요.",period:"추진력과 경쟁이 함께 오는 시기입니다. 큰돈 거래나 보증, 동업은 신중하게 하세요."},
  "식신":{kw:"표현·여유·먹을 복",day:"몸과 마음이 풀리고 결과물이 잘 나오는 날입니다. 공부나 창작에 손이 잘 가요.",period:"재능을 꾸준히 쌓아 결과로 만드는 시기입니다. 생활 리듬과 건강이 안정되기 쉬워요."},
  "상관":{kw:"재능·말·돌파",day:"아이디어와 말발이 서는 날입니다. 대신 말이 날카로워지기 쉬우니 윗사람 앞에서는 한 템포 쉬세요.",period:"기존 틀을 깨고 새로운 걸 시도하는 시기입니다. 규칙이나 조직과 부딪히는 일은 조심하세요."},
  "편재":{kw:"기회·활동·큰돈의 흐름",day:"움직이면 기회가 보이는 날입니다. 사람을 만나고 시장을 살피기 좋아요. 계획 없는 지출은 조심.",period:"활동 반경이 넓어지고 사업·투자 기회가 들어오는 시기입니다. 들어오는 만큼 나가기 쉬우니 관리가 핵심이에요."},
  "정재":{kw:"성실·안정된 수입",day:"차근차근 정리하고 마무리하기 좋은 날입니다. 꼼꼼하게 한 만큼 그대로 돌아와요.",period:"꾸준한 노력이 안정된 결과로 돌아오는 시기입니다. 저축과 계획에 유리해요."},
  "편관":{kw:"압박·도전·결단",day:"해야 할 일이 몰리거나 압박이 오는 날입니다. 피하지 말고 정면으로 처리하면 오히려 힘이 붙어요.",period:"시험, 책임, 변화가 한꺼번에 오는 시기입니다. 버텨내면 크게 단련되고 자리가 올라가요."},
  "정관":{kw:"질서·명예·인정",day:"원칙대로 하면 인정받는 날입니다. 서류, 약속, 공식적인 일을 처리하기 좋아요.",period:"자리와 신뢰가 쌓이는 시기입니다. 시험, 취업, 승진처럼 공식적인 성과에 유리해요."},
  "편인":{kw:"직관·연구·몰입",day:"생각이 깊어지고 혼자 파고들기 좋은 날입니다. 기분이 가라앉기 쉬우니 산책을 끼워 넣으세요.",period:"특별한 공부나 기술을 깊게 익히는 시기입니다. 계획이 자주 바뀌기 쉬우니 하나를 끝까지 붙잡으세요."},
  "정인":{kw:"배움·도움·회복",day:"배우고 받아들이기 좋은 날입니다. 윗사람이나 책에서 도움을 얻어요. 쉬어가도 괜찮은 날.",period:"공부, 자격, 문서 운이 좋은 시기입니다. 주변의 지원을 받아 기반을 다져요."}
};

const GROUP_MANY = { bi:"주관이 뚜렷하고 독립심이 강합니다. 남 밑에 있기보다 내 방식대로 하려 하고, 경쟁에서 힘을 냅니다. 다만 돈이 여러 갈래로 새거나 동업에서 부딪히기 쉬워요.",
  sik:"표현력과 재능이 많습니다. 말과 글, 손재주로 결과물을 잘 만들어요. 대신 하고 싶은 말을 참기 어렵고, 틀에 박힌 조직은 답답해할 수 있어요.",
  jae:"현실 감각이 좋고 돈의 흐름을 읽습니다. 활동적이고 사람을 잘 다뤄요. 다만 욕심을 감당할 체력과 실력이 받쳐줘야 해요.",
  gwan:"책임감이 강하고 규칙과 질서를 중요하게 여깁니다. 조직에서 인정받기 쉽지만, 스스로를 압박하고 스트레스를 쌓아두기 쉬워요.",
  in:"생각이 깊고 배우기를 좋아합니다. 공부와 자격에 강하고 윗사람의 도움을 받기 쉬워요. 대신 생각이 많아 실행이 늦어지기 쉽습니다." };
const GROUP_NONE = { bi:"비겁이 없어 자기주장이 약하고 혼자 버티는 힘이 부족할 수 있어요. 믿을 만한 동료를 곁에 두면 힘이 납니다.",
  sik:"식상이 없어 표현이 서툴거나 결과물을 내기까지 시간이 걸릴 수 있어요. 기록하고 보여주는 습관이 보완이 됩니다.",
  jae:"재성이 없어 돈 관리에 무심하기 쉬워요. 가계부나 목표 금액처럼 숫자로 된 계획을 일부러 세우는 게 좋아요.",
  gwan:"관성이 없어 자유로운 편이고 규칙에 묶이는 걸 싫어합니다. 스스로 마감과 루틴을 만들면 흐트러지지 않아요.",
  in:"인성이 없어 생각보다 행동이 먼저 나가요. 공부는 의지보다 정해진 루틴과 환경으로 붙잡는 게 효과적입니다." };
const CAREER = { "비견":"독립 사업, 프리랜서, 운동·코칭, 영업처럼 내 힘으로 성과를 내는 일","겁재":"경쟁이 있는 영업, 스포츠, 투자·트레이딩, 승부를 거는 사업","식신":"연구, 전문 기술, 요리·식품, 교육, 꾸준히 만드는 콘텐츠","상관":"기획, 마케팅, 방송·예술, 강연, 말과 아이디어로 승부하는 일","편재":"사업, 무역·유통, 영업, 투자처럼 돈과 사람이 크게 오가는 일","정재":"회계, 금융, 관리, 행정처럼 정확하고 꾸준함이 필요한 일","편관":"군·경찰, 법조, 의료, 위기관리, 강한 책임이 따르는 일","정관":"공직, 대기업, 관리직, 행정처럼 체계 안에서 올라가는 일","편인":"연구, IT·개발, 디자인, 철학, 특수 기술","정인":"교육, 학문, 자격 기반 전문직, 문서를 다루는 일" };
const GYEOK_TXT = { "비견":"내 힘으로 서는 그릇입니다. 남의 밑보다 독립된 자리에서 실력을 키울 때 편안해요.","겁재":"경쟁 속에서 크는 그릇입니다. 라이벌이 있을 때 오히려 실력이 늘어요.","식신":"재능을 꾸준히 생산하는 그릇입니다. 한 우물을 파서 결과물을 쌓을수록 가치가 커져요.","상관":"틀을 깨고 새것을 만드는 그릇입니다. 말과 아이디어로 판을 바꾸는 역할이 맞아요.","편재":"큰 흐름의 돈과 사람을 다루는 그릇입니다. 현장과 시장에서 기회를 잡는 역할이에요.","정재":"차곡차곡 쌓는 그릇입니다. 정확함과 성실함으로 신뢰를 얻어요.","편관":"압박 속에서 단련되는 그릇입니다. 위기를 맡을수록 존재감이 커져요.","정관":"질서 안에서 올라가는 그릇입니다. 조직과 제도 속에서 인정받는 길이 열려요.","편인":"남들이 안 가는 길을 깊게 파는 그릇입니다. 특수한 기술과 연구에서 빛나요.","정인":"배움과 자격으로 서는 그릇입니다. 공부한 만큼 자리가 생겨요." };
const ORGAN = ["간·담, 눈, 근육과 힘줄","심장·소장, 혈압, 혈액순환","위·비장, 소화기","폐·대장, 호흡기, 피부","신장·방광, 뼈, 허리"];
export const BOOST = [
  { color: "초록·청록", dir: "동쪽", act: "아침 산책, 식물 키우기, 새 계획 세우기, 책 읽기" },
  { color: "붉은 계열·따뜻한 색", dir: "남쪽", act: "햇볕 쬐기, 유산소 운동, 사람 만나기, 발표와 표현" },
  { color: "베이지·황토색", dir: "중앙(집·본거지)", act: "규칙적인 식사, 일정한 루틴, 저축, 기반 다지기" },
  { color: "흰색·은색", dir: "서쪽", act: "정리정돈, 마감 정하기, 근력 운동, 결단 내리기" },
  { color: "검정·남색", dir: "북쪽", act: "충분한 수면, 명상, 혼자 생각하는 시간, 물가 산책" }
];
const ROLE_TXT = { "용신":"가장 필요한 기운", "희신":"용신을 돕는 반가운 기운", "한신":"크게 영향 없는 기운", "구신":"기신을 돕는 부담스러운 기운", "기신":"가장 부담되는 기운" };

export function scoreChip(score, care) {
  const g = gradeOf(score, care);
  return `<span class="sc g${g.lv}${care ? " care" : ""}">${score}<small>${g.name}</small></span>`;
}
const favWord = f => f >= 0.5 ? "반가운" : f >= 0.15 ? "무난히 도움 되는" : f > -0.15 ? "중립적인" : f > -0.5 ? "약간 부담되는" : "부담되는";
const ym = mo => `${mo.startDate.m}/${mo.startDate.d}~${mo.endDate.m}/${mo.endDate.d}`;
const moLabel = mo => `${mo.startDate.y}년 ${mo.startDate.m}월 ${mo.startDate.d}일경~ (${pname(mo.pillar)}월)`;

function curDaewoon(c, today) {
  const ms = Date.UTC(today[0], today[1] - 1, today[2]);
  return daewoonAt(c, ms);
}

// ---------- 섹션들 ----------
export function sections(ctx) {
  const { c, a, gy, sr, today, p } = ctx;
  const ds = c.day[0], de = stemEl(ds), dm = DM[ds];
  const out = [];
  const now = pillarsAt(...today);
  const yf = yearFortune(c, a, now.sajuYear);
  const cdw = curDaewoon(c, today);

  // 1. 한눈에
  {
    const lines = [
      `<b>일간 ${STEM[ds]}(${STEM_KO[ds]}${EL_KO[de]})</b> — ${dm.img}의 기운을 타고났어요. ${dm.core}`,
      `<b>${a.strength}</b> 사주입니다. 나를 돕는 기운이 전체의 ${Math.round(a.ratio * 100)}%예요.`,
      `<b>용신은 ${ELX(a.yongEl)}, ${GROUP_KO[a.yongGrp]}</b>입니다. ${a.yongWhy}.`,
      `<b>${gy.name}</b> — ${GYEOK_TXT[gy.god]}`,
      cdw ? `지금은 <b>${pname(cdw.pillar)} 대운</b>(만 ${cdw.age}~${cdw.age + 9}세), 올해 ${pname(yf.pillar)}년 종합 ${scoreChip(yf.s.total)}` : `아직 첫 대운(만 ${c.startAge}세) 전이에요.`
    ];
    out.push({ id: "sum", title: "한눈에 보는 사주", html: `<ul class="keys">${lines.map(l => `<li>${l}</li>`).join("")}</ul>` });
  }

  // 2. 타고난 성향
  {
    const mb = c.month[1], season = SEASON(mb), mEl = BR_EL[mb];
    const deuk = mEl === de || mEl === mod(de + 4, 5);
    const stage = stageOf(ds, c.day[1]);
    const order = Object.keys(a.grpCount).sort((x, y) => a.grpCount[y] - a.grpCount[x]);
    const none = order.filter(k => a.grpCount[k] === 0);
    const boxes = `<div class="gods">${["bi","sik","jae","gwan","in"].map(k => `<div class="gbox${k === a.yongGrp ? " yong" : ""}"><b>${a.grpCount[k]}</b><span>${GROUP_KO[k]}</span></div>`).join("")}</div>`;
    out.push({ id: "me", title: "타고난 성향", html:
      P([
        `${ELX(de)} 일간, ${dm.img}의 기운으로 태어나셨네요. ${dm.core}`,
        `${season}(${BR[mb]}월)에 태어났습니다. ${deuk ? `제철을 만난 셈이라(득령) 기본 체력과 자기 확신이 있는 편이에요.` : `제철이 아닌 때라(실령) 혼자 힘으로 밀기보다 환경과 사람을 잘 고를 때 힘이 납니다.`}`,
        `<b>강점</b>은 ${dm.good}입니다. <b>약점</b>은 ${dm.weak}.`,
        `배우자 자리이자 '생활 속의 나'인 일지 ${BR[c.day[1]]}${josa(BR_KO[c.day[1]], "은", "는")} 12운성으로 ${stage}이에요. ${STAGE_TXT[stage]}의 기질이 일상에서 드러납니다.`
      ]) + `<h4>십신 분포</h4>${boxes}` +
      P([`<b>${GROUP_KO[order[0]]}</b>이 가장 많아요. ${GROUP_MANY[order[0]]}`, ...none.map(k => GROUP_NONE[k])]) +
      `<div class="advice"><b>상담 메모</b> ${dm.tip}</div>` });
  }

  // 3. 강약과 용신
  {
    const roles = [0,1,2,3,4].sort((x, y) => a.fav[y] - a.fav[x]);
    const monthHelp = BR_EL[c.month[1]] === de || BR_EL[c.month[1]] === mod(de + 4, 5);
    const bst = BOOST[a.yongEl];
    out.push({ id: "yong", title: "사주의 힘과 필요한 기운", html:
      `<div class="gauge"><div class="gauge-track"><div class="gauge-fill" style="width:${Math.round(a.ratio * 100)}%"></div><span class="gauge-mid"></span></div><div class="gauge-lab"><span>신약</span><span>중화</span><span>신강</span></div></div>` +
      P([
        `나를 돕는 기운(비겁·인성)이 ${Math.round(a.ratio * 100)}%, 내가 쓰는 기운(식상·재성·관성)이 ${100 - Math.round(a.ratio * 100)}%라 <b>${a.strength}</b>으로 봅니다. 가장 무게가 큰 월지 ${BR[c.month[1]]}${josa(BR_KO[c.month[1]], "이", "가")} ${monthHelp ? "나를 돕고 있어 힘이 실려요." : "나를 돕지 않는 기운이라 힘이 분산돼요."}`,
        `그래서 이 사주에는 <b>${ELJ(a.yongEl, "이", "가")}</b> 가장 필요합니다. ${a.yongWhy}.`,
        a.johu
      ]) +
      `<table class="roles"><tbody>${roles.map(e => `<tr class="${a.role[e] === "용신" ? "yong" : a.role[e] === "기신" ? "gi" : ""}"><th><span class="el e${e}">${EL_HAN[e]}</span> ${EL_KO[e]}</th><td>${a.role[e]}</td><td class="muted">${ROLE_TXT[a.role[e]]} · ${GROUP_KO[["bi","sik","jae","gwan","in"][mod(e - de, 5)]]}</td><td><span class="favbar"><i style="${a.fav[e] >= 0 ? `left:50%;width:${a.fav[e] * 50}%` : `right:50%;width:${-a.fav[e] * 50}%`}" class="${a.fav[e] >= 0 ? "pos" : "neg"}"></i></span></td></tr>`).join("")}</tbody></table>` +
      `<div class="advice"><b>${EL_KO[a.yongEl]} 기운 채우는 법</b> 색은 ${bst.color}, 방향은 ${bst.dir}. ${bst.act}. 운에서 ${EL_KO[a.yongEl]}${josa(EL_KO[a.yongEl], "이", "가")} 들어오는 해·달·날에 점수가 올라가는 이유도 이것 때문이에요.</div>` });
  }

  // 4. 직업
  {
    const yongTxt = { bi:"동료와 함께 하되 내 지분과 결정권이 있는 일", sik:"내 재능과 기술로 결과물을 만드는 일", jae:"돈과 숫자, 현장을 직접 다루는 일", gwan:"조직과 제도 안에서 책임을 맡는 일", in:"공부·자격·전문지식으로 승부하는 일" }[a.yongGrp];
    out.push({ id: "job", title: "직업과 적성", html: P([
      `격국은 <b>${gy.name}</b>입니다${gy.transparent ? ` (월지 속 ${STEM[gy.stem]}${josa(STEM_KO[gy.stem], "이", "가")} 천간에 드러나 격이 뚜렷해요)` : ""}. ${GYEOK_TXT[gy.god]}`,
      `격으로 보면 잘 맞는 분야는 ${CAREER[gy.god]}입니다.`,
      `용신이 ${GROUP_KO[a.yongGrp]}이라 <b>${yongTxt}</b>을 할 때 운이 따라줍니다. 격과 용신이 같은 방향이면 그 길이 가장 자연스럽고, 다르면 '격의 분야 안에서 용신의 방식으로' 일하는 게 좋아요.`,
      a.strong ? "신강한 사주는 맡겨진 일보다 직접 판을 짜는 자리에서 힘이 납니다. 결정권이 있는 역할, 독립·창업도 잘 맞아요." : "신약한 사주는 좋은 조직과 스승 아래서 실력을 쌓은 뒤 독립하는 순서가 안전합니다. 자격과 전문성으로 자리를 만드는 길이 안정적이에요.",
      a.grpCount.gwan === 0 ? "관성이 없어 위계가 강한 조직보다 자율이 보장되는 환경이 맞아요." : "",
      a.grpCount.in >= 2 ? "인성이 두터워 시험·자격·학위로 길을 여는 데 강합니다." : ""
    ]) });
  }

  // 5. 재물
  {
    const j = a.grpCount.jae, s = a.grpCount.sik, b = a.grpCount.bi, t = [];
    if (j === 0) t.push("재성이 원국에 없습니다. 돈 자체를 좇기보다 일과 실력에 집중할 때 돈이 따라오는 구조예요. 큰 한 방보다 꾸준히 모으는 방식이 맞습니다.");
    else if (j >= 3) t.push(a.strong ? "재성이 많고 사주가 신강해서 돈을 다루는 힘이 있습니다. 사업이나 활동적인 수입 구조에서 기회를 잘 잡아요." : "재성이 많은데 사주가 신약한 편이라(재다신약) 돈 욕심에 비해 감당할 힘이 모자랄 수 있어요. 판을 무리하게 키우기보다 내 몸집에 맞는 규모를 지키는 게 핵심입니다.");
    else t.push("재성이 적당히 있어 돈에 대한 감각이 균형 잡혀 있습니다.");
    if (s > 0 && j > 0) t.push("식상과 재성이 함께 있어(식상생재) 내 재능과 결과물이 돈으로 이어지는 흐름이 좋습니다. 기술·콘텐츠·제품으로 버는 구조가 잘 맞아요.");
    if (b >= 3 && j > 0) t.push("비겁이 많아 돈이 들어와도 나눠지기 쉽습니다(군겁쟁재). 동업, 보증, 돈 빌려주기는 특히 신중하게 하세요.");
    const jaeFav = a.fav[groupElement(de, "jae")];
    t.push(`재성인 ${ELJ(groupElement(de, "jae"), "은", "는")} 이 사주에 ${favWord(jaeFav)} 기운이에요. ${jaeFav > 0.15 ? "재성 운이 올 때 적극적으로 움직이면 성과가 납니다." : "재성 운이 와도 욕심을 키우기보다 지키는 쪽으로 쓰는 게 안전해요."}`);
    const years = nextYears(c, a, today[0], 10).sort((x, y) => y.s.money - x.s.money);
    out.push({ id: "money", title: "재물", html: P(t) + `<h4>앞으로 10년 중 재물운이 높은 해</h4>` + yearList(years.slice(0, 3), "money") });
  }

  // 6. 연애·결혼
  {
    const male = c.gender === "M", sg = male ? "jae" : "gwan", n = a.grpCount[sg];
    const dz = c.day[1], dzGod = tenGod(ds, BR_MAIN[dz]);
    const t = [];
    t.push(`${male ? "남자 사주에서 배우자 별은 재성" : "여자 사주에서 배우자 별은 관성"}이고, 원국에 ${n}개 있어요. ` + (n === 0 ? "배우자 별이 없어 인연이 늦게 오거나, 연애보다 내 일에 더 집중하는 시기가 길 수 있어요. 운에서 그 별이 들어올 때 인연이 강하게 옵니다." : n >= 3 ? "배우자 별이 많아 이성의 관심을 받기 쉽고 인연의 기회가 많습니다. 그만큼 선택과 정리가 중요해요." : "배우자 별이 적당히 있어 인연이 자연스럽게 이어지는 편입니다."));
    t.push(`배우자 자리인 일지에는 ${BR[dz]}(${dzGod})${josa(dzGod, "이", "가")} 있어요. ` + ({ bi:"친구 같은 동등한 관계를 원하고,", sik:"편안하고 함께 즐기는 관계를 원하고,", jae:"현실적으로 챙겨주고 챙김받는 관계를 원하고,", gwan:"서로 책임지고 지켜주는 관계를 원하고,", in:"정서적으로 기댈 수 있는 관계를 원하고," })[GROUP_OF_GOD[dzGod]] + ` 그런 상대와 오래 갑니다.`);
    const dzRel = sr.rel.filter(r => r.tag.includes("일지"));
    if (dzRel.some(r => r.t === "충")) t.push("일지가 충을 받아 관계에 변화가 잦거나 떨어져 지내는 시기가 생기기 쉬워요. 각자의 공간을 존중하는 관계가 오래갑니다.");
    if (dzRel.some(r => r.t === "합")) t.push("일지가 합을 이루고 있어 한번 맺은 인연에 정이 깊어요.");
    if (Object.values(sr.sinsal).flat().some(x => x[0] === "도화")) t.push("원국에 도화가 있어 사람을 끄는 매력이 있습니다.");
    const years = nextYears(c, a, today[0], 10).sort((x, y) => y.s.love - x.s.love);
    out.push({ id: "love", title: "연애와 결혼", html: P(t) + `<h4>앞으로 10년 중 인연운이 높은 해</h4>` + yearList(years.slice(0, 3), "love") });
  }

  // 7. 건강
  {
    const cnt = a.wEl, total = cnt.reduce((x, y) => x + y, 0);
    const low = [0,1,2,3,4].filter(e => cnt[e] / total < 0.08);
    const high = [0,1,2,3,4].filter(e => cnt[e] / total >= 0.33);
    const gi = Object.keys(a.role).find(e => a.role[e] === "기신");
    out.push({ id: "health", title: "건강", html: P([
      "명리에서는 오행이 너무 적거나 너무 많은 쪽을 약한 부위로 봅니다. 전통적인 연결일 뿐이니, 실제 증상은 꼭 병원에서 확인하세요.",
      low.length ? `<b>부족한 오행</b> · ${low.map(e => `${ELX(e)}: ${ORGAN[e]}`).join(" / ")} 쪽을 평소에 챙기면 좋아요.` : "",
      high.length ? `<b>넘치는 오행</b> · ${high.map(e => `${ELX(e)}: ${ORGAN[e]}`).join(" / ")} 쪽에 무리가 쌓이기 쉬워요.` : "",
      !low.length && !high.length ? "오행이 고르게 분포해 크게 치우친 곳은 없는 편입니다." : "",
      gi !== undefined ? `기신인 ${ELX(+gi)} 기운이 강해지는 해·달에는 ${ORGAN[+gi]} 쪽 컨디션이 흔들리기 쉬워요. 그때는 '건강·안전' 점수가 올라가니 달력에서 확인하세요.` : "",
      a.strong ? "기운이 넘치는 사주라 쌓인 에너지를 운동으로 풀어주는 게 건강의 핵심이에요." : "기운이 약한 편이라 과로를 피하고 잠과 식사를 규칙적으로 지키는 게 가장 큰 보약이에요."
    ]) });
  }

  // 8. 대운
  {
    const rows = c.daewoon.map(d => {
      const f = daewoonFortune(c, a, d), g = tenGod(ds, d.pillar[0]), gb = tenGod(ds, BR_MAIN[d.pillar[1]]);
      const isNow = cdw && cdw.age === d.age;
      return `<tr class="${isNow ? "now" : ""}"><td class="num">${d.age}~${d.age + 9}<br><span class="muted">${c.birthYear + d.age}년~</span></td><td class="hj">${pname(d.pillar)}</td><td>${g}/${gb}</td><td>${scoreChip(f.s.total)}</td></tr>`;
    }).join("");
    let cur = "";
    if (cdw) {
      const f = daewoonFortune(c, a, cdw), g = tenGod(ds, cdw.pillar[0]), gb = tenGod(ds, BR_MAIN[cdw.pillar[1]]);
      const idx = c.daewoon.findIndex(d => d.age === cdw.age), nx = c.daewoon[idx + 1];
      cur = P([
        `지금은 <b>${pname(cdw.pillar)} 대운</b>(만 ${cdw.age}~${cdw.age + 9}세)입니다. 천간 ${STEM[cdw.pillar[0]]}${josa(STEM_KO[cdw.pillar[0]], "은", "는")} ${g}, 지지 ${BR[cdw.pillar[1]]}${josa(BR_KO[cdw.pillar[1]], "은", "는")} ${gb}${josa(gb, "이에요", "예요")}. ${GOD[gb].period}`,
        `오행으로는 ${ELX(stemEl(cdw.pillar[0]))}·${ELJ(BR_EL[cdw.pillar[1]], "이", "가")} 들어오는데, 이 사주에 각각 ${favWord(a.fav[stemEl(cdw.pillar[0])])} 기운, ${favWord(a.fav[BR_EL[cdw.pillar[1]]])} 기운입니다. 이 대운의 바탕 점수 ${scoreChip(f.s.total)} — 10년 내내 깔리는 점수예요.`,
        f.layer.why.length ? `원국과의 작용: ${f.layer.why.join(", ")}.` : "",
        nx ? `${c.birthYear + nx.age}년쯤부터는 ${pname(nx.pillar)} 대운(${tenGod(ds, nx.pillar[0])}/${tenGod(ds, BR_MAIN[nx.pillar[1]])})으로 넘어갑니다. 대운이 바뀌는 전후 1~2년은 환경 변화가 크게 느껴지기 쉬워요.` : ""
      ]);
    }
    out.push({ id: "dw", title: "대운 — 10년 단위 큰 흐름", html: cur +
      `<div class="tbl"><table class="dwt"><thead><tr><th>나이(만)</th><th>대운</th><th>십신</th><th>점수</th></tr></thead><tbody>${rows}</tbody></table></div>` +
      `<p class="muted small">대운은 ${c.forward ? "순행" : "역행"}, 대운수 ${c.startAge}. 대운 점수는 그 10년의 바탕 점수이고, 실제 해마다의 점수는 세운이 더해져 정해져요.</p>` });
  }

  // 9. 올해와 내년
  {
    const blocks = [now.sajuYear, now.sajuYear + 1].map(Y => {
      const f = yearFortune(c, a, Y), g = tenGod(ds, f.pillar[0]), gb = tenGod(ds, BR_MAIN[f.pillar[1]]);
      const ms = monthsOfSajuYear(Y).map(mo => monthFortune(c, a, mo));
      const best = ms.slice().sort((x, y) => y.s.total - x.s.total).slice(0, 2);
      const worst = ms.slice().sort((x, y) => x.s.total - y.s.total).slice(0, 2);
      const why = f.layers.yr.why;
      return `<h4>${Y}년 ${pname(f.pillar)}년 ${scoreChip(f.s.total)}</h4>` + P([
        `세운 천간 ${STEM[f.pillar[0]]}(${g}), 지지 ${BR[f.pillar[1]]}(${gb}). ${GOD[gb].period}`,
        `대운 ${f.dw.pre ? "전(월주 기준)" : pname(f.dw.pillar)} ${f.layers.dw.s.total}점 위에 세운 ${f.layers.yr.s.total}점이 더해진 해예요.${why.length ? ` 원국과는 ${why.join(", ")}.` : ""}`,
        `가장 좋은 달은 ${best.map(m => `${m.mo.startDate.m}월 ${m.mo.startDate.d}일경~(${m.s.total}점)`).join(", ")}, 조심할 달은 ${worst.map(m => `${m.mo.startDate.m}월 ${m.mo.startDate.d}일경~(${m.s.total}점)`).join(", ")}입니다.`
      ]) + `<div class="mbars">${ms.map(m => { const gg = gradeOf(m.s.total); return `<div class="mb" title="${moLabel(m.mo)} ${m.s.total}점"><i class="g${gg.lv}" style="height:${Math.max(6, m.s.total)}%"></i><span>${m.mo.startDate.m}월</span></div>`; }).join("")}</div>`;
    }).join("");
    out.push({ id: "year", title: "올해와 내년", html: blocks + `<p class="muted small">사주의 한 해는 입춘(2월 4일경)에, 한 달은 절기에 바뀝니다. 막대는 각 절기 달의 종합 점수예요.</p>` });
  }
  return out;
}

function nextYears(c, a, Y0, n) { const r = []; for (let Y = Y0; Y < Y0 + n; Y++) r.push(yearFortune(c, a, Y)); return r; }
function yearList(list, cat) {
  return `<ul class="plain">${list.map(f => `<li><b>${f.Y}년 ${pname(f.pillar)}</b> ${scoreChip(f.s[cat])} <span class="muted">종합 ${f.s.total}</span></li>`).join("")}</ul>`;
}

// ---------- 상담 질문 ----------
export const QUESTIONS = [
  { id: "year", q: "올해 전체 흐름은 어때요?" },
  { id: "biz", q: "사업·창업은 언제 시작하면 좋을까요?" },
  { id: "job", q: "취업·이직하기 좋은 때는?" },
  { id: "exam", q: "시험 합격운이 좋은 때는?" },
  { id: "love", q: "연애·결혼 인연은 언제 오나요?" },
  { id: "money", q: "돈 모으기·투자하기 좋은 때는?" },
  { id: "move", q: "이사·이동하기 좋은 때는?" },
  { id: "care", q: "특히 조심해야 할 시기는?" }
];
const QSCORE = {
  biz: s => s.money * 0.4 + s.work * 0.3 + s.total * 0.3 - s.loss * 0.15,
  job: s => s.work * 0.45 + s.doc * 0.3 + s.total * 0.25,
  exam: s => s.study * 0.55 + s.doc * 0.2 + s.total * 0.25,
  love: s => s.love * 0.6 + s.total * 0.4,
  money: s => s.money * 0.5 + s.total * 0.3 - s.loss * 0.25,
  move: s => s.move * 0.55 + s.total * 0.45,
  care: s => Math.max(s.health, s.talk, s.loss) * 0.6 + (100 - s.total) * 0.4
};
const QCAT = { biz: "money", job: "work", exam: "study", love: "love", money: "money", move: "move" };

function monthReason(c, a, m) {
  const ds = c.day[0];
  const g = tenGod(ds, BR_MAIN[m.mo.pillar[1]]), gs = tenGod(ds, m.mo.pillar[0]);
  const ws = [...new Set(m.layers.mo.why)];
  return `${pname(m.mo.pillar)}월(${gs}/${g}) · 대운 ${m.layers.dw.s.total} · 세운 ${m.layers.yr.s.total} · 월운 ${m.layers.mo.s.total}${ws.length ? ` · 이 달 작용: ${ws.join(", ")}` : ""}`;
}

export function answer(id, ctx) {
  const { c, a, today } = ctx;
  const ds = c.day[0], de = stemEl(ds);
  if (id === "year") {
    const now = pillarsAt(...today), f = yearFortune(c, a, now.sajuYear);
    const g = tenGod(ds, f.pillar[0]), gb = tenGod(ds, BR_MAIN[f.pillar[1]]);
    const ms = monthsOfSajuYear(now.sajuYear).map(mo => monthFortune(c, a, mo));
    const best = ms.slice().sort((x, y) => y.s.total - x.s.total).slice(0, 3);
    const top = ["money","work","study","love","doc","move"].sort((x, y) => f.s[y] - f.s[x]);
    const care = ["health","talk","loss"].sort((x, y) => f.s[y] - f.s[x])[0];
    const NAME = { money:"재물", work:"일·성과", study:"학업·시험", love:"연애·인연", doc:"계약·문서", move:"이동·변화", health:"건강·안전", talk:"구설·마찰", loss:"손재·지출" };
    const g5 = gradeOf(f.s.total);
    const open = g5.lv >= 4 ? "올해는 밀어붙여도 되는 해예요." : g5.lv === 3 ? "올해는 무난한 해예요. 크게 벌이기보다 실속을 챙기면 됩니다." : "올해는 바깥으로 크게 벌이기보다 안을 다지는 해예요.";
    return P([
      `<b>${now.sajuYear}년 ${pname(f.pillar)}년 종합 ${scoreChip(f.s.total)}</b> ${open}`,
      `한 해의 기운은 ${g}(천간)과 ${gb}(지지)입니다. ${GOD[gb].period}`,
      `점수를 나눠 보면 10년 바탕인 대운이 ${f.layers.dw.s.total}점, 올해 세운이 ${f.layers.yr.s.total}점이에요. ${f.layers.dw.s.total > f.layers.yr.s.total + 10 ? "바탕(대운)은 좋은데 올해 기운이 조금 엇나가는 해라, 무리한 확장보다 준비에 쓰면 내년 이후에 크게 돌아옵니다." : f.layers.yr.s.total > f.layers.dw.s.total + 10 ? "대운 바탕보다 올해 기운이 좋아서, 올해 잡은 기회는 놓치지 않는 게 좋아요." : "대운과 세운이 비슷한 결이라 한 해 흐름이 크게 출렁이지 않아요."}`,
      `올해 상대적으로 강한 분야는 <b>${NAME[top[0]]}</b>(${f.s[top[0]]}점)과 <b>${NAME[top[1]]}</b>(${f.s[top[1]]}점), 신경 쓸 부분은 <b>${NAME[care]}</b>(${f.s[care]}점)입니다.`,
      `특히 좋은 달: ${best.map(m => `<b>${m.mo.startDate.m}월 ${m.mo.startDate.d}일경~</b> (${m.s.total}점)`).join(", ")}.`
    ]);
  }
  const list = upcomingMonths(c, a, ...today, 24).map(m => ({ m, k: QSCORE[id](m.s) }));
  if (id === "care") {
    const top = list.slice().sort((x, y) => y.k - x.k).slice(0, 3);
    const gi = +Object.keys(a.role).find(e => a.role[e] === "기신");
    return P([
      `앞으로 2년 중 특히 조심할 시기는 아래 세 달이에요. 점수가 낮다고 나쁜 일이 생긴다는 뜻이 아니라, 무리하면 탈이 나기 쉬운 때라는 뜻입니다.`,
    ]) + `<ol class="ans">${top.map(({ m }) => {
      const worst = ["health","talk","loss"].sort((x, y) => m.s[y] - m.s[x])[0];
      const TXT = { health: "건강·안전 — 과로와 무리한 운동·운전을 줄이세요.", talk: "구설·마찰 — 말과 글을 한 번 더 다듬고, 감정적인 결정을 미루세요.", loss: "손재·지출 — 큰 결제, 보증, 돈 빌려주기는 미루세요." };
      return `<li><b>${moLabel(m.mo)}</b> 종합 ${scoreChip(m.s.total)}<br>${TXT[worst]}<br><span class="muted small">${monthReason(c, a, m)}</span></li>`;
    }).join("")}</ol>` + `<div class="advice">이 사주의 기신은 ${ELJ(gi, "이에요", "예요")}. 기신 기운이 겹치는 달에는 큰 결정을 한 달 미루는 것만으로도 충분히 피해갈 수 있어요.</div>`;
  }
  const top = list.slice().sort((x, y) => y.k - x.k).slice(0, 3);
  const cat = QCAT[id];
  const INTRO = {
    biz: "창업은 '돈이 도는 기운(재성)'과 '일이 앞으로 나가는 기운'이 같이 받쳐줘야 해요. 앞으로 2년 중 두 가지가 함께 높은 달은 이렇습니다.",
    job: "취업·이직은 일·성과와 계약·문서 기운이 같이 좋을 때가 유리해요. 지원서나 면접 일정을 이 시기에 맞춰 보세요.",
    exam: "시험은 학업 기운(인성·문창)과 문서 기운이 함께 받쳐줄 때가 좋아요. 시험 날짜는 바꿀 수 없으니, 이 시기를 집중 공부 구간으로 쓰세요.",
    love: "인연은 배우자 별과 일지의 합, 도화가 들어오는 달에 강해져요.",
    money: "돈을 모으고 불리는 데는 재물 기운은 높고 손재 기운은 낮은 달이 좋아요.",
    move: "이사·이동은 역마와 충, 변화의 기운이 들어오면서 종합 흐름이 나쁘지 않은 달이 좋아요."
  }[id];
  const yong = a.yongGrp, favCat = { biz: "jae", job: "gwan", exam: "in", love: c.gender === "M" ? "jae" : "gwan", money: "jae", move: null }[id];
  let tail = "";
  if (favCat) {
    const f = a.fav[groupElement(de, favCat)], gk = GROUP_KO[favCat];
    const lvl = favCat === yong ? "yong" : f > 0.15 ? "good" : f < -0.15 ? "bad" : "mid";
    const T = {
      love: { yong: `배우자 별인 ${gk}이 바로 용신이라, 좋은 인연이 곧 운을 끌어올려 주는 사주예요.`, good: `배우자 별인 ${gk}은 이 사주에 반가운 기운이라 인연이 오면 잘 이어져요.`, bad: `배우자 별인 ${gk}은 이 사주에 부담되는 기운이라, 인연이 와도 서두르기보다 천천히 알아가는 게 좋아요. 나를 편하게 해 주는 사람인지가 가장 중요한 기준이에요.`, mid: `배우자 별인 ${gk}은 이 사주에 중립적인 기운이라, 시기를 잘 고르는 게 특히 중요해요.` },
      def: { yong: `이 분야를 뜻하는 ${gk}이 바로 이 사주의 용신이라, 좋은 시기를 잡으면 결과가 크게 나는 편이에요.`, good: `이 분야를 뜻하는 ${gk}은 이 사주에 반가운 기운이라 시기만 맞추면 잘 풀려요.`, bad: `다만 이 분야를 뜻하는 ${gk}은 이 사주에 부담되는 기운이에요. 좋은 시기라도 규모를 작게 시작해서 키워 가는 게 안전합니다.`, mid: `이 분야를 뜻하는 ${gk}은 이 사주에 중립적인 기운이라 시기를 잘 고르는 게 특히 중요해요.` },
      exam: { yong: `공부를 뜻하는 ${gk}이 바로 용신이라, 공부한 만큼 운이 받쳐주는 사주예요.`, good: `공부를 뜻하는 ${gk}은 이 사주에 반가운 기운이라 시기만 맞추면 잘 풀려요.`, bad: `공부를 뜻하는 ${gk}은 이 사주에 부담되는 기운이라 생각만 많아지기 쉬워요. 문제 풀이처럼 손을 움직이는 공부가 더 효과적이에요.`, mid: `공부를 뜻하는 ${gk}은 중립적인 기운이라, 좋은 시기에 공부량을 몰아 두세요.` }
    };
    tail = (T[id] || T.def)[lvl];
  }
  const best = top[0].m;
  const verdict = best.s[cat] >= 80 ? "앞으로 2년 안에 확실히 좋은 시기가 있어요." : best.s[cat] >= 66 ? "괜찮은 시기가 있어요." : "앞으로 2년은 이 분야가 크게 열리는 시기는 아니에요. 그 안에서 가장 나은 때를 골랐어요.";
  return P([INTRO, `<b>${verdict}</b>`]) +
    `<ol class="ans">${top.map(({ m }) => `<li><b>${moLabel(m.mo)}</b> ${CATNAME[cat]} ${scoreChip(m.s[cat])} 종합 ${m.s.total}<br><span class="muted small">${monthReason(c, a, m)}</span></li>`).join("")}</ol>` +
    (tail ? `<div class="advice">${tail}</div>` : "");
}
const CATNAME = { money:"재물", work:"일·성과", study:"학업·시험", love:"연애·인연", doc:"계약·문서", move:"이동·변화" };
