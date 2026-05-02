import { Mic, MicOff, Trash2, Volume2 } from 'lucide-react';
import type { SpeechSegment } from '../types';

interface SpeechPanelProps {
  isListening: boolean;
  segments: SpeechSegment[];
  interimText: string;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  isSupported: boolean;
  error: string | null;
}

export function SpeechPanel({
  isListening,
  segments,
  interimText,
  onStart,
  onStop,
  onClear,
  isSupported,
  error,
}: SpeechPanelProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gh-bg-secondary border border-gh-border rounded-lg overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gh-border">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-gh-text-muted" />
          <span className="font-semibold text-gh-text">음성 기록</span>
          {isListening && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gh-red/20 text-gh-red rounded-full text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gh-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gh-red"></span>
              </span>
              녹음 중
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gh-text-muted">
            {segments.length}개 인식
          </span>
          {segments.length > 0 && (
            <button
              onClick={onClear}
              className="p-1.5 rounded border border-gh-border hover:bg-gh-border hover:text-gh-red transition-colors"
              title="기록 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

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
            {segments.map((segment, idx) => (
              <div
                key={segment.id}
                className="flex gap-3 p-3 bg-gh-bg rounded-lg border border-gh-border hover:border-gh-accent/50 transition-colors"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gh-text-muted font-mono">
                    {formatTime(segment.timestamp)}
                  </span>
                  <span className="text-xs text-gh-accent">#{idx + 1}</span>
                </div>
                <p className="text-gh-text text-sm flex-1 leading-relaxed">{segment.text}</p>
              </div>
            ))}
            {interimText && (
              <div className="flex gap-3 p-3 bg-gh-accent/10 rounded-lg border border-gh-accent/30 animate-pulse">
                <span className="text-xs text-gh-accent font-mono">...</span>
                <p className="text-gh-accent text-sm flex-1 italic">{interimText}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 border-t border-gh-border bg-gh-bg">
        <button
          onClick={isListening ? onStop : onStart}
          disabled={!isSupported}
          className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isListening
              ? 'bg-gh-red text-white hover:bg-gh-red/90'
              : 'bg-gh-green text-white hover:bg-gh-green/90'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              녹음 중지
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              발표 시작
            </>
          )}
        </button>
        {isSupported && (
          <p className="text-center text-xs text-gh-text-muted mt-2">
            Chrome 브라우저 + 마이크 권한 필요
          </p>
        )}
      </div>
    </div>
  );
}
