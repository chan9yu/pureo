"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { STOCK_QUERIES } from "../api/stockQueries";
import { interpretTrend } from "../lib/trend";
import { SectionFrame } from "./SectionFrame";
import { Sparkline } from "./Sparkline";

type TrendSectionProps = {
	symbol: string;
};

export function TrendSection({ symbol }: TrendSectionProps) {
	const [days, setDays] = useState<30 | 365>(30);
	const query = useQuery(STOCK_QUERIES.series(symbol, days));
	const label = days === 30 ? "최근 1개월" : "최근 1년";

	return (
		<SectionFrame title="가격 흐름" query={query}>
			{(series) => (
				<div>
					<div className="mb-2 flex gap-2">
						{([30, 365] as const).map((d) => (
							<button
								key={d}
								type="button"
								onClick={() => setDays(d)}
								className={`rounded-full border px-3 py-1 text-sm ${
									days === d ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"
								}`}
							>
								{d === 30 ? "1개월" : "1년"}
							</button>
						))}
					</div>
					<Sparkline series={series} />
					<p className="mt-2 text-sm text-gray-700">{interpretTrend(series, label).sentence}</p>
				</div>
			)}
		</SectionFrame>
	);
}
