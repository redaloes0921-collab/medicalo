# 생성 비주얼 라이브러리

힉스필드에서 생성한 베이스 비주얼 기록. `medias: [{value: <job_id>, role: ...}]`로 재사용 가능.

| job id | 모델 | 내용 | 비율 | 생성일 |
|---|---|---|---|---|
| `56ac52ab-5e83-4c42-b363-14f24582de31` | soul_2 | 색소 캠페인 히어로 — 30대 초 여성 클로즈업, 글로우 스킨, #f6f6f7 배경, 좌측 여백 | 3:4 | 2026-07-26 |
| `acbacb5f-791d-407b-86f9-9a3e7c7b13ee` | soul_2 | 숏폼 훅 컷 — 손거울로 모공 확인하는 20대 후반 여성, 욕실 아침광 | 9:16 | 2026-07-26 |
| `d67b9363-0235-4d91-a433-4b2709d742b3` | soul_2 | 숏폼 클로징 컷 — 맑은 피부 클로즈업, 상단 텍스트 여백 | 9:16 | 2026-07-26 |

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
