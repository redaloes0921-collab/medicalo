# AI 영상 생성 프롬프트 템플릿 (B롤/컷 생성용)

쇼츠의 "정보전달형(Faceless)" 포맷에 쓰는 5~8초 단위 클립 생성 프롬프트.
클립 3~4개 + 자막 + TTS 나레이션을 조립해 1편을 완성한다.

## 공통 스타일 토큰

```
Cinematic vertical 9:16 video, soft natural daylight, premium Korean medical
skincare clinic aesthetic, white and light-gray tones, calm slow camera
movement, shallow depth of field, photorealistic, no text overlay
```

## 클립 라이브러리 (자주 쓰는 장면)

| 장면 | 프롬프트 추가분 |
|------|----------------|
| 피부 클로즈업 | extreme close-up of clear glowing skin on a Korean woman's cheek, gentle light sweep |
| 거울 보는 인물 | Korean woman in her 30s looking at her skin in a bright bathroom mirror, slightly concerned expression |
| 진단 장면 | dermatologist examining skin with diagnostic device, clean clinic room, professional |
| 클리닉 인테리어 | modern minimal clinic interior slow pan, warm white tones, morning light |
| 자외선/계절 | bright summer sunlight on city street, lens flare, people with parasols |
| 스킨케어 루틴 | hands applying serum, macro shot, water droplets, fresh clean mood |

## 조립 규칙

1. 훅 클립은 움직임이 크거나 시선을 끄는 장면 (거울/고민 표정)
2. 원리 구간은 진단/다이어그램 느낌, 해결 구간은 클리닉/케어 장면
3. 클립 간 톤 일관성: 같은 세션에서 같은 시드/모델로 생성
4. 나레이션 TTS: 차분한 한국어 여성 보이스, 속도 1.0~1.1배
5. 인물 연속성이 필요하면 캐릭터/레퍼런스 기능 사용 (매일 같은 모델 얼굴 금지 — 피로도)

## 금지

- 시술 결과 보장처럼 보이는 극적 변화 연출 (compliance.md)
- 실존 인물(원장 포함) 얼굴을 동의 없이 AI 재현
