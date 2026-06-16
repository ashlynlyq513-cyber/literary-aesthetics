const MODEL_API_BASE = process.env.MODEL_API_BASE || "https://ckff.dev/v1";
const MODEL_API_KEY = process.env.MODEL_API_KEY || "";
const MODEL_NAME = process.env.MODEL_NAME || "gemini-3.1-flash-lite-preview";

async function callModel(messages: any[]) {
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
      temperature: 0.7,
      messages,
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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const dialogue = (req.body?.messages || [])
      .map((m: any) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    const content = await callModel([
      {
        role: "system",
        content:
          "You are a literary aesthetics assistant. Be concise, perceptive, and warm. Reply in Chinese.",
      },
      {
        role: "user",
        content: dialogue,
      },
    ]);

    res.status(200).json({ content });
  } catch (error: any) {
    console.error("Chat fallback activated:", error);
    res.status(200).json({
      error: "Chat fallback activated.",
      content: "我暂时无法连通模型服务，但仍然可以继续围绕你的文本做基础讨论。",
    });
  }
}
