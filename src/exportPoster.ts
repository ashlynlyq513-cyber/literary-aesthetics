import { AestheticsReport, ComparisonReport } from "./types";

type Mode = "A" | "B" | "C";
type PosterInput =
  | { mode: "A"; report: AestheticsReport }
  | { mode: "B"; report: ComparisonReport }
  | { mode: "C"; report: AestheticsReport };

type RadarItem = { label: string; value: number; valueB?: number };

const W = 720;
const PAD = 44;
const MAX_BYTES = 1024 * 1024;
const EXPORT_SCALES = [1.5, 1.25, 1];
const INK = "#2C2C2B";
const PAPER = "#F7F3EA";
const LINE = "rgba(44,44,43,0.12)";
const MUTED = "rgba(44,44,43,0.58)";
const SAGE = "#8C927F";
const NUMERIC_FONT = "'Helvetica Neue', Arial, sans-serif";

const titles = { A: "单卷品鉴", B: "同框对照", C: "创作诊断" } as const;
const subtitles = { A: "MODE A · 单卷品鉴", B: "MODE B · 同框对照", C: "MODE C · 创作诊断" } as const;

const scoreMap = [
  ["temperature", "温度"],
  ["density", "密度"],
  ["transparency", "透明度"],
  ["lingering", "余韵"],
  ["tension", "张力"],
  ["imagery", "意象域"],
  ["time", "时间感"],
  ["honesty", "诚实度"],
  ["culture", "文化层"],
] as const;

const details = [
  ["temperature", "temperatureAnalysis", "核心轴"],
  ["density", "densityAnalysis", "核心轴"],
  ["transparency", "transparencyAnalysis", "核心轴"],
  ["lingering", "lingeringAnalysis", "核心轴"],
  ["tension", "tensionAnalysis", "扩展轴"],
  ["imagery", "imageryAnalysis", "扩展轴"],
  ["time", "timeAnalysis", "扩展轴"],
  ["honesty", "honestyAnalysis", "元层级"],
  ["culture", "cultureAnalysis", "元层级"],
] as const;

const desc = (label: string, value: number) => {
  if (label === "温度") return value >= 67 ? "暖调" : value >= 34 ? "温和" : "冷调";
  if (label === "密度") return value >= 67 ? "繁密" : value >= 34 ? "匀实" : "疏朗";
  if (label === "透明度") return value >= 67 ? "幽深" : value >= 34 ? "清透" : "直白";
  if (label === "余韵") return value >= 67 ? "沉潜" : value >= 34 ? "回甘" : "即散";
  if (label === "张力") return value >= 67 ? "紧绷" : value >= 34 ? "含张力" : "松弛";
  if (label === "意象域") return value >= 67 ? "抽象" : value >= 34 ? "兼具" : "具象";
  if (label === "时间感") return value >= 67 ? "延绵" : value >= 34 ? "舒展" : "凝缩";
  if (label === "诚实度") return value >= 67 ? "表演感" : value >= 34 ? "克制" : "坦露";
  return value >= 67 ? "新变" : value >= 34 ? "兼容" : "传统";
};

class Painter {
  y = PAD;
  cw = W - PAD * 2;

  constructor(readonly ctx: CanvasRenderingContext2D) {
    ctx.textBaseline = "top";
  }

  font(size: number, weight = 400, family = "Georgia, 'Songti SC', 'Noto Serif SC', serif") {
    this.ctx.font = `${weight} ${size}px ${family}`;
  }

  text(text: string, x: number, y: number, opt: { size?: number; weight?: number; color?: string; align?: CanvasTextAlign; family?: string; maxWidth?: number } = {}) {
    this.ctx.save();
    this.font(opt.size ?? 24, opt.weight ?? 400, opt.family);
    this.ctx.fillStyle = opt.color ?? INK;
    this.ctx.textAlign = opt.align ?? "left";
    this.ctx.fillText(text, x, y, opt.maxWidth);
    this.ctx.restore();
  }

