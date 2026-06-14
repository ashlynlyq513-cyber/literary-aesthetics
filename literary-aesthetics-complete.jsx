import { useState, useRef, useEffect } from "react";

// ─── PALETTE ────────────────────────────────────────────
const C = {
  bg: "#0c0b09", border: "rgba(255,255,255,0.06)",
  text: "#e8e0d0", dim: "rgba(232,224,208,0.45)",
  faint: "rgba(255,255,255,0.18)", gold: "rgba(200,180,150,0.7)",
  core: "#C8845A", ext: "#7A9E8E", meta: "#8B7BAD",
};

// ─── LAYERS DATA ────────────────────────────────────────
const LAYERS = [
  { id:"temperature", name:"温度", en:"Temperature", tier:"core", color:"#C8845A",
    theory:"T.S. 艾略特「客观对应物」· 修辞学调性理论",
    axis:{l:"零度冷冽",r:"灼热炽烈"},
    desc:"文字自带的情绪体温，决定读者与文本之间的心理距离。",
    terms:[
      {w:"零度",src:"罗兰·巴特《写作的零度》",def:"绝对克制的陈述，拒绝所有修辞装饰，语言退至最低限度的功能性存在。",sig:"无副词，无比喻，句句陈述事实。",pos:5},
      {w:"冷调",src:"海明威「冰山理论」",def:"情感在水面下涌动，表层保持距离与克制，压迫感来自未说出的部分。",sig:"读完觉得沉，但找不到一句"煽情"的句子。",pos:25},
      {w:"中性",src:"修辞学",def:"情感温度不构成主要表达策略，文字的重心在别处。",sig:"读完不会特别冷或特别热。",pos:50},
      {w:"暖调",src:"修辞学",def:"具象、低攻击性的日常词汇，视角平视，带有包裹感和陪伴感。",sig:"读完有一种被照顾的感觉。",pos:72},
      {w:"灼热",src:"修辞学",def:"观点极度尖锐或情感全力宣泄，用词带有挑衅性或强烈感官刺激。",sig:"副词密集，感叹号出现，或每句话都在逼你表态。",pos:95},
    ]},
  { id:"density", name:"密度", en:"Density", tier:"core", color:"#7A9E8E",
    theory:"文体学「前景化」· 利奇《文学文体学》",
    axis:{l:"轻盈疏朗",r:"厚重密植"},
    desc:"单位篇幅内的信息量与意象复杂度，决定读者需要多大的认知投入。",
    terms:[
      {w:"疏朗",src:"文体学",def:"核心信息一眼可见，排版有呼吸，留白本身参与表达。",sig:"读一段只需要一次停顿。",pos:10},
      {w:"轻盈",src:"文体学",def:"信息密度适中，阅读流畅，不需要读者驻足咀嚼。",sig:"读完觉得没有负担。",pos:30},
      {w:"均衡",src:"文体学",def:"密度适度，信息与留白形成合理的节奏交替。",sig:"读完不觉得累，也不觉得空。",pos:50},
      {w:"厚重",src:"文体学「前景化」",def:"复杂从句、多维信息叠加，需要读者减速才能消化。",sig:"同一句话你读了两遍。",pos:75},
      {w:"密植",src:"巴洛克修辞",def:"意象高度密集，几乎没有喘息空间，每个词都在承重。",sig:"读完感到某种愉悦的疲惫。",pos:95},
    ]},
  { id:"transparency", name:"透明度", en:"Transparency", tier:"core", color:"#8B7BAD",
    theory:"燕卜荪《含混七型》· 新批评「张力」理论",
    axis:{l:"澄澈直白",r:"幽深多义"},
    desc:"意义的可及程度——文字是敞开的还是需要解码的，歧义是失误还是刻意为之的张力。",
    terms:[
      {w:"透明",src:"修辞学",def:"意义直接可及，不需要解码，一读即懂。",sig:"你不需要停下来想它在说什么。",pos:8},
      {w:"清澈",src:"修辞学",def:"表达清晰但有层次，字面义之外有一层可感知的余意。",sig:"读完觉得懂了，但还有什么留在那里。",pos:30},
      {w:"含混",src:"燕卜荪《含混七型》",def:"词语同时激活多个意义层，歧义是有意为之的张力而非模糊。",sig:"你确定它说了什么，但不确定它只说了这个。",pos:60},
      {w:"幽深",src:"象征主义诗学",def:"意义藏于多层隐喻之下，需要读者主动参与才能抵达。",sig:"你不确定自己读懂了，但感觉到了什么。",pos:80},
      {w:"晦涩",src:"前卫主义文学",def:"刻意抵制意义的稳定性，语言的不透明本身成为主题。",sig:"读完不知道它在说什么，但这可能正是它的意图。",pos:96},
    ]},
  { id:"aftertaste", name:"余韵", en:"Aftertaste", tier:"core", color:"#A07070",
    theory:"修辞学「余效」· 接受美学",
    axis:{l:"清冽即散",r:"绵长沉淀"},
    desc:"读完之后身体里留下什么。这是文字最终的品质判断，也是最难伪造的维度。",
    terms:[
      {w:"清冽",src:"接受美学",def:"读完即散，干净离去，不留痕迹，如冷水过喉。",sig:"合上后你立刻可以做别的事。",pos:8},
      {w:"回甘",src:"品鉴传统",def:"初读平淡，读后越想越有味，意义在时间中慢慢浮现。",sig:"过了一天你还在想它。",pos:35},
      {w:"苦涩",src:"悲剧诗学",def:"留下有价值的不适，一种难以消解的摩擦感，促使反思。",sig:"读完心里有什么东西卡着。",pos:60},
      {w:"烟熏",src:"品鉴传统",def:"某种说不清楚的沉淀，情绪的氤氲，无法被准确命名。",sig:"你感受到了，但无法转述给别人。",pos:80},
      {w:"灼痕",src:"接受美学",def:"在读者身上留下永久性的改变，世界观或感知方式发生了位移。",sig:"读完之后你看某件事的方式不同了。",pos:97},
    ]},
  { id:"tension", name:"张力", en:"Tension", tier:"ext", color:"#6B8FAD",
    theory:"新批评「张力」· 巴赫金「复调」理论",
    axis:{l:"松弛舒缓",r:"高度紧绷"},
    desc:"文字内部的对抗性力量——克制与爆发、叙述与沉默、单声道与复调之间的张力场。",
    terms:[
      {w:"松弛",src:"修辞学",def:"叙述舒缓流畅，无内在冲突，读者可以完全放松地被携带。",sig:"读完有一种被抚慰的感觉。",pos:10},
      {w:"蓄势",src:"修辞学",def:"情感或信息积累而不释放，压力悄然转移给读者。",sig:"结尾什么都没说，你却难受。",pos:40},
      {w:"复调",src:"巴赫金《陀思妥耶夫斯基诗学问题》",def:"多种声音、立场、情感同时在场且彼此不消解，构成内在对话。",sig:"你不确定文字站在哪边，但这本身就是答案。",pos:60},
      {w:"悖论",src:"新批评「张力」",def:"两种互相矛盾的力量在文字中同时成立，张力不被解决。",sig:"「轻盈的沉」「干净的残忍」——两者都是真的。",pos:80},
      {w:"紧绷",src:"修辞学",def:"叙述节奏极度压缩，情绪密度极高，读者无处喘息。",sig:"读完需要深呼吸一下。",pos:95},
    ]},
  { id:"imagery", name:"意象域", en:"Imagery", tier:"ext", color:"#9E8E6A",
    theory:"认知语言学「概念隐喻」· 莱可夫《我们赖以生存的隐喻》",
    axis:{l:"具象单纯",r:"抽象混融"},
    desc:"文字在哪个物质领域建立它的感知世界，以及隐喻运动的方向——这个选择本身就是世界观。",
    terms:[
      {w:"意象域",src:"认知语言学",def:"全篇在哪个物质领域打转：植物/矿物/水/建筑/身体/光线……",sig:"闭上眼，文字让你看到什么质地的世界。",pos:25},
      {w:"常规隐喻",src:"莱可夫概念隐喻",def:"用具体喻抽象，符合认知惯例，读者无需停顿即可接收。",sig:"「爱是旅程」——你直接接受了，没有卡顿。",pos:40},
      {w:"陌生化",src:"什克洛夫斯基《艺术作为手法》",def:"用罕见角度命名习见之物，强迫读者重新感知，打破自动化。",sig:"读到某个词时有短暂的卡顿，然后是突然的清晰。",pos:65},
      {w:"逆喻",src:"认知语言学",def:"反向运动——用抽象喻具体，打破惯常方向，产生陌生化效果。",sig:"「那寂静像一座仓库」——方向反了，但你懂了。",pos:80},
      {w:"意象叠加",src:"意象派诗学",def:"多个意象并置而不说明关系，张力在空白处产生。",sig:"庞德《地铁站》：两行，两个意象，关系由你填。",pos:90},
    ]},
  { id:"temporality", name:"时间感", en:"Temporality", tier:"ext", color:"#8E7A9E",
    theory:"热奈特《叙事话语》· 叙事学「时距」「聚焦」理论",
    axis:{l:"时间压缩",r:"时间扩张"},
    desc:"叙述对时间的处理方式——故事时间与叙述时间的比值，以及叙述者与事件的距离。",
    terms:[
      {w:"省略",src:"热奈特叙事学",def:"故事时间大于叙述时间，大段时间被跳过不写。",sig:"「多年后」三个字压缩了十年。",pos:5},
      {w:"概要",src:"热奈特叙事学",def:"叙述时间短于故事时间，快速扫过事件而不展开。",sig:"你知道发生了什么，但没有身临其境。",pos:25},
      {w:"场景",src:"热奈特叙事学",def:"叙述时间约等于故事时间，最强的临场感与在场性。",sig:"读完你感觉自己刚刚在那个房间里。",pos:55},
      {w:"延缓",src:"热奈特叙事学",def:"叙述时间长于故事时间，一个瞬间被无限放大。",sig:"普鲁斯特的玛德琳蛋糕——一口，几十页。",pos:80},
      {w:"停顿",src:"热奈特叙事学",def:"故事时间静止，叙述继续——纯粹的描述或反思。",sig:"时间停了，但文字还在走。",pos:95},
    ]},
  { id:"ethics", name:"诚实度", en:"Honesty", tier:"meta", color:"#8E9E7A",
    theory:"布斯《小说修辞学》「隐含作者」· 萨特存在主义批评",
    axis:{l:"彻底诚实",r:"高度表演"},
    desc:"文字对自身情感和立场的诚实程度。这是质量底线，不是风格选择。",
    terms:[
      {w:"隐含作者",src:"布斯《小说修辞学》",def:"文字背后透露的价值观和人格形象，不等于真实作者，但无法伪造。",sig:"读完后你对「写这篇的人」有一个清晰的感觉。",pos:15},
      {w:"难度诚实",src:"参照利奥塔",def:"忠实于经验的复杂性，拒绝为可读性而简化，不给出廉价的结论。",sig:"文字没有告诉你应该怎么感受。",pos:28},
      {w:"沉默质量",src:"修辞学",def:"没说出的部分是有意为之的留白，还是无力面对的回避——两者都是沉默，质量不同。",sig:"你能感觉到作者是选择不说，还是说不出。",pos:48},
      {w:"表演性",src:"巴特勒语言行为理论",def:"文字在为想象中的读者表演，情感是摆出来的而非流出来的。",sig:"总觉得作者在「端着」，情绪是展示给你看的。",pos:78},
      {w:"自我神话",src:"罗兰·巴特《神话学》",def:"作者将自身经验普遍化，把个人感受包装成普世真理。",sig:"「我们都曾……」「每个人都……」——但真的吗？",pos:93},
    ]},
  { id:"culture", name:"文化层", en:"Culture", tier:"meta", color:"#9E8A6A",
    theory:"巴赫金「杂语性」「互文性」· 克里斯蒂娃互文理论",
    axis:{l:"深根传统",r:"彻底断裂"},
    desc:"文字与时代、体裁传统、社会话语的对话关系。任何文字都携带历史，没有中性的语言。",
    terms:[
      {w:"互文性",src:"克里斯蒂娃/巴特",def:"文字与其他文本的显性或隐性对话，每篇文字都是对已有文字的回应。",sig:"你认出了某个典故、回声或刻意的引用。",pos:20},
      {w:"语言时态",src:"文化批评",def:"词语携带的时代包浆——这个词属于哪个年代，它从哪里来。",sig:"某个词让你想起一个时代或一类人。",pos:35},
      {w:"杂语性",src:"巴赫金《小说话语》",def:"不同社会方言、阶层话语、时代声音在文中共存，形成内在张力。",sig:"文言和口语、精英话语和草根声音同时出现。",pos:55},
      {w:"体裁记忆",src:"巴赫金体裁理论",def:"文字唤起某种体裁的历史积淀，又在关键处偏离它——偏离本身产生意义。",sig:"读着像散文，突然有了别的什么。",pos:68},
      {w:"传统断裂",src:"前卫主义理论",def:"有意切断与文学传统的联系，拒绝被归类，在孤立中制造新的意义。",sig:"你找不到参照物，它不像任何你读过的东西。",pos:93},
    ]},
];

