import { describe, expect, it } from "vitest";

import { interpretPbr, interpretPer } from "../valuation";

describe("interpretPer", () => {
	it("PER 10 미만이면 저렴(low)", () => {
		const r = interpretPer(8.2);
		expect(r.level).toBe("low");
		expect(r.sentence).toContain("저렴");
		expect(r.sentence).toContain("8.2");
	});

	it("PER 10~25는 보통(mid)", () => {
		expect(interpretPer(10).level).toBe("mid");
		expect(interpretPer(25).level).toBe("mid");
	});

	it("PER 25 초과는 비쌈(high)", () => {
		expect(interpretPer(40).level).toBe("high");
	});

	it("null·0·음수·NaN은 unknown — 적자 기업 등", () => {
		expect(interpretPer(null).level).toBe("unknown");
		expect(interpretPer(0).level).toBe("unknown");
		expect(interpretPer(-5).level).toBe("unknown");
		expect(interpretPer(Number.NaN).level).toBe("unknown");
	});
});

describe("interpretPbr", () => {
	it("PBR 1 미만이면 저렴(low)", () => {
		expect(interpretPbr(0.8).level).toBe("low");
	});

	it("PBR 1~3은 보통(mid), 3 초과는 비쌈(high)", () => {
		expect(interpretPbr(2).level).toBe("mid");
		expect(interpretPbr(7).level).toBe("high");
	});

	it("null이면 unknown", () => {
		expect(interpretPbr(null).level).toBe("unknown");
	});
});