  rounded(x: number, y: number, w: number, h: number, r: number) {
    const rr = Math.min(r, w / 2, h / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(x + rr, y);
    this.ctx.arcTo(x + w, y, x + w, y + h, rr);
    this.ctx.arcTo(x + w, y + h, x, y + h, rr);
    this.ctx.arcTo(x, y + h, x, y, rr);
    this.ctx.arcTo(x, y, x + rr, y, rr);
    this.ctx.closePath();
  }

  card(h: number) {
    const box = { x: PAD, y: this.y, w: this.cw, h };
    this.ctx.save();
    this.ctx.fillStyle = "rgba(255,255,255,0.72)";
    this.ctx.strokeStyle = LINE;
    this.rounded(box.x, box.y, box.w, box.h, 18);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
    return box;
  }

  line(x1: number, y1: number, x2: number, y2: number) {
    this.ctx.save();
    this.ctx.strokeStyle = LINE;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  header(title: string, sub: string, x: number, y: number, w: number, options: { bracketSub?: boolean } = {}) {
    this.text(title, x, y, { size: 27, weight: 600 });
    const subText = options.bracketSub ? `【${sub}】` : sub;
    this.text(subText, x + w, options.bracketSub ? y : y + 8, {
      size: options.bracketSub ? 27 : 12,
      weight: options.bracketSub ? 600 : 400,
      color: options.bracketSub ? INK : "rgba(44,44,43,0.42)",
      align: "right",
      family: options.bracketSub ? undefined : NUMERIC_FONT,
    });
    this.line(x, y + 48, x + w, y + 48);
  }

  measure(body: string, maxW: number, size = 25, lh = Math.round(size * 1.72)) {
    this.font(size);
    let lines = 0;
    const paragraphs = String(body || "").split(/\n+/).filter(Boolean);
    paragraphs.forEach((para, index) => {
      let line = "";
      Array.from(para.trim()).forEach((ch) => {
        const test = line + ch;
        if (this.ctx.measureText(test).width > maxW && line) {
          lines += 1;
          line = ch;
        } else {
          line = test;
        }
      });
      if (line) lines += 1;
      if (index < paragraphs.length - 1) {
        lines += 0.35;
      }
    });
    return Math.max(lh, lines * lh);
  }

  wrap(body: string, x: number, y: number, maxW: number, size = 25, lh = Math.round(size * 1.72), color = "rgba(44,44,43,0.8)") {
    this.ctx.save();
    this.font(size);
    this.ctx.fillStyle = color;
    let cy = y;
    String(body || "").split(/\n+/).filter(Boolean).forEach((para, pi, arr) => {
      let line = "";
      Array.from(para.trim()).forEach((ch) => {
        const test = line + ch;
        if (this.ctx.measureText(test).width > maxW && line) {
          this.ctx.fillText(line, x, cy);
          cy += lh;
          line = ch;
        } else {
          line = test;
        }
      });
      if (line) {
        this.ctx.fillText(line, x, cy);
        cy += lh;
      }
      if (pi < arr.length - 1) cy += Math.round(lh * 0.35);
    });
    this.ctx.restore();
    return cy - y;
  }
}

const reportRadar = (report: AestheticsReport): RadarItem[] =>
  scoreMap.map(([key, label]) => ({ label, value: report.scores[key].value }));

const compareRadar = (report: ComparisonReport): RadarItem[] =>
  scoreMap.map(([key, label]) => ({ label, value: report.textA.scores[key], valueB: report.textB.scores[key] }));

const drawTop = (p: Painter, mode: Mode) => {
  p.text(subtitles[mode], W - PAD, p.y + 4, { size: 13, color: "rgba(44,44,43,0.42)", align: "right", family: NUMERIC_FONT });
  p.y += 58;
  const cx = W / 2;
  p.ctx.save();
  p.ctx.fillStyle = "rgba(140,146,127,0.58)";
  p.ctx.beginPath();
  p.ctx.arc(cx, p.y, 3, 0, Math.PI * 2);
  p.ctx.fill();
  p.line(cx, p.y + 10, cx, p.y + 58);
  p.ctx.strokeStyle = "rgba(140,146,127,0.36)";
  p.ctx.beginPath();
  p.ctx.arc(cx, p.y + 74, 9, 0, Math.PI * 2);
  p.ctx.stroke();
  p.ctx.restore();
  p.y += 100;
  p.text("九维·余韵", cx, p.y, { size: 43, weight: 300, align: "center" });
  p.text("Nine-dimensional Afterglow · 文字审美模型", cx, p.y + 55, { size: 21, color: "rgba(44,44,43,0.64)", align: "center" });
  p.y += 106;
};

const drawTextCard = (p: Painter, title: string, sub: string, body: string) => {
  const h = 94 + p.measure(body, p.cw - 56, 26, 46);
  const card = p.card(h);
  p.header(title, sub, card.x + 28, card.y + 24, card.w - 56);
  p.wrap(body, card.x + 28, card.y + 88, card.w - 56, 26, 46);
  p.y += h + 20;
};

const measureTags = (p: Painter, tags: string[], maxW: number) => {
  if (!tags.length) return 0;
  let x = 0;
  let rows = 1;
  p.font(16, 500, NUMERIC_FONT);
  tags.forEach((tag) => {
    const w = p.ctx.measureText(`#${tag}`).width + 28;
    if (x > 0 && x + w > maxW) {
      rows += 1;
      x = 0;
    }
    x += w + 10;
  });
  return rows * 34 + 14;
};

const drawTags = (p: Painter, tags: string[], x: number, y: number, maxW: number) => {
  if (!tags.length) return 0;
  let cx = x;
  let cy = y;
  p.font(16, 500, NUMERIC_FONT);
  tags.forEach((tag) => {
    const text = `#${tag}`;
    const w = p.ctx.measureText(text).width + 28;
    if (cx > x && cx + w > x + maxW) {
      cx = x;
      cy += 34;
    }
    p.ctx.save();
    p.ctx.fillStyle = "rgba(255,255,255,0.78)";
    p.ctx.strokeStyle = "rgba(140,146,127,0.34)";
    p.rounded(cx, cy, w, 26, 13);
    p.ctx.fill();
    p.ctx.stroke();
    p.ctx.restore();
    p.text(text, cx + 14, cy + 5, { size: 16, weight: 500, color: "rgba(44,44,43,0.68)", family: NUMERIC_FONT });
    cx += w + 10;
  });
  return cy - y + 40;
};

const drawSummaryCard = (p: Painter, title: string, sub: string, body: string, tags: string[] = [], options: { bracketSub?: boolean } = {}) => {
  const innerW = p.cw - 56;
  const tagsH = measureTags(p, tags, innerW);
  const h = 110 + tagsH + p.measure(body, innerW, 26, 46);
  const card = p.card(h);
  p.header(title, sub, card.x + 28, card.y + 24, innerW, options);
  let y = card.y + 96;
  y += drawTags(p, tags, card.x + 28, y, innerW);
  if (tags.length) {
    y += 10;
  }
  p.wrap(body, card.x + 28, y, innerW, 26, 46);
  p.y += h + 20;
};

const drawRadar = (p: Painter, data: RadarItem[], x: number, y: number, size: number) => {
  const ctx = p.ctx;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.3;
  const pt = (i: number, value: number) => {
    const a = (i * Math.PI * 2) / data.length - Math.PI / 2;
    return { x: cx + Math.cos(a) * r * (value / 100), y: cy + Math.sin(a) * r * (value / 100) };
  };
  ctx.save();
  ctx.strokeStyle = "rgba(44,44,43,0.12)";
  [0.2, 0.4, 0.6, 0.8, 1].forEach((s) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
    ctx.stroke();
  });
  data.forEach((_, i) => {
    const end = pt(i, 100);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });
  const shape = (values: number[], color: string, fill: string) => {
    ctx.beginPath();
    values.forEach((v, i) => {
      const pos = pt(i, v);
      if (i === 0) ctx.moveTo(pos.x, pos.y);
      else ctx.lineTo(pos.x, pos.y);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.fill();
    ctx.stroke();
    values.forEach((v, i) => {
      const pos = pt(i, v);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  };
  shape(data.map((item) => item.value), INK, "rgba(44,44,43,0.08)");
  if (data.some((item) => item.valueB !== undefined)) shape(data.map((item) => item.valueB ?? 0), SAGE, "rgba(140,146,127,0.16)");
  data.forEach((item, i) => {
    const a = (i * Math.PI * 2) / data.length - Math.PI / 2;
    const tx = cx + Math.cos(a) * (r + 42);
    const ty = cy + Math.sin(a) * (r + 42);
    const align = Math.cos(a) > 0.2 ? "left" : Math.cos(a) < -0.2 ? "right" : "center";
    p.text(item.label, tx, ty - 10, { size: 15, weight: 600, align: align as CanvasTextAlign });
    const labelDesc = item.valueB === undefined
      ? desc(item.label, item.value)
      : `${desc(item.label, item.value)}/${desc(item.label, item.valueB)}`;
    p.text(labelDesc, tx, ty + 9, { size: 11, color: "rgba(44,44,43,0.38)", align: align as CanvasTextAlign, family: NUMERIC_FONT });
  });
  ctx.restore();
};

const drawBars = (p: Painter, data: RadarItem[], x: number, y: number, w: number) => {
  let cy = y;
  data.forEach((item) => {
    p.text(item.label, x, cy - 2, { size: 17, weight: 600 });
    const itemDesc = item.valueB === undefined
      ? desc(item.label, item.value)
      : `${desc(item.label, item.value)}/${desc(item.label, item.valueB)}`;
    p.text(itemDesc, x, cy + 19, { size: 11, color: "rgba(44,44,43,0.38)", family: NUMERIC_FONT });
    const bx = x + 94;
    const bw = w - 142;
    p.ctx.save();
    p.ctx.fillStyle = "rgba(44,44,43,0.08)";
    p.rounded(bx, cy + 7, bw, 10, 5);
    p.ctx.fill();
    p.ctx.fillStyle = "rgba(44,44,43,0.62)";
    p.rounded(bx, cy + 7, bw * (item.value / 100), 10, 5);
    p.ctx.fill();
    if (item.valueB !== undefined) {
      p.ctx.fillStyle = "rgba(140,146,127,0.62)";
      p.rounded(bx, cy + 22, bw * (item.valueB / 100), 8, 4);
      p.ctx.fill();
    }
    p.ctx.restore();
    p.text(item.valueB === undefined ? String(item.value) : `${item.value}/${item.valueB}`, x + w, cy + 1, { size: 14, color: MUTED, align: "right", family: NUMERIC_FONT });
    cy += item.valueB === undefined ? 42 : 52;
  });
};

const drawAxis = (p: Painter, title: string, data: RadarItem[]) => {
  const hasCompare = data.some((item) => item.valueB !== undefined);
  const radarSize = 420;
  const radarTop = 96;
  const barsTop = radarTop + radarSize + 58;
  const rowHeight = hasCompare ? 52 : 42;
  const barsHeight = data.length * rowHeight;
  const h = barsTop + barsHeight + 46;
  const card = p.card(h);
  p.header(title, "AXIS OVERVIEW", card.x + 28, card.y + 24, card.w - 56);
  drawRadar(p, data, card.x + (card.w - radarSize) / 2, card.y + radarTop, radarSize);
  drawBars(p, data, card.x + 34, card.y + barsTop, card.w - 68);
  p.y += h + 20;
};

const drawNotes = (p: Painter, report: AestheticsReport) => {
  const items = details.map(([scoreKey, detailKey, group]) => ({
    label: scoreMap.find(([key]) => key === scoreKey)?.[1] ?? scoreKey,
    group,
    score: report.scores[scoreKey].value,
    text: report.details[detailKey] || report.scores[scoreKey].desc,
  }));
  const innerW = p.cw - 56;
  const h = 126 + items.reduce((sum, item) => sum + 72 + p.measure(item.text, innerW - 22, 24, 44), 0);
  const card = p.card(h);
  p.header("维度细读", "DIMENSION NOTES", card.x + 28, card.y + 24, innerW);
  let y = card.y + 94;
  items.forEach((item) => {
    p.ctx.save();
    p.ctx.fillStyle = "rgba(139,115,85,0.82)";
    p.ctx.beginPath();
    p.ctx.arc(card.x + 35, y + 11, 4, 0, Math.PI * 2);
    p.ctx.fill();
    p.ctx.restore();
    p.text(item.label, card.x + 50, y, { size: 22, weight: 700 });
    p.font(22, 700);
    const labelWidth = p.ctx.measureText(item.label).width;
    p.text(desc(item.label, item.score), card.x + 62 + labelWidth, y + 4, { size: 16, weight: 500, color: MUTED, family: NUMERIC_FONT });
    p.text(item.group, card.x + card.w - 28, y + 3, { size: 12, color: "rgba(44,44,43,0.34)", align: "right", family: NUMERIC_FONT });
    y += 42;
    y += p.wrap(item.text, card.x + 50, y, innerW - 22, 24, 44, "rgba(44,44,43,0.7)") + 30;
    if (y < card.y + card.h - 30) {
      p.line(card.x + 28, y - 12, card.x + card.w - 28, y - 12);
    }
  });
  p.y += h + 20;
};

const drawHistory = (p: Painter, report: AestheticsReport) => {
  if (!report.literaryHistoryVerdict) return;
  const items = [
    ["独异风格", report.literaryHistoryVerdict.distinctStyle],
    ["历史亮点", report.literaryHistoryVerdict.historicalHighlight],
    ["主要缺憾", report.literaryHistoryVerdict.criticalDefect],
  ];
  drawList(p, "文史余论", "INDEPENDENT VERDICT", items);
};

const drawList = (p: Painter, title: string, sub: string, items: string[][]) => {
  const innerW = p.cw - 56;
  const h = 126 + items.reduce((sum, [, text]) => sum + 72 + p.measure(text, innerW - 22, 24, 44), 0);
  const card = p.card(h);
  p.header(title, sub, card.x + 28, card.y + 24, innerW);
  let y = card.y + 94;
  items.forEach(([itemTitle, text]) => {
    p.ctx.save();
    p.ctx.fillStyle = "rgba(139,115,85,0.82)";
    p.ctx.beginPath();
    p.ctx.arc(card.x + 35, y + 11, 4, 0, Math.PI * 2);
    p.ctx.fill();
    p.ctx.restore();
    p.text(itemTitle, card.x + 50, y, { size: 22, weight: 700, color: INK });
    y += 42;
    y += p.wrap(text, card.x + 50, y, innerW - 22, 24, 44, "rgba(44,44,43,0.7)") + 30;
  });
  p.y += h + 20;
};

const drawA = (p: Painter, report: AestheticsReport) => {
  drawSummaryCard(p, "总体结论", report.lingeringType, report.summary, report.tags, { bracketSub: true });
  drawAxis(p, "九维坐标", reportRadar(report));
  drawNotes(p, report);
  drawHistory(p, report);
};

const drawC = (p: Painter, report: AestheticsReport) => {
  drawSummaryCard(p, "核心诊断", "DIAGNOSIS", report.summary);
  drawAxis(p, "诊断坐标", reportRadar(report));
  if (report.suggestions?.length) {
    drawList(p, "改写建议", "REWRITE PROMPTS", report.suggestions.map((item, index) => [`方案 ${index + 1} · ${item.title}`, `${item.text}\n\n示例：${item.example}`]));
  }
  drawNotes(p, report);
  drawHistory(p, report);
};

const drawB = (p: Painter, report: ComparisonReport) => {
  drawSummaryCard(p, "总判断", "FINAL VERDICT", report.finalVerdict);
  drawTextCard(p, "文本摘要", "A / B", `文本A：${report.textA.summary}\n\n文本B：${report.textB.summary}`);
  drawAxis(p, "差异投影", compareRadar(report));
  if (report.comparison?.length) {
    drawList(p, "显著差异", "AXIS CONTRAST", report.comparison.slice(0, 6).map((item) => [item.dimension, `A ${item.valueA} / B ${item.valueB}\n${item.desc}`]));
  }
  if (report.literaryHistoryVerdict) {
    drawList(p, "文史余论", "INDEPENDENT VERDICT", [
      ["文本 A 的历史位置", report.literaryHistoryVerdict.textAHistory],
      ["文本 B 的历史位置", report.literaryHistoryVerdict.textBHistory],
      ["对照意义", report.literaryHistoryVerdict.comparativeSignificance],
    ]);
  }
};

const baseCanvas = (h: number, scale = 1) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(W * scale);
  canvas.height = Math.ceil(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  ctx.scale(scale, scale);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, h);
  ctx.fillStyle = "rgba(255,255,255,0.52)";
  ctx.fillRect(18, 18, W - 36, h - 36);
  ctx.strokeStyle = "rgba(44,44,43,0.07)";
  ctx.strokeRect(18.5, 18.5, W - 37, h - 37);
  return { canvas, ctx };
};

const draw = (ctx: CanvasRenderingContext2D, input: PosterInput) => {
  const p = new Painter(ctx);
  drawTop(p, input.mode);
  if (input.mode === "A") drawA(p, input.report);
  if (input.mode === "B") drawB(p, input.report);
  if (input.mode === "C") drawC(p, input.report);
  p.text("@拟态余温Almost Human", W - PAD, p.y + 10, { size: 15, color: "rgba(44,44,43,0.46)", align: "right", family: "Arial, sans-serif" });
  return p.y + 64;
};

export const exportPosterImage = async (input: PosterInput) => {
  if ("fonts" in document) {
    await (document as Document & { fonts: { ready: Promise<void> } }).fonts.ready;
  }
  const measuring = baseCanvas(22000);
  const height = Math.ceil(draw(measuring.ctx, input));

  let best: Blob | null = null;
  for (const scale of EXPORT_SCALES) {
    const output = baseCanvas(height, scale);
    draw(output.ctx, input);
    for (const quality of [0.92, 0.86, 0.8, 0.74, 0.68, 0.6, 0.52]) {
      const blob = await new Promise<Blob | null>((resolve) => output.canvas.toBlob(resolve, "image/jpeg", quality));
      if (!blob) continue;
      if (!best || blob.size < best.size || (blob.size <= MAX_BYTES && best.size > MAX_BYTES)) {
        best = blob;
      }
      if (blob.size <= MAX_BYTES) {
        best = blob;
        break;
      }
    }
    if (best && best.size <= MAX_BYTES) break;
  }
  if (!best) throw new Error("Poster export returned empty blob.");

  const url = URL.createObjectURL(best);
  const link = document.createElement("a");
  link.href = url;
  link.download = `文字审美分析_${titles[input.mode]}_${Date.now()}.jpg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { size: best.size };
};