const AF_COLORS = { 回甘:"#C8845A", 苦涩:"#7A9E8E", 清冽:"#8BAFD0", 烟熏:"#9E8A6A" };
const TIER_COLOR = { core: C.core, ext: C.ext, meta: C.meta };
const TIER_LABEL = { core:"核心轴", ext:"扩展轴", meta:"元层级" };
const SAMPLES = [
  { label:"张爱玲", text:"生命是一袭华美的袍，爬满了蚤子。" },
  { label:"海明威", text:"他很老了，独自在湾流中一条小船上钓鱼，至今已去了八十四天，一条鱼也没有钓到。" },
  { label:"余华", text:"我不知道父亲回家后，母亲是否告诉了他那天发生的事，或许说了，或许没有，反正父亲此后再没有提起过那件事，就像它从未发生一样。" },
];

// ─── API ────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  const raw = data.content.map(b => b.text || "").join("");
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function dimPrompt(id, text) {
  const axes = {
    temperature: "0=零度冷冽 100=灼热炽烈",
    density: "0=极度疏朗 100=极度密植",
    transparency: "0=澄澈直白 100=幽深多义",
    aftertaste: "0=清冽即散 100=绵长沉淀",
    tension: "0=极度松弛 100=高度紧绷",
    imagery: "0=具象单纯 100=抽象混融",
    temporality: "0=时间极度压缩 100=时间极度扩张",
    ethics: "0=彻底诚实 100=高度表演",
    culture: "0=深根传统 100=彻底断裂",
  };
  const names = { temperature:"温度", density:"密度", transparency:"透明度",
    aftertaste:"余韵", tension:"张力", imagery:"意象域",
    temporality:"时间感", ethics:"诚实度", culture:"文化层" };
  return `你是文学批评专家。分析以下文字的「${names[id]}」维度（${axes[id]}），给出0-100整数分，并用一句话描述该维度的特征。只返回JSON格式，不要任何其他内容：{"score":数字,"note":"一句话描述"}\n\n文字：「${text}」`;
}

