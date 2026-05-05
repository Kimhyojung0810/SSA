export interface PresentationContext {
  type: 'pitch' | 'lecture' | 'defense' | 'meeting';
  audience: 'investors' | 'general' | 'experts' | 'academic';
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
}
