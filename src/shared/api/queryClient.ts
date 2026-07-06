import { environmentManager, QueryClient } from "@tanstack/react-query";

import { HttpError } from "./http";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
				// 5xx만 재시도(최대 2회), 4xx는 즉시 실패
				retry: (failureCount, error) => failureCount < 2 && (!(error instanceof HttpError) || error.status >= 500)
			}
		}
	});
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
	if (environmentManager.isServer()) {
		// 서버: 요청 간 캐시 공유 금지 — 요청마다 새 인스턴스
		return makeQueryClient();
	}

	return (browserQueryClient ??= makeQueryClient());
}
