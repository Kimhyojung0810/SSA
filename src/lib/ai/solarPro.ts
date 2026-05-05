import type { PresentationContext, Slide, SolarVerdict } from '../../types';
import type { ParsedElement } from './upstageDocumentParse';

const CHAT_URL = 'https://api.upstage.ai/v1/chat/completions';
const MODEL = 'solar-pro';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function solarChat(messages: Message[], jsonMode = false): Promise<string> {
  const apiKey = import.meta.env.VITE_UPSTAGE_API_KEY as string | undefined;
  if (!apiKey) throw new Error('VITE_UPSTAGE_API_KEY is not set');

  const body: Record<string, unknown> = { model: MODEL, messages };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Solar Pro ${res.status}: ${err}`);
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? '';
}

function safeParseJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T; } catch { /* try extracting */ }
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]) as T; } catch { /* fall through */ } }
  return fallback;
}

// ── 1. Classify slide elements ────────────────────────────────────────────────

export interface ClassifiedPoint {
  text: string;
  importance: 'critical' | 'important' | 'optional' | 'decorative';
  keyMessage: string;
  category: 'title' | 'text' | 'table' | 'chart' | 'list';
}

const CLASSIFY_SYSTEM = `당신은 발표 전문가입니다. 슬라이드 요소의 중요도를 발표 맥락에 맞게 분류합니다.

중요도 기준:
- critical: 반드시 설명해야 하는 핵심 내용
- important: 설명하면 좋은 중요 내용
- optional: 시간이 있으면 설명할 내용
- decorative: 설명 불필요한 시각적·장식적 요소

예시 (pitch, investors):
"매출 성장률 25%" → critical / "기술 스택 상세" → optional / "팀 사진" → decorative

예시 (lecture, general):
"핵심 개념 정의" → critical / "고급 수식" → optional / "사례 연구" → important

JSON만 응답: {"points":[{"text":"...","importance":"...","keyMessage":"...","category":"..."}]}`;

export async function classifySlideElements(
  elements: ParsedElement[],
  context: PresentationContext,
): Promise<ClassifiedPoint[]> {
  const ctxLine = `발표 유형: ${context.type} | 청중: ${context.audience} | 시간: ${context.timeLimitMinutes}분`;
  const elList = elements
    .filter(e => e.text.trim().length > 2)
    .map(e => `[${e.category}] ${e.text.trim()}`)
    .join('\n');

  if (!elList) return [];

  const raw = await solarChat(
    [{ role: 'system', content: CLASSIFY_SYSTEM },
     { role: 'user', content: `${ctxLine}\n\n슬라이드 요소:\n${elList}` }],
    true,
  );

  return safeParseJson<{ points?: ClassifiedPoint[] }>(raw, { points: [] }).points ?? [];
}

// ── 2. Evaluate full presentation ─────────────────────────────────────────────

export interface PointVerdict {
  pointId: string;
  verdict: SolarVerdict;
  feedback: string;
}

export interface SlideTimingFeedback {
  slideId: string;
  recommendedSeconds: number;
}

export interface EvaluationResult {
  verdicts: PointVerdict[];
  timingFeedback: SlideTimingFeedback[];
}

const EVAL_SYSTEM = `당신은 발표 평가 전문가입니다. 슬라이드 포인트와 발화 내용을 비교해 각 포인트를 평가합니다.

평가 레이블:
- covered: 포인트를 적절히 설명함
- justified_omission: 생략했지만 맥락상 acceptable (optional/decorative 항목)
- critical_missing: critical/important 내용을 설명하지 않음
- logical_inconsistency: 슬라이드와 다른 수치·사실 언급
- over_explanation: 중요도 낮은 항목에 지나치게 많은 시간 사용

JSON만 응답:
{"verdicts":[{"pointId":"...","verdict":"...","feedback":"..."}],"timingFeedback":[{"slideId":"...","recommendedSeconds":90}]}`;

export async function evaluatePresentation(
  slides: Slide[],
  transcript: string,
  context: PresentationContext,
): Promise<EvaluationResult> {
  const ctxLine = `발표 유형: ${context.type} | 청중: ${context.audience} | 총 시간: ${context.timeLimitMinutes}분`;
  const slidesSummary = slides
    .map(s =>
      `[슬라이드 ${s.number}: ${s.title}]\n` +
      s.points.map(p => `  - [${p.id}] (${p.importance}) ${p.text}`).join('\n'),
    )
    .join('\n\n');

  const raw = await solarChat(
    [{ role: 'system', content: EVAL_SYSTEM },
     { role: 'user', content: `${ctxLine}\n\n슬라이드:\n${slidesSummary}\n\n발화 전문:\n${transcript}` }],
    true,
  );

  return safeParseJson<EvaluationResult>(raw, { verdicts: [], timingFeedback: [] });
}

// ── 3. Generate one Q&A question ──────────────────────────────────────────────

export async function generateQAQuestion(slides: Slide[]): Promise<string> {
  const summary = slides
    .map(s =>
      `${s.title}: ${s.points
        .filter(p => p.importance === 'critical' || p.importance === 'important')
        .map(p => p.text)
        .join(', ')}`,
    )
    .join('\n');

  const raw = await solarChat([
    { role: 'system', content: '발표를 들은 청중입니다. 핵심 내용을 바탕으로 날카롭지만 합리적인 질문 하나를 한국어로 생성하세요. 질문 텍스트만 반환하세요.' },
    { role: 'user', content: `발표 핵심:\n${summary}` },
  ]);

  return raw.trim();
}

// ── 4. Evaluate Q&A answer ────────────────────────────────────────────────────

export interface QAScore {
  consistency: number;
  clarity: number;
  feedback: string;
}

export async function evaluateQAAnswer(
  question: string,
  answer: string,
  slides: Slide[],
): Promise<QAScore> {
  const content = slides
    .map(s => `${s.title}: ${s.points.map(p => p.text).join(', ')}`)
    .join('\n');

  const raw = await solarChat(
    [
      { role: 'system', content: '발표 Q&A 평가자입니다. 슬라이드 일관성(0-100)과 명확성(0-100)을 평가하고 한 줄 피드백을 작성하세요. JSON만: {"consistency":점수,"clarity":점수,"feedback":"..."}' },
      { role: 'user', content: `슬라이드:\n${content}\n\n질문: ${question}\n답변: ${answer}` },
    ],
    true,
  );

  return safeParseJson<QAScore>(raw, { consistency: 0, clarity: 0, feedback: '평가 실패' });
}
