import { 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Target,
  Award,
  X
} from 'lucide-react';
import { useState } from 'react';
import type { AnalysisReport as ReportType, SlideTimingRecord, SolarVerdict } from '../types';

interface AnalysisReportProps {
  report: ReportType;
  timingRecords?: SlideTimingRecord[];
  isEvaluating?: boolean;
  onClose: () => void;
  onRestart?: () => void;
}

const VERDICT_LABELS: Record<SolarVerdict, { label: string; color: string }> = {
  covered:               { label: '커버됨',      color: 'bg-gh-green/20 text-gh-green' },
  justified_omission:    { label: '합리적 생략', color: 'bg-gh-text-muted/20 text-gh-text-muted' },
  critical_missing:      { label: '핵심 누락',   color: 'bg-gh-red/20 text-gh-red' },
  logical_inconsistency: { label: '논리 모순',   color: 'bg-gh-yellow/20 text-gh-yellow' },
  over_explanation:      { label: '과잉 설명',   color: 'bg-gh-yellow/10 text-gh-yellow' },
};

export function AnalysisReport({ report, timingRecords = [], isEvaluating = false, onClose, onRestart }: AnalysisReportProps) {
  const [expandedSlides, setExpandedSlides] = useState<Set<string>>(new Set());

  const toggleSlide = (slideId: string) => {
    const next = new Set(expandedSlides);
    if (next.has(slideId)) {
      next.delete(slideId);
    } else {
      next.add(slideId);
    }
    setExpandedSlides(next);
  };

  const getGrade = (percent: number) => {
    if (percent >= 90) return { grade: 'A+', color: 'text-gh-green', bg: 'bg-gh-green/20', border: 'border-gh-green/50', message: '완벽한 발표!' };
    if (percent >= 80) return { grade: 'A', color: 'text-gh-green', bg: 'bg-gh-green/20', border: 'border-gh-green/50', message: '훌륭합니다!' };
    if (percent >= 70) return { grade: 'B+', color: 'text-gh-green', bg: 'bg-gh-green/20', border: 'border-gh-green/50', message: '좋은 발표입니다' };
    if (percent >= 60) return { grade: 'B', color: 'text-gh-yellow', bg: 'bg-gh-yellow/20', border: 'border-gh-yellow/50', message: '조금만 더!' };
    if (percent >= 50) return { grade: 'C', color: 'text-gh-yellow', bg: 'bg-gh-yellow/20', border: 'border-gh-yellow/50', message: '개선이 필요합니다' };
    return { grade: 'D', color: 'text-gh-red', bg: 'bg-gh-red/20', border: 'border-gh-red/50', message: '핵심 포인트를 놓치고 있습니다' };
  };

  const overallCoverage = report.totalPoints > 0 
    ? Math.round((report.coveredPoints / report.totalPoints) * 100)
    : 0;
  
  const gradeInfo = getGrade(overallCoverage);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gh-bg-secondary border border-gh-border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gh-border bg-gh-bg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gh-accent/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-gh-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gh-text">발표 분석 리포트</h2>
              <p className="text-xs text-gh-text-muted">SSA 정합성 분석 결과</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-gh-border hover:bg-gh-border transition-colors"
          >
            <X className="w-5 h-5 text-gh-text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className={`flex items-center gap-6 p-6 rounded-xl border-2 ${gradeInfo.bg} ${gradeInfo.border}`}>
            <div className="flex flex-col items-center">
              <div className={`w-24 h-24 rounded-full border-4 ${gradeInfo.border} ${gradeInfo.bg} flex items-center justify-center`}>
                <span className={`text-4xl font-black ${gradeInfo.color}`}>{gradeInfo.grade}</span>
              </div>
              <Award className={`w-6 h-6 mt-2 ${gradeInfo.color}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5 text-gh-text-muted" />
                <span className="text-gh-text-muted text-sm">전체 커버리지</span>
              </div>
              <div className={`text-5xl font-black ${gradeInfo.color} mb-2`}>
                {overallCoverage}%
              </div>
              <p className={`text-sm ${gradeInfo.color}`}>{gradeInfo.message}</p>
              <div className="w-full bg-gh-border rounded-full h-3 mt-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    overallCoverage >= 70 ? 'bg-gh-green' : 
                    overallCoverage >= 50 ? 'bg-gh-yellow' : 'bg-gh-red'
                  }`}
                  style={{ width: `${overallCoverage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-gh-bg rounded-xl border border-gh-border text-center">
              <div className="text-3xl font-bold text-gh-text">{report.totalPoints}</div>
              <div className="text-xs text-gh-text-muted mt-1">전체 포인트</div>
            </div>
            <div className="p-4 bg-gh-green/10 rounded-xl border border-gh-green/30 text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-gh-green" />
                <span className="text-3xl font-bold text-gh-green">{report.coveredPoints}</span>
              </div>
              <div className="text-xs text-gh-text-muted mt-1">설명 완료</div>
            </div>
            <div className="p-4 bg-gh-red/10 rounded-xl border border-gh-red/30 text-center">
              <div className="flex items-center justify-center gap-2">
                <XCircle className="w-5 h-5 text-gh-red" />
                <span className="text-3xl font-bold text-gh-red">{report.missedPoints}</span>
              </div>
              <div className="text-xs text-gh-text-muted mt-1">누락</div>
            </div>
            <div className="p-4 bg-gh-yellow/10 rounded-xl border border-gh-yellow/30 text-center">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5 text-gh-yellow" />
                <span className="text-3xl font-bold text-gh-yellow">{report.partialPoints}</span>
              </div>
              <div className="text-xs text-gh-text-muted mt-1">부분 언급</div>
            </div>
          </div>

          {report.criticalMisses.length > 0 && (
            <div className="p-4 bg-gh-red/10 rounded-xl border border-gh-red/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-gh-red" />
                <span className="font-bold text-gh-red">놓친 필수 포인트</span>
                <span className="px-2 py-0.5 bg-gh-red/20 text-gh-red text-xs rounded-full">
                  {report.criticalMisses.length}개
                </span>
              </div>
              <ul className="space-y-2">
                {report.criticalMisses.map((point) => (
                  <li key={point.id} className="text-gh-text text-sm flex items-start gap-2 p-2 bg-gh-bg/50 rounded-lg">
                    <XCircle className="w-4 h-4 text-gh-red flex-shrink-0 mt-0.5" />
                    <span>{point.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.suggestions.length > 0 && (
            <div className="p-4 bg-gh-accent/10 rounded-xl border border-gh-accent/30">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-gh-accent" />
                <span className="font-bold text-gh-accent">개선 제안</span>
              </div>
              <ul className="space-y-2">
                {report.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-gh-text text-sm flex items-start gap-2">
                    <span className="text-gh-accent font-bold">→</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(timingRecords.length > 0 || isEvaluating) && (
            <div className="p-4 bg-gh-bg rounded-xl border border-gh-border">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-gh-text-muted" />
                <span className="font-bold text-gh-text">시간 배분 분석</span>
                {isEvaluating && (
                  <span className="text-xs text-gh-text-muted animate-pulse ml-auto">AI 분석 중...</span>
                )}
              </div>
              {timingRecords.length > 0 && (
                <div className="space-y-2">
                  {timingRecords.map(rec => {
                    const maxSec = Math.max(rec.recommendedSeconds, rec.actualSeconds ?? 0, 1);
                    const recPct = Math.round((rec.recommendedSeconds / maxSec) * 100);
                    const actPct = rec.actualSeconds != null
                      ? Math.round((rec.actualSeconds / maxSec) * 100)
                      : null;
                    return (
                      <div key={rec.slideId}>
                        <div className="flex items-center justify-between text-xs text-gh-text-muted mb-1">
                          <span>슬라이드 {rec.slideNumber}</span>
                          <span>
                            권장 {rec.recommendedSeconds}s
                            {rec.actualSeconds != null && ` / 실제 ${rec.actualSeconds}s`}
                          </span>
                        </div>
                        <div className="relative h-3 bg-gh-border rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gh-accent/40 rounded-full"
                            style={{ width: `${recPct}%` }}
                          />
                          {actPct != null && (
                            <div
                              className={`absolute inset-y-0 left-0 rounded-full opacity-80 ${
                                actPct > recPct ? 'bg-gh-yellow' : 'bg-gh-green'
                              }`}
                              style={{ width: `${actPct}%` }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gh-text-muted">
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-gh-accent/40" /> 권장</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-gh-green" /> 실제 (적정)</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-gh-yellow" /> 실제 (초과)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gh-text-muted" />
              <span className="font-bold text-gh-text">슬라이드별 상세 분석</span>
            </div>
            <div className="space-y-2">
              {report.slideBreakdown.map((slide) => {
                const isExpanded = expandedSlides.has(slide.slideId);
                const coverageColor = slide.coverage >= 70 ? 'text-gh-green' : 
                                       slide.coverage >= 50 ? 'text-gh-yellow' : 'text-gh-red';
                const coverageBarColor = slide.coverage >= 70 ? 'bg-gh-green' : 
                                          slide.coverage >= 50 ? 'bg-gh-yellow' : 'bg-gh-red';
                
                return (
                  <div key={slide.slideId} className="bg-gh-bg rounded-xl border border-gh-border overflow-hidden">
                    <button
                      onClick={() => toggleSlide(slide.slideId)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gh-border/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-gh-accent/20 flex items-center justify-center text-sm font-bold text-gh-accent">
                          {slide.slideNumber}
                        </span>
                        <span className="text-gh-text font-medium">{slide.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gh-border rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${coverageBarColor}`}
                              style={{ width: `${slide.coverage}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold w-12 text-right ${coverageColor}`}>
                            {Math.round(slide.coverage)}%
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gh-text-muted" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gh-text-muted" />
                        )}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-gh-border space-y-3">
                        {slide.covered.length > 0 && (
                          <div>
                            <div className="text-sm text-gh-green mb-2 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="font-medium">설명 완료 ({slide.covered.length})</span>
                            </div>
                            <ul className="space-y-1 pl-6">
                              {slide.covered.map(point => {
                                const verdict = (point as any).solarVerdict as SolarVerdict | undefined;
                                const vInfo = verdict ? VERDICT_LABELS[verdict] : undefined;
                                return (
                                  <li key={point.id} className="text-sm text-gh-text-muted list-disc">
                                    <span className="mr-2">{point.text}</span>
                                    {vInfo && (
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${vInfo.color}`}>{vInfo.label}</span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                        {slide.missed.length > 0 && (
                          <div>
                            <div className="text-sm text-gh-red mb-2 flex items-center gap-2">
                              <XCircle className="w-4 h-4" />
                              <span className="font-medium">누락됨 ({slide.missed.length})</span>
                            </div>
                            <ul className="space-y-1 pl-6">
                              {slide.missed.map(point => (
                                <li key={point.id} className="text-sm text-gh-text-muted list-disc">
                                  {point.text}
                                  {point.importance === 'critical' && (
                                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-gh-red/20 text-gh-red rounded">필수</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {slide.covered.length === 0 && slide.missed.length === 0 && (
                          <p className="text-sm text-gh-text-muted italic">이 슬라이드에는 체크포인트가 없습니다.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gh-border bg-gh-bg flex flex-col gap-3 sm:flex-row sm:justify-end">
          {onRestart && (
            <button
              onClick={onRestart}
              className="px-4 py-3 border border-gh-border text-gh-text-muted rounded-lg font-semibold hover:bg-gh-border hover:text-gh-text transition-colors"
            >
              처음부터 다시 시작
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-3 bg-gh-accent text-white rounded-lg font-semibold hover:bg-gh-accent/90 transition-colors"
          >
            연습으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
