---
description: FSD v2.1 아키텍처 — 미니멀 구성(app·pages·shared), Next.js 통합, 배럴 정책
paths: ["src/**", "app/**", "pages/**"]
---

# Feature-Sliced Design v2.1 (Next.js App Router) — pureo

> 원천: FSD 공식 문서(fsd.how/kr) + `.claude/skills/fsd-nextjs`·`fsd-tanstack-query`.
> **미니멀 구성(Pages-First)**: `app`·`pages`·`shared` 3레이어로 시작한다.
> widgets/features/entities는 **재사용이 확인되는 시점에** 추출한다 — 계획이 아닌 개발 중 발견.

## 1. Layer Import Rule

```
의존성은 단방향이다:
  app → pages → (widgets → features → entities) → shared

같은 레이어의 다른 슬라이스 import 금지 (수평 크로스 임포트)
```

| 레이어     | 슬라이스 | import 가능 대상                     | 책임                                                    |
| ---------- | -------- | ------------------------------------ | ------------------------------------------------------- |
| **app**    | 없음     | 전 레이어                            | 전역 조립 — 레이아웃·Provider·전역 스타일·route handler |
| **pages**  | 있음     | shared (+ 중간 레이어 생기면 그것들) | 화면 단위. 1 페이지 = 1 슬라이스                        |
| **shared** | 없음     | 없음 (최하단)                        | 도메인 불가지론 — HTTP·외부 API client·범용 훅·유틸     |

> 레이어 규칙의 본질은 **삭제 가능성(deletability)**. `rm -rf src/pages/stock-detail/`을 해도
> 나머지 앱이 컴파일되는가? 이 질문이 아키텍처 건강도의 리트머스다.

## 2. Next.js 통합

- **루트 `app/` = 라우팅 전용.** 라우트 파일은 one-line re-export만, 구현·metadata는 FSD 레이어 소유:

  ```tsx
  // app/stocks/[symbol]/page.tsx
  export { StockDetailPage as default } from "@/pages/stock-detail";
  ```

- **루트 `pages/` = 빈 폴더 + README.md. 삭제 금지.** 없으면 Next.js가 `src/pages/`(FSD pages
  레이어)를 Pages Router로 오인해 빌드가 실패한다.
- **API 핸들러 구현은 `src/app/api-routes/`** (도메인명 함수). 루트 `route.ts`는 HTTP 메서드명 alias만:

  ```ts
  // app/api/search/route.ts
  export { searchStocks as GET } from "@/app/api-routes/search";
  ```

- **예외**: Route Segment Config(`revalidate`·`dynamic` 등)는 Next.js가 정적 분석하므로
  re-export 불가 — 필요 시 루트 라우트 파일에 리터럴로 잔류.

## 3. 디렉토리 트리 (1차 기준)

```
app/                          ← Next.js App Router (라우팅 전용)
│   layout.tsx  page.tsx  stocks/[symbol]/page.tsx
│   api/search/  api/stocks/[symbol]/{quote,profile,metrics,series}/
pages/                        ← 빈 폴더 + README.md (삭제 금지)
src/
├── app/                      ← FSD app 레이어 (세그먼트만)
│   ├── layouts/              RootLayout + metadata
│   ├── providers/            QueryProvider (전역 Provider 조립)
│   ├── styles/               globals.css
│   └── api-routes/           route handler 구현 + __tests__/
├── pages/
│   ├── home/                 검색 화면 — index.ts / ui/ / api/(검색 쿼리)
│   └── stock-detail/         해석 카드 — index.ts / ui/ / api/(상세 쿼리) / lib/(해석 룰)
└── shared/
    ├── api/                  http(fetchJson·HttpError)·queryClient·market/(시세 provider)
    ├── lib/                  useDebouncedValue 등 범용 훅·유틸
    └── test/                 fixtures, MSW 헬퍼
```

## 4. 배치 기준

