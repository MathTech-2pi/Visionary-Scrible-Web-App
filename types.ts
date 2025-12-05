export enum CreativeStyle {
  Simple = 'Simple & Descriptive',
  Complex = 'Complex & Analytical',
  Poetic = 'Poetic & Abstract',
  Caption = 'Social Media Caption',
}

export type VariationCount = number;

export interface AnalysisResult {
  tags: string[];
  colors: string[];
  visualDetails: string;
  creativeOutputs: CreativeOutput[];
}

export interface CreativeOutput {
  content: string;
}

export interface SearchResult {
  url: string;
  title: string;
  source: string;
}

export interface AppState {
  theme: 'light' | 'dark';
  step: 'input' | 'processing' | 'results';
  imageUrl: string;
  imageSource: string | null; // The source URL or 'Direct Upload'
  imageDataBase64: string | null;
  style: CreativeStyle;
  variationCount: VariationCount;
  customInstruction: string;
  result: AnalysisResult | null;
  error: string | null;
}
