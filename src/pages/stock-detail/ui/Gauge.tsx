import type { ValuationLevel } from "../lib/valuation";

const POSITION: Record<ValuationLevel, string> = { low: "16.6%", mid: "50%", high: "83.3%" };

type GaugeProps = {
	level: ValuationLevel;
};

export function Gauge({ level }: GaugeProps) {
	return (
		<div className="mt-3 mb-1">
			<div className="relative h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-400">
				<div
					className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-gray-800 bg-white"
					style={{ left: POSITION[level] }}
				/>
			</div>
			<div className="mt-1 flex justify-between text-xs text-gray-400">
				<span>저렴한 편</span>
				<span>비싼 편</span>
			</div>
		</div>
	);
}
