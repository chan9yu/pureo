import "server-only";

import type { PricePoint } from "./types";

const BASE = "https://api.twelvedata.com";

function apiKey() {
	const key = process.env.TWELVEDATA_API_KEY;
	if (!key) {
		throw new Error("TWELVEDATA_API_KEY가 설정되지 않았습니다");
	}

	return key;
}

export async function getDailySeriesUs(symbol: string, days: 30 | 365): Promise<PricePoint[]> {
	const qs = new URLSearchParams({ symbol, interval: "1day", outputsize: String(days), apikey: apiKey() });
	const res = await fetch(`${BASE}/time_series?${qs}`, { next: { revalidate: 60 * 60 } });
	if (!res.ok) {
		throw new Error(`TwelveData time_series 실패: HTTP ${res.status}`);
	}

	const data = (await res.json()) as { status: string; values?: Array<{ datetime: string; close: string }> };
	if (data.status !== "ok" || !data.values) {
		throw new Error(`TwelveData time_series 실패: ${data.status}`);
	}

	/** TwelveData 응답은 최신순 — 도메인 계약(과거 → 최신)에 맞춰 뒤집는다 */
	return data.values.map((v) => ({ date: v.datetime, close: Number(v.close) })).reverse();
}
