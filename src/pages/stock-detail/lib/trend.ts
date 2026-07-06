import type { PricePoint } from "@/shared/market";

export interface TrendInterpretation {
	direction: "up" | "down" | "flat" | "unknown";
	changePercent: number | null;
	sentence: string;
}

export function interpretTrend(series: PricePoint[], periodLabel: string): TrendInterpretation {
	const first = series.at(0);
	const last = series.at(-1);

	if (series.length < 2 || first === undefined || last === undefined) {
		return {
			direction: "unknown",
			changePercent: null,
			sentence: "가격 흐름을 보여줄 데이터가 아직 부족해요."
		};
	}

	const changePercent = ((last.close - first.close) / first.close) * 100;
	const pct = Math.abs(changePercent).toFixed(1);

	if (changePercent >= 10) {
		return {
			direction: "up",
			changePercent,
			sentence: `${periodLabel} 동안 ${pct}% 크게 올랐어요.`
		};
	}

	if (changePercent >= 3) {
		return {
			direction: "up",
			changePercent,
			sentence: `${periodLabel} 동안 ${pct}% 완만하게 오르는 중이에요.`
		};
	}

	if (changePercent > -3) {
		return {
			direction: "flat",
			changePercent,
			sentence: `${periodLabel} 동안 큰 변화 없이 비슷한 가격을 유지하고 있어요.`
		};
	}

	if (changePercent > -10) {
		return {
			direction: "down",
			changePercent,
			sentence: `${periodLabel} 동안 ${pct}% 조금씩 내리는 중이에요.`
		};
	}

	return {
		direction: "down",
		changePercent,
		sentence: `${periodLabel} 동안 ${pct}% 크게 내렸어요.`
	};
}