const afPrompt = text =>
  `你是文学批评专家。分析以下文字读完后留下的余味类型，从四种中选最匹配的一种：回甘/苦涩/清冽/烟熏。同时给出2-4个风味标签词（如：克制、孤寂、凌厉、悬浮）。只返回JSON格式，不要任何其他内容：{"type":"回甘或苦涩或清冽或烟熏","tags":["词1","词2","词3"]}\n\n文字：「${text}」`;

// ─── RADAR CANVAS ───────────────────────────────────────
function RadarChart({ scores }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 260, H = 260, cx = W/2, cy = H/2, R = 88;
    const n = LAYERS.length;
    ctx.clearRect(0, 0, W, H);
    const pt = (i, val, r) => {
      const a = (i/n)*Math.PI*2 - Math.PI/2;
      return [cx + r*Math.cos(a)*val, cy + r*Math.sin(a)*val];
    };
    // grid
    [.25,.5,.75,1].forEach(lvl => {
      ctx.beginPath();
      for (let i=0;i<n;i++) { const [x,y]=pt(i,lvl,R); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
      ctx.closePath(); ctx.strokeStyle="rgba(255,255,255,0.07)"; ctx.lineWidth=1; ctx.stroke();
    });
    // axes
    for (let i=0;i<n;i++) {
      const [x,y]=pt(i,1,R);
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y);
      ctx.strokeStyle="rgba(255,255,255,0.08)"; ctx.stroke();
    }
    // data
    if (scores?.length === n) {
      ctx.beginPath();
      scores.forEach((s,i) => { const [x,y]=pt(i,s/100,R); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      ctx.closePath();
      ctx.fillStyle="rgba(200,132,90,0.12)"; ctx.fill();
      ctx.strokeStyle="rgba(200,132,90,0.75)"; ctx.lineWidth=1.5; ctx.stroke();
      scores.forEach((s,i) => {
        const [x,y]=pt(i,s/100,R);
        ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2);
        ctx.fillStyle=LAYERS[i].color; ctx.fill();
      });
    }
    // labels
    const LR = R+24;
    LAYERS.forEach((l,i) => {
      const [x,y]=pt(i,1,LR);
      ctx.fillStyle=l.color; ctx.font="10px 'Noto Serif SC',serif";
      ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillText(l.name,x,y);
    });
  }, [scores]);
  return <canvas ref={ref} width={260} height={260} />;
}