| 무엇                                      | 어디                        | 근거                                                     |
| ----------------------------------------- | --------------------------- | -------------------------------------------------------- |
| 1곳 전용 UI·로직                          | 해당 페이지 슬라이스 내부   | Pages-First. 섹션·게이지·스파크라인은 stock-detail 전용  |
| 해석 룰 (valuation·trend·glossary)        | `pages/stock-detail/lib/`   | 종목 도메인 지식 — shared에 도메인 누수 금지             |
| 외부 API 전송 타입·시세 provider          | `shared/api/market/`        | 외부 응답 DTO·통신 계층은 shared/api                     |
| fetchJson·HttpError                       | `shared/api/http.ts`        | 호출 규칙의 단일 수정 지점                               |
| query factory (queryOptions)              | 사용하는 페이지의 `api/`    | fsd-tanstack-query — mutation·query는 사용처 가까이      |
| QueryClient **팩토리** (`getQueryClient`) | `shared/api/queryClient.ts` | pages의 RSC prefetch가 사용 — pages→app 상향 import 금지 |
| QueryProvider **조립**                    | `src/app/providers/`        | 전역 기본 옵션·경계는 app 레이어 소유                    |

**승격 트리거**: 같은 코드가 **2곳 이상의 슬라이스에서 필요해진 시점**에 하향 이동한다.
예: 2차 관심종목 대시보드가 quote 쿼리·해석 룰을 재사용하게 되면 → `entities/stock`(api·lib) 추출.
슬라이스 추가·레이어 신설은 `autonomy.md`의 "아키텍처 변경" — 사용자 승인 필요.

## 5. 세그먼트 명명 — 목적(why), 기술 역할(what) 금지

| Segment | 용도                                      |
| ------- | ----------------------------------------- |
| `ui`    | 컴포넌트, 스타일, 표시용 포맷터           |
| `api`   | 데이터 접근 — 조회 함수, 외부 통신, 쿼리  |
| `model` | 타입, 스키마, 스토어, 비즈니스 로직, 훅   |
| `lib`   | 슬라이스 내부 라이브러리 코드 (파서·계산) |

- **금지**: `components/`·`hooks/`·`utils/`·`types/`·`services/` — 기술 역할명은 존재 목적을 숨긴다.
- 파일 명명: 컴포넌트 PascalCase, 훅·유틸 camelCase, 슬라이스 디렉토리 kebab-case.

## 6. 배럴(Public API) 정책 — FSD 공식

Steiger(`pnpm lint:fsd`, pre-commit `fsd-structure`)가 강제한다.

- **pages 슬라이스**: `index.ts` 배럴 필수 — 필요한 것만 선별 named re-export.
- **shared**: 세그먼트 단위 배럴 (`shared/api/index.ts`, `shared/lib/index.ts`).
  외부에서는 세그먼트 배럴로만 import — 내부 파일 직접 접근은 sidestep 위반.
- **app**: 배럴 없음 — 최상위 레이어라 소비자가 없어 public API가 불필요.
  루트 라우팅 파일(`src/` 밖)만 파일 단위로 접근한다 (`@/app/layouts/RootLayout`).
- **서버 전용 모듈은 동형(isomorphic) 배럴에서 re-export 금지** — RSC 경계 보호.
  자체 배럴 + 첫 줄 `import "server-only"` 포이즌 필. 예: `shared/api/market/`(API 키 사용)은
  `shared/api/market/index.ts` 별도 배럴로 두고 `shared/api/index.ts`에서 재노출하지 않는다.
- 공통: `export * from` wildcard 금지, 배럴에 `"use client"` 금지, 배럴은 re-export만.
- 배럴에 서버 전용 export와 클라이언트 컴포넌트가 공존 + 클라이언트 소비자 등장 시
  → split barrel(`index.ts` 서버 / `client.ts` 클라이언트) 분리.

## 7. Import 경로 규칙

```ts
// ✅ 같은 슬라이스 내부 — 상대 경로
import { interpretPer } from "../lib/valuation";

// ✅ 다른 슬라이스/레이어 — 절대 경로 (@/* → src/*)
import { StockDetailPage } from "@/pages/stock-detail"; // 슬라이스 배럴
import { fetchJson } from "@/shared/api"; // shared 세그먼트 배럴

// ❌ 배럴 우회 직접 접근 (public API sidestep)
import { StockCard } from "@/pages/stock-detail/ui/StockCard";
import { fetchJson } from "@/shared/api/http";

// ❌ 하위 → 상위 (shared에서 pages import 등)
```

## 8. 테스트 배치

대상 디렉토리 내 `__tests__/[파일명].test.ts(x)`.
예: `src/pages/stock-detail/lib/valuation.ts` → `src/pages/stock-detail/lib/__tests__/valuation.test.ts`
