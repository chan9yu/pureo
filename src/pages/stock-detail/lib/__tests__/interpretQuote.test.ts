import { describe, expect, it } from "vitest";

import { interpretQuote } from "../interpretQuote";

describe("interpretQuote", () => {
	it("올랐으면 up + 올랐어요 문장", () => {
		const r = interpretQuote(2.1, 1.04);
		expect(r.direction).toBe("up");
		expect(r.sentence).toContain("1.0%");
		expect(r.sentence).toContain("올랐어요");
	});

	it("내렸으면 down + 내렸어요 문장", () => {
		const r = interpretQuote(-3.2, -1.5);
		expect(r.direction).toBe("down");
		expect(r.sentence).toContain("내렸어요");
	});

	it("변동이 0이면 flat", () => {
		const r = interpretQuote(0, 0);
		expect(r.direction).toBe("flat");
		expect(r.sentence).toContain("같은 가격");
	});

	it("장 마감 등으로 null이면 unknown — 올랐다고 단정하지 않는다", () => {
		const r = interpretQuote(null, null);
		expect(r.direction).toBe("unknown");
		expect(r.sentence).toContain("비교할 데이터");
	});
});
