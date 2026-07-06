import { describe, expect, it } from "vitest";

import type { CompanyProfile } from "@/shared/api";

import { describeCompany, formatMarketCapUsd } from "../describeCompany";

const base: CompanyProfile = {
	symbol: "AAPL",
	name: "Apple Inc",
	industry: "Technology",
	marketCapUsd: 3.4e12,
	exchange: "NASDAQ",
	logoUrl: null
};

describe("describeCompany", () => {
	it("업종·시총이 있으면 모두 담은 소개 문장", () => {
		const s = describeCompany(base);
		expect(s).toContain("Technology 업종");
		expect(s).toContain("조 달러");
		expect(s).toContain("아주 큰");
	});

	it("시총이 없으면 업종 문장만", () => {
		const s = describeCompany({ ...base, marketCapUsd: null });
		expect(s).toContain("Technology 업종");
		expect(s).not.toContain("시가총액");
	});

	it("업종이 없어도 문장이 성립한다", () => {
		expect(describeCompany({ ...base, industry: null })).toContain("미국 증시에 상장된 회사");
	});
});

describe("formatMarketCapUsd", () => {
	it("1조 달러 이상은 조 단위", () => {
		expect(formatMarketCapUsd(3.4e12)).toBe("약 3.4조 달러");
	});

	it("그 아래는 억 단위", () => {
		expect(formatMarketCapUsd(85e9)).toBe("약 850억 달러");
	});
});
