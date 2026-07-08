export interface TextElement {
  id: string;
  type: 'text';
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  letterSpacing: number;
  lineHeight: number;
  rotation: number;
  opacity: number;
  textShadow?: string;
}

export interface ImageElement {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  filter: string;
  borderRadius: number;
  objectFit: 'cover' | 'contain' | 'fill';
}

export interface ShapeElement {
  id: string;
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'star' | 'line' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  opacity: number;
  borderWidth: number;
  borderColor: string;
}

export interface IconElement {
  id: string;
  type: 'icon';
  iconName: string;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  opacity: number;
}

export type CanvasElement = TextElement | ImageElement | ShapeElement | IconElement;

export interface BrandKit {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  logo?: string;
}

export interface PostTemplate {
  id: string;
  name: string;
  category: 'viral' | 'professional' | 'trendy' | 'minimal';
  description: string;
  thumbnail: string;
  elements: CanvasElement[];
  backgroundColor: string;
  backgroundGradient?: string;
  bestFor: string[];
  engagementPrediction: number;
}

export interface ViralHeadline {
  text: string;
  engagement: number;
  category: string;
}

export interface CaptionSuggestion {
  text: string;
  hashtags: string[];
  engagement: number;
}

export interface ColorPalette {
  name: string;
  colors: string[];
  mood: string;
}

export interface PerformanceMetrics {
  engagement: number;
  reach: number;
  saves: number;
  shares: number;
  virality: number;
  suggestions: string[];
}

export interface AIContentRequest {
  topic?: string;
  tone?: 'professional' | 'casual' | 'inspirational' | 'urgent';
  target?: string;
  keywords?: string[];
}

export interface GeneratedContent {
  headlines: string[];
  captions: string[];
  hashtags: string[];
  quotes: string[];
}

export type ExportFormat = 'png' | 'jpg' | 'webp';
export type ExportQuality = 'high' | 'medium' | 'low';

export interface ExportSettings {
  format: ExportFormat;
  quality: ExportQuality;
  includeWatermark: boolean;
  watermarkText?: string;
}

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export interface HistoryState {
  elements: CanvasElement[];
  backgroundColor: string;
  timestamp: number;
}
