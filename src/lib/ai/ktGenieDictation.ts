/**
 * KT Genie Dictation STT client.
 * API reference: https://aiopen.kt.co.kr
 *
 * CORS: KT's API may block browser-origin requests. For local dev add a
 * Vite proxy and set VITE_KT_GENIE_BASE_URL=/kt-stt  (see vite.config.ts).
 */

export interface KTSegment {
  text: string;
  startMs: number;
  endMs: number;
  confidence?: number;
}

const DEFAULT_BASE = 'https://aiopen.kt.co.kr/v2/speech';

function base(): string {
  return (import.meta.env.VITE_KT_GENIE_BASE_URL as string | undefined) ?? DEFAULT_BASE;
}

function authHeaders(): Record<string, string> {
  const apiKey  = import.meta.env.VITE_KT_GENIE_API_KEY   as string | undefined;
  const clientId = import.meta.env.VITE_KT_GENIE_CLIENT_ID as string | undefined;
  const h: Record<string, string> = {};
  if (apiKey)   h['Authorization'] = `Bearer ${apiKey}`;
  if (clientId) h['x-client-id']  = clientId;
  return h;
}

/** Transcribe an audio blob. Throws on error — caller falls back via estimateTimingsFromSegments. */
export async function transcribeWithKTGenie(audioBlob: Blob): Promise<KTSegment[]> {
  if (!import.meta.env.VITE_KT_GENIE_API_KEY) {
    throw new Error('VITE_KT_GENIE_API_KEY is not set');
  }

  const form = new FormData();
  form.append('audio', audioBlob, 'recording.webm');
  form.append('language', 'ko-KR');
  form.append('response_type', 'word_timestamp');

  const res = await fetch(`${base()}/stt`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`KT Genie ${res.status}: ${body}`);
  }

  return normalise(await res.json() as KTRaw);
}

// ── Response normalisation ────────────────────────────────────────────────────
// KT may return timestamps in seconds (float) or milliseconds; normalise to ms.

interface KTRaw {
  data?: { segments?: RawSeg[] };
  segments?: RawSeg[];
}
interface RawSeg {
  text?: string;
  start?: number; end?: number;
  start_time?: number; end_time?: number;
  confidence?: number;
}

const toMs = (v?: number) => v === undefined ? 0 : v < 10_000 ? Math.round(v * 1000) : Math.round(v);

function normalise(raw: KTRaw): KTSegment[] {
  return (raw.data?.segments ?? raw.segments ?? [])
    .filter(s => s.text?.trim())
    .map(s => ({
      text:       s.text!.trim(),
      startMs:    toMs(s.start_time ?? s.start),
      endMs:      toMs(s.end_time   ?? s.end),
      confidence: s.confidence,
    }));
}

// ── Fallback: estimate timings from Web Speech segments ───────────────────────

export interface FallbackSegment { text: string; timestamp: number; }

/**
 * When KT Genie is unavailable, convert Web Speech segment timestamps
 * into the KTSegment shape so the rest of the pipeline stays uniform.
 */
export function estimateTimingsFromSegments(segments: FallbackSegment[]): KTSegment[] {
  return segments.map((seg, i) => {
    const wordCount  = seg.text.split(/\s+/).length;
    const durationMs = Math.max(1000, wordCount * 400); // ~150 wpm Korean
    return {
      text:    seg.text,
      startMs: seg.timestamp,
      endMs:   segments[i + 1]?.timestamp ?? seg.timestamp + durationMs,
    };
  });
}
