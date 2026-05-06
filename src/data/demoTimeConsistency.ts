import type { TimeConsistencyData } from '../types';

export const DEMO_TIME_CONSISTENCY: TimeConsistencyData = {
  totalActualSeconds: 570,
  totalRecommendedSeconds: 570,
  overallScore: 52,
  overCount: 2,
  underCount: 2,
  skippedCount: 1,
  verdict:
    '전체 발표 시간은 목표와 일치하지만, 슬라이드 간 시간 배분이 고르지 않습니다. 슬라이드 21과 7의 과잉 설명에서 확보한 시간을 슬라이드 27의 결론부와 슬라이드 14의 방법론 설명에 재분배하면 구성이 크게 개선됩니다.',
  redistributionSummary:
    '슬라이드 21에서 90초, 슬라이드 7에서 65초 절감 → 슬라이드 27에 75초, 슬라이드 14에 55초, 슬라이드 2에 25초 추가',
  slides: [
    {
      slideNumber: 2,
      slideTitle: '연구 배경 및 필요성',
      actualSeconds: 65,
      recommendedSeconds: 90,
      status: 'under',
      coreContentCoverage: 72,
      underReason:
        '메타버스 플랫폼의 UX 문제 현황과 연구 필요성을 간략히 언급하는 데 그쳤습니다. 기존 연구의 한계와 본 연구의 차별점에 대한 설명이 부족했습니다.',
      suggestion: '현재 65초 → 권장 90초. 25초를 추가해 기존 연구 한계 한 문장과 차별점을 보충하세요.',
    },
    {
      slideNumber: 7,
      slideTitle: 'PRISMA 문헌 수집 절차',
      actualSeconds: 185,
      recommendedSeconds: 120,
      status: 'over',
      coreContentCoverage: 91,
      overReason:
        'PRISMA 다이어그램의 각 단계를 반복해서 설명했습니다. 검색 키워드 선정 이유를 세 번 언급하는 등 중복 설명이 65초 분량 낭비를 유발했습니다.',
      suggestion: '현재 185초 → 권장 120초. 중복 설명을 제거하고 "검색 → 선별 → 포함" 세 단계만 간결하게 짚으세요.',
    },
    {
      slideNumber: 14,
      slideTitle: 'Card Sorting 방법론',
      actualSeconds: 95,
      recommendedSeconds: 150,
      status: 'under',
      coreContentCoverage: 48,
      underReason:
        'Card Sorting 절차 설명이 너무 빨리 지나갔습니다. 주관성 통제 장치(협업 구조, 합의 절차)와 5개 범주의 도출 근거가 설명되지 않아 방법론 방어가 취약합니다.',
      suggestion: '현재 95초 → 권장 150초. 55초를 추가해 "두 연구자 독립 분류 → 불일치 합의" 프로세스를 명시하세요.',
    },
    {
      slideNumber: 21,
      slideTitle: '감성 분석 결과 비교',
      actualSeconds: 210,
      recommendedSeconds: 120,
      status: 'over',
      coreContentCoverage: 85,
      overReason:
        '각 플랫폼별 수치를 일일이 읽는 데 시간을 과다 소비했습니다. 또한 "average"의 정의를 명확히 하지 않은 채 결과를 반복 설명해 청중의 이해를 돕지 못했습니다.',
      suggestion: '현재 210초 → 권장 120초. average 기준을 먼저 정의(10초)한 뒤, 긴급 개선 필요 항목 2–3개만 강조(90초)하세요.',
    },
    {
      slideNumber: 27,
      slideTitle: '결론 및 향후 연구 방향',
      actualSeconds: 15,
      recommendedSeconds: 90,
      status: 'skipped',
      coreContentCoverage: 8,
      underReason:
        '결론 슬라이드를 사실상 건너뛰었습니다. 연구 기여도와 향후 연구 방향이 전혀 전달되지 않아 발표의 완결성이 심각하게 손상되었습니다.',
      suggestion: '현재 15초 → 권장 90초. 75초를 추가해 핵심 기여 2문장, 한계 1문장, 향후 방향 1문장으로 구성하세요.',
    },
  ],
};
