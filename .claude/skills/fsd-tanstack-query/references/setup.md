# 초기 구성 — QueryProvider · API client

> 원천: fsd.how/kr `guides/tech/with-react-query` — "QueryProvider 구성하기" · "API 구성에 대한 추가 권장사항" · "참고 자료"

## 목차

1. [QueryProvider — app/providers](#1-queryprovider--appproviders)
2. [API client — shared/api](#2-api-client--sharedapi)
3. [참고 자료](#3-참고-자료)

---

## 1. QueryProvider — app/providers

QueryProvider는 QueryClient 설정을 앱 전역에 적용하는 위치다. query·mutation의 기본 옵션, 그리고 `QueryCache`·`MutationCache`의 공통 에러 처리를 이곳에서 함께 구성한다.

```tsx
// src/app/providers/query-provider.tsx
import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "sonner"; // 공통 에러 알림 — 프로젝트의 알림 수단으로 대체

interface QueryProviderProps {
	children: ReactNode;
	client: QueryClient;
}

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			toast.error(error.message);
		}
	}),
	mutationCache: new MutationCache({
		onError: (error) => {
			toast.error(error.message);
		}
	}),
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			gcTime: 5 * 60 * 1000
		}
	}
});

export const QueryProvider = ({ client, children }: QueryProviderProps) => (
	<QueryClientProvider client={client}>
		{children}
		<ReactQueryDevtools />
	</QueryClientProvider>
);
```

- `client`를 prop으로 받는 이유: 테스트에서 격리된 QueryClient를 주입하거나, SSR에서 요청별 클라이언트로 교체할 수 있다.
- 적용 위치는 프레임워크 진입점 — SPA는 `app`의 entrypoint, Next.js App Router라면 FSD `app` 레이어의 providers를 루트 레이아웃에서 감싼다.
- **SSR 주의**: 서버에서 모듈 스코프 싱글턴 QueryClient를 그대로 쓰면 요청 간 캐시가 공유된다. SSR 환경에서는 요청/렌더마다 QueryClient를 생성한다 (TanStack 공식 SSR 가이드).

---

## 2. API client — shared/api

shared 레이어에 API client 클래스를 두면 프로젝트 전반의 API 호출 방식을 공통으로 관리할 수 있다. 로깅, 헤더, 데이터 형식(JSON, XML 등) 설정도 이 위치에 함께 둔다. 호출 규칙이 바뀌거나 공통 설정을 추가할 때는 이 위치만 수정하면 된다.

```ts
// src/shared/api/api-client.ts
import { API_URL } from "@/shared/config";

export class ApiClient {
	#baseUrl: string;

	constructor(url: string) {
		this.#baseUrl = url;
	}

	async handleResponse<TResult>(response: Response): Promise<TResult> {
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		try {
			return await response.json();
		} catch (error) {
			throw new Error("Error parsing JSON response");
		}
	}

	public async get<TResult = unknown>(
		endpoint: string,
		queryParams?: Record<string, string | number>
	): Promise<TResult> {
		const url = new URL(endpoint, this.#baseUrl);

		if (queryParams) {
			Object.entries(queryParams).forEach(([key, value]) => {
				url.searchParams.append(key, value.toString());
			});
		}

		const response = await fetch(url.toString(), {
			method: "GET",
			headers: { "Content-Type": "application/json" }
		});

		return this.handleResponse<TResult>(response);
	}

	public async post<TResult = unknown, TData = Record<string, unknown>>(
		endpoint: string,
		body: TData
	): Promise<TResult> {
		const response = await fetch(`${this.#baseUrl}${endpoint}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
		});

		return this.handleResponse<TResult>(response);
	}
}

export const apiClient = new ApiClient(API_URL);
```

- base URL은 `shared/config`(환경변수 세그먼트)에서 가져온다 — client 코드에 URL 하드코딩 금지.
- query factory의 요청 함수(`get-posts.ts` 등)는 이 client를 통해서만 백엔드를 호출한다. queryFn에서 `fetch`를 직접 부르지 않는 것이 목적(공통 규칙 우회 방지).
- `handleResponse`의 throw는 fallback이 아니라 **에러 전파**다 — 던져진 에러는 QueryProvider의 `QueryCache.onError`(공통 처리)와 각 화면의 에러 상태로 흘러간다. 요청 함수에서 try/catch로 삼키고 빈 값을 반환하지 말 것.

---

## 3. 참고 자료

- 예제 프로젝트 (GitHub): https://github.com/ruslan4432013/fsd-react-query-example
- 예제 프로젝트 (CodeSandbox): https://codesandbox.io/p/github/ruslan4432013/fsd-react-query-example/main
- query factory 관련 글 — The Query Options API (TkDodo): https://tkdodo.eu/blog/the-query-options-api
