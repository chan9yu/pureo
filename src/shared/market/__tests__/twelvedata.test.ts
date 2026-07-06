import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { getDailySeriesUs } from "../twelvedata";

vi.mock("server-only", () => ({}));

const server = setupServer();
beforeAll(() => {
	vi.stubEnv("TWELVEDATA_API_KEY", "test-key");
	server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => {
	vi.unstubAllEnvs();
	server.close();
});

describe("getDailySeriesUs", () => {
	it("최신순 응답을 과거→최신 PricePoint[]로 변환한다", async () => {
		server.use(
			http.get("https://api.twelvedata.com/time_series", () =>
				HttpResponse.json({
					status: "ok",
					values: [
						{ datetime: "2026-07-03", close: "213.55" },
						{ datetime: "2026-07-02", close: "210.10" }
					]
				})
			)
		);
		expect(await getDailySeriesUs("AAPL", 30)).toEqual([
			{ date: "2026-07-02", close: 210.1 },
			{ date: "2026-07-03", close: 213.55 }
		]);
	});

	it("status가 ok가 아니면 throw", async () => {
		server.use(
			http.get("https://api.twelvedata.com/time_series", () => HttpResponse.json({ status: "error", message: "limit" }))
		);
		await expect(getDailySeriesUs("AAPL", 30)).rejects.toThrow();
	});
});
