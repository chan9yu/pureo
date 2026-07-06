import { describe, expect, it } from "vitest";

import { interpretTrend } from "../trend";

function series(...closes: number[]) {
	return closes.map((close, i) => ({ date: `2026-06-${String(i + 1).padStart(2, "0")}`, close }));
}

describe("interpretTrend", () => {
	it("+10% 이상이면 크게 오름(up)", () => {
		const r = interpretTrend(series(100, 105, 115), "최근 1개월");
		expect(r.direction).toBe("up");
		expect(r.sentence).toContain("크게 올랐어요");
		expect(r.sentence).toContain("최근 1개월");
	});

	it("+3~10%면 완만한 상승(up)", () => {
		expect(interpretTrend(series(100, 105), "최근 1개월").sentence).toContain("완만");
	});

	it("-3~+3%면 횡보(flat)", () => {
		expect(interpretTrend(series(100, 101), "최근 1개월").direction).toBe("flat");
	});

	it("-10% 이하면 크게 내림(down)", () => {
		const r = interpretTrend(series(100, 85), "최근 1년");
		expect(r.direction).toBe("down");
		expect(r.sentence).toContain("크게 내렸어요");
	});

	it("데이터 2개 미만이면 unknown", () => {
		expect(interpretTrend(series(100), "최근 1개월").direction).toBe("unknown");
		expect(interpretTrend([], "최근 1개월").direction).toBe("unknown");
	});
});
