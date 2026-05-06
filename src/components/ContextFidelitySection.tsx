import { CheckCircle2, AlertTriangle, XCircle, Lightbulb, Quote } from 'lucide-react';
import { DEMO_CONTEXT_FIDELITY } from '../data/demoContextFidelity';
import type { ContextFidelityLevel } from '../types';

const LEVEL_CONFIG: Record<
  ContextFidelityLevel,
  { label: string; icon: typeof CheckCircle2; badge: string; text: string; bg: string }
> = {
  adequate: {
    label: '충분',
    icon: CheckCircle2,
    badge: 'bg-gh-green/15 text-gh-green border-gh-green/30',
    text: 'text-gh-green',
    bg: '',
  },
  weak: {
    label: '미흡',
    icon: AlertTriangle,
    badge: 'bg-gh-yellow/15 text-gh-yellow border-gh-yellow/30',
    text: 'text-gh-yellow',
    bg: 'bg-gh-yellow/5',
  },
  missing: {
    label: '누락',
    icon: XCircle,
    badge: 'bg-gh-red/15 text-gh-red border-gh-red/30',
    text: 'text-gh-red',
    bg: 'bg-gh-red/5',
  },
};

function getGradeInfo(score: number): { color: string; message: string } {
  if (score >= 80) return { color: 'text-gh-green', message: '맥락 방어 충분' };
  if (score >= 65) return { color: 'text-gh-green', message: '대체로 충실한 맥락' };
  if (score >= 50) return { color: 'text-gh-yellow', message: '일부 방어 논거 미흡' };
  return { color: 'text-gh-red', message: '맥락 보완 필요' };
}

export function ContextFidelitySection() {
  const data = DEMO_CONTEXT_FIDELITY;
  const grade = getGradeInfo(data.overallScore);

  return (
    <div className="p-4 bg-gh-bg rounded-xl border border-gh-border space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gh-text">맥락 충실도</h3>
          <p className="text-xs text-gh-text-muted mt-0.5">
            발표에서 요구되는 방법론적 방어와 맥락 설명이 얼마나 충실히 제공되었는지를 나타냅니다
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 flex-wrap justify-end">
          <span className={`text-3xl font-black ${grade.color}`}>{data.overallScore}%</span>
          <div className="flex flex-col gap-1 items-end">
            {data.missingCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gh-red/15 text-gh-red border border-gh-red/30">
                누락 {data.missingCount}건
              </span>
            )}
            {data.weakCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gh-yellow/15 text-gh-yellow border border-gh-yellow/30">
                미흡 {data.weakCount}건
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

      {/* Item list */}
      <div className="space-y-2.5">
        {data.items.map((item) => {
          const cfg = LEVEL_CONFIG[item.level];
          const Icon = cfg.icon;

          return (
            <div
              key={item.id}
              className={`rounded-lg border border-gh-border overflow-hidden ${cfg.bg}`}
            >
              {/* Item header */}
              <div className="flex items-center gap-3 px-4 py-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${cfg.text}`} />
                <span className="flex-1 text-sm font-semibold text-gh-text">{item.category}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${cfg.badge}`}
                >
                  {cfg.label}
                </span>
              </div>

              {/* Body */}
              <div className="px-4 pb-3 space-y-2 border-t border-gh-border">
                <div className="pt-2 space-y-1">
                  <p className="text-xs font-semibold text-gh-text-muted">필요한 설명</p>
                  <p className="text-xs text-gh-text leading-relaxed">{item.requirement}</p>
                </div>

                {item.whatWasProvided && (
                  <div className="flex items-start gap-1.5">
                    <Quote className="w-3 h-3 text-gh-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-gh-text italic leading-relaxed">
                      {item.whatWasProvided}
                    </p>
                  </div>
                )}

                <div
                  className={`rounded-lg px-3 py-2 flex items-start gap-2 ${
                    item.level === 'missing'
                      ? 'bg-gh-red/10 border border-gh-red/20'
                      : item.level === 'weak'
                        ? 'bg-gh-yellow/10 border border-gh-yellow/20'
                        : 'bg-gh-green/10 border border-gh-green/20'
                  }`}
                >
                  <Lightbulb className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${cfg.text}`} />
                  <p className={`text-xs leading-relaxed ${cfg.text}`}>{item.suggestion}</p>
                </div>
              </div>
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
