---
name: fsd-tanstack-query
description: "FSD(Feature-Sliced Design) 프로젝트에 TanStack Query(React Query)를 통합하는 방법 — query key·query factory·mutation을 어느 레이어/세그먼트에 배치할지, queryOptions 기반 query factory 설계, 페이지네이션·무한 스크롤·Suspense·useMutationState 패턴, QueryProvider·API client 구성. 사용자가 TanStack Query, React Query, useQuery, useMutation, queryOptions, query key 관리, 서버 상태, 캐싱, 데이터 페칭을 언급하거나 — 라이브러리 이름 없이도 FSD/레이어드 구조 프로젝트에서 API 요청 코드를 어디에 둘지, query key를 어떻게 관리할지, mutation을 어느 슬라이스에 배치할지 고민할 때 반드시 이 스킬을 사용할 것."
metadata:
  source: "fsd.how/kr — Guides › Tech › Usage with TanStack Query (FSD 공식 문서 한국어판, v2.1 기준)"
  date_added: "2026-07-06"
---

# FSD × TanStack Query

> Feature-Sliced Design(FSD) 프로젝트에 TanStack Query(React Query v5)를 통합하기 위한 스킬.
> FSD 공식 문서(fsd.how/kr)를 원천으로 하며, 특정 프로젝트·프레임워크(Next.js / React Router / …)에 종속되지 않는 범용 가이드다.
> 레이어·세그먼트·Public API 등 FSD 일반 규칙은 전제 지식으로 가정한다 (프로젝트에 fsd-nextjs 같은 FSD 기본 스킬이 있으면 그쪽 참조).

## 핵심 원칙 4가지

1. **query key와 queryFn은 query factory로 한곳에서 관리** — v5의 `queryOptions` 헬퍼로 정의해 `useQuery`·`useSuspenseQuery`·prefetch 어디서든 동일 정의를 재사용한다.
2. **mutation은 query와 같은 파일에 두지 않는다** — mutation은 특정 사용자 동작 뒤에 실행되고 캐시 갱신·UI 처리가 화면 흐름에 묶이므로, 사용처와 가까운 `api` 세그먼트에 배치한다.
3. **QueryClient·Provider·Suspense 경계는 app 레이어** — 전역 기본 옵션과 공통 에러 처리는 `app/providers` 세그먼트가 소유한다.
4. **API client·코드젠 산출물은 shared/api** — 호출 규칙(헤더·로깅·직렬화)의 단일 수정 지점.

## 배치 결정표 — 무엇을 어디에

| 무엇                                | 어디                                         | 근거                                   |
| ----------------------------------- | -------------------------------------------- | -------------------------------------- |
| query factory (query key + queryFn) | `shared/api` **또는** `entities/<slice>/api` | 프로젝트 구성에 따라 — 아래 3옵션      |
| mutation custom hook                | 사용처와 가까운 `pages·features/<slice>/api` | 캐시 갱신·UI 후처리가 화면 흐름에 종속 |
| 재사용 mutation 함수 (`mutationFn`) | `shared/api` 또는 `entities/<slice>/api`     | 재사용 단위와 hook 구성 위치를 분리    |
| mutation key 상수                   | query factory와 **같은 파일**                | `useMutationState` 교차 조회의 식별자  |
| QueryClient + QueryProvider         | `app/providers`                              | 전역 기본 옵션·공통 에러 처리          |
| Suspense·ErrorBoundary 경계         | `app/providers`                              | 로딩·에러 표시는 상위 경계가 담당      |
| API client (fetch 래퍼)             | `shared/api`                                 | 프로젝트 전반 호출 방식 공통 관리      |
| 코드 생성 도구 산출물 (Swagger 등)  | `shared/api`                                 | 생성 코드 집결지                       |

### query factory 배치 — 3가지 옵션

| 옵션                            | 구조                                                   | 언제 선택하나                                                     |
| ------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| **A. shared 통합**              | `shared/api/queries/*.ts` + `shared/api/index.ts` 노출 | 프로젝트 전반 API를 한곳에 모아 관리하려는 경우                   |
| **B. shared + controller 단위** | `shared/api/<controller>/` 폴더별 `index.ts`           | endpoint가 많아져 한 폴더로는 관리가 어려워진 경우                |
| **C. entities api 세그먼트**    | `entities/<slice>/api/`                                | 프로젝트가 entity 단위로 나뉘고 요청이 entity와 1:1 대응하는 경우 |

