import type { KeyDeliveryData } from '../types';

export const DEMO_KEY_DELIVERY: KeyDeliveryData = {
  overallRate: 67,
  verdict:
    '핵심 흐름의 약 2/3가 전달되었습니다. 연구 방법론의 각 단계 간 논리 연결과 결론의 시사점이 보완되면 발표 완성도가 크게 높아집니다.',
  sections: [
    {
      id: 'flow-1',
      label: '서론 — 문제 제기',
      keyMessage:
        '메타버스 UX 연구에서 학계·산업계·사용자 간 정의 격차가 존재하며, 이것이 본 연구의 출발점임을 설명한다.',
      status: 'delivered',
      coverage: 88,
      speechEvidence:
        '산업계는 메타버스를 마케팅 용어로 보고, 학계는 기술적·기능적 성취로 봅니다. 그래서 정의가 혼란스러워 UX 분석이 어렵습니다.',
    },
    {
      id: 'flow-2',
      label: '배경 — 선행 연구 및 갭 분석',
      keyMessage:
        'Academia–Industry Gap → Academia–User Gap으로 이어지는 단계적 논증 구조를 통해 사용자 리뷰 분석의 필요성을 도출한다.',
      status: 'partial',
      coverage: 52,
      speechEvidence:
        '다음으로 저자들은 사용자 리뷰를 분석해 실제 UX 이슈를 확인했습니다.',
    },
    {
      id: 'flow-3',
      label: '방법론 — 3단계 절차',
      keyMessage:
        'PRISMA 기반 SLR → Card Sorting → HCI 전문가 검토의 각 단계가 왜 필요하고 무엇을 보장하는지 구분하여 설명한다.',
      status: 'partial',
      coverage: 45,
      speechEvidence:
        '이 논문은 PRISMA 기반 SLR로 문헌을 수집하고, card sorting을 통해 5-category taxonomy를 만들었습니다.',
    },
    {
      id: 'flow-4',
      label: '결과 — Taxonomy 및 감성 분석',
      keyMessage:
        '5개 카테고리 체계(Presence, Interaction, Imagination, Economy, Policy)와 플랫폼별 감성 분석 결과를 명확히 제시한다.',
      status: 'delivered',
      coverage: 81,
      speechEvidence:
        '감성분석 결과 negative가 average보다 높은 항목은 긴급한 UX 개선이 필요합니다. 특히 두 플랫폼 모두 Safety and Privacy 이슈가 큽니다.',
    },
    {
      id: 'flow-5',
      label: '결론 — 시사점 및 한계',
      keyMessage:
        '연구 결과가 HCI 실무와 정책 설계에 주는 시사점, 그리고 사용자 리뷰 기반 분석의 한계를 언급한다.',
      status: 'missed',
      coverage: 0,
    },
  ],
};
