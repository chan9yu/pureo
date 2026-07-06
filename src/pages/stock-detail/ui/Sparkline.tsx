import type { PricePoint } from "@/shared/market";

type SparklineProps = {
	series: PricePoint[];
};

export function Sparkline({ series }: SparklineProps) {
	const closes = series.map((p) => p.close);
	const first = closes.at(0);
	const last = closes.at(-1);
	if (closes.length < 2 || first === undefined || last === undefined) {
		return null;
	}

	const min = Math.min(...closes);
	const range = Math.max(...closes) - min || 1;
	const coords = closes.map((c, i) => `${(i / (closes.length - 1)) * 100},${36 - ((c - min) / range) * 28}`);
	const points = coords.join(" ");
	const rising = last >= first;

	return (
		<svg
			viewBox="0 0 100 40"
			preserveAspectRatio="none"
			role="img"
			aria-label="가격 흐름 차트"
			className="h-full w-full"
		>
			<polygon points={`0,40 ${points} 100,40`} className={rising ? "fill-rise/10" : "fill-fall/10"} />
			<polyline
				points={points}
				fill="none"
				strokeWidth="2"
				vectorEffect="non-scaling-stroke"
				strokeLinejoin="round"
				strokeLinecap="round"
				className={rising ? "stroke-rise" : "stroke-fall"}
			/>
		</svg>
	);
}
