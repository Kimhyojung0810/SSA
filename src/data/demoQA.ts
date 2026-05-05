export type QATagType =
  | 'missing_term'
  | 'logic_gap'
  | 'ambiguous_claim';

export interface DemoQA {
  id: string;
  tag: string;
  tagType: QATagType;
  slideRef: string;
  /** Key content extracted from the PDF slide */
  slideContent: string;
  /** What the presenter actually said */
  presenterSaid: string;
  /** Gap analysis: what argument was missing or unsupported */
  referenceBackground: string;
  /** The audience question triggered by the gap */
  question: string;
  /** Ideal answer criteria shown after submission */
  checkpoint: string;
}

export const DEMO_QA_ITEMS: DemoQA[] = [
  {
    id: 'qa-1',
    tag: '핵심 용어 미설명',
    tagType: 'missing_term',
    slideRef: 'Slide 17–18',
    slideContent:
      '세 가지 독립적인 방법론 단계가 명시됩니다.\n\n'
      + '① PRISMA 기반 체계적 문헌 검토 — 투명한 문헌 선별 절차를 확보하기 위한 국제 표준 프로토콜\n\n'
      + '② Card Sorting — 추출된 개념을 연구자 협업으로 범주화하여 5개 카테고리 체계를 구성하는 과정\n\n'
      + '③ HCI 전문가 검토 — 도출된 분류 체계의 타당성을 외부 전문가가 최종 확인하는 단계',
    presenterSaid:
      '이 논문은 PRISMA 기반 SLR로 문헌을 수집하고, card sorting을 통해 5-category taxonomy를 만들었습니다. 이후 HCI 전문가 검토를 거쳐 Presence, Interaction, Imagination, Economy, Policy로 정리했습니다.',
    referenceBackground:
      '슬라이드에서 세 방법론은 각기 다른 목적을 가진 독립 단계로 구분되어 있습니다. 그러나 발표에서는 이를 하나의 흐름으로만 서술해 PRISMA가 문헌 선별의 투명성을 높이는 절차이고 card sorting이 개념 범주화 도구임을 구분하지 않았습니다. 청중 입장에서는 세 단계가 왜 필요하고 각각 무엇을 보장하는지에 대한 논거가 누락된 것입니다.',
    question:
      'PRISMA와 card sorting은 각각 어떤 역할을 하나요? PRISMA가 taxonomy 자체의 객관성까지 보장한다고 볼 수 있나요?',
    checkpoint:
      'PRISMA는 문헌 선별 절차의 투명성을 높이는 방법이고, card sorting은 추출된 개념을 범주화하는 과정입니다. PRISMA만으로 taxonomy의 객관성이 완전히 보장되는 것은 아니며, 연구자 협업과 HCI 전문가 검토가 보완 장치로 작동합니다.',
  },
  {
    id: 'qa-2',
    tag: '논리 연결 누락',
    tagType: 'logic_gap',
    slideRef: 'Slide 13–16',
    slideContent:
      '두 가지 격차(Gap)가 단계적 논증 구조로 연결됩니다.\n\n'
      + '① Academia–Industry Gap — 학계는 기술·기능적 성취로 메타버스를 정의하는 반면, 산업계는 마케팅 용어로 활용. 이 차이가 UX 연구의 방향성 혼란을 유발\n\n'
      + '② Academia–User Gap — 학계의 이상적 정의와 실제 사용자가 경험하는 UX 사이의 괴리. 사용자 리뷰 분석을 통해 이 gap을 실증적으로 확인하는 것이 본 연구의 핵심 동기',
    presenterSaid:
      '산업계는 메타버스를 마케팅 용어로 보고, 학계는 기술적·기능적 성취로 봅니다. 그래서 정의가 혼란스러워 UX 분석이 어렵습니다. 다음으로 저자들은 사용자 리뷰를 분석해 실제 UX 이슈를 확인했습니다.',
    referenceBackground:
      '슬라이드는 academia–industry gap에서 출발해 왜 academia–user gap으로 분석을 확장해야 하는지를 단계적으로 연결합니다. 그러나 발표에서는 두 gap 사이의 논리적 연결 설명 없이 사용자 리뷰 분석으로 바로 전환되었습니다. "그래서 사용자 리뷰를 봐야 한다"는 논거가 빠진 채 결론만 제시된 구조입니다.',
    question:
      '발표 초반에는 산업계와 학계의 정의 차이를 말했는데, 이후 사용자 리뷰 분석으로 전환되었습니다. 이 논문에서 academia–industry gap과 academia–user gap은 어떻게 연결되나요?',
    checkpoint:
      'academia–industry gap은 메타버스 정의와 구현 방식의 차이를 보여주는 출발점입니다. 이후 사용자 리뷰 분석은 학계의 이상적 정의와 실제 사용자가 경험하는 UX 사이의 차이를 확인하는 단계입니다. 즉, 논문은 정의의 차이에서 출발해 실제 사용자 경험의 차이로 분석을 확장합니다.',
  },
  {
    id: 'qa-3',
    tag: '기준 모호 / 과잉 해석',
    tagType: 'ambiguous_claim',
    slideRef: 'Slide 24–25',
    slideContent:
      '감성 분석 판단 기준이 명확히 정의됩니다.\n\n'
      + '① 긴급 개선 기준 — Negative 비율이 전체 카테고리 평균을 초과하는 항목\n\n'
      + '② 분석 단위 — 사용자 리뷰 기반 인식 데이터 (앱스토어·구글플레이 리뷰)\n\n'
      + '③ 해석 범위 — 실제 플랫폼의 객관적 결함이 아닌, 사용자가 해당 항목을 문제로 인식하는 정도를 나타냄',
    presenterSaid:
      '감성분석 결과 negative가 average보다 높은 항목은 긴급한 UX 개선이 필요합니다. 특히 두 플랫폼 모두 Safety and Privacy 이슈가 크기 때문에 실제 플랫폼 차원에서 시급히 해결해야 할 결함이라고 볼 수 있습니다.',
    referenceBackground:
      '슬라이드는 분석 단위가 "사용자 인식"임을 명시하지만, 발표에서는 이를 "실제 플랫폼 결함"으로 단정했습니다. Average의 기준(전체 항목 평균인지, 플랫폼 간 비교인지)도 설명되지 않았습니다. 데이터의 성격과 해석 범위를 벗어난 결론이어서 논리적 비약이 발생한 지점입니다.',
    question:
      '여기서 Average는 무엇의 평균인가요? 그리고 Safety and Privacy 이슈는 실제 플랫폼 결함을 뜻하나요, 아니면 사용자 리뷰에서 드러난 인식을 뜻하나요?',
    checkpoint:
      'Average가 어떤 기준의 평균인지 먼저 명확히 해야 합니다. 또한 이 결과는 사용자 리뷰 기반 분석이므로, 실제 플랫폼의 객관적 결함이라기보다 사용자가 Safety & Privacy를 중요한 문제로 인식했다는 의미에 가깝습니다. 실제 결함으로 단정하려면 정책 분석, 기능 점검, 로그 데이터, 인터뷰 등이 추가로 필요합니다.',
  },
];

export function pickRandomQA(exclude?: string): DemoQA {
  const pool = exclude
    ? DEMO_QA_ITEMS.filter(q => q.id !== exclude)
    : DEMO_QA_ITEMS;
  return pool[Math.floor(Math.random() * pool.length)];
}
