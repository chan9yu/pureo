---
name: fsd-nextjs
description: "Next.js 프로젝트에 Feature-Sliced Design(FSD) 아키텍처를 적용·설계·마이그레이션하는 방법. 사용자가 FSD, Feature-Sliced Design, 레이어/슬라이스/세그먼트, 폴더 구조 설계, 아키텍처 마이그레이션, entities·features·widgets 배치, public API·배럴 규칙, 크로스 임포트 문제를 언급하거나 — 'FSD'라는 단어 없이도 Next.js 프로젝트의 디렉토리 구조를 어떻게 나눌지, 어떤 레이어에 코드를 둘지, 모듈 경계를 어떻게 지킬지 고민할 때 반드시 이 스킬을 사용할 것."
metadata:
  source: "fsd.how/kr (FSD 공식 문서 한국어판, v2.1 기준)"
  date_added: "2026-07-02"
---

# FSD × Next.js

> Feature-Sliced Design(FSD)을 Next.js(App Router / Pages Router)에 적용하기 위한 스킬.
> FSD 공식 문서(fsd.how/kr, v2.1)를 원천으로 하며, 특정 프로젝트에 종속되지 않는 범용 가이드다.

## FSD 한눈에 보기

FSD는 프론트엔드 코드를 **책임 수준**과 **의존 방향**에 따라 3단 계층으로 구조화하는 아키텍처 방법론이다:

```
Layer (레이어)  →  Slice (슬라이스)  →  Segment (세그먼트)
책임 수준          비즈니스 도메인        기술적 역할
```

핵심 가치: 일관성(온보딩 용이) · 격리성(안전한 수정) · 재사용 범위 제어 · 도메인 중심 구조.

## 레이어 (7개, 상→하)

| Layer         | Slice | Import 가능 대상                    | 책임                                              |
| ------------- | ----- | ----------------------------------- | ------------------------------------------------- |
| **app**       | 없음  | 전 레이어                           | 전역 설정 — 라우터·스토어·스타일·진입점·providers |
| ~~processes~~ | —     | —                                   | **Deprecated** — features 또는 app으로 이동       |
| **pages**     | 있음  | widgets, features, entities, shared | 화면 단위. 1 페이지 = 1 슬라이스                  |
| **widgets**   | 있음  | features, entities, shared          | 독립적으로 동작하는 큰 UI 블록                    |
| **features**  | 있음  | entities, shared                    | 사용자 상호작용. **재사용될 때만 추출**           |
| **entities**  | 있음  | shared (+`@x` 예외)                 | 핵심 비즈니스 개념 (User, Post 등)                |
| **shared**    | 없음  | 없음 (최하단)                       | 기반 도구 — UI 킷, API 클라이언트, 유틸           |

- 모든 레이어를 반드시 쓸 필요 없다. 대부분의 프로젝트는 최소 `shared`·`pages`·`app`으로 시작한다.
- `app`·`shared`는 슬라이스 없이 세그먼트로만 구성되고, 내부 세그먼트끼리 자유롭게 import 가능하다.
- 커스텀 레이어 정의는 권장하지 않는다.

## 임포트 규칙 (Layer Import Rule)

**슬라이스 안의 코드는 자신보다 아래 레이어의 슬라이스만 import할 수 있다.**

```
✅ features/comments → entities/user, shared/ui
✅ features/comments/ui → features/comments/lib   (같은 슬라이스 내부)
❌ features/comments → features/auth               (같은 레이어 크로스 임포트)
❌ shared → entities                                (하위 → 상위)
```

- 같은 슬라이스 내부는 **상대 경로**, 다른 슬라이스는 **절대 경로/alias** — 배럴 순환 참조 예방.
- entities 간 불가피한 도메인 관계는 `@x` 표기법으로만 예외 허용 (→ `references/core-concepts.md`).
- 강제 수단: FSD 전용 린터 **Steiger** (`npx steiger src`).

## 세그먼트

| Segment  | 용도                               |
| -------- | ---------------------------------- |
| `ui`     | 컴포넌트, 스타일, 포맷터           |
| `api`    | 백엔드 통신 — 요청 함수, DTO, 매퍼 |
| `model`  | 스키마, 스토어, 비즈니스 로직      |
| `lib`    | 슬라이스 내부 라이브러리 코드      |
| `config` | 설정, feature flag                 |

**명명 원칙**: 폴더 이름은 파일의 타입이 아니라 **존재 목적**을 드러내야 한다. `components/`, `hooks/`, `types/`, `utils/` 같은 세그먼트 이름은 금지 — "무엇(what)"이 아니라 "왜(why)".

## Next.js 통합 — 공식 패턴

Next.js의 `app`/`pages` 폴더와 FSD의 `app`/`pages` 레이어는 **이름만 같고 역할이 다르다**. 공식 해법은 단 하나: **루트 = Next.js 라우팅 전용(얇게), `src/` = FSD 레이어 전체**.

```
app/                        ← Next.js App Router (라우팅 파일만, one-line re-export)
├── example/
│   └── page.tsx
└── api/
    └── example/
        └── route.ts
pages/                      ← ⚠️ 빈 폴더 + README.md (아래 "필수 함정 회피" 참조)
middleware.ts               ← Next.js 규약 파일은 루트 유지
src/
├── app/                    ← FSD app 레이어 (providers, api-routes, styles …)
├── pages/                  ← FSD pages 레이어 (실제 페이지 구현)
│   └── example/
│       ├── index.ts
│       └── ui/example.tsx
├── widgets/
├── features/
├── entities/
└── shared/
```

