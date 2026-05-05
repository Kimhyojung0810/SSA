import type { PresentationContext } from '../types';

interface ContextFormProps {
  context: PresentationContext;
  onChange: (ctx: PresentationContext) => void;
}

const TYPES: { value: PresentationContext['type']; label: string }[] = [
  { value: 'pitch',   label: '투자 피치' },
  { value: 'lecture', label: '강의·강연' },
  { value: 'defense', label: '논문 발표' },
  { value: 'meeting', label: '업무 보고' },
];

const AUDIENCES: { value: PresentationContext['audience']; label: string }[] = [
  { value: 'investors', label: '투자자' },
  { value: 'general',   label: '일반 청중' },
  { value: 'experts',   label: '전문가' },
  { value: 'academic',  label: '학술 청중' },
];

export function ContextForm({ context, onChange }: ContextFormProps) {
  const set = <K extends keyof PresentationContext>(key: K, val: PresentationContext[K]) =>
    onChange({ ...context, [key]: val });

  return (
    <div className="rounded-xl border border-gh-border bg-gh-bg-secondary p-4 mb-5">
      <p className="text-sm font-semibold text-gh-text mb-3">발표 맥락 설정</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs text-gh-text-muted mb-1">발표 유형</label>
          <select
            value={context.type}
            onChange={e => set('type', e.target.value as PresentationContext['type'])}
            className="w-full px-3 py-2 bg-gh-bg border border-gh-border rounded text-gh-text text-sm focus:border-gh-accent focus:outline-none"
          >
            {TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gh-text-muted mb-1">청중</label>
          <select
            value={context.audience}
            onChange={e => set('audience', e.target.value as PresentationContext['audience'])}
            className="w-full px-3 py-2 bg-gh-bg border border-gh-border rounded text-gh-text text-sm focus:border-gh-accent focus:outline-none"
          >
            {AUDIENCES.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gh-text-muted mb-1">발표 시간 (분)</label>
          <input
            type="number"
            min={1}
            max={120}
            value={context.timeLimitMinutes}
            onChange={e => set('timeLimitMinutes', Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 bg-gh-bg border border-gh-border rounded text-gh-text text-sm focus:border-gh-accent focus:outline-none"
          />
        </div>
      </div>

      <p className="text-xs text-gh-text-muted mt-2">
        맥락 설정에 따라 AI가 슬라이드 요소의 중요도를 다르게 분류합니다.
      </p>
    </div>
  );
}
