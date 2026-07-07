import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { getStockQuote } from "../quote";
import { searchStocks } from "../search";

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

const ctx = (symbol: string) => ({ params: Promise.resolve({ symbol }) });

describe("GET /api/search", () => {
	it("2자 미만이면 외부 호출 없이 빈 배열", async () => {
		const res = await searchStocks(new Request("http://localhost/api/search?q=a"));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ results: [] });
	});

	it("정상 검색 결과를 반환한다", async () => {
		server.use(
			http.get("https://finnhub.io/api/v1/search", () =>
				HttpResponse.json({ result: [{ symbol: "AAPL", description: "Apple Inc", type: "Common Stock" }] })
			)
		);
		const res = await searchStocks(new Request("http://localhost/api/search?q=apple"));
		const body = await res.json();
		expect(body.results[0].symbol).toBe("AAPL");
	});
});

describe("GET /api/stocks/[symbol]/quote", () => {
	it("시세를 반환한다", async () => {
		server.use(
			http.get("https://finnhub.io/api/v1/quote", () => HttpResponse.json({ c: 210.5, d: 2.1, dp: 1.01, pc: 208.4 }))
		);
		const res = await getStockQuote(new Request("http://localhost/api/stocks/AAPL/quote"), ctx("AAPL"));
		expect(res.status).toBe(200);
		expect((await res.json()).price).toBe(210.5);
	});

	it("외부 API 장애면 502 + 쉬운 에러 문구", async () => {
		server.use(http.get("https://finnhub.io/api/v1/quote", () => new HttpResponse(null, { status: 500 })));
		const res = await getStockQuote(new Request("http://localhost/api/stocks/AAPL/quote"), ctx("AAPL"));
		expect(res.status).toBe(502);
		expect((await res.json()).error.message).toContain("불러오지 못했어요");
	});

	it("지원하지 않는 종목이면 404 — 재시도 대상이 아닌 영구 실패로 분류", async () => {
		server.use(
			http.get("https://finnhub.io/api/v1/quote", () => HttpResponse.json({ c: 0, d: null, dp: null, pc: 0 }))
		);
		const res = await getStockQuote(new Request("http://localhost/api/stocks/ZZZZ/quote"), ctx("ZZZZ"));
		expect(res.status).toBe(404);
		expect((await res.json()).error.message).toContain("찾을 수 없");
	});
});
