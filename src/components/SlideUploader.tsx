import { Upload, FileText, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Slide, SlidePoint } from '../types';

interface SlideUploaderProps {
  onSlidesUpdate: (slides: Slide[]) => void;
  currentSlides: Slide[];
}

export function SlideUploader({ onSlidesUpdate, currentSlides }: SlideUploaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [newPointText, setNewPointText] = useState('');
  const [newPointImportance, setNewPointImportance] = useState<SlidePoint['importance']>('important');

  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      number: currentSlides.length + 1,
      title: `슬라이드 ${currentSlides.length + 1}`,
      points: [],
      coveragePercent: 0,
      coveredPoints: [],
      missedPoints: [],
    };
    onSlidesUpdate([...currentSlides, newSlide]);
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
    const updated = currentSlides
      .filter(s => s.id !== slideId)
      .map((s, i) => ({ ...s, number: i + 1 }));
    onSlidesUpdate(updated);
    if (editingSlide?.id === slideId) {
      setEditingSlide(null);
      setIsEditing(false);
    }
  };

  if (!isEditing) {
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
          {currentSlides.map((slide) => (
            <div
              key={slide.id}
              className="flex items-center justify-between p-3 bg-gh-bg rounded border border-gh-border hover:border-gh-accent/50 cursor-pointer transition-colors"
              onClick={() => {
                setEditingSlide(slide);
                setIsEditing(true);
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-gh-text-muted">#{slide.number}</span>
                <span className="text-gh-text">{slide.title}</span>
                <span className="text-xs text-gh-text-muted">
                  ({slide.points.length} 포인트)
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSlide(slide.id);
                }}
                className="p-1 hover:bg-gh-red/20 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-gh-red" />
              </button>
            </div>
          ))}
        </div>

        {currentSlides.length === 0 && (
          <div className="text-center py-8 text-gh-text-muted">
            <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">슬라이드를 추가해서 시작하세요</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gh-bg-secondary border border-gh-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gh-accent" />
          <span className="font-semibold text-gh-text">
            슬라이드 #{editingSlide?.number} 편집
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

      {editingSlide && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gh-text-muted mb-1">제목</label>
            <input
              type="text"
              value={editingSlide.title}
              onChange={(e) => updateSlideTitle(editingSlide.id, e.target.value)}
              className="w-full px-3 py-2 bg-gh-bg border border-gh-border rounded text-gh-text focus:border-gh-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gh-text-muted mb-2">체크포인트</label>
            <div className="space-y-2 mb-3">
              {editingSlide.points.map((point) => (
                <div
                  key={point.id}
                  className="flex items-center gap-2 p-2 bg-gh-bg rounded border border-gh-border"
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
                className="px-3 py-2 bg-gh-bg border border-gh-border rounded text-gh-text text-sm focus:border-gh-accent focus:outline-none"
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
                className="flex-1 px-3 py-2 bg-gh-bg border border-gh-border rounded text-gh-text text-sm focus:border-gh-accent focus:outline-none"
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
      )}
    </div>
  );
}
