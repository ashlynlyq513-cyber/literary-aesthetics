import dotenv from "dotenv";
import express from "express";
import os from "os";
import { createServer as createViteServer } from "vite";
import { analyzeText, chatText } from "./lib/literary-service.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());

app.post("/api/analyze", async (req, res) => {
  const result = await analyzeText(req.body);
  res.status(result.status).json(result.body);
});

app.post("/api/chat", async (req, res) => {
  const result = await chatText(req.body);
  res.status(result.status).json(result.body);
});

function getLanAddresses() {
  const interfaces = os.networkInterfaces();
  return Object.values(interfaces)
    .flat()
    .filter((detail): detail is os.NetworkInterfaceInfo => Boolean(detail))
    .filter((detail) => detail.family === "IPv4" && !detail.internal)
    .map((detail) => detail.address);
}

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);

    const lanAddresses = getLanAddresses();
    if (lanAddresses.length > 0) {
      console.log("LAN preview URLs:");
      lanAddresses.forEach((address) => {
        console.log(`  http://${address}:${port}`);
      });
    }
  });
}

startServer();
