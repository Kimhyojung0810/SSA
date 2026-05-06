import { useState, useCallback, useRef } from "react";
import {
  X,
  Mic,
  MicOff,
  Keyboard,
  Bot,
  User,
  AlertCircle,
  FileText,
  Lightbulb,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { DEMO_QA_ITEMS } from "../data/demoQA";
import type { QATagType } from "../data/demoQA";
import type { QAAnswer } from "../types";

interface QAModalProps {
  onConfirm: (answers: QAAnswer[]) => void;
  onClose: () => void;
}

type Phase = "idle" | "answering" | "revealed";
type InputMode = "text" | "voice";

interface ItemState {
  answer: string;
  phase: Phase;
  inputMode: InputMode;
  isListening: boolean;
  voiceTranscript: string;
}

const TAG_STYLES: Record<QATagType, string> = {
  missing_term: "bg-gh-red/20 text-gh-red border-gh-red/30",
  logic_gap: "bg-gh-yellow/20 text-gh-yellow border-gh-yellow/30",
  ambiguous_claim: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

function useVoiceInput(onResult: (id: string, transcript: string) => void) {
  const recognitionRef = useRef<any>(null);
  const activeIdRef = useRef<string | null>(null);

  const start = useCallback(
    (id: string): boolean => {
      const API = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!API) return false;

      recognitionRef.current?.stop();

      const rec = new API();
      rec.lang = 'ko-KR';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (e: any) => {
        const text = Array.from(e.results as any[])
          .map((r: any) => r[0].transcript)
          .join('');
        if (activeIdRef.current) onResult(activeIdRef.current, text);
      };

      rec.onend = () => {
        recognitionRef.current = null;
      };

      rec.start();
      recognitionRef.current = rec;
      activeIdRef.current = id;
      return true;
    },
    [onResult],
  );

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    activeIdRef.current = null;
  }, []);

  return { start, stop };
}

