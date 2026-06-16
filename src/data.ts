export interface PresetSample {
  title: string;
  author: string;
  desc: string;
  text: string;
  textB?: string; // Optional for compare mode
}

export const PRESET_SAMPLES: PresetSample[] = [
  {
    title: "无声的序章 · 飞燕",
    author: "春日与晚秋之和弦",
    desc: "平静、安宁、留有余味的轻叙事散文。如同风吹过刚冒头的绿芽。",
    text: `无声的序章。
春日迟迟，春景熙熙。春景宁谧而恬静，带着一丝生机。
好似故事的开端，令人心生期待。
未吐蕊的花苞，寄存着最难忘的往事。`
  },
  {
    title: "零度冰山 · 桥头雪景",
    author: "欧内斯特·海明威（文体拟作）",
    desc: "极致的克制陈述、零度情感修饰。画面冷寂、压迫感在文字后侧暗涌。",
    text: `桥头下了雪。
树木呈灰色，河水在桥孔下快速流过，不带一点泥沙。
那个人坐在木箱上数着卡车。卡车很重，压出深深的辙。
雪地里没有鸟，只有灰色的树。
他没有看手腕，他其实知道时间。`
  },
  {
    title: "意象密植 · 落日胡琴",
    author: "仿张爱玲文风",
    desc: "重油画般的高度密植，每个形容词都在承重。意象惊艳、带有一丝苦涩的烟熏回响。",
    text: `那落日像一只咸蛋黄，软软地烂下去了。
隔江的胡琴咿咿呀呀拉起来，声音里带了霉烂的绿。
天井里的芭蕉叶子被烤得焦卷，贴在泛黄的粉墙上，
仿佛一个过时的女人在胭脂纸上揩出的泪痕，每一抹都是迟暮。`
  },
  {
    title: "日常回甘 · 昆明的雨",
    author: "仿汪曾祺文风",
    desc: "温润温和，带有极强的陪伴感与家常气。泥土与植物的香味，回甘绵长。",
    text: `昆明的雨季是不使人厌烦的。
雨是柔和的，空气是湿润的，草木都是饱满的。
天井里那一棵仙人掌，开出了小黄花。
我们坐在小竹椅上，捏着盐巴炒香的花生米，
看着雨水从小青瓦的瓦檐上，像珠子一样一颗颗挂下来。`
  }
];

export const PRES_COMPARE_SAMPLES: PresetSample[] = [
  {
    title: "冷郁克制 vs 热烈排浪 （海明威 vs 狄更斯）",
    author: "风格极化对比",
    desc: "一冷一热，一疏一密，完美展示温度与密度坐标的两极对抗。",
    text: `男人把手插在旧大衣的口袋里。风从港口方向吹来，卷着煤灰与死鱼的腥气。他看着远处的汽船，船的主桅已经折断。他没有等任何人，也没有带行李。他掏出一支被压坏的香烟，点燃，吐出烟雾，然后朝火车站的方向走去。`,
    textB: `那是一个最繁华的时代，那是一个最萧条的时代；那是一个充满信仰的世纪，那是一个充满怀疑的世纪。整个大地在狂风骤雨里呜咽呼喊，所有的灵魂都被卷入了不可抗拒的激情泥潭，他们在尖叫、在痛哭，在用最灼热的热血和最激烈的身躯去对抗那笼罩着一切的、如墨汁般的浓重夜色！`
  },
  {
    title: "轻盈留白 vs 繁复隐喻 (日常散文 vs 现代先锋)",
    author: "语言透明度对比",
    desc: "一个如同清水拂面一目了然，另一个多重语词折射、含混深远。",
    text: `院里的柿子树熟了，红得像一个个小红灯笼。麻雀落上去啄一口，又扑棱棱飞走，落到瓦房顶上。阳光照在瓦片上，亮晃晃的，天瓦蓝瓦蓝，没有一片云。母亲在围裙上擦着手，从灶房里大声喊开饭了。`,
    textB: `熟透的柿子在时间的暗室里，正缓慢进行着一场无声的铅化。那鲜红不是生命的洋溢，而是重力在植物内腔里拉扯出的、一滴血红的心事。鸟喙的叩击，不过是刺破寂静之茧的最后一道金属指针，阳光正在被风撕碎，母亲的呼唤从遥远的灶房水汽里折射而来，沦为某种已经腐蚀了的乡愁坐标。`
  }
];

