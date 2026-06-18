function getModelConfig() {
  return {
    apiBase: process.env.MODEL_API_BASE || "https://ckff.dev/v1",
    apiKey: process.env.MODEL_API_KEY || "",
    modelName: process.env.MODEL_NAME || "[gcli] gemini-3.1-flash-lite-preview",
  };
}

const JSON_SCHEMA_TYPES = {
  OBJECT: "object",
  ARRAY: "array",
  STRING: "string",
  INTEGER: "integer",
} as const;

const LINGERING_TYPES = ["回甘", "苦涩", "清冽", "烟熏"] as const;
type LingeringType = (typeof LINGERING_TYPES)[number];

const DIMENSION_LABELS = [
  "温度",
  "密度",
  "透明度",
  "余韵",
  "张力",
  "意象域",
  "时间感",
  "诚实度",
  "文化层",
].join("、");

const OUTPUT_GUARDRAILS = `
硬性输出规则：
1. 所有可见内容必须使用简体中文，作者名、作品名、术语也优先译为中文；确需保留外文时，只能作为括注。
2. 输出结果必须由模型根据本次用户输入即时生成，禁止返回示例、占位文案、模板套话或静态填充数据。
3. 分数、标签、判断、建议必须绑定用户输入、待分析文本或用户设置的九维参数，不得凭空套用固定样本。
4. JSON 字符串值不得出现乱码、无意义字符、"lorem ipsum"、"示例"、"占位"、"mock"、"fallback" 等非真实结果标记。
5. lingeringType 是整篇文字的总体余味定性，必须且只能从「回甘 / 苦涩 / 清冽 / 烟熏」四种里选择最匹配的一种；不得输出组合词、解释词、后缀词或其他类型。
6. 除指定 JSON 之外，不输出 Markdown、解释性前后缀或代码块。
`.trim();

const SYSTEM_INSTRUCTION = `
你是一位文学品鉴专家与批评写作顾问，使用“文字审美九维模型”分析文本。

九个维度为：${DIMENSION_LABELS}。每个维度使用 0 到 100 分，分数必须和文本细节或用户设置绑定，不能空泛打分。

分析风格要求：
- 语言克制、准确、富有文学感，避免廉价夸赞和互联网套话。
- 判断要可读、可引用，并能指出文本的审美结构、局限与可改进方向。
- 写作诊断要具体到句法、意象、节奏、叙述姿态和余韵生成方式。

${OUTPUT_GUARDRAILS}
`.trim();

