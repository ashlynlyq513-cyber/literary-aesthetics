export type DimensionKey =
  | "temperature"
  | "density"
  | "transparency"
  | "lingering"
  | "tension"
  | "imagery"
  | "time"
  | "honesty"
  | "culture";

export interface SpectrumAnchor {
  term: string;
  value: number;
  source?: string;
  definition: string;
  signal?: string;
}

export interface DimensionSpectrum {
  key: DimensionKey;
  label: string;
  lowLabel: string;
  highLabel: string;
  definition: string;
  theory: string;
  anchors: SpectrumAnchor[];
}

export const DIMENSION_SPECTRA: DimensionSpectrum[] = [
  {
    key: "temperature",
    label: "温度",
    lowLabel: "零度冷冽",
    highLabel: "灼热炽烈",
    definition: "文字自带的情绪体温，决定读者与文本之间的心理距离。",
    theory: "罗兰·巴特「写作的零度」/ 海明威「冰山理论」",
    anchors: [
      { term: "零度", value: 5, source: "罗兰·巴特《写作的零度》", definition: "绝对克制的陈述，拒绝所有修辞装饰，语言退至最低限度的功能性存在。", signal: "无副词，无比喻，句句陈述事实。" },
      { term: "冷调", value: 25, source: "海明威「冰山理论」", definition: "情感在水面下涌动，表层保持距离与克制，压迫感来自未说出的部分。", signal: "读完觉得沉，但找不到一句煽情的句子。" },
      { term: "中性", value: 50, definition: "情感温度不构成主要表达策略，文字的重心在别处。" },
      { term: "暖调", value: 72, definition: "具象、低攻击性的日常词汇，视角平视，带有包裹感和陪伴感。", signal: "读完有一种被照顾的感觉。" },
      { term: "灼热", value: 95, definition: "观点极度尖锐或情感全力宣泄，用词带有挑衅性或强烈感官刺激。", signal: "副词密集，感叹号出现，或每句话都在逼你表态。" },
    ],
  },
  {
    key: "density",
    label: "密度",
    lowLabel: "轻盈疏朗",
    highLabel: "厚重密植",
    definition: "单位篇幅内的信息量与意象复杂度，决定读者需要多大的认知投入。",
    theory: "文体学「前景化」/ 利奇《文学文体学》",
    anchors: [
      { term: "疏朗", value: 10, definition: "核心信息一眼可见，排版有呼吸，留白本身参与表达。" },
      { term: "轻盈", value: 30, definition: "信息密度适中，阅读流畅，不需要读者驻足咀嚼。" },
      { term: "均衡", value: 50, definition: "密度适度，信息与留白形成合理的节奏交替。" },
      { term: "厚重", value: 75, source: "文体学「前景化」", definition: "复杂从句、多维信息叠加，需要读者减速才能消化。", signal: "同一句话你读了两遍。" },
      { term: "密植", value: 95, source: "巴洛克修辞", definition: "意象高度密集，几乎没有喘息空间，每个词都在承重。", signal: "读完感到某种愉悦的疲惫。" },
    ],
  },
  {
    key: "transparency",
    label: "透明度",
    lowLabel: "澄澈直白",
    highLabel: "幽深多义",
    definition: "意义的可及程度。文字是敞开的还是需要解码的，歧义是失误还是刻意为之的张力。",
    theory: "燕卜荪《含混七型》/ 新批评「张力」",
    anchors: [
      { term: "透明", value: 8, definition: "意义直接可及，不需要解码，一读即懂。" },
      { term: "清澈", value: 30, definition: "表达清晰但有层次，字面义之外有一层可感知的余意。" },
      { term: "含混", value: 60, source: "燕卜荪《含混七型》", definition: "词语同时激活多个意义层，歧义是有意为之的张力而非模糊。", signal: "你确定它说了什么，但不确定它只说了这个。" },
      { term: "幽深", value: 80, source: "象征主义诗学", definition: "意义藏于多层隐喻之下，需要读者主动参与才能抵达。" },
      { term: "晦涩", value: 96, source: "前卫主义文学", definition: "刻意抵制意义的稳定性，语言的不透明本身成为主题。" },
    ],
  },
  {
    key: "lingering",
    label: "余韵",
    lowLabel: "清冽即散",
    highLabel: "绵长沉淀",
    definition: "读完之后身体里留下什么。这是文字最终的品质判断，也是最难伪造的维度。",
    theory: "接受美学 / 修辞学「余效」",
    anchors: [
      { term: "清冽", value: 8, definition: "读完即散，干净离去，不留痕迹，如冷水过喉。" },
      { term: "回甘", value: 35, definition: "初读平淡，读后越想越有味，意义在时间中慢慢浮现。", signal: "过了一天你还在想它。" },
      { term: "苦涩", value: 60, source: "悲剧诗学", definition: "留下有价值的不适，一种难以消解的摩擦感，促使反思。" },
      { term: "烟熏", value: 80, definition: "某种说不清楚的沉淀，情绪的氤氲，无法被准确命名。", signal: "你感受到了，但无法转述给别人。" },
      { term: "灼痕", value: 97, source: "接受美学", definition: "在读者身上留下永久性的改变，世界观或感知方式发生了位移。" },
    ],
  },
  {
    key: "tension",
    label: "张力",
    lowLabel: "松弛舒缓",
    highLabel: "高度紧绷",
    definition: "文字内部的对抗性力量，来自克制与爆发、叙述与沉默、单声道与复调之间的张力场。",
    theory: "新批评「张力」/ 巴赫金「复调」",
    anchors: [
      { term: "松弛", value: 10, definition: "叙述舒缓流畅，无内在冲突，读者可以完全放松地被携带。" },
      { term: "蓄势", value: 40, definition: "情感或信息积累而不释放，压力悄然转移给读者。", signal: "结尾什么都没说，你却难受。" },
      { term: "复调", value: 60, source: "巴赫金", definition: "多种声音、立场、情感同时在场且彼此不消解，构成内在对话。" },
      { term: "悖论", value: 80, source: "新批评「张力」", definition: "两种互相矛盾的力量在文字中同时成立，张力不被解决。" },
      { term: "紧绷", value: 95, definition: "叙述节奏极度压缩，情绪密度极高，读者无处喘息。" },
    ],
  },
  {
    key: "imagery",
    label: "意象域",
    lowLabel: "具象单纯",
    highLabel: "抽象混融",
    definition: "文字在哪个物质领域建立感知世界，以及隐喻运动的方向。这个选择本身就是世界观。",
    theory: "莱可夫「概念隐喻」/ 什克洛夫斯基「陌生化」",
    anchors: [
      { term: "意象域", value: 25, source: "认知语言学", definition: "全篇在哪个物质领域打转，如植物、矿物、水、建筑、身体、光线等。" },
      { term: "常规隐喻", value: 40, source: "莱可夫", definition: "用具体喻抽象，符合认知惯例，读者无需停顿即可接收。" },
      { term: "陌生化", value: 65, source: "什克洛夫斯基《艺术作为手法》", definition: "用罕见角度命名习见之物，强迫读者重新感知，打破自动化。", signal: "读到某个词时有短暂卡顿，然后是突然的清晰。" },
      { term: "逆喻", value: 80, definition: "反向运动，用抽象喻具体，打破惯常方向。", signal: "方向反了，但你懂了。" },
      { term: "意象叠加", value: 90, source: "意象派", definition: "多个意象并置而不说明关系，张力在空白处产生。" },
    ],
  },
  {
    key: "time",
    label: "时间感",
    lowLabel: "时间极度压缩",
    highLabel: "时间极度扩张",
    definition: "叙述对时间的处理方式，包括故事时间与叙述时间的比值，以及叙述者与事件的距离。",
    theory: "热奈特《叙事话语》「时距」「聚焦」",
    anchors: [
      { term: "省略", value: 5, source: "热奈特", definition: "故事时间大于叙述时间，大段时间被跳过不写。", signal: "多年后三个字压缩了十年。" },
      { term: "概要", value: 25, source: "热奈特", definition: "叙述时间短于故事时间，快速扫过事件而不展开。" },
      { term: "场景", value: 55, source: "热奈特", definition: "叙述时间约等于故事时间，最强的临场感与在场性。" },
      { term: "延缓", value: 80, source: "热奈特", definition: "叙述时间长于故事时间，一个瞬间被无限放大。", signal: "普鲁斯特的玛德琳蛋糕，一口，几十页。" },
      { term: "停顿", value: 95, source: "热奈特", definition: "故事时间静止，叙述继续，形成纯粹的描述或反思。" },
    ],
  },
  {
    key: "honesty",
    label: "诚实度",
    lowLabel: "彻底诚实",
    highLabel: "高度表演",
    definition: "文字对自身情感和立场的诚实程度。这是质量底线，不是风格选择。",
    theory: "布斯《小说修辞学》「隐含作者」/ 萨特存在主义批评",
    anchors: [
      { term: "隐含作者", value: 15, source: "布斯", definition: "文字背后透露的价值观和人格形象，不等于真实作者，但无法伪造。" },
      { term: "难度诚实", value: 28, definition: "忠实于经验的复杂性，拒绝为可读性而简化，不给出廉价的结论。", signal: "文字没有告诉你应该怎么感受。" },
      { term: "沉默质量", value: 48, definition: "没说出的部分是有意为之的留白，还是无力面对的回避。两者都是沉默，质量不同。" },
      { term: "表演性", value: 78, source: "巴特勒", definition: "文字在为想象中的读者表演，情感是摆出来的而非流出来的。", signal: "总觉得作者在端着。" },
      { term: "自我神话", value: 93, source: "罗兰·巴特《神话学》", definition: "作者将自身经验普遍化，把个人感受包装成普世真理。", signal: "我们都曾……但真的吗？" },
    ],
  },
  {
    key: "culture",
    label: "文化层",
    lowLabel: "深根传统",
    highLabel: "彻底断裂",
    definition: "文字与时代、体裁传统、社会话语的对话关系。任何文字都携带历史，没有中性的语言。",
    theory: "巴赫金「杂语性」/ 克里斯蒂娃「互文性」",
    anchors: [
      { term: "互文性", value: 20, source: "克里斯蒂娃", definition: "文字与其他文本的显性或隐性对话，每篇文字都是对已有文字的回应。" },
      { term: "语言时态", value: 35, definition: "词语携带的时代包浆，这个词属于哪个年代，它从哪里来。" },
      { term: "杂语性", value: 55, source: "巴赫金", definition: "不同社会方言、阶层话语、时代声音在文中共存，形成内在张力。" },
      { term: "体裁记忆", value: 68, source: "巴赫金", definition: "文字唤起某种体裁的历史积淀，又在关键处偏离它。偏离本身产生意义。" },
      { term: "传统断裂", value: 93, source: "前卫主义", definition: "有意切断与文学传统的联系，拒绝被归类，在孤立中制造新的意义。" },
    ],
  },
];

