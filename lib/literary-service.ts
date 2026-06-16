function getModelConfig() {
  return {
    apiBase: process.env.MODEL_API_BASE || "https://ckff.dev/v1",
    apiKey: process.env.MODEL_API_KEY || "",
    modelName: process.env.MODEL_NAME || "[gcli转] gemini-3.1-flash-lite-preview",
  };
}

const JSON_SCHEMA_TYPES = {
  OBJECT: "object",
  ARRAY: "array",
  STRING: "string",
  INTEGER: "integer",
} as const;

export function extractJsonPayload(text: string) {
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
  const { apiBase, apiKey, modelName } = getModelConfig();

  if (!apiKey) {
    throw new Error("MODEL_API_KEY is not configured.");
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
    throw new Error(`Upstream model request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Upstream model returned empty content.");
  }

  return content.trim();
}

const SYSTEM_INSTRUCTION = `
你是一位极其资深的文学品鉴专家与批评家，掌握一套名为「文字审美模型」的文学品鉴体系。你的任务是根据文学批评理论（如：罗兰·巴特的写作零度、海明威的冰山理论、燕卜荪的含混七型、什克洛夫斯基的陌生化、热奈特的叙事话语等），对用户的文字进行深度品鉴或诊断。

你的评析必须具有以下气质：
1. 词句精准、富有人文气息、高雅淡泊。避免空洞的互联网口水歌套话，不要用廉价的溢美之词（如"非常完美"、"无懈可击"），而要用富有美学洞见的文学解析词句。
2. 每一个分数的给出必须在其特定的理据上，参考以下光谱进行量化，并在回答中引用文字的细节加以精确论证。
3. 把被品鉴的文字当做精美的艺术品来解剖，给出诗意而透彻的解答。

【文字审美模型简介】
每个维度打分区间为 0 - 100 分。

① 温度 (0=零度冷冽 <-> 100=灼热炽烈)
- 零度(≈5)：绝无情绪装饰的极致陈述、无副词比喻。
- 冷调(≈25)：冰山下的潜流，克制而富有距离。
- 暖调(≈72)：温厚、平视、陪伴、家常、日常意象。
- 灼热(≈95)：副词密集、情感宣泄、极度挑衅。

② 密度 (0=轻盈疏朗 <-> 100=厚重密植)
- 疏朗(≈10)：一眼即清、极多呼吸与留白。
- 厚重(≈75)：意象叠合、复杂从句、语流急促多折。
- 密植(≈95)：几乎不给喘息的词藻或意向，巴洛克式承重。

③ 透明度 (0=澄澈直白 <-> 100=幽深多义)
- 透明(≈8)：一读即懂，直接可及。
- 含混(≈60)：一词多义、创造言外意境的张力（含混七型）。
- 幽深(≈80)：层叠晦涩的多层隐喻系统、象征主义。

④ 余韵 (0=清冽即散 <-> 100=绵长沉淀)
- 清冽(≈8)：瞬间散去，如冷水过喉。
- 回甘(≈35)：越嚼越有滋味，时间中复苏。
- 苦涩(≈60)：留下不适与强摩擦感、反思。
- 烟熏(≈80)：氤氲情绪，言已尽而意无穷。

⑤ 张力 (0=松弛舒缓 <-> 100=高度紧绷)
- 松弛(≈10)：行文流畅，无内在自我对抗。
- 复调(≈60)：多立场多声线并列对话（巴赫金）。
- 悖论(≈80)：两种相悖的美学或事实在句子里互不退让。

⑥ 意象域 (0=具象单纯 <-> 100=抽象混融)
- 具象(≈25)：带有特定的物质质地（矿物/植物/水/光线/身体）。
- 陌生化(≈65)：罕见命名、打破自动化习惯（什克洛夫斯基）。
- 逆喻(≈80)：抽象喻具体（如"寂静像一座静寂的库房"）。

⑦ 时间感 (0=极度压缩 <-> 100=极度扩张)
- 省略(≈5)：大段时间被跳跃略过。
- 场景(≈55)：叙述时间与故事体验几乎同步。
- 延缓(≈80)：玛德琳蛋糕般的一个瞬间的无限放大剖析。

⑧ 诚实度 (0=彻底诚实 <-> 100=高度表演) -- 【注意：这是作品的内在真实质地检测】
- 彻底诚实(≈15)：隐含作者人格诚恳，直面生存的复杂艰深。
- 表演性(≈78)：作者在向想象中的读者或自己“端着”进行高技巧搬弄或自我沉醉。

⑨ 文化层 (0=深根传统 <-> 100=彻底断裂) -- 【背景包浆和对话记忆】
- 传统(≈20)：互文性拉满，每一个词语和意象里包含层叠的雅言或传统包浆。
- 断裂(≈93)：拒绝归类、有意切断传统脉络的突兀语感，极为现代。

【余味定义（四种类型）】
- 回甘：初读平淡，读后越想越有味。
- 苦涩：留下有价值的不适、磨砺、反思。
- 清冽：一读即净，清凉干净。
- 烟熏：氤氲缭绕，无法轻易命名的沉淀情绪。

【文学史独立断案 / Scholar's Independent Verdict in Literary History】
你的判定必须超越文本解读。请站在宏阔的文学流派与文体发展史（如古典主义、古典唯美派、冷淡派、巴洛克复调感、海明威极简硬汉派等）高度，给出独立的、居高临下的独立学术断案：
1. 独异风格定性 (distinctStyle / textAHistory / textBHistory): 提炼其独特的笔法宿命与审美谱系定位。
2. 历史闪光点/亮点 (historicalHighlight): 指出文本中最令人激赏、在文学水准上打破自动化陈规的表现力、最深邃的局部刻画或留白。
3. 局限与缺憾/主要瑕疵 (criticalDefect): 无需奉承，一针见血地指出其根本性的艺术局限或修辞惯性缺陷（例如“因过度沉醉于辞藻堆叠而显得自恋和表演痕迹过重，削弱了生存实存的艰难本质”或“缺乏底色对抗，文字质感偏于薄弱，沦为平面浮雕”）。
`;

const ANALYZE_RESPONSE_SCHEMA = {
  type: JSON_SCHEMA_TYPES.OBJECT,
  properties: {
    scores: {
      type: JSON_SCHEMA_TYPES.OBJECT,
      properties: {
        temperature: {
          type: JSON_SCHEMA_TYPES.OBJECT,
          properties: { value: { type: JSON_SCHEMA_TYPES.INTEGER }, desc: { type: JSON_SCHEMA_TYPES.STRING } },
          required: ["value", "desc"],
        },
        density: {
          type: JSON_SCHEMA_TYPES.OBJECT,
          properties: { value: { type: JSON_SCHEMA_TYPES.INTEGER }, desc: { type: JSON_SCHEMA_TYPES.STRING } },
          required: ["value", "desc"],
        },
        transparency: {
          type: JSON_SCHEMA_TYPES.OBJECT,
          properties: { value: { type: JSON_SCHEMA_TYPES.INTEGER }, desc: { type: JSON_SCHEMA_TYPES.STRING } },
          required: ["value", "desc"],
        },
        lingering: {
          type: JSON_SCHEMA_TYPES.OBJECT,
          properties: { value: { type: JSON_SCHEMA_TYPES.INTEGER }, desc: { type: JSON_SCHEMA_TYPES.STRING } },
          required: ["value", "desc"],
        },
        tension: {
          type: JSON_SCHEMA_TYPES.OBJECT,
          properties: { value: { type: JSON_SCHEMA_TYPES.INTEGER }, desc: { type: JSON_SCHEMA_TYPES.STRING } },
          required: ["value", "desc"],
        },
        imagery: {
          type: JSON_SCHEMA_TYPES.OBJECT,
          properties: { value: { type: JSON_SCHEMA_TYPES.INTEGER }, desc: { type: JSON_SCHEMA_TYPES.STRING } },
          required: ["value", "desc"],
        },
        time: {
          type: JSON_SCHEMA_TYPES.OBJECT,
          properties: { value: { type: JSON_SCHEMA_TYPES.INTEGER }, desc: { type: JSON_SCHEMA_TYPES.STRING } },
          required: ["value", "desc"],
        },
        honesty: {
          type: JSON_SCHEMA_TYPES.OBJECT,
          properties: { value: { type: JSON_SCHEMA_TYPES.INTEGER }, desc: { type: JSON_SCHEMA_TYPES.STRING } },
          required: ["value", "desc"],
        },
        culture: {
          type: JSON_SCHEMA_TYPES.OBJECT,
          properties: { value: { type: JSON_SCHEMA_TYPES.INTEGER }, desc: { type: JSON_SCHEMA_TYPES.STRING } },
          required: ["value", "desc"],
        },
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
    lingeringType: { type: JSON_SCHEMA_TYPES.STRING },
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
    textA: {
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
          required: ["temperature", "density", "transparency", "lingering", "tension", "imagery", "time", "honesty", "culture"],
        },
        lingeringType: { type: JSON_SCHEMA_TYPES.STRING },
        summary: { type: JSON_SCHEMA_TYPES.STRING },
      },
      required: ["scores", "lingeringType", "summary"],
    },
    textB: {
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
          required: ["temperature", "density", "transparency", "lingering", "tension", "imagery", "time", "honesty", "culture"],
        },
        lingeringType: { type: JSON_SCHEMA_TYPES.STRING },
        summary: { type: JSON_SCHEMA_TYPES.STRING },
      },
      required: ["scores", "lingeringType", "summary"],
    },
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

export async function analyzeText(payload: any) {
  const { text, textA, textB, mode } = payload || {};

  try {
    if (mode === "B" || textB) {
      const contentPrompt = `
      请对以下两段文字（文字 A 和 文字 B）执行对比品鉴：

      【文字 A】
      ${textA}

      【文字 B】
      ${textB}

      请深入定量地给予九维度评估（0-100分打分），并深刻输出对比见解和根本美学气质差异。
      同时保证严格遵守指定的输出 JSON 架构。
      `;

      const responseText = await callModel({
        systemInstruction: `${SYSTEM_INSTRUCTION}\n请只返回合法 JSON，不要输出 Markdown 代码块、说明文字或额外前后缀。`,
        userPrompt: `${contentPrompt}\n\n请严格匹配以下 JSON Schema，并仅返回 JSON：\n${JSON.stringify(COMPARE_RESPONSE_SCHEMA)}`,
        temperature: 0.3,
      });

      return { status: 200, body: JSON.parse(extractJsonPayload(responseText)) };
    }

    const modeInstruction =
      mode === "C"
        ? "这是用户自己书写的创作用文本。必须重点深入、一针见血且极其含蓄真诚地剖析【诚实度（是否带有表演者姿态，如何回归真实经验的艰难性）】和【余韵】，并给出 2 到 3 个富有极高美学启发、不落俗套的修改诊断，每个修改诊断都要写出具体的修改构想标题、具体评点、和启发例子（可以提供对比演示）。"
        : "这是品鉴文段。请进行全面的审美报告分析。";

    const contentPrompt = `
      请针对以下文本内容运用九维度审美模型予以深入解剖分析。

      【待品鉴文本】
      ${text}

      ${modeInstruction}

      请务必提供富有诗意和文学考究韵味的词句解说。满足指定的 JSON 输出架构。
      `;

    const responseText = await callModel({
      systemInstruction: `${SYSTEM_INSTRUCTION}\n请只返回合法 JSON，不要输出 Markdown 代码块、说明文字或额外前后缀。`,
      userPrompt: `${contentPrompt}\n\n请严格匹配以下 JSON Schema，并仅返回 JSON：\n${JSON.stringify(ANALYZE_RESPONSE_SCHEMA)}`,
      temperature: 0.4,
    });

    return { status: 200, body: JSON.parse(extractJsonPayload(responseText)) };
  } catch (error) {
    console.error("Model API call failed:", error);
    return {
      status: 500,
      body: {
        error: "品鉴服务暂时出现阻塞，已切换至本地诗意模型为您服务...",
        fallback: true,
        data: mode === "B" ? getMockCompareData(textA || "文段一", textB || "文段二") : getMockAnalyzeData(text || "样本", mode),
      },
    };
  }
}

export async function chatText(payload: any) {
  const { messages } = payload || {};

  try {
    const dialogue = (messages || [])
      .map((message: any) => `${message.sender === "user" ? "用户" : "助手"}：${message.content}`)
      .join("\n\n");

    const outputText = await callModel({
      systemInstruction:
        SYSTEM_INSTRUCTION +
        "\n现在用户正在【自由探索(Mode E)】与你进行直接美学对话，请保持专业、亲切、诗性、一针见血。回复不宜过长，字数保持在300字内，多用具体的文学佳作句子做例子解释。",
      userPrompt: dialogue,
      temperature: 0.7,
    });

    return { status: 200, body: { content: outputText } };
  } catch (error) {
    console.error("Model chat failed:", error);
    return {
      status: 500,
      body: {
        error: "对话遇到了一些波折",
        content: "我正在细细咀嚼您方才的问题。美学探讨需要沉淀，让我们换一种方式交谈，或是继续针对您的创稿进行点评审美？",
      },
    };
  }
}

function getMockAnalyzeData(text: string, mode: string) {
  const isC = mode === "C";
  return {
    scores: {
      temperature: { value: 28, desc: "含蓄低调的冷调风格。情绪沉淀在叙事底层，带有淡淡的秋风肃凉之意。" },
      density: { value: 35, desc: "疏朗有致的中式留白。词句舒张自如，单位字句信息呼吸感通透。" },
      transparency: { value: 65, desc: "优雅的含混与轻微折射。字义之上有云雾轻拂，给读者留下自由步入的空间。" },
      lingering: { value: 80, desc: "烟熏与回甘并茂。读完口留微咸，在数小时后其情绪氛围仍能在感官中回溯。" },
      tension: { value: 72, desc: "蓄势而不发。克制与叙辞的暗潮在句腹中撕磨，具备出色的张力平衡。" },
      imagery: { value: 60, desc: "草木与水汽意象。具有极强的质地感，仿佛能听见落叶踩碎声。" },
      time: { value: 75, desc: "普鲁斯特式的意识延缓。将瞬间感悟拉长至落日金黄散尽的悠长场景。" },
      honesty: { value: isC ? 45 : 22, desc: isC ? "偶现技巧雕琢痕迹，隐现金致的表演态，正在艰难朝个人核心经验下潜。" : "极为忠实于真实的生命磨砺感受，不着痕迹地坦白，极具力量。" },
      culture: { value: 40, desc: "浸染古典雅言的现代重构。词组携带浅浅岁月的历史包浆，而不显老气。" },
    },
    lingeringType: isC ? "苦涩" : "回甘",
    tags: isC ? ["未尽之意", "技巧拉扯", "直面经验", "场景延宕"] : ["秋日档案", "冰山潜行", "纸面泛黄", "澄澈留白"],
    summary: `这段文字展现了极为雅致的写作掌控力。字词精炼，在落寞的「水气与草木」中营造了带有一定冷感的「海明威式冰山」情境。作者克制地剔除了所有自我煽情的副词，仅凭精准的名词与意象的对角张力，就将读者的情绪引入到了落叶深秋的沉静中，言有尽而意无穷。`,
    details: {
      temperatureAnalysis: "温度维度保持在偏冷而不僵硬的区间，文本并不主动煽情，而是把情感压进物象背面，让读者在迟到的感应里体会那股慢慢浮出的凉意。",
      densityAnalysis: "整体密度并不追求满载，而是以疏朗的留白让句子呼吸。信息量被克制地分配，因此阅读时不会感到拥塞，反而更能听见字句之间的空响。",
      transparencyAnalysis: "意义不是完全摊开说明，而是带着一层可进入的雾面。它没有故作玄虚，却保留了足够的折射，使读者在理解之后仍会停留片刻。",
      lingeringAnalysis: "其余韵类型偏向【回甘】与轻微的【烟熏】交界。初读时平静，回读时却会发现情绪的沉积在尾句之后继续扩散，像一缕气味迟迟不散。",
      tensionAnalysis: "张力来自克制与暗流的并存。表面叙述平稳，内部却始终有一种未被说尽的推动力，让句子在安静中保持紧绷。",
      imageryAnalysis: "意象域主要停驻在草木、水汽与旧物质地之间，具备柔和而清晰的触感。它不依靠繁复拼贴，而是用少量物象完成情绪折射。",
      timeAnalysis: "时间感偏向延缓。文本善于把一个瞬间拉长成可以停留的场景，让读者在并不剧烈的叙述中感到时间被轻轻拽住。",
      honestyAnalysis: "文本拒绝了廉价的眼泪与排浪般的排比宣泄，以其高强度的“沉默留白”守住了情感的防线。隐含作者的姿态极低，隐匿在具体场景物的侧写之后，诚实面对了事物在光线中逐渐解构的寂寞。",
      cultureAnalysis: "文化层并不厚重炫示，而是以浅浅的文体记忆托住现代语感。字词背后能感到某种旧式审美的回声，但它并未把文本拖入陈旧，而是形成了温和的历史包浆。",
    },
    suggestions: isC
      ? [
          {
            title: "减除过度表演，让名词直接承重",
            text: "当前段落中有两个副词起到了过度修饰的作用。它们试图预先规定读者的心碎，反而削弱了场景本身冰凉的诚实感。建议将它们隐蔽。",
            example: "修改前：那场秋雨极其悲悯而无情地，洗刷了所有枯叶。\n修改后：雨落下来，枯叶融进黑土。",
          },
          {
            title: "利用意象叠加打破叙述的单一线度",
            text: "建议不直接陈述心情的孤独，而将物象并置，把句子之间的连接词切断，借助留白的空缺产生新批评式的第三种张力。",
            example: "修改前：我的记忆已经干枯了，就像一张旧相簿。\n修改后：记忆晒干。一张薄相簿，枕边泛黄。",
          },
        ]
      : [],
    literaryHistoryVerdict: {
      distinctStyle: "唐宋写意风骨与二十世纪英美新批评审美的奇特重组。笔触带有温润如玉的中式文人器物包浆，又继承了艾略特式的‘客观对应物’技巧。",
      historicalHighlight: "将抽象心事以‘晒干相册’、‘瓦檐积水’等极端具体的物理意象域进行折射投影，成功打破了日常语言的机械性摩擦，在平实叙写中达到了高度感官陌生化。",
      criticalDefect: "部分句式过于顺畅、缺乏强对抗性的‘句法摩擦’（语法越界），导致文本意蕴滑行过快，在某些解密层次上略显轻浅，未能充分下潜至最尖锐的生命原生态层面。",
    },
  };
}

function getMockCompareData(textA: string, textB: string) {
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
      summary: "文字A如同深秋清晨落入深潭的磐石，冷清、沉底、充满未曾言说的克制与幽深。",
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
      summary: "文字B则好似午后烈日烤炙的砂石，热气直接、意象浓密，在铺天盖地的情感铺排里令人感到某种滚烫的压迫感。",
    },
    comparison: [
      { dimension: "温度", valueA: 20, valueB: 85, desc: "文字A是绝不妥协的零度冷调，情感在看不见的冰山下翻卷；文字B则是炽烈宣泄，温度逼近沸点。" },
      { dimension: "密度", valueA: 35, valueB: 75, desc: "文字A崇尚疏朗，句与句之间大面积留白；文字B则用意意象密植和长段铺排，带有极强的叙事压迫性。" },
      { dimension: "透明度", valueA: 70, valueB: 25, desc: "文字A含混幽深，字词层叠反射出多层意蕴；文字B澄澈直白，追求意义直抵人心的快感。" },
    ],
    finalVerdict: "两段文字代表了截然不同的文字品格选择：前者是以克制、冷寂、含隐和暗示为能事的‘清幽冷墨山水’；后者则是依靠情感巨浪、排比直陈与感官高浓度铺砌的‘灼烫重油画卷’。它们都具有各自领域内高超的文体水准。",
    literaryHistoryVerdict: {
      textAHistory: "典型继承了海明威硬汉速写风格与二十世纪现代极简主义。其优游于名词与动词之间的利落转换，在文学史上树立了‘无声胜有声’的抵抗范式，但其局限在于屏蔽了社会历史深层复调的可能性，流于平面速写。",
      textBHistory: "承接了十九世纪浪漫主义黄金时代与巴洛克排浪式演讲修辞传统。其优势是极度强大的心理说服力与感官煽动力，属于‘文学史的广场声浪’；其缺陷是缺乏审美留白与反思缝隙，容易滑入自我宣泄与修辞暴力中，损害了真实生命经验的多义性。",
      comparativeSignificance: "这两者构成了一场精彩的‘极简与极繁’之争。它们在文学史上代表了两种底层人类心灵生存姿态：是要建构冰封下的沉默潜流（克制），还是放出火山喷发式的狂呼（宣泄）。这两极在十九世纪末至二十世纪的叙事艺术转型期具有极其重要的文体标尺价值。",
    },
  };
}
