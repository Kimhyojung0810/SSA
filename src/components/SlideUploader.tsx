import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { Slide, SlidePoint } from '../types';
import { PdfDropzone } from './PdfDropzone';
import { usePdfLoader } from '../hooks/usePdfLoader';

interface SlideUploaderProps {
  onSlidesUpdate: (slides: Slide[]) => void;
  currentSlides: Slide[];
  currentSlideIndex?: number;
  onSlideSelect?: (index: number) => void;
  onPdfUploaded?: (slides: Slide[], file?: File) => void;
  variant?: 'upload' | 'manage';
}

export function SlideUploader({
  onSlidesUpdate,
  currentSlides,
  currentSlideIndex = 0,
  onSlideSelect,
  onPdfUploaded,
  variant = 'manage',
}: SlideUploaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [newPointText, setNewPointText] = useState('');
  const [newPointImportance, setNewPointImportance] = useState<SlidePoint['importance']>('important');

  const { loadPdf, isLoading, error: pdfError } = usePdfLoader();

  // Uploading a PDF replaces all current slides with the parsed pages.
  const handlePdfFile = useCallback(async (file: File) => {
    const newSlides = await loadPdf(file);
    if (newSlides.length > 0) {
      onSlidesUpdate(newSlides);
      onSlideSelect?.(0);
      onPdfUploaded?.(newSlides, file);
    }
  }, [loadPdf, onPdfUploaded, onSlideSelect, onSlidesUpdate]);

  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      number: currentSlides.length + 1,
      title: `슬라이드 ${currentSlides.length + 1}`,
      content: '',
      points: [],
      coveragePercent: 0,
      coveredPoints: [],
      missedPoints: [],
    };
    onSlidesUpdate([...currentSlides, newSlide]);
    onSlideSelect?.(currentSlides.length);
    setEditingSlide(newSlide);
    setIsEditing(true);
  };

  const updateSlideTitle = (slideId: string, title: string) => {
    const updated = currentSlides.map(s => 
      s.id === slideId ? { ...s, title } : s
    );
    onSlidesUpdate(updated);
    if (editingSlide?.id === slideId) {
      setEditingSlide({ ...editingSlide, title });
    }
  };

  const updateSlideContent = (slideId: string, content: string) => {
    const updated = currentSlides.map(s =>
      s.id === slideId ? { ...s, content } : s
    );
    onSlidesUpdate(updated);
    if (editingSlide?.id === slideId) {
      setEditingSlide({ ...editingSlide, content });
    }
  };

  const addPoint = () => {
    if (!editingSlide || !newPointText.trim()) return;

    const newPoint: SlidePoint = {
      id: `p-${Date.now()}`,
      text: newPointText.trim(),
      importance: newPointImportance,
      keywords: newPointText.split(' ').filter(w => w.length > 2),
    };

    const updatedSlide = {
      ...editingSlide,
      points: [...editingSlide.points, newPoint],
    };

    const updated = currentSlides.map(s => 
      s.id === editingSlide.id ? updatedSlide : s
    );

    onSlidesUpdate(updated);
    setEditingSlide(updatedSlide);
    setNewPointText('');
  };

  const removePoint = (pointId: string) => {
    if (!editingSlide) return;

    const updatedSlide = {
      ...editingSlide,
      points: editingSlide.points.filter(p => p.id !== pointId),
    };

    const updated = currentSlides.map(s => 
      s.id === editingSlide.id ? updatedSlide : s
    );

    onSlidesUpdate(updated);
    setEditingSlide(updatedSlide);
  };

  const deleteSlide = (slideId: string) => {
    const deletedIndex = currentSlides.findIndex(s => s.id === slideId);
    const updated = currentSlides
      .filter(s => s.id !== slideId)
      .map((s, i) => ({ ...s, number: i + 1 }));
    onSlidesUpdate(updated);
    if (updated.length > 0) {
      onSlideSelect?.(Math.min(Math.max(deletedIndex, 0), updated.length - 1));
    } else {
      onSlideSelect?.(0);
    }
    if (editingSlide?.id === slideId) {
      setEditingSlide(null);
      setIsEditing(false);
    }
  };

  const renderEditingPanel = () => {
    if (!editingSlide) return null;

    return (
      <div className="space-y-4 rounded-lg border border-gh-accent/40 bg-gh-bg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gh-accent" />
            <span className="font-semibold text-gh-text">
              슬라이드 #{editingSlide.number} 편집
            </span>
          </div>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingSlide(null);
            }}
            className="px-3 py-1.5 border border-gh-border rounded text-sm hover:bg-gh-border transition-colors"
          >
            완료
          </button>
        </div>

        {editingSlide.imageUrl ? (
          <div className="aspect-[16/9] overflow-hidden rounded border border-gh-border bg-white">
            <img
              src={editingSlide.imageUrl}
              alt={editingSlide.title}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] rounded border border-gh-border bg-gh-bg-secondary flex items-center justify-center">
            <p className="text-xs text-gh-text-muted">이미지가 없는 슬라이드입니다.</p>
          </div>
        )}

        <div>
          <label className="block text-sm text-gh-text-muted mb-1">제목</label>
          <input
            type="text"
            value={editingSlide.title}
            onChange={(e) => updateSlideTitle(editingSlide.id, e.target.value)}
            className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded text-gh-text focus:border-gh-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gh-text-muted mb-1">슬라이드 내용 / 발표 스크립트</label>
          <textarea
            value={editingSlide.content || ''}
            onChange={(e) => updateSlideContent(editingSlide.id, e.target.value)}
            placeholder="이 슬라이드에서 발표할 내용이나 보완 설명을 입력하세요..."
            rows={7}
            className="w-full resize-y px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded text-gh-text text-sm leading-relaxed focus:border-gh-accent focus:outline-none"
          />
          <p className="mt-1 text-xs text-gh-text-muted">
            PDF에서 추출된 텍스트를 수정하거나 발표자가 말할 내용을 직접 추가할 수 있습니다.
          </p>
        </div>

        <div>
          <label className="block text-sm text-gh-text-muted mb-2">체크포인트</label>
          <div className="space-y-2 mb-3">
            {editingSlide.points.map((point) => (
              <div
                key={point.id}
                className="flex items-center gap-2 p-2 bg-gh-bg-secondary rounded border border-gh-border"
              >
                <span className={`text-xs px-2 py-0.5 rounded ${
                  point.importance === 'critical'
                    ? 'bg-gh-red/20 text-gh-red'
                    : point.importance === 'important'
                    ? 'bg-gh-yellow/20 text-gh-yellow'
                    : 'bg-gh-text-muted/20 text-gh-text-muted'
                }`}>
                  {point.importance === 'critical' ? '필수' : point.importance === 'important' ? '중요' : '보조'}
                </span>
                <span className="flex-1 text-sm text-gh-text">{point.text}</span>
                <button
                  onClick={() => removePoint(point.id)}
                  className="p-1 hover:bg-gh-red/20 rounded"
                >
                  <Trash2 className="w-3 h-3 text-gh-red" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <select
              value={newPointImportance}
              onChange={(e) => setNewPointImportance(e.target.value as SlidePoint['importance'])}
              className="px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded text-gh-text text-sm focus:border-gh-accent focus:outline-none"
            >
              <option value="critical">필수</option>
              <option value="important">중요</option>
              <option value="supporting">보조</option>
            </select>
            <input
              type="text"
              value={newPointText}
              onChange={(e) => setNewPointText(e.target.value)}
              placeholder="새 포인트 입력..."
              className="flex-1 px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded text-gh-text text-sm focus:border-gh-accent focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && addPoint()}
            />
            <button
              onClick={addPoint}
              disabled={!newPointText.trim()}
              className="px-3 py-2 bg-gh-accent text-white rounded text-sm hover:bg-gh-accent/90 transition-colors disabled:opacity-50"
            >
              추가
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (variant === 'upload') {
    return (
      <div className="bg-gh-bg-secondary border border-gh-border rounded-xl p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-gh-accent" />
            <span className="font-semibold text-gh-text">PDF 업로드</span>
          </div>
          <p className="text-sm text-gh-text-muted">
            발표 자료 PDF를 업로드하면 각 페이지가 슬라이드로 변환되고, 다음 단계에서 내용을 확인할 수 있습니다.
          </p>
        </div>

        <PdfDropzone
          onFileSelected={handlePdfFile}
          isLoading={isLoading}
          error={pdfError}
        />
      </div>
    );
  }

  return (
    <div className="bg-gh-bg-secondary border border-gh-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gh-text-muted" />
          <span className="font-semibold text-gh-text">슬라이드 관리</span>
        </div>
        <button
          onClick={addSlide}
          className="flex items-center gap-2 px-3 py-1.5 bg-gh-green text-white rounded text-sm hover:bg-gh-green/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          슬라이드 추가
        </button>
      </div>

      <div className="space-y-2">
        {currentSlides.map((slide, index) => {
          const isSelected = index === currentSlideIndex;
          const isEditingThisSlide = editingSlide?.id === slide.id && isEditing;
          return (
            <div
              key={slide.id}
              className="space-y-2"
            >
              <div
                className={`flex items-center justify-between gap-3 p-3 bg-gh-bg rounded border cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-gh-accent ring-1 ring-gh-accent/40'
                    : 'border-gh-border hover:border-gh-accent/50'
                }`}
                onClick={() => {
                  onSlideSelect?.(index);
                  setIsEditing(false);
                  setEditingSlide(null);
                }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-sm text-gh-text-muted">#{slide.number}</span>
                  <span className="truncate text-gh-text">{slide.title}</span>
                  <span className="shrink-0 text-xs text-gh-text-muted">
                    ({slide.points.length} 포인트)
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSlideSelect?.(index);
                      setEditingSlide(slide);
                      setIsEditing(true);
                    }}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      isEditingThisSlide
                        ? 'bg-gh-accent text-white'
                        : 'border border-gh-border bg-gh-bg-secondary text-gh-text hover:border-gh-accent/60 hover:text-gh-accent'
                    }`}
                    title="슬라이드 편집"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    편집
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(slide.id);
                    }}
                    className="p-1 hover:bg-gh-red/20 rounded transition-colors"
                    title="슬라이드 삭제"
                  >
                    <Trash2 className="w-4 h-4 text-gh-red" />
                  </button>
                </div>
              </div>
              {isEditingThisSlide && renderEditingPanel()}
            </div>
          );
        })}
      </div>

      {currentSlides.length === 0 && !isLoading && (
        <p className="text-center text-sm text-gh-text-muted py-4">
          PDF를 업로드하거나 슬라이드를 직접 추가하세요
        </p>
      )}

    </div>
  );
}
