import type { Slide, SlidePoint } from '../types';

interface PageData {
  pageNumber: number;
  imageUrl: string;
  text: string;
}

export function buildSlideFromPage({ pageNumber, imageUrl, text }: PageData): Slide {
  const lines = text.split('\n').filter(Boolean);

  const title = lines[0]
    ? lines[0].trim().slice(0, 80)
    : `슬라이드 ${pageNumber}`;

  // Use up to 6 remaining lines as seed checkpoints — mirrors the keyword
  // heuristic already used in SlideUploader.addPoint (split + length > 2).
  const points: SlidePoint[] = lines
    .slice(1, 7)
    .filter((line) => line.trim().length > 0)
    .map((line, idx) => ({
      id: `pdf-${pageNumber}-p${idx}-${Date.now()}`,
      text: line.trim(),
      importance: 'important' as SlidePoint['importance'],
      keywords: line.split(' ').filter((w) => w.length > 2),
    }));

  return {
    id: `pdf-slide-${pageNumber}-${Date.now()}`,
    number: pageNumber,
    title,
    imageUrl,
    points,
    coveragePercent: 0,
    coveredPoints: [],
    missedPoints: [],
  };
}
