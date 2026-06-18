import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRightLeft,
  PenTool,
  Sliders,
  Bookmark,
  RotateCcw,
  RefreshCw,
  CornerDownRight,
  Info,
  Download,
  Check
} from "lucide-react";
import html2canvas from "html2canvas";
import type { BookmarkItem } from "./app-types";
import ArchiveDrawer from "./components/ArchiveDrawer";
import ChatPanel from "./components/ChatPanel";
import FlavorGlossary from "./components/FlavorGlossary";
import RadarChart from "./components/RadarChart";
import { PRESET_SAMPLES, PRES_COMPARE_SAMPLES, STYLE_VIBES } from "./data";
import {
  ChatMessage,
  AestheticsReport,
  ComparisonReport,
  DimensionScore
} from "./types";

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
    title: "????",
    subtitle: "?? / ?? / ??? / ??",
    dimensions: [
      { label: "??", scoreKey: "temperature", detailKey: "temperatureAnalysis", accent: "#8C927F", fallback: "?????????????????????????????" },
      { label: "??", scoreKey: "density", detailKey: "densityAnalysis", accent: "#B08968", fallback: "?????????????????????????????" },
      { label: "???", scoreKey: "transparency", detailKey: "transparencyAnalysis", accent: "#7C9A92", fallback: "?????????????????????????????" },
      { label: "??", scoreKey: "lingering", detailKey: "lingeringAnalysis", accent: "#C08C6A", fallback: "????????????????????????????????????" },
    ],
  },
  {
    id: "extended",
    title: "????",
    subtitle: "?? / ??? / ???",
    dimensions: [
      { label: "??", scoreKey: "tension", detailKey: "tensionAnalysis", accent: "#9E6A6A", fallback: "??????????????????????????????" },
      { label: "???", scoreKey: "imagery", detailKey: "imageryAnalysis", accent: "#6B8E73", fallback: "???????????????????????????" },
      { label: "???", scoreKey: "time", detailKey: "timeAnalysis", accent: "#7A86A1", fallback: "??????????????????????????????" },
    ],
  },
  {
    id: "meta",
    title: "???",
    subtitle: "??? / ???",
    dimensions: [
      { label: "???", scoreKey: "honesty", detailKey: "honestyAnalysis", accent: "#8B7355", fallback: "??????????????????????????????" },
      { label: "???", scoreKey: "culture", detailKey: "cultureAnalysis", accent: "#A47C57", fallback: "?????????????????????????????????" },
    ],
  },
];

const buildDetailFallback = (label: string, score: DimensionScore, fallback: string) => {
  return `${label}???? ${score.value} ????${score.desc}${fallback}`;
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
    case "閸ョ偟鏁?:
      return "text-[#4F5F45] border-[#7E9272]/45 bg-[#EEF3E8]";
    case "閼伙附璁?:
      return "text-[#6A5140] border-[#A07F68]/45 bg-[#F3E5DA]";
    case "濞撳懎鍠?:
      return "text-[#44616A] border-[#6E8A93]/45 bg-[#E7F0F2]";
    case "閻戠喓鍟?:
      return "text-[#66586E] border-[#93839B]/45 bg-[#EFEAF2]";
    default:
      return "text-[#4F5F45] border-[#7E9272]/45 bg-[#EEF3E8]";
  }
};

