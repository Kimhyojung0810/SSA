import {
  AlertTriangle,
  CheckCircle2,
  Keyboard,
  Lightbulb,
  MessageSquare,
  Mic,
  XCircle,
} from 'lucide-react';
import { buildQAReadinessData } from '../data/qaReadiness';
import type { QAAnswer, QAReadinessStatus } from '../types';

interface QAReadinessSectionProps {
  qaAnswers?: QAAnswer[];
}

const STATUS_CONFIG: Record<
  QAReadinessStatus,
  { label: string; icon: typeof CheckCircle2; badge: string; text: string; bg: string }
> = {
  strong: {
    label: '충분',
    icon: CheckCircle2,
    badge: 'bg-gh-green/15 text-gh-green border-gh-green/30',
    text: 'text-gh-green',
    bg: 'bg-gh-green/5',
  },
  partial: {
    label: '부분 보완',
    icon: AlertTriangle,
    badge: 'bg-gh-yellow/15 text-gh-yellow border-gh-yellow/30',
    text: 'text-gh-yellow',
    bg: 'bg-gh-yellow/5',
  },
  weak: {
    label: '보완 필요',
    icon: XCircle,
    badge: 'bg-gh-red/15 text-gh-red border-gh-red/30',
    text: 'text-gh-red',
    bg: 'bg-gh-red/5',
  },
};

function getGradeInfo(score: number): { color: string; message: string } {
  if (score >= 80) return { color: 'text-gh-green', message: '예상 질문 대비 우수' };
  if (score >= 65) return { color: 'text-gh-green', message: '대체로 방어 가능' };
  if (score >= 45) return { color: 'text-gh-yellow', message: '일부 답변 보완 필요' };
  return { color: 'text-gh-red', message: 'Q&A 방어력 보완 필요' };
}

export function QAReadinessSection({ qaAnswers = [] }: QAReadinessSectionProps) {
  const data = buildQAReadinessData(qaAnswers);
  const grade = getGradeInfo(data.overallScore);

  return (
    <div className="p-4 bg-gh-bg rounded-xl border border-gh-border space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gh-text">Q&A 대비도</h3>
          <p className="text-xs text-gh-text-muted mt-0.5">
            발표 후 보완 Q&A 답변이 예상 질문의 핵심 기준을 얼마나 채우는지 평가합니다
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 flex-wrap justify-end">
          <span className={`text-3xl font-black ${grade.color}`}>{data.overallScore}%</span>
          <div className="flex flex-col gap-1 items-end">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gh-accent/15 text-gh-accent border border-gh-accent/30">
              답변 {data.answeredCount}/{data.expectedCount}
            </span>
            {data.partialCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gh-yellow/15 text-gh-yellow border border-gh-yellow/30">
                부분 {data.partialCount}건
              </span>
            )}
            {data.weakCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gh-red/15 text-gh-red border border-gh-red/30">
                취약 {data.weakCount}건
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-2.5 bg-gh-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              data.overallScore >= 65
                ? 'bg-gh-green'
                : data.overallScore >= 45
                  ? 'bg-gh-yellow'
                  : 'bg-gh-red'
            }`}
            style={{ width: `${data.overallScore}%` }}
          />
        </div>
        <p className={`text-xs font-semibold ${grade.color}`}>{grade.message}</p>
      </div>

      {data.items.length > 0 ? (
        <div className="space-y-2.5">
          {data.items.map((item) => {
            const cfg = STATUS_CONFIG[item.status];
            const Icon = cfg.icon;

            return (
              <div key={item.qaId} className={`rounded-lg border border-gh-border overflow-hidden ${cfg.bg}`}>
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${cfg.text}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-gh-text-muted">
                      <span>{item.slideRef}</span>
                      <span>·</span>
                      <span>{item.expectedQuestionType}</span>
                    </div>
                    <p className="text-sm font-semibold text-gh-text truncate">{item.question}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  <span className={`text-sm font-black w-10 text-right ${cfg.text}`}>{item.score}%</span>
                </div>

                <div className="px-4 pb-3 space-y-3 border-t border-gh-border">
                  <div className="pt-3 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {item.answeredVia === 'voice' ? (
                        <Mic className="w-3.5 h-3.5 text-gh-text-muted" />
                      ) : (
                        <Keyboard className="w-3.5 h-3.5 text-gh-text-muted" />
                      )}
                      <span className="text-xs font-semibold text-gh-text-muted">제공된 답변</span>
                    </div>
                    <p className="text-xs text-gh-text leading-relaxed">{item.userAnswer}</p>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="rounded-lg bg-gh-green/8 border border-gh-green/20 px-3 py-2">
                      <p className="text-xs font-semibold text-gh-green mb-1">충족 기준</p>
                      {item.coveredCriteria.length > 0 ? (
                        <ul className="space-y-1">
                          {item.coveredCriteria.map((criterion) => (
                            <li key={criterion} className="flex items-start gap-1.5 text-xs text-gh-text">
                              <CheckCircle2 className="w-3 h-3 text-gh-green shrink-0 mt-0.5" />
                              <span>{criterion}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gh-text-muted">아직 명확히 충족된 기준이 없습니다.</p>
                      )}
                    </div>

                    <div className="rounded-lg bg-gh-red/8 border border-gh-red/20 px-3 py-2">
                      <p className="text-xs font-semibold text-gh-red mb-1">누락 기준</p>
                      {item.missingCriteria.length > 0 ? (
                        <ul className="space-y-1">
                          {item.missingCriteria.map((criterion) => (
                            <li key={criterion} className="flex items-start gap-1.5 text-xs text-gh-text">
                              <XCircle className="w-3 h-3 text-gh-red shrink-0 mt-0.5" />
                              <span>{criterion}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gh-text-muted">예상 질문 기준을 모두 충족했습니다.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-gh-accent/8 border border-gh-accent/20 px-3 py-2.5 flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gh-accent" />
                    <p className="text-xs text-gh-text leading-relaxed">{item.suggestion}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gh-border bg-gh-bg-secondary px-4 py-5 text-center">
          <MessageSquare className="w-6 h-6 text-gh-text-muted mx-auto mb-2" />
          <p className="text-sm font-semibold text-gh-text">보완 Q&A 답변이 없습니다</p>
          <p className="text-xs text-gh-text-muted mt-1">
            Step 3 이후 Q&A에 답변하면 예상 질문 대비도 평가가 이곳에 표시됩니다.
          </p>
        </div>
      )}

      <div className="rounded-lg bg-gh-accent/8 border border-gh-accent/20 px-4 py-3">
        <p className="text-xs text-gh-text leading-relaxed">{data.verdict}</p>
      </div>
    </div>
  );
}
