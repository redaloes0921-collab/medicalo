# 생성 비주얼 라이브러리

힉스필드에서 생성한 베이스 비주얼 기록. `medias: [{value: <job_id>, role: ...}]`로 재사용 가능.

| job id | 모델 | 내용 | 비율 | 생성일 |
|---|---|---|---|---|
| `56ac52ab-5e83-4c42-b363-14f24582de31` | soul_2 | 색소 캠페인 히어로 — 30대 초 여성 클로즈업, 글로우 스킨, #f6f6f7 배경, 좌측 여백 | 3:4 | 2026-07-26 |
| `acbacb5f-791d-407b-86f9-9a3e7c7b13ee` | soul_2 | 숏폼 훅 컷 — 손거울로 모공 확인하는 20대 후반 여성, 욕실 아침광 | 9:16 | 2026-07-26 |
| `d67b9363-0235-4d91-a433-4b2709d742b3` | soul_2 | 숏폼 클로징 컷 — 맑은 피부 클로즈업, 상단 텍스트 여백 | 9:16 | 2026-07-26 |
| `622450e9-2320-4564-8df9-e578fa02f136` | soul_2 | **리얼스킨 히어로 A** (채택) — 필름룩, 주근깨/색소, 좌측 시선, `assets/img/hero-pigment-real-a.png` | 3:4 | 2026-08-04 |
| `244ad0ca-263c-47b4-9e11-d5f8d1e6e970` | soul_2 | 리얼스킨 히어로 B (무디 버전, 보관) — `assets/img/hero-pigment-real-b.png` | 3:4 | 2026-08-04 |

## 완성 소재 (합성 렌더 결과)

| media id | 소재 | 사이즈 | 템플릿 |
|---|---|---|---|
| `9442309b-96e5-4095-952f-d05b78e6a737` | 색소 프로그램 피드 광고 v1 (폐기 — 베이스에 AI 텍스트 잔상) | 1080×1350 | `templates/pigment-feed-1080x1350.html` |
| `82ffc56c-1a62-428e-892b-6f5dcb3b2729` | 색소 프로그램 피드 광고 v2 (크롭 수정) | 1080×1350 | `templates/pigment-feed-1080x1350.html` |
| 로컬: `deliverables/medicalo-pigment-feed-1080x1350.png` | 색소 프로그램 피드 광고 **최종본 v3** | 1080×1350 (2x) | `templates/pigment-feed-1080x1350.html` |

교훈: soul_2가 "타이포용 여백"을 요청하면 그 여백에 가짜 로고/텍스트를 그려넣는 경향이 있다.
→ 프롬프트에 "completely plain empty background, absolutely no text/letters/logo/graphics" 강조 +
   합성 시 인물 영역만 크롭해 쓰는 템플릿 구조가 안전하다.
자산 파이프라인: 힉스필드 CDN이 차단된 세션에서는 `ad-studio/assets/manifest.txt`에
"<URL> <경로>"를 추가하고 푸시하면 GitHub Actions(asset-sync)가 레포로 가져온다 → git pull 후 로컬 렌더.

## 리얼스킨(실사) 프롬프트 레시피 — AI 티 제거의 핵심

"flawless glass skin / luminous / ultra retouching" 류 표현이 AI 광택 피부의 원인.
대신 아래 실사 신호를 조합할 것 (soul_2에서 검증됨, 2026-08-04):
- `photographed on Hasselblad medium format with Kodak Portra 400 film`
- `real human skin with visible pores, fine vellus hair, natural micro-imperfections, slightly uneven skin tone`
- `matte natural finish with no glossy highlight, minimal no-makeup makeup`
- `subtle film grain, documentary editorial realism, not digitally smoothed, no beauty retouching, no AI-perfect skin`
- 조명은 스튜디오 대신 `soft diffused window daylight`
주의: 필름 스캔 테두리가 같이 생성되므로 합성 시 크롭으로 제거할 것.

## 영상 소재

| job id | 모델 | 내용 | 스펙 | 생성일 |
|---|---|---|---|---|
| `1bd7464b-526e-46d2-a3cf-392497661091` | kling3_0_turbo | 리얼스킨 B컷 포트레이트 애니메이션 — 느린 푸시인, 시선 이동, 미세 호흡. `assets/video/pigment-portrait-b-5s.mp4` | 5s, 828×1108, h264+aac, 7.5크레딧 | 2026-08-07 |

영상 모션 레시피(검증됨): 이미지→영상은 start_image로 job_id 전달, 모션은 절제가 핵심 —
"breathing gently, slowly blinks once, gaze drifts, hair strands sway imperceptibly, slow gentle camera push-in,
keep film grain and natural skin texture, no morphing, no warping, restrained elegant motion".
프리셋 추천(IN THE DARK 등)이 떠도 브랜드 무드(라이트 미니멀)와 안 맞으면 declined_preset_id로 거절하고 리터럴 생성.
영상 QA: 로컬 ffmpeg는 h264 디코드 불가 → 샌드박스 ffmpeg로 5프레임 콘택트 시트를 만들어 asset-sync로 가져와 확인.
