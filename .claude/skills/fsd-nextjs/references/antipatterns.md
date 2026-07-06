# FSD 안티패턴·리팩터링·타입 배치

> 원천: fsd.how/kr `guides/issues/cross-imports` · `guides/issues/desegmented` · `guides/issues/excessive-entities` · `guides/examples/types` · `guides/migration/from-v2-0`

## 목차

1. [크로스 임포트 해소 전략](#1-크로스-임포트-해소-전략)
2. [Desegmentation (기술 역할별 묶기)](#2-desegmentation-기술-역할별-묶기)
3. [과잉 Entities](#3-과잉-entities)
4. [타입 배치 규칙](#4-타입-배치-규칙)
5. [v2.0 → v2.1 (Pages-First)](#5-v20--v21-pages-first)

---

## 1. 크로스 임포트 해소 전략

크로스 임포트(같은 레이어 내 슬라이스 간 import, 예: `features/cart` → `features/product`)는 단순 스타일 문제가 아니라 **구조적 경고 신호**다:

1. 책임·관리 주체 모호화 — 숨은 의존성이 런타임 오류·리뷰 비용을 낳는다
2. 슬라이스 독립 개발·테스트 불가
3. 코드 탐색 비용 증가
4. 단방향이 시간이 지나며 **양방향 순환 의존성**으로 고착

### entities 레이어에서

경계 과세분화 여부 검토 → **슬라이스 병합**이 자연스러운지 확인 → 불가피하면 `@x` (최후의 타협책).

### features·widgets 레이어의 4가지 전략

| 전략                          | 적용 시점                                                      | 방법                                                                                                                                                                |
| ----------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Slice Merge**            | 두 슬라이스가 항상 함께 변경될 때                              | `features/profile` + `features/profileSettings` → `features/profile` 하나로 병합                                                                                    |
| **B. Entities로 하향**        | 여러 feature가 같은 도메인 로직(세션 검증 등)을 반복 사용할 때 | `entities/session` 생성 — 도메인 타입·로직만 두고 UI는 features/widgets에 유지                                                                                      |
| **C. 상위 레이어 조립 (IoC)** | UI 조합이 필요할 때                                            | pages/app에서 조합. Render Props(React), Slots(Vue), props/Context DI. 예: `CommentList`가 `UserAvatar`를 직접 import하지 않고 `renderUserAvatar` prop으로 주입받음 |
| **D. Public API 제한 재사용** | 크로스 임포트가 정말 불가피할 때                               | 공개 Public API만 사용 (`@/features/auth`의 index만, `model/internal` 직접 접근 금지)                                                                               |

### 문제화 기준 (경고 신호)

- 다른 슬라이스의 store/model에 직접 의존
- 양방향 의존 발생
- 한 슬라이스 변경이 거의 항상 다른 슬라이스를 파괴
- 상위 레이어 조립을 회피한 교차 임포트

적용 강도: "절대 금지"가 아니라 "일반적으로 피해야 할 의존성". 초기 제품은 문서화 + 주기적 검토 전제로 어느 정도 허용 가능, 장기 운영 시스템은 엄격하게.

## 2. Desegmentation (기술 역할별 묶기)

코드를 비즈니스 도메인이 아닌 **기술적 역할**로 묶는 구성 — `components/`, `utils/`, `stores/`에 여러 도메인 코드 혼재. FSD 코드베이스 내부에서도 발생한다 (`features/delivery/ui/components`, `entities/recommendations/utils`).

- **파일 단위에서도 발생**: 하나의 `types.ts`/`utils.ts`에 delivery 도메인 + user 도메인이 함께 있으면 동일한 문제.
- 결과: 낮은 응집도(한 기능 수정에 여러 폴더 왕복), 높은 결합도, 리팩터링 곤란.
- 해결: 도메인별 그룹화 + "무엇을 다루는지" 드러나는 이름. `types.ts` → `delivery.ts`·`user.ts`처럼 파일명에 도메인 명시.

## 3. 과잉 Entities

entities는 낮은 계층 + 높은 접근성이라 수정 시 상위 여러 슬라이스에 파급된다. 남발하면 경계 모호화·결합도 상승·import 복잡성.

**6가지 판단 기준**:

1. **entities 레이어가 없어도 FSD 위반이 아니다** — thin client 앱이면 불필요할 수 있다
2. 초기에는 페이지/위젯의 `model`에 두고 **재사용이 명확해졌을 때만** entities로 이동
3. 모든 비즈니스 로직이 entity를 필요로 하지 않는다 — 먼저 `shared/api` 타입 + 현재 슬라이스 `model` 활용. 백엔드 응답 타입 → `shared/api`, 재사용 가능 로직 → entity `model`
4. **단순 CRUD는 `shared/api`에** — 여러 요청의 일관성·트랜잭션 처리가 필요할 때만 entities 검토
5. **인증 데이터(토큰, 로그인 응답 사용자 정보)는 `shared/auth` 또는 `shared/api`에** — 인증 컨텍스트 종속적이고 재사용성이 낮다
6. `@x` 최소화 — 관련 로직을 하나의 entity로 통합 (❌ order/order-item/order-customer-info 분리 + 상호 import → ✅ `order-info` 하나로)

관련 주의: shared 비대화 방지 — "재사용 가능하다"는 이유만으로 shared에 두지 말 것 (v2.1 원칙: shared는 순수 재사용 요소만). `shared/types` 폴더 금지 — 제너릭 타입은 기능별 세그먼트에.

## 4. 타입 배치 규칙

최고 원칙: **"타입의 위치는 그 타입의 용도와 책임에서 나온다."**

| 타입 종류                | 권장 위치                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------- |
| 유틸리티 타입            | 사용처 근처, 또는 `shared/lib/utility-types` (type-fest 같은 외부 라이브러리 우선) |
| 엔티티 타입              | `entities/{slice}/model` — 상호 참조는 제네릭 매개변수화 또는 `@x`                 |
| DTO                      | `shared/api` 또는 request 함수 바로 옆 (백엔드 타입 공유 패키지가 있으면 그곳)     |
| Mapper (DTO 변환)        | DTO와 동일 위치                                                                    |
| Enum                     | 사용처 기준 — UI 상태 → `ui`, 백엔드 응답 상태 → `api`, 전역 공통값 → shared       |
| Zod 등 검증 스키마       | 백엔드 응답 검증 → `api`, 폼 입력 검증 → `ui`/`model`                              |
| Props/Context 타입       | 컴포넌트와 같은 파일                                                               |
| Ambient (`*.d.ts`)       | `src/` 또는 `app/ambient/`                                                         |
| 타입 없는 외부 패키지    | `shared/lib/untyped-packages/{라이브러리명}.d.ts`                                  |
| 자동 생성 타입 (OpenAPI) | `shared/api/{tool}/` + README(재생성 명령 문서화) + `types.generated.ts`           |

엔티티 상호 참조 해결 2전략:

1. **제네릭 타입 매개변수화** — `Song<ArtistType extends { id: string }>`. 단순 구조에 적합, Country–City처럼 강결합 관계에는 부적합
2. **`@x` Public API** — 중첩 DTO는 normalizr 패턴 + `@x`로 처리

## 5. v2.0 → v2.1 (Pages-First)

v2.0의 문제: entity/feature 단위 하향식 세분화 → 비즈니스 로직이 entities/features에 과도 집중, page가 단순 조합 계층으로 전락, 의존성 복잡화.

**v2.1 원칙** (현행):

1. 주요 UI·비즈니스 로직을 **page 내부에** 배치
2. shared는 순수 재사용 요소만
3. 여러 page에서 **실제로 공유되는** 로직만 하위 레이어로 분리
4. `@x` 표기법 표준화

- 하위 호환: v2.0 코드는 수정 없이 작동한다.
- 마이그레이션 절차: Steiger로 `insignificant-slice`(단일 페이지에서만 쓰이는 슬라이스 → 페이지로 병합), `excessive-slicing`(과잉 분할 → 통합/그룹화) 탐지 → 슬라이스 병합 → `@x` 표준화.
- Deprecated: processes 레이어.

## 점진 도입 절차 (기존 코드베이스)

1. `app`·`shared` 레이어 정리
2. 기존 UI를 `widgets`·`pages`로 분배 (규칙 위반이 있어도 일단 배치)
3. import 위반을 해결하며 로직을 `entities`·`features`로 이동
4. Steiger를 lint/CI에 연결해 회귀 차단

설계는 **페이지 목록 도출부터** 시작하고, shared 코드는 "계획이 아닌 개발 중 발견"으로 점진 추출한다. 헤더처럼 모든 페이지에 나오는 블록은 단순하면 shared, 하위 레이어 코드가 필요하면 widgets.
