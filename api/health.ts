export default function handler(_req: any, res: any) {
  return res.status(200).json({
    ok: true,
    runtime: "vercel-node",
    hasModelApiBase: Boolean(process.env.MODEL_API_BASE),
    hasModelApiKey: Boolean(process.env.MODEL_API_KEY),
    hasModelName: Boolean(process.env.MODEL_NAME),
  });
}
