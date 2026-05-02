import { useState, useCallback } from 'react';
import type { Slide, SlidePoint, SpeechSegment, AlignmentResult, AnalysisReport } from '../types';

function normalizeKorean(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣0-9.%]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractNumbers(text: string): string[] {
  const matches = text.match(/\d+(?:\.\d+)?%?억?만?천?원?달러?/g) || [];
  return matches.map(m => m.replace(/[^0-9.%]/g, ''));
}

function extractKeyTerms(text: string): string[] {
  const normalized = normalizeKorean(text);
  const stopwords = new Set([
    '의', '가', '이', '은', '는', '을', '를', '에', '에서', '와', '과', 
    '도', '로', '으로', '하다', '있다', '되다', '것', '수', '등', '및',
    '그', '저', '이런', '저런', '그런', '대한', '통해', '위해', '대해',
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'to', 'of', 
    'in', 'for', 'on', 'with', 'at', 'by', 'from', 'and', 'or'
  ]);
  
  return normalized
    .split(' ')
    .filter(word => word.length > 1 && !stopwords.has(word));
}

function calculateMatchScore(pointText: string, speechText: string): {
  score: number;
  keywordMatches: string[];
  numberMatch: boolean;
} {
  const pointTerms = extractKeyTerms(pointText);
  const speechTerms = extractKeyTerms(speechText);
  const pointNumbers = extractNumbers(pointText);
  const speechNumbers = extractNumbers(speechText);
  
  const pointSet = new Set(pointTerms);
  const speechSet = new Set(speechTerms);
  
  const matchedKeywords: string[] = [];
  pointTerms.forEach(term => {
    if (speechSet.has(term)) {
      matchedKeywords.push(term);
    } else {
      for (const speechTerm of speechTerms) {
        if (speechTerm.includes(term) || term.includes(speechTerm)) {
          matchedKeywords.push(term);
          break;
        }
      }
    }
  });

  const numberMatch = pointNumbers.length === 0 || 
    pointNumbers.some(pn => speechNumbers.some(sn => sn.includes(pn) || pn.includes(sn)));

  let score = 0;
  if (pointTerms.length > 0) {
    score = matchedKeywords.length / pointTerms.length;
  }

  if (numberMatch && pointNumbers.length > 0) {
    score = Math.min(1, score + 0.3);
  }

  return { score, keywordMatches: matchedKeywords, numberMatch };
}

