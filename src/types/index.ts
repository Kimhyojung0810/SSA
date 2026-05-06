export interface PresentationContext {
  type: string;
  audience: string;
  timeLimitMinutes: number;
}

export type SolarVerdict =
  | 'covered'
  | 'justified_omission'
  | 'critical_missing'
  | 'logical_inconsistency'
  | 'over_explanation';

export interface SlideTimingRecord {
  slideId: string;
  slideNumber: number;
  recommendedSeconds: number;
  actualSeconds?: number;
}

export interface SlidePoint {
  id: string;
  text: string;
  importance: 'critical' | 'important' | 'supporting';
  keywords: string[];
}

export interface Slide {
  id: string;
  number: number;
  title: string;
  content?: string;
  imageUrl?: string;
  points: SlidePoint[];
  coveragePercent: number;
  coveredPoints: string[];
  missedPoints: string[];
}

export interface SpeechSegment {
  id: string;
  text: string;
  timestamp: number;
  startMs?: number;
  endMs?: number;
  slideId?: string;
  matchedPointIds: string[];
  confidence: number;
}

export interface AlignmentResult {
  pointId: string;
  slideId: string;
  status: 'covered' | 'missed' | 'partial' | 'contradicted';
  speechSegmentId?: string;
  matchConfidence: number;
  feedback?: string;
  solarVerdict?: SolarVerdict;
  solarFeedback?: string;
}

export interface PresentationSession {
  id: string;
  startTime: number;
  endTime?: number;
  slides: Slide[];
  speechSegments: SpeechSegment[];
  alignments: AlignmentResult[];
  currentSlideIndex: number;
  overallCoverage: number;
  isRecording: boolean;
}

export type TimeStatus = 'over' | 'ok' | 'under' | 'skipped';

export interface SlideTimingDetail {
  slideNumber: number;
  slideTitle: string;
  actualSeconds: number;
  recommendedSeconds: number;
  status: TimeStatus;
  coreContentCoverage: number;
  overReason?: string;
  underReason?: string;
  suggestion: string;
}

export interface TimeConsistencyData {
  totalActualSeconds: number;
  totalRecommendedSeconds: number;
  overallScore: number;
  overCount: number;
  underCount: number;
  skippedCount: number;
  slides: SlideTimingDetail[];
  redistributionSummary: string;
  verdict: string;
}

export type ContextFidelityLevel = 'adequate' | 'weak' | 'missing';

export interface ContextFidelityItem {
  id: string;
  category: string;
  requirement: string;
  whatWasProvided?: string;
  level: ContextFidelityLevel;
  suggestion: string;
}

export interface ContextFidelityData {
  overallScore: number;
  missingCount: number;
  weakCount: number;
  items: ContextFidelityItem[];
  verdict: string;
}

export type GapLevel = 'none' | 'minor' | 'major';

export interface SlideAlignmentRecord {
  slideNumber: number;
  slideTitle: string;
  alignmentScore: number;
  gap: GapLevel;
  slideKeyPoint: string;
  whatWasSaid: string;
  gapReason?: string;
}

export interface SlideAlignmentData {
  overallScore: number;
  majorGapCount: number;
  records: SlideAlignmentRecord[];
  verdict: string;
}

export type FlowStatus = 'delivered' | 'partial' | 'missed';

export interface FlowSection {
  id: string;
  label: string;
  keyMessage: string;
  status: FlowStatus;
  coverage: number;
  speechEvidence?: string;
}

export interface KeyDeliveryData {
  overallRate: number;
  verdict: string;
  sections: FlowSection[];
}

export interface QAAnswer {
  qaId: string;
  question: string;
  userAnswer: string;
  answeredVia: 'text' | 'voice';
  checkpoint: string;
}

export type QAReadinessStatus = 'strong' | 'partial' | 'weak';

export interface QAReadinessItem {
  qaId: string;
  question: string;
  userAnswer: string;
  answeredVia: 'text' | 'voice';
  checkpoint: string;
  expectedQuestionType: string;
  slideRef: string;
  score: number;
  status: QAReadinessStatus;
  coveredCriteria: string[];
  missingCriteria: string[];
  suggestion: string;
}

export interface QAReadinessData {
  overallScore: number;
  answeredCount: number;
  expectedCount: number;
  strongCount: number;
  partialCount: number;
  weakCount: number;
  items: QAReadinessItem[];
  verdict: string;
}

export interface AnalysisReport {
  totalPoints: number;
  coveredPoints: number;
  missedPoints: number;
  partialPoints: number;
  contradictions: number;
  coveragePercent: number;
  slideBreakdown: {
    slideId: string;
    slideNumber: number;
    title: string;
    coverage: number;
    missed: SlidePoint[];
    covered: SlidePoint[];
  }[];
  suggestions: string[];
  criticalMisses: SlidePoint[];
  qaAnswers?: QAAnswer[];
}
