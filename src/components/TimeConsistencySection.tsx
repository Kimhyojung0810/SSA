import { CheckCircle2, AlertTriangle, XOctagon, Clock, FastForward, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { DEMO_TIME_CONSISTENCY } from '../data/demoTimeConsistency';
import type { TimeStatus } from '../types';

const STATUS_CONFIG: Record<
  TimeStatus,
  { label: string; icon: typeof CheckCircle2; bar: string; badge: string; text: string; highlight: string }
> = {
  ok: {
    label: '적정',
    icon: CheckCircle2,
    bar: 'bg-gh-green',
    badge: 'bg-gh-green/15 text-gh-green border-gh-green/30',
    text: 'text-gh-green',
    highlight: '',
  },
  under: {
    label: '설명 부족',
    icon: AlertTriangle,
    bar: 'bg-gh-yellow',
    badge: 'bg-gh-yellow/15 text-gh-yellow border-gh-yellow/30',
    text: 'text-gh-yellow',
    highlight: '',
  },
  over: {
    label: '과잉 설명',
    icon: FastForward,
    bar: 'bg-gh-red',
    badge: 'bg-gh-red/15 text-gh-red border-gh-red/30',
    text: 'text-gh-red',
    highlight: 'border-l-2 border-l-gh-red',
  },
  skipped: {
    label: '⚠ 건너뜀',
    icon: XOctagon,
    bar: 'bg-gh-text-muted',
    badge: 'bg-gh-text-muted/20 text-gh-text-muted border-gh-text-muted/30',
    text: 'text-gh-text-muted',
    highlight: 'border-l-2 border-l-gh-text-muted',
  },
};

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}초`;
  return s === 0 ? `${m}분` : `${m}분 ${s}초`;
}

function getGradeInfo(score: number): { color: string; message: string } {
  if (score >= 80) return { color: 'text-gh-green', message: '시간 배분 우수' };
  if (score >= 65) return { color: 'text-gh-green', message: '대체로 균형 있는 배분' };
  if (score >= 50) return { color: 'text-gh-yellow', message: '일부 슬라이드 재조정 필요' };
  return { color: 'text-gh-red', message: '시간 재배분 필요' };
}

export function TimeConsistencySection() {
  const data = DEMO_TIME_CONSISTENCY;
  const grade = getGradeInfo(data.overallScore);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    () => new Set(data.slides.filter((s) => s.status === 'over' || s.status === 'skipped').map((s) => s.slideNumber)),
  );

  const toggle = (n: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  };

  return (
    <div className="p-4 bg-gh-bg rounded-xl border border-gh-border space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gh-text">시간 정합성</h3>
          <p className="text-xs text-gh-text-muted mt-0.5">
            핵심 내용 대비 실제 발표 시간이 적절하게 배분되었는지, 과잉·부족 구간은 어디인지를 나타냅니다
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 flex-wrap justify-end">
          <span className={`text-3xl font-black ${grade.color}`}>{data.overallScore}%</span>
          <div className="flex flex-col gap-1 items-end">
            {data.overCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gh-red/15 text-gh-red border border-gh-red/30">
                과잉 {data.overCount}곳
              </span>
            )}
            {data.skippedCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gh-text-muted/20 text-gh-text-muted border border-gh-text-muted/30">
                건너뜀 {data.skippedCount}곳
              </span>
            )}
            {data.underCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gh-yellow/15 text-gh-yellow border border-gh-yellow/30">
                부족 {data.underCount}곳
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Overall bar */}
      <div className="space-y-1">
        <div className="h-2.5 bg-gh-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              data.overallScore >= 65
                ? 'bg-gh-green'
                : data.overallScore >= 50
                  ? 'bg-gh-yellow'
                  : 'bg-gh-red'
            }`}
            style={{ width: `${data.overallScore}%` }}
          />
        </div>
        <p className={`text-xs font-semibold ${grade.color}`}>{grade.message}</p>
      </div>

      {/* Total time summary */}
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gh-bg-secondary border border-gh-border">
        <Clock className="w-4 h-4 text-gh-text-muted shrink-0" />
        <div className="flex items-center gap-2 text-xs text-gh-text-muted">
          <span>실제 총 시간</span>
          <span className="font-bold text-gh-text">{formatSeconds(data.totalActualSeconds)}</span>
          <span>/</span>
          <span>권장</span>
          <span className="font-bold text-gh-text">{formatSeconds(data.totalRecommendedSeconds)}</span>
        </div>
      </div>

      {/* Per-slide rows */}
      <div className="space-y-2">
        {data.slides.map((slide) => {
          const cfg = STATUS_CONFIG[slide.status];
          const Icon = cfg.icon;
          const isExpanded = expandedIds.has(slide.slideNumber);
          const isOver = slide.actualSeconds > slide.recommendedSeconds;

          return (
            <div
              key={slide.slideNumber}
              className={`rounded-lg border border-gh-border bg-gh-bg-secondary overflow-hidden ${cfg.highlight}`}
            >
              {/* Row header */}
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => toggle(slide.slideNumber)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gh-border/20 transition-colors text-left"
              >
                <Icon className={`w-4 h-4 shrink-0 ${cfg.text}`} />
                <span className="text-xs font-bold text-gh-text-muted w-14 shrink-0">
                  Slide {slide.slideNumber}
                </span>
                <span className="flex-1 text-sm font-semibold text-gh-text truncate">
                  {slide.slideTitle}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${cfg.badge}`}>
                  {cfg.label}
                </span>
                {/* Time comparison mini-bar */}
                <div className="w-20 shrink-0 space-y-0.5">
                  <div className="h-1.5 bg-gh-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cfg.bar}`}
                      style={{
                        width: `${Math.min((slide.actualSeconds / Math.max(slide.recommendedSeconds, 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gh-text-muted">
                    <span>{formatSeconds(slide.actualSeconds)}</span>
                    <span className="opacity-60">{formatSeconds(slide.recommendedSeconds)}</span>
                  </div>
                </div>
                <span className={`text-xs font-bold w-12 text-right shrink-0 ${isOver ? 'text-gh-red' : 'text-gh-yellow'}`}>
                  {isOver
                    ? `+${formatSeconds(slide.actualSeconds - slide.recommendedSeconds)}`
                    : `-${formatSeconds(slide.recommendedSeconds - slide.actualSeconds)}`}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gh-text-muted shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gh-text-muted shrink-0" />
                )}
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 space-y-3 border-t border-gh-border">
                  {/* Core coverage */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gh-text-muted shrink-0">핵심 커버리지</span>
                    <div className="flex-1 h-1.5 bg-gh-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          slide.coreContentCoverage >= 80
                            ? 'bg-gh-green'
                            : slide.coreContentCoverage >= 50
                              ? 'bg-gh-yellow'
                              : 'bg-gh-red'
                        }`}
                        style={{ width: `${slide.coreContentCoverage}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gh-text shrink-0">{slide.coreContentCoverage}%</span>
                  </div>

                  {/* Reason */}
                  {(slide.overReason || slide.underReason) && (
                    <div
                      className={`rounded-lg px-3 py-2.5 flex items-start gap-2 ${
                        slide.status === 'over'
                          ? 'bg-gh-red/10 border border-gh-red/25'
                          : slide.status === 'skipped'
                            ? 'bg-gh-text-muted/10 border border-gh-text-muted/25'
                            : 'bg-gh-yellow/10 border border-gh-yellow/25'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${cfg.text}`} />
                      <p className={`text-xs leading-relaxed ${cfg.text}`}>
                        {slide.overReason ?? slide.underReason}
                      </p>
                    </div>
                  )}

                  {/* Suggestion */}
                  <div className="rounded-lg px-3 py-2.5 flex items-start gap-2 bg-gh-accent/8 border border-gh-accent/20">
                    <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gh-accent" />
                    <p className="text-xs leading-relaxed text-gh-text">{slide.suggestion}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Redistribution summary */}
      <div className="rounded-lg bg-gh-accent/5 border border-gh-accent/15 px-4 py-3 space-y-1">
        <p className="text-xs font-semibold text-gh-accent">시간 재배분 요약</p>
        <p className="text-xs text-gh-text leading-relaxed">{data.redistributionSummary}</p>
      </div>

      {/* Verdict */}
      <div className="rounded-lg bg-gh-accent/8 border border-gh-accent/20 px-4 py-3">
        <p className="text-xs text-gh-text leading-relaxed">{data.verdict}</p>
      </div>
    </div>
  );
}