### 3가지 핵심 규칙

1. **라우트 파일은 one-line re-export만.** 구현·metadata까지 FSD 레이어가 소유한다:

   ```tsx
   // app/example/page.tsx
   export { ExamplePage as default, metadata } from "@/pages/example";
   ```

2. **루트에 빈 `pages/` 폴더 필수 (App Router여도).** 없으면 Next.js가 `src/pages`(FSD 레이어)를 Pages Router로 인식해 **빌드가 실패**한다. 빈 폴더에는 이유를 설명하는 `README.md`를 함께 둔다. — 이 가이드에서 가장 비직관적이고 가장 자주 빠뜨리는 함정.

3. **API 핸들러는 FSD `app` 레이어의 `api-routes` 세그먼트에.** 루트 `route.ts`는 HTTP 메서드 이름으로 re-export만:

   ```ts
   // app/api/example/route.ts
   export { getExampleData as GET } from "@/app/api-routes";
   ```

   DB 쿼리는 `shared/db` 세그먼트에 정의하고 상위 레이어에서 가져다 쓴다.

Pages Router 통합(Custom App, `{ config, handler }` 객체 패턴), 레이아웃 배치 전략, 상세 코드 예시는 → **`references/nextjs-integration.md`**

## Public API 요점

- 모든 슬라이스는 `index.ts`에서 **필요한 것만 선별 re-export**. 외부는 이 경로로만 접근.
- `export * from './...'` **wildcard 금지** — 발견 가능성 저하 + 내부 구현 노출로 리팩터링 불능.
- `shared/ui`처럼 관련성 낮은 모듈이 많은 곳은 거대 배럴 하나 대신 **컴포넌트 단위 index** (`@/shared/ui/button`) — tree-shaking·HMR 성능.

상세(좋은 Public API 3조건, `@x` 크로스 임포트, 배럴 성능 최적화) → **`references/core-concepts.md`**

## 적용 워크플로

### 신규 프로젝트

1. 루트 `app/`(라우팅) + 빈 `pages/`(+README) + `src/` 골격 생성. `@/` alias를 `src/`로 설정.
2. `src/`에는 처음부터 7레이어를 다 만들지 말고 `app`·`pages`·`shared`만으로 시작.
3. **페이지 목록 도출부터 설계** — 각 페이지가 `src/pages/`의 슬라이스가 된다 (v2.1 Pages-First).
4. 주요 UI·로직은 일단 **페이지 슬라이스 내부**에 배치. shared 코드는 "계획이 아닌 개발 중 발견"으로 점진 추출.
5. 여러 페이지에서 재사용이 **명확해졌을 때만** widgets/features/entities로 하향 이동.

### 기존 프로젝트 점진 마이그레이션 (공식 문서 절차)

1. `app`·`shared` 레이어부터 정리
2. 기존 UI를 `widgets`·`pages`로 분배 (FSD 규칙 위반이 있어도 일단 배치)
3. import 위반을 하나씩 해결하며 로직을 `entities`·`features`로 이동
4. Steiger를 CI/lint에 붙여 회귀 차단

## 판단 기준 요약 (자주 틀리는 결정)

| 질문                            | 답                                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 이 UI를 feature로 뽑을까?       | **여러 페이지에서 재사용될 때만.** 아니면 페이지 내부에 둔다                                         |
| 이 블록을 widget으로?           | 재사용되거나 페이지의 큰 독립 섹션일 때만. 특정 페이지 전용이면 페이지 내부                          |
| entity를 만들까?                | 재사용이 명확해진 뒤에. 단순 CRUD는 `shared/api`로 충분. entities 레이어 자체가 없어도 FSD 위반 아님 |
| 인증 토큰·로그인 사용자 정보는? | `shared/auth` 또는 `shared/api` (entity 아님)                                                        |
| 백엔드 응답 타입은?             | `shared/api` (entities에 직접 두지 말 것 — 백엔드 구조 ≠ 프론트 구조)                                |
| 레이아웃은?                     | 단순 마크업 → `shared/ui` 또는 `app/layouts`. 비즈니스 로직 필요 → app 레이어로 승격 or render props |
| feature끼리 조합하고 싶다       | 상위 레이어(page/widget)에서 props/slot으로 조립. 직접 import 금지                                   |

크로스 임포트 해소 4전략, desegmentation, 과잉 entities, 타입 배치표 → **`references/antipatterns.md`**

## References (필요할 때만 읽기)

| 파일                               | 언제 읽나                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| `references/nextjs-integration.md` | 디렉토리 골격 생성, 라우트 파일 작성, Pages Router, API 핸들러, 레이아웃 배치 시 |
| `references/core-concepts.md`      | 레이어별 상세 책임, 슬라이스/세그먼트 규칙, Public API·`@x`·배럴 설계 시         |
| `references/antipatterns.md`       | 크로스 임포트 해소, 구조 리팩터링, 타입 배치, v2.0→v2.1 마이그레이션 시          |
