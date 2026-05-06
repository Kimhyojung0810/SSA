import { DEMO_QA_ITEMS } from './demoQA';
import type { QAAnswer, QAReadinessData, QAReadinessItem, QAReadinessStatus } from '../types';

interface ExpectedCriterion {
  label: string;
  keywords: string[];
}

const EXPECTED_CRITERIA: Record<string, ExpectedCriterion[]> = {
  'qa-1': [
    { label: 'PRISMA는 문헌 선별 절차의 투명성 장치로 설명', keywords: ['prisma', '문헌', '선별', '투명'] },
    { label: 'Card sorting은 개념 범주화 과정으로 설명', keywords: ['card', 'sorting', '범주', '분류'] },
    { label: 'Taxonomy 객관성은 전문가 검토와 협업으로 보완됨을 언급', keywords: ['객관', '전문가', '검토', '협업', '보완'] },
  ],
  'qa-2': [
    { label: 'Academia-industry gap을 정의 차이의 출발점으로 연결', keywords: ['industry', '산업', '학계', '정의', '차이'] },
    { label: 'Academia-user gap을 실제 사용자 경험 차이로 확장', keywords: ['user', '사용자', '경험', '리뷰', '실제'] },
    { label: '두 gap 사이의 단계적 논리 전환을 설명', keywords: ['연결', '확장', '전환', '그래서', '이후'] },
  ],
  'qa-3': [
    { label: 'Average의 기준을 먼저 명확히 함', keywords: ['average', '평균', '기준'] },
    { label: '감성 분석 결과를 사용자 인식 데이터로 한정', keywords: ['사용자', '리뷰', '인식'] },
    { label: '실제 결함 단정에는 추가 근거가 필요함을 언급', keywords: ['결함', '단정', '추가', '근거', '정책', '로그', '인터뷰'] },
  ],
};

const DEFAULT_CRITERIA: ExpectedCriterion[] = [
  { label: '질문의 핵심 개념을 직접 답변', keywords: [] },
  { label: '발표 내용과 연결되는 근거를 제시', keywords: [] },
  { label: '해석 범위와 한계를 과도하게 넘기지 않음', keywords: [] },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ');
}

function criterionCovered(answer: string, criterion: ExpectedCriterion): boolean {
  if (criterion.keywords.length === 0) return answer.trim().length >= 30;

  const normalized = normalize(answer);
  return criterion.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function getStatus(score: number): QAReadinessStatus {
  if (score >= 75) return 'strong';
  if (score >= 45) return 'partial';
  return 'weak';
}

function buildSuggestion(status: QAReadinessStatus, missingCriteria: string[]): string {
  if (status === 'strong') {
    return '예상 질문의 핵심을 대체로 보완했습니다. 실제 답변에서는 먼저 한 문장 결론을 말한 뒤 근거를 덧붙이면 더 안정적입니다.';
  }

  if (missingCriteria.length === 0) {
    return '답변 길이나 구체성이 부족합니다. 질문의 전제, 근거, 한계를 분리해 2-3문장으로 보완하세요.';
  }

  return `${missingCriteria[0]} 내용을 먼저 보강하세요. 이후 발표에서 말한 근거와 연결하면 질문 대비도가 높아집니다.`;
}

function evaluateAnswer(answer: QAAnswer): QAReadinessItem {
  const source = DEMO_QA_ITEMS.find((item) => item.id === answer.qaId);
  const criteria = EXPECTED_CRITERIA[answer.qaId] ?? DEFAULT_CRITERIA;
  const coveredCriteria = criteria
    .filter((criterion) => criterionCovered(answer.userAnswer, criterion))
    .map((criterion) => criterion.label);
  const missingCriteria = criteria
    .filter((criterion) => !criterionCovered(answer.userAnswer, criterion))
    .map((criterion) => criterion.label);

  const score = Math.round((coveredCriteria.length / criteria.length) * 100);
  const status = getStatus(score);

  return {
    qaId: answer.qaId,
    question: answer.question,
    userAnswer: answer.userAnswer,
    answeredVia: answer.answeredVia,
    checkpoint: answer.checkpoint,
    expectedQuestionType: source?.tag ?? '예상 질문',
    slideRef: source?.slideRef ?? '발표 전반',
    score,
    status,
    coveredCriteria,
    missingCriteria,
    suggestion: buildSuggestion(status, missingCriteria),
  };
}

export function buildQAReadinessData(answers: QAAnswer[] = []): QAReadinessData {
  const items = answers.map(evaluateAnswer);
  const answeredCount = items.length;
  const expectedCount = DEMO_QA_ITEMS.length;
  const overallScore = answeredCount > 0
    ? Math.round(items.reduce((sum, item) => sum + item.score, 0) / answeredCount)
    : 0;

  const strongCount = items.filter((item) => item.status === 'strong').length;
  const partialCount = items.filter((item) => item.status === 'partial').length;
  const weakCount = items.filter((item) => item.status === 'weak').length;
  const unansweredCount = Math.max(expectedCount - answeredCount, 0);

  const verdict = answeredCount === 0
    ? 'Q&A 답변이 아직 제공되지 않아 예상 질문 대비도를 평가할 수 없습니다. 발표 후 리포트 전에 보완 질문에 답하면 이 항목이 자동으로 채점됩니다.'
    : unansweredCount > 0
      ? `${answeredCount}/${expectedCount}개 예상 질문에 답했습니다. 미응답 질문 ${unansweredCount}개가 남아 있어 방어 가능 범위가 제한됩니다.`
      : overallScore >= 75
        ? '예상 질문에 대한 보완 답변이 충분합니다. 실제 질의응답에서는 답변 첫 문장을 결론형으로 압축하면 설득력이 더 좋아집니다.'
        : '예상 질문 일부에서 핵심 보완 요소가 빠졌습니다. 누락된 기준을 중심으로 답변을 다시 구성하면 Q&A 방어력이 개선됩니다.';

  return {
    overallScore,
    answeredCount,
    expectedCount,
    strongCount,
    partialCount,
    weakCount,
    items,
    verdict,
  };
}
