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
	const points = closes.map((c, i) => `${(i / (closes.length - 1)) * 100},${34 - ((c - min) / range) * 30}`).join(" ");
	const rising = last >= first;

	return (
		<svg viewBox="0 0 100 36" preserveAspectRatio="none" role="img" aria-label="가격 흐름 차트" className="h-20 w-full">
			<polyline
				points={points}
				fill="none"
				strokeWidth="1.5"
				vectorEffect="non-scaling-stroke"
				className={rising ? "stroke-red-500" : "stroke-blue-500"}
			/>
		</svg>
	);
}