// ─── SPECTRUM BAR ────────────────────────────────────────
function SpectrumBar({ layer }) {
  return (
    <div style={{marginBottom:28}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
        <span style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.22)"}}>{layer.axis.l}</span>
        <span style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.22)"}}>{layer.axis.r}</span>
      </div>
      <div style={{position:"relative",height:2,borderRadius:1,background:"rgba(255,255,255,0.07)"}}>
        <div style={{position:"absolute",inset:0,borderRadius:1,opacity:.5,
          background:`linear-gradient(90deg,${layer.color}18,${layer.color}80)`}} />
        {layer.terms.map(t => (
          <div key={t.w} title={t.w} style={{position:"absolute",left:`${t.pos}%`,top:"50%",
            transform:"translate(-50%,-50%)",width:8,height:8,borderRadius:"50%",
            background:layer.color,border:"1.5px solid rgba(0,0,0,0.45)",cursor:"default"}} />
        ))}
      </div>
      <div style={{position:"relative",height:20,marginTop:8}}>
        {layer.terms.map(t => (
          <span key={t.w} style={{position:"absolute",left:`${t.pos}%`,transform:"translateX(-50%)",
            fontSize:11,letterSpacing:1,whiteSpace:"nowrap",color:layer.color}}>{t.w}</span>
        ))}
      </div>
    </div>
  );
}

