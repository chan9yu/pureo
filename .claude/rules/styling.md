---
description: Tailwind CSS 4 스타일링 규칙 — Canonical-first, arbitrary value 금지
paths: ["src/**/*.css", "src/**/*.tsx", "app/**/*.tsx"]
---

# 스타일 컨벤션

## Tailwind 클래스 우선순위 (Canonical First)

**arbitrary value(`[..]`, `(--..)`) 사용 금지.** 표준 클래스 또는 `@theme` 토큰을 사용한다.

허용 우선순위 (위에서 아래로 검토):

1. **Tailwind 표준 클래스** — `max-w-xl`·`z-40`·`text-sm`·`rounded-md`·`bg-white` 등
2. **`@theme` 토큰 자동 생성 클래스** — 반복되는 값은 `globals.css`의 `@theme`에
   Semantic 변수로 추가하면 클래스가 자동 생성된다 (예: `--container-narrow: 32rem;` → `max-w-narrow`)
3. **arbitrary value는 정말 일회성**일 때만. 같은 값이 2회+ 등장하면 토큰 추가가 올바른 선택 — PR 리뷰 거부 대상

| ❌ 금지                 | ✅ 사용                        |
| ----------------------- | ------------------------------ |
| `bg-[#fff]`             | `bg-white`                     |
| `z-[40]`                | `z-40`                         |
| `rounded-[0.5rem]`      | `rounded-md`                   |
| `text-[var(--color-x)]` | `@theme` 토큰 노출 후 `text-x` |
| `max-w-[36rem]`         | `max-w-xl` 또는 컨테이너 토큰  |

## 전역 CSS

- 전역 스타일과 `@theme` 토큰은 `globals.css` 한 곳에서 관리 (FSD `app` 레이어 소유)
- 폰트는 `next/font`로 로드

## 텍스트 대비 티어 (WCAG AA)

- **텍스트(placeholder 포함)는 `grey-600` 이상만** 사용한다 — 흰 배경 기준 grey-600(4.6:1)부터 AA 통과
- `grey-400`·`grey-500`은 `aria-hidden` 장식 아이콘·비활성 표시 전용 — 읽어야 하는 텍스트에 금지
- 브랜드 텍스트는 `--color-primary`(4.5:1 이상으로 보정된 값)만 사용, 더 밝은 변형은 배경·보더 전용

## CSS 파일 분리 트리거

**`globals.css` 단일 파일이 기본.** reset·토큰·타이포그래피 등 전통적 역할별 파일은
Tailwind 4가 흡수했다 (Preflight·`@theme`·유틸리티). 미리 쪼개지 않는다.

분리는 신호가 생긴 시점에만:

- `@theme` 시맨틱 토큰이 비대해지면 (색상 팔레트·컨테이너·간격 수십 개) → `tokens.css`
- `@keyframes`·커스텀 variant 블록이 생기면 → `animations.css` 등
- 분리 시 CSS 엔트리에서 `@import "./tokens.css"` 조합 — 나중에 쪼개는 비용이 0이므로 선분리 실익 없음
