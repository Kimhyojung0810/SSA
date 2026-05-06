import { CheckCircle2, AlertCircle, XCircle, Quote } from 'lucide-react';
import { DEMO_KEY_DELIVERY } from '../data/demoKeyDelivery';
import type { FlowStatus } from '../types';

const STATUS_CONFIG: Record<
  FlowStatus,
  { label: string; icon: typeof CheckCircle2; bar: string; badge: string; text: string }
> = {
  delivered: {
    label: '전달',
    icon: CheckCircle2,
    bar: 'bg-gh-green',
    badge: 'bg-gh-green/15 text-gh-green border-gh-green/30',
    text: 'text-gh-green',
  },
  partial: {
    label: '부분',
    icon: AlertCircle,
    bar: 'bg-gh-yellow',
    badge: 'bg-gh-yellow/15 text-gh-yellow border-gh-yellow/30',
    text: 'text-gh-yellow',
  },
  missed: {
    label: '누락',
    icon: XCircle,
    bar: 'bg-gh-red',
    badge: 'bg-gh-red/15 text-gh-red border-gh-red/30',
    text: 'text-gh-red',
  },
};

function getGradeLabel(rate: number): { grade: string; color: string; message: string } {
  if (rate >= 85) return { grade: 'A', color: 'text-gh-green', message: '핵심 흐름 완전 전달' };
  if (rate >= 70) return { grade: 'B', color: 'text-gh-green', message: '주요 흐름 전달됨' };
  if (rate >= 55) return { grade: 'C', color: 'text-gh-yellow', message: '일부 흐름 누락' };
  return { grade: 'D', color: 'text-gh-red', message: '흐름 재구성 필요' };
}

export function KeyDeliverySection() {
  const data = DEMO_KEY_DELIVERY;
  const grade = getGradeLabel(data.overallRate);

  return (
    <div className="p-4 bg-gh-bg rounded-xl border border-gh-border space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gh-text">핵심 전달률</h3>
          <p className="text-xs text-gh-text-muted mt-0.5">
            발표의 전체 흐름이 얼마나 충실하게 전달되었는지를 나타냅니다
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className={`text-3xl font-black ${grade.color}`}>{data.overallRate}%</span>
          <span className={`text-lg font-bold ${grade.color}`}>{grade.grade}</span>
        </div>
      </div>

      {/* Overall bar */}
      <div className="space-y-1">
        <div className="h-2.5 bg-gh-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              data.overallRate >= 70
                ? 'bg-gh-green'
                : data.overallRate >= 55
                  ? 'bg-gh-yellow'
                  : 'bg-gh-red'
            }`}
            style={{ width: `${data.overallRate}%` }}
          />
        </div>
        <p className={`text-xs font-semibold ${grade.color}`}>{grade.message}</p>
      </div>

      {/* Section breakdown */}
      <div className="space-y-2.5">
        {data.sections.map((section) => {
          const cfg = STATUS_CONFIG[section.status];
          const Icon = cfg.icon;

          return (
            <div
              key={section.id}
              className="rounded-lg border border-gh-border bg-gh-bg-secondary overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${cfg.text}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gh-text">{section.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                      {cfg.label}{section.coverage > 0 ? ` ${section.coverage}%` : ''}
                    </span>
                  </div>
                </div>
                <div className="w-16 h-1.5 bg-gh-border rounded-full overflow-hidden shrink-0">
                  <div
                    className={`h-full rounded-full ${cfg.bar}`}
                    style={{ width: `${section.coverage}%` }}
                  />
                </div>
              </div>

              <div className="px-4 pb-2.5 space-y-2">
                <p className="text-xs text-gh-text-muted leading-relaxed">{section.keyMessage}</p>
                {section.speechEvidence && (
                  <div className="flex items-start gap-2 bg-gh-bg rounded-lg px-3 py-2 border border-gh-border">
                    <Quote className="w-3 h-3 text-gh-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-gh-text italic leading-relaxed">
                      {section.speechEvidence}
                    </p>
                  </div>
                )}
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
