import type { Slide, SlidePoint, PresentationContext } from '../types';
import { documentParse } from './ai/upstageDocumentParse';
import { classifySlideElements } from './ai/solarPro';

/**
 * Enrich basic slides (already rendered by pdfjs) with Upstage Document Parse
 * structure + Solar Pro importance classification.
 *
 * Runs AFTER the user sees slides from usePdfLoader so the UI is never blocked.
 * onProgress lets the caller update state slide-by-slide as each one finishes.
 * Falls back to existing heuristic points on any API failure — never crashes.
 */
export async function enrichSlides(
  file: File,
  basicSlides: Slide[],
  context: PresentationContext,
  onProgress?: (enriched: Slide, index: number) => void,
): Promise<Slide[]> {
  let pages;
  try {
    pages = await documentParse(file);
  } catch (err) {
    console.warn('[enrichSlides] Document Parse failed, keeping heuristic slides:', err);
    return basicSlides;
  }

  const result: Slide[] = [];

  for (let i = 0; i < basicSlides.length; i++) {
    const base = basicSlides[i];
    const page = pages.find(p => p.pageNumber === base.number);

    if (!page || page.elements.length === 0) {
      result.push(base);
      onProgress?.(base, i);
      continue;
    }

    let points: SlidePoint[] = base.points;

    try {
      const classified = await classifySlideElements(page.elements, context);
      if (classified.length > 0) {
        points = classified.map((cp, idx) => ({
          id: `solar-${base.number}-p${idx}-${Date.now()}`,
          text: cp.text,
          importance: mapImportance(cp.importance),
          keywords: cp.keyMessage.split(' ').filter(w => w.length > 2),
        }));
      }
    } catch (err) {
      console.warn(`[enrichSlides] Solar classify failed for slide ${base.number}:`, err);
    }

    const titleEl = page.elements.find(
      e => e.category === 'heading1' || e.category === 'heading2',
    );

    const slide: Slide = {
      ...base,
      title: titleEl?.text?.trim() || base.title,
      content: page.fullText,
      points,
    };

    result.push(slide);
    onProgress?.(slide, i);
  }

  return result;
}

function mapImportance(
  raw: 'critical' | 'important' | 'optional' | 'decorative',
): SlidePoint['importance'] {
  if (raw === 'optional' || raw === 'decorative') return 'supporting';
  return raw;
}
