const MODEL_API_BASE = process.env.MODEL_API_BASE || "https://ckff.dev/v1";
const MODEL_API_KEY = process.env.MODEL_API_KEY || "";
const MODEL_NAME = process.env.MODEL_NAME || "gemini-3.1-flash-lite-preview";

type Score = {
  value: number;
  desc: string;
};

type AnalyzeResult = {
  scores: {
    temperature: Score;
    density: Score;
    transparency: Score;
    lingering: Score;
    tension: Score;
    imagery: Score;
    time: Score;
    honesty: Score;
    culture: Score;
  };
  lingeringType: string;
  tags: string[];
  summary: string;
  details: {
    temperatureAnalysis: string;
    densityAnalysis: string;
    transparencyAnalysis: string;
    lingeringAnalysis: string;
    tensionAnalysis: string;
    imageryAnalysis: string;
    timeAnalysis: string;
    honestyAnalysis: string;
    cultureAnalysis: string;
  };
  suggestions?: {
    title: string;
    text: string;
    example: string;
  }[];
  literaryHistoryVerdict: {
    distinctStyle: string;
    historicalHighlight: string;
    criticalDefect: string;
  };
};

type CompareResult = {
  textA: {
    name: string;
    scores: Record<string, number>;
    lingeringType: string;
    summary: string;
  };
  textB: {
    name: string;
    scores: Record<string, number>;
    lingeringType: string;
    summary: string;
  };
  comparison: {
    dimension: string;
    valueA: number;
    valueB: number;
    desc: string;
  }[];
  finalVerdict: string;
  literaryHistoryVerdict: {
    textAHistory: string;
    textBHistory: string;
    comparativeSignificance: string;
  };
};

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

async function callModel(systemInstruction: string, userPrompt: string, temperature: number) {
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
      temperature,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
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

function getMockAnalyzeData(mode: string): AnalyzeResult {
  const isDiagnosis = mode === "C";
  return {
    scores: {
      temperature: { value: 28, desc: "Cool and restrained, with emotion held beneath the surface." },
      density: { value: 35, desc: "Spare and breathable rather than overloaded." },
      transparency: { value: 65, desc: "Meaning arrives through light indirection and echo." },
      lingering: { value: 80, desc: "The aftertaste stays and continues to expand after reading." },
      tension: { value: 72, desc: "Quiet surface, but a strong undercurrent remains active." },
      imagery: { value: 60, desc: "Concrete objects and atmosphere carry most of the feeling." },
      time: { value: 75, desc: "Moments are gently stretched to create suspension." },
      honesty: {
        value: isDiagnosis ? 45 : 22,
        desc: isDiagnosis
          ? "There is some stylization, but real experience is still reachable."
          : "The tone stays low and feels genuinely sincere.",
      },
      culture: { value: 40, desc: "There is a light literary memory without heavy ornament." },
    },
    lingeringType: isDiagnosis ? "苦涩" : "回甘",
    tags: isDiagnosis
      ? ["未尽之意", "技巧拉扯", "直面经验", "场景延宕"]
      : ["秋日档案", "冰山潜行", "澄澈留白", "纸面泛黄"],
    summary:
      "这段文字整体偏克制，依靠物象和留白保存情绪，而不是直接抒情，因此读后仍然有回响。",
    details: {
      temperatureAnalysis: "温度偏冷，情绪并不直接外放，而是嵌入场景与物象之中。",
      densityAnalysis: "信息密度控制得较轻，使句子保留了呼吸感与回旋空间。",
      transparencyAnalysis: "意义不是一次性摊开，而是在理解与回味之间缓慢展开。",
      lingeringAnalysis: "余韵来自尾句之后的空白与停驻，而不靠夸张的结论制造效果。",
      tensionAnalysis: "张力主要来自节制和暗流并存，表面平静，内部仍有推动力。",
      imageryAnalysis: "文本更多依靠具体事物和气味、触感来折射情绪。",
      timeAnalysis: "叙述擅长将一个瞬间延长，因此形成停驻感。",
      honestyAnalysis: "整体表演腔较弱，更愿意让经验本身发声。",
      cultureAnalysis: "文体记忆存在，但没有压过当下语言本身。",
    },
    suggestions: isDiagnosis
      ? [
          {
            title: "让名词承担重量",
            text: "减少替读者规定感受的修饰词，让场景自身完成更多表达。",
            example: "修改前：那场雨极其悲悯。 修改后：雨落下来，枯叶陷进黑土。",
          },
          {
            title: "用物象并置代替直说",
            text: "不要直接说明孤独或悲伤，让多个具体物象之间形成摩擦。",
            example: "修改前：我感到记忆在褪色。 修改后：相册摊开，纸边发白，窗台落灰。",
          },
        ]
      : [],
    literaryHistoryVerdict: {
      distinctStyle: "兼具留白意识与现代冷调叙述的混合质地。",
      historicalHighlight: "最动人的地方在于，它不靠高声抒情也能留下回响。",
      criticalDefect: "部分句法仍然过于顺滑，摩擦感还可以再增强一些。",
    },
  };
}

function getMockCompareData(): CompareResult {
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
      summary: "文字 A 更偏克制、冷调、深潜。",
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
      summary: "文字 B 更偏热烈、浓密、直接推进。",
    },
    comparison: [
      {
        dimension: "温度",
        valueA: 20,
        valueB: 85,
        desc: "A 偏冷而收束，B 偏热而外放。",
      },
      {
        dimension: "密度",
        valueA: 35,
        valueB: 75,
        desc: "A 更疏朗，B 更密集。",
      },
      {
        dimension: "透明度",
        valueA: 70,
        valueB: 25,
        desc: "A 更依赖回味，B 更趋向直达。",
      },
    ],
    finalVerdict:
      "两者代表了两种截然不同的写作姿态：A 更克制含隐，B 更浓烈铺陈。",
    literaryHistoryVerdict: {
      textAHistory: "A 更接近现代极简和冷调书写传统。",
      textBHistory: "B 更接近浪漫化和高密度修辞传统。",
      comparativeSignificance: "这组对照清楚地展示了克制与宣泄之间的差异。",
    },
  };
}