export function QAModal({ onConfirm, onClose }: QAModalProps) {
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>(() =>
    Object.fromEntries(
      DEMO_QA_ITEMS.map((q) => [
        q.id,
        {
          answer: "",
          phase: "idle" as Phase,
          inputMode: "text" as InputMode,
          isListening: false,
          voiceTranscript: "",
        },
      ]),
    ),
  );

  const handleVoiceResult = useCallback((id: string, transcript: string) => {
    setItemStates((prev) => {
      const existing = prev[id].voiceTranscript;
      const combined = existing ? `${existing} ${transcript}` : transcript;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          voiceTranscript: combined,
          answer: combined,
          isListening: false,
        },
      };
    });
  }, []);

  const { start: startVoice, stop: stopVoice } =
    useVoiceInput(handleVoiceResult);

  const setField = useCallback(
    <K extends keyof ItemState>(id: string, key: K, value: ItemState[K]) => {
      setItemStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], [key]: value },
      }));
    },
    [],
  );

  const toggleVoice = useCallback(
    (id: string) => {
      const listening = itemStates[id].isListening;
      if (listening) {
        stopVoice();
        setField(id, "isListening", false);
      } else {
        const started = startVoice(id);
        if (started) setField(id, "isListening", true);
      }
    },
    [itemStates, startVoice, stopVoice, setField],
  );

  const handleConfirm = useCallback(() => {
    const answers: QAAnswer[] = DEMO_QA_ITEMS.flatMap((qa) => {
      const state = itemStates[qa.id];
      if (!state.answer.trim()) return [];
      return [
        {
          qaId: qa.id,
          question: qa.question,
          userAnswer: state.answer.trim(),
          answeredVia: state.inputMode,
          checkpoint: qa.checkpoint,
        },
      ];
    });
    onConfirm(answers);
  }, [itemStates, onConfirm]);

  const answeredCount = DEMO_QA_ITEMS.filter(
    (qa) => itemStates[qa.id].phase === "revealed",
  ).length;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gh-bg-secondary border border-gh-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gh-border bg-gh-bg shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gh-text">
                발표 보완 Q&A
              </h2>
              <span className="rounded-full bg-gh-accent/20 px-2 py-0.5 text-xs font-semibold text-gh-accent">
                {answeredCount}/{DEMO_QA_ITEMS.length} 완료
              </span>
            </div>
            <p className="text-xs text-gh-text-muted mt-0.5">
              질문에 답변하면 분석 리포트에 반영됩니다 — 음성 또는 텍스트로
              입력하세요
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-2 rounded-lg border border-gh-border hover:bg-gh-border transition-colors"
          >
            <X className="w-4 h-4 text-gh-text-muted" />
          </button>
        </div>

        {/* Q&A list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gh-border">
          {DEMO_QA_ITEMS.map((qa, idx) => {
            const state = itemStates[qa.id];
            const isText = state.inputMode === "text";

            return (
              <div key={qa.id} className="p-5 space-y-3">
                {/* Item header */}
                <div className="flex items-center gap-2">
                  <span className="w-12 h-10 rounded-full bg-gh-accent/20 text-gh-accent text-2xl font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span
                    className={`text-lg font-semibold px-2.5 py-1 rounded-full border ${TAG_STYLES[qa.tagType]}`}
                  >
                    {qa.tag}
                  </span>
                  <span className="text-xs text-gh-text-muted ml-1">
                    {qa.slideRef}
                  </span>
                  {state.phase === "revealed" && (
                    <CheckCircle2 className="w-4 h-4 text-gh-green ml-auto shrink-0" />
                  )}
                </div>

                {/* Presenter speech */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gh-text-muted" />
                    <span className="text-xs font-semibold text-gh-text-muted">
                      발표자 발화
                    </span>
                  </div>
                  <div className="rounded-xl rounded-tl-none border border-gh-border bg-gh-bg p-3">
                    <p className="text-sm text-gh-text leading-relaxed italic">
                      "{qa.presenterSaid}"
                    </p>
                  </div>
                  <div className="flex items-start gap-1.5 px-1">
                    <AlertCircle className="w-3.5 h-3.5 text-gh-red shrink-0 mt-0.5" />
                    <p className="text-xs text-gh-red leading-relaxed">
                      이 발화에서 핵심 논거가 누락되었습니다.
                    </p>
                  </div>
                </div>

                {/* AI supplement */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-xs font-semibold text-gh-accent">
                      AI 보완 제안
                    </span>
                    <Bot className="w-3.5 h-3.5 text-gh-accent" />
                  </div>
                  <div className="rounded-xl rounded-tr-none border border-gh-accent/30 bg-gh-accent/8 p-3">
                    <p className="text-sm text-gh-text leading-relaxed">
                      {qa.referenceBackground}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gh-border bg-gh-bg px-3 py-2.5 flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-gh-green shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gh-green mb-1">
                        슬라이드 핵심 내용
                      </p>
                      <p className="text-xs text-gh-text-muted leading-relaxed whitespace-pre-line">
                        {qa.slideContent}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expected question */}
                <div className="rounded-xl border border-gh-border bg-gh-bg p-4">
                  <p className="text-xs font-semibold text-gh-text-muted mb-1.5">
                    예상 질문
                  </p>
                  <p className="text-gh-text font-medium leading-relaxed text-[15px]">
                    {qa.question}
                  </p>
                </div>

                {/* Answer phases */}
                {state.phase === "idle" && (
                  <button
                    type="button"
                    onClick={() => setField(qa.id, "phase", "answering")}
                    className="w-full py-2.5 rounded-lg border border-dashed border-gh-border text-sm text-gh-text-muted hover:border-gh-accent/50 hover:text-gh-text transition-colors"
                  >
                    답변 입력하기 →
                  </button>
                )}

                {state.phase === "answering" && (
                  <div className="space-y-2">
                    {/* Mode toggle */}
                    <div className="flex gap-1 p-1 bg-gh-bg rounded-lg border border-gh-border w-fit">
                      <button
                        type="button"
                        onClick={() => setField(qa.id, "inputMode", "text")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                          isText
                            ? "bg-gh-accent text-white"
                            : "text-gh-text-muted hover:text-gh-text"
                        }`}
                      >
                        <Keyboard className="w-3 h-3" />
                        텍스트
                      </button>
                      <button
                        type="button"
                        onClick={() => setField(qa.id, "inputMode", "voice")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                          !isText
                            ? "bg-gh-accent text-white"
                            : "text-gh-text-muted hover:text-gh-text"
                        }`}
                      >
                        <Mic className="w-3 h-3" />
                        음성
                      </button>
                    </div>

                    {isText ? (
                      <textarea
                        value={state.answer}
                        onChange={(e) =>
                          setField(qa.id, "answer", e.target.value)
                        }
                        placeholder="질문에 대한 답변을 자유롭게 입력하세요..."
                        rows={3}
                        className="w-full resize-y px-3 py-2.5 bg-gh-bg border border-gh-border rounded-lg text-gh-text text-sm leading-relaxed focus:border-gh-accent focus:outline-none"
                      />
                    ) : (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => toggleVoice(qa.id)}
                          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition-all ${
                            state.isListening
                              ? "bg-gh-red text-white hover:bg-gh-red/90"
                              : "border border-gh-border bg-gh-bg text-gh-text hover:border-gh-accent/50"
                          }`}
                        >
                          {state.isListening ? (
                            <>
                              <MicOff className="w-4 h-4" />
                              <span className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                </span>
                                녹음 중지
                              </span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-4 h-4" />
                              음성으로 답변하기
                            </>
                          )}
                        </button>
                        {state.voiceTranscript && (
                          <div className="px-3 py-2.5 bg-gh-bg border border-gh-border rounded-lg">
                            <p className="text-xs text-gh-text-muted mb-1">
                              인식된 텍스트
                            </p>
                            <p className="text-sm text-gh-text leading-relaxed">
                              {state.voiceTranscript}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setField(qa.id, "phase", "revealed")}
                      disabled={!state.answer.trim()}
                      className="w-full py-2.5 rounded-lg bg-gh-accent text-white text-sm font-semibold hover:bg-gh-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      제출 후 체크포인트 확인
                    </button>
                  </div>
                )}

                {state.phase === "revealed" && (
                  <div className="space-y-2">
                    {state.answer && (
                      <div className="rounded-lg border border-gh-border bg-gh-bg px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          {state.inputMode === "voice" ? (
                            <Mic className="w-3 h-3 text-gh-text-muted" />
                          ) : (
                            <Keyboard className="w-3 h-3 text-gh-text-muted" />
                          )}
                          <p className="text-xs text-gh-text-muted">내 답변</p>
                        </div>
                        <p className="text-sm text-gh-text leading-relaxed">
                          {state.answer}
                        </p>
                      </div>
                    )}
                    <div className="rounded-xl border border-gh-green/40 bg-gh-green/10 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-gh-green" />
                        <span className="text-sm font-bold text-gh-green">
                          제안 체크포인트
                        </span>
                      </div>
                      <p className="text-sm text-gh-text leading-relaxed">
                        {qa.checkpoint}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gh-border bg-gh-bg shrink-0 flex items-center justify-between gap-3">
          <p className="text-xs text-gh-text-muted">
            {answeredCount > 0
              ? `${answeredCount}개 답변이 리포트에 반영됩니다`
              : "답변하지 않아도 리포트를 확인할 수 있습니다"}
          </p>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gh-accent text-white text-sm font-semibold hover:bg-gh-accent/90 transition-colors shrink-0"
          >
            <BarChart3 className="w-4 h-4" />
            분석 리포트 보기
          </button>
        </div>
      </div>
    </div>
  );
}
