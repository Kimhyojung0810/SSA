import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Mic, Square, Volume2 } from 'lucide-react';
import type { AlignmentResult, Slide, SpeechSegment } from '../types';

interface SpeechPanelProps {
  isListening: boolean;
  segments: SpeechSegment[];
  interimText: string;
  onStart: () => void;
  onStop: () => void;
  onFinish: () => void;
  isSupported: boolean;
  error: string | null;
  alignments?: AlignmentResult[];
  slides?: Slide[];
  currentSlideIndex?: number;
  timeLimitMinutes?: number;
}

export function SpeechPanel({
  isListening,
  segments,
  interimText,
  onStart,
  onStop,
  onFinish,
  isSupported,
  error,
  alignments = [],
  slides = [],
  currentSlideIndex = 0,
  timeLimitMinutes = 10,
}: SpeechPanelProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isListening) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimer = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const targetSeconds = timeLimitMinutes * 60;
  const isOverTime = elapsedSeconds > targetSeconds;

  const handleFinish = () => {
    onStop();
    onFinish();
  };

  const totalPoints = slides.reduce((sum, s) => sum + s.points.length, 0);
  const coveredCount = alignments.filter(a => a.status === 'covered').length;
  const partialCount = alignments.filter(a => a.status === 'partial').length;
  const coveragePercent = totalPoints > 0
    ? Math.round(((coveredCount + partialCount * 0.5) / totalPoints) * 100)
    : 0;

  const currentSlide = slides[currentSlideIndex];
  const currentSlideCovered = currentSlide
    ? alignments.filter(
        a => a.slideId === currentSlide.id && (a.status === 'covered' || a.status === 'partial')
      ).length
    : 0;
  const currentSlideTotal = currentSlide?.points.length ?? 0;

  const getSegmentMatches = (segmentId: string) =>
    alignments
      .filter(a => a.speechSegmentId === segmentId && (a.status === 'covered' || a.status === 'partial'))
      .flatMap(a => {
        for (const slide of slides) {
          const point = slide.points.find(p => p.id === a.pointId);
          if (point) return [{ text: point.text, slideNumber: slide.number }];
        }
        return [];
      });

  return (
    <div className="bg-gh-bg-secondary border border-gh-border rounded-lg overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gh-border">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-gh-text-muted" />
          <span className="font-semibold text-gh-text">음성 기록</span>
          {isListening && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gh-red/20 text-gh-red rounded-full text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gh-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gh-red"></span>
              </span>
              녹음 중
            </span>
          )}
        </div>
        <span className="text-sm text-gh-text-muted">
          {segments.length}개 인식
        </span>
      </div>

      {isListening && (
        <div className="px-4 py-3 border-b border-gh-border bg-gh-bg">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isOverTime ? 'bg-gh-red/20' : 'bg-gh-green/20'}`}>
              <span className={`text-xl font-mono font-bold ${isOverTime ? 'text-gh-red' : 'text-gh-green'}`}>
                {formatTimer(elapsedSeconds)}
              </span>
              <span className={`text-sm ${isOverTime ? 'text-gh-red/70' : 'text-gh-green/70'}`}>/ {formatTimer(targetSeconds)}</span>
            </div>
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-4 py-2 bg-gh-red text-white rounded-lg text-sm font-semibold hover:bg-gh-red/90 transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              발표 종료
            </button>
          </div>
        </div>
      )}

      {!isSupported && (
        <div className="p-4 bg-gh-yellow/10 border-b border-gh-yellow/30">
          <p className="text-gh-yellow text-sm">
            Chrome 브라우저에서만 음성 인식이 지원됩니다.
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-gh-red/10 border-b border-gh-red/30">
          <p className="text-gh-red text-sm">{error}</p>
        </div>
      )}

      {totalPoints > 0 && (
        <div className="px-4 py-3 border-b border-gh-border bg-gh-bg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gh-text">실시간 분석</span>
            <span className={`text-xs font-bold ${
              coveragePercent >= 80 ? 'text-green-400' :
              coveragePercent >= 50 ? 'text-yellow-400' :
              coveragePercent > 0  ? 'text-gh-accent' : 'text-gh-text-muted'
            }`}>
              {coveredCount + partialCount}/{totalPoints} 체크포인트
            </span>
          </div>
          <div className="h-1.5 bg-gh-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                coveragePercent >= 80 ? 'bg-green-400' :
                coveragePercent >= 50 ? 'bg-yellow-400' :
                coveragePercent > 0  ? 'bg-gh-accent' : 'bg-gh-border'
              }`}
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
          {currentSlide && currentSlideTotal > 0 && (
            <p className="text-xs text-gh-text-muted mt-1.5">
              현재 슬라이드 #{currentSlide.number}: {currentSlideCovered}/{currentSlideTotal} 커버됨
            </p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[400px]">
        {segments.length === 0 && !interimText ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isListening ? 'bg-gh-red/20' : 'bg-gh-border'}`}>
              <Mic className={`w-8 h-8 ${isListening ? 'text-gh-red' : 'text-gh-text-muted'}`} />
            </div>
            <p className="text-gh-text text-sm font-medium">
              {isListening ? '말씀해 주세요...' : '발표를 시작하세요'}
            </p>
            <p className="text-gh-text-muted text-xs mt-1">
              {isListening 
                ? '음성이 인식되면 여기에 표시됩니다' 
                : '아래 버튼을 눌러 음성 녹음을 시작하세요'}
            </p>
          </div>
        ) : (
          <>
            {segments.map((segment) => {
              const matches = getSegmentMatches(segment.id);
              const segmentSlide = slides.find(s => s.id === segment.slideId);
              const slideNum = segmentSlide?.number ?? '?';
              return (
                <div
                  key={segment.id}
                  className="flex gap-3 p-3 bg-gh-bg rounded-lg border border-gh-border hover:border-gh-accent/50 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="text-xs text-gh-text-muted font-mono">
                      {formatTime(segment.timestamp)}
                    </span>
                    <span className="text-xs text-gh-accent font-bold">슬라이드 {slideNum}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gh-text text-sm leading-relaxed">{segment.text}</p>
                    {matches.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {matches.map((match, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-green-500/15 text-green-400 rounded border border-green-500/20"
                          >
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[140px]">{match.text}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {interimText && (
              <div className="flex gap-3 p-3 bg-gh-accent/10 rounded-lg border border-gh-accent/30 animate-pulse">
                <span className="text-xs text-gh-accent font-mono">...</span>
                <p className="text-gh-accent text-sm flex-1 italic">{interimText}</p>
              </div>
            )}
          </>
        )}
      </div>

      {!isListening && (
        <div className="p-4 border-t border-gh-border bg-gh-bg">
          <button
            type="button"
            onClick={onStart}
            disabled={!isSupported}
            className="w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gh-green text-white hover:bg-gh-green/90"
          >
            <Mic className="w-5 h-5" />
            발표 시작
          </button>
          {isSupported && (
            <p className="text-center text-xs text-gh-text-muted mt-2">
              Chrome 브라우저 + 마이크 권한 필요
            </p>
          )}
        </div>
      )}
    </div>
  );
}