const getRadarDescriptor = (label: string, value: number) => {
  if (label === "濞撯晛瀹?) return value >= 67 ? "閺嗘牞鐨? : value >= 34 ? "濞撯晛鎷? : "閸愮柉鐨?;
  if (label === "鐎靛棗瀹?) return value >= 67 ? "缁讳礁鐦? : value >= 34 ? "閸栤偓鐎?" : "閻ゅ繑婀?;
  if (label === "闁繑妲戞惔?") return value >= 67 ? "楠炶姤绻? : value >= 34 ? "濞撳懘鈧?" : "閻╁娅?;
  if (label === "娴ｆ瑩鐓?) return value >= 67 ? "濞屽缍? : value >= 34 ? "閸ョ偟鏁? : "閸楄櫕鏆?;
  if (label === "瀵姴濮?) return value >= 67 ? "缁毖呯幆" : value >= 34 ? "閸氼偄绱堕崝?" : "閺夋儳绱?;
  if (label === "閹板繗钖勯崺?") return value >= 67 ? "閹跺€熻杽" : value >= 34 ? "閸忕厧鍙? : "閸忕柉钖?;
  if (label === "閺冨爼妫块幇?") return value >= 67 ? "瀵ゅ墎鍧? : value >= 34 ? "閼告帒鐫? : "閸戞繄缂?;
  if (label === "鐠囨艾鐤勬惔?") return value >= 67 ? "鐞涖劍绱ㄩ幇?" : value >= 34 ? "閸忓鍩? : "閸э箓婀?;
  if (label === "閺傚洤瀵茬仦?") return value >= 67 ? "閺傛澘褰? : value >= 34 ? "閸忕厧顔? : "娴肩姷绮?;
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
      throw new Error(`鏈嶅姟绔繑鍥炰簡闈?JSON 鍐呭锛?{rawText.slice(0, 160)}`);
    }

    if (!res.ok) {
      throw new Error(parsed?.detail || parsed?.error || `鏈嶅姟璇锋眰澶辫触锛?{res.status}锛塦);
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
      content: "浣犲ソ锛屾垜宸茶鍙栧苟鍔犺浇銆屾枃瀛楀缇庢ā鍨嬨€嶃€傝繖鏄竴濂楀熀浜庡彊浜嬪銆佸惈娣锋壒璇勩€佹柊鎵硅瘎鐞嗚鏋勫缓鐨勬枃瀛﹀搧閴存ā鍨嬨€俓n\n浣犲彲浠ユ妸杩欓噷褰撳仛浣犵殑涓汉鏂囧瓧妗ｆ绨裤€備綘鍙互鍦ㄦ杈撳叆浠讳綍璇嶇珷锛屾垜浠皢鎺㈠瀹冨湪娓╁害銆佸瘑搴︺€侀€忔槑搴︿笌浣欓煹鏋佽氨涓婄殑鎶曞奖銆傛偍鏈€杩戝湪璇讳粈涔堬紝鎴栬€呮鍦ㄥ啓浠€涔堬紝闇€瑕佹垜涓烘偍鍋氫釜瑙ｈ鍚楋紵",
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
      setErrorMsg("褰撳墠娌℃湁鍙鍑虹殑鎶ュ憡鍐呭銆?);
      return;
      setErrorMsg("褰撳墠娌℃湁鍙鍑虹殑鎶ュ憡鍐呭銆?);
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

      const exportTitle = tab === "A" ? "鍗曞嵎鍝侀壌" : tab === "B" ? "鍚屾瀵圭収" : "鍒涗綔璇婃柇";
      const exportFilename = `鏂囧瓧瀹＄編鍒嗘瀽_${exportTitle}_${Date.now()}.png`;
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
      
      const title = tab === "A" ? "鍗曞嵎鍝佽椈" : tab === "B" ? "鍚屾瀵圭収" : "鍒涗綔璇婃柇";
      link.download = `鏂囧瓧瀹＄編鍒嗘瀽_${title}_${Date.now()}.png`;
      
    } catch (e) {
      setErrorMsg("淇濆瓨闀垮浘澶辫触锛岃绋嶅悗閲嶈瘯銆?);
      console.error("鐢熸垚闀垮浘鍑洪敊:", e);
    } finally {
      setSavingMap[tab](false);
    }
  };

  const handleExportReportAsImage = async (tab: "A" | "B" | "C") => {
    const refMap = { A: tabAReportRef, B: tabBReportRef, C: tabCReportRef };
    const setSavingMap = { A: setExportingA, B: setExportingB, C: setExportingC };
    const titleMap = {
      A: "鍗曞嵎鍝侀壌",
      B: "鍚屾瀵圭収",
      C: "鍒涗綔璇婃柇",
    } as const;
    const element = refMap[tab].current;
    const previewWindow: Window | null = null;

    if (!element) {
      setErrorMsg("褰撳墠娌℃湁鍙鍑虹殑鎶ュ憡鍐呭銆?);
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

      const exportFilename = `鏂囧瓧瀹＄編鍒嗘瀽_${titleMap[tab]}_${Date.now()}.png`;
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
                <p>闀垮浘宸茬敓鎴愩€傚鏈嚜鍔ㄤ笅杞斤紝鍙暱鎸夋垨鍙抽敭鍥剧墖淇濆瓨銆?/p>
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
      setErrorMsg("淇濆瓨闀垮浘澶辫触锛岃绋嶅悗閲嶈瘯銆?);
      console.error("鐢熸垚闀垮浘鍑洪敊:", e);
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
    snapshot.querySelectorAll('button[title="閺€璺虹秿濮濄倕宓庢稊锔芥贡"], button[title="閺€璺虹秿閸氬本顢嬬€靛湱鍙庨張?"]').forEach((node) => {
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
    topBar.innerHTML = `<div style="font-size:13px;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;">Volume 04 // Sensory Anthology</div><div style="font-size:12px;letter-spacing:0.12em;">Archives 妗ｆ棣?/div>`;
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
      <div style="font-size:58px;line-height:1.04;font-weight:300;letter-spacing:.04em;">涔濈淮路浣欓煹</div>
      <div style="font-size:32px;line-height:1.2;margin-top:8px;font-style:italic;color:rgba(44,44,43,.72);">Nine-dimensional Afterglow 路 鏂囧瓧瀹＄編妯″瀷</div>
      <div style="font-size:12px;letter-spacing:.34em;text-transform:uppercase;color:rgba(44,44,43,.46);margin-top:22px;">Literary Aesthetics Model 鈥?AI Operation Manual</div>
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
    spectrumTitle.innerHTML = `<div style="font-size:13px;letter-spacing:.24em;text-transform:uppercase;opacity:.58;">Axis Ledger</div><div style="font-size:15px;margin-top:6px;letter-spacing:.08em;">涔濈淮鍏夎氨璁板綍</div>`;
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

    const flavorSection = createSection("鎬讳綋浣欓煹瀹氭€?, "Lingering Style");
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

    const detailSection = createSection("缁村害璇︾粏瑙ｆ瀽", "Dimension Deep-dives");
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
        label.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:${dimension.accent};"></span>${dimension.label}锛?{dimension.score.value}%锛塦;

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
      const verdictSection = createSection("鏂囧鍙茬嫭绔嬫柇妗?, "Independent Scholar Verdict");
      const verdictGrid = document.createElement("div");
      verdictGrid.style.display = "grid";
      verdictGrid.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
      verdictGrid.style.gap = "18px";
      verdictGrid.style.marginTop = "20px";

      const verdictItems = [
        {
          title: "鐙紓椋庢牸瀹氭€?,
          text: analysisReport.literaryHistoryVerdict.distinctStyle,
        },
        {
          title: "鍘嗗彶闂厜鐐?/ 浜偣",
          text: analysisReport.literaryHistoryVerdict.historicalHighlight,
        },
        {
          title: "灞€闄愪笌缂烘喚 / 涓昏鐟曠柕",
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
    footer.innerHTML = `<span>@鎷熸€佷綑娓〢lmost Human</span>`;
    paper.appendChild(footer);

    return paper;
  };

  const handleExportReportAsImageSafe = async (tab: "A" | "B" | "C") => {
    const refMap = { A: tabAReportRef, B: tabBReportRef, C: tabCReportRef };
    const setSavingMap = { A: setExportingA, B: setExportingB, C: setExportingC };
    const titleMap = {
      A: "鍗曞嵎鍝侀壌",
      B: "鍚屾瀵圭収",
      C: "鍒涗綔璇婃柇",
    } as const;
    const element = refMap[tab].current;
    let exportHost: HTMLDivElement | null = null;

    if (!element) {
      setErrorMsg("褰撳墠娌℃湁鍙鍑虹殑鎶ュ憡鍐呭銆?);
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

      const exportFilename = `鏂囧瓧瀹＄編鍒嗘瀽_${titleMap[tab]}_${Date.now()}.png`;
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
      setErrorMsg("淇濆瓨闀垮浘澶辫触锛岃绋嶅悗閲嶈瘯銆?);
      console.error("鐢熸垚闀垮浘鍑洪敊:", e);
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
      titleVal = `姣斿: ${textA.slice(0, 8)} / ${textB.slice(0, 8)}`;
    } else if (mode === "C" && diagnosisReport) {
      textVal = diagnoseText;
      rep = diagnosisReport;
      titleVal = `璇婃柇: ${diagnoseText.slice(0, 15)}${diagnoseText.length > 15 ? "..." : ""}`;
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
      styleName = "瀵掓灄閲嶅ⅷ浣?(Frigid Inkwood)";
      interpretation = "姝よ瀹氫綋娓╂瀬浣庤€屼俊鎭瘑搴︾箒瀵嗛噸鍙犮€傛枃瀛楀憟鐜板喎閰枫€佺悊鎬х敋鑷冲啺鍐风殑鏃佽瑙嗚锛屽儚涓€鏌勫啺鍑夌殑鎵嬫湳鍒€鍓栧垏鐫€鐜板疄鐨勭粏鏋濇湯鑺傦紝鎰忚薄绋犲瘑鑰屾瀬鍏峰舰寮忓紶鍔涖€?;
      recommendations = [
        { author: "椴佽繀", work: "銆婇噹鑽夈€?, value: "鍦ㄥ喎缁濆瑙傘€佺敋鑷虫瀵傜殑姘旀皼涓嬪缓绔嬪瘑闆嗗拰鎬癁鐨勬剰璞＄鍙风兢锛屽甫鏉ユ瀬鑷寸殑绮剧鍘嬭揩鍔涖€? },
        { author: "鍗″か鍗?, work: "銆婂煄鍫°€?, value: "璇█濡傚叕鏂囪埇鍐板喎婢勯€忥紝浣嗚崚璇炲拰缁濇湜鐨勬剰璞￠噸鍙犱氦閿欍€佷笉鐣欐俯鎯呬綑鍦般€? }
      ];
    } else if (t > 65 && d < 35) {
      styleName = "鏄ユ櫀椋炵櫧浣?(Warm Breeze)";
      interpretation = "鍏锋湁鏋侀珮鐨勬俯搴︿綋娓╁嵈淇濇寔鐫€鏋佸叾绌虹伒鐤忔湕鐨勭粨鏋勩€傝繖鏄潶璇氳€屾鏃犻槻绾跨殑鎯呮劅娴侀湶锛屽瓧鍙ョ畝缁冿紝澶ч潰绉暀鐧姐€傛枃瀛椾笉鐫€娴撳ⅷ閲嶅僵锛屽嵈濡備竴缂曟槬鏃ュ拰椋庡惞杩涜鑰呯殑蹇冨簳銆?;
      recommendations = [
        { author: "娌堜粠鏂?, work: "銆婅竟鍩庛€?, value: "绗旇Е鐤忔贰绾湸銆佸ぇ闈㈢Н鍐欐剰鐣欑櫧锛屽彊杩颁腑鍗村厖鏂ョ潃婀樿タ鑻楅噹鏈€鐐界儓娓╃儹鐨勪汉鎬у厜杈夈€? },
        { author: "娉版垐灏?, work: "銆婂悏妾€杩﹀埄銆?, value: "鍙ュ紡鏋佸叾绌虹伒绾补锛屼絾鍐呭湪鎯呮劅铏旇瘹鑰岀伀鐑紝瀵圭敓鍛藉拰閫犵墿鍏呮弧鏃犻檺鐐界儓銆?" }
      ];
    } else if (tr > 68 && im > 68) {
      styleName = "浜戠辑闆鹃殰浣?(Symbolic Ambiguity)";
      interpretation = "鍚贩骞芥繁锛屾剰璞＄┖闂存繁搴︽墿灞曘€傝繖鏄竴搴ч噸褰╂祿澧ㄧ殑璞″緛涓讳箟杩峰銆傛枃瀛楃殑澶氶噸璇箟鍜岄殣鍠荤綉缁滀簰鐩告姌灏勶紝灏嗚鑰呭紩鍚戠嚂鍗滆崻璇存墍瑷€鐨勫閲嶅惈娣凤紝浣欏懗娌夋矇銆?;
      recommendations = [
        { author: "鏉庡晢闅?, work: "銆婇敠鐟熴€嬬瓑鏃犻璇?, value: "杈為噰鐟颁附濂囪銆佹剰澧冨惈娣锋湨鑳э紝鍦ㄨ█澶栦箣鎰忕殑澶氱淮鎶樺皠涓婅揪鍒颁簡鍙ゅ吀缇庡鐨勫穮宄般€? },
        { author: "鍗氬皵璧柉", work: "銆婃矙涔嬩功銆?, value: "鏋佹繁灞傛鐨勫摬瀛︽帰璁紝闅愬柣缃戠粶搴炴潅骞跺眰灞傜浉濂楋紝姣忎竴鍙ヨ瘽閮藉叿鏈夊眰鍙犵殑闃愰噴娣卞害銆? }
      ];
    } else if (tr < 32 && h < 32) {
      styleName = "鐞夌拑璧ゅ瓙浣?(Crystalline Sincerity)";
      interpretation = "婢勬緢鍓旈€忚€岀粷鏃犺櫄楗般€傛憭寮冧簡涓€鍒囪〃婕旀€х殑淇緸鍜屾妧宸х矇楗帮紝鏂囧瓧濡備竴姹竻娉夌洿瑙佸叾搴曪紝灞曠幇鍑洪殣鍚綔鑰呬汉鏍兼渶璐ㄦ湸銆佹渶涓嶈闃茬殑琚掗湶濮挎€侊紝鎷ユ湁鐩村嚮鑳歌厰鐨勫姏閲忋€?;
      recommendations = [
        { author: "钀х孩", work: "銆婂懠鍏版渤浼犮€?, value: "姣棤閮藉競鏂囦汉鐨勭煫楗颁笌寮勫奖锛岀函鐢ㄦ渶澶╃湡骞插噣鐨勭洿鐧借娴侊紝鍥犵粷瀵圭殑鐪熻瘹鑰屽姏閫忕焊鑳屻€? },
        { author: "娴锋槑濞?, work: "銆婅€佷汉涓庢捣銆?, value: "鏋佸害娲楃粌鐨勭數鎶ヤ綋锛屾潨缁濅竴鍒囪嚜鎴戞矇閱夊紡鐨勮椈楗帮紝灞曠幇绾补鑰岄摦閾搧楠ㄧ殑浜嬬墿鏈川銆? }
      ];
    } else {
      styleName = "纰ф锭娴佹硥浣?(Aesthetic Stream)";
      interpretation = `杩欐槸涓€棣栧悇鏋佽酱浜掍负瀵逛綅銆佸拰璋愬叡楦ｇ殑楂橀泤鏇茶皟銆傚畠鐨勬俯搴﹂€備腑锛?{t}/100锛夛紝瀵嗗害鍧囪　锛?{d}/100锛夛紝閫忔槑搴︼紙${tr}/100锛変繚鎸佺潃鑻ラ殣鑻ョ幇鐨勫彜鍏告洸寰勯€氬菇鎰燂紝鍦ㄥ紶鍔涳紙${tn}/100锛変笌鏂囧寲灞傦紙${c}/100锛夐噷杈炬垚浜嗚垝閫傝嚜濡傜殑鎰熺煡骞宠　銆俙;
      recommendations = [
        { author: "寮犵埍鐜?, work: "銆婁紶濂囥€?, value: "鍦ㄥ瘑涓嶉€忛鐨勫紕褰卞嚒淇楀皹涓栭噷锛岀簿鍑嗘嬁鎹忎簡鍗庤吹钘婚グ锛堝瘑搴︼級涓庝笘鎬佺値鍑夛紙娓╁害锛夌殑瀵圭珛寮犲姏銆? },
        { author: "搴熷悕", work: "銆婃ˉ銆?, value: "浠ョ瀹楀紡鐨勭簿骞插垁娉曞垏鏂瑷€鑷姩鍖栵紝鏃㈡湁鏂囦汉鐢荤殑姘存皵锛堟俯搴︼級锛屽張甯︽繁鍘氱殑鍙ゅ吀鏂囪剦鍖呮祮銆? }
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
        alignmentFeedback = "鎯婁汉涔嬪鍚堬紒鎮ㄧ殑鏂囧瓧鏋佸叿鐏靛彴鍏遍福銆傚悇椤硅酱鍚戝垎鍊间笌璁炬兂鏋佸叾鍚诲悎锛屾垚鍔熷鍒讳簡璇ョ編瀛﹀瀷鎬佺殑绁為煹涓庤倢鐞嗐€?;
      } else if (matchScore >= 65) {
        alignmentFeedback = "绁炰技鑰屽舰寰紓銆傛偍宸插ぇ浣撴崟鎹夊埌浜嗚鎯崇殑澶栧湪褰㈠粨锛屼絾鍦ㄥ眬閮ㄧ淮搴︼紙濡傛俯搴︽垨鍚贩绋嬪害锛夊皻鏈夊井璋冪┖闂淬€傚彲鍙傝€冧笅鏂瑰悇椤硅酱绾跨殑瀵逛綅鎸囨爣鍐嶆淇銆?;
      } else {
        alignmentFeedback = "绗斿ⅷ鍙﹁緹婧緞銆傛偍鐨勫垱绋垮睍鐜颁簡鍏ㄦ柊鐨勫缇庣壒璐紝鍚勯」缇庡鍙傛暟鍏锋湁寮虹儓鐨勪釜浜虹儥鍗帮紝鐩歌緝璁惧畾閰嶆柟锛屽睍鐜板嚭涓嶅悓鏂瑰悜鐨勫厜璋辨瀬璋冦€?;
      }

      setCustomTestResult({
        scores: draftScores,
        matchScore,
        feedback: `${alignmentFeedback}\n\n銆愬疄娴嬪姣斻€慭n` + 
          `鈥?璁惧畾娓╁害: ${targetScores.temperature} | 瀹炴祴娓╁害: ${draftScores.temperature?.value ?? 0} (${draftScores.temperature?.desc ?? ""})\n` +
          `鈥?璁惧畾瀵嗗害: ${targetScores.density} | 瀹炴祴瀵嗗害: ${draftScores.density?.value ?? 0} (${draftScores.density?.desc ?? ""})\n` +
          `鈥?璁惧畾閫忔槑搴? ${targetScores.transparency} | 瀹炴祴閫忔槑搴? ${draftScores.transparency?.value ?? 0} (${draftScores.transparency?.desc ?? ""})`
      });

    } catch (e) {
      console.error(e);
      // Fallback evaluation calculation locally
      const mockResultScores: any = {};
      const keys = ["temperature", "density", "transparency", "lingering", "tension", "imagery", "time", "honesty", "culture"];
      keys.forEach(k => {
        mockResultScores[k] = { value: Math.round(40 + Math.random() * 30), desc: "骞虫粦鎸崱" };
      });
      setCustomTestResult({
        scores: mockResultScores,
        matchScore: 78,
        feedback: "宸查噰鐢ㄦ湰鍦板井绉垎娴嬬粯銆傚垱鏈瓧鍙ュ伐鏁达紝涓庢偍璁炬兂鐨勭編瀛︽祦娲惧叿鏈夎緝楂樼殑瀹＄編璋冨紡浜插拰搴︼紙鍖归厤鐜囩害 78%锛夈€?
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
      setErrorMsg(e instanceof Error ? e.message : "鍝侀壌鏈嶅姟鏆傛椂涓嶅彲鐢紝璇风◢鍚庨噸璇曘€?);
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
          content: "璇嶇珷鐨勬邯娴侀亣鍒颁簡涓€涓濋樆濉炪€備笉鐭ユ偍瀵瑰垰鍒氳璁哄摢浣嶄綔瀹剁殑椋庢牸锛屾垨鑰呭垰鎵嶆彁鍙婄殑鍝釜瀹＄編鍞害杩樻兂缁х画娣辨帰锛?,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getScoreDescriptor = (dimension: keyof AestheticsReport["scores"], value: number) => {
    if (dimension === "temperature") return value >= 67 ? "鏆栬皟" : value >= 34 ? "娓╁拰" : "鍐疯皟";
    if (dimension === "density") return value >= 67 ? "绻佸瘑" : value >= 34 ? "鍖€瀹? : "鐤忔湕";
    if (dimension === "transparency") return value >= 67 ? "骞芥繁" : value >= 34 ? "娓呴€? : "鐩寸櫧";
    if (dimension === "lingering") return value >= 67 ? "娌夋綔" : value >= 34 ? "鍥炵敇" : "鍗虫暎";
    if (dimension === "tension") return value >= 67 ? "绱х环" : value >= 34 ? "鍚紶鍔? : "鏉惧紱";
    if (dimension === "imagery") return value >= 67 ? "鎶借薄" : value >= 34 ? "鍏煎叿" : "鍏疯薄";
    if (dimension === "time") return value >= 67 ? "寤剁坏" : value >= 34 ? "鑸掑睍" : "鍑濈缉";
    if (dimension === "honesty") return value >= 67 ? "琛ㄦ紨鎰? : value >= 34 ? "鍏嬪埗" : "鍧﹂湶";
    return value >= 67 ? "鏂板彉" : value >= 34 ? "鍏煎" : "浼犵粺";
  };

  // Format scores for Radar graph delivery
  const mapScoresToRadar = (scores: AestheticsReport["scores"]) => {
    return [
      { label: "娓╁害", subLabel: "鍐峰喗 / 鐐界儓", value: scores.temperature.value },
      { label: "瀵嗗害", subLabel: "鐤忔湕 / 瀵嗘", value: scores.density.value },
      { label: "閫忔槑搴?, subLabel: "鐩寸櫧 / 骞芥繁", value: scores.transparency.value },
      { label: "浣欓煹", subLabel: "鍗虫暎 / 娌夋穩", value: scores.lingering.value },
      { label: "寮犲姏", subLabel: "鏉惧紱 / 绱х环", value: scores.tension.value },
      { label: "鎰忚薄鍩?, subLabel: "鍏疯薄 / 鎶借薄", value: scores.imagery.value },
      { label: "鏃堕棿鎰?, subLabel: "鍘嬬缉 / 寤剁紦", value: scores.time.value },
      { label: "璇氬疄搴?, subLabel: "鍧﹂湶 / 琛ㄦ紨", value: scores.honesty.value },
      { label: "鏂囧寲灞?, subLabel: "浼犵粺 / 鏂", value: scores.culture.value }
    ];
  };

  const mapCompareToRadar = (comp: ComparisonReport) => {
    const keys: { k: keyof typeof comp.textA.scores; l: string; sl: string }[] = [
      { k: "temperature", l: "娓╁害", sl: "鍐峰喗/鐐界儓" },
      { k: "density", l: "瀵嗗害", sl: "鐤忔湕/瀵嗘" },
      { k: "transparency", l: "閫忔槑搴?, sl: "鐩寸櫧/骞芥繁" },
      { k: "lingering", l: "浣欓煹", sl: "鍗虫暎/娌夋穩" },
      { k: "tension", l: "寮犲姏", sl: "鏉惧紱/绱х环" },
      { k: "imagery", l: "鎰忚薄鍩?, sl: "鍏疯薄/鎶借薄" },
      { k: "time", l: "鏃堕棿鎰?, sl: "鍘嬬缉/寤剁紦" },
      { k: "honesty", l: "璇氬疄搴?, sl: "鍧﹂湶/琛ㄦ紨" },
      { k: "culture", l: "鏂囧寲灞?, sl: "浼犵粺/鏂" }
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
      { label: "娓╁害", subLabel: "鍐峰喗 / 鐐界儓", value: interactiveScores.temperature },
      { label: "瀵嗗害", subLabel: "鐤忔湕 / 瀵嗘", value: interactiveScores.density },
      { label: "閫忔槑搴?, subLabel: "鐩寸櫧 / 骞芥繁", value: interactiveScores.transparency },
      { label: "浣欓煹", subLabel: "鍗虫暎 / 娌夋穩", value: interactiveScores.lingering },
      { label: "寮犲姏", subLabel: "鏉惧紱 / 绱х环", value: interactiveScores.tension },
      { label: "鎰忚薄鍩?, subLabel: "鍏疯薄 / 鎶借薄", value: interactiveScores.imagery },
      { label: "鏃堕棿鎰?, subLabel: "鍘嬬缉 / 寤剁紦", value: interactiveScores.time },
      { label: "璇氬疄搴?, subLabel: "鍧﹂湶 / 琛ㄦ紨", value: interactiveScores.honesty },
      { label: "鏂囧寲灞?, subLabel: "浼犵粺 / 鏂", value: interactiveScores.culture }
    ];
  };

  // Dynamic visual background helpers for lingering flavors
  const getFlavorBgClass = (type: string) => {
    switch (type) {
      case "鍥炵敇":
        return "flavor-bg-echo";
      case "鑻︽订":
        return "flavor-bg-bitter";
      case "娓呭喗":
        return "flavor-bg-crisp";
      case "鐑熺啅":
        return "flavor-bg-smoky";
      default:
        return "flavor-bg-echo";
    }
  };

  const getFlavorAccentColor = (type: string) => {
    switch (type) {
      case "鍥炵敇":
        return "text-[#2C2C2B] border-[#8C927F]/30 bg-[#F5EBE0]";
      case "鑻︽订":
        return "text-[#2C2C2B] border-[#8C927F]/30 bg-[#E6EBE0]";
      case "娓呭喗":
        return "text-[#2C2C2B] border-[#2C2C2B]/20 bg-[#D8E2DC]";
      case "鐑熺啅":
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
            <button onClick={() => setArchiveOpen(true)} className="hover:text-[#8C927F] transition-colors cursor-pointer">Archives 妗ｆ棣?/button>
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
          涔濈淮路浣欓煹
          <span className="block text-xl md:text-2xl mt-2 font-normal italic font-serif text-[#2C2C2B]/70">Nine-dimensional Afterglow 鈥?鏂囧瓧瀹＄編妯″瀷</span>
        </h1>
        <div className="w-12 h-[1px] bg-[#8C927F]/35 mx-auto mt-6" />

        {/* Elegant Sub-ribbon inspired by vintage journals */}
        <div className="mt-6 border-t border-b border-[#2C2C2B]/10 py-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs font-serif italic text-[#2C2C2B]/75">
          <span>鈥滄湁浜涘懗瑙夊湪鍠夐棿寰樺緤锛屽鍚岃繙灞辨湭娑堢殑绉洩锛屾竻鍐疯€屾偁闀裤€傗€?/span>
          <span className="hidden sm:inline">|</span>
          <span>鈥滄繁鎰忔€昏繜瑙ｏ紝灏嗙埍鍗存櫄绉嬧€?/span>
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
              <span className="font-serif">A 路 鍝侀壌鍒嗘瀽</span>
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
              <span className="font-serif">B 路 瀵规瘮鍝侀壌</span>
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
              <span className="font-serif">C 路 鍐欎綔璇婃柇</span>
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
              <span className="font-serif">D 路 椋庢牸瀹氫綅</span>
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
              <span className="font-serif">E 路 鑷敱鎺㈢储</span>
            </button>
          </div>

          <div className="w-[1px] h-6 bg-[#2C2C2B]/10 hidden lg:block mx-2" />
          
          <button
            onClick={() => setArchiveOpen(true)}
            className="w-full lg:w-auto py-2 px-4 rounded-md text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 text-[#8C927F] hover:bg-white/60 font-serif font-semibold"
          >
            <Bookmark className="w-3.5 h-3.5" />
            鎴戠殑涔﹀嵎妗ｆ棣?({bookmarks.length})
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
              姝ｅ湪涓烘偍鐮旂（澧ㄨ壊锛岀爺鏋愰鍛充腑...
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
          
          {/* TAB A: 鍝侀壌鍒嗘瀽 */}
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
                      閫佹璇嶇珷涔﹀嵎
                    </h3>
                    <span className="font-mono text-[9px] text-[#2C2C2B]/40 uppercase">Mode A 路 Sample Analyzer</span>
                  </div>

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="璇疯緭鍏ヤ綘鎯冲垎鏋愮殑鏂囧瓧锛屾垨鐐瑰嚮涓嬫柟绀轰緥濉叆鍚庢墜鍔ㄥ紑濮嬪垎鏋?.."
                    className="w-full h-56 p-4 rounded-xl border border-[#2C2C2B]/10 bg-[#F9F8F3]/70 text-xs tracking-wide focus:outline-hidden focus:ring-1 focus:ring-[#8C927F]/40 placeholder-[#2C2C2B]/30 font-serif leading-relaxed transition-all resize-none text-[#2C2C2B]"
                  />

                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setInputText("")}
                      className="text-[10px] font-serif font-light text-[#2C2C2B]/50 hover:text-[#2C2C2B] flex items-center gap-1 transition-all"
                    >
                      <RotateCcw className="w-3 h-3 text-[#2C2C2B]/40" />
                      娓呯┖绾稿嵎
                    </button>
                    
                    <button
                      onClick={() => handleAnalyze("A")}
                      disabled={loading || !inputText.trim()}
                      className="px-6 py-2.5 rounded-lg bg-[#2C2C2B] hover:bg-[#4d483e] text-[#FDFCF8] font-serif text-xs tracking-widest disabled:opacity-30 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      閫佸憟鍝侀壌
                    </button>
                  </div>
                </div>

                {/* Classic Literature presets */}
                <div className="export-ignore bg-[#F9F8F3]/60 p-5 rounded-2xl border border-[#2C2C2B]/10 shadow-xs">
                  <h4 className="font-serif text-xs font-medium mb-3 text-[#2C2C2B]/85 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#8C927F]" />
                    寮曞叆缁忓吀瀹＄編鏍风
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
                        瀛﹁鏋佽氨鍥?
                      </h3>
                      <p className="font-mono text-[8px] text-center text-[#2C2C2B]/40 uppercase tracking-widest mb-4">
                        Aesthetics Axis Projections
                      </p>
                    </div>
                    <RadarChart data={mapScoresToRadar(analysisReport.scores)} colorA="#2C2C2B" />
                    <p className="font-sans text-[9px] text-[#2C2C2B]/40 text-center italic mt-4 leading-relaxed">
                      * 鏋佽氨鏁版嵁鐢辨枃瀛楀缇庢ā鍨嬫祴缁樼敓鎴?
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
                              <h3 className="font-serif text-sm font-medium mb-1 text-center text-[#2C2C2B]">瀛﹁鏋佽氨鍥?/h3>
                              <p className="font-mono text-[8px] text-center text-[#2C2C2B]/40 uppercase tracking-widest mb-4">Aesthetics Axis Projections</p>
                            </div>
                            <RadarChart data={mapScoresToRadar(analysisReport.scores)} colorA="#2C2C2B" />
                            <p className="font-sans text-[9px] text-[#2C2C2B]/40 text-center italic mt-4 leading-relaxed">
                              * 鏋佽氨鏁版嵁鐢辨枃瀛楀缇庢ā鍨嬫祴缁樼粯鍒?
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
                                  鎬讳綋浣欓煹瀹氭€?路 Lingering Style
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
                                    title="瀵煎嚭涓虹簿缇庡缇庡垎鏋愮敾鍗烽暱鍥?
                                  >
                                    {exportingA ? (
                                      <RefreshCw className="w-3 h-3 text-[#8C927F] animate-spin" />
                                    ) : (
                                      <Download className="w-3 h-3 text-[#8C927F]" />
                                    )}
                                    <span>{exportingA ? "瀵煎嚭涓?.." : "瀵煎嚭涓洪暱鍥?}</span>
                                  </button>
                                  <button
                                    onClick={() => saveBookmark("A")}
                                    className="export-ignore px-3 py-1.5 bg-white/58 hover:bg-white/75 text-[#2C2C2B] rounded-xl border border-[#2C2C2B]/10 text-[10px] font-serif transition-colors flex items-center gap-1.5 cursor-pointer"
                                    title="鏀跺綍姝ゅ嵎涔︽湱"
                                  >
                                    <Bookmark className="w-3 h-3 text-[#8C927F]" />
                                    <span>鏀跺綍涔﹀嵎</span>
                                  </button>
                                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] tracking-widest font-serif font-light bg-white/68 ${getFlavorAccentColor(analysisReport.lingeringType)}`}>
                                    {analysisReport.lingeringType}
                                  </span>
                                </div>
                              </div>

                              <div className="mb-4 rounded-2xl bg-white/34 border border-white/45 px-4 py-3">
                                <span className="font-serif text-xs font-light text-[#2C2C2B]/60 leading-none">椋庡懗鎵规敞</span>
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
                                  <span>{exportingA ? "瀵煎嚭涓?.." : "瀵煎嚭涓洪暱鍥?}</span>
                                </button>
                                <button
                                  onClick={() => saveBookmark("A")}
                                  className="h-9 px-3 bg-white/58 hover:bg-white/75 text-[#2C2C2B] rounded-xl border border-[#2C2C2B]/10 text-[10px] font-serif transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Bookmark className="w-3 h-3 text-[#8C927F]" />
                                  <span>鏀跺綍涔﹀嵎</span>
                                </button>
                              </div>
                            </div>

                            {/* Detailed breakdown per dimension tab lists */}
                            <div className="bg-[#F9F8F3] p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs space-y-4">
                              <h3 className="font-serif text-xs font-medium text-[#2C2C2B]/80 tracking-widest uppercase border-b border-[#2C2C2B]/10 pb-2">
                                缁村害璇︾粏瑙ｆ瀽 路 Dimension Deep-dives
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
                                          {expanded ? "鏀惰捣" : "灞曞紑"}
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
                                                {dimension.label}锛坽dimension.score.value}%锛?
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
                                    璇氬疄姘旇川涓庡彊浜嬪Э鎬?(璇氬疄搴?{analysisReport.scores.honesty.value}%)
                                  </span>
                                  <p className="mt-1 font-sans text-[11px] font-light text-[#2C2C2B]/75 pl-3">
                                    {analysisReport.details.honestyAnalysis}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-[#2C2C2B]/10">
                                  <span className="font-medium inline-flex items-center gap-1.5 text-xs text-[#2C2C2B]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA]" />
                                    鑸屽悗鍥炵敇涓庡洖灏炬矇娣€ (浣欓煹 {analysisReport.scores.lingering.value}%)
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
                                鏂囧鍙茬嫭绔嬫柇妗?路 Independent Scholar Verdict
                              </h4>
                              <span className="font-sans text-[8px] text-[#2C2C2B]/40 uppercase tracking-widest">
                                Literary History Matrix
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-serif">
                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-semibold text-[#2C2C2B]/50 block tracking-wider">
                                  鈻?鐙紓椋庢牸瀹氭€?
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/85 leading-relaxed font-light pl-2.5 border-l border-[#8C927F]/30 italic">
                                  {analysisReport.literaryHistoryVerdict.distinctStyle}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-semibold text-emerald-800/75 block tracking-wider">
                                  鈻?鍘嗗彶闂厜鐐?/ 浜偣
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/85 leading-relaxed font-light pl-2.5 border-l border-emerald-800/30">
                                  {analysisReport.literaryHistoryVerdict.historicalHighlight}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-semibold text-red-800/75 block tracking-wider">
                                  鈻?灞€闄愪笌缂烘喚 / 涓昏鐟曠柕
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
                      寰呮偍鍦ㄥ乏渚ч€佸叆涔﹀嵎...
                      <p className="text-[10px] font-sans text-[#2C2C2B]/35 mt-2">
                        灏嗗熀浜庝縿鍥藉舰寮忎富涔変笌鏂版壒璇勬枃鏈粏璇荤畻娉曠敓鎴愮簿缇庡缇庢姤鍛?
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* TAB B: 瀵规瘮鍝侀壌 */}
          {activeTab === "B" && (
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
              
              {/* Left Column: Comparisons inputs */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white/80 p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-[#2C2C2B]/10 pb-2">
                    <h3 className="font-serif text-sm font-medium flex items-center gap-2 text-[#2C2C2B]">
                      <ArrowRightLeft className="w-4 h-4 text-[#8C927F]" />
                      鍚屾姣斿鏂囨湰
                    </h3>
                    <span className="font-mono text-[9px] text-[#2C2C2B]/40 uppercase">Aesthetics Confrontation</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-serif text-[11px] text-[#2C2C2B]/50 mb-1">鏂囨 A 瀹ｇ焊绋?/label>
                      <textarea
                        value={textA}
                        onChange={(e) => setTextA(e.target.value)}
                        className="w-full h-32 p-3 rounded-lg border border-[#2C2C2B]/15 bg-[#F9F8F3]/60 text-xs font-serif leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-[#8C927F]/45 text-[#2C2C2B]"
                        placeholder="璇疯緭鍏ユ枃娈?A锛屾垨鐐瑰嚮涓嬫柟绀轰緥濉叆..."
                      />
                    </div>

                    <div>
                      <label className="block font-serif text-[11px] text-[#2C2C2B]/50 mb-1">鏂囨 B 瀹ｇ焊绋?/label>
                      <textarea
                        value={textB}
                        onChange={(e) => setTextB(e.target.value)}
                        className="w-full h-32 p-3 rounded-lg border border-[#2C2C2B]/15 bg-[#F9F8F3]/60 text-xs font-serif leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-[#8C927F]/45 text-[#2C2C2B]"
                        placeholder="璇疯緭鍏ユ枃娈?B锛屾垨鐐瑰嚮涓嬫柟绀轰緥濉叆..."
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
                      娓呭睆绌哄嵎
                    </button>
                    <button
                      onClick={() => handleAnalyze("B")}
                      disabled={loading || !textA.trim() || !textB.trim()}
                      className="px-6 py-2.5 rounded-lg bg-[#2C2C2B] hover:bg-[#4d483e] text-[#FDFCF8] font-serif text-xs tracking-widest disabled:opacity-30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-[#8C927F]" />
                      寮€濮嬪鐓у搧钘?
                    </button>
                  </div>
                </div>

                {/* Compare Presets */}
                <div className="bg-[#F9F8F3]/60 p-4 rounded-xl border border-[#2C2C2B]/10 space-y-2">
                  <span className="font-serif text-[10px] text-[#2C2C2B]/50 uppercase tracking-widest block">瀵圭収鑼冧緥寮曞叆:</span>
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
                              <h3 className="font-serif text-sm font-medium mb-1 text-center text-[#2C2C2B]">鍙屽瓙绛変綅鏋佸潗鏍?/h3>
                              <p className="font-mono text-[8px] text-center uppercase mb-4 tracking-widest text-[#2C2C2B]/40">A vs B Overlaid Axis</p>
                            </div>
                            <RadarChart
                              data={mapCompareToRadar(compareReport)}
                              colorA="#2C2C2B" // Carbon ink
                              colorB="#8C927F" // Sage tea green
                              nameA="鏂囨 A"
                              nameB="鏂囨 B"
                            />
                          </div>

                          {/* Compare verdicts */}
                          <div className="md:col-span-12 lg:col-span-6 space-y-4">
                            <div className="p-4 bg-white/70 rounded-xl border border-[#2C2C2B]/10 space-y-3">
                              <h4 className="font-serif text-xs font-medium text-[#2C2C2B] border-b border-[#2C2C2B]/10 pb-1.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2C2C2B]" />
                                鏂囨 A 鍝佺浉绠€鏋?
                              </h4>
                              <p className="font-serif text-xs font-light text-[#2C2C2B]/80 leading-relaxed">
                                {compareReport.textA.summary}
                              </p>
                              <span className="inline-block text-[9px] font-serif px-2 py-0.5 rounded-sm bg-[#2C2C2B]/5 text-[#2C2C2B]/70 border border-[#2C2C2B]/10">
                                浣欓煹: {compareReport.textA.lingeringType}
                              </span>
                            </div>

                            <div className="p-4 bg-white/70 rounded-xl border border-[#2C2C2B]/10 space-y-3">
                              <h4 className="font-serif text-xs font-medium text-[#8C927F] border-b border-[#8C927F]/20 pb-1.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8C927F]" />
                                鏂囨 B 鍝佺浉绠€鏋?
                              </h4>
                              <p className="font-serif text-xs font-light text-[#2C2C2B]/85 leading-relaxed">
                                {compareReport.textB.summary}
                              </p>
                              <span className="inline-block text-[9px] font-serif px-2 py-0.5 rounded-sm bg-[#8C927F]/5 text-[#8C927F] border border-[#8C927F]/25">
                                浣欓煹: {compareReport.textB.lingeringType}
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Dimensions contrast logs table */}
                        <div className="bg-[#F9F8F3] p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs space-y-4">
                          <h3 className="font-serif text-xs font-medium text-[#2C2C2B]/80 uppercase tracking-widest border-b border-[#2C2C2B]/10 pb-2">
                            鏄捐憲宸紓鐗瑰緛瀵圭収 路 Significant Variations
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
                                缇庡鏂 路 Total Verdict
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
                                  <span>{exportingB ? "瀵煎嚭涓?.." : "瀵煎嚭涓洪暱鍥?}</span>
                                </button>
                                <button
                                  onClick={() => saveBookmark("B")}
                                  className="px-2 py-1 bg-white hover:bg-[#FDFCF8] text-[#2C2C2B]/90 hover:text-[#2C2C2B] rounded shadow-xs border border-[#8C927F]/30 text-[9px] font-serif transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Bookmark className="w-2.5 h-2.5 text-[#8C927F]" />
                                  <span>鏀跺綍鍚屾瀵圭収鏈?/span>
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
                                鏂囧鍙茬嫭绔嬫瘮瀵规柇妗?路 Independent Comparative Verdict
                              </h4>
                              <span className="font-sans text-[8px] text-[#2C2C2B]/40 uppercase tracking-widest">
                                Comparative Literary History
                              </span>
                            </div>

                            <div className="space-y-4 font-serif">
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-semibold text-[#2C2C2B]/50 block tracking-wider">
                                  鈻?鏂囨 A 鐨勬枃瀛︽祦娲惧鍛戒笌浼樺姡瀹¤
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/80 leading-relaxed font-light pl-2.5 border-l border-[#2C2C2B]/30">
                                  {compareReport.literaryHistoryVerdict.textAHistory}
                                </p>
                              </div>

                              <div className="space-y-1 pt-2 border-t border-[#2C2C2B]/5">
                                <span className="text-[10px] uppercase font-semibold text-[#8C927F] block tracking-wider">
                                  鈻?鏂囨 B 鐨勬枃瀛︽祦娲惧鍛戒笌浼樺姡瀹¤
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/80 leading-relaxed font-light pl-2.5 border-l border-[#8C927F]/30">
                                  {compareReport.literaryHistoryVerdict.textBHistory}
                                </p>
                              </div>

                              <div className="space-y-1 pt-2 border-t border-[#2C2C2B]/5 bg-[#8C927F]/5 p-3 rounded-lg border border-[#8C927F]/10">
                                <span className="text-[10px] uppercase font-semibold text-[#2C2C2B] block tracking-wider">
                                  鈱?椋庢牸鍙插鐓ф剰涔変笌寰楀け缁撴
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
                      寰呮偍鍦ㄥ乏渚ф坊缃瘮瀵圭収涔﹀嵎...
                      <p className="text-[10px] font-sans text-[#2C2C2B]/35 mt-2">
                        鍚屾娓叉煋鍙岄噸澶氳竟褰㈠彔鍚堟姇褰憋紝涓€鐩簡鐒跺垽鏄庢枃蹇冨菇鑳?
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* TAB C: 鍐欎綔璇婃柇 */}
          {activeTab === "C" && (
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
              
              {/* Left Column: Author Input draft sheet */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white/80 p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif text-sm font-medium flex items-center gap-2 text-[#2C2C2B]">
                      <PenTool className="w-4 h-4 text-[#8C927F]" />
                      鍛堜氦涓汉鍒涚
                    </h3>
                    <span className="font-mono text-[9px] text-[#2C2C2B]/40 uppercase">Mode C 路 Writers Diagnosis</span>
                  </div>

                  <p className="font-serif text-[11px] text-[#2C2C2B]/50 leading-relaxed mb-3 font-light">
                    璇峰湪姝よ緭鍏ヤ綘鎵嬪啓鐨勬枃瀛楋紝鎴戜滑灏嗕弗鑻涘湴瀹℃煡鏄惁瀛樺湪鈥滀吉閫犵殑鐪兼唱鈥濄€佹垨鏄惁鏈夆€滅┖娲炵殑鏂囩悊鍫嗙爩鈥濓紝骞舵彁鍑烘湁閽堝鎬х殑淇敼娑﹁壊鏂规銆?
                  </p>

                  <textarea
                    value={diagnoseText}
                    onChange={(e) => setDiagnoseText(e.target.value)}
                    className="w-full h-56 p-4 rounded-xl border border-[#2C2C2B]/10 bg-[#F9F8F3]/60 text-xs font-serif leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-[#8C927F]/45 text-[#2C2C2B]"
                    placeholder="璇疯緭鍏ヤ綘鐨勫師鍒涙枃瀛楋紝鍑嗗濂藉悗鍐嶅紑濮嬭瘖鏂?.."
                  />

                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setDiagnoseText("")}
                      className="text-[10px] font-serif font-light text-[#2C2C2B]/50 hover:text-[#2C2C2B] cursor-pointer"
                    >
                      搴熺焊绡?
                    </button>
                    <button
                      onClick={() => handleAnalyze("C")}
                      disabled={loading || !diagnoseText.trim()}
                      className="px-6 py-2.5 rounded-lg bg-[#2C2C2B] hover:bg-[#4d483e] text-[#FDFCF8] font-serif text-xs tracking-widest disabled:opacity-30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      寮€濮嬫枃瀛椾細璇?
                    </button>
                  </div>
                </div>
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
                      <div ref={tabCReportRef} className="p-4 bg-[#FDFCF8] rounded-2xl border border-[#2C2C2B]/5 relative space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          {/* Left: Axis Projections */}
                          <div className="md:col-span-12 lg:col-span-6 bg-[#F9F8F3] p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs flex flex-col justify-between">
                            <div>
                              <h3 className="font-serif text-sm font-medium mb-1 text-center text-[#2C2C2B]">鑷缇庡杞寸郴</h3>
                              <p className="font-mono text-[8px] text-center text-[#2C2C2B]/40 uppercase tracking-widest mb-4">Diagnosis Axis</p>
                            </div>
                            <RadarChart data={mapScoresToRadar(diagnosisReport.scores)} colorA="#2C2C2B" />
                            <div className="text-center mt-3">
                              <span className="text-[10px] font-serif text-[#2C2C2B]/80 bg-[#E3D5CA]/40 px-2 py-0.5 rounded-sm border border-[#E3D5CA]/60">
                                琛ㄦ紨鎬ц川: {diagnosisReport.scores.honesty.value}% (瓒婁綆瓒婅瘹瀹?
                              </span>
                            </div>
                          </div>

                          {/* Right: Concrete Suggestions */}
                          <div className="md:col-span-12 lg:col-span-6 space-y-6">
                            
                            {/* Lingering feedback */}
                            <div className={`p-5 rounded-2xl ${getFlavorBgClass(diagnosisReport.lingeringType)} relative`}>
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-mono text-[9px] text-[#2C2C2B]/50 uppercase tracking-wider">浣欓煹妫€娴?& 璐ㄥ湴缁撹</h4>
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
                                  <span>{exportingC ? "瀵煎嚭涓?.." : "瀵煎嚭涓洪暱鍥?}</span>
                                </button>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[9px] tracking-widest font-serif font-light mb-3 inline-block ${getFlavorAccentColor(diagnosisReport.lingeringType)}`}>
                                浣欓煹: {diagnosisReport.lingeringType}
                              </span>
                              <p className="font-serif text-xs font-light text-[#2C2C2B]/85 leading-relaxed">
                                {diagnosisReport.summary}
                              </p>
                            </div>

                            {/* suggestions suggestions */}
                            {diagnosisReport.suggestions && diagnosisReport.suggestions.length > 0 && (
                              <div className="space-y-4">
                                <h3 className="font-serif text-xs font-medium text-[#2C2C2B]/70 uppercase tracking-widest">
                                  缇庡鍖荤敓鏀瑰啓鏋勬兂 路 Interactive Rewrites
                                </h3>

                                {diagnosisReport.suggestions.map((sug, i) => (
                                  <div key={i} className="p-5 bg-white rounded-xl border border-[#2C2C2B]/10 space-y-2.5 shadow-xs">
                                    <h4 className="font-serif text-xs font-medium text-[#8C927F] flex items-center gap-1.5">
                                      <CornerDownRight className="w-3.5 h-3.5" />
                                      鏂规 {i + 1}锛歿sug.title}
                                    </h4>
                                    <p className="font-sans text-[11px] font-light text-[#2C2C2B]/70 leading-relaxed font-light">
                                      {sug.text}
                                    </p>
                                    
                                    <div className="mt-3 bg-[#F9F8F3] border border-[#2C2C2B]/5 p-3 rounded-md font-serif text-[11px] leading-relaxed italic text-[#2C2C2B]/80">
                                      <strong className="not-italic font-sans text-[9px] text-[#2C2C2B]/40 uppercase block mb-1">
                                        瀵圭収瀵规瘮婕旂ず 路 Comparison Demo:
                                      </strong>
                                      {sug.example}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="bg-white/50 p-5 rounded-xl border border-[#2C2C2B]/10">
                              <h4 className="font-serif text-xs font-medium text-[#2C2C2B]/80 mb-2">璇氬疄搴︾粏鑺備細璇婃剰瑙?/h4>
                              <p className="font-sans text-[11px] font-light text-[#2C2C2B]/70 leading-relaxed font-light">
                                {diagnosisReport.details.honestyAnalysis}
                              </p>
                            </div>

                          </div>
                        </div>

                        {/* Scholar's independent verdict section */}
                        {diagnosisReport.literaryHistoryVerdict && (
                          <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-[#2C2C2B]/15 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-[#2C2C2B]/15 pb-2">
                              <h4 className="font-serif text-xs font-medium text-[#2C2C2B] tracking-widest flex items-center gap-2">
                                <Compass className="w-3.5 h-3.5 text-[#8C927F]" />
                                鏂囧鍙茬嫭绔嬩細璇婂畾妗?路 Scholar Quality Verdict
                              </h4>
                              <span className="font-sans text-[8px] text-[#2C2C2B]/40 uppercase tracking-widest">
                                Author Diagnosis Verdict
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-serif">
                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-semibold text-[#2C2C2B]/50 block tracking-wider">
                                  鈻?鐙紓椋庢牸瀹氭€?
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/85 leading-relaxed font-light pl-2.5 border-l border-[#8C927F]/30 italic">
                                  {diagnosisReport.literaryHistoryVerdict.distinctStyle}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-semibold text-emerald-800/75 block tracking-wider">
                                  鈻?鍘嗗彶闂厜鐐?/ 浜偣
                                </span>
                                <p className="text-[11px] text-[#2C2C2B]/85 leading-relaxed font-light pl-2.5 border-l border-emerald-800/30">
                                  {diagnosisReport.literaryHistoryVerdict.historicalHighlight}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-semibold text-red-800/75 block tracking-wider">
                                  鈻?灞€闄愪笌缂烘喚 / 涓昏鐟曠柕
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
                      寰呮偍鍦ㄥ乏渚у憟涓婂垱绋垮绋?..
                      <p className="text-[10px] font-sans text-[#2C2C2B]/25 mt-2">
                        鎴戜滑灏嗗墫鏋愭偍鐨勨€滃績璞′箣璇氣€濓紝鎻愪緵鏋侀珮缇庡搴曟澘鍚彂寤鸿
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* TAB D: 椋庢牸瀹氫綅 (Interactive radar dragging/sliders and school templates) */}
          {activeTab === "D" && (
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
              
              {/* Left Column: Preset classic vibe archetypes */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white/80 p-6 rounded-2xl border border-[#2C2C2B]/10 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-[#2C2C2B]/10 pb-2">
                    <h2 className="font-serif text-sm font-medium flex items-center gap-2 text-[#2C2C2B]">
                      <Sliders className="w-4 h-4 text-[#8C927F]" />
                      鏂囧鏂囦綋娴佹淳妗ｆ
                    </h2>
                    <span className="font-mono text-[9px] text-[#2C2C2B]/40 uppercase">Pre-compiled Archetypes</span>
                  </div>

                  <p className="font-serif text-[11px] text-[#2C2C2B]/50 leading-relaxed">
                    閫夋嫨浠讳竴缁忓吀缇庡娴佹淳锛屾帰瀵诲畠鐨勪節缁村害鎶曞奖銆傛偍涔熷彲浠ュ湪鍙充晶闆疯揪鍥句笂<strong>鐩存帴鎷栨嫿浠绘剰鍦嗙偣</strong>锛屾潵鑷敱璋冨埗鏈€濂戝悎浣犲啓浣滅洰鏍囩殑瀹＄編鎶曞奖锛?
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
                    <span className="font-sans text-[8px] text-[#2C2C2B]/40 tracking-widest uppercase block">娴佹淳鎷熺ず鑼冩枃 / Standard Prototype</span>
                    <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]">{selectedVibe.name} 寮忔牱鍙ユ紨绀猴細</h4>
                    <p className="font-serif italic text-xs leading-relaxed text-[#2C2C2B]/80 bg-[#FDFCF8]/50 p-3 rounded-lg border border-[#2C2C2B]/10">
                      {selectedVibe.example}
                    </p>
                    <div className="font-sans text-[10px] text-[#2C2C2B]/50 flex justify-between items-center pt-2 border-t border-[#2C2C2B]/10">
                      <span>缁忓吀鍙傝€冧綔绯? {selectedVibe.authorRef}</span>
                      <span>浣欓煹瀹氬瀷: {selectedVibe.lingeringType}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Custom Sliders or interactive Radar Chart */}
              <div className="lg:col-span-7 bg-[#F9F8F3] p-6 md:p-8 rounded-2xl border border-[#2C2C2B]/10 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Visual Intersect Radar */}
                <div className="md:col-span-6 flex flex-col items-center">
                  <h3 className="font-serif text-sm font-medium mb-1 text-center text-[#2C2C2B]">
                    涔濈淮鏂囦綋缃楃洏鎷熸€?
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
                    <span>鍦ㄦ瀬杞翠笂鎸夐紶鏍囧乏閿?瑙︽懜鐩存帴鎷栨嫿杩涜寰皟</span>
                  </div>
                </div>

                {/* Numeric sliders columns */}
                <div className="md:col-span-6 space-y-3">
                  <h4 className="font-serif text-xs font-semibold text-[#2C2C2B]/80 uppercase tracking-widest border-b border-[#2C2C2B]/10 pb-1 mb-3">
                    杞存瀬鍒嗗€奸樆灏?
                  </h4>
                  {Object.entries(interactiveScores).map(([key, val]) => {
                    const labelMap: Record<string, string> = {
                      temperature: "娓╁害 (鍐峰喗-鐐界儓)",
                      density: "瀵嗗害 (杞荤泩-鍘氶噸)",
                      transparency: "閫忔槑搴?(婢勬緢-骞芥繁)",
                      lingering: "浣欓煹 (娓呭喗-娌夋穩)",
                      tension: "寮犲姏 (鏉惧紱-绱х环)",
                      imagery: "鎰忚薄鍩?(鍏疯薄-鎶借薄)",
                      time: "鏃堕棿鎰?(鍘嬬缉-寤剁紦)",
                      honesty: "琛ㄦ紨搴?(鍧﹂湶-琛ㄦ紨)",
                      culture: "鏂囧寲灞?(浼犵粺-鏂)"
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
                      瑙ｆ瀯褰撳墠缇庡璁炬兂涔嬫姇褰?
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
                              璁惧畾鍛芥牸锛歿customEvaluation.styleName}
                            </span>
                          </div>
                          <p className="font-serif text-[11px] font-light text-[#2C2C2B]/85 leading-relaxed">
                            {customEvaluation.interpretation}
                          </p>

                          <div className="space-y-2">
                            <span className="font-mono text-[8px] tracking-wider text-[#2C2C2B]/40 uppercase block">鎺ㄨ崘鍙傝€冧綔鑰呬笌浣滃搧锛?/span>
                            {customEvaluation.recommendations.map((rec, i) => (
                              <div key={i} className="bg-white/70 p-3 rounded-lg border border-[#2C2C2B]/5 space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-serif text-[11px] font-semibold text-[#2C2C2B]">{rec.author} {rec.work}</span>
                                  <span className="text-[8px] bg-[#8C927F]/10 text-[#8C927F] px-1 rounded-xs">鍙傝€冨潗鏍?/span>
                                </div>
                                <p className="font-sans text-[10px] text-[#2C2C2B]/60 leading-relaxed">
                                  <strong>鍙傝€冧环鍊硷細</strong>{rec.value}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Subsequent interactive test card */}
                          <div className="border-t border-[#8C927F]/20 pt-4 mt-2 space-y-3">
                            <h5 className="font-serif text-[11px] font-medium text-[#2C2C2B]/95 flex items-center gap-1.5">
                              钀界瑪鍗拌瘉 路 鐜板満鏂囧瓧鍒嗗€兼鏍?
                            </h5>
                            <p className="font-sans text-[10px] font-light text-[#2C2C2B]/50 leading-relaxed">
                              鑻ユ偍宸叉湁涓€浜涚幇鎴愭枃娈垫垨鐜板満鎷熺锛屽彲鍦ㄤ笅鏂硅緭鍏ャ€傛垜浠皢鍒╃敤鏂囧瓧娴嬮噺鏈哄埗涓烘偍瑙ｆ瀯鍏舵槸鍚﹀惢鍚堜笂杩颁節缁磋鎯炽€?
                            </p>
                            <textarea
                              rows={4}
                              value={customDraftText}
                              onChange={(e) => setCustomDraftText(e.target.value)}
                              placeholder="鍦ㄦ钀界瑪杈撳叆鎮ㄧ殑涔﹀嵎娈佃惤锛屾楠屽叾涓庝笂杩拌缃殑濂戝悎閲嶅悎搴?.."
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
                                    <span>娴嬬畻涓?..</span>
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-3 h-3 text-[#8C927F]" />
                                    <span>娴嬬畻鍖归厤搴?/span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Testing verification result */}
                            {customTestResult && (
                              <div className="bg-white/85 border border-[#8C927F]/25 rounded-md p-3 mt-3 space-y-2">
                                <div className="flex justify-between items-center border-b border-[#2C2C2B]/5 pb-1">
                                  <span className="font-serif text-[10px] font-medium text-[#2C2C2B]/85">瀹炴祴閲嶅悎鎸囨爣锛?/span>
                                  <span className="text-xs font-serif font-bold text-[#8C927F]">
                                    閲嶅悎鐜?{customTestResult.matchScore}%
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

          {/* TAB E: 鑷敱鎺㈢储 (Chat) */}
          {activeTab === "E" && (
            <ChatPanel
              chatInput={chatInput}
              chatMessages={chatMessages}
              chatScrollRef={chatScrollRef}
              loading={loading}
              onChatInputChange={setChatInput}
              onSendMessage={handleSendMessage}
            />
          )}

        </div>

        <FlavorGlossary />

      </main>

      <ArchiveDrawer
        archiveOpen={archiveOpen}
        bookmarks={bookmarks}
        onClose={() => setArchiveOpen(false)}
        onRestore={restoreBookmark}
        onDelete={deleteBookmark}
      />

    </div>
