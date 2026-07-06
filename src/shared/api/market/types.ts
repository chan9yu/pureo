export type Market = "US" | "KR";

export interface StockSearchResult {
	symbol: string;
	name: string;
	market: Market;
}

export interface StockQuote {
	symbol: string;
	price: number;
	change: number; // 전일 대비
	changePercent: number; // 전일 대비 %
	currency: "USD" | "KRW";
}

export interface CompanyProfile {
	symbol: string;
	name: string;
	industry: string | null;
	marketCapUsd: number | null; // 달러 단위 (Finnhub 원본은 백만 달러 → 변환)
	exchange: string | null;
	logoUrl: string | null;
}

export interface StockMetrics {
	symbol: string;
	per: number | null;
	pbr: number | null;
}

export interface PricePoint {
	date: string; // 'YYYY-MM-DD', 과거 → 최신 순
	close: number;
}

export interface MarketDataProvider {
	search(query: string): Promise<StockSearchResult[]>;
	getQuote(symbol: string): Promise<StockQuote>;
	getProfile(symbol: string): Promise<CompanyProfile>;
	getMetrics(symbol: string): Promise<StockMetrics>;
	getDailySeries(symbol: string, days: number): Promise<PricePoint[]>;
}