async function handleAnalyze(body: any) {
  const { text, textA, textB, mode } = body || {};

  try {
    if (mode === "B" || textB) {
      const schema = {
        textA: { name: "string", scores: "object", lingeringType: "string", summary: "string" },
        textB: { name: "string", scores: "object", lingeringType: "string", summary: "string" },
        comparison: [{ dimension: "string", valueA: 0, valueB: 0, desc: "string" }],
        finalVerdict: "string",
        literaryHistoryVerdict: {
          textAHistory: "string",
          textBHistory: "string",
          comparativeSignificance: "string",
        },
      };

      const responseText = await callModel(
        "You are a literary critic. Return only valid JSON.",
        `Compare the following two Chinese texts from the perspective of literary aesthetics.

Text A:
${textA || ""}

Text B:
${textB || ""}

Return only JSON matching this shape:
${JSON.stringify(schema)}`,
        0.3,
      );

      return JSON.parse(extractJsonPayload(responseText));
    }

    const schema = {
      scores: {
        temperature: { value: 0, desc: "string" },
        density: { value: 0, desc: "string" },
        transparency: { value: 0, desc: "string" },
        lingering: { value: 0, desc: "string" },
        tension: { value: 0, desc: "string" },
        imagery: { value: 0, desc: "string" },
        time: { value: 0, desc: "string" },
        honesty: { value: 0, desc: "string" },
        culture: { value: 0, desc: "string" },
      },
      lingeringType: "string",
      tags: ["string"],
      summary: "string",
      details: {
        temperatureAnalysis: "string",
        densityAnalysis: "string",
        transparencyAnalysis: "string",
        lingeringAnalysis: "string",
        tensionAnalysis: "string",
        imageryAnalysis: "string",
        timeAnalysis: "string",
        honestyAnalysis: "string",
        cultureAnalysis: "string",
      },
      suggestions: [{ title: "string", text: "string", example: "string" }],
      literaryHistoryVerdict: {
        distinctStyle: "string",
        historicalHighlight: "string",
        criticalDefect: "string",
      },
    };

    const modeInstruction =
      mode === "C"
        ? "Focus especially on honesty, aftertaste, and 2-3 concrete revision suggestions."
        : "Provide a full literary-aesthetics report.";

    const responseText = await callModel(
      "You are a literary critic. Return only valid JSON.",
      `Analyze the following Chinese text using a 9-dimension literary aesthetics framework.

Text:
${text || ""}

${modeInstruction}

Return only JSON matching this shape:
${JSON.stringify(schema)}`,
      0.4,
    );

    return JSON.parse(extractJsonPayload(responseText));
  } catch (error) {
    console.error("Analyze fallback activated:", error);
    return {
      error: "Analysis service fallback activated.",
      fallback: true,
      data: mode === "B" ? getMockCompareData() : getMockAnalyzeData(mode),
    };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const result = await handleAnalyze(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Analyze handler failed:", error);
    res.status(200).json({
      error: "Analyze handler fallback activated.",
      fallback: true,
      data: getMockAnalyzeData(req.body?.mode),
    });
  }
}
