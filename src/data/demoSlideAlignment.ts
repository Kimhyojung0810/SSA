import type { SlideAlignmentData } from '../types';

export const DEMO_SLIDE_ALIGNMENT: SlideAlignmentData = {
  overallScore: 61,
  majorGapCount: 2,
  verdict:
    '전반적으로 발표 방향은 슬라이드와 유사하나, 2개 슬라이드에서 발화 방향이 슬라이드 의도와 크게 어긋났습니다. 특히 감성 분석 해석과 결론 단락에서 내용 이탈이 확인됩니다.',
  records: [
    {
      slideNumber: 2,
      slideTitle: '연구 배경 및 목적',
      alignmentScore: 84,
      gap: 'none',
      slideKeyPoint: '메타버스 UX 연구의 필요성과 본 연구의 목적을 제시한다.',
      whatWasSaid:
        '메타버스가 단순한 기술 트렌드가 아니라 UX 연구의 중요한 대상임을 먼저 설명하고, 이 논문이 그 격차를 분석하겠다는 방향으로 시작했습니다.',
    },
    {
      slideNumber: 7,
      slideTitle: 'Academia–Industry Gap',
      alignmentScore: 72,
      gap: 'minor',
      slideKeyPoint:
        '학계의 기능적 정의 vs. 산업계의 마케팅 활용 사이의 정의 격차를 단계적으로 설명한다.',
      whatWasSaid:
        '산업계는 메타버스를 마케팅 용어로 보고, 학계는 기술적·기능적 성취로 봅니다. 그래서 정의가 혼란스러워 UX 분석이 어렵습니다.',
      gapReason:
        '슬라이드는 두 입장의 차이를 단계적으로 설명하도록 구성되어 있으나, 발표에서는 결론("정의가 혼란스럽다")만 제시하고 왜 그 격차가 UX 연구에 영향을 주는지의 논리 연결이 생략되었습니다.',
    },
    {
      slideNumber: 14,
      slideTitle: '연구 방법론 — PRISMA & Card Sorting',
      alignmentScore: 58,
      gap: 'minor',
      slideKeyPoint:
        'PRISMA 프로토콜이 문헌 선별 투명성을 보장하고, Card Sorting이 개념 범주화 도구로서 별개의 역할을 한다는 점을 구분하여 설명한다.',
      whatWasSaid:
        '이 논문은 PRISMA 기반 SLR로 문헌을 수집하고, card sorting을 통해 5-category taxonomy를 만들었습니다.',
      gapReason:
        '슬라이드는 두 방법론이 각각 다른 목적을 가진 독립 단계임을 강조하지만, 발표는 두 방법을 단일 흐름으로 묶어 소개해 각각이 무엇을 보장하는지의 설명이 누락되었습니다.',
    },
    {
      slideNumber: 21,
      slideTitle: '감성 분석 결과 — Safety & Privacy',
      alignmentScore: 34,
      gap: 'major',
      slideKeyPoint:
        '판단 기준은 "사용자가 해당 항목을 문제로 인식하는 정도"이며, 실제 플랫폼의 객관적 결함과 동일시할 수 없다.',
      whatWasSaid:
        '감성분석 결과 negative가 average보다 높은 항목은 긴급한 UX 개선이 필요합니다. 특히 두 플랫폼 모두 Safety and Privacy 이슈가 크기 때문에 실제 플랫폼 차원에서 시급히 해결해야 할 결함이라고 볼 수 있습니다.',
      gapReason:
        '슬라이드는 분석 단위가 "사용자 인식"임을 명시하지만, 발표에서는 이를 "실제 플랫폼 결함"으로 단정하여 데이터 해석 범위를 크게 벗어난 주장이 제시되었습니다.',
    },
    {
      slideNumber: 27,
      slideTitle: '결론 및 연구 한계',
      alignmentScore: 18,
      gap: 'major',
      slideKeyPoint:
        '5-category taxonomy의 HCI 실무 적용 가능성, 정책적 시사점, 그리고 사용자 리뷰 기반 분석의 한계를 명시한다.',
      whatWasSaid: '이상으로 발표를 마치겠습니다. 감사합니다.',
      gapReason:
        '슬라이드에 명시된 시사점과 연구 한계가 전혀 언급되지 않았습니다. 결론 슬라이드의 핵심 내용이 발화에서 완전히 이탈하여 발표가 마무리되었습니다.',
    },
  ],
};
