import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set once at module load — safe to call multiple times (idempotent assignment).
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function loadPdfFromFile(file: File): Promise<PDFDocumentProxy> {
  const data = await file.arrayBuffer();
  return pdfjsLib.getDocument({ data }).promise;
}

export async function renderPageToUrl(page: PDFPageProxy, scale: number): Promise<string> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  await page.render({ canvasContext: ctx, viewport }).promise;

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('Canvas toBlob returned null')); return; }
        resolve(URL.createObjectURL(blob));
      },
      'image/jpeg',
      0.85,
    );
  });
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
