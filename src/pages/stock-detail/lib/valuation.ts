export type ValuationLevel = "low" | "mid" | "high";

export interface ValuationInterpretation {
	level: ValuationLevel | "unknown";
	sentence: string;
}

export function interpretPer(per: number | null) {
	if (per === null || !Number.isFinite(per) || per <= 0) {
		return {
			level: "unknown",
			sentence: "아직 이익이 나지 않거나 데이터가 없어서, PER로는 판단하기 어려워요."
		};
	}

	const x = per.toFixed(1);

	if (per < 10) {
		return {
			level: "low",
			sentence: `지금 주가는 1년 이익의 ${x}배예요. 이익에 비해 저렴한 편이에요.`
		};
	}

	if (per <= 25) {
		return {
			level: "mid",
			sentence: `지금 주가는 1년 이익의 ${x}배예요. 미국 시장에서 보통 수준이에요.`
		};
	}

	return {
		level: "high",
		sentence: `지금 주가는 1년 이익의 ${x}배예요. 미래 성장 기대가 많이 반영된, 비싼 편이에요.`
	};
}

export function interpretPbr(pbr: number | null) {
	if (pbr === null || !Number.isFinite(pbr) || pbr <= 0) {
		return {
			level: "unknown",
			sentence: "데이터가 없어서 PBR로는 판단하기 어려워요."
		};
	}

	const x = pbr.toFixed(1);

	if (pbr < 1) {
		return {
			level: "low",
			sentence: `주가가 회사 순자산의 ${x}배예요. 장부상 재산보다도 싸게 거래되고 있어요.`
		};
	}

	if (pbr <= 3) {
		return {
			level: "mid",
			sentence: `주가가 회사 순자산의 ${x}배예요. 흔히 볼 수 있는 수준이에요.`
		};
	}

	return {
		level: "high",
		sentence: `주가가 회사 순자산의 ${x}배예요. 자산보다 성장성에 값을 쳐주고 있다는 뜻이에요.`
	};
}
