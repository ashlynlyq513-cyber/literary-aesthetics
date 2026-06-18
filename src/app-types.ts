import type { AestheticsReport, ComparisonReport } from "./types";

export interface BookmarkItem {
  id: string;
  title: string;
  text: string;
  textB?: string;
  mode: "A" | "B" | "C";
  timestamp: string;
  report?: AestheticsReport | null;
  compareReport?: ComparisonReport | null;
}
