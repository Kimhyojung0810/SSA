import { Settings } from 'lucide-react';
import type { PresentationContext } from '../types';

interface ContextFormProps {
  context: PresentationContext;
  onChange: (ctx: PresentationContext) => void;
  compact?: boolean;
}

export function ContextForm({ context, onChange, compact = false }: ContextFormProps) {
  const set = <K extends keyof PresentationContext>(key: K, val: PresentationContext[K]) =>
    onChange({ ...context, [key]: val });

  if (compact) {
    return (
      <div className="bg-gh-bg-secondary border border-gh-border rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-gh-accent" />
          <span className="text-sm font-semibold text-gh-text">발표 맥락</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            value={context.type}
            onChange={e => set('type', e.target.value)}
            placeholder="발표 유형"
            className="px-2 py-1.5 bg-gh-bg border border-gh-border rounded text-gh-text text-xs focus:border-gh-accent focus:outline-none"
          />
          <input
            type="text"
            value={context.audience}
            onChange={e => set('audience', e.target.value)}
            placeholder="청중"
            className="px-2 py-1.5 bg-gh-bg border border-gh-border rounded text-gh-text text-xs focus:border-gh-accent focus:outline-none"
          />
          <input
            type="number"
            min={1}
            max={120}
            value={context.timeLimitMinutes}
            onChange={e => set('timeLimitMinutes', Math.max(1, Number(e.target.value)))}
            placeholder="시간(분)"
            className="px-2 py-1.5 bg-gh-bg border border-gh-border rounded text-gh-text text-xs focus:border-gh-accent focus:outline-none"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gh-bg-secondary border border-gh-border rounded-xl p-6 h-full">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-gh-accent" />
          <span className="font-semibold text-gh-text">발표 맥락 설정</span>
        </div>
        <p className="text-sm text-gh-text-muted">
          발표 상황에 맞게 정보를 입력하면 AI가 더 정확하게 분석합니다.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gh-text-muted mb-1.5">발표 유형</label>
          <input
            type="text"
            value={context.type}
            onChange={e => set('type', e.target.value)}
            placeholder="예: 투자 피치, 강의, 논문 발표, 업무 보고"
            className="w-full px-3 py-2.5 bg-gh-bg border border-gh-border rounded-lg text-gh-text text-sm focus:border-gh-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-gh-text-muted mb-1.5">청중</label>
          <input
            type="text"
            value={context.audience}
            onChange={e => set('audience', e.target.value)}
            placeholder="예: 투자자, 일반 청중, 전문가, 학생"
            className="w-full px-3 py-2.5 bg-gh-bg border border-gh-border rounded-lg text-gh-text text-sm focus:border-gh-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-gh-text-muted mb-1.5">발표 시간 (분)</label>
          <input
            type="number"
            min={1}
            max={120}
            value={context.timeLimitMinutes}
            onChange={e => set('timeLimitMinutes', Math.max(1, Number(e.target.value)))}
            placeholder="예: 10"
            className="w-full px-3 py-2.5 bg-gh-bg border border-gh-border rounded-lg text-gh-text text-sm focus:border-gh-accent focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
