# FSD 핵심 개념 상세 레퍼런스

> 원천: fsd.how/kr `reference/layers` · `reference/slices-segments` · `reference/slice-groups` · `reference/public-api` · `get-started/*`

## 목차

1. [레이어별 상세 책임](#1-레이어별-상세-책임)
2. [슬라이스 규칙](#2-슬라이스-규칙)
3. [슬라이스 그룹](#3-슬라이스-그룹)
4. [세그먼트 규칙](#4-세그먼트-규칙)
5. [Public API](#5-public-api)
6. [@x 크로스 임포트 표기법](#6-x-크로스-임포트-표기법)
7. [배럴 파일 주의사항과 성능](#7-배럴-파일-주의사항과-성능)
8. [임포트 규칙 정리](#8-임포트-규칙-정리)

---

## 1. 레이어별 상세 책임

### app (최상위, 슬라이스 없음)

- 앱 전역에서 동작하는 환경 설정과 공용 로직. 슬라이스 없이 세그먼트로만 구성되는 "하나의 큰 슬라이스"처럼 동작.
- 대표 세그먼트: `routes`(라우터 설정), `store`(전역 스토어), `styles`(전역 스타일), `entrypoint`(진입점·프레임워크 설정). Next.js 통합 시 `api-routes`·`custom-app`이 여기에 추가된다.
- 애널리틱스·providers 같은 앱 전역 관심사도 이 레이어의 세그먼트.

### processes — Deprecated

- 과거: 여러 페이지를 넘나드는 복잡한 기능의 "탈출구".
- 현재: 기존 코드는 **features 또는 app으로 이동**. 라우터·서버 연동 같은 전역 로직은 보통 app에 배치. app이 너무 복잡할 때만 제한적으로 고려.

### pages (슬라이스 있음)

- 화면(screen)·액티비티 단위. **1 페이지 = 1 슬라이스**가 기본, 구조가 비슷한 페이지들은 하나의 슬라이스로 묶어도 된다. 코드 찾기가 쉽다면 슬라이스 크기에 제한 없음.
- 흔한 세그먼트: `ui`(페이지 UI + 로딩·에러 상태), `api`(페이지 전용 데이터 fetching·mutation).
- **재사용되지 않는 UI는 페이지 내부에 그대로 둔다.** 보통 전용 `model`은 없고 단순 상태는 컴포넌트 내부에서 관리.

### widgets (슬라이스 있음)

- 독립적으로 동작하는 비교적 큰 UI 블록. 사용 시점: ① 여러 페이지에서 재사용되는 큰 블록, ② 한 페이지 안의 큰 섹션 단위.
- 재사용되지 않고 특정 페이지 전용이면 widget으로 만들지 말고 페이지 내부에 둘 것.
- Nested Routing 환경(Remix 등)에서는 widget이 page와 비슷한 역할(데이터 로딩·에러 처리 포함 라우터 단위 블록)을 할 수 있다.

### features (슬라이스 있음)

- 사용자에게 비즈니스 가치를 제공하는 재사용 가능한 상호작용. 보통 하나 이상의 entity와 연관.
- **모든 동작을 feature로 만들지 말 것 — 여러 페이지에서 재사용될 때만 추출.** feature가 너무 많으면 중요한 기능을 찾기 어려워진다.
- 설계 목표: "새 팀원이 pages와 features만 훑어봐도 앱이 어떤 기능을 제공하는지 대략 이해"할 수 있어야 한다.
- 세그먼트: `ui`(폼·검색 바 등), `api`, `model`(검증·내부 상태), `config`(feature flag).

### entities (슬라이스 있음)

- 실제 도메인 용어(User, Post, Product)와 일치하는 핵심 비즈니스 개념.
- 세그먼트: `model`(데이터 상태·도메인 로직·검증 스키마), `api`, `ui`(엔티티의 시각적 표현 — 재사용 가능하게).
- **비즈니스 로직은 props/slot으로 외부 주입 권장.** entity의 ui는 완성된 큰 블록일 필요 없다.
- entity 슬라이스끼리는 서로 모르는 상태가 이상적. 상호작용이 필요하면 ① 로직을 상위 레이어로 이동, ② 데이터 포함 관계가 필요하면 `@x` 사용.
- **feature vs entity**: entity = 비즈니스 개체(user, product), feature = 사용자가 entity로 수행하는 상호작용(로그인, 장바구니 담기).

### shared (최하위, 슬라이스 없음)

- 기본 구성 요소·기반 도구. 비즈니스 도메인이 없으므로 슬라이스 없이 세그먼트만.
- 세그먼트 예시: `api`(API 클라이언트·공통 요청), `ui`(비즈니스 로직 없는 UI 킷 — 브랜드 테마는 가능), `lib`(내부 라이브러리 — 단순 utils 덤프가 아니라 **하나의 주제에 집중**, README 문서화 권장), `config`(환경변수·전역 flag), `routes`(라우트 상수), `i18n`.
- `components`·`hooks`·`types`처럼 역할이 모호한 세그먼트 이름 금지.

---

## 2. 슬라이스 규칙

- 슬라이스는 제품·비즈니스 관점에서 관련 있는 코드를 묶는 단위. 이름은 고정 규칙 없이 **비즈니스 도메인**을 따른다 (예: `photo`, `comments`, `news-feed`). 개수 제한 없음.
- **두 가지 핵심 원칙 (Zero coupling, High cohesion)**:
  1. 다른 슬라이스와 최대한 독립적일 것
  2. 핵심 목적과 직접 관련된 코드 대부분을 내부에 포함할 것
- **분할 시점**: 초기에는 페이지/위젯의 `model` 세그먼트에 로직을 두고, 여러 곳에서 재사용이 명확해졌을 때만 하위 레이어로 이동한다.

## 3. 슬라이스 그룹

같은 레이어 안에서 관련 슬라이스를 폴더로 모아 탐색을 돕는 **순수 편의 구조** (필수 아님):

```
entities/payment/
├── invoice/
├── receipt/
└── transaction/
```

- **그룹은 슬라이스가 아니다**: 세그먼트·`index.ts`를 갖지 않고, 여러 슬라이스의 공용 코드도 담지 않는다.
- **그룹 내부라도 슬라이스 간 코드 공유 불허** — 격리 규칙이 그대로 적용.
- 도입 기준: 동일 비즈니스 맥락의 슬라이스가 많아 파악이 어려울 때. 2~3개 수준이면 불필요.
- features 레이어에 적용할 때 주의: feature는 여러 entity에 걸치므로 그룹 폴더가 "도메인 전체 폴더"처럼 변질되어 use-case 단위 분할 원칙이 약해질 위험.

## 4. 세그먼트 규칙

표준 세그먼트 5종: `ui` · `api` · `model` · `lib` · `config` (용도는 SKILL.md 표 참조).

- **커스텀 세그먼트 허용** — 특히 슬라이스가 없는 app·shared에서 자주 활용 (`routes`, `i18n`, `store`, `styles`, `entrypoint`, `api-routes`, `db`, `analytics`).
- 선택 기준: 백엔드 요청 → `api` / 렌더링 → `ui` / 폼 검증·데이터 변환 → `model` / 환경변수·flag → `config`.
- 명명 원칙: 타입("무엇")이 아니라 목적("왜")이 드러나야 한다. `components/`, `hooks/`, `types/`, `modals/` 금지.
- Atomic Design과 병용 가능 — 필요하면 `ui` 세그먼트 안에서 Atomic 분류를 적용해도 된다.

## 5. Public API

Public API는 슬라이스 기능을 외부에서 접근하는 **공식 경로이자 계약**. `index` 파일에서 필요한 것만 선별 re-export:

```ts
// pages/auth/index.ts
export { LoginPage } from "./ui/LoginPage";
export { RegisterPage } from "./ui/RegisterPage";
```

**좋은 Public API의 3가지 조건**:

1. **내부 구조 변경과 독립** — 슬라이스 폴더 구조를 바꿔도 외부 코드는 영향 없어야 한다
2. **기능 변경 = API 변경** — 주요 동작이 바뀌면 Public API도 함께 갱신
3. **선별된 노출** — 전체 구현이 아닌 필수 기능만 공개

**금지: wildcard re-export**

```ts
// ❌ features/comments/index.ts
export * from "./ui/Comment";
export * from "./model/comments";
```

발견 가능성 저하(제공 기능을 한눈에 파악 불가) + 내부 구현 노출(숨겨야 할 코드에 외부 의존성이 생겨 리팩터링 불능).

배치 관례: 슬라이스당 index 1개, 슬라이스 없는 레이어(shared·app)는 **세그먼트당 index**.

## 6. @x 크로스 임포트 표기법

같은 레이어 내 슬라이스 간 불가피한 도메인 관계를 명시적으로 처리하는 별도 진입점. **사실상 entities 레이어에서만 허용 권장** (v2.1에서 표준화).

```
entities/song/
├── @x/
│   └── artist.ts    ← artist 슬라이스 전용 공개 API
└── index.ts         ← 일반 공개 API
```

```ts
// entities/song/@x/artist.ts
export type { Song } from "../model/song";

// entities/artist/model/artist.ts
import type { Song } from "entities/song/@x/artist";

export interface Artist {
	name: string;
	songs: Array<Song>;
}
```

`song/@x/artist` = "Song과 Artist의 교차 지점" — 관계가 코드에 명시적으로 문서화된다.

**제약**: 권장 패턴이 아니라 **최후의 타협책**이다. 남발하면 entity 경계가 강하게 엮여 리팩터링 비용이 커진다. `@x` 이전에 **슬라이스 병합**(과도한 세분화 해소)을 먼저 검토할 것. entities 외 레이어에서는 의존성 제거 또는 설계 재검토가 원칙.

## 7. 배럴 파일 주의사항과 성능

1. **순환 참조**: 슬라이스 내부 파일이 자기 슬라이스의 index를 다시 import하면 순환 발생. 예방 — 같은 슬라이스 내부는 상대 경로(`../api/loadUserStatistics`), 다른 슬라이스는 절대 경로/alias(`@/features/comments`).
2. **번들 크기·tree-shaking**: `shared/ui`처럼 관련성 낮은 모듈이 많은 곳에서 거대 배럴 하나로 export하면 Button 하나만 필요해도 carousel·accordion까지 번들에 포함될 위험. 해결 — 컴포넌트 단위 index (`@/shared/ui/button`처럼 import).
3. **Public API 우회**: index가 있어도 IDE 자동완성이 내부 경로를 추천해 규칙 위반이 생긴다. 해결 — **Steiger** 린터로 import 경로 자동 검사.

대규모 프로젝트의 dev 서버·HMR 성능 최적화: ① 큰 index 분할(`shared/ui`·`shared/lib`을 모듈 단위로), ② 불필요한 중첩 index 제거(슬라이스 index가 있으면 `ui/index.ts`는 불필요), ③ Monorepo에서 각 패키지를 독립 FSD 루트로 구성 가능 (한 패키지는 shared·entities만, 다른 패키지는 pages·app만).

## 8. 임포트 규칙 정리

- **Layer Import Rule**: 슬라이스 안의 코드는 자신보다 **아래 레이어**의 슬라이스만 import 가능.
- 하위 → 상위 참조 금지 (shared에서 app 참조 불가).
- 같은 레이어 내 크로스 임포트 금지 — entities의 `@x`만 예외.
- app·shared는 슬라이스가 없으므로 내부 세그먼트끼리 자유 import.
- feature 여러 개의 조합은 **상위 레이어(page/widget)에서만** — props/children/slot으로 주입. feature 간 직접 import는 위반.
- 문서에 명시된 예외적 완화: Redux `RootState`/`AppDispatch`처럼 app에서 정의되는 전역 타입을 shared의 typed hooks가 써야 할 때 `declare type` 전역 선언으로 암묵 의존 허용 (자주 변경되지 않는다는 전제).
- 강제 수단: Steiger(`npx steiger src`) + 팀 합의(엄격함 수준·강제 방법·재검토 주기).
