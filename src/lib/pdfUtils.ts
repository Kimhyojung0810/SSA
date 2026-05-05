import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set once at module load — safe to call multiple times (idempotent assignment).
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// CMap files map font character codes — required for Korean/CJK font rendering.
// Standard font data covers the 14 built-in PDF fonts.
const CDN = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}`;
const CMAP_URL = `${CDN}/cmaps/`;
const STANDARD_FONT_DATA_URL = `${CDN}/standard_fonts/`;

export async function loadPdfFromFile(file: File): Promise<PDFDocumentProxy> {
  const data = await file.arrayBuffer();
  return pdfjsLib.getDocument({
    data,
    cMapUrl: CMAP_URL,
    cMapPacked: true,
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
  }).promise;
}

export async function renderPageToUrl(page: PDFPageProxy, scale: number): Promise<string> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  await page.render({ canvas, canvasContext: ctx, viewport }).promise;

  return canvas.toDataURL('image/jpeg', 0.85);
}

export async function extractPageText(page: PDFPageProxy): Promise<string> {
  const content = await page.getTextContent();
  const lines: string[] = [];
  let current = '';

  for (const item of content.items) {
    if (!('str' in item)) continue;
    current += (current ? ' ' : '') + item.str;
    if (item.hasEOL) {
      const trimmed = current.trim();
      if (trimmed) lines.push(trimmed);
      current = '';
    }
  }

  const remainder = current.trim();
  if (remainder) lines.push(remainder);
  return lines.join('\n');
}