// ─── TERM CARD ───────────────────────────────────────────
function TermCard({ term, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{borderLeft:`2px solid ${color}`,
      padding:"13px 16px",background:open?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.015)",
      cursor:"pointer",transition:"background 0.2s",userSelect:"none"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}>
          <span style={{fontSize:15,fontWeight:500,letterSpacing:2,color}}>{term.w}</span>
          <span style={{fontSize:10,color:"rgba(255,255,255,0.2)",fontStyle:"italic"}}>{term.src}</span>
        </div>
        <span style={{fontSize:10,color:"rgba(255,255,255,0.18)",
          transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(180deg)":"none"}}>▾</span>
      </div>
      <p style={{margin:"7px 0 0",fontSize:13,lineHeight:1.85,color:"rgba(232,224,208,0.62)"}}>{term.def}</p>
      {open && (
        <div style={{marginTop:9,paddingTop:9,borderTop:"1px solid rgba(255,255,255,0.06)",
          fontSize:12,color:"rgba(232,224,208,0.38)",fontStyle:"italic",lineHeight:1.8}}>
          <span style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.18)",fontStyle:"normal"}}>辨认信号 · </span>
          {term.sig}
        </div>
      )}
    </div>
  );
}

// ─── LAYER PANEL ─────────────────────────────────────────
function LayerPanel({ layer }) {
  const tierColor = TIER_COLOR[layer.tier];
  const tierLabel = TIER_LABEL[layer.tier];
  return (
    <div>
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:11,
          letterSpacing:5,color:"rgba(200,180,150,0.22)",textTransform:"uppercase",marginBottom:8}}>
          {tierLabel} · {layer.en}
        </div>
        <h1 style={{fontSize:22,fontWeight:300,letterSpacing:6,color:layer.color}}>{layer.name}</h1>
        <div style={{height:1,width:28,marginTop:12,background:layer.color,opacity:.5}} />
      </div>
      <div style={{display:"flex",gap:18,alignItems:"flex-start",paddingBottom:20,
        borderBottom:`1px solid ${C.border}`,marginBottom:24}}>
        <div style={{width:50,height:50,flexShrink:0,display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:18,color:layer.color,
          border:`1px solid ${layer.color}30`,background:`${layer.color}0D`}}>
          {layer.name[0]}
        </div>
        <div>
          <p style={{fontSize:13,color:C.dim,lineHeight:1.85,marginBottom:6}}>{layer.desc}</p>
          <p style={{fontSize:11,color:C.faint,fontStyle:"italic"}}>{layer.theory}</p>
        </div>
      </div>
      <SpectrumBar layer={layer} />
      <div style={{display:"grid",gap:8}}>
        {layer.terms.map(t => <TermCard key={t.w} term={t} color={layer.color} />)}
      </div>
    </div>
  );
}