const ANALYZE_RESPONSE_SCHEMA = {
  type: JSON_SCHEMA_TYPES.OBJECT,
  properties: {
    scores: {
      type: JSON_SCHEMA_TYPES.OBJECT,
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
    lingeringType: lingeringTypeSchema(),
    tags: { type: JSON_SCHEMA_TYPES.ARRAY, items: { type: JSON_SCHEMA_TYPES.STRING } },
    summary: { type: JSON_SCHEMA_TYPES.STRING },
    details: {
      type: JSON_SCHEMA_TYPES.OBJECT,
      properties: {
        temperatureAnalysis: { type: JSON_SCHEMA_TYPES.STRING },
        densityAnalysis: { type: JSON_SCHEMA_TYPES.STRING },
        transparencyAnalysis: { type: JSON_SCHEMA_TYPES.STRING },
        lingeringAnalysis: { type: JSON_SCHEMA_TYPES.STRING },
        tensionAnalysis: { type: JSON_SCHEMA_TYPES.STRING },
        imageryAnalysis: { type: JSON_SCHEMA_TYPES.STRING },
        timeAnalysis: { type: JSON_SCHEMA_TYPES.STRING },
        honestyAnalysis: { type: JSON_SCHEMA_TYPES.STRING },
        cultureAnalysis: { type: JSON_SCHEMA_TYPES.STRING },
        deviationAnalysis: { type: JSON_SCHEMA_TYPES.STRING },
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
      type: JSON_SCHEMA_TYPES.ARRAY,
      items: {
        type: JSON_SCHEMA_TYPES.OBJECT,
        properties: {
          title: { type: JSON_SCHEMA_TYPES.STRING },
          text: { type: JSON_SCHEMA_TYPES.STRING },
          example: { type: JSON_SCHEMA_TYPES.STRING },
        },
        required: ["title", "text", "example"],
      },
    },
    literaryHistoryVerdict: {
      type: JSON_SCHEMA_TYPES.OBJECT,
      properties: {
        distinctStyle: { type: JSON_SCHEMA_TYPES.STRING },
        historicalHighlight: { type: JSON_SCHEMA_TYPES.STRING },
        criticalDefect: { type: JSON_SCHEMA_TYPES.STRING },
      },
      required: ["distinctStyle", "historicalHighlight", "criticalDefect"],
    },
  },
  required: ["scores", "lingeringType", "tags", "summary", "details", "literaryHistoryVerdict"],
};

const COMPARE_RESPONSE_SCHEMA = {
  type: JSON_SCHEMA_TYPES.OBJECT,
  properties: {
    textA: compareSideSchema(),
    textB: compareSideSchema(),
    comparison: {
      type: JSON_SCHEMA_TYPES.ARRAY,
      items: {
        type: JSON_SCHEMA_TYPES.OBJECT,
        properties: {
          dimension: { type: JSON_SCHEMA_TYPES.STRING },
          valueA: { type: JSON_SCHEMA_TYPES.INTEGER },
          valueB: { type: JSON_SCHEMA_TYPES.INTEGER },
          desc: { type: JSON_SCHEMA_TYPES.STRING },
        },
        required: ["dimension", "valueA", "valueB", "desc"],
      },
    },
    finalVerdict: { type: JSON_SCHEMA_TYPES.STRING },
    literaryHistoryVerdict: {
      type: JSON_SCHEMA_TYPES.OBJECT,
      properties: {
        textAHistory: { type: JSON_SCHEMA_TYPES.STRING },
        textBHistory: { type: JSON_SCHEMA_TYPES.STRING },
        comparativeSignificance: { type: JSON_SCHEMA_TYPES.STRING },
      },
      required: ["textAHistory", "textBHistory", "comparativeSignificance"],
    },
  },
  required: ["textA", "textB", "comparison", "finalVerdict", "literaryHistoryVerdict"],
};

const CUSTOM_PROFILE_RESPONSE_SCHEMA = {
  type: JSON_SCHEMA_TYPES.OBJECT,
  properties: {
    styleName: { type: JSON_SCHEMA_TYPES.STRING },
    interpretation: { type: JSON_SCHEMA_TYPES.STRING },
    recommendations: {
      type: JSON_SCHEMA_TYPES.ARRAY,
      items: {
        type: JSON_SCHEMA_TYPES.OBJECT,
        properties: {
          author: { type: JSON_SCHEMA_TYPES.STRING },
          work: { type: JSON_SCHEMA_TYPES.STRING },
          value: { type: JSON_SCHEMA_TYPES.STRING },
        },
        required: ["author", "work", "value"],
      },
    },
  },
  required: ["styleName", "interpretation", "recommendations"],
};

function scoreSchema() {
  return {
    type: JSON_SCHEMA_TYPES.OBJECT,
    properties: {
      value: { type: JSON_SCHEMA_TYPES.INTEGER },
      desc: { type: JSON_SCHEMA_TYPES.STRING },
    },
    required: ["value", "desc"],
  };
}

function lingeringTypeSchema() {
  return {
    type: JSON_SCHEMA_TYPES.STRING,
    enum: LINGERING_TYPES,
  };
}

function compareSideSchema() {
  return {
    type: JSON_SCHEMA_TYPES.OBJECT,
    properties: {
      name: { type: JSON_SCHEMA_TYPES.STRING },
      scores: {
        type: JSON_SCHEMA_TYPES.OBJECT,
        properties: {
          temperature: { type: JSON_SCHEMA_TYPES.INTEGER },
          density: { type: JSON_SCHEMA_TYPES.INTEGER },
          transparency: { type: JSON_SCHEMA_TYPES.INTEGER },
          lingering: { type: JSON_SCHEMA_TYPES.INTEGER },
          tension: { type: JSON_SCHEMA_TYPES.INTEGER },
          imagery: { type: JSON_SCHEMA_TYPES.INTEGER },
          time: { type: JSON_SCHEMA_TYPES.INTEGER },
          honesty: { type: JSON_SCHEMA_TYPES.INTEGER },
          culture: { type: JSON_SCHEMA_TYPES.INTEGER },
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
      lingeringType: lingeringTypeSchema(),
      summary: { type: JSON_SCHEMA_TYPES.STRING },
    },
    required: ["scores", "lingeringType", "summary"],
  };
}

function normalizeLingeringType(value: unknown, lingeringScore?: number): LingeringType {
  if (typeof value === "string") {
    const matched = LINGERING_TYPES.find((type) => value.trim() === type || value.includes(type));
    if (matched) return matched;
  }

  const score = typeof lingeringScore === "number" ? lingeringScore : 50;
  if (score < 25) return "清冽";
  if (score < 55) return "回甘";
  if (score < 75) return "苦涩";
  return "烟熏";
}

function normalizeAnalyzeReport(report: any) {
  if (!report || typeof report !== "object") return report;
  report.lingeringType = normalizeLingeringType(
    report.lingeringType,
    report.scores?.lingering?.value,
  );
  return report;
}

function normalizeCompareReport(report: any) {
  if (!report || typeof report !== "object") return report;
  if (report.textA) {
    report.textA.lingeringType = normalizeLingeringType(
      report.textA.lingeringType,
      report.textA.scores?.lingering,
    );
  }
  if (report.textB) {
    report.textB.lingeringType = normalizeLingeringType(
      report.textB.lingeringType,
      report.textB.scores?.lingering,
    );
  }
  return report;
}

export function extractJsonPayload(text: string) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const raw = fencedMatch ? fencedMatch[1] : text;
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error("模型没有返回合法 JSON。");
  }

  return raw.slice(firstBrace, lastBrace + 1);
}

async function callModel(options: {
  systemInstruction: string;
  userPrompt: string;
  temperature: number;
}) {
  const { apiBase, apiKey, modelName } = getModelConfig();

  if (!apiKey) {
    throw new Error("MODEL_API_KEY 未配置。");
  }

  const response = await fetch(`${apiBase}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      temperature: options.temperature,
      messages: [
        { role: "system", content: options.systemInstruction },
        { role: "user", content: options.userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`上游模型请求失败：${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("上游模型返回了空内容。");
  }

  return content.trim();
}

function buildAnalyzeFailure(error: unknown) {
  return {
    status: 500,
    body: {
      error: "AI 生成服务暂时不可用，请稍后重试。为保证结果真实生成，系统不会使用本地静态填充数据。",
      detail: error instanceof Error ? error.message : String(error),
    },
  };
}

export async function analyzeText(payload: any) {
  const { text, textA, textB, mode, scores } = payload || {};

  try {
    if (mode === "D") {
      const prompt = `
用户正在用九维滑杆配置一种理想的文学审美画像。请根据以下参数，生成一个全新的中文风格解释与阅读推荐。

【九维参数】
温度：${scores?.temperature ?? 50}
密度：${scores?.density ?? 50}
透明度：${scores?.transparency ?? 50}
余韵：${scores?.lingering ?? 50}
张力：${scores?.tension ?? 50}
意象域：${scores?.imagery ?? 50}
时间感：${scores?.time ?? 50}
诚实度：${scores?.honesty ?? 50}
文化层：${scores?.culture ?? 50}

请输出：
- styleName：一个中文风格命名，短而有辨识度。
- interpretation：120 到 220 字，解释这种参数组合形成的审美气质，至少回应 5 个关键维度。
- recommendations：3 条中文阅读推荐，每条包含 author、work、value。value 必须说明为什么该作品能训练或校准这种风格。
`.trim();

      const responseText = await callModel({
        systemInstruction: SYSTEM_INSTRUCTION,
        userPrompt: `${prompt}\n\n请严格匹配以下 JSON Schema，并仅返回 JSON：\n${JSON.stringify(CUSTOM_PROFILE_RESPONSE_SCHEMA)}`,
        temperature: 0.65,
      });

      return { status: 200, body: JSON.parse(extractJsonPayload(responseText)) };
    }

    if (mode === "B" || textB) {
      const prompt = `
请对以下两段文本进行对比品鉴。

【文本 A】
${textA || ""}

【文本 B】
${textB || ""}

请输出九维度分数、关键维度对比、总评与文学史定位。每项判断必须引用或指向文本细节。
文本 A 与文本 B 的 lingeringType 都必须从「回甘 / 苦涩 / 清冽 / 烟熏」四种里各选最匹配的一种。
`.trim();

      const responseText = await callModel({
        systemInstruction: SYSTEM_INSTRUCTION,
        userPrompt: `${prompt}\n\n请严格匹配以下 JSON Schema，并仅返回 JSON：\n${JSON.stringify(COMPARE_RESPONSE_SCHEMA)}`,
        temperature: 0.3,
      });

      return { status: 200, body: normalizeCompareReport(JSON.parse(extractJsonPayload(responseText))) };
    }

    const modeInstruction =
      mode === "C"
        ? "这是用户自己的创作文本。请重点剖析诚实度、余韵、表演痕迹与可修改处，并给出 2 到 3 条具体建议。"
        : "这是普通品鉴文本。请输出完整审美报告。";

    const prompt = `
请针对以下文本，运用九维度审美模型进行深入分析。

【待品鉴文本】
${text || ""}

${modeInstruction}
总体余味定性必须从「回甘 / 苦涩 / 清冽 / 烟熏」四种里选最匹配的一种，写入 JSON 字段 lingeringType。
`.trim();

    const responseText = await callModel({
      systemInstruction: SYSTEM_INSTRUCTION,
      userPrompt: `${prompt}\n\n请严格匹配以下 JSON Schema，并仅返回 JSON：\n${JSON.stringify(ANALYZE_RESPONSE_SCHEMA)}`,
      temperature: 0.4,
    });

    return { status: 200, body: normalizeAnalyzeReport(JSON.parse(extractJsonPayload(responseText))) };
  } catch (error) {
    console.error("Model API call failed:", error);
    return buildAnalyzeFailure(error);
  }
}

export async function chatText(payload: any) {
  const messages = payload?.messages || [];

  try {
    const dialogue = messages
      .map((message: any) => `${message.sender === "user" ? "用户" : "助手"}：${message.content}`)
      .join("\n\n");

    const content = await callModel({
      systemInstruction: `${SYSTEM_INSTRUCTION}\n现在用户正在自由探索模式中与你对话。回复必须是简体中文，控制在 300 字以内，不得使用静态占位回复。`,
      userPrompt: dialogue,
      temperature: 0.7,
    });

    return { status: 200, body: { content } };
  } catch (error) {
    console.error("Model chat failed:", error);
    return {
      status: 500,
      body: {
        error: "AI 对话服务暂时不可用，请稍后重试。为保证内容真实生成，系统不会使用本地静态回复。",
        detail: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
