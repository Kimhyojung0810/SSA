import { useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface PdfDropzoneProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export function PdfDropzone({ onFileSelected, isLoading, error }: PdfDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-4">
      <div
        onClick={() => { if (!isLoading) inputRef.current?.click(); }}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) onFileSelected(file);
        }}
        className={[
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          isDragging
            ? 'border-gh-accent bg-gh-accent/10'
            : 'border-gh-border hover:border-gh-accent/50 hover:bg-gh-accent/5',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          disabled={isLoading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelected(file);
            e.target.value = '';
          }}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-gh-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gh-text-muted">PDF 분석 중...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gh-text-muted" />
            <p className="text-sm font-medium text-gh-text">PDF 업로드</p>
            <p className="text-xs text-gh-text-muted">
              PDF 파일을 끌어다 놓거나 클릭해서 선택하세요
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 p-3 bg-gh-red/10 border border-gh-red/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-gh-red flex-shrink-0" />
          <p className="text-sm text-gh-red">{error}</p>
        </div>
      )}
    </div>
  );
}
