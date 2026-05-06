import type { ContextFidelityData } from '../types';

export const DEMO_CONTEXT_FIDELITY: ContextFidelityData = {
  overallScore: 54,
  missingCount: 2,
  weakCount: 2,
  verdict:
    '발표에서 방법론적 선택 근거와 연구 한계 인지가 충분히 제시되지 않았습니다. 특히 Card Sorting의 주관성 문제와 감성 분석 기준의 모호성에 대한 방어 논거가 필요합니다.',
  items: [
    {
      id: 'ctx-1',
      category: '방법론 선택 근거',
      requirement:
        'PRISMA, Card Sorting, HCI 전문가 검토를 각각 왜 선택했는지, 대안 방법 대비 어떤 우위가 있는지 설명해야 합니다.',
      whatWasProvided:
        '이 논문은 PRISMA 기반 SLR로 문헌을 수집하고, card sorting을 통해 5-category taxonomy를 만들었습니다. 이후 HCI 전문가 검토를 거쳐 정리했습니다.',
      level: 'weak',
      suggestion:
        'PRISMA가 다른 문헌 검토 방식보다 투명성을 보장하는 이유, Card Sorting이 귀납적 범주화에 적합한 이유를 한 문장씩 추가하세요.',
    },
    {
      id: 'ctx-2',
      category: 'Card Sorting 주관성 방어',
      requirement:
        'Card Sorting은 연구자 해석에 의존하므로, 주관성을 어떻게 통제했는지(협업 구조, 합의 절차 등)를 설명해야 합니다.',
      level: 'missing',
      suggestion:
        '복수 연구자 협업과 HCI 전문가 검토가 주관성 통제 장치임을 명시하세요. "두 연구자가 독립적으로 분류 후 합의"와 같은 구체적 절차를 언급하면 효과적입니다.',
    },
    {
      id: 'ctx-3',
      category: '감성 분석 기준 명확화',
      requirement:
        '"Average"의 정확한 기준(전체 카테고리 평균인지, 플랫폼 간 비교인지)과 분석 단위(사용자 인식 vs. 실제 결함)를 명시해야 합니다.',
      whatWasProvided:
        '감성분석 결과 negative가 average보다 높은 항목은 긴급한 UX 개선이 필요합니다.',
      level: 'weak',
      suggestion:
        '"여기서 average는 전체 카테고리의 negative 비율 평균을 의미합니다"라고 기준을 먼저 정의한 뒤 결과를 제시하세요.',
    },
    {
      id: 'ctx-4',
      category: '연구 한계 인지',
      requirement:
        '사용자 리뷰 기반 분석의 한계(편향 가능성, 플랫폼 제한, 시점 의존성)를 발표자 스스로 언급해야 합니다.',
      level: 'missing',
      suggestion:
        '"본 연구는 앱스토어 리뷰에 한정되어 있어 실제 사용 경험 전체를 반영하지 못할 수 있습니다"와 같이 한계를 선제적으로 인정하면 신뢰도가 높아집니다.',
    },
    {
      id: 'ctx-5',
      category: '청중 맞춤 전문 용어 설명',
      requirement:
        'PRISMA, SLR, Card Sorting 등 전문 용어를 청중이 HCI 비전공자임을 가정하고 간략히 풀어 설명해야 합니다.',
      whatWasProvided:
        'PRISMA 기반 SLR, card sorting, HCI 전문가 검토, taxonomy 등 용어를 직접 사용하며 Presence, Interaction, Imagination, Economy, Policy로 분류 결과를 제시했습니다.',
      level: 'adequate',
      suggestion:
        '현재 수준으로 충분합니다. 다만 Card Sorting을 "개념 분류 실험"으로 한 번 더 풀어주면 더 좋습니다.',
    },
  ],
};
