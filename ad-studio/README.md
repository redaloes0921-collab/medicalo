# MEDICAL O — Ad Studio

애플 광고 미감 + 전환 퍼포먼스를 갖춘 광고 소재를 만드는 파이프라인.
전체 운영 규칙은 레포 루트의 `CLAUDE.md` 참고.

## 구조

```
ad-studio/
├── templates/   # 소재 HTML 템플릿 (#stage = 캔버스, 고정 px)
├── assets/
│   ├── fonts/   # Pretendard woff2 (산돌고딕 Neo1 대체)
│   └── img/     # 베이스 비주얼 (힉스필드 생성물 다운로드 위치)
├── out/         # 렌더 결과 (git 제외)
├── render.js    # HTML → PNG/JPG 렌더러 (playwright-core)
└── LIBRARY.md   # 힉스필드 생성 job id 기록
```

## 사용

```bash
cd ad-studio
npm install                                   # playwright-core
node render.js templates/pigment-feed-1080x1350.html          # → out/*.png (2x)
node render.js templates/pigment-feed-1080x1350.html --scale 1
```

원격 세션에서 힉스필드 CDN이 막혀 있으면 힉스필드 `sandbox_exec`에서 렌더링한다
(자세한 절차는 `CLAUDE.md`의 파이프라인 섹션).

## 템플릿 규약

- 캔버스는 `#stage` 하나. 사이즈: 피드 1080×1350 / 스토리 1080×1920 / 정방형 1080×1080
- 텍스트는 절대 AI 이미지에 굽지 않는다 — 항상 템플릿 타이포로 얹는다
- 사진↔배경 블렌딩은 `mask-image` 그라데이션 사용
- 브랜드: `#111` / `#f6f6f7` / 포인트 `#DE3E28` 소량, 이탤릭·텍스트 이펙트 금지
