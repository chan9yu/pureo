import "server-only";

import type { CompanyProfile, StockMetrics, StockQuote, StockSearchResult } from "./types";

const BASE = "https://finnhub.io/api/v1";

function apiKey() {
	const key = process.env.FINNHUB_API_KEY;
	if (!key) {
		throw new Error("FINNHUB_API_KEY가 설정되지 않았습니다");
	}

	return key;
}

async function get<T>(path: string, params: Record<string, string>, revalidate: number): Promise<T> {
	const qs = new URLSearchParams({ ...params, token: apiKey() });
	const res = await fetch(`${BASE}${path}?${qs}`, { next: { revalidate } });
	if (!res.ok) {
		throw new Error(`Finnhub ${path} 실패: HTTP ${res.status}`);
	}

	return res.json();
}

export async function searchUs(query: string): Promise<StockSearchResult[]> {
	const data = await get<{ result?: Array<{ symbol: string; description: string; type: string }> }>(
		"/search",
		{ q: query, exchange: "US" },
		60 * 60 * 24
	);

	return (data.result ?? [])
		.filter((r) => r.type === "Common Stock" && !r.symbol.includes("."))
		.slice(0, 10)
		.map((r) => ({ symbol: r.symbol, name: r.description, market: "US" as const }));
}

export async function getQuoteUs(symbol: string): Promise<StockQuote> {
	const q = await get<{ c: number; d: number | null; dp: number | null; pc: number }>("/quote", { symbol }, 60);
	if (q.c === 0 && q.pc === 0) {
		throw new Error(`지원하지 않는 종목: ${symbol}`);
	}

	return {
		symbol,
		price: q.c,
		change: q.d ?? 0,
		changePercent: q.dp ?? 0,
		currency: "USD"
	};
}

export async function getProfileUs(symbol: string): Promise<CompanyProfile> {
	const p = await get<{
		name?: string;
		finnhubIndustry?: string;
		marketCapitalization?: number;
		exchange?: string;
		logo?: string;
	}>("/stock/profile2", { symbol }, 60 * 60 * 24);
	if (!p.name) {
		throw new Error(`지원하지 않는 종목: ${symbol}`);
	}

	return {
		symbol,
		name: p.name,
		industry: p.finnhubIndustry ?? null,
		marketCapUsd: p.marketCapitalization ? p.marketCapitalization * 1_000_000 : null,
		exchange: p.exchange ?? null,
		logoUrl: p.logo ?? null
	};
}

export async function getMetricsUs(symbol: string): Promise<StockMetrics> {
	const data = await get<{ metric?: Record<string, number | null> }>(
		"/stock/metric",
		{ symbol, metric: "all" },
		60 * 60 * 24
	);
	const m = data.metric ?? {};

	return {
		symbol,
		per: m.peTTM ?? m.peAnnual ?? null,
		pbr: m.pbQuarterly ?? m.pbAnnual ?? null
	};
}
