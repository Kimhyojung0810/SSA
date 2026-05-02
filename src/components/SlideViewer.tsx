import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import type { Slide, AlignmentResult } from '../types';

interface SlideViewerProps {
  slides: Slide[];
  currentIndex: number;
  onSlideChange: (index: number) => void;
  alignments: AlignmentResult[];
}

export function SlideViewer({ slides, currentIndex, onSlideChange, alignments }: SlideViewerProps) {
  const currentSlide = slides[currentIndex];

  const getPointStatus = (pointId: string) => {
    const alignment = alignments.find(a => a.pointId === pointId);
    return alignment?.status || 'missed';
  };

  const calculateCoverage = (slide: Slide) => {
    const total = slide.points.length;
    if (total === 0) return 0;
    
    let score = 0;
    slide.points.forEach(p => {
      const status = getPointStatus(p.id);
      if (status === 'covered') score += 1;
      else if (status === 'partial') score += 0.5;
    });
    
    return Math.round((score / total) * 100);
  };

  const currentCoverage = calculateCoverage(currentSlide);
  const coveredCount = currentSlide.points.filter(p => 
    getPointStatus(p.id) === 'covered' || getPointStatus(p.id) === 'partial'
  ).length;

  return (
    <div className="bg-gh-bg-secondary border border-gh-border rounded-xl overflow-hidden">
      {/* 슬라이드 본문 - 실제 프레젠테이션처럼 */}
      <div className="aspect-[16/9] bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex flex-col relative">
        {/* 슬라이드 번호 */}
        <div className="absolute top-4 right-4 text-white/40 text-sm">
          {currentIndex + 1} / {slides.length}
        </div>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-white mb-8">
          {currentSlide.title}
        </h1>

        {/* 내용 - 발표 슬라이드처럼 */}
        <div className="flex-1 space-y-4">
          {currentSlide.points.map((point) => {
            const status = getPointStatus(point.id);
            const isCovered = status === 'covered' || status === 'partial';
            
            return (
              <div
                key={point.id}
                className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-300 ${
                  isCovered 
                    ? 'bg-green-500/20 border-l-4 border-green-400' 
                    : 'bg-white/5'
                }`}
              >
                <div className="mt-1">
                  {isCovered ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/30" />
                  )}
                </div>
                <p className={`text-lg leading-relaxed ${
                  isCovered ? 'text-white' : 'text-white/70'
                }`}>
                  {point.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* 하단 커버리지 표시 */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                currentCoverage >= 80 ? 'bg-green-400' : 
                currentCoverage >= 50 ? 'bg-yellow-400' : 
                currentCoverage > 0 ? 'bg-red-400' : 'bg-white/20'
              }`}
              style={{ width: `${currentCoverage}%` }}
            />
          </div>
          <span className={`text-sm font-medium ${
            currentCoverage >= 80 ? 'text-green-400' : 
            currentCoverage >= 50 ? 'text-yellow-400' : 
            'text-white/50'
          }`}>
            {coveredCount}/{currentSlide.points.length}
          </span>
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="flex items-center justify-between p-4 bg-gh-bg border-t border-gh-border">
        <button
          onClick={() => onSlideChange(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gh-border hover:bg-gh-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">이전</span>
        </button>

        {/* 슬라이드 미니맵 */}
        <div className="flex gap-2">
          {slides.map((slide, index) => {
            const slideCoverage = calculateCoverage(slide);
            const isActive = index === currentIndex;
            
            return (
              <button
                key={slide.id}
                onClick={() => onSlideChange(index)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gh-accent text-white'
                    : slideCoverage >= 80
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : slideCoverage > 0
                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                    : 'bg-gh-border text-gh-text-muted hover:bg-gh-border/80'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onSlideChange(Math.min(slides.length - 1, currentIndex + 1))}
          disabled={currentIndex === slides.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gh-border hover:bg-gh-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-sm">다음</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
