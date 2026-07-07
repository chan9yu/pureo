export type Market = "US" | "KR";

export interface StockSearchResult {
	symbol: string;
	name: string;
	market: Market;
}

export interface StockQuote {
	symbol: string;
	price: number;
	/** 전일 대비 — 장 마감 등으로 데이터가 없으면 null */
	change: number | null;
	/** 전일 대비 % — 장 마감 등으로 데이터가 없으면 null */
	changePercent: number | null;
	currency: "USD" | "KRW";
}

export interface CompanyProfile {
	symbol: string;
	name: string;
	industry: string | null;
	/** 달러 단위 (Finnhub 원본은 백만 달러 → 변환) */
	marketCapUsd: number | null;
	exchange: string | null;
	logoUrl: string | null;
}

export interface StockMetrics {
	symbol: string;
	per: number | null;
	pbr: number | null;
}

export interface PricePoint {
	/** 'YYYY-MM-DD', 과거 → 최신 순 */
	date: string;
	close: number;
}

export interface MarketDataProvider {
	search(query: string): Promise<StockSearchResult[]>;
	getQuote(symbol: string): Promise<StockQuote>;
	getProfile(symbol: string): Promise<CompanyProfile>;
	getMetrics(symbol: string): Promise<StockMetrics>;
	getDailySeries(symbol: string, days: 30 | 365): Promise<PricePoint[]>;
}
