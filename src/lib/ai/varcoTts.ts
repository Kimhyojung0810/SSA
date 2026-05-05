/**
 * NC AI VARCO Voice TTS client.
 * API reference: NC AI developer portal / https://varco.ncsoft.com
 *
 * CORS: NC's API may block browser-origin calls. For local dev add a
 * Vite proxy and set VITE_NC_VARCO_BASE_URL=/varco-tts.
 */

const DEFAULT_BASE = 'https://api.varco.ai/v1/tts';

function base(): string {
  return (import.meta.env.VITE_NC_VARCO_BASE_URL as string | undefined) ?? DEFAULT_BASE;
}

function authHeaders(): Record<string, string> {
  const apiKey   = import.meta.env.VITE_NC_VARCO_API_KEY   as string | undefined;
  const clientId = import.meta.env.VITE_NC_VARCO_CLIENT_ID as string | undefined;
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey)    h['Authorization'] = `Bearer ${apiKey}`;
  if (clientId)  h['x-client-id']  = clientId;
  return h;
}

/**
 * Convert Korean text to speech via VARCO Voice.
 * Returns a temporary object URL for <audio src=...>.
 * Caller must call URL.revokeObjectURL(url) when the audio element unmounts.
 * Throws on error — caller should fall back to speakFallback().
 */
export async function speakWithVARCO(text: string, voice = 'ko_female_1'): Promise<string> {
  if (!import.meta.env.VITE_NC_VARCO_API_KEY) {
    throw new Error('VITE_NC_VARCO_API_KEY is not set');
  }

  const res = await fetch(base(), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ text, voice, language: 'ko-KR', speed: 1.0 }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`VARCO TTS ${res.status}: ${body}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/** Browser SpeechSynthesis fallback — works without any API key. */
export function speakFallback(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang  = 'ko-KR';
  utt.rate  = 0.95;
  window.speechSynthesis.speak(utt);
}
