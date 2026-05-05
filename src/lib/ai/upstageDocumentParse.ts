const UPSTAGE_BASE = 'https://api.upstage.ai/v1';

export interface ParsedElement {
  id: number;
  page: number;
  /** heading1 | heading2 | paragraph | list | table | figure | caption | footer */
  category: string;
  text: string;
  html: string;
}

export interface ParsedPage {
  pageNumber: number;
  elements: ParsedElement[];
  fullText: string;
}

/**
 * Send the entire PDF to Upstage Document Parse.
 * Returns structured elements grouped by page (1-indexed).
 * Throws on API error — callers must catch and fall back to
 * the existing pdfjs heuristic (buildSlideFromPage).
 */
export async function documentParse(file: File): Promise<ParsedPage[]> {
  const apiKey = import.meta.env.VITE_UPSTAGE_API_KEY as string | undefined;
  if (!apiKey) throw new Error('VITE_UPSTAGE_API_KEY is not set');

  const form = new FormData();
  form.append('document', file);
  form.append('ocr', 'auto');

  const res = await fetch(`${UPSTAGE_BASE}/document-ai/document-parse`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Document Parse ${res.status}: ${body}`);
  }

  const data = await res.json() as { elements?: ParsedElement[] };
  const elements: ParsedElement[] = data.elements ?? [];

  const pageMap = new Map<number, ParsedElement[]>();
  for (const el of elements) {
    const p = el.page ?? 1;
    if (!pageMap.has(p)) pageMap.set(p, []);
    pageMap.get(p)!.push(el);
  }

  return Array.from(pageMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([pageNumber, els]) => ({
      pageNumber,
      elements: els,
      fullText: els.map(e => e.text).filter(Boolean).join('\n'),
    }));
}
