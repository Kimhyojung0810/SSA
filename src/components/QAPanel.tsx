import { useState, useCallback } from 'react';
import { X, Lightbulb, FileText, AlertCircle, User, Bot, BookOpen } from 'lucide-react';
import { DEMO_QA_ITEMS } from '../data/demoQA';
import type { QATagType } from '../data/demoQA';

interface QAPanelProps {
  onClose?: () => void;
  inline?: boolean;
}

type Phase = 'idle' | 'answering' | 'revealed';

const TAG_STYLES: Record<QATagType, string> = {
  missing_term:    'bg-gh-red/20 text-gh-red border-gh-red/30',
  logic_gap:       'bg-gh-yellow/20 text-gh-yellow border-gh-yellow/30',
  ambiguous_claim: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

interface ItemState {
  answer: string;
  phase: Phase;
}

function QAItems() {
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>(() =>
    Object.fromEntries(DEMO_QA_ITEMS.map(q => [q.id, { answer: '', phase: 'idle' }]))
  );

  const setAnswer = useCallback((id: string, answer: string) => {
    setItemStates(prev => ({ ...prev, [id]: { ...prev[id], answer } }));
  }, []);

  const setPhase = useCallback((id: string, phase: Phase) => {
    setItemStates(prev => ({ ...prev, [id]: { ...prev[id], phase } }));
  }, []);

  return (
    <div className="divide-y divide-gh-border">
      {DEMO_QA_ITEMS.map((qa, idx) => {
        const state = itemStates[qa.id];

        return (
          <div key={qa.id} className="p-5 space-y-3">

            {/* Item header */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gh-accent/20 text-gh-accent text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${TAG_STYLES[qa.tagType]}`}>
                {qa.tag}
              </span>
              <span className="text-xs text-gh-text-muted ml-1">{qa.slideRef}</span>
            </div>

            {/* Presenter speech — top */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gh-text-muted" />
                <span className="text-xs font-semibold text-gh-text-muted">발표자 발화</span>
              </div>
              <div className="rounded-xl rounded-tl-none border border-gh-border bg-gh-bg p-3">
                <p className="text-sm text-gh-text leading-relaxed italic">"{qa.presenterSaid}"</p>
              </div>
              <div className="flex items-start gap-1.5 px-1">
                <AlertCircle className="w-3.5 h-3.5 text-gh-red shrink-0 mt-0.5" />
                <p className="text-xs text-gh-red leading-relaxed">
                  이 발화에서 핵심 논거가 누락되었습니다.
                </p>
              </div>
            </div>

            {/* AI solution — directly below */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs font-semibold text-gh-accent">AI 보완 제안</span>
                <Bot className="w-3.5 h-3.5 text-gh-accent" />
              </div>
              <div className="rounded-xl rounded-tr-none border border-gh-accent/30 bg-gh-accent/8 p-3">
                <p className="text-sm text-gh-text leading-relaxed">{qa.referenceBackground}</p>
              </div>
              <div className="rounded-lg border border-gh-border bg-gh-bg px-3 py-2.5 flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-gh-green shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gh-green mb-1">슬라이드 핵심 내용</p>
                  <p className="text-xs text-gh-text-muted leading-relaxed whitespace-pre-line">{qa.slideContent}</p>
                </div>
              </div>
            </div>

            {/* Expected question */}
            <div className="rounded-xl border border-gh-border bg-gh-bg p-4">
              <p className="text-xs font-semibold text-gh-text-muted mb-1.5">예상 질문</p>
              <p className="text-gh-text font-medium leading-relaxed text-[15px]">{qa.question}</p>
            </div>

            {/* Answer / checkpoint phases */}
            {state.phase === 'idle' && (
              <button type="button" onClick={() => setPhase(qa.id, 'answering')}
                className="w-full py-2.5 rounded-lg border border-dashed border-gh-border text-sm text-gh-text-muted hover:border-gh-accent/50 hover:text-gh-text transition-colors">
                답변 입력하기 →
              </button>
            )}

            {state.phase === 'answering' && (
              <div className="space-y-2">
                <textarea
                  value={state.answer}
                  onChange={e => setAnswer(qa.id, e.target.value)}
                  placeholder="질문에 대한 답변을 자유롭게 입력하세요..."
                  rows={3}
                  className="w-full resize-y px-3 py-2.5 bg-gh-bg border border-gh-border rounded-lg text-gh-text text-sm leading-relaxed focus:border-gh-accent focus:outline-none"
                />
                <button type="button"
                  onClick={() => setPhase(qa.id, 'revealed')}
                  disabled={!state.answer.trim()}
                  className="w-full py-2.5 rounded-lg bg-gh-accent text-white text-sm font-semibold hover:bg-gh-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  제출 후 체크포인트 확인
                </button>
              </div>
            )}

            {state.phase === 'revealed' && (
              <div className="space-y-2">
                {state.answer && (
                  <div className="rounded-lg border border-gh-border bg-gh-bg px-4 py-3">
                    <p className="text-xs text-gh-text-muted mb-1">내 답변</p>
                    <p className="text-sm text-gh-text leading-relaxed">{state.answer}</p>
                  </div>
                )}
                <div className="rounded-xl border border-gh-green/40 bg-gh-green/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-gh-green" />
                    <span className="text-sm font-bold text-gh-green">제안 체크포인트</span>
                  </div>
                  <p className="text-sm text-gh-text leading-relaxed">{qa.checkpoint}</p>
                </div>
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}

/** Inline mode: renders Q&A items directly with no modal chrome */
export function QAInline() {
  return (
    <div className="bg-gh-bg-secondary border border-gh-border rounded-xl w-full overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gh-border bg-gh-bg">
        <div className="w-8 h-8 rounded-lg bg-gh-accent/20 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-gh-accent" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gh-text">Q&A 피드백</h3>
          <p className="text-xs text-gh-text-muted">발표에서 놓친 논거와 보완 제안</p>
        </div>
      </div>
      <QAItems />
    </div>
  );
}

/** Modal mode: renders Q&A items inside a full-screen overlay */
export function QAPanel({ onClose }: QAPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gh-bg-secondary border border-gh-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gh-border bg-gh-bg shrink-0">
          <div>
            <h2 className="text-base font-bold text-gh-text">Q&A 피드백</h2>
            <p className="text-xs text-gh-text-muted">발표에서 놓친 논거와 보완 제안을 확인하세요</p>
          </div>
          {onClose && (
            <button type="button" onClick={onClose}
              className="p-2 rounded-lg border border-gh-border hover:bg-gh-border transition-colors">
              <X className="w-4 h-4 text-gh-text-muted" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <QAItems />
        </div>
        <div className="px-5 py-4 border-t border-gh-border bg-gh-bg shrink-0 flex justify-end">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-gh-accent text-white text-sm font-semibold hover:bg-gh-accent/90 transition-colors">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