- C에서 entity 간 참조가 필요하면(예: Country가 City 목록을 필드로 포함) `@x` cross-import를 사용한다.

### mutation 배치 — 2가지 옵션

1. **사용처 가까운 api 세그먼트에 custom hook** (`pages/example/api/use-update-example.ts`) — 화면 흐름과 밀접한 mutation. 캐시 무효화·낙관적 업데이트 같은 후처리가 화면마다 다를 때.
2. **shared/entities에 `mutationFn`만 두고, `useMutation`은 사용처에서 구성** — 같은 mutation 로직을 여러 화면에서 서로 다른 후처리로 재사용할 때.

## Query factory 요점

```ts
// shared/api/post/post.queries.ts  (옵션 C면 entities/post/api/)
import { queryOptions } from "@tanstack/react-query";

export const POST_QUERIES = {
	all: () => ["posts"],
	lists: () => [...POST_QUERIES.all(), "list"],
	list: (page: number, limit: number) =>
		queryOptions({
			queryKey: [...POST_QUERIES.lists(), page, limit],
			queryFn: () => getPosts(page, limit),
			placeholderData: (prev) => prev
		}),
	details: () => [...POST_QUERIES.all(), "detail"],
	detail: (id: number) =>
		queryOptions({
			queryKey: [...POST_QUERIES.details(), id],
			queryFn: () => getDetailPost({ id })
		})
};
```

- **계층적 key** (`all → lists → list`): 상위 key로 prefix 무효화 가능 — `invalidateQueries({ queryKey: POST_QUERIES.lists() })`.
- `queryOptions` 기반 정의는 `useQuery`·`useSuspenseQuery`와 그대로 호환되고, 무한 스크롤은 `infiniteQueryOptions`로 동일 패턴 확장.
- 장점: 요청을 한곳에서 관리 / query·key의 일관된 구성 / 같은 key를 여러 위치에서 재사용.

## 판단 기준 요약 (자주 틀리는 결정)

| 질문                                        | 답                                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| query factory를 shared에? entities에?       | 요청이 entity와 1:1로 대응하면 `entities/<slice>/api`, 아니면 `shared/api`                   |
| `shared/api/queries`가 비대해졌다           | controller 단위 폴더로 분리 + 폴더마다 `index.ts` (옵션 B)                                   |
| mutation hook은 어디에?                     | 사용하는 페이지/피처의 `api` 세그먼트. 여러 화면 재사용이면 `mutationFn`만 shared/entities로 |
| query와 mutation을 한 파일에?               | 금지 권장. mutation key 상수만 query factory 파일에 함께 둔다                                |
| `isLoading` 분기가 반복된다                 | `useSuspenseQuery` + app 레이어 Suspense 경계로 로딩 처리를 상위로 이동                      |
| 다른 위젯에서 "저장 중..." 표시하고 싶다    | mutation key 상수화 + `useMutationState` 필터 조회                                           |
| 페이지 전환 시 목록이 깜빡인다              | `placeholderData: prev => prev`로 이전 데이터 유지                                           |
| staleTime 기본값·공통 에러 토스트는?        | `app/providers`의 QueryClient — `defaultOptions` + `QueryCache`/`MutationCache`의 `onError`  |
| entity A의 query가 entity B 타입을 참조한다 | `@x` cross-import (entities 레이어 한정)                                                     |

## References (필요할 때만 읽기)

| 파일                      | 언제 읽나                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `references/placement.md` | query factory·mutation 배치 결정, 디렉토리 골격 설계, 레이어 임포트 규칙과의 상호작용 |
| `references/patterns.md`  | query factory 작성, 페이지네이션·무한 스크롤·Suspense·useMutationState 구현           |
| `references/setup.md`     | 프로젝트 최초 셋업 — QueryProvider·API client 구성, 코드 생성 도입                    |
