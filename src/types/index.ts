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
