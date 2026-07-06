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
					<div className="mb-4 inline-flex rounded-xl bg-grey-200/70 p-1" role="group" aria-label="기간 선택">
						{([30, 365] as const).map((d) => (
							<button
								key={d}
								type="button"
								onClick={() => setDays(d)}
								aria-pressed={days === d}
								className={`text-t7 rounded-lg px-3.5 py-1.5 font-semibold transition ${
									days === d ? "bg-white text-grey-900 shadow-sm" : "text-grey-600"
								}`}
							>
								{d === 30 ? "1개월" : "1년"}
							</button>
						))}
					</div>
					<div className="h-24 lg:h-44">
						<Sparkline series={series} />
					</div>
					<p className="text-t6 mt-3 text-grey-700">{interpretTrend(series, label).sentence}</p>
				</div>
			)}
		</SectionFrame>
	);
}