export interface ThemeVibe {
  name: string;
  vibe: string;
  scores: {
    temperature: number;
    density: number;
    transparency: number;
    lingering: number;
    tension: number;
    imagery: number;
    time: number;
    honesty: number;
    culture: number;
  };
  lingeringType: string;
  authorRef: string;
  example: string;
}

export const STYLE_VIBES: ThemeVibe[] = [
  {
    name: "零度冰山",
    vibe: "0度极致陈述，拒绝修辞装饰，不煽情。潜藏着深层的命运冷战。",
    scores: {
      temperature: 15,
      density: 20,
      transparency: 15,
      lingering: 65,
      tension: 85,
      imagery: 30,
      time: 40,
      honesty: 10,
      culture: 30
    },
    lingeringType: "苦涩",
    authorRef: "罗兰·巴特 / 海明威",
    example: "“雨落在屋顶，淋湿了灰色的猫。他坐在桌旁写字，没有看钟。”"
  },
  {
    name: "日常回甘",
    vibe: "温暖，质朴，带有柴米油盐和草木清香的陪伴感，呼吸顺畅，回甘持久。",
    scores: {
      temperature: 75,
      density: 35,
      transparency: 12,
      lingering: 85,
      tension: 15,
      imagery: 50,
      time: 55,
      honesty: 15,
      culture: 50
    },
    lingeringType: "回甘",
    authorRef: "汪曾祺 / 周作人 / 废名",
    example: "“天井里的栀子花开了，大白花，香得冲鼻子，肥嘟嘟的。”"
  },
  {
    name: "繁复密植",
    vibe: "意象浓重，巴洛克式修辞，复调叙事，每一个字都承受着历史或感官的重担。",
    scores: {
      temperature: 55,
      density: 85,
      transparency: 70,
      lingering: 75,
      tension: 70,
      imagery: 85,
      time: 80,
      honesty: 35,
      culture: 80
    },
    lingeringType: "烟熏",
    authorRef: "张爱玲 / 马塞尔·普鲁斯特",
    example: "“胡琴拉完了，风还在窗纸上抠着，发出绿锈一样的声气。”"
  },
  {
    name: "幽深多义",
    vibe: "象征、含混与逆隐喻。字面之外波光叠影，意义含而不露，诱人深解。",
    scores: {
      temperature: 30,
      density: 60,
      transparency: 85,
      lingering: 90,
      tension: 75,
      imagery: 75,
      time: 70,
      honesty: 25,
      culture: 60
    },
    lingeringType: "烟熏",
    authorRef: "燕卜荪 / 象征主义诗派 / 卡夫卡",
    example: "“时间的轮轴在大雪里生锈，我只是那场未曾寄出的信件里，落下的尘埃。”"
  },
  {
    name: "烈火红莲",
    vibe: "炽热燃烧。极强的情感倾泻与思想挑衅，具有排山倒海的说服力与感官冲击。",
    scores: {
      temperature: 95,
      density: 70,
      transparency: 30,
      lingering: 50,
      tension: 90,
      imagery: 65,
      time: 45,
      honesty: 50,
      culture: 35
    },
    lingeringType: "苦涩",
    authorRef: "鲁迅 / 陀思妥耶夫斯基 / 尼采",
    example: "“救救孩子……！在这没有生命的铁屋子，狂风里有钢刀般的呼啸。”"
  }
];
