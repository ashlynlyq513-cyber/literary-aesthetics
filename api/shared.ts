const MODEL_API_BASE = process.env.MODEL_API_BASE || "https://ckff.dev/v1";
const MODEL_API_KEY = process.env.MODEL_API_KEY || "";
const MODEL_NAME =
  process.env.MODEL_NAME || "[gcli转] gemini-3.1-flash-lite-preview";

const SYSTEM_INSTRUCTION = `
你是一位极其资深的文学品鉴专家与批评家，掌握一套名为「文字审美模型」的分析体系。

你需要围绕以下九个维度，对文字进行审美分析、对比分析或写作诊断：
1. 温度：零度冷冽 到 灼热炽烈
2. 密度：轻盈疏朗 到 厚重密植
3. 透明度：澄澈直白 到 幽深多义
4. 余韵：清冽即散 到 绵长沉淀
5. 张力：松弛舒缓 到 高度紧绷
6. 意象域：具象单纯 到 抽象混融
7. 时间感：极度压缩 到 极度扩张
8. 诚实度：彻底诚实 到 高度表演
9. 文化层：深根传统 到 彻底断裂

请遵守以下要求：
- 分析语言要精准、克制、富有文学感，不要使用廉价夸赞。
- 分数必须和文本细节绑定，不能空泛打分。
- 需要给出可读、可引用的结论，而非模板废话。
- 除非特别要求，否则只返回合法 JSON，不要输出 Markdown 代码块。
`.trim();

const ANALYZE_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    scores: {
      type: "object",
      properties: {
        temperature: scoreSchema(),
        density: scoreSchema(),
        transparency: scoreSchema(),
        lingering: scoreSchema(),
        tension: scoreSchema(),
        imagery: scoreSchema(),
        time: scoreSchema(),
        honesty: scoreSchema(),
        culture: scoreSchema(),
      },
      required: [
        "temperature",
        "density",
        "transparency",
        "lingering",
        "tension",
        "imagery",
        "time",
        "honesty",
        "culture",
      ],
    },
    lingeringType: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
    details: {
      type: "object",
      properties: {
        temperatureAnalysis: { type: "string" },
        densityAnalysis: { type: "string" },
        transparencyAnalysis: { type: "string" },
        lingeringAnalysis: { type: "string" },
        tensionAnalysis: { type: "string" },
        imageryAnalysis: { type: "string" },
        timeAnalysis: { type: "string" },
        honestyAnalysis: { type: "string" },
        cultureAnalysis: { type: "string" },
        deviationAnalysis: { type: "string" },
      },
      required: [
        "temperatureAnalysis",
        "densityAnalysis",
        "transparencyAnalysis",
        "lingeringAnalysis",
        "tensionAnalysis",
        "imageryAnalysis",
        "timeAnalysis",
        "honestyAnalysis",
        "cultureAnalysis",
      ],
    },
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          text: { type: "string" },
          example: { type: "string" },
        },
        required: ["title", "text", "example"],
      },
    },
    literaryHistoryVerdict: {
      type: "object",
      properties: {
        distinctStyle: { type: "string" },
        historicalHighlight: { type: "string" },
        criticalDefect: { type: "string" },
      },
      required: ["distinctStyle", "historicalHighlight", "criticalDefect"],
    },
  },
  required: [
    "scores",
    "lingeringType",
    "tags",
    "summary",
    "details",
    "literaryHistoryVerdict",
  ],
};

const COMPARE_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    textA: compareSideSchema(),
    textB: compareSideSchema(),
    comparison: {
      type: "array",
      items: {
        type: "object",
        properties: {
          dimension: { type: "string" },
          valueA: { type: "integer" },
          valueB: { type: "integer" },
          desc: { type: "string" },
        },
        required: ["dimension", "valueA", "valueB", "desc"],
      },
    },
    finalVerdict: { type: "string" },
    literaryHistoryVerdict: {
      type: "object",
      properties: {
        textAHistory: { type: "string" },
        textBHistory: { type: "string" },
        comparativeSignificance: { type: "string" },
      },
      required: ["textAHistory", "textBHistory", "comparativeSignificance"],
    },
  },
  required: ["textA", "textB", "comparison", "finalVerdict", "literaryHistoryVerdict"],
};

function scoreSchema() {
  return {
    type: "object",
    properties: {
      value: { type: "integer" },
      desc: { type: "string" },
    },
    required: ["value", "desc"],
  };
}

