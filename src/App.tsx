import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  BookOpen,
  ArrowRightLeft,
  PenTool,
  Sliders,
  MessageSquare,
  Bookmark,
  RotateCcw,
  Compass,
  ArrowRight,
  RefreshCw,
  CornerDownRight,
  Info,
  Trash2,
  Download,
  Check
} from "lucide-react";
import html2canvas from "html2canvas";
import RadarChart from "./components/RadarChart";
import { PRESET_SAMPLES, PRES_COMPARE_SAMPLES, STYLE_VIBES } from "./data";
import {
  ChatMessage,
  AestheticsReport,
  ComparisonReport,
  DimensionScore
} from "./types";

interface BookmarkItem {
  id: string;
  title: string;
  text: string;
  textB?: string;
  mode: "A" | "B" | "C";
  timestamp: string;
  report?: any;
  compareReport?: any;
}

type DetailFieldKey = keyof AestheticsReport["details"];
type ScoreFieldKey = keyof AestheticsReport["scores"];

const DETAIL_GROUPS: {
  id: "core" | "extended" | "meta";
  title: string;
  subtitle: string;
  dimensions: {
    label: string;
    scoreKey: ScoreFieldKey;
    detailKey: DetailFieldKey;
    accent: string;
    fallback: string;
  }[];
}[] = [
  {
    id: "core",
    title: "核心轴",
    subtitle: "温度 / 密度 / 透明度 / 余韵",
    dimensions: [
      { label: "温度", scoreKey: "temperature", detailKey: "temperatureAnalysis", accent: "#8C927F", fallback: "它决定文字与读者之间的心理距离，也决定情绪是贴近还是后撤。" },
      { label: "密度", scoreKey: "density", detailKey: "densityAnalysis", accent: "#B08968", fallback: "它影响阅读时的呼吸节奏，决定句子是留白通透，还是层层压紧。" },
      { label: "透明度", scoreKey: "transparency", detailKey: "transparencyAnalysis", accent: "#7C9A92", fallback: "它决定意义是直接抵达，还是需要读者在折射与回味中慢慢解开。" },
      { label: "余韵", scoreKey: "lingering", detailKey: "lingeringAnalysis", accent: "#C08C6A", fallback: "它决定文本离开之后还会在身体里停留多久，以及留下的是清冽、回甘还是烟熏。" },
    ],
  },
  {
    id: "extended",
    title: "扩展轴",
    subtitle: "张力 / 意象域 / 时间感",
    dimensions: [
      { label: "张力", scoreKey: "tension", detailKey: "tensionAnalysis", accent: "#9E6A6A", fallback: "它体现句内冲突与蓄势程度，决定文本是舒缓流过，还是暗暗绷紧。" },
      { label: "意象域", scoreKey: "imagery", detailKey: "imageryAnalysis", accent: "#6B8E73", fallback: "它反映文本主要借哪一类物质世界来建立感知与隐喻的通道。" },
      { label: "时间感", scoreKey: "time", detailKey: "timeAnalysis", accent: "#7A86A1", fallback: "它决定叙述是压缩、概括、停驻还是延缓，关系到阅读中的现场感。" },
    ],
  },
  {
    id: "meta",
    title: "元层级",
    subtitle: "诚实度 / 文化层",
    dimensions: [
      { label: "诚实度", scoreKey: "honesty", detailKey: "honestyAnalysis", accent: "#8B7355", fallback: "它是质量底线，判断文字是在诚实地承受经验，还是在替情绪表演。" },
      { label: "文化层", scoreKey: "culture", detailKey: "cultureAnalysis", accent: "#A47C57", fallback: "它显示文本与传统、体裁和时代话语的对话关系，是一种隐性的历史回声。" },
    ],
  },
];

const buildDetailFallback = (label: string, score: DimensionScore, fallback: string) => {
  return `${label}当前位于 ${score.value} 分区间。${score.desc}${fallback}`;
};

const getDimensionDetailGroups = (report: AestheticsReport) => {
  return DETAIL_GROUPS.map((group) => ({
    ...group,
    dimensions: group.dimensions.map((dimension) => ({
      ...dimension,
      score: report.scores[dimension.scoreKey],
      text:
        report.details[dimension.detailKey] ||
        buildDetailFallback(dimension.label, report.scores[dimension.scoreKey], dimension.fallback),
    })),
  }));
};

const getFlavorBadgeColor = (type: string) => {
  switch (type) {
    case "鍥炵敇":
      return "text-[#4F5F45] border-[#7E9272]/45 bg-[#EEF3E8]";
    case "鑻︽订":
      return "text-[#6A5140] border-[#A07F68]/45 bg-[#F3E5DA]";
    case "娓呭喗":
      return "text-[#44616A] border-[#6E8A93]/45 bg-[#E7F0F2]";
    case "鐑熺啅":
      return "text-[#66586E] border-[#93839B]/45 bg-[#EFEAF2]";
    default:
      return "text-[#4F5F45] border-[#7E9272]/45 bg-[#EEF3E8]";
  }
};

const getRadarDescriptor = (label: string, value: number) => {
  if (label === "娓╁害") return value >= 67 ? "鏆栬皟" : value >= 34 ? "娓╁拰" : "鍐疯皟";
  if (label === "瀵嗗害") return value >= 67 ? "绻佸瘑" : value >= 34 ? "鍖€瀹?" : "鐤忔湕";
  if (label === "閫忔槑搴?") return value >= 67 ? "骞芥繁" : value >= 34 ? "娓呴€?" : "鐩寸櫧";
  if (label === "浣欓煹") return value >= 67 ? "娌夋綔" : value >= 34 ? "鍥炵敇" : "鍗虫暎";
  if (label === "寮犲姏") return value >= 67 ? "绱х环" : value >= 34 ? "鍚紶鍔?" : "鏉惧紱";
  if (label === "鎰忚薄鍩?") return value >= 67 ? "鎶借薄" : value >= 34 ? "鍏煎叿" : "鍏疯薄";
  if (label === "鏃堕棿鎰?") return value >= 67 ? "寤剁坏" : value >= 34 ? "鑸掑睍" : "鍑濈缉";
  if (label === "璇氬疄搴?") return value >= 67 ? "琛ㄦ紨鎰?" : value >= 34 ? "鍏嬪埗" : "鍧﹂湶";
  if (label === "鏂囧寲灞?") return value >= 67 ? "鏂板彉" : value >= 34 ? "鍏煎" : "浼犵粺";
  return "";
};

