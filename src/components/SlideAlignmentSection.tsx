import { CheckCircle2, AlertTriangle, XOctagon, ChevronDown, ChevronUp, Quote } from 'lucide-react';
import { useState } from 'react';
import { DEMO_SLIDE_ALIGNMENT } from '../data/demoSlideAlignment';
import type { GapLevel } from '../types';

const GAP_CONFIG: Record<
  GapLevel,
  { label: string; icon: typeof CheckCircle2; bar: string; badge: string; text: string; highlight: string }
> = {
  none: {
    label: '정합',
    icon: CheckCircle2,
    bar: 'bg-gh-green',
    badge: 'bg-gh-green/15 text-gh-green border-gh-green/30',
    text: 'text-gh-green',
    highlight: '',
  },
  minor: {
    label: '경미한 이탈',
    icon: AlertTriangle,
    bar: 'bg-gh-yellow',
    badge: 'bg-gh-yellow/15 text-gh-yellow border-gh-yellow/30',
    text: 'text-gh-yellow',
    highlight: '',
  },
  major: {
    label: '⚠ 큰 이탈',
    icon: XOctagon,
    bar: 'bg-gh-red',
    badge: 'bg-gh-red/15 text-gh-red border-gh-red/30',
    text: 'text-gh-red',
    highlight: 'border-l-2 border-l-gh-red',
  },
};

function getGradeInfo(score: number): { color: string; message: string } {
  if (score >= 80) return { color: 'text-gh-green', message: '높은 정합성' };
  if (score >= 65) return { color: 'text-gh-green', message: '전반적으로 정합함' };
  if (score >= 50) return { color: 'text-gh-yellow', message: '일부 이탈 구간 있음' };
  return { color: 'text-gh-red', message: '발화 방향 재점검 필요' };
}

export function SlideAlignmentSection() {
  const data = DEMO_SLIDE_ALIGNMENT;
  const grade = getGradeInfo(data.overallScore);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    () => new Set(data.records.filter((r) => r.gap === 'major').map((r) => r.slideNumber)),
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
          <h3 className="text-sm font-bold text-gh-text">슬라이드-발화 정합성</h3>
          <p className="text-xs text-gh-text-muted mt-0.5">
            슬라이드 내용과 발화 방향이 일치하는지, 이탈 구간은 어디인지를 나타냅니다
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 flex-wrap justify-end">
          <span className={`text-3xl font-black ${grade.color}`}>{data.overallScore}%</span>
          {data.majorGapCount > 0 && (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-gh-red/15 text-gh-red border border-gh-red/30">
              큰 이탈 {data.majorGapCount}곳
            </span>
          )}
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

      {/* Per-slide rows */}
      <div className="space-y-2">
        {data.records.map((rec) => {
          const cfg = GAP_CONFIG[rec.gap];
          const Icon = cfg.icon;
          const isExpanded = expandedIds.has(rec.slideNumber);

          return (
            <div
              key={rec.slideNumber}
              className={`rounded-lg border border-gh-border bg-gh-bg-secondary overflow-hidden ${cfg.highlight}`}
            >
              {/* Row header */}
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => toggle(rec.slideNumber)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gh-border/20 transition-colors text-left"
              >
                <Icon className={`w-4 h-4 shrink-0 ${cfg.text}`} />
                <span className="text-xs font-bold text-gh-text-muted w-14 shrink-0">
                  Slide {rec.slideNumber}
                </span>
                <span className="flex-1 text-sm font-semibold text-gh-text truncate">
                  {rec.slideTitle}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${cfg.badge}`}>
                  {cfg.label}
                </span>
                <div className="w-14 h-1.5 bg-gh-border rounded-full overflow-hidden shrink-0">
                  <div
                    className={`h-full rounded-full ${cfg.bar}`}
                    style={{ width: `${rec.alignmentScore}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-8 text-right shrink-0 ${cfg.text}`}>
                  {rec.alignmentScore}%
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gh-text-muted shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gh-text-muted shrink-0" />
                )}
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 space-y-2.5 border-t border-gh-border">
                  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gh-text-muted">슬라이드 핵심</p>
                      <p className="text-xs text-gh-text leading-relaxed">{rec.slideKeyPoint}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gh-text-muted">발표자 발화</p>
                      <div className="flex items-start gap-1.5">
                        <Quote className="w-3 h-3 text-gh-accent shrink-0 mt-0.5" />
                        <p className="text-xs text-gh-text italic leading-relaxed">{rec.whatWasSaid}</p>
                      </div>
                    </div>
                  </div>

                  {rec.gapReason && (
                    <div
                      className={`rounded-lg px-3 py-2.5 flex items-start gap-2 ${
                        rec.gap === 'major'
                          ? 'bg-gh-red/10 border border-gh-red/25'
                          : 'bg-gh-yellow/10 border border-gh-yellow/25'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${cfg.text}`} />
                      <p className={`text-xs leading-relaxed ${cfg.text}`}>{rec.gapReason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verdict */}
      <div className="rounded-lg bg-gh-accent/8 border border-gh-accent/20 px-4 py-3">
        <p className="text-xs text-gh-text leading-relaxed">{data.verdict}</p>
      </div>
    </div>
  );
}