// ─── ANALYZER VIEW ───────────────────────────────────────
function AnalyzerView() {
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  async function run() {
    if (!text.trim() || analyzing) return;
    setAnalyzing(true); setResults(null); setError(""); setProgress(0);
    const total = LAYERS.length + 1;
    const dimResults = [];
    try {
      for (let i=0; i<LAYERS.length; i++) {
        const l = LAYERS[i];
        setProgressLabel(`正在感知「${l.name}」…`);
        const r = await callClaude(dimPrompt(l.id, text));
        dimResults.push({ ...l, score: r.score, note: r.note });
        setProgress(((i+1)/total)*100);
      }
      setProgressLabel("正在感知「余味」…");
      const af = await callClaude(afPrompt(text));
      setProgress(100);
      setResults({ dims: dimResults, af });
    } catch(e) {
      setError("分析失败：" + e.message);
    }
    setAnalyzing(false); setProgressLabel("");
  }

  const afColor = results ? (AF_COLORS[results.af.type] || C.core) : C.core;

  return (
    <div>
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:11,
          letterSpacing:5,color:"rgba(200,180,150,0.22)",textTransform:"uppercase",marginBottom:8}}>
          Text Flavor Analysis
        </div>
        <h1 style={{fontSize:22,fontWeight:300,letterSpacing:6,color:C.text}}>品鉴分析</h1>
        <div style={{height:1,width:28,marginTop:12,background:"rgba(200,180,150,0.5)",opacity:.5}} />
      </div>

      {/* Input */}
      <textarea value={text} onChange={e=>setText(e.target.value)}
        placeholder="在此输入你想品鉴的文字——小说片段、诗歌、散文、广告语……"
        style={{width:"100%",height:140,background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(200,180,150,0.2)",borderRadius:3,color:C.text,
          fontFamily:"'Noto Serif SC',serif",fontSize:14,lineHeight:1.9,
          padding:"12px 16px",resize:"none",outline:"none"}} />

      {/* Samples */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10,alignItems:"center"}}>
        <span style={{fontSize:11,color:C.faint}}>示例：</span>
        {SAMPLES.map(s => (
          <button key={s.label} onClick={() => setText(s.text)}
            style={{background:"transparent",border:"1px solid rgba(200,180,150,0.2)",
              color:"rgba(200,180,150,0.6)",padding:"4px 12px",fontFamily:"'Noto Serif SC',serif",
              fontSize:11,cursor:"pointer",borderRadius:2,letterSpacing:1}}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Button */}
      <button onClick={run} disabled={analyzing || !text.trim()}
        style={{marginTop:14,width:"100%",
          background:analyzing||!text.trim()?"rgba(200,132,90,0.25)":"linear-gradient(135deg,#C8845A,#A8694A)",
          color:analyzing||!text.trim()?"rgba(255,255,255,0.3)":"#0c0b09",border:"none",
          padding:11,fontFamily:"'Noto Serif SC',serif",fontSize:13,fontWeight:600,
          letterSpacing:3,cursor:analyzing||!text.trim()?"not-allowed":"pointer",borderRadius:2}}>
        {analyzing ? "品鉴中…" : "开始品鉴"}
      </button>

      {/* Progress */}
      {analyzing && (
        <div style={{marginTop:14}}>
          <div style={{height:1,background:"rgba(255,255,255,0.06)",borderRadius:1,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:1,transition:"width 0.5s ease",
              background:"linear-gradient(90deg,#C8845A,#8E7A9E)",width:`${progress}%`}} />
          </div>
          <div style={{textAlign:"center",marginTop:8,fontSize:11,
            color:"rgba(200,180,150,0.5)",letterSpacing:3}}>{progressLabel}</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{marginTop:14,padding:"12px 16px",border:"1px solid rgba(200,80,80,0.3)",
          fontSize:12,color:"rgba(220,150,150,0.8)",lineHeight:1.7}}>{error}</div>
      )}

      {/* Results */}
      {results && (
        <div style={{marginTop:28}}>
          {/* Radar + aftertaste side by side */}
          <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:24,
            alignItems:"start",marginBottom:24}}>
            <div style={{display:"flex",justifyContent:"center"}}>
              <RadarChart scores={results.dims.map(d=>d.score)} />
            </div>
            <div>
              <div style={{border:`1px solid rgba(255,255,255,0.05)`,padding:18,
                background:"rgba(255,255,255,0.01)",marginBottom:16}}>
                <div style={{fontSize:9,letterSpacing:3,color:C.faint,marginBottom:8}}>余味类型</div>
                <div style={{fontSize:26,fontWeight:300,letterSpacing:5,color:afColor,marginBottom:10}}>
                  {results.af.type}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {results.af.tags.map(t => (
                    <span key={t} style={{fontSize:11,letterSpacing:1,padding:"3px 10px",
                      border:`1px solid ${afColor}`,borderRadius:20,color:afColor,opacity:.8}}>{t}</span>
                  ))}
                </div>
              </div>
              {/* Score bars */}
              <div style={{display:"grid",gap:8}}>
                {results.dims.map(d => (
                  <div key={d.id}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:11,letterSpacing:2,color:d.color}}>{d.name}</span>
                      <span style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>{d.score}</span>
                    </div>
                    <div style={{height:2,background:"rgba(255,255,255,0.06)",borderRadius:1}}>
                      <div style={{height:"100%",borderRadius:1,background:d.color,
                        width:`${d.score}%`,transition:"width 1s ease"}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detail cards */}
          <div style={{fontSize:10,letterSpacing:3,color:C.faint,marginBottom:14}}>维度详解</div>
          <div style={{display:"grid",gap:8}}>
            {results.dims.map((d,i) => (
              <div key={d.id} style={{borderLeft:`2px solid ${d.color}`,padding:"12px 16px",
                background:"rgba(255,255,255,0.02)",
                animation:`fadeUp 0.4s ease ${i*0.05}s both`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                  <span style={{fontSize:14,fontWeight:500,letterSpacing:2,color:d.color}}>{d.name}</span>
                  <span style={{fontFamily:"'EB Garamond',serif",fontSize:20,color:d.color,opacity:.7}}>{d.score}</span>
                </div>
                <p style={{fontSize:12,lineHeight:1.85,color:"rgba(232,224,208,0.6)"}}>{d.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FRAMEWORK VIEW ──────────────────────────────────────
function FrameworkView({ onGoLayer }) {
  const tiers = ["core","ext","meta"];
  const tierData = {
    core:{ label:"核心轴", sub:"日常写作校准", desc:"每次动笔前快速过一遍。四个轴覆盖最核心的判断：调性、厚度、表达方式、读后残留。" },
    ext:{ label:"扩展轴", sub:"深度分析与复盘", desc:"当你觉得一篇文字"哪里不对但说不清"时，这三个轴往往能定位问题。" },
    meta:{ label:"元层级", sub:"质量底线判断", desc:"不是风格维度，而是诚实底线。文字可以冷或暖、轻或重，但若在此失守，其他维度再好也是表演。" },
  };
  const theories = [
    ["俄国形式主义","什克洛夫斯基「陌生化」「艺术作为手法」"],
    ["叙事学","热奈特《叙事话语》——时距、聚焦、叙述层次"],
    ["新批评","燕卜荪《含混七型》· 布鲁克斯「悖论」「张力」"],
    ["巴赫金理论","《陀思妥耶夫斯基诗学问题》「复调」「杂语性」「体裁记忆」"],
    ["认知语言学","莱可夫《我们赖以生存的隐喻》「概念隐喻」"],
    ["修辞学传统","布斯《小说修辞学》「隐含作者」"],
    ["文体学","利奇·肖特《小说文体》「前景化」「偏离」"],
    ["接受美学","姚斯「期待视野」· 伊瑟尔「隐含读者」"],
  ];
  return (
    <div>
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:11,
          letterSpacing:5,color:"rgba(200,180,150,0.22)",textTransform:"uppercase",marginBottom:8}}>
          Three-Tier Framework
        </div>
        <h1 style={{fontSize:22,fontWeight:300,letterSpacing:6,color:C.text}}>三层框架总览</h1>
        <div style={{height:1,width:28,marginTop:12,background:"rgba(200,180,150,0.5)",opacity:.5}} />
      </div>
      <p style={{fontSize:13,color:"rgba(232,224,208,0.35)",lineHeight:2.1,
        marginBottom:32,letterSpacing:.5}}>
        三层结构共享同一套输入，输出不同深度的评价。<br/>
        从核心轴快速校准，到扩展轴定位问题，到元层级检验底线——按需进入，层层递深。
      </p>
      {tiers.map((tier,ti) => (
        <div key={tier} style={{marginBottom:30}}>
          <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:5}}>
            <span style={{fontSize:15,letterSpacing:4,fontWeight:400,color:TIER_COLOR[tier]}}>
              {tierData[tier].label}
            </span>
            <span style={{fontSize:11,color:C.faint,letterSpacing:2}}>{tierData[tier].sub}</span>
          </div>
          <p style={{fontSize:13,color:C.dim,lineHeight:1.85,marginBottom:14}}>{tierData[tier].desc}</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {LAYERS.filter(l=>l.tier===tier).map(l => (
              <button key={l.id} onClick={() => onGoLayer(l.id)}
                style={{padding:"7px 14px",border:`1px solid ${l.color}40`,
                  background:"transparent",color:l.color,cursor:"pointer",
                  fontFamily:"'Noto Serif SC',serif",display:"flex",alignItems:"center",gap:7,
                  transition:"opacity 0.15s"}}>
                <span style={{fontSize:12,letterSpacing:2}}>{l.name}</span>
                <span style={{fontSize:9,opacity:.3}}>{l.en}</span>
              </button>
            ))}
          </div>
          {ti < tiers.length-1 && <div style={{height:1,background:"rgba(255,255,255,0.04)",marginTop:24}} />}
        </div>
      ))}
      <div style={{marginTop:18,padding:"20px 22px",border:"1px solid rgba(255,255,255,0.05)",
        background:"rgba(255,255,255,0.01)"}}>
        <div style={{fontSize:10,letterSpacing:3,color:C.faint,marginBottom:14}}>理论来源</div>
        {theories.map(([src,desc]) => (
          <div key={src} style={{display:"flex",gap:14,marginBottom:9}}>
            <span style={{fontSize:12,color:"rgba(200,180,150,0.5)",whiteSpace:"nowrap",
              width:96,flexShrink:0,lineHeight:1.6}}>{src}</span>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.18)",lineHeight:1.7}}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VOCAB VIEW ──────────────────────────────────────────
function VocabView({ initLayer }) {
  const [activeId, setActiveId] = useState(initLayer || LAYERS[0].id);
  const layer = LAYERS.find(l => l.id === activeId);
  return (
    <div style={{display:"flex",gap:0,height:"100%"}}>
      {/* sidebar */}
      <div style={{width:148,flexShrink:0,borderRight:`1px solid ${C.border}`,
        overflowY:"auto",paddingTop:8}}>
        {["core","ext","meta"].map(tier => (
          <div key={tier} style={{marginBottom:4}}>
            <div style={{padding:"8px 16px 4px",fontSize:9,letterSpacing:3,
              opacity:.5,textTransform:"uppercase",color:TIER_COLOR[tier]}}>
              {TIER_LABEL[tier]}
            </div>
            {LAYERS.filter(l=>l.tier===tier).map(l => (
              <button key={l.id} onClick={() => setActiveId(l.id)}
                style={{display:"block",width:"100%",padding:"8px 16px",
                  background:activeId===l.id?"rgba(255,255,255,0.03)":"transparent",
                  border:"none",borderLeft:activeId===l.id?`2px solid ${l.color}`:"2px solid transparent",
                  textAlign:"left",cursor:"pointer",fontFamily:"'Noto Serif SC',serif",
                  fontSize:12,letterSpacing:2,
                  color:activeId===l.id?l.color:"rgba(232,224,208,0.28)",
                  transition:"all 0.15s"}}>
                {l.name}
                <span style={{fontSize:9,marginLeft:4,opacity:.3}}>{l.en.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        ))}
        <div style={{padding:"12px 16px",fontSize:9,color:C.faint,letterSpacing:2,
          lineHeight:1.9,borderTop:`1px solid ${C.border}`,marginTop:8}}>
          9维度<br/>42词条
        </div>
      </div>
      {/* content */}
      <div style={{flex:1,overflowY:"auto",padding:"28px 32px"}}>
        {layer && <LayerPanel key={layer.id} layer={layer} />}
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("analyzer");
  const [vocabInitLayer, setVocabInitLayer] = useState(null);

  function goLayer(id) {
    setVocabInitLayer(id);
    setTab("vocab");
  }

  const tabs = [
    { id:"analyzer", label:"品鉴分析" },
    { id:"vocab",    label:"词汇参考" },
    { id:"framework",label:"模型结构" },
  ];

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",
      background:C.bg,color:C.text,fontFamily:"'Noto Serif SC','STSong',Georgia,serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500&family=EB+Garamond:ital,wght@0,400;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        textarea { outline: none; }
        button { outline: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top nav */}
      <div style={{display:"flex",alignItems:"center",borderBottom:`1px solid ${C.border}`,
        height:50,flexShrink:0,padding:"0 20px",gap:0}}>
        <div style={{fontSize:12,letterSpacing:4,color:C.gold,fontWeight:300,
          marginRight:24,whiteSpace:"nowrap",flexShrink:0}}>
          文字审美模型
        </div>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{padding:"0 16px",height:50,background:"transparent",border:"none",
              borderBottom:tab===t.id?"2px solid rgba(200,180,150,0.7)":"2px solid transparent",
              fontFamily:"'Noto Serif SC',serif",fontSize:12,letterSpacing:2,cursor:"pointer",
              color:tab===t.id?"rgba(200,180,150,0.85)":"rgba(232,224,208,0.3)",
              transition:"all 0.15s",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,overflow:"hidden"}}>
        {tab === "analyzer" && (
          <div style={{height:"100%",overflowY:"auto",padding:"32px 40px 80px",maxWidth:860}}>
            <AnalyzerView />
          </div>
        )}
        {tab === "vocab" && (
          <div style={{height:"100%"}}>
            <VocabView key={vocabInitLayer} initLayer={vocabInitLayer} />
          </div>
        )}
        {tab === "framework" && (
          <div style={{height:"100%",overflowY:"auto",padding:"32px 40px 80px",maxWidth:720}}>
            <FrameworkView onGoLayer={goLayer} />
          </div>
        )}
      </div>
    </div>
  );
}
