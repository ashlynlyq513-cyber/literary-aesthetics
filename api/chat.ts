export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { chatText } = await import("../lib/literary-service.js");
    const result = await chatText(req.body);
    return res.status(result.status).json(result.body);
  } catch (error: any) {
    console.error("chat handler failed", error);
    return res.status(500).json({
      error: "chat handler failed",
      detail: error?.message || String(error),
      stack: process.env.NODE_ENV === "production" ? undefined : error?.stack,
    });
  }
}
