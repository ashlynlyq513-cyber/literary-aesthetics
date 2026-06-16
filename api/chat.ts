import { runChat } from "./_shared.ts";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const result = await runChat(req.body);
  if (result?.error) {
    res.status(500).json(result);
    return;
  }
  res.status(200).json(result);
}
