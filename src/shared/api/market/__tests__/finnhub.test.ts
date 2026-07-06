import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { getMetricsUs, getProfileUs, getQuoteUs, searchUs } from "../finnhub";

vi.mock("server-only", () => ({}));

const server = setupServer();
beforeAll(() => {
	vi.stubEnv("FINNHUB_API_KEY", "test-key");
	server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => {
	vi.unstubAllEnvs();
	server.close();
});

describe("getQuoteUs", () => {
	it("Finnhub 응답을 StockQuote로 변환한다", async () => {
		server.use(
			http.get("https://finnhub.io/api/v1/quote", () => HttpResponse.json({ c: 210.5, d: 2.1, dp: 1.01, pc: 208.4 }))
		);
		expect(await getQuoteUs("AAPL")).toEqual({
			symbol: "AAPL",
			price: 210.5,
			change: 2.1,
			changePercent: 1.01,
			currency: "USD"
		});
	});

	it("존재하지 않는 종목(c=0, pc=0)이면 throw", async () => {
		server.use(
			http.get("https://finnhub.io/api/v1/quote", () => HttpResponse.json({ c: 0, d: null, dp: null, pc: 0 }))
		);
		await expect(getQuoteUs("NOPE")).rejects.toThrow();
	});
});

describe("searchUs", () => {
	it("Common Stock만 남기고 최대 10개 반환", async () => {
		server.use(
			http.get("https://finnhub.io/api/v1/search", () =>
				HttpResponse.json({
					result: [
						{ symbol: "AAPL", description: "Apple Inc", type: "Common Stock" },
						{ symbol: "AAPL.SW", description: "Apple Swiss", type: "Common Stock" },
						{ symbol: "AAPX", description: "Some ETF", type: "ETP" }
					]
				})
			)
		);
		expect(await searchUs("apple")).toEqual([{ symbol: "AAPL", name: "Apple Inc", market: "US" }]);
	});
});

describe("getProfileUs", () => {
	it("시총을 백만 달러 → 달러로 변환한다", async () => {
		server.use(
			http.get("https://finnhub.io/api/v1/stock/profile2", () =>
				HttpResponse.json({
					name: "Apple Inc",
					finnhubIndustry: "Technology",
					marketCapitalization: 3400000,
					exchange: "NASDAQ",
					logo: "https://x/logo.png"
				})
			)
		);
		const p = await getProfileUs("AAPL");
		expect(p.marketCapUsd).toBe(3.4e12);
		expect(p.industry).toBe("Technology");
	});

	it("빈 응답(미지원 종목)이면 throw", async () => {
		server.use(http.get("https://finnhub.io/api/v1/stock/profile2", () => HttpResponse.json({})));
		await expect(getProfileUs("NOPE")).rejects.toThrow();
	});
});

describe("getMetricsUs", () => {
	it("peTTM/pbQuarterly를 우선 사용하고 없으면 null", async () => {
		server.use(
			http.get("https://finnhub.io/api/v1/stock/metric", () => HttpResponse.json({ metric: { peTTM: 32.5 } }))
		);
		expect(await getMetricsUs("AAPL")).toEqual({ symbol: "AAPL", per: 32.5, pbr: null });
	});
});
