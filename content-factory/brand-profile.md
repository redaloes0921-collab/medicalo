# MEDICALO 브랜드 스타일 프로필

모든 AI 소재 생성의 기준. 랜딩페이지(`index.html`, `css/style.css`)와
기존 프로모션 이미지(`medicalo_promotion_KR_ver1.0` 시리즈) 분석 결과.

## 브랜드 정체성

- **업종**: 피부 한의원 (메디컬 스킨 클리닉) — 압구정 본점, 부산 분점
- **핵심 프로그램**: 색소(기미·주근깨·잡티·오타), 모공(피지형·흉터형·탄력저하형), CRO 볼륨
- **포지셔닝**: "근본부터 진단하고 치료하는" 의학적 신뢰 기반. 화려함보다 정제된 전문성
- **슬로건**: FACE, YOUR LIFE

## 컬러 시스템 (css/style.css 기준)

| 토큰 | 값 | 용도 |
|------|-----|------|
| Black (ink) | `#111111` | 헤드라인, 본문 강조, 다크 버튼 |
| White (bg) | `#ffffff` | 기본 배경 |
| Light Gray | `#f6f6f7` | 섹션 배경, 카드 배경 |
| Line | `#e9e9eb` | 구분선, 카드 테두리 |
| Soft | `#55565a` | 본문 텍스트 |
| Mute | `#97989c` | 캡션, 보조 텍스트, 취소선 가격 |
| **Concept Red** | `#DE3E28` | 캠페인 한정 포인트 (할인가, 강조 뱃지) — 남용 금지 |

## 레이아웃 & 그래픽 스타일

- 화이트/라이트그레이 배경 + 라운드 코너 카드 (기존 가격표 이미지 패턴)
- 여백이 넉넉한 미니멀 구성. 장식 요소 최소화, 타이포 중심
- 가격 표기: 정상가는 회색 취소선, 할인가는 레드 볼드
- 사진 톤: 밝고 따뜻한 저채도. 부드러운 자연광, 클리닉의 정돈된 화이트 인테리어
- 인물: 맑고 깨끗한 피부 표현이 핵심. 과도한 보정감 없는 자연스러운 결

## 카피 톤 & 원칙 (랜딩 카피 기준)

- 차분하고 단정한 존댓말. 감탄사·과장 배제
- **문제의 원리 → 진단 → 맞춤 치료** 구조로 설득
  - 예: "지워도 다시 올라오는 색소, 표면만 걷어내면 다시 올라옵니다"
  - 예: "색소는 없애는 것이 아니라 다스리는 것"
- 유형 분류로 전문성 표현 (기미/주근깨/잡티/오타, 피지형/흉터형 모공)
- CTA는 진단 중심: "내 피부에 맞는", "원장이 직접 진단"
- 주의 문구 항상 포함: "※ 시술 효과는 개인의 피부 상태에 따라 차이가 있을 수 있습니다."

## AI 이미지 생성용 공통 스타일 토큰 (프롬프트에 삽입)

```
Minimal Korean medical skincare clinic advertisement, clean white background
(#ffffff) with soft light-gray (#f6f6f7) rounded cards, elegant Korean sans-serif
typography in near-black (#111111), single red accent color (#DE3E28) used
sparingly, generous whitespace, premium and calm mood, soft natural lighting,
no clutter, editorial layout
```

인물 컷 추가 토큰:
```
Korean woman in her 20s-30s with clear translucent glowing skin, natural
makeup, soft warm daylight, clean white clinic interior background, serene
confident expression, photorealistic, no heavy retouching look
```

## 쇼츠(영상) 스타일

- 첫 1.5초 훅: 시청자의 피부 고민을 질문으로 (예: "지워도 또 올라오는 기미, 왜 그럴까요?")
- 구조: 훅(1.5초) → 원리 설명(10~15초) → 해결책 제시(5~10초) → CTA(3초)
- 자막: 화이트 배경 검정 자막 또는 검정 반투명 바 + 화이트 자막, 키워드만 레드 강조
- 나레이션: 차분한 여성 보이스, 신뢰감 있는 톤 (원장 목소리 클론 시 사전 동의 필수)
- 배경음악: 잔잔한 미니멀 톤. 트렌드 사운드는 TikTok 한정 실험
