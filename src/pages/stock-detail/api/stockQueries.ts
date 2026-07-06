import { queryOptions } from "@tanstack/react-query";

import { fetchJson } from "@/shared/api";
import type { CompanyProfile, PricePoint, StockMetrics, StockQuote } from "@/shared/market";

export const STOCK_QUERIES = {
	detail: (symbol: string) => ["stocks", "detail", symbol] as const,
	quote: (symbol: string) =>
		queryOptions({
			queryKey: [...STOCK_QUERIES.detail(symbol), "quote"] as const,
			queryFn: () => fetchJson<StockQuote>(`/api/stocks/${symbol}/quote`),
			staleTime: 1000 * 30,
			refetchInterval: 1000 * 60 // 시세는 1분 폴링
		}),
	profile: (symbol: string) =>
		queryOptions({
			queryKey: [...STOCK_QUERIES.detail(symbol), "profile"] as const,
			queryFn: () => fetchJson<CompanyProfile>(`/api/stocks/${symbol}/profile`),
			staleTime: 1000 * 60 * 60 * 24
		}),
	metrics: (symbol: string) =>
		queryOptions({
			queryKey: [...STOCK_QUERIES.detail(symbol), "metrics"] as const,
			queryFn: () => fetchJson<StockMetrics>(`/api/stocks/${symbol}/metrics`),
			staleTime: 1000 * 60 * 60 * 24
		}),
	series: (symbol: string, days: 30 | 365) =>
		queryOptions({
			queryKey: [...STOCK_QUERIES.detail(symbol), "series", days] as const,
			queryFn: () => fetchJson<PricePoint[]>(`/api/stocks/${symbol}/series?days=${days}`),
			staleTime: 1000 * 60 * 60
		})
};
