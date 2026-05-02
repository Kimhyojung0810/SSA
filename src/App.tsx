import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SlideViewer } from './components/SlideViewer';
import { SpeechPanel } from './components/SpeechPanel';
import { AnalysisReport } from './components/AnalysisReport';
import { SlideUploader } from './components/SlideUploader';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSSAAnalysis } from './hooks/useSSAAnalysis';
import { demoSlides } from './data/demoSlides';
import type { Slide, AnalysisReport as ReportType } from './types';
import { Play, FileText, RotateCcw } from 'lucide-react';

type ViewMode = 'practice' | 'slides';

function App() {
  const [slides, setSlides] = useState<Slide[]>(demoSlides);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<ReportType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('practice');

  const {
    isListening,
    segments,
    interimText,
    error,
    isSupported,
    startListening,
    stopListening,
    clearSegments,
  } = useSpeechRecognition();

  const {
    alignments,
    updateAlignments,
    generateReport,
  } = useSSAAnalysis(slides);

  useEffect(() => {
    if (segments.length > 0) {
      updateAlignments(segments);
    }
  }, [segments, updateAlignments]);

  const handleShowReport = useCallback(() => {
    const newReport = generateReport();
    setReport(newReport);
    setShowReport(true);
  }, [generateReport]);

  const handleReset = useCallback(() => {
    clearSegments();
    setCurrentSlideIndex(0);
    setReport(null);
  }, [clearSegments]);

  return (
    <div className="min-h-screen bg-gh-bg">
      <Header 
        onShowReport={handleShowReport} 
        hasSegments={segments.length > 0}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-gh-bg-secondary rounded-lg border border-gh-border p-1">
            <button
              onClick={() => setViewMode('practice')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'practice'
                  ? 'bg-gh-accent text-white'
                  : 'text-gh-text-muted hover:text-gh-text hover:bg-gh-border/50'
              }`}
            >
              <Play className="w-4 h-4" />
              연습 모드
            </button>
            <button
              onClick={() => setViewMode('slides')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'slides'
                  ? 'bg-gh-accent text-white'
                  : 'text-gh-text-muted hover:text-gh-text hover:bg-gh-border/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              슬라이드 편집
            </button>
          </div>

          {viewMode === 'practice' && segments.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-gh-border rounded-lg text-sm text-gh-text-muted hover:text-gh-text hover:bg-gh-border/50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </button>
          )}
        </div>

        {viewMode === 'slides' ? (
          <SlideUploader 
            onSlidesUpdate={setSlides} 
            currentSlides={slides}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SlideViewer
                slides={slides}
                currentIndex={currentSlideIndex}
                onSlideChange={setCurrentSlideIndex}
                alignments={alignments}
              />
            </div>
            <div className="lg:col-span-1">
              <SpeechPanel
                isListening={isListening}
                segments={segments}
                interimText={interimText}
                onStart={startListening}
                onStop={stopListening}
                onClear={clearSegments}
                isSupported={isSupported}
                error={error}
              />
            </div>
          </div>
        )}

        <div className="mt-8 p-5 bg-gh-bg-secondary border border-gh-border rounded-xl">
          <h3 className="text-sm font-bold text-gh-text mb-4">사용 방법</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: 1, text: '슬라이드 편집에서 발표 자료의 핵심 포인트를 입력하세요' },
              { step: 2, text: '연습 모드에서 "발표 시작" 버튼을 눌러 마이크를 활성화하세요' },
              { step: 3, text: '슬라이드를 보며 발표하면 실시간으로 커버리지가 표시됩니다' },
              { step: 4, text: '"분석 리포트"에서 누락된 포인트와 개선점을 확인하세요' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gh-accent/20 text-gh-accent flex items-center justify-center text-sm font-bold">
                  {step}
                </span>
                <p className="text-sm text-gh-text-muted leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-8 py-6 text-center border-t border-gh-border">
          <p className="text-gh-text font-medium">
            SSA Demo — Slide-Speech Alignment Engine
          </p>
          <p className="text-gh-text-muted text-sm mt-1">
            "발표는 슬라이드와의 약속" — 약속을 지키는 발표자가 되세요
          </p>
        </footer>
      </div>

      {showReport && report && (
        <AnalysisReport
          report={report}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

export default App;
