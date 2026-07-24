import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { fetchJson } from "@/shared/api";
import type { StockSearchResult } from "@/shared/market";

const SEARCH_LIMIT = 10;

export const SEARCH_QUERIES = {
	search: (q: string) =>
		queryOptions({
			queryKey: ["stocks", "search", q] as const,
			queryFn: () =>
				fetchJson<{ results: StockSearchResult[] }>(`/api/search?q=${encodeURIComponent(q)}&limit=${SEARCH_LIMIT}`),
			select: (data) => data.results,
			enabled: q.trim().length >= 2,
			placeholderData: keepPreviousData, // 타이핑 중 이전 결과 유지 → 깜빡임 방지
			staleTime: 1000 * 60 * 60
		})
};
