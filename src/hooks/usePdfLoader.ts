import { useState, useCallback } from 'react';
import type { Slide } from '../types';
import { loadPdfFromFile, renderPageToUrl, extractPageText } from '../lib/pdfUtils';
import { buildSlideFromPage } from '../lib/slideFromPdf';

interface PdfLoaderState {
  isLoading: boolean;
  error: string | null;
}

interface PdfLoaderReturn extends PdfLoaderState {
  loadPdf: (file: File) => Promise<Slide[]>;
  reset: () => void;
}

export function usePdfLoader(): PdfLoaderReturn {
  const [state, setState] = useState<PdfLoaderState>({ isLoading: false, error: null });

  const loadPdf = useCallback(async (file: File): Promise<Slide[]> => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setState({ isLoading: false, error: 'PDF 파일만 업로드할 수 있습니다.' });
      return [];
    }

    setState({ isLoading: true, error: null });

    try {
      const doc = await loadPdfFromFile(file);
      const slides: Slide[] = [];

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const [imageUrl, text] = await Promise.all([
          renderPageToUrl(page, 1.5),
          extractPageText(page),
        ]);
        slides.push(buildSlideFromPage({ pageNumber: i, imageUrl, text }));
      }

      setState({ isLoading: false, error: null });
      return slides;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setState({ isLoading: false, error: `PDF를 불러올 수 없습니다: ${msg}` });
      return [];
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null });
  }, []);

  return { ...state, loadPdf, reset };
}
