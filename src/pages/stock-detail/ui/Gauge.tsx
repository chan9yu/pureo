import type { ValuationLevel } from "../lib/valuation";

const POSITION: Record<ValuationLevel, string> = { low: "16.6%", mid: "50%", high: "83.3%" };

type GaugeProps = {
	level: ValuationLevel;
};

export function Gauge({ level }: GaugeProps) {
	return (
		<div className="mt-3 mb-1">
			<div className="relative h-2 rounded-full bg-grey-200">
				<div
					className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-primary bg-white shadow-sm"
					style={{ left: POSITION[level] }}
				/>
			</div>
			<div className="text-t7 mt-1.5 flex justify-between text-grey-500">
				<span>저렴한 편</span>
				<span>비싼 편</span>
			</div>
		</div>
	);
}
