import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mic,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { Header } from './components/Header';
import { SlideViewer } from './components/SlideViewer';
import { SpeechPanel } from './components/SpeechPanel';
import { AnalysisReport } from './components/AnalysisReport';
import { SlideUploader } from './components/SlideUploader';
import { ContextForm } from './components/ContextForm';
import { QAInline } from './components/QAPanel';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSSAAnalysis } from './hooks/useSSAAnalysis';
import { enrichSlides } from './lib/enrichSlides';
import {
  clearPresentationDraft,
  savePresentationDraft,
} from './lib/presentationStorage';
import type { Slide, AnalysisReport as ReportType, PresentationContext, SlideTimingRecord } from './types';

const DEFAULT_CONTEXT: PresentationContext = {
  type: '투자 피치',
  audience: '투자자',
  timeLimitMinutes: 10,
};

type WorkflowStep = 'upload' | 'review' | 'practice' | 'report';

const workflowSteps: Array<{
  id: WorkflowStep;
  label: string;
  icon: typeof Upload;
}> = [
  { id: 'upload', label: 'PDF 업로드', icon: Upload },
  { id: 'review', label: '내용 확인', icon: Eye },
  { id: 'practice', label: '발표 연습', icon: Mic },
  { id: 'report', label: '분석 리포트', icon: BarChart3 },
];