export const DIMENSION_LABELS = DIMENSION_SPECTRA.map((dimension) => dimension.label);

export function getSpectrumByKey(key: DimensionKey) {
  return DIMENSION_SPECTRA.find((dimension) => dimension.key === key);
}

export function getSpectrumByLabel(label: string) {
  return DIMENSION_SPECTRA.find((dimension) => dimension.label === label);
}

export function getClosestAnchorByKey(key: DimensionKey, value: number) {
  const spectrum = getSpectrumByKey(key);
  return spectrum ? getClosestAnchor(spectrum, value) : undefined;
}

export function getClosestAnchorByLabel(label: string, value: number) {
  const spectrum = getSpectrumByLabel(label);
  return spectrum ? getClosestAnchor(spectrum, value) : undefined;
}

export function getDescriptorByKey(key: DimensionKey, value: number) {
  return getClosestAnchorByKey(key, value)?.term ?? "";
}

export function getDescriptorByLabel(label: string, value: number) {
  return getClosestAnchorByLabel(label, value)?.term ?? "";
}

export function getAxisSubtitle(key: DimensionKey) {
  const spectrum = getSpectrumByKey(key);
  return spectrum ? `${spectrum.lowLabel} / ${spectrum.highLabel}` : "";
}

export function buildSpectrumPromptGuide() {
  return DIMENSION_SPECTRA.map((dimension) => {
    const anchors = dimension.anchors
      .map((anchor) => {
        const source = anchor.source ? `，${anchor.source}` : "";
        const signal = anchor.signal ? ` 辨认信号：${anchor.signal}` : "";
        return `  - ${anchor.term}≈${anchor.value}${source}：${anchor.definition}${signal}`;
      })
      .join("\n");

    return `${dimension.label}（0=${dimension.lowLabel}，100=${dimension.highLabel}）：${dimension.definition}\n理论参照：${dimension.theory}\n${anchors}`;
  }).join("\n\n");
}

function getClosestAnchor(spectrum: DimensionSpectrum, value: number) {
  const normalizedValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 50;
  return spectrum.anchors.reduce((closest, anchor) => {
    const closestDistance = Math.abs(closest.value - normalizedValue);
    const anchorDistance = Math.abs(anchor.value - normalizedValue);
    return anchorDistance < closestDistance ? anchor : closest;
  }, spectrum.anchors[0]);
}
