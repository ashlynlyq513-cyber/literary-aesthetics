export interface DimensionScore {
  value: number;
  desc: string;
}

export type LingeringType = "回甘" | "苦涩" | "清冽" | "烟熏";

export interface AestheticsModelScores {
  temperature: DimensionScore;
  density: DimensionScore;
  transparency: DimensionScore;
  lingering: DimensionScore;
  tension: DimensionScore;
  imagery: DimensionScore;
  time: DimensionScore;
  honesty: DimensionScore;
  culture: DimensionScore;
}

export interface Suggestion {
  title: string;
  text: string;
  example: string;
}

export interface AestheticsReport {
  scores: AestheticsModelScores;
  lingeringType: LingeringType;
  tags: string[];
  summary: string;
  details: {
    temperatureAnalysis: string;
    densityAnalysis: string;
    transparencyAnalysis: string;
    lingeringAnalysis: string;
    tensionAnalysis: string;
    imageryAnalysis: string;
    timeAnalysis: string;
    honestyAnalysis: string;
    cultureAnalysis: string;
    deviationAnalysis?: string;
  };
  suggestions?: Suggestion[];
  literaryHistoryVerdict?: {
    distinctStyle: string;
    historicalHighlight: string;
    criticalDefect: string;
  };
}

export interface ComparisonDimension {
  dimension: string;
  valueA: number;
  valueB: number;
  desc: string;
}

export interface ComparisonReport {
  textA: {
    name: string;
    scores: {
      temperature: number;
      density: number;
      transparency: number;
      lingering: number;
      tension: number;
      imagery: number;
      time: number;
      honesty: number;
      culture: number;
    };
    lingeringType: LingeringType;
    summary: string;
  };
  textB: {
    name: string;
    scores: {
      temperature: number;
      density: number;
      transparency: number;
      lingering: number;
      tension: number;
      imagery: number;
      time: number;
      honesty: number;
      culture: number;
    };
    lingeringType: LingeringType;
    summary: string;
  };
  comparison: ComparisonDimension[];
  finalVerdict: string;
  literaryHistoryVerdict?: {
    textAHistory: string;
    textBHistory: string;
    comparativeSignificance: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: Date;
}
