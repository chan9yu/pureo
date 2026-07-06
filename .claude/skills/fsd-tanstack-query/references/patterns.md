# 코드 패턴 — query factory · 페이지네이션 · 무한 스크롤 · Suspense · useMutationState

> 원천: fsd.how/kr `guides/tech/with-react-query`.
> 예시 경로는 배치 옵션 B(`shared/api/post/`) 기준 — 옵션 C를 쓴다면 `entities/post/api/`로 경로만 바뀐다 (`placement.md` §1).

## 목차

1. [Query factory 만들기](#1-query-factory-만들기)
2. [컴포넌트에서 사용](#2-컴포넌트에서-사용)
3. [페이지네이션](#3-페이지네이션)
4. [무한 스크롤](#4-무한-스크롤)
5. [Suspense 모드](#5-suspense-모드)
6. [useMutationState — 컴포넌트 간 mutation 상태 공유](#6-usemutationstate--컴포넌트-간-mutation-상태-공유)

---

## 1. Query factory 만들기

Query factory는 query key를 생성하는 함수를 모아 둔 객체다. 최소형은 key만 계층적으로 조립한다:

```ts
const keyFactory = {
	all: () => ["entity"],
	lists: () => [...keyFactory.all(), "list"]
};
```

queryKey와 queryFn을 **함께** 정의해 여러 위치에서 재사용하려면 react-query v5의 `queryOptions` 헬퍼를 사용한다:

```ts
import { queryOptions } from "@tanstack/react-query";

const groupOptions = (id: number) =>
	queryOptions({
		queryKey: ["groups", id],
		queryFn: () => fetchGroups(id),
		gcTime: 5 * 1000
	});
```

실전 형태 — key 계층(`all → lists/details → list/detail`)과 요청 함수를 한 파일에 조립:

```ts
// src/shared/api/post/post.queries.ts
import { queryOptions } from "@tanstack/react-query";
import { getPosts } from "./get-posts";
import { getDetailPost, type DetailPostQuery } from "./get-detail-post";

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
	detail: (query?: DetailPostQuery) =>
		queryOptions({
			queryKey: [...POST_QUERIES.details(), query?.id],
			queryFn: () => getDetailPost({ id: query?.id })
		})
};
```

**장점** (공식 문서 명시):

- 요청을 한곳에서 관리할 수 있다.
- query와 query key를 일관된 방식으로 구성할 수 있다.
- 같은 query key를 여러 위치에서 재사용할 수 있다.

계층적 key의 실용 효과: 상위 key로 prefix 무효화가 가능하다 — `queryClient.invalidateQueries({ queryKey: POST_QUERIES.lists() })`는 모든 목록 query를 한 번에 무효화한다.

---

## 2. 컴포넌트에서 사용

factory가 `queryOptions`를 반환하므로 `useQuery`에 그대로 전달한다. (예시는 react-router지만 라우터와 무관한 패턴이다.)

```tsx
// src/pages/post/ui/post.tsx
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { postApi } from "@/shared/api/post";

export const Post = () => {
	const { postId } = useParams();
	const {
		data: post,
		error,
		isLoading,
		isError
	} = useQuery(postApi.POST_QUERIES.detail({ id: parseInt(postId ?? "", 10) }));

	if (isLoading) return <div>Loading...</div>;
	if (isError || !post) return <div>{error?.message}</div>;

	return (
		<div>
			<h1>{post.title}</h1>
			<p>{post.body}</p>
			<div>Owner: {post.userId}</div>
		</div>
	);
};
```

---

## 3. 페이지네이션

§1의 query factory를 그대로 사용한다. `placeholderData: prev => prev` 옵션이 페이지 전환 중에도 이전 데이터를 유지해, UI가 갑자기 비어 보이거나 크게 바뀌는 것을 줄인다.

```tsx
// src/pages/home/ui/home.tsx
export const Home = () => {
	const [page, setPage] = usePageParam(DEFAULT_PAGE);
	const { data, isFetching, isLoading } = useQuery(postApi.POST_QUERIES.list(page, DEFAULT_ITEMS_ON_SCREEN));

	return (
		<>
			<Pagination onChange={(_, page) => setPage(page)} page={page} count={data?.totalPages} />
			<Posts posts={data?.posts} />
		</>
	);
};
```

---

## 4. 무한 스크롤

무한 스크롤·"더보기" 버튼 UI는 `useInfiniteQuery`로 구성한다. query factory 패턴은 `infiniteQueryOptions`로 그대로 확장된다.

```ts
// src/shared/api/post/post.queries.ts
import { infiniteQueryOptions } from "@tanstack/react-query";
import { getPosts } from "./get-posts";

export const POST_QUERIES = {
	all: () => ["posts"],
	lists: () => [...POST_QUERIES.all(), "list"],
	infinite: (limit: number) =>
		infiniteQueryOptions({
			queryKey: [...POST_QUERIES.lists(), "infinite", limit],
			queryFn: ({ pageParam }) => getPosts(pageParam, limit),
			initialPageParam: 0,
			getNextPageParam: (lastPage) =>
				lastPage.skip + lastPage.limit < lastPage.total ? lastPage.skip / lastPage.limit + 1 : undefined
		})
};
```

```tsx
// src/pages/post-feed/ui/post-feed.tsx
import { useInfiniteQuery } from "@tanstack/react-query";
import { postApi } from "@/shared/api/post";

export const PostFeed = () => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(postApi.POST_QUERIES.infinite(10));

	const posts = data?.pages.flatMap((page) => page.posts) ?? [];

	return (
		<>
			<Posts posts={posts} />
			{hasNextPage && (
				<button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
					{isFetchingNextPage ? "Loading..." : "Load more"}
				</button>
			)}
		</>
	);
};
```

---

## 5. Suspense 모드

`useSuspenseQuery`를 사용하면 로딩 상태를 React Suspense가 처리한다. 컴포넌트에서 `isLoading`을 직접 확인할 필요가 없어지고, 로딩 표시는 상위 Suspense 경계가 담당한다.

**1. query factory는 그대로 재사용한다** — `useSuspenseQuery`는 `queryOptions` 기반 구성과 호환된다.

**2. 컴포넌트에서 사용:**

```tsx
// src/pages/post/ui/post.tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { postApi } from "@/shared/api/post";

// 데이터가 준비된 뒤에만 렌더링되므로 isLoading 분기가 사라진다
export const Post = ({ id }: { id: number }) => {
	const { data: post } = useSuspenseQuery(postApi.POST_QUERIES.detail({ id }));

	return (
		<div>
			<h1>{post.title}</h1>
			<p>{post.body}</p>
		</div>
	);
};
```

**3. Suspense 경계는 app 레이어의 provider로** — 앱 전역 또는 필요한 라우트 단위에서 감싼다:

```tsx
// src/app/providers/suspense-provider.tsx
import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const SuspenseProvider = ({ children }: { children: ReactNode }) => (
	<ErrorBoundary fallback={<div>Something went wrong</div>}>
		<Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
	</ErrorBoundary>
);
```

`useSuspenseQuery`는 에러도 상위로 던지므로 Suspense 경계에는 ErrorBoundary가 함께 있어야 한다.

---

## 6. useMutationState — 컴포넌트 간 mutation 상태 공유

한 컴포넌트(예: 페이지 내부의 폼)에서 mutation이 진행되는 동안, 별도의 컴포넌트(예: 전역 헤더의 저장 인디케이터)에서 진행 상태를 표시할 때 사용한다. mutation key는 query factory와 비슷한 방식으로 한곳에서 관리한다.

**1. mutation key를 한곳에서 관리** — query factory와 같은 파일에 모아 둔다:

```ts
// src/shared/api/post/post.queries.ts
export const POST_MUTATIONS = {
	updateTitle: () => ["post", "update-title"],
	create: () => ["post", "create"]
};
```

**2. `mutationKey`로 mutation 식별:**

```ts
// src/features/update-post/api/use-update-post-title.ts
import { useMutation } from "@tanstack/react-query";
import { apiClient, POST_MUTATIONS } from "@/shared/api/post";

interface UpdatePostTitle {
	id: number;
	newTitle: string;
}

export const useUpdatePostTitle = () =>
	useMutation({
		mutationKey: POST_MUTATIONS.updateTitle(),
		mutationFn: ({ id, newTitle }: UpdatePostTitle) => apiClient.patch(`/posts/${id}`, { title: newTitle })
	});
```

**3. 다른 컴포넌트에서 mutation 상태 읽기:**

```tsx
// src/widgets/save-indicator/ui/save-indicator.tsx
import { useMutationState } from "@tanstack/react-query";
import { POST_MUTATIONS } from "@/shared/api/post";

export const SaveIndicator = () => {
	const isPending =
		useMutationState({
			filters: { mutationKey: POST_MUTATIONS.updateTitle(), status: "pending" },
			select: (mutation) => mutation.state.status
		}).length > 0;

	return isPending && <span>Saving...</span>;
};
```

레이어 관점: feature(`update-post`)와 widget(`save-indicator`)이 서로를 import하지 않고, 둘 다 아래 레이어(shared)의 key 상수만 참조한다 — 크로스 임포트 없이 상태를 공유하는 것이 이 패턴의 FSD적 가치다.