function App() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [report, setReport] = useState<ReportType | null>(null);
  const [timingRecords, setTimingRecords] = useState<SlideTimingRecord[]>([]);
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('upload');
  const [context, setContext] = useState<PresentationContext>(DEFAULT_CONTEXT);
  const [isEnriching, setIsEnriching] = useState(false);
  const selectedSlideIndex = slides.length > 0
    ? Math.min(currentSlideIndex, slides.length - 1)
    : 0;

  const {
    isListening,
    segments,
    interimText,
    error,
    isSupported,
    audioBlob,
    startListening,
    stopListening,
    clearSegments,
    setCurrentSlideId,
  } = useSpeechRecognition();

  const {
    alignments,
    isEvaluating,
    updateAlignments,
    generateReport,
    evaluateWithAI,
  } = useSSAAnalysis(slides);

  useEffect(() => {
    if (segments.length > 0) {
      updateAlignments(segments);
    }
  }, [segments, updateAlignments]);

  useEffect(() => {
    const currentSlide = slides[selectedSlideIndex];
    setCurrentSlideId(currentSlide?.id);
  }, [selectedSlideIndex, slides, setCurrentSlideId]);

  useEffect(() => {
    if (slides.length > 0) {
      savePresentationDraft(slides, selectedSlideIndex);
    }
  }, [selectedSlideIndex, slides]);

  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlideIndex(Math.min(Math.max(index, 0), Math.max(slides.length - 1, 0)));
  }, [slides.length]);

  const handleSlidesUpdate = useCallback((nextSlides: Slide[]) => {
    setSlides(nextSlides);
    if (nextSlides.length === 0) {
      setCurrentSlideIndex(0);
      setReport(null);
      setWorkflowStep('upload');
      clearPresentationDraft();
    }
  }, []);

  const handlePdfUploaded = useCallback((nextSlides: Slide[], file?: File) => {
    setSlides(nextSlides);
    setCurrentSlideIndex(0);
    setReport(null);
    setTimingRecords([]);
    clearSegments();
    setWorkflowStep('review');
    savePresentationDraft(nextSlides, 0);

    if (file) {
      setIsEnriching(true);
      enrichSlides(file, nextSlides, context, (enriched, idx) => {
        setSlides(prev => prev.map((s, i) => i === idx ? enriched : s));
      }).then(enrichedAll => {
        setSlides(enrichedAll);
        savePresentationDraft(enrichedAll, 0);
      }).catch(() => {}).finally(() => setIsEnriching(false));
    }
  }, [clearSegments, context]);

  const handleShowReport = useCallback(async () => {
    const newReport = generateReport();
    setReport(newReport);
    setWorkflowStep('report');

    if (segments.length > 0) {
      const records = await evaluateWithAI(audioBlob, segments, context);
      if (records.length > 0) setTimingRecords(records);
    }
  }, [generateReport, evaluateWithAI, audioBlob, segments, context]);

  const handleRestart = useCallback(() => {
    if (isListening) {
      stopListening();
    }
    clearSegments();
    setSlides([]);
    setCurrentSlideIndex(0);
    setReport(null);
    setWorkflowStep('upload');
    clearPresentationDraft();
  }, [clearSegments, isListening, stopListening]);

  const canReview = slides.length > 0;
  const canShowReport = segments.length > 0;
  const activeStepIndex = workflowSteps.findIndex(step => step.id === workflowStep);

  const moveToStep = useCallback((step: WorkflowStep) => {
    if (step === 'upload') {
      handleRestart();
      return;
    }

    if ((step === 'review' || step === 'practice') && canReview) {
      setWorkflowStep(step);
    }

    if (step === 'report' && canShowReport) {
      handleShowReport();
    }
  }, [canReview, canShowReport, handleRestart, handleShowReport]);

  const renderStepper = () => (
    <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
      {workflowSteps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === workflowStep;
        const isComplete = index < activeStepIndex;
        const isLocked =
          (step.id === 'review' || step.id === 'practice') && !canReview ||
          step.id === 'report' && !canShowReport;

        return (
          <button
            type="button"
            key={step.id}
            onClick={() => moveToStep(step.id)}
            disabled={isLocked || step.id === workflowStep}
            className={`flex items-center gap-3 rounded-lg border px-3 py-3 ${
              isActive
                ? 'border-gh-accent bg-gh-accent/10 text-gh-text'
                : isComplete
                ? 'border-gh-green/40 bg-gh-green/10 text-gh-text'
                : isLocked
                ? 'border-gh-border bg-gh-bg-secondary text-gh-text-muted opacity-60'
                : 'border-gh-border bg-gh-bg-secondary text-gh-text-muted'
            } ${isLocked || isActive ? 'cursor-default' : 'hover:border-gh-accent/50 hover:bg-gh-accent/5'}`}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              isActive
                ? 'bg-gh-accent text-white'
                : isComplete
                ? 'bg-gh-green text-white'
                : 'bg-gh-border text-gh-text-muted'
            }`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-gh-text-muted">Step {index + 1}</p>
              <p className="truncate text-sm font-semibold">{step.label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderContent = () => {
    if (workflowStep === 'report' && report) {
      return (
        <div className="space-y-6">
          <QAInline />
          <AnalysisReport
            report={report}
            timingRecords={timingRecords}
            isEvaluating={isEvaluating}
            onClose={() => setWorkflowStep('practice')}
            onRestart={handleRestart}
          />
        </div>
      );
    }

    if (workflowStep === 'upload') {
      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ContextForm context={context} onChange={setContext} />
          <SlideUploader
            variant="upload"
            onSlidesUpdate={handleSlidesUpdate}
            onPdfUploaded={handlePdfUploaded}
            currentSlides={slides}
          />
        </div>
      );
    }

    if (workflowStep === 'review') {
      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ContextForm context={context} onChange={setContext} compact />
            {isEnriching && (
              <p className="text-xs text-gh-text-muted mt-2 px-1">
                AI가 슬라이드를 분석 중입니다...
              </p>
            )}
            <SlideUploader
              onSlidesUpdate={handleSlidesUpdate}
              currentSlides={slides}
              currentSlideIndex={selectedSlideIndex}
              onSlideSelect={handleSlideChange}
              onPdfUploaded={handlePdfUploaded}
            />
          </div>
          <div className="lg:col-span-2">
            {slides.length > 0 ? (
              <SlideViewer
                slides={slides}
                currentIndex={selectedSlideIndex}
                onSlideChange={handleSlideChange}
                alignments={alignments}
              />
            ) : (
              <div className="aspect-[16/9] bg-gh-bg-secondary border border-gh-border rounded-xl flex items-center justify-center">
                <p className="text-sm text-gh-text-muted">미리 볼 슬라이드가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {slides.length > 0 ? (
            <SlideViewer
              slides={slides}
              currentIndex={selectedSlideIndex}
              onSlideChange={handleSlideChange}
              alignments={alignments}
            />
          ) : (
            <div className="aspect-[16/9] bg-gh-bg-secondary border border-gh-border rounded-xl flex items-center justify-center">
              <p className="text-sm text-gh-text-muted">먼저 PDF를 업로드하세요.</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <SpeechPanel
            isListening={isListening}
            segments={segments}
            interimText={interimText}
            onStart={startListening}
            onStop={stopListening}
            onFinish={handleShowReport}
            isSupported={isSupported}
            error={error}
            alignments={alignments}
            slides={slides}
            currentSlideIndex={selectedSlideIndex}
            timeLimitMinutes={context.timeLimitMinutes}
          />
        </div>
      </div>
    );
  };

  const renderActionBar = () => {
    if (workflowStep === 'upload') {
      return (
        <div className="mt-6 flex items-center justify-end rounded-xl border border-gh-border bg-gh-bg-secondary p-4">
          <button
            type="button"
            onClick={() => setWorkflowStep('review')}
            disabled={!canReview}
            className="flex items-center gap-2 rounded-lg bg-gh-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gh-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            내용 확인하기
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      );
    }

    if (workflowStep === 'review') {
      return (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-gh-border bg-gh-bg-secondary p-4">
          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-2 rounded-lg border border-gh-border px-4 py-2 text-sm text-gh-text-muted transition-colors hover:bg-gh-border hover:text-gh-text"
          >
            <ChevronLeft className="h-4 w-4" />
            PDF 다시 업로드
          </button>
          <button
            type="button"
            onClick={() => setWorkflowStep('practice')}
            disabled={!canReview}
            className="flex items-center gap-2 rounded-lg bg-gh-green px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gh-green/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            발표 연습 시작
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      );
    }

    if (workflowStep === 'practice') {
      return (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-gh-border bg-gh-bg-secondary p-4">
          <button
            type="button"
            onClick={() => setWorkflowStep('review')}
            className="flex items-center gap-2 rounded-lg border border-gh-border px-4 py-2 text-sm text-gh-text-muted transition-colors hover:bg-gh-border hover:text-gh-text"
          >
            <ChevronLeft className="h-4 w-4" />
            내용 다시 확인
          </button>
          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-2 rounded-lg border border-gh-border px-4 py-2 text-sm text-gh-text-muted transition-colors hover:bg-gh-border hover:text-gh-text"
          >
            <RotateCcw className="h-4 w-4" />
            처음부터 다시 시작
          </button>
        </div>
      );
    }

    return (
      <div className="mt-6 flex items-center justify-between rounded-xl border border-gh-border bg-gh-bg-secondary p-4">
        <button
          type="button"
          onClick={() => setWorkflowStep('practice')}
          className="flex items-center gap-2 rounded-lg border border-gh-border px-4 py-2 text-sm text-gh-text-muted transition-colors hover:bg-gh-border hover:text-gh-text"
        >
          <ChevronLeft className="h-4 w-4" />
          연습으로 돌아가기
        </button>
        <button
          type="button"
          onClick={handleRestart}
          className="flex items-center gap-2 rounded-lg bg-gh-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gh-accent/90"
        >
          <RotateCcw className="h-4 w-4" />
          처음부터 다시 시작
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gh-bg">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {renderStepper()}
        {renderContent()}
        {renderActionBar()}

        <div className="mt-8 p-5 bg-gh-bg-secondary border border-gh-border rounded-xl">
          <h3 className="text-sm font-bold text-gh-text mb-4">사용 방법</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: 1, text: 'PDF를 업로드해 발표 자료를 슬라이드 단위로 불러오세요' },
              { step: 2, text: '각 페이지를 확인하고 제목과 체크포인트를 조정하세요' },
              { step: 3, text: '업로드한 PDF 페이지를 보며 발표를 녹음하세요' },
              { step: 4, text: '분석 리포트에서 누락된 포인트와 개선점을 확인하세요' },
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

    </div>
  );
}

export default App;