export function useSSAAnalysis(slides: Slide[]) {
  const [alignments, setAlignments] = useState<AlignmentResult[]>([]);

  const analyzeAlignment = useCallback((segments: SpeechSegment[]): AlignmentResult[] => {
    const allSpeechText = segments.map(s => s.text).join(' ');
    const results: AlignmentResult[] = [];

    for (const slide of slides) {
      for (const point of slide.points) {
        let bestScore = 0;
        let bestSegmentId: string | undefined;
        let hasNumberMatch = false;

        for (const segment of segments) {
          const { score, numberMatch } = calculateMatchScore(point.text, segment.text);
          if (score > bestScore) {
            bestScore = score;
            bestSegmentId = segment.id;
            hasNumberMatch = numberMatch;
          }
        }

        const { score: fullScore, numberMatch: fullNumberMatch } = 
          calculateMatchScore(point.text, allSpeechText);
        
        if (fullScore > bestScore) {
          bestScore = fullScore;
          hasNumberMatch = fullNumberMatch;
        }

        let status: AlignmentResult['status'] = 'missed';
        
        if (bestScore >= 0.5) {
          if (hasNumberMatch || !extractNumbers(point.text).length) {
            status = 'covered';
          } else {
            status = 'contradicted';
          }
        } else if (bestScore >= 0.25) {
          status = 'partial';
        }

        results.push({
          pointId: point.id,
          slideId: slide.id,
          status,
          speechSegmentId: bestSegmentId,
          matchConfidence: bestScore,
        });
      }
    }

    return results;
  }, [slides]);

  const updateAlignments = useCallback((segments: SpeechSegment[]) => {
    const results = analyzeAlignment(segments);
    setAlignments(results);
    return results;
  }, [analyzeAlignment]);

  const getSlidesCoverage = useCallback((): Map<string, { 
    covered: string[]; 
    missed: string[]; 
    partial: string[];
    coveragePercent: number;
  }> => {
    const coverage = new Map();
    
    for (const slide of slides) {
      const slideCoverage = { 
        covered: [] as string[], 
        missed: [] as string[], 
        partial: [] as string[],
        coveragePercent: 0
      };
      
      for (const point of slide.points) {
        const alignment = alignments.find(a => a.pointId === point.id);
        
        if (!alignment || alignment.status === 'missed') {
          slideCoverage.missed.push(point.id);
        } else if (alignment.status === 'covered') {
          slideCoverage.covered.push(point.id);
        } else {
          slideCoverage.partial.push(point.id);
        }
      }
      
      if (slide.points.length > 0) {
        const coveredWeight = slideCoverage.covered.length * 1;
        const partialWeight = slideCoverage.partial.length * 0.5;
        slideCoverage.coveragePercent = 
          ((coveredWeight + partialWeight) / slide.points.length) * 100;
      }
      
      coverage.set(slide.id, slideCoverage);
    }
    
    return coverage;
  }, [slides, alignments]);

  const generateReport = useCallback((): AnalysisReport => {
    const coverage = getSlidesCoverage();
    let totalPoints = 0;
    let coveredPoints = 0;
    let missedPoints = 0;
    let partialPoints = 0;
    let contradictions = 0;
    const criticalMisses: SlidePoint[] = [];
    const slideBreakdown: AnalysisReport['slideBreakdown'] = [];

    for (const slide of slides) {
      const slideCov = coverage.get(slide.id)!;
      totalPoints += slide.points.length;
      coveredPoints += slideCov.covered.length;
      missedPoints += slideCov.missed.length;
      partialPoints += slideCov.partial.length;
      
      const missed = slide.points.filter(p => slideCov.missed.includes(p.id));
      const covered = slide.points.filter(p => 
        slideCov.covered.includes(p.id) || slideCov.partial.includes(p.id)
      );
      
      missed.filter(p => p.importance === 'critical').forEach(p => criticalMisses.push(p));
      
      contradictions += alignments.filter(
        a => a.slideId === slide.id && a.status === 'contradicted'
      ).length;

      slideBreakdown.push({
        slideId: slide.id,
        slideNumber: slide.number,
        title: slide.title,
        coverage: slideCov.coveragePercent,
        missed,
        covered,
      });
    }

    const suggestions: string[] = [];
    
    if (criticalMisses.length > 0) {
      suggestions.push(
        `필수 포인트 ${criticalMisses.length}개 누락: "${criticalMisses[0].text.slice(0, 40)}..." 등`
      );
    }
    
    const lowCoverageSlides = slideBreakdown.filter(s => s.coverage < 50);
    if (lowCoverageSlides.length > 0) {
      suggestions.push(
        `슬라이드 ${lowCoverageSlides.map(s => s.slideNumber).join(', ')}번의 커버리지가 50% 미만입니다.`
      );
    }
    
    if (contradictions > 0) {
      suggestions.push(
        `숫자/데이터가 슬라이드와 다르게 말한 부분이 ${contradictions}건 있습니다.`
      );
    }

    if (suggestions.length === 0 && totalPoints > 0) {
      const overallCoverage = (coveredPoints / totalPoints) * 100;
      if (overallCoverage >= 80) {
        suggestions.push('훌륭합니다! 대부분의 핵심 포인트를 잘 설명하셨습니다.');
      } else if (overallCoverage >= 60) {
        suggestions.push('좋습니다! 몇 가지 포인트를 더 강조하면 완벽해집니다.');
      }
    }

    return {
      totalPoints,
      coveredPoints,
      missedPoints,
      partialPoints,
      contradictions,
      coveragePercent: totalPoints > 0 ? (coveredPoints / totalPoints) * 100 : 0,
      slideBreakdown,
      suggestions,
      criticalMisses,
    };
  }, [slides, alignments, getSlidesCoverage]);

  return {
    alignments,
    updateAlignments,
    getSlidesCoverage,
    generateReport,
  };
}