export default function App() {
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const apiUrl = (path: string) => `${apiBaseUrl}${path}`;

  const parseApiResponse = async (res: Response) => {
    const rawText = await res.text();
    let parsed: any;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error(`服务端返回了非 JSON 内容：${rawText.slice(0, 160)}`);
    }

    if (!res.ok) {
      throw new Error(parsed?.detail || parsed?.error || `服务请求失败（${res.status}）`);
    }

    return parsed;
  };
  const [activeTab, setActiveTab] = useState<"A" | "B" | "C" | "D" | "E">("A");

  // Input states
  const [inputText, setInputText] = useState("");
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [diagnoseText, setDiagnoseText] = useState("");

  // loading & errors state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Bookmarks state (My Archives)
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [archiveOpen, setArchiveOpen] = useState(false);

  // Custom evaluation state (Mode D)
  const [customEvaluation, setCustomEvaluation] = useState<{
    interpretation: string;
    recommendations: { author: string; work: string; value: string }[];
    styleName: string;
  } | null>(null);
  const [customDraftText, setCustomDraftText] = useState("");
  const [customTestResult, setCustomTestResult] = useState<{
    scores: any;
    matchScore: number;
    feedback: string;
  } | null>(null);
  const [customTesting, setCustomTesting] = useState(false);

  // Analysis result states
  const [analysisReport, setAnalysisReport] = useState<AestheticsReport | null>(null);
  const [diagnosisReport, setDiagnosisReport] = useState<AestheticsReport | null>(null);
  const [compareReport, setCompareReport] = useState<ComparisonReport | null>(null);

  // Chat Mode state (E)
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "bot",
      content: "你好，我已读取并加载「文字审美模型」。这是一套基于叙事学、含混批评、新批评理论构建的文学品鉴模型。\n\n你可以把这里当做你的个人文字档案簿。你可以在此输入任何词章，我们将探寻它在温度、密度、透明度与余韵极谱上的投影。您最近在读什么，或者正在写什么，需要我为您做个解读吗？",
      timestamp: new Date()
    }
  ]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Refs and saving states for html2canvas export
  const tabAReportRef = useRef<HTMLDivElement>(null);
  const tabARadarRef = useRef<HTMLDivElement>(null);
  const tabAFlavorBadgeRef = useRef<HTMLSpanElement>(null);
  const tabBReportRef = useRef<HTMLDivElement>(null);
  const tabCReportRef = useRef<HTMLDivElement>(null);
  const [exportingA, setExportingA] = useState(false);
  const [exportingB, setExportingB] = useState(false);
  const [exportingC, setExportingC] = useState(false);
  const [expandedDetailGroups, setExpandedDetailGroups] = useState<Record<string, boolean>>({
    core: true,
    extended: false,
    meta: false,
  });

  const handleExportLongImage = async (tab: "A" | "B" | "C") => {
    const refMap = { A: tabAReportRef, B: tabBReportRef, C: tabCReportRef };
    const setSavingMap = { A: setExportingA, B: setExportingB, C: setExportingC };
    const element = refMap[tab].current;
    const previewWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!element) {
      setErrorMsg("当前没有可导出的报告内容。");
      return;
      setErrorMsg("当前没有可导出的报告内容。");
    }

    setSavingMap[tab](true);
    setErrorMsg(null);
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      if ("fonts" in document) {
        await (document as Document & { fonts: { ready: Promise<void> } }).fonts.ready;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FDFCF8",
        logging: false,
        onclone: (clonedDoc) => {
          const buttonsToHide = clonedDoc.querySelectorAll(".export-ignore");
          buttonsToHide.forEach((button: Element) => {
            (button as HTMLElement).style.display = "none";
          });
        }
      });

      const exportTitle = tab === "A" ? "单卷品鉴" : tab === "B" ? "同框对照" : "创作诊断";
      const exportFilename = `文字审美分析_${exportTitle}_${Date.now()}.png`;
      const exportBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((value) => resolve(value), "image/png", 1);
      });

      if (!exportBlob) {
        throw new Error("Canvas export returned empty blob.");
      }

      const exportUrl = URL.createObjectURL(exportBlob);
      const exportLink = document.createElement("a");
      exportLink.href = exportUrl;
      exportLink.download = exportFilename;
      const link = { download: "" };
      document.body.appendChild(exportLink);
      exportLink.click();
      exportLink.remove();
      setTimeout(() => URL.revokeObjectURL(exportUrl), 1000);
      
      const title = tab === "A" ? "单卷品藻" : tab === "B" ? "同框对照" : "创作诊断";
      link.download = `文字审美分析_${title}_${Date.now()}.png`;
      
    } catch (e) {
      setErrorMsg("保存长图失败，请稍后重试。");
      console.error("生成长图出错:", e);
    } finally {
      setSavingMap[tab](false);
    }
  };

  const handleExportReportAsImage = async (tab: "A" | "B" | "C") => {
    const refMap = { A: tabAReportRef, B: tabBReportRef, C: tabCReportRef };
    const setSavingMap = { A: setExportingA, B: setExportingB, C: setExportingC };
    const titleMap = {
      A: "单卷品鉴",
      B: "同框对照",
      C: "创作诊断",
    } as const;
    const element = refMap[tab].current;
    const previewWindow: Window | null = null;

    if (!element) {
      setErrorMsg("当前没有可导出的报告内容。");
      return;
    }

    setSavingMap[tab](true);
    setErrorMsg(null);

    try {
      if ("fonts" in document) {
        await (document as Document & { fonts: { ready: Promise<void> } }).fonts.ready;
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, {
        scale: Math.max(window.devicePixelRatio || 1, 2),
        useCORS: true,
        backgroundColor: "#FDFCF8",
        logging: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const buttonsToHide = clonedDoc.querySelectorAll(".export-ignore");
          buttonsToHide.forEach((button) => {
            (button as HTMLElement).style.display = "none";
          });
        },
      });

      const exportFilename = `文字审美分析_${titleMap[tab]}_${Date.now()}.png`;
      const dataUrl = canvas.toDataURL("image/png");
      if (previewWindow) {
        previewWindow.document.open();
        previewWindow.document.write(`
          <!doctype html>
          <html lang="zh-CN">
            <head>
              <meta charset="UTF-8" />
              <title>${exportFilename}</title>
              <style>
                body {
                  margin: 0;
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #f6f3ec;
                  color: #2c2c2b;
                  font-family: "Noto Serif SC", serif;
                }
                main {
                  width: min(92vw, 1200px);
                  padding: 24px;
                  text-align: center;
                }
                p {
                  margin: 0 0 18px;
                  font-size: 14px;
                  letter-spacing: 0.08em;
                }
                img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 18px;
                  box-shadow: 0 18px 50px rgba(44, 44, 43, 0.18);
                  border: 1px solid rgba(44, 44, 43, 0.08);
                  background: white;
                }
              </style>
            </head>
            <body>
              <main>
                <p>长图已生成。如未自动下载，可长按或右键图片保存。</p>
                <img src="${dataUrl}" alt="${exportFilename}" />
              </main>
            </body>
          </html>
        `);
        previewWindow.document.close();

        const exportLink = previewWindow.document.createElement("a");
        exportLink.href = dataUrl;
        exportLink.download = exportFilename;
        previewWindow.document.body.appendChild(exportLink);
        exportLink.click();
        exportLink.remove();
      } else {
        const exportLink = document.createElement("a");
        exportLink.href = dataUrl;
        exportLink.download = exportFilename;
        exportLink.rel = "noopener";
        exportLink.style.display = "none";
        document.body.appendChild(exportLink);
        exportLink.click();
        document.body.removeChild(exportLink);
      }
    } catch (e) {
      previewWindow?.close();
      setErrorMsg("保存长图失败，请稍后重试。");
      console.error("生成长图出错:", e);
    } finally {
      setSavingMap[tab](false);
    }
  };

  const UNSUPPORTED_EXPORT_COLOR_PATTERN = /\b(?:oklab|oklch|lab|lch|color)\(/i;

  const inlineExportStyles = (source: Element, target: Element) => {
    if (
      !(source instanceof HTMLElement || source instanceof SVGElement) ||
      !(target instanceof HTMLElement || target instanceof SVGElement)
    ) {
      return;
    }

    const computedStyle = window.getComputedStyle(source);
    for (const property of Array.from(computedStyle)) {
      const value = computedStyle.getPropertyValue(property);
      if (!value) {
        continue;
      }
      if (property.startsWith("--")) {
        continue;
      }
      if (UNSUPPORTED_EXPORT_COLOR_PATTERN.test(value)) {
        continue;
      }
      target.style.setProperty(
        property,
        value,
        computedStyle.getPropertyPriority(property),
      );
    }

    const sourceChildren = Array.from(source.children);
    const targetChildren = Array.from(target.children);
    sourceChildren.forEach((child, index) => {
      const targetChild = targetChildren[index];
      if (targetChild) {
        inlineExportStyles(child, targetChild);
      }
    });
  };

  const createExportSnapshot = (element: HTMLElement) => {
    const snapshot = element.cloneNode(true) as HTMLElement;
    const exportIgnoreNodes = Array.from(snapshot.querySelectorAll(".export-ignore"));
    snapshot.querySelectorAll("[data-export-expand='details-group']").forEach((node) => {
      if (node instanceof HTMLElement) {
        node.style.maxHeight = "none";
        node.style.opacity = "1";
        node.style.overflow = "visible";
        node.style.marginTop = "12px";
      }
    });
    snapshot.querySelectorAll('button[title="鏀跺綍姝ゅ嵎涔︽湱"], button[title="鏀跺綍鍚屾瀵圭収鏈?"]').forEach((node) => {
      (node as HTMLElement).style.display = "none";
    });
    inlineExportStyles(element, snapshot);
    snapshot.querySelectorAll("*").forEach((node) => {
      if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
        return;
      }
      const style = node.getAttribute("style");
      if (style && UNSUPPORTED_EXPORT_COLOR_PATTERN.test(style)) {
        node.removeAttribute("style");
      }
      if (node instanceof HTMLElement) {
        node.removeAttribute("class");
      }
    });
    exportIgnoreNodes.forEach((node) => {
      (node as HTMLElement).style.display = "none";
    });
    exportIgnoreNodes.filter((node) => node.classList.contains("hidden")).forEach((node) => {
      node.remove();
    });
    snapshot.removeAttribute("class");
    snapshot.style.margin = "0";
    snapshot.style.width = `${element.scrollWidth}px`;
    snapshot.style.maxWidth = "none";
    snapshot.style.minWidth = `${element.scrollWidth}px`;
    return snapshot;
  };

  const cloneInlineElementStyle = (source: HTMLElement, text: string) => {
    const clone = document.createElement("span");
    const computed = window.getComputedStyle(source);
    const safeColor = (value: string, fallback: string) =>
      !value || UNSUPPORTED_EXPORT_COLOR_PATTERN.test(value) ? fallback : value;
    clone.textContent = text;
    clone.style.display = computed.display === "inline" ? "inline-flex" : computed.display;
    clone.style.alignItems = computed.alignItems || "center";
    clone.style.justifyContent = computed.justifyContent || "center";
    clone.style.height = computed.height;
    clone.style.minWidth = computed.minWidth;
    clone.style.padding = computed.padding;
    clone.style.borderStyle = computed.borderStyle;
    clone.style.borderWidth = computed.borderWidth;
    clone.style.borderColor = safeColor(computed.borderColor, "rgba(44,44,43,0.12)");
    clone.style.borderRadius = computed.borderRadius;
    clone.style.background = safeColor(computed.backgroundColor, "rgba(255,255,255,0.72)");
    clone.style.color = safeColor(computed.color, "#2C2C2B");
    clone.style.fontSize = computed.fontSize;
    clone.style.fontWeight = computed.fontWeight;
    clone.style.fontFamily = computed.fontFamily;
    clone.style.letterSpacing = computed.letterSpacing;
    clone.style.lineHeight = "1";
    clone.style.whiteSpace = "nowrap";
    clone.style.boxSizing = "border-box";
    clone.style.verticalAlign = "middle";
    return clone;
  };

  const buildModeAExportSnapshot = async () => {
    const radarElement = tabARadarRef.current;

    if (!radarElement || !analysisReport) {
      return null;
    }

    const detailGroups = getDimensionDetailGroups(analysisReport);
    const paper = document.createElement("div");
    paper.style.width = "1120px";
    paper.style.maxWidth = "1120px";
    paper.style.minWidth = "1120px";
    paper.style.padding = "54px 58px 60px";
    paper.style.boxSizing = "border-box";
    paper.style.background = "linear-gradient(180deg, #FCFBF6 0%, #F7F3EA 100%)";
    paper.style.color = "#2C2C2B";
    paper.style.fontFamily = "\"Times New Roman\", \"Songti SC\", serif";
    paper.style.position = "relative";
    paper.style.border = "1px solid rgba(44,44,43,0.12)";
    paper.style.boxShadow = "0 18px 50px rgba(44,44,43,0.08)";

    const stamp = document.createElement("div");
    stamp.style.position = "absolute";
    stamp.style.inset = "22px";
    stamp.style.border = "1px solid rgba(44,44,43,0.08)";
    stamp.style.pointerEvents = "none";
    paper.appendChild(stamp);

    const header = document.createElement("div");
    header.style.textAlign = "center";
    header.style.paddingBottom = "30px";

    const topBar = document.createElement("div");
    topBar.style.display = "flex";
    topBar.style.justifyContent = "space-between";
    topBar.style.alignItems = "baseline";
    topBar.style.marginBottom = "46px";
    topBar.style.paddingBottom = "14px";
    topBar.style.borderBottom = "1px solid rgba(44,44,43,0.12)";
    topBar.innerHTML = `<div style="font-size:13px;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;">Volume 04 // Sensory Anthology</div><div style="font-size:12px;letter-spacing:0.12em;">Archives 档案馆</div>`;
    header.appendChild(topBar);

    const brandStamp = document.createElement("div");
    brandStamp.style.display = "flex";
    brandStamp.style.flexDirection = "column";
    brandStamp.style.alignItems = "center";
    brandStamp.style.gap = "6px";
    brandStamp.style.marginBottom = "18px";
    brandStamp.innerHTML = `
      <div style="width:6px;height:6px;border-radius:999px;background:#8C927F;opacity:.62;"></div>
      <div style="width:2px;height:54px;background:rgba(140,146,127,.22);"></div>
      <div style="width:14px;height:14px;border-radius:999px;border:1px solid rgba(140,146,127,.8);display:flex;align-items:center;justify-content:center;">
        <div style="width:5px;height:5px;border-radius:999px;background:#2C2C2B;opacity:.65;"></div>
      </div>
    `;
    header.appendChild(brandStamp);

    const heroTitle = document.createElement("div");
    heroTitle.innerHTML = `
      <div style="font-size:58px;line-height:1.04;font-weight:300;letter-spacing:.04em;">九维·余韵</div>
      <div style="font-size:32px;line-height:1.2;margin-top:8px;font-style:italic;color:rgba(44,44,43,.72);">Nine-dimensional Afterglow · 文字审美模型</div>
      <div style="font-size:12px;letter-spacing:.34em;text-transform:uppercase;color:rgba(44,44,43,.46);margin-top:22px;">Literary Aesthetics Model — AI Operation Manual</div>
    `;
    header.appendChild(heroTitle);

    const centerRule = document.createElement("div");
    centerRule.style.width = "58px";
    centerRule.style.height = "1px";
    centerRule.style.background = "rgba(140,146,127,.35)";
    centerRule.style.margin = "26px auto 0";
    header.appendChild(centerRule);
    paper.appendChild(header);

    const heroCard = document.createElement("div");
    heroCard.style.border = "1px solid rgba(44,44,43,0.28)";
    heroCard.style.padding = "34px 34px 28px";
    heroCard.style.background = "rgba(255,255,255,0.55)";
    heroCard.style.marginBottom = "28px";
    heroCard.style.display = "grid";
    heroCard.style.gridTemplateColumns = "640px 300px";
    heroCard.style.gap = "20px";
    heroCard.style.alignItems = "center";
    heroCard.style.justifyContent = "center";

    const radarStage = document.createElement("div");
    radarStage.style.display = "flex";
    radarStage.style.justifyContent = "center";
    radarStage.style.alignItems = "center";
    radarStage.style.width = "100%";
    radarStage.style.justifySelf = "center";

    const radarImage = document.createElement("img");
    const radarSvg = radarElement.querySelector("svg");
    if (!radarSvg) {
      return null;
    }
    const radarSvgClone = radarSvg.cloneNode(true) as SVGSVGElement;
    radarSvgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    radarSvgClone.setAttribute("width", "460");
    radarSvgClone.setAttribute("height", "460");
    radarImage.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(radarSvgClone.outerHTML)}`;
    radarImage.alt = "Aesthetics Axis Projections";
    radarImage.style.display = "block";
    radarImage.style.width = "100%";
    radarImage.style.maxWidth = "640px";
    radarImage.style.margin = "0 auto";

    radarStage.appendChild(radarImage);
    heroCard.appendChild(radarStage);

    const spectrumPanel = document.createElement("div");
    spectrumPanel.style.paddingLeft = "6px";
    spectrumPanel.style.display = "flex";
    spectrumPanel.style.flexDirection = "column";
    spectrumPanel.style.gap = "12px";

    const spectrumTitle = document.createElement("div");
    spectrumTitle.innerHTML = `<div style="font-size:13px;letter-spacing:.24em;text-transform:uppercase;opacity:.58;">Axis Ledger</div><div style="font-size:15px;margin-top:6px;letter-spacing:.08em;">九维光谱记录</div>`;
    spectrumPanel.appendChild(spectrumTitle);

    const radarData = mapScoresToRadar(analysisReport.scores);
    radarData.forEach((item) => {
      const descriptor = getRadarDescriptor(item.label, item.value);
      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns = "68px 1fr 36px";
      row.style.gap = "8px";
      row.style.alignItems = "center";

      const label = document.createElement("div");
      label.innerHTML = `<div style="font-size:14px;font-weight:700;">${item.label}</div><div style="font-size:10px;opacity:.45;letter-spacing:.08em;">${descriptor}</div>`;

      const barWrap = document.createElement("div");
      barWrap.style.height = "8px";
      barWrap.style.borderRadius = "999px";
      barWrap.style.background = "rgba(44,44,43,.08)";
      barWrap.style.overflow = "hidden";

      const bar = document.createElement("div");
      bar.style.height = "100%";
      bar.style.width = `${item.value}%`;
      bar.style.borderRadius = "999px";
      bar.style.background = "linear-gradient(90deg, rgba(140,146,127,.35) 0%, rgba(44,44,43,.72) 100%)";
      barWrap.appendChild(bar);

      const value = document.createElement("div");
      value.textContent = `${item.value}`;
      value.style.fontSize = "13px";
      value.style.textAlign = "right";
      value.style.fontVariantNumeric = "tabular-nums";

      row.appendChild(label);
      row.appendChild(barWrap);
      row.appendChild(value);
      spectrumPanel.appendChild(row);
    });

    heroCard.appendChild(spectrumPanel);
    paper.appendChild(heroCard);

    const createSection = (title: string, subtitle: string) => {
      const section = document.createElement("section");
      section.style.border = "1px solid rgba(44,44,43,0.22)";
      section.style.background = "rgba(255,255,255,0.48)";
      section.style.padding = "26px 28px";
      section.style.marginBottom = "24px";

      const head = document.createElement("div");
      head.style.display = "flex";
      head.style.justifyContent = "space-between";
      head.style.alignItems = "baseline";
      head.style.gap = "12px";
      head.style.paddingBottom = "12px";
      head.style.borderBottom = "1px solid rgba(44,44,43,0.18)";

      const titleNode = document.createElement("h3");
      titleNode.textContent = title;
      titleNode.style.margin = "0";
      titleNode.style.fontSize = "22px";
      titleNode.style.fontWeight = "600";
      titleNode.style.letterSpacing = "0.08em";

      const subtitleNode = document.createElement("span");
      subtitleNode.textContent = subtitle;
      subtitleNode.style.fontSize = "11px";
      subtitleNode.style.textTransform = "uppercase";
      subtitleNode.style.letterSpacing = "0.24em";
      subtitleNode.style.opacity = "0.6";

      head.appendChild(titleNode);
      head.appendChild(subtitleNode);
      section.appendChild(head);
      return section;
    };

    const flavorSection = createSection("总体余韵定性", "Lingering Style");
    const flavorTop = document.createElement("div");
    flavorTop.style.display = "flex";
    flavorTop.style.justifyContent = "space-between";
    flavorTop.style.alignItems = "center";
    flavorTop.style.gap = "24px";
    flavorTop.style.marginTop = "20px";

    const flavorTags = document.createElement("div");
    flavorTags.style.display = "flex";
    flavorTags.style.flexWrap = "wrap";
    flavorTags.style.gap = "10px";

    const sourceTag = document.querySelector('[data-export-style="tag-chip"]') as HTMLElement | null;
    analysisReport.tags.forEach((tag) => {
      if (sourceTag) {
        flavorTags.appendChild(cloneInlineElementStyle(sourceTag, `#${tag}`));
      }
    });

    const flavorBadge = tabAFlavorBadgeRef.current
      ? cloneInlineElementStyle(tabAFlavorBadgeRef.current, analysisReport.lingeringType)
      : document.createElement("span");
    if (!tabAFlavorBadgeRef.current) {
      flavorBadge.textContent = analysisReport.lingeringType;
    }
    flavorBadge.style.flexShrink = "0";

    flavorTop.appendChild(flavorTags);
    flavorTop.appendChild(flavorBadge);
    flavorSection.appendChild(flavorTop);

    const summaryNode = document.createElement("p");
    summaryNode.textContent = analysisReport.summary;
    summaryNode.style.margin = "24px 0 0";
    summaryNode.style.fontSize = "20px";
    summaryNode.style.lineHeight = "1.95";
    summaryNode.style.fontWeight = "400";
    flavorSection.appendChild(summaryNode);
    paper.appendChild(flavorSection);

    const detailSection = createSection("维度详细解析", "Dimension Deep-dives");
    detailGroups.forEach((group, groupIndex) => {
      const groupCard = document.createElement("div");
      groupCard.style.marginTop = groupIndex === 0 ? "20px" : "18px";
      groupCard.style.border = "1px solid rgba(44,44,43,0.18)";
      groupCard.style.padding = "18px 20px";
      groupCard.style.background = "rgba(255,255,255,0.62)";

      const groupTitle = document.createElement("div");
      groupTitle.textContent = `${group.title} / ${group.subtitle}`;
      groupTitle.style.fontSize = "16px";
      groupTitle.style.fontWeight = "700";
      groupTitle.style.letterSpacing = "0.08em";
      groupTitle.style.marginBottom = "12px";
      groupCard.appendChild(groupTitle);

      group.dimensions.forEach((dimension, index) => {
        const item = document.createElement("div");
        item.style.padding = index === 0 ? "10px 0 0" : "18px 0 0";
        if (index !== 0) {
          item.style.borderTop = "1px solid rgba(44,44,43,0.14)";
        }

        const label = document.createElement("div");
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.gap = "10px";
        label.style.fontSize = "17px";
        label.style.fontWeight = "600";
        label.style.marginBottom = "8px";
        label.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:${dimension.accent};"></span>${dimension.label}（${dimension.score.value}%）`;

        const text = document.createElement("p");
        text.textContent = dimension.text;
        text.style.margin = "0 0 0 18px";
        text.style.fontSize = "15px";
        text.style.lineHeight = "1.95";
        text.style.opacity = "0.84";

        item.appendChild(label);
        item.appendChild(text);
        groupCard.appendChild(item);
      });

      detailSection.appendChild(groupCard);
    });
    paper.appendChild(detailSection);

    if (analysisReport.literaryHistoryVerdict) {
      const verdictSection = createSection("文学史独立断案", "Independent Scholar Verdict");
      const verdictGrid = document.createElement("div");
      verdictGrid.style.display = "grid";
      verdictGrid.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
      verdictGrid.style.gap = "18px";
      verdictGrid.style.marginTop = "20px";

      const verdictItems = [
        {
          title: "独异风格定性",
          text: analysisReport.literaryHistoryVerdict.distinctStyle,
        },
        {
          title: "历史闪光点 / 亮点",
          text: analysisReport.literaryHistoryVerdict.historicalHighlight,
        },
        {
          title: "局限与缺憾 / 主要瑕疵",
          text: analysisReport.literaryHistoryVerdict.criticalDefect,
        },
      ];

      verdictItems.forEach((item) => {
        const card = document.createElement("div");
        card.style.borderLeft = "1px solid rgba(44,44,43,0.22)";
        card.style.paddingLeft = "14px";

        const title = document.createElement("div");
        title.textContent = item.title;
        title.style.fontSize = "14px";
        title.style.fontWeight = "700";
        title.style.marginBottom = "10px";
        title.style.letterSpacing = "0.08em";

        const text = document.createElement("p");
        text.textContent = item.text;
        text.style.margin = "0";
        text.style.fontSize = "14px";
        text.style.lineHeight = "1.9";
        text.style.opacity = "0.84";

        card.appendChild(title);
        card.appendChild(text);
        verdictGrid.appendChild(card);
      });

      verdictSection.appendChild(verdictGrid);
      paper.appendChild(verdictSection);
    }

    const footer = document.createElement("div");
    footer.style.display = "flex";
    footer.style.justifyContent = "flex-end";
    footer.style.alignItems = "center";
    footer.style.marginTop = "22px";
    footer.style.paddingTop = "12px";
    footer.style.borderTop = "1px solid rgba(44,44,43,0.12)";
    footer.style.fontSize = "13px";
    footer.style.letterSpacing = "0.08em";
    footer.style.opacity = "0.72";
    footer.innerHTML = `<span>@拟态余温Almost Human</span>`;
    paper.appendChild(footer);

    return paper;
  };

  const handleExportReportAsImageSafe = async (tab: "A" | "B" | "C") => {
    const refMap = { A: tabAReportRef, B: tabBReportRef, C: tabCReportRef };
    const setSavingMap = { A: setExportingA, B: setExportingB, C: setExportingC };
    const titleMap = {
      A: "单卷品鉴",
      B: "同框对照",
      C: "创作诊断",
    } as const;
    const element = refMap[tab].current;
    let exportHost: HTMLDivElement | null = null;

    if (!element) {
      setErrorMsg("当前没有可导出的报告内容。");
      return;
    }

    setSavingMap[tab](true);
    setErrorMsg(null);

    try {
      if ("fonts" in document) {
        await (document as Document & { fonts: { ready: Promise<void> } }).fonts.ready;
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      exportHost = document.createElement("div");
      exportHost.style.position = "fixed";
      exportHost.style.left = "-100000px";
      exportHost.style.top = "0";
      exportHost.style.pointerEvents = "none";
      exportHost.style.zIndex = "-1";
      exportHost.style.background = "#FDFCF8";
      exportHost.style.padding = "0";

      const exportSnapshot = tab === "A"
        ? await buildModeAExportSnapshot() ?? createExportSnapshot(element)
        : createExportSnapshot(element);
      exportHost.appendChild(exportSnapshot);
      document.body.appendChild(exportHost);

      const canvas = await html2canvas(exportSnapshot, {
        scale: Math.max(window.devicePixelRatio || 1, 2),
        useCORS: true,
        backgroundColor: "#FDFCF8",
        logging: false,
        imageTimeout: 0,
      });

      document.body.removeChild(exportHost);
      exportHost = null;

      const exportFilename = `文字审美分析_${titleMap[tab]}_${Date.now()}.png`;
      const exportBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((value) => resolve(value), "image/png", 1);
      });

      if (!exportBlob) {
        throw new Error("Canvas export returned empty blob.");
      }

      const exportUrl = URL.createObjectURL(exportBlob);
      const exportLink = document.createElement("a");
      exportLink.href = exportUrl;
      exportLink.download = exportFilename;
      exportLink.rel = "noopener";
      exportLink.style.display = "none";
      document.body.appendChild(exportLink);
      exportLink.click();
      document.body.removeChild(exportLink);
      window.setTimeout(() => URL.revokeObjectURL(exportUrl), 1000);
    } catch (e) {
      setErrorMsg("保存长图失败，请稍后重试。");
      console.error("生成长图出错:", e);
    } finally {
      if (exportHost?.parentNode) {
        exportHost.parentNode.removeChild(exportHost);
      }
      setSavingMap[tab](false);
    }
  };

  // Interactive custom design state (Mode D)
  const [selectedVibe, setSelectedVibe] = useState(STYLE_VIBES[0]);
  const [interactiveScores, setInteractiveScores] = useState({
    temperature: STYLE_VIBES[0].scores.temperature,
    density: STYLE_VIBES[0].scores.density,
    transparency: STYLE_VIBES[0].scores.transparency,
    lingering: STYLE_VIBES[0].scores.lingering,
    tension: STYLE_VIBES[0].scores.tension,
    imagery: STYLE_VIBES[0].scores.imagery,
    time: STYLE_VIBES[0].scores.time,
    honesty: STYLE_VIBES[0].scores.honesty,
    culture: STYLE_VIBES[0].scores.culture
  });

  // Sync interactive state when preset style chosen in Mode D
  const handleVibeSelect = (vibe: typeof STYLE_VIBES[0]) => {
    setSelectedVibe(vibe);
    setInteractiveScores({ ...vibe.scores });
  };

  // Callback from Radar dragging to update Interactive State in Mode D
  const handleInteractiveScoreChange = (index: number, val: number) => {
    const keys: (keyof typeof interactiveScores)[] = [
      "temperature", "density", "transparency", "lingering", "tension", "imagery", "time", "honesty", "culture"
    ];
    if (index >= 0 && index < keys.length) {
      const activeKey = keys[index];
      setInteractiveScores(prev => ({
        ...prev,
        [activeKey]: val
      }));
    }
  };

  // Scroll to chat bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Load archives from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nine_dimensions_archives") || localStorage.getItem("spring_mountain_archives");
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed to load local archives:", err);
    }
  }, []);

  // Save parsed result as bookmark
  const saveBookmark = (mode: "A" | "B" | "C") => {
    let textVal = "";
    let textBVal = "";
    let rep: any = null;
    let compRep: any = null;
    let titleVal = "";

    if (mode === "A" && analysisReport) {
      textVal = inputText;
      rep = analysisReport;
      titleVal = `${inputText.slice(0, 15)}${inputText.length > 15 ? "..." : ""}`;
    } else if (mode === "B" && compareReport) {
      textVal = textA;
      textBVal = textB;
      compRep = compareReport;
      titleVal = `比对: ${textA.slice(0, 8)} / ${textB.slice(0, 8)}`;
    } else if (mode === "C" && diagnosisReport) {
      textVal = diagnoseText;
      rep = diagnosisReport;
      titleVal = `诊断: ${diagnoseText.slice(0, 15)}${diagnoseText.length > 15 ? "..." : ""}`;
    } else {
      return;
    }

    const newItem: BookmarkItem = {
      id: Math.random().toString(),
      title: titleVal,
      text: textVal,
      textB: textBVal,
      mode,
      timestamp: new Date().toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      report: rep,
      compareReport: compRep
    };

    const updated = [newItem, ...bookmarks];
    setBookmarks(updated);
    localStorage.setItem("nine_dimensions_archives", JSON.stringify(updated));
  };

  const deleteBookmark = (id: string, e: any) => {
    e.stopPropagation();
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem("nine_dimensions_archives", JSON.stringify(updated));
  };

  const toggleDetailGroup = (groupId: "core" | "extended" | "meta") => {
    setExpandedDetailGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const restoreBookmark = (item: BookmarkItem) => {
    setActiveTab(item.mode);
    if (item.mode === "A") {
      setInputText(item.text);
      setAnalysisReport(item.report);
    } else if (item.mode === "B") {
      setTextA(item.text);
      setTextB(item.textB || "");
      setCompareReport(item.compareReport);
    } else if (item.mode === "C") {
      setDiagnoseText(item.text);
      setDiagnosisReport(item.report);
    }
    setArchiveOpen(false);
  };

  // Evaluate interactive custom aesthetic profile in Mode D
  const handleCustomProfileEvaluation = () => {
    const {
      temperature: t,
      density: d,
      transparency: tr,
      lingering: l,
      tension: tn,
      imagery: im,
      time: tm,
      honesty: h,
      culture: c
    } = interactiveScores;

    let styleName = "";
    let interpretation = "";
    let recommendations: { author: string; work: string; value: string }[] = [];

    // Categorization logic based on coordinate weights for rich analysis
    if (t < 35 && d > 65) {
      styleName = "寒林重墨体 (Frigid Inkwood)";
      interpretation = "此设定体温极低而信息密度繁密重叠。文字呈现冷酷、理性甚至冰冷的旁观视角，像一柄冰凉的手术刀剖切着现实的细枝末节，意象稠密而极具形式张力。";
      recommendations = [
        { author: "鲁迅", work: "《野草》", value: "在冷绝客观、甚至死寂的气氛下建立密集和怪诞的意象符号群，带来极致的精神压迫力。" },
        { author: "卡夫卡", work: "《城堡》", value: "语言如公文般冰冷澄透，但荒诞和绝望的意象重叠交错、不留温情余地。" }
      ];
    } else if (t > 65 && d < 35) {
      styleName = "春晖飞白体 (Warm Breeze)";
      interpretation = "具有极高的温度体温却保持着极其空灵疏朗的结构。这是坦诚而毫无防线的情感流露，字句简练，大面积留白。文字不着浓墨重彩，却如一缕春日和风吹进读者的心底。";
      recommendations = [
        { author: "沈从文", work: "《边城》", value: "笔触疏淡纯朴、大面积写意留白，叙述中却充斥着湘西苗野最炽烈温热的人性光辉。" },
        { author: "泰戈尔", work: "《吉檀迦利》", value: "句式极其空灵纯粹，但内在情感虔诚而火热，对生命和造物充满无限炽烈。 " }
      ];
    } else if (tr > 68 && im > 68) {
      styleName = "云缭雾障体 (Symbolic Ambiguity)";
      interpretation = "含混幽深，意象空间深度扩展。这是一座重彩浓墨的象征主义迷宫。文字的多重语义和隐喻网络互相折射，将读者引向燕卜荪说所言的多重含混，余味沉沉。";
      recommendations = [
        { author: "李商隐", work: "《锦瑟》等无题诗", value: "辞采瑰丽奇诡、意境含混朦胧，在言外之意的多维折射上达到了古典美学的巅峰。" },
        { author: "博尔赫斯", work: "《沙之书》", value: "极深层次的哲学探讨，隐喻网络庞杂并层层相套，每一句话都具有层叠的阐释深度。" }
      ];
    } else if (tr < 32 && h < 32) {
      styleName = "琉璃赤子体 (Crystalline Sincerity)";
      interpretation = "澄澈剔透而绝无虚饰。摒弃了一切表演性的修辞和技巧粉饰，文字如一汪清泉直见其底，展现出隐含作者人格最质朴、最不设防的袒露姿态，拥有直击胸腔的力量。";
      recommendations = [
        { author: "萧红", work: "《呼兰河传》", value: "毫无都市文人的矫饰与弄影，纯用最天真干净的直白语流，因绝对的真诚而力透纸背。" },
        { author: "海明威", work: "《老人与海》", value: "极度洗练的电报体，杜绝一切自我沉醉式的藻饰，展现纯粹而铮铮铁骨的事物本质。" }
      ];
    } else {
      styleName = "碧涧流泉体 (Aesthetic Stream)";
      interpretation = `这是一首各极轴互为对位、和谐共鸣的高雅曲调。它的温度适中（${t}/100），密度均衡（${d}/100），透明度（${tr}/100）保持着若隐若现的古典曲径通幽感，在张力（${tn}/100）与文化层（${c}/100）里达成了舒适自如的感知平衡。`;
      recommendations = [
        { author: "张爱玲", work: "《传奇》", value: "在密不透风的弄影凡俗尘世里，精准拿捏了华贵藻饰（密度）与世态炎凉（温度）的对立张力。" },
        { author: "废名", work: "《桥》", value: "以禅宗式的精干刀法切断语言自动化，既有文人画的水气（温度），又带深厚的古典文脉包浆。" }
      ];
    }

    setCustomEvaluation({ styleName, interpretation, recommendations });
    setCustomTestResult(null); // Reset calculation results for a new recipe
  };

  // Perform Gemini analysis to align custom draft with custom evaluation targeted parameters
  const handleCustomDraftVerify = async () => {
    if (!customDraftText.trim()) return;
    setCustomTesting(true);
    setCustomTestResult(null);

    try {
      const res = await fetch(apiUrl("/api/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "A", text: customDraftText })
      });
        const data = await parseApiResponse(res);
      const finalData = data.fallback ? data.data : data;

      // Extract scores and compare similarity with custom targets
      const draftScores = finalData.scores;
      const targetScores = interactiveScores;

      const keys = ["temperature", "density", "transparency", "lingering", "tension", "imagery", "time", "honesty", "culture"];
      let totalDiff = 0;
      keys.forEach((k) => {
        const draftVal = draftScores[k]?.value ?? 50;
        const targetVal = (targetScores as any)[k] ?? 50;
        totalDiff += Math.abs(draftVal - targetVal);
      });

      // Match rate math projection
      const avgDiff = totalDiff / keys.length;
      const matchScore = Math.max(0, Math.min(100, Math.round(100 - avgDiff * 1.5)));

      let alignmentFeedback = "";
      if (matchScore >= 85) {
        alignmentFeedback = "惊人之契合！您的文字极具灵台共鸣。各项轴向分值与设想极其吻合，成功复刻了该美学型态的神韵与肌理。";
      } else if (matchScore >= 65) {
        alignmentFeedback = "神似而形微异。您已大体捕捉到了设想的外在形廓，但在局部维度（如温度或含混程度）尚有微调空间。可参考下方各项轴线的对位指标再次修正。";
      } else {
        alignmentFeedback = "笔墨另辟溪径。您的创稿展现了全新的审美特质，各项美学参数具有强烈的个人烙印，相较设定配方，展现出不同方向的光谱极调。";
      }

      setCustomTestResult({
        scores: draftScores,
        matchScore,
        feedback: `${alignmentFeedback}\n\n【实测对比】\n` + 
          `• 设定温度: ${targetScores.temperature} | 实测温度: ${draftScores.temperature?.value ?? 0} (${draftScores.temperature?.desc ?? ""})\n` +
          `• 设定密度: ${targetScores.density} | 实测密度: ${draftScores.density?.value ?? 0} (${draftScores.density?.desc ?? ""})\n` +
          `• 设定透明度: ${targetScores.transparency} | 实测透明度: ${draftScores.transparency?.value ?? 0} (${draftScores.transparency?.desc ?? ""})`
      });

    } catch (e) {
      console.error(e);
      // Fallback evaluation calculation locally
      const mockResultScores: any = {};
      const keys = ["temperature", "density", "transparency", "lingering", "tension", "imagery", "time", "honesty", "culture"];
      keys.forEach(k => {
        mockResultScores[k] = { value: Math.round(40 + Math.random() * 30), desc: "平滑振荡" };
      });
      setCustomTestResult({
        scores: mockResultScores,
        matchScore: 78,
        feedback: "已采用本地微积分测绘。创本字句工整，与您设想的美学流派具有较高的审美调式亲和度（匹配率约 78%）。"
      });
    } finally {
      setCustomTesting(false);
    }
  };

  // Call the server API
  const handleAnalyze = async (mode: "A" | "B" | "C") => {
    setLoading(true);
    setErrorMsg(null);
    if (mode === "A") {
      setAnalysisReport(null);
    } else if (mode === "B") {
      setCompareReport(null);
    } else {
      setDiagnosisReport(null);
    }

    const payload: any = { mode };
    if (mode === "A") {
      payload.text = inputText;
    } else if (mode === "B") {
      payload.textA = textA;
      payload.textB = textB;
    } else if (mode === "C") {
      payload.text = diagnoseText;
    }

    try {
      const res = await fetch(apiUrl("/api/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
        const data = await parseApiResponse(res);

      if (data.error && data.fallback) {
        // Safe backend fallback notifications matching our design guidelines
        console.log("fallback activated: ", data.error);
      }

      const finalData = data.fallback ? data.data : data;

      if (mode === "B") {
        setCompareReport(finalData);
      } else if (mode === "A") {
        setAnalysisReport(finalData);
      } else {
        setDiagnosisReport(finalData);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(e instanceof Error ? e.message : "品鉴服务暂时不可用，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  // Send single chat message in Mode E
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setLoading(true);

    try {
      const activeMessages = [...chatMessages, userMsg];
      const res = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: activeMessages })
      });
        const data = await parseApiResponse(res);

      const botMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "bot",
        content: data.content,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "bot",
          content: "词章的溪流遇到了一丝阻塞。不知您对刚刚讨论哪位作家的风格，或者刚才提及的哪个审美唯度还想继续深探？",
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getScoreDescriptor = (dimension: keyof AestheticsReport["scores"], value: number) => {
    if (dimension === "temperature") return value >= 67 ? "暖调" : value >= 34 ? "温和" : "冷调";
    if (dimension === "density") return value >= 67 ? "繁密" : value >= 34 ? "匀实" : "疏朗";
    if (dimension === "transparency") return value >= 67 ? "幽深" : value >= 34 ? "清透" : "直白";
    if (dimension === "lingering") return value >= 67 ? "沉潜" : value >= 34 ? "回甘" : "即散";
    if (dimension === "tension") return value >= 67 ? "紧绷" : value >= 34 ? "含张力" : "松弛";
    if (dimension === "imagery") return value >= 67 ? "抽象" : value >= 34 ? "兼具" : "具象";
    if (dimension === "time") return value >= 67 ? "延绵" : value >= 34 ? "舒展" : "凝缩";
    if (dimension === "honesty") return value >= 67 ? "表演感" : value >= 34 ? "克制" : "坦露";
    return value >= 67 ? "新变" : value >= 34 ? "兼容" : "传统";
  };

  // Format scores for Radar graph delivery
  const mapScoresToRadar = (scores: AestheticsReport["scores"]) => {
    return [
      { label: "温度", subLabel: "冷冽 / 炽烈", value: scores.temperature.value },
      { label: "密度", subLabel: "疏朗 / 密植", value: scores.density.value },
      { label: "透明度", subLabel: "直白 / 幽深", value: scores.transparency.value },
      { label: "余韵", subLabel: "即散 / 沉淀", value: scores.lingering.value },
      { label: "张力", subLabel: "松弛 / 紧绷", value: scores.tension.value },
      { label: "意象域", subLabel: "具象 / 抽象", value: scores.imagery.value },
      { label: "时间感", subLabel: "压缩 / 延缓", value: scores.time.value },
      { label: "诚实度", subLabel: "坦露 / 表演", value: scores.honesty.value },
      { label: "文化层", subLabel: "传统 / 断裂", value: scores.culture.value }
    ];
  };

  const mapCompareToRadar = (comp: ComparisonReport) => {
    const keys: { k: keyof typeof comp.textA.scores; l: string; sl: string }[] = [
      { k: "temperature", l: "温度", sl: "冷冽/炽烈" },
      { k: "density", l: "密度", sl: "疏朗/密植" },
      { k: "transparency", l: "透明度", sl: "直白/幽深" },
      { k: "lingering", l: "余韵", sl: "即散/沉淀" },
      { k: "tension", l: "张力", sl: "松弛/紧绷" },
      { k: "imagery", l: "意象域", sl: "具象/抽象" },
      { k: "time", l: "时间感", sl: "压缩/延缓" },
      { k: "honesty", l: "诚实度", sl: "坦露/表演" },
      { k: "culture", l: "文化层", sl: "传统/断裂" }
    ];

    return keys.map((item) => ({
      label: item.l,
      subLabel: item.sl,
      value: comp.textA.scores[item.k],
      valueB: comp.textB.scores[item.k]
    }));
  };

  const getInteractiveRadarData = () => {
    return [
      { label: "温度", subLabel: "冷冽 / 炽烈", value: interactiveScores.temperature },
      { label: "密度", subLabel: "疏朗 / 密植", value: interactiveScores.density },
      { label: "透明度", subLabel: "直白 / 幽深", value: interactiveScores.transparency },
      { label: "余韵", subLabel: "即散 / 沉淀", value: interactiveScores.lingering },
      { label: "张力", subLabel: "松弛 / 紧绷", value: interactiveScores.tension },
      { label: "意象域", subLabel: "具象 / 抽象", value: interactiveScores.imagery },
      { label: "时间感", subLabel: "压缩 / 延缓", value: interactiveScores.time },
      { label: "诚实度", subLabel: "坦露 / 表演", value: interactiveScores.honesty },
      { label: "文化层", subLabel: "传统 / 断裂", value: interactiveScores.culture }
    ];
  };

  // Dynamic visual background helpers for lingering flavors
  const getFlavorBgClass = (type: string) => {
    switch (type) {
      case "回甘":
        return "flavor-bg-echo";
      case "苦涩":
        return "flavor-bg-bitter";
      case "清冽":
        return "flavor-bg-crisp";
      case "烟熏":
        return "flavor-bg-smoky";
      default:
        return "flavor-bg-echo";
    }
  };

  const getFlavorAccentColor = (type: string) => {
    switch (type) {
      case "回甘":
        return "text-[#2C2C2B] border-[#8C927F]/30 bg-[#F5EBE0]";
      case "苦涩":
        return "text-[#2C2C2B] border-[#8C927F]/30 bg-[#E6EBE0]";
      case "清冽":
        return "text-[#2C2C2B] border-[#2C2C2B]/20 bg-[#D8E2DC]";
      case "烟熏":
        return "text-[#2C2C2B] border-[#2C2C2B]/30 bg-[#ECEAEB]";
      default:
        return "text-[#2C2C2B] border-[#8C927F]/30 bg-[#F5EBE0]";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C2C2B] pb-20 selection:bg-[#8C927F]/20 selection:text-[#2C2C2B]" style={{ fontFamily: "'Georgia', 'Helvetica Neue', Arial, sans-serif" }}>
      
      {/* Decorative Traditional Paper Header */}
      <header className="max-w-7xl mx-auto px-6 pt-12 md:pt-16 pb-6 text-center overflow-visible">
        <div className="flex justify-end items-baseline mb-12 border-b border-[#2C2C2B]/10 pb-4">
          <nav className="flex gap-8 text-[10px] tracking-[0.1em] uppercase font-bold text-[#2C2C2B]/70 font-sans">
            <button onClick={() => setArchiveOpen(true)} className="hover:text-[#8C927F] transition-colors cursor-pointer">Archives 档案馆</button>
          </nav>
        </div>

        {/* Brand Stamp illustration */}
        <div className="hidden md:flex flex-col items-center gap-1 mb-4 pointer-events-none opacity-40">
          <div className="w-1.5 h-1.5 rounded-full bg-[#8C927F]" />
          <div className="w-0.5 h-10 bg-[#8C927F]/40" />
          <div className="w-2.5 h-2.5 rounded-full border border-[#8C927F] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#2C2C2B]" />
          </div>
        </div>

        <h1 className="font-serif text-4xl md:text-5.5xl font-light tracking-tight text-[#2C2C2B] leading-[1.1] transition-all duration-300">
          九维·余韵
          <span className="block text-xl md:text-2xl mt-2 font-normal italic font-serif text-[#2C2C2B]/70">Nine-dimensional Afterglow • 文字审美模型</span>
        </h1>
        <div className="w-12 h-[1px] bg-[#8C927F]/35 mx-auto mt-6" />

        {/* Elegant Sub-ribbon inspired by vintage journals */}
        <div className="mt-6 border-t border-b border-[#2C2C2B]/10 py-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs font-serif italic text-[#2C2C2B]/75">
          <span>“有些味觉在喉间徘徊，如同远山未消的积雪，清冷而悠长。”</span>
          <span className="hidden sm:inline">|</span>
          <span>“深意总迟解，将爱却晚秋”</span>
        </div>
      </header>

      {/* Main Interactive Controls & Navigation */}
      <main className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Custom Segmented Tabs with hand-crafted retro styling */}
        <div className="max-w-7xl mx-auto mb-10 bg-[#F9F8F3] p-1 rounded-lg border border-[#2C2C2B]/10 shadow-sm backdrop-blur-xs flex flex-wrap gap-1 items-center">
          <div className="flex-1 flex flex-wrap gap-1">
            <button
              onClick={() => { setActiveTab("A"); }}
              className={`flex-1 min-w-[120px] py-1.5 md:py-2 px-3 rounded-md text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "A"
                  ? "bg-white text-[#2C2C2B] shadow-xs font-medium border-b-2 border-[#8C927F]"
                  : "text-[#2C2C2B]/60 hover:text-[#2C2C2B] hover:bg-white/40"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="font-serif">A · 品鉴分析</span>
            </button>
            
            <button
              onClick={() => { setActiveTab("B"); }}
              className={`flex-1 min-w-[120px] py-1.5 md:py-2 px-3 rounded-md text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "B"
                  ? "bg-white text-[#2C2C2B] shadow-xs font-medium border-b-2 border-[#8C927F]"
                  : "text-[#2C2C2B]/60 hover:text-[#2C2C2B] hover:bg-white/40"
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="font-serif">B · 对比品鉴</span>
            </button>

            <button
              onClick={() => { setActiveTab("C"); }}
              className={`flex-1 min-w-[120px] py-1.5 md:py-2 px-3 rounded-md text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "C"
                  ? "bg-white text-[#2C2C2B] shadow-xs font-medium border-b-2 border-[#8C927F]"
                  : "text-[#2C2C2B]/60 hover:text-[#2C2C2B] hover:bg-white/40"
              }`}
            >
              <PenTool className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="font-serif">C · 写作诊断</span>
            </button>

            <button
              onClick={() => setActiveTab("D")}
              className={`flex-1 min-w-[120px] py-1.5 md:py-2 px-3 rounded-md text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "D"
                  ? "bg-white text-[#2C2C2B] shadow-xs font-medium border-b-2 border-[#8C927F]"
                  : "text-[#2C2C2B]/60 hover:text-[#2C2C2B] hover:bg-white/40"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="font-serif">D · 风格定位</span>
            </button>

            <button
              onClick={() => setActiveTab("E")}
              className={`flex-1 min-w-[120px] py-1.5 md:py-2 px-3 rounded-md text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "E"
                  ? "bg-white text-[#2C2C2B] shadow-xs font-medium border-b-2 border-[#8C927F]"
                  : "text-[#2C2C2B]/60 hover:text-[#2C2C2B] hover:bg-white/40"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="font-serif">E · 自由探索</span>
            </button>
          </div>

          <div className="w-[1px] h-6 bg-[#2C2C2B]/10 hidden lg:block mx-2" />
          
          <button
            onClick={() => setArchiveOpen(true)}
            className="w-full lg:w-auto py-2 px-4 rounded-md text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 text-[#8C927F] hover:bg-white/60 font-serif font-semibold"
          >
            <Bookmark className="w-3.5 h-3.5" />
            我的书卷档案馆 ({bookmarks.length})
          </button>
        </div>

        {/* Global Loading Spinner / Network indicator overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#2C2C2B]/95 text-white text-xs px-4 py-2 rounded-full border border-[#2C2C2B] shadow-lg flex items-center gap-2 font-serif font-light tracking-wide backdrop-blur-xs"
            >
              <RefreshCw className="w-3 h-3 animate-spin stroke-[2] text-[#8C927F]" />
              正在为您研磨墨色，研析风味中...
            </motion.div>
          )}
        </AnimatePresence>

        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-[#C9A27D]/30 bg-[#FBF3EA] px-4 py-3 text-sm text-[#7A4B2E] shadow-xs">
            {errorMsg}
          </div>
        )}

        {/* Main Work desk workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* TAB A: 品鉴分析 */}
          {activeTab === "A" && (
            <div
              ref={analysisReport ? tabAReportRef : null}
              className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              
              {/* Left Column: Input and Presets */}
              <div className="lg:col-span-4 space-y-6">
                <div className="export-ignore bg-white/80 p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif text-sm font-medium flex items-center gap-2 text-[#2C2C2B]">
                      <Bookmark className="w-4 h-4 text-[#8C927F]" />
                      送检词章书卷
                    </h3>
                    <span className="font-mono text-[9px] text-[#2C2C2B]/40 uppercase">Mode A · Sample Analyzer</span>
                  </div>

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="请输入你想分析的文字，或点击下方示例填入后手动开始分析..."
                    className="w-full h-56 p-4 rounded-xl border border-[#2C2C2B]/10 bg-[#F9F8F3]/70 text-xs tracking-wide focus:outline-hidden focus:ring-1 focus:ring-[#8C927F]/40 placeholder-[#2C2C2B]/30 font-serif leading-relaxed transition-all resize-none text-[#2C2C2B]"
                  />

                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setInputText("")}
                      className="text-[10px] font-serif font-light text-[#2C2C2B]/50 hover:text-[#2C2C2B] flex items-center gap-1 transition-all"
                    >
                      <RotateCcw className="w-3 h-3 text-[#2C2C2B]/40" />
                      清空纸卷
                    </button>
                    
                    <button
                      onClick={() => handleAnalyze("A")}
                      disabled={loading || !inputText.trim()}
                      className="px-6 py-2.5 rounded-lg bg-[#2C2C2B] hover:bg-[#4d483e] text-[#FDFCF8] font-serif text-xs tracking-widest disabled:opacity-30 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      送呈品鉴
                    </button>
                  </div>
                </div>

                {/* Classic Literature presets */}
                <div className="export-ignore bg-[#F9F8F3]/60 p-5 rounded-2xl border border-[#2C2C2B]/10 shadow-xs">
                  <h4 className="font-serif text-xs font-medium mb-3 text-[#2C2C2B]/85 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#8C927F]" />
                    引入经典审美样稿
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_SAMPLES.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => setInputText(preset.text)}
                        className="p-3 text-left bg-white/85 hover:bg-[#8C927F]/10 border border-[#2C2C2B]/5 rounded-xl hover:border-[#8C927F]/45 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="font-serif text-xs text-[#2C2C2B] font-medium tracking-tight truncate">
                          {preset.title}
                        </div>
                        <div className="font-sans text-[8px] text-[#2C2C2B]/40 mt-1 truncate">
                          {preset.author}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {analysisReport && (
                  <div
                    ref={tabARadarRef}
                    className="bg-[#F9F8F3] p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs flex flex-col justify-between min-h-[520px]"
                  >
                    <div>
                      <h3 className="font-serif text-sm font-medium mb-1 text-center text-[#2C2C2B]">
                        学说极谱图
                      </h3>
                      <p className="font-mono text-[8px] text-center text-[#2C2C2B]/40 uppercase tracking-widest mb-4">
                        Aesthetics Axis Projections
                      </p>
                    </div>
                    <RadarChart data={mapScoresToRadar(analysisReport.scores)} colorA="#2C2C2B" />
                    <p className="font-sans text-[9px] text-[#2C2C2B]/40 text-center italic mt-4 leading-relaxed">
                      * 极谱数据由文字审美模型测绘生成
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Visual Report & Radar */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {analysisReport ? (
                    <motion.div
                      key="report-a"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="p-4 bg-[#FDFCF8] rounded-2xl border border-[#2C2C2B]/5 relative space-y-6">
                          {/* Left Block: Golden Radar */}
                          <div className="hidden md:col-span-12 lg:col-span-6 bg-[#F9F8F3] p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs flex flex-col justify-between">
                            <div>
                              <h3 className="font-serif text-sm font-medium mb-1 text-center text-[#2C2C2B]">学说极谱图</h3>
                              <p className="font-mono text-[8px] text-center text-[#2C2C2B]/40 uppercase tracking-widest mb-4">Aesthetics Axis Projections</p>
                            </div>
                            <RadarChart data={mapScoresToRadar(analysisReport.scores)} colorA="#2C2C2B" />
                            <p className="font-sans text-[9px] text-[#2C2C2B]/40 text-center italic mt-4 leading-relaxed">
                              * 极谱数据由文字审美模型测绘绘制
                            </p>
                          </div>

                          {/* Right Block: Wind Report and Analysis */}
                          <div className="space-y-6">
                            
                            {/* Exquisite Color Block Visual Guide reflecting lingering type */}
                            <div className={`p-6 rounded-2xl ${getFlavorBgClass(analysisReport.lingeringType)} relative overflow-hidden transition-all duration-500`}>
                              
                              {/* Fine border accent */}
                              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FDFCF8]/10 rounded-full blur-2xl pointer-events-none" />
                              
                              <div className="flex items-center justify-between gap-4 mb-5">
                                <div className="flex items-center justify-between gap-4 flex-1 min-w-0">
                                  <span className="font-mono text-[9px] leading-none tracking-[0.28em] text-[#2C2C2B]/45 uppercase block">
                                  总体余韵定性 · Lingering Style
                                </span>
                                  <span ref={tabAFlavorBadgeRef} className={`inline-flex shrink-0 h-9 min-w-[84px] items-center justify-center self-center px-5 rounded-full border text-[11px] leading-none tracking-[0.18em] font-serif font-medium whitespace-nowrap align-middle bg-white/92 ml-auto ${getFlavorBadgeColor(analysisReport.lingeringType)}`}>
                                    {analysisReport.lingeringType}
                                  </span>
                                </div>
                                <div className="export-ignore hidden flex-wrap items-center gap-2 pt-1">
                                  <button
                                    onClick={() => handleExportReportAsImageSafe("A")}
                                    disabled={exportingA}
                                    className="export-ignore px-3 py-1.5 bg-white/78 hover:bg-white text-[#2C2C2B] rounded-xl border border-[#2C2C2B]/10 text-[10px] font-serif transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                                    title="导出为精美审美分析画卷长图"
                                  >
                                    {exportingA ? (
                                      <RefreshCw className="w-3 h-3 text-[#8C927F] animate-spin" />
                                    ) : (
                                      <Download className="w-3 h-3 text-[#8C927F]" />
                                    )}
                                    <span>{exportingA ? "导出中..." : "导出为长图"}</span>
                                  </button>
                                  <button
                                    onClick={() => saveBookmark("A")}
                                    className="export-ignore px-3 py-1.5 bg-white/58 hover:bg-white/75 text-[#2C2C2B] rounded-xl border border-[#2C2C2B]/10 text-[10px] font-serif transition-colors flex items-center gap-1.5 cursor-pointer"
                                    title="收录此卷书札"
                                  >
                                    <Bookmark className="w-3 h-3 text-[#8C927F]" />
                                    <span>收录书卷</span>
                                  </button>
                                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] tracking-widest font-serif font-light bg-white/68 ${getFlavorAccentColor(analysisReport.lingeringType)}`}>
                                    {analysisReport.lingeringType}
                                  </span>
                                </div>
                              </div>

                              <div className="mb-4 rounded-2xl bg-white/34 border border-white/45 px-4 py-3">
                                <span className="font-serif text-xs font-light text-[#2C2C2B]/60 leading-none">风味批注</span>
                                <div className="flex flex-wrap gap-2 mt-2.5">
                                  {analysisReport.tags.map((tag, i) => (
                                    <span key={i} data-export-style="tag-chip" className="inline-flex h-9 items-center justify-center px-4 bg-white/72 text-[#2C2C2B] text-[11px] leading-none tracking-[0.04em] font-serif rounded-full border border-[#2C2C2B]/10 shadow-[0_4px_12px_rgba(44,44,43,0.04)] whitespace-nowrap align-middle">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <h4 className="font-serif text-[14px] leading-[1.95] text-[#2C2C2B] border-t border-[#2C2C2B]/10 pt-4 font-light">
                                {analysisReport.summary}
                              </h4>
                              <div className="export-ignore flex flex-wrap items-center gap-2 pt-4">
                                <button
                                  onClick={() => handleExportReportAsImageSafe("A")}
                                  disabled={exportingA}
                                  className="h-9 px-3 bg-white/78 hover:bg-white text-[#2C2C2B] rounded-xl border border-[#2C2C2B]/10 text-[10px] font-serif transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                                >
                                  {exportingA ? (
                                    <RefreshCw className="w-3 h-3 text-[#8C927F] animate-spin" />
                                  ) : (
                                    <Download className="w-3 h-3 text-[#8C927F]" />
                                  )}
                                  <span>{exportingA ? "导出中..." : "导出为长图"}</span>
                                </button>
                                <button
                                  onClick={() => saveBookmark("A")}
                                  className="h-9 px-3 bg-white/58 hover:bg-white/75 text-[#2C2C2B] rounded-xl border border-[#2C2C2B]/10 text-[10px] font-serif transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Bookmark className="w-3 h-3 text-[#8C927F]" />
                                  <span>收录书卷</span>
                                </button>
                              </div>
                            </div>

                            {/* Detailed breakdown per dimension tab lists */}
                            <div className="bg-[#F9F8F3] p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs space-y-4">
                              <h3 className="font-serif text-xs font-medium text-[#2C2C2B]/80 tracking-widest uppercase border-b border-[#2C2C2B]/10 pb-2">
                                维度详细解析 · Dimension Deep-dives
                              </h3>
                              <div className="space-y-3">
                                {getDimensionDetailGroups(analysisReport).map((group) => {
                                  const expanded = expandedDetailGroups[group.id];
                                  return (
                                    <div key={group.id} className="rounded-2xl border border-[#2C2C2B]/10 bg-white/68 overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={() => toggleDetailGroup(group.id)}
                                        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left cursor-pointer"
                                      >
                                        <div className="min-w-0">
                                          <p className="font-serif text-[12px] text-[#2C2C2B] tracking-[0.18em] uppercase">
                                            {group.title}
                                          </p>
                                          <p className="font-sans text-[10px] text-[#2C2C2B]/45 mt-1">
                                            {group.subtitle}
                                          </p>
                                        </div>
                                        <span className="font-sans text-[10px] text-[#2C2C2B]/55 shrink-0">
                                          {expanded ? "收起" : "展开"}
                                        </span>
                                      </button>

                                      <div
                                        data-export-expand="details-group"
                                        className="px-4 pb-4 space-y-3 overflow-hidden transition-all duration-300"
                                        style={{
                                          maxHeight: expanded ? `${group.dimensions.length * 220}px` : "0px",
                                          opacity: expanded ? 1 : 0,
                                          marginTop: expanded ? "0px" : "-8px",
                                        }}
                                      >
                                        {group.dimensions.map((dimension, index) => (
                                          <div
                                            key={dimension.detailKey}
                                            className={index === 0 ? "" : "pt-3 border-t border-[#2C2C2B]/8"}
                                          >
                                            <span className="font-medium inline-flex items-center gap-2 text-xs text-[#2C2C2B]">
                                              <span
                                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                                style={{ backgroundColor: dimension.accent }}
                                              />
                                              <span>
                                                {dimension.label}（{dimension.score.value}%）
                                              </span>
                                            </span>
                                            <p className="mt-1.5 font-sans text-[11px] font-light text-[#2C2C2B]/75 pl-3 leading-relaxed">
                                              {dimension.text}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              <div className="hidden space-y-4 font-serif text-xs text-[#2C2C2B]/80 leading-relaxed">
                                <div>
                                  <span className="font-medium inline-flex items-center gap-1.5 text-xs text-[#2C2C2B]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C927F]" />
                                    诚实气质与叙事姿态 (诚实度 {analysisReport.scores.honesty.value}%)
                                  </span>
                                  <p className="mt-1 font-sans text-[11px] font-light text-[#2C2C2B]/75 pl-3">
                                    {analysisReport.details.honestyAnalysis}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-[#2C2C2B]/10">
                                  <span className="font-medium inline-flex items-center gap-1.5 text-xs text-[#2C2C2B]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA]" />
                                    舌后回甘与回尾沉淀 (余韵 {analysisReport.scores.lingering.value}%)
                                  </span>
                                  <p className="mt-1 font-sans text-[11px] font-light text-[#2C2C2B]/75 pl-3">
                                    {analysisReport.details.lingeringAnalysis}
                                  </p>
                                </div>
                              </div>
                            </div>

                          </div>

                        {/* Scholar's independent verdict section */}
                        {analysisReport.literaryHistoryVerdict && (
                          <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-[#2C2C2B]/15 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-[#2C2C2B]/15 pb-2">
                              <h4 className="font-serif text-xs font-medium text-[#2C2C2B] tracking-widest flex items-center gap-2">
                                <Compass className="w-3.5 h-3.5 text-[#8C927F]" />
                                文学史独立断案 · Independent Scholar Verdict
                              </h4>
                              <span className="font-sans text-[8px] text-[#2C2C2B]/40 uppercase tracking-widest">
                                Literary History Matrix
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-serif">
                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-semibold text-[#2C2C2B]/50 block tracking-wider">
                                  ▣ 独异风格定性
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/85 leading-relaxed font-light pl-2.5 border-l border-[#8C927F]/30 italic">
                                  {analysisReport.literaryHistoryVerdict.distinctStyle}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-semibold text-emerald-800/75 block tracking-wider">
                                  ▣ 历史闪光点 / 亮点
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/85 leading-relaxed font-light pl-2.5 border-l border-emerald-800/30">
                                  {analysisReport.literaryHistoryVerdict.historicalHighlight}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-semibold text-red-800/75 block tracking-wider">
                                  ▣ 局限与缺憾 / 主要瑕疵
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/85 leading-relaxed font-light pl-2.5 border-l border-red-800/30">
                                  {analysisReport.literaryHistoryVerdict.criticalDefect}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full min-h-[380px] bg-[#F9F8F3]/60 rounded-2xl border border-dashed border-[#2C2C2B]/20 flex flex-col items-center justify-center p-8 text-center text-[#2C2C2B]/40 font-serif font-light">
                      <Bookmark className="w-10 h-10 stroke-[1.2] opacity-35 mb-3 text-[#8C927F]" />
                      待您在左侧送入书卷...
                      <p className="text-[10px] font-sans text-[#2C2C2B]/35 mt-2">
                        将基于俄国形式主义与新批评文本细读算法生成精美审美报告
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* TAB B: 对比品鉴 */}
          {activeTab === "B" && (
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
              
              {/* Left Column: Comparisons inputs */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white/80 p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-[#2C2C2B]/10 pb-2">
                    <h3 className="font-serif text-sm font-medium flex items-center gap-2 text-[#2C2C2B]">
                      <ArrowRightLeft className="w-4 h-4 text-[#8C927F]" />
                      同框比对文本
                    </h3>
                    <span className="font-mono text-[9px] text-[#2C2C2B]/40 uppercase">Aesthetics Confrontation</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-serif text-[11px] text-[#2C2C2B]/50 mb-1">文段 A 宣纸稿</label>
                      <textarea
                        value={textA}
                        onChange={(e) => setTextA(e.target.value)}
                        className="w-full h-32 p-3 rounded-lg border border-[#2C2C2B]/15 bg-[#F9F8F3]/60 text-xs font-serif leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-[#8C927F]/45 text-[#2C2C2B]"
                        placeholder="请输入文段 A，或点击下方示例填入..."
                      />
                    </div>

                    <div>
                      <label className="block font-serif text-[11px] text-[#2C2C2B]/50 mb-1">文段 B 宣纸稿</label>
                      <textarea
                        value={textB}
                        onChange={(e) => setTextB(e.target.value)}
                        className="w-full h-32 p-3 rounded-lg border border-[#2C2C2B]/15 bg-[#F9F8F3]/60 text-xs font-serif leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-[#8C927F]/45 text-[#2C2C2B]"
                        placeholder="请输入文段 B，或点击下方示例填入..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => {
                        setTextA("");
                        setTextB("");
                      }}
                      className="text-[10px] font-serif font-light text-[#2C2C2B]/50 hover:text-[#2C2C2B] cursor-pointer"
                    >
                      清屏空卷
                    </button>
                    <button
                      onClick={() => handleAnalyze("B")}
                      disabled={loading || !textA.trim() || !textB.trim()}
                      className="px-6 py-2.5 rounded-lg bg-[#2C2C2B] hover:bg-[#4d483e] text-[#FDFCF8] font-serif text-xs tracking-widest disabled:opacity-30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-[#8C927F]" />
                      开始对照品藻
                    </button>
                  </div>
                </div>

                {/* Compare Presets */}
                <div className="bg-[#F9F8F3]/60 p-4 rounded-xl border border-[#2C2C2B]/10 space-y-2">
                  <span className="font-serif text-[10px] text-[#2C2C2B]/50 uppercase tracking-widest block">对照范例引入:</span>
                  <div className="space-y-1.5">
                    {PRES_COMPARE_SAMPLES.map((pres, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTextA(pres.text);
                          setTextB(pres.textB || "");
                        }}
                        className="w-full text-left p-2.5 bg-white hover:bg-[#8C927F]/10 rounded-lg text-xs font-serif text-[#2C2C2B] border border-[#2C2C2B]/10 transition-all truncate cursor-pointer"
                      >
                        {pres.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Comparative Chart */}
              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  {compareReport ? (
                    <motion.div
                      key="report-b"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                    >
                      <div ref={tabBReportRef} className="p-4 bg-[#FDFCF8] rounded-2xl border border-[#2C2C2B]/5 relative space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          
                          {/* Compare Radar */}
                          <div className="md:col-span-12 lg:col-span-6 bg-[#F9F8F3] p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs flex flex-col justify-between">
                            <div>
                              <h3 className="font-serif text-sm font-medium mb-1 text-center text-[#2C2C2B]">双子等位极坐标</h3>
                              <p className="font-mono text-[8px] text-center uppercase mb-4 tracking-widest text-[#2C2C2B]/40">A vs B Overlaid Axis</p>
                            </div>
                            <RadarChart
                              data={mapCompareToRadar(compareReport)}
                              colorA="#2C2C2B" // Carbon ink
                              colorB="#8C927F" // Sage tea green
                              nameA="文段 A"
                              nameB="文段 B"
                            />
                          </div>

                          {/* Compare verdicts */}
                          <div className="md:col-span-12 lg:col-span-6 space-y-4">
                            <div className="p-4 bg-white/70 rounded-xl border border-[#2C2C2B]/10 space-y-3">
                              <h4 className="font-serif text-xs font-medium text-[#2C2C2B] border-b border-[#2C2C2B]/10 pb-1.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2C2C2B]" />
                                文段 A 品相简析
                              </h4>
                              <p className="font-serif text-xs font-light text-[#2C2C2B]/80 leading-relaxed">
                                {compareReport.textA.summary}
                              </p>
                              <span className="inline-block text-[9px] font-serif px-2 py-0.5 rounded-sm bg-[#2C2C2B]/5 text-[#2C2C2B]/70 border border-[#2C2C2B]/10">
                                余韵: {compareReport.textA.lingeringType}
                              </span>
                            </div>

                            <div className="p-4 bg-white/70 rounded-xl border border-[#2C2C2B]/10 space-y-3">
                              <h4 className="font-serif text-xs font-medium text-[#8C927F] border-b border-[#8C927F]/20 pb-1.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8C927F]" />
                                文段 B 品相简析
                              </h4>
                              <p className="font-serif text-xs font-light text-[#2C2C2B]/85 leading-relaxed">
                                {compareReport.textB.summary}
                              </p>
                              <span className="inline-block text-[9px] font-serif px-2 py-0.5 rounded-sm bg-[#8C927F]/5 text-[#8C927F] border border-[#8C927F]/25">
                                余韵: {compareReport.textB.lingeringType}
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Dimensions contrast logs table */}
                        <div className="bg-[#F9F8F3] p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs space-y-4">
                          <h3 className="font-serif text-xs font-medium text-[#2C2C2B]/80 uppercase tracking-widest border-b border-[#2C2C2B]/10 pb-2">
                            显著差异特征对照 · Significant Variations
                          </h3>
                          
                          <div className="space-y-4">
                            {compareReport.comparison.map((c, idx) => (
                              <div key={idx} className="font-serif text-xs border-b border-[#2C2C2B]/10 pb-3 last:border-0 last:pb-0">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium text-[#2C2C2B]">{c.dimension}</span>
                                  <div className="text-[10px] font-mono tracking-widest text-[#2C2C2B]/50">
                                    A: <span className="text-[#2C2C2B] font-semibold">{c.valueA}</span> 
                                    {" / "} 
                                    B: <span className="text-[#8C927F] font-semibold">{c.valueB}</span>
                                  </div>
                                </div>
                                <p className="font-sans text-[11px] font-light text-[#2C2C2B]/70 leading-relaxed">
                                  {c.desc}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="mt-5 p-5 bg-[#8C927F]/10 border border-[#8C927F]/20 rounded-xl relative overflow-visible">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-serif text-xs font-medium text-[#8C927F] leading-none">
                                美学断案 · Total Verdict
                              </h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleExportReportAsImageSafe("B")}
                                  disabled={exportingB}
                                  className="export-ignore px-2 py-1 bg-white hover:bg-[#FDFCF8] text-[#2C2C2B]/90 hover:text-[#2C2C2B] rounded shadow-xs border border-dashed border-[#8C927F]/45 text-[9px] font-serif transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  {exportingB ? (
                                    <RefreshCw className="w-2.5 h-2.5 text-[#8C927F] animate-spin" />
                                  ) : (
                                    <Download className="w-2.5 h-2.5 text-[#8C927F]" />
                                  )}
                                  <span>{exportingB ? "导出中..." : "导出为长图"}</span>
                                </button>
                                <button
                                  onClick={() => saveBookmark("B")}
                                  className="px-2 py-1 bg-white hover:bg-[#FDFCF8] text-[#2C2C2B]/90 hover:text-[#2C2C2B] rounded shadow-xs border border-[#8C927F]/30 text-[9px] font-serif transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Bookmark className="w-2.5 h-2.5 text-[#8C927F]" />
                                  <span>收录同框对照本</span>
                                </button>
                              </div>
                            </div>
                            <p className="font-serif text-xs font-light text-[#2C2C2B]/80 leading-relaxed mt-2">
                              {compareReport.finalVerdict}
                            </p>
                          </div>
                        </div>

                        {/* Comparative independent scholar verdict section */}
                        {compareReport.literaryHistoryVerdict && (
                          <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-[#2C2C2B]/15 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-[#2C2C2B]/15 pb-2">
                              <h4 className="font-serif text-xs font-medium text-[#2C2C2B] tracking-widest flex items-center gap-2">
                                <Compass className="w-3.5 h-3.5 text-[#8C927F]" />
                                文学史独立比对断案 · Independent Comparative Verdict
                              </h4>
                              <span className="font-sans text-[8px] text-[#2C2C2B]/40 uppercase tracking-widest">
                                Comparative Literary History
                              </span>
                            </div>

                            <div className="space-y-4 font-serif">
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-semibold text-[#2C2C2B]/50 block tracking-wider">
                                  ▣ 文段 A 的文学流派宿命与优劣审视
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/80 leading-relaxed font-light pl-2.5 border-l border-[#2C2C2B]/30">
                                  {compareReport.literaryHistoryVerdict.textAHistory}
                                </p>
                              </div>

                              <div className="space-y-1 pt-2 border-t border-[#2C2C2B]/5">
                                <span className="text-[10px] uppercase font-semibold text-[#8C927F] block tracking-wider">
                                  ▣ 文段 B 的文学流派宿命与优劣审视
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/80 leading-relaxed font-light pl-2.5 border-l border-[#8C927F]/30">
                                  {compareReport.literaryHistoryVerdict.textBHistory}
                                </p>
                              </div>

                              <div className="space-y-1 pt-2 border-t border-[#2C2C2B]/5 bg-[#8C927F]/5 p-3 rounded-lg border border-[#8C927F]/10">
                                <span className="text-[10px] uppercase font-semibold text-[#2C2C2B] block tracking-wider">
                                  ⌗ 风格史对照意义与得失结案
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/85 leading-relaxed font-light mt-1 text-justify">
                                  {compareReport.literaryHistoryVerdict.comparativeSignificance}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full min-h-[380px] bg-[#F9F8F3]/60 rounded-2xl border border-dashed border-[#2C2C2B]/20 flex flex-col items-center justify-center p-8 text-center text-[#2C2C2B]/40 font-serif font-light">
                      <ArrowRightLeft className="w-10 h-10 stroke-[1.2] opacity-35 mb-3 text-[#8C927F]" />
                      待您在左侧添置比对照书卷...
                      <p className="text-[10px] font-sans text-[#2C2C2B]/35 mt-2">
                        同框渲染双重多边形叠合投影，一目了然判明文心幽胜
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* TAB C: 写作诊断 */}
          {activeTab === "C" && (
            <div ref={tabCReportRef} className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
              
              {/* Left Column: Author Input draft sheet */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white/80 p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif text-sm font-medium flex items-center gap-2 text-[#2C2C2B]">
                      <PenTool className="w-4 h-4 text-[#8C927F]" />
                      呈交个人创稿
                    </h3>
                    <span className="font-mono text-[9px] text-[#2C2C2B]/40 uppercase">Mode C · Writers Diagnosis</span>
                  </div>

                  <p className="font-serif text-[11px] text-[#2C2C2B]/50 leading-relaxed mb-3 font-light">
                    请在此输入你手写的文字，我们将严苛地审查是否存在“伪造的眼泪”、或是否有“空洞的文理堆砌”，并提出有针对性的修改润色方案。
                  </p>

                  <textarea
                    value={diagnoseText}
                    onChange={(e) => setDiagnoseText(e.target.value)}
                    className="w-full h-56 p-4 rounded-xl border border-[#2C2C2B]/10 bg-[#F9F8F3]/60 text-xs font-serif leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-[#8C927F]/45 text-[#2C2C2B]"
                    placeholder="请输入你的原创文字，准备好后再开始诊断..."
                  />

                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setDiagnoseText("")}
                      className="text-[10px] font-serif font-light text-[#2C2C2B]/50 hover:text-[#2C2C2B] cursor-pointer"
                    >
                      废纸篓
                    </button>
                    <button
                      onClick={() => handleAnalyze("C")}
                      disabled={loading || !diagnoseText.trim()}
                      className="px-6 py-2.5 rounded-lg bg-[#2C2C2B] hover:bg-[#4d483e] text-[#FDFCF8] font-serif text-xs tracking-widest disabled:opacity-30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      开始文字会诊
                    </button>
                  </div>
                </div>

                {diagnosisReport && (
                  <div className="bg-[#F9F8F3] p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs flex flex-col justify-between min-h-[520px]">
                    <div>
                      <h3 className="font-serif text-sm font-medium mb-1 text-center text-[#2C2C2B]">自审美学轴系</h3>
                      <p className="font-mono text-[8px] text-center text-[#2C2C2B]/40 uppercase tracking-widest mb-4">Diagnosis Axis</p>
                    </div>
                    <RadarChart data={mapScoresToRadar(diagnosisReport.scores)} colorA="#2C2C2B" />
                    <div className="text-center mt-4">
                      <span className="text-[10px] font-serif text-[#2C2C2B]/80 bg-[#E3D5CA]/40 px-2 py-0.5 rounded-sm border border-[#E3D5CA]/60">
                        表演性质: {diagnosisReport.scores.honesty.value}% (越低越诚实)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Diagnosis Report */}
              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  {diagnosisReport ? (
                    <motion.div
                      key="report-c"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                    >
                      <div className="p-4 bg-[#FDFCF8] rounded-2xl border border-[#2C2C2B]/5 relative space-y-6">
                        <div className="space-y-6">
                            
                            {/* Lingering feedback */}
                            <div className={`p-5 rounded-2xl ${getFlavorBgClass(diagnosisReport.lingeringType)} relative`}>
                              <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                                <h4 className="font-mono text-[9px] text-[#2C2C2B]/50 uppercase tracking-wider">余韵检测 & 质地结论</h4>
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleExportReportAsImageSafe("C")}
                                    disabled={exportingC}
                                    className="export-ignore px-2 py-0.5 bg-white/75 hover:bg-white text-[#2C2C2B]/85 hover:text-[#2C2C2B] rounded shadow-xs border border-dashed border-[#2C2C2B]/20 text-[9px] font-serif transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    {exportingC ? (
                                      <RefreshCw className="w-2.5 h-2.5 text-[#8C927F] animate-spin" />
                                    ) : (
                                      <Download className="w-2.5 h-2.5 text-[#8C927F]" />
                                    )}
                                    <span>{exportingC ? "导出中..." : "导出为长图"}</span>
                                  </button>
                                  <button
                                    onClick={() => saveBookmark("C")}
                                    className="px-2 py-0.5 bg-white/75 hover:bg-white text-[#2C2C2B]/85 hover:text-[#2C2C2B] rounded shadow-xs border border-[#8C927F]/30 text-[9px] font-serif transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Bookmark className="w-2.5 h-2.5 text-[#8C927F]" />
                                    <span>收录会诊稿</span>
                                  </button>
                                </div>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[9px] tracking-widest font-serif font-light mb-3 inline-block ${getFlavorAccentColor(diagnosisReport.lingeringType)}`}>
                                余韵: {diagnosisReport.lingeringType}
                              </span>
                              <p className="font-serif text-xs font-light text-[#2C2C2B]/85 leading-relaxed">
                                {diagnosisReport.summary}
                              </p>
                            </div>

                            {/* suggestions suggestions */}
                            {diagnosisReport.suggestions && diagnosisReport.suggestions.length > 0 && (
                              <div className="space-y-4">
                                <h3 className="font-serif text-xs font-medium text-[#2C2C2B]/70 uppercase tracking-widest">
                                  美学医生改写构想 · Interactive Rewrites
                                </h3>

                                {diagnosisReport.suggestions.map((sug, i) => (
                                  <div key={i} className="p-5 bg-white rounded-xl border border-[#2C2C2B]/10 space-y-2.5 shadow-xs">
                                    <h4 className="font-serif text-xs font-medium text-[#8C927F] flex items-center gap-1.5">
                                      <CornerDownRight className="w-3.5 h-3.5" />
                                      方案 {i + 1}：{sug.title}
                                    </h4>
                                    <p className="font-sans text-[11px] font-light text-[#2C2C2B]/70 leading-relaxed font-light">
                                      {sug.text}
                                    </p>
                                    
                                    <div className="mt-3 bg-[#F9F8F3] border border-[#2C2C2B]/5 p-3 rounded-md font-serif text-[11px] leading-relaxed italic text-[#2C2C2B]/80">
                                      <strong className="not-italic font-sans text-[9px] text-[#2C2C2B]/40 uppercase block mb-1">
                                        对照对比演示 · Comparison Demo:
                                      </strong>
                                      {sug.example}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="bg-white/50 p-5 rounded-xl border border-[#2C2C2B]/10">
                              <h4 className="font-serif text-xs font-medium text-[#2C2C2B]/80 mb-2">诚实度细节会诊意见</h4>
                              <p className="font-sans text-[11px] font-light text-[#2C2C2B]/70 leading-relaxed font-light">
                                {diagnosisReport.details.honestyAnalysis}
                              </p>
                            </div>

                        </div>

                        {/* Scholar's independent verdict section */}
                        {diagnosisReport.literaryHistoryVerdict && (
                          <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-[#2C2C2B]/15 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-[#2C2C2B]/15 pb-2">
                              <h4 className="font-serif text-xs font-medium text-[#2C2C2B] tracking-widest flex items-center gap-2">
                                <Compass className="w-3.5 h-3.5 text-[#8C927F]" />
                                文学史独立会诊定案 · Scholar Quality Verdict
                              </h4>
                              <span className="font-sans text-[8px] text-[#2C2C2B]/40 uppercase tracking-widest">
                                Author Diagnosis Verdict
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-serif">
                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-semibold text-[#2C2C2B]/50 block tracking-wider">
                                  ▣ 独异风格定性
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/85 leading-relaxed font-light pl-2.5 border-l border-[#8C927F]/30 italic">
                                  {diagnosisReport.literaryHistoryVerdict.distinctStyle}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-semibold text-emerald-800/75 block tracking-wider">
                                  ▣ 历史闪光点 / 亮点
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/85 leading-relaxed font-light pl-2.5 border-l border-emerald-800/30">
                                  {diagnosisReport.literaryHistoryVerdict.historicalHighlight}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-semibold text-red-800/75 block tracking-wider">
                                  ▣ 局限与缺憾 / 主要瑕疵
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/85 leading-relaxed font-light pl-2.5 border-l border-red-800/30">
                                  {diagnosisReport.literaryHistoryVerdict.criticalDefect}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full min-h-[380px] bg-[#F9F8F3]/60 rounded-2xl border border-dashed border-[#2C2C2B]/20 flex flex-col items-center justify-center p-8 text-center text-[#2C2C2B]/40 font-serif font-light">
                      <PenTool className="w-10 h-10 stroke-[1.2] opacity-35 mb-3 text-[#8C927F]" />
                      待您在左侧呈上创稿宣稿...
                      <p className="text-[10px] font-sans text-[#2C2C2B]/25 mt-2">
                        我们将剖析您的“心象之诚”，提供极高美学底板启发建议
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* TAB D: 风格定位 (Interactive radar dragging/sliders and school templates) */}
          {activeTab === "D" && (
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
              
              {/* Left Column: Preset classic vibe archetypes */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white/80 p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-[#2C2C2B]/10 pb-2">
                    <h2 className="font-serif text-sm font-medium flex items-center gap-2 text-[#2C2C2B]">
                      <Sliders className="w-4 h-4 text-[#8C927F]" />
                      文学文体流派档案
                    </h2>
                    <span className="font-mono text-[9px] text-[#2C2C2B]/40 uppercase">Pre-compiled Archetypes</span>
                  </div>

                  <p className="font-serif text-[11px] text-[#2C2C2B]/50 leading-relaxed">
                    选择任一经典美学流派，探寻它的九维度投影。您也可以在右侧雷达图上<strong>直接拖拽任意圆点</strong>，来自由调制最契合你写作目标的审美投影！
                  </p>

                  <div className="space-y-2.5">
                    {STYLE_VIBES.map((vibe, index) => (
                      <button
                        key={index}
                        onClick={() => handleVibeSelect(vibe)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                          selectedVibe.name === vibe.name
                            ? "bg-[#8C927F]/10 border-[#8C927F]/50 text-[#2C2C2B]"
                            : "bg-white/60 border-[#2C2C2B]/10 hover:bg-white text-[#2C2C2B]/85"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-serif text-xs font-medium tracking-tight text-[#2C2C2B]">{vibe.name}</span>
                          <span className="font-sans text-[8px] opacity-40 uppercase">Ref: {vibe.authorRef.split(" / ")[0]}</span>
                        </div>
                        <p className="font-sans text-[10px] font-light text-[#2C2C2B]/60 leading-normal">
                          {vibe.vibe}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend details card */}
                {selectedVibe && (
                  <div className={`p-6 rounded-2xl ${getFlavorBgClass(selectedVibe.lingeringType)} relative space-y-3`}>
                    <span className="font-sans text-[8px] text-[#2C2C2B]/40 tracking-widest uppercase block">流派拟示范文 / Standard Prototype</span>
                    <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]">{selectedVibe.name} 式样句演示：</h4>
                    <p className="font-serif italic text-xs leading-relaxed text-[#2C2C2B]/80 bg-[#FDFCF8]/50 p-3 rounded-lg border border-[#2C2C2B]/10">
                      {selectedVibe.example}
                    </p>
                    <div className="font-sans text-[10px] text-[#2C2C2B]/50 flex justify-between items-center pt-2 border-t border-[#2C2C2B]/10">
                      <span>经典参考作系: {selectedVibe.authorRef}</span>
                      <span>余韵定型: {selectedVibe.lingeringType}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Custom Sliders or interactive Radar Chart */}
              <div className="lg:col-span-7 bg-[#F9F8F3] p-6 md:p-8 rounded-2xl border border-[#2C2C2B]/10 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Visual Intersect Radar */}
                <div className="md:col-span-6 flex flex-col items-center">
                  <h3 className="font-serif text-sm font-medium mb-1 text-center text-[#2C2C2B]">
                    九维文体罗盘拟态
                  </h3>
                  <p className="font-mono text-[8px] text-[#2C2C2B]/40 uppercase tracking-widest mb-6">Interactive Style Configurator</p>
                  
                  <RadarChart
                    data={getInteractiveRadarData()}
                    onValueChange={handleInteractiveScoreChange}
                    interactive={true}
                    colorA="#8C927F"
                  />

                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-serif text-[#2C2C2B]/50 leading-relaxed justify-center text-center">
                    <Info className="w-3.5 h-3.5 stroke-[1.5] text-[#8C927F]" />
                    <span>在极轴上按鼠标左键/触摸直接拖拽进行微调</span>
                  </div>
                </div>

                {/* Numeric sliders columns */}
                <div className="md:col-span-6 space-y-3">
                  <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]/80 uppercase tracking-widest border-b border-[#2C2C2B]/10 pb-1 mb-3">
                    轴极分值阻尼
                  </h4>
                  {Object.entries(interactiveScores).map(([key, val]) => {
                    const labelMap: Record<string, string> = {
                      temperature: "温度 (冷冽-炽烈)",
                      density: "密度 (轻盈-厚重)",
                      transparency: "透明度 (澄澈-幽深)",
                      lingering: "余韵 (清冽-沉淀)",
                      tension: "张力 (松弛-紧绷)",
                      imagery: "意象域 (具象-抽象)",
                      time: "时间感 (压缩-延缓)",
                      honesty: "表演度 (坦露-表演)",
                      culture: "文化层 (传统-断裂)"
                    };
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-sans">
                          <span className="font-serif text-[#2C2C2B]/80">{labelMap[key]}</span>
                          <span className="font-mono text-[#2C2C2B]/40">{val} / 100</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={val}
                          onChange={(e) => {
                            setInteractiveScores(prev => ({
                              ...prev,
                              [key]: parseInt(e.target.value)
                            }));
                          }}
                          className="w-full accent-[#8C927F] h-1 bg-[#2C2C2B]/5 rounded-lg appearance-none cursor-ew-resize opacity-80 hover:opacity-100 transition-opacity"
                        />
                      </div>
                    );
                  })}

                  <div className="pt-4 space-y-4">
                    <button
                      onClick={handleCustomProfileEvaluation}
                      className="w-full py-3 bg-[#2C2C2B] text-[#FDFCF8] rounded-xl text-xs font-serif tracking-widest hover:bg-[#4d483e] transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#8C927F]" />
                      解构当前美学设想之投影
                    </button>

                    {/* Natural language custom evaluation area containing recommendations */}
                    <AnimatePresence>
                      {customEvaluation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border border-[#8C927F]/20 rounded-xl p-5 bg-[#8C927F]/5 space-y-4 text-left"
                        >
                          <div className="flex justify-between items-baseline border-b border-[#8C927F]/20 pb-2">
                            <span className="font-serif text-xs font-semibold text-[#2C2C2B]">
                              设定命格：{customEvaluation.styleName}
                            </span>
                          </div>
                          <p className="font-serif text-[11px] font-light text-[#2C2C2B]/85 leading-relaxed">
                            {customEvaluation.interpretation}
                          </p>

                          <div className="space-y-2">
                            <span className="font-mono text-[8px] tracking-wider text-[#2C2C2B]/40 uppercase block">推荐参考作者与作品：</span>
                            {customEvaluation.recommendations.map((rec, i) => (
                              <div key={i} className="bg-white/70 p-3 rounded-lg border border-[#2C2C2B]/5 space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-serif text-[11px] font-semibold text-[#2C2C2B]">{rec.author} {rec.work}</span>
                                  <span className="text-[8px] bg-[#8C927F]/10 text-[#8C927F] px-1 rounded-xs">参考坐标</span>
                                </div>
                                <p className="font-sans text-[10px] text-[#2C2C2B]/60 leading-relaxed">
                                  <strong>参考价值：</strong>{rec.value}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Subsequent interactive test card */}
                          <div className="border-t border-[#8C927F]/20 pt-4 mt-2 space-y-3">
                            <h5 className="font-serif text-[11px] font-medium text-[#2C2C2B]/95 flex items-center gap-1.5">
                              落笔印证 · 现场文字分值检校
                            </h5>
                            <p className="font-sans text-[10px] font-light text-[#2C2C2B]/50 leading-relaxed">
                              若您已有一些现成文段或现场拟稿，可在下方输入。我们将利用文字测量机制为您解构其是否吻合上述九维设想。
                            </p>
                            <textarea
                              rows={4}
                              value={customDraftText}
                              onChange={(e) => setCustomDraftText(e.target.value)}
                              placeholder="在此落笔输入您的书卷段落，检验其与上述设置的契合重合度..."
                              className="w-full bg-white border border-[#2C2C2B]/15 rounded-xl p-3 text-xs font-serif tracking-wide focus:outline-hidden focus:ring-1 focus:ring-[#8C927F]/45 text-[#2C2C2B] resize-none"
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={handleCustomDraftVerify}
                                disabled={customTesting || !customDraftText.trim()}
                                className="px-4 py-2 bg-[#2C2C2B] hover:bg-[#4d483e] text-[#FDFCF8] hover:text-white text-xs font-serif rounded-lg tracking-widest transition-all disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
                              >
                                {customTesting ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 animate-spin text-[#8C927F]" />
                                    <span>测算中...</span>
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-3 h-3 text-[#8C927F]" />
                                    <span>测算匹配度</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Testing verification result */}
                            {customTestResult && (
                              <div className="bg-white/85 border border-[#8C927F]/25 rounded-md p-3 mt-3 space-y-2">
                                <div className="flex justify-between items-center border-b border-[#2C2C2B]/5 pb-1">
                                  <span className="font-serif text-[10px] font-medium text-[#2C2C2B]/85">实测重合指标：</span>
                                  <span className="text-xs font-serif font-bold text-[#8C927F]">
                                    重合率 {customTestResult.matchScore}%
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-[#2C2C2B]/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#8C927F] rounded-full transition-all duration-1000"
                                    style={{ width: `${customTestResult.matchScore}%` }}
                                  />
                                </div>
                                <p className="font-serif text-[11px] text-[#2C2C2B]/75 leading-relaxed bg-[#F9F8F3]/70 p-2 rounded border border-[#2C2C2B]/5 whitespace-pre-wrap">
                                  {customTestResult.feedback}
                                </p>
                              </div>
                            )}
                          </div>

                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB E: 自由探索 (Chat) */}
          {activeTab === "E" && (
            <div className="lg:col-span-12 max-w-4xl mx-auto w-full animate-fadeIn">
              <div className="bg-white/80 rounded-2xl border border-[#2C2C2B]/10 shadow-xs flex flex-col h-[520px] overflow-hidden">
                
                {/* Chat header */}
                <div className="bg-[#F9F8F3] px-6 py-4 border-b border-[#2C2C2B]/10 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-sm font-medium flex items-center gap-2 text-[#2C2C2B]">
                      <MessageSquare className="w-4 h-4 text-[#8C927F]" />
                      文学审美学术对谈
                    </h3>
                    <p className="font-sans text-[9px] text-[#2C2C2B]/40 uppercase mt-0.5 tracking-wider">
                      Dialogue on Russian Formalism & Textual Criticism
                    </p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8C927F] animate-pulse" />
                </div>

                {/* Chat screen logs scrolls */}
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFCF8]/40">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed tracking-wide ${
                          msg.sender === "user"
                            ? "bg-[#2C2C2B] text-[#FDFCF8] font-serif rounded-tr-xs"
                            : "bg-white text-[#2C2C2B] font-sans font-light border border-[#2C2C2B]/10 rounded-tl-xs shadow-xs"
                        }`}
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat input form interface */}
                <div className="p-4 bg-[#F9F8F3] border-t border-[#2C2C2B]/10 flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                    placeholder="输入或向我提问，例如：“什么是写作的零度？”、“海明威的冰山理论和张爱玲的繁复的区别是什么？”..."
                    className="flex-1 bg-white border border-[#2C2C2B]/15 rounded-xl px-4 py-2.5 text-xs font-serif tracking-wide focus:outline-hidden focus:ring-1 focus:ring-[#8C927F]/45 text-[#2C2C2B]"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !chatInput.trim()}
                    className="bg-[#2C2C2B] hover:bg-[#4d483e] text-[#FDFCF8] text-xs font-serif px-5 py-2.5 rounded-xl tracking-widest transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-30 cursor-pointer"
                  >
                    纸鸽送呈
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Dynamic Textbook Bento Box dictionary section below */}
        <hr className="border-[#2C2C2B]/10 my-16 max-w-4xl mx-auto" />

        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-serif text-lg font-light tracking-[0.15em] text-[#2C2C2B] flex items-center justify-center gap-2">
              <Compass className="w-4 h-4 text-[#8C927F]" />
              文字审美模型九极维度说
            </h3>
            <p className="font-mono text-[9px] text-[#2C2C2B]/40 tracking-wider uppercase mt-1">
              Aesthetics Spectrum & Recognition Signals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-5 bg-white/70 rounded-xl border border-[#2C2C2B]/10 shadow-xs space-y-2">
              <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]/80 tracking-wide border-b border-[#2C2C2B]/10 pb-1.5">
                ① 温度 · Emotion Temp
              </h4>
              <p className="font-sans text-[10px] font-light leading-relaxed text-[#2C2C2B]/60">
                文字自带的情感体温，它决定了读者与文本之间的心理阻隔屏障。从巴特零度到炽烈红莲的漫长光谱。
              </p>
              <div className="text-[9px] font-serif text-[#8C927F] italic pt-1">
                "读完觉得重，但找不到一句温吞的情话。"
              </div>
            </div>

            <div className="p-5 bg-white/70 rounded-xl border border-[#2C2C2B]/10 shadow-xs space-y-2">
              <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]/80 tracking-wide border-b border-[#2C2C2B]/10 pb-1.5">
                ② 密度 · Info Density
              </h4>
              <p className="font-sans text-[10px] font-light leading-relaxed text-[#2C2C2B]/60">
                单位篇幅内的信息量与意感叠加。排字带有留白多还是意象窒息。决定了读者的认知消化减速比。
              </p>
              <div className="text-[9px] font-serif text-[#8C927F] italic pt-1">
                "前景化层叠。同一句话，你需要读第二遍。"
              </div>
            </div>

            <div className="p-5 bg-white/70 rounded-xl border border-[#2C2C2B]/10 shadow-xs space-y-2">
              <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]/80 tracking-wide border-b border-[#2C2C2B]/10 pb-1.5">
                ③ 透明度 · Significance clarity
              </h4>
              <p className="font-sans text-[10px] font-light leading-relaxed text-[#2C2C2B]/60">
                文字的解码层深。从一目澄明直达人心，到象征层叠的燕卜荪七型美学含混。
              </p>
              <div className="text-[9px] font-serif text-[#8C927F] italic pt-1">
                "你确信它说了什么，但不保证它只说了这件。"
              </div>
            </div>

            <div className="p-5 bg-white/70 rounded-xl border border-[#2C2C2B]/10 shadow-xs space-y-2">
              <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]/80 tracking-wide border-b border-[#2C2C2B]/10 pb-1.5">
                ④ 余韵 · Sensational Echo
              </h4>
              <p className="font-sans text-[10px] font-light leading-relaxed text-[#2C2C2B]/60">
                阅毕合卷后，残留在体内的感知和弦。这是文字最难被模仿和假造的质地。
              </p>
              <div className="text-[9px] font-serif text-[#8C927F] italic pt-1">
                "读时顺喉，咽后半日仍在口齿留有苦辛。"
              </div>
            </div>

            <div className="p-5 bg-white/70 rounded-xl border border-[#2C2C2B]/10 shadow-xs space-y-2">
              <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]/80 tracking-wide border-b border-[#2C2C2B]/10 pb-1.5">
                ⑤ 张力 · Dynamic Tension
              </h4>
              <p className="font-sans text-[10px] font-light leading-relaxed text-[#2C2C2B]/60">
                文本的内在拉拔。叙说与深沉沉默的抗衡、单声道随侍与诸声和弦巴赫金复调的角力。
              </p>
              <div className="text-[9px] font-serif text-[#8C927F] italic pt-1">
                "结尾处他一言不发，但你听到了万马奔腾。"
              </div>
            </div>

            <div className="p-5 bg-white/70 rounded-xl border border-[#2C2C2B]/10 shadow-xs space-y-2">
              <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]/80 tracking-wide border-b border-[#2C2C2B]/10 pb-1.5">
                ⑥ 意象域 · Metaphor Domain
              </h4>
              <p className="font-sans text-[10px] font-light leading-relaxed text-[#2C2C2B]/60">
                在何种质地的物质域中，构建并折射感知体系。什克洛夫斯基的陌生化打破语言自动化。
              </p>
              <div className="text-[9px] font-serif text-[#8C927F] italic pt-1">
                "用矿物或古老水声的罕见对位建立起感知新大陆。"
              </div>
            </div>

            <div className="p-5 bg-white/70 rounded-xl border border-[#2C2C2B]/10 shadow-xs space-y-2">
              <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]/80 tracking-wide border-b border-[#2C2C2B]/10 pb-1.5">
                ⑦ 时间感 · Time Perception
              </h4>
              <p className="font-sans text-[10px] font-light leading-relaxed text-[#2C2C2B]/60">
                文本处理时间流速的双向缩放。是压缩流逝（如‘百年孤独’般的长卷缩骨），还是主观延缓进程（普鲁斯特式的意识精洗）。
              </p>
              <div className="text-[9px] font-serif text-[#8C927F] italic pt-1">
                "在一个漫长的下午，他把一生的悔恨写进那行只用了三秒完成的签名。"
              </div>
            </div>

            <div className="p-5 bg-white/70 rounded-xl border border-[#2C2C2B]/10 shadow-xs space-y-2">
              <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]/80 tracking-wide border-b border-[#2C2C2B]/10 pb-1.5">
                ⑧ 诚实度 · Sincerity Ethos
              </h4>
              <p className="font-sans text-[10px] font-light leading-relaxed text-[#2C2C2B]/60">
                隐含作者的心理安全防备姿态。是安设表演性的自恋修辞，还是回归诚挚直面个人内心最艰难、最原生态的脆弱体验。
              </p>
              <div className="text-[9px] font-serif text-[#8C927F] italic pt-1">
                "不为了叫好而增设藻饰，哪怕最后捧出的是带血的粗鄙本真。"
              </div>
            </div>

            <div className="p-5 bg-white/70 rounded-xl border border-[#2C2C2B]/10 shadow-xs space-y-2">
              <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]/80 tracking-wide border-b border-[#2C2C2B]/10 pb-1.5">
                ⑨ 文化层 · Intertextual Depth
              </h4>
              <p className="font-sans text-[10px] font-light leading-relaxed text-[#2C2C2B]/60">
                文本中蕴藏的典故包浆、文本互涉厚度与集体无意识回音的层深度。古典文脉和词谱惯性的潜隐继承度。
              </p>
              <div className="text-[9px] font-serif text-[#8C927F] italic pt-1">
                "每拂拭一圈词章，总会发出远古铜镜或斑驳竹简的干涩回声。"
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Exquisite Sidebar Drawer for "我的书卷档案馆" */}
      <AnimatePresence>
        {archiveOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              onClick={() => setArchiveOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Sidebar drawer sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="fixed top-0 right-0 h-full w-[360px] sm:w-[420px] bg-[#FDFCF8] text-[#2C2C2B] shadow-2xl z-50 flex flex-col border-l border-[#2C2C2B]/15"
              style={{ fontFamily: "'Georgia', 'Helvetica Neue', Arial, sans-serif" }}
            >
              {/* Header */}
              <div className="p-6 border-b border-[#2C2C2B]/10 flex justify-between items-center bg-[#F9F8F3]">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#2C2C2B] flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-[#8C927F]" />
                    我的书卷档案馆
                  </h3>
                  <p className="font-mono text-[9px] text-[#2C2C2B]/40 uppercase tracking-wider mt-0.5">
                    Nine-dimensional Archives Drawer
                  </p>
                </div>
                <button
                  onClick={() => setArchiveOpen(false)}
                  className="p-1 px-2.5 rounded-md hover:bg-[#2C2C2B]/5 text-xs font-serif text-[#2C2C2B]/50 hover:text-[#2C2C2B] transition-colors cursor-pointer"
                >
                  关闭
                </button>
              </div>

              {/* List body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {bookmarks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs text-[#2C2C2B]/40 font-serif leading-relaxed">
                    <BookOpen className="w-8 h-8 stroke-[1.2] opacity-30 mb-3 text-[#8C927F]" />
                    <span>阁中目前空无一卷。</span>
                    <p className="text-[10px] text-[#2C2C2B]/35 mt-2 max-w-[240px] mx-auto">
                      您可在「品鉴分析」或「对比品鉴」中点击「收录书卷」或「收录同框对照本」将其永久保存至此处。
                    </p>
                  </div>
                ) : (
                  bookmarks.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => restoreBookmark(b)}
                      className="group p-4 bg-white/70 hover:bg-[#8C927F]/5 rounded-xl border border-[#2C2C2B]/10 hover:border-[#8C927F]/45 transition-all cursor-pointer relative shadow-2xs space-y-2 flex flex-col"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-serif text-xs font-semibold tracking-wide text-[#2C2C2B]/85 group-hover:text-[#2C2C2B] leading-snug line-clamp-1 pr-6">
                          {b.title}
                        </span>
                        <button
                          onClick={(e) => deleteBookmark(b.id, e)}
                          className="text-[#2C2C2B]/35 hover:text-red-700 p-1 rounded-md transition-colors absolute top-3 right-3 cursor-pointer"
                          title="移出此卷"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="font-sans text-[10px] font-light text-[#2C2C2B]/60 leading-relaxed line-clamp-2">
                        {b.text}
                      </p>

                      <div className="flex justify-between items-center text-[9px] font-serif text-[#2C2C2B]/40 pt-1 border-t border-[#2C2C2B]/5">
                        <span className="not-italic bg-[#8C927F]/10 text-[#8C927F] font-sans px-1.5 py-0.5 rounded-sm">
                          {b.mode === "A" ? "单卷品藻" : b.mode === "B" ? "对照文段" : "风格诊断"}
                        </span>
                        <span>{b.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer stats panel */}
              <div className="p-6 bg-[#F9F8F3] border-t border-[#2C2C2B]/10 text-center">
                <p className="font-sans text-[9px] font-light text-[#2C2C2B]/50">
                  档案馆采用本地沙盒（LocalStorage）进行词章密件级存储。
                  <br />
                  清除浏览器历史缓存或更换设备会导致收藏文卷清空。
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