function compareSideSchema() {
  return {
    type: "object",
    properties: {
      name: { type: "string" },
      scores: {
        type: "object",
        properties: {
          temperature: { type: "integer" },
          density: { type: "integer" },
          transparency: { type: "integer" },
          lingering: { type: "integer" },
          tension: { type: "integer" },
          imagery: { type: "integer" },
          time: { type: "integer" },
          honesty: { type: "integer" },
          culture: { type: "integer" },
        },
        required: [
          "temperature",
          "density",
          "transparency",
          "lingering",
          "tension",
          "imagery",
          "time",
          "honesty",
          "culture",
        ],
      },
      lingeringType: { type: "string" },
      summary: { type: "string" },
    },
    required: ["scores", "lingeringType", "summary"],
  };
}

function extractJsonPayload(text: string) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const raw = fencedMatch ? fencedMatch[1] : text;
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error("Model did not return valid JSON content.");
  }
  return raw.slice(firstBrace, lastBrace + 1);
}

async function callModel(options: {
  systemInstruction: string;
  userPrompt: string;
  temperature: number;
}) {
  if (!MODEL_API_KEY) {
    throw new Error("MODEL_API_KEY is not configured.");
  }

  const response = await fetch(`${MODEL_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MODEL_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      temperature: options.temperature,
      messages: [
        { role: "system", content: options.systemInstruction },
        { role: "user", content: options.userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upstream model request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Upstream model returned empty content.");
  }
  return content.trim();
}

export async function runAnalyze(body: any) {
  const { text, textA, textB, mode } = body || {};

  try {
    if (mode === "B" || textB) {
      const contentPrompt = `
请对以下两段文字执行对比品鉴。

【文字 A】
${textA || ""}

【文字 B】
${textB || ""}

请给出九维度分数、对比说明、总评与文学史定位。
`.trim();

      const responseText = await callModel({
        systemInstruction: `${SYSTEM_INSTRUCTION}\n请只返回合法 JSON。`,
        userPrompt: `${contentPrompt}\n\n请严格匹配以下 JSON Schema，并仅返回 JSON：\n${JSON.stringify(COMPARE_RESPONSE_SCHEMA)}`,
        temperature: 0.3,
      });

      return JSON.parse(extractJsonPayload(responseText));
    }

    const modeInstruction =
      mode === "C"
        ? "这是用户自己的创作，请重点剖析诚实度与余韵，并给出 2 到 3 条具体、可执行的修改建议。"
        : "这是普通品鉴模式，请输出完整审美报告。";

    const contentPrompt = `
请针对以下文本内容，运用九维度审美模型进行深入分析。

【待品鉴文本】
${text || ""}

${modeInstruction}
`.trim();

    const responseText = await callModel({
      systemInstruction: `${SYSTEM_INSTRUCTION}\n请只返回合法 JSON。`,
      userPrompt: `${contentPrompt}\n\n请严格匹配以下 JSON Schema，并仅返回 JSON：\n${JSON.stringify(ANALYZE_RESPONSE_SCHEMA)}`,
      temperature: 0.4,
    });

    return JSON.parse(extractJsonPayload(responseText));
  } catch (error) {
    console.error("Model API call failed:", error);
    return {
      error: "品鉴服务暂时出现阻塞，已切换至本地诗意模型为您服务...",
      fallback: true,
      data:
        mode === "B"
          ? getMockCompareData()
          : getMockAnalyzeData(mode),
    };
  }
}

export async function runChat(body: any) {
  const messages = body?.messages || [];
  try {
    const dialogue = messages
      .map((m: any) => `${m.sender === "user" ? "用户" : "助手"}：${m.content}`)
      .join("\n\n");

    const content = await callModel({
      systemInstruction:
        SYSTEM_INSTRUCTION +
        "\n现在用户正在自由探索模式中与你对话，请保持专业、亲切、诗性，回复控制在 300 字内。",
      userPrompt: dialogue,
      temperature: 0.7,
    });

    return { content };
  } catch (error) {
    console.error("Model chat failed:", error);
    return {
      error: "对话遇到了一些波折",
      content:
        "我正在细细咀嚼您方才的问题。美学探讨需要沉淀，我们也可以换一个角度，继续针对您的文字本身展开细读。",
    };
  }
}

function getMockAnalyzeData(mode: string) {
  const isC = mode === "C";
  return {
    scores: {
      temperature: { value: 28, desc: "偏冷克制，情绪沉在字句背面。" },
      density: { value: 35, desc: "疏朗有致，保留了足够呼吸感。" },
      transparency: { value: 65, desc: "含混适度，意义有折射层次。" },
      lingering: { value: 80, desc: "读后沉淀明显，余味较长。" },
      tension: { value: 72, desc: "内在暗流充足，表面不喧哗。" },
      imagery: { value: 60, desc: "草木与旧物意象较清晰。" },
      time: { value: 75, desc: "善于放慢瞬间，形成停驻感。" },
      honesty: {
        value: isC ? 45 : 22,
        desc: isC ? "略有雕饰痕迹，但仍能触到真实经验。" : "姿态较低，具有较强真诚感。",
      },
      culture: { value: 40, desc: "带有温和的文体记忆与历史包浆。" },
    },
    lingeringType: isC ? "苦涩" : "回甘",
    tags: isC
      ? ["未尽之意", "技巧拉扯", "直面经验", "场景延宕"]
      : ["秋日档案", "冰山潜行", "澄澈留白", "纸面泛黄"],
    summary:
      "这段文字呈现出克制而有余韵的审美气质。作者没有急于解释情绪，而是让物象先行，于疏朗中保存了潜流，因此读后仍有回响。",
    details: {
      temperatureAnalysis: "文字整体偏冷，不靠热烈抒情推进，而是把情绪压入物象侧面，让凉意迟迟浮出。",
      densityAnalysis: "句子并不追求满载，信息量被克制分配，因此阅读节奏较顺，也更能显出留白本身的作用。",
      transparencyAnalysis: "它不是完全直白的告白，而是在可理解与可回味之间维持了一层轻雾般的折射。",
      lingeringAnalysis: "余韵并不靠响亮结论制造，而是靠尾句后的空白继续扩散，这使它更接近回甘与轻微烟熏的交界。",
      tensionAnalysis: "张力主要来自克制与暗流并存，表面平稳，内里却持续保持着未完全说尽的推动力。",
      imageryAnalysis: "意象多停留在草木、旧物与气味层面，数量不繁，但足以承担情绪折射。",
      timeAnalysis: "它善于把一个瞬间轻轻拉长，让读者在并不剧烈的叙述中感觉到时间被拽住。",
      honestyAnalysis: "整体较少表演腔，愿意退后一步让经验自身说话，因此诚实度相对较高。",
      cultureAnalysis: "文化层不以炫示典故取胜，而是以隐约的文体记忆托住当代语感。",
    },
    suggestions: isC
      ? [
          {
            title: "让名词直接承重",
            text: "删去过度规定读者感受的修饰词，往往能让场景本身更有诚实力度。",
            example: "修改前：那场雨极其悲悯地落下。\\n修改后：雨落下来，枯叶陷进黑土。",
          },
          {
            title: "把心情改写成物象并置",
            text: "不要直接说孤独，把物象并置出来，让句与句之间自己产生摩擦。",
            example: "修改前：我感到记忆在褪色。\\n修改后：相册摊开，纸边发白，窗台落灰。",
          },
        ]
      : [],
    literaryHistoryVerdict: {
      distinctStyle: "兼具中式留白与现代冷调叙述的混合气质，笔法克制而不失纤细。",
      historicalHighlight: "它最动人的地方在于，不用高强度抒情也能让意象自然带出情绪波纹。",
      criticalDefect: "部分句法过于顺滑，缺少更强的摩擦点，导致深层意蕴有时滑行得略快。",
    },
  };
}

function getMockCompareData() {
  return {
    textA: {
      name: "文字 A 档案",
      scores: {
        temperature: 20,
        density: 35,
        transparency: 70,
        lingering: 85,
        tension: 80,
        imagery: 60,
        time: 75,
        honesty: 18,
        culture: 45,
      },
      lingeringType: "烟熏",
      summary: "文字 A 冷静、深潜，依靠克制与留白维系张力。",
    },
    textB: {
      name: "文字 B 档案",
      scores: {
        temperature: 85,
        density: 75,
        transparency: 25,
        lingering: 50,
        tension: 65,
        imagery: 40,
        time: 40,
        honesty: 48,
        culture: 25,
      },
      lingeringType: "回甘",
      summary: "文字 B 热烈、浓密，依靠情绪推进和铺陈制造存在感。",
    },
    comparison: [
      {
        dimension: "温度",
        valueA: 20,
        valueB: 85,
        desc: "A 明显偏冷而收束，B 则热烈外放，情绪直接扑面而来。",
      },
      {
        dimension: "密度",
        valueA: 35,
        valueB: 75,
        desc: "A 依靠疏朗留白维持气口，B 以密集铺陈形成压迫感。",
      },
      {
        dimension: "透明度",
        valueA: 70,
        valueB: 25,
        desc: "A 更依赖含混与回味，B 则更倾向直达意义中心。",
      },
    ],
    finalVerdict:
      "两者代表了截然不同的写作姿态：A 是克制、冷调、含隐的山水式笔法，B 是热烈、浓密、铺陈的重油式笔法。",
    literaryHistoryVerdict: {
      textAHistory: "A 更接近现代极简与冷淡派传统，优势在于无声潜流。",
      textBHistory: "B 更接近浪漫主义与排浪式修辞传统，优势在于强烈说服力。",
      comparativeSignificance: "这组对照构成了‘极简与极繁’、‘克制与宣泄’之间的清晰坐标。",
    },
  };
}
