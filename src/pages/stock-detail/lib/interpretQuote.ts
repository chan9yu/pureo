export type QuoteDirection = "up" | "down" | "flat" | "unknown";

export interface QuoteInterpretation {
	direction: QuoteDirection;
	sentence: string;
}

export function interpretQuote(change: number | null, changePercent: number | null): QuoteInterpretation {
	if (change === null || changePercent === null) {
		return {
			direction: "unknown",
			sentence: "어제와 비교할 데이터가 아직 없어요."
		};
	}

	if (change === 0) {
		return {
			direction: "flat",
			sentence: "어제와 같은 가격이에요."
		};
	}

	const pct = Math.abs(changePercent).toFixed(1);

	if (change > 0) {
		return {
			direction: "up",
			sentence: `어제보다 ${pct}% 올랐어요.`
		};
	}

	return {
		direction: "down",
		sentence: `어제보다 ${pct}% 내렸어요.`
	};
}
