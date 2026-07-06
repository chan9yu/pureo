"use client";

import { useQuery } from "@tanstack/react-query";

import { STOCK_QUERIES } from "../api/stockQueries";
import { SectionFrame } from "./SectionFrame";

type PriceSectionProps = {
	symbol: string;
};

export function PriceSection({ symbol }: PriceSectionProps) {
	const query = useQuery(STOCK_QUERIES.quote(symbol));

	return (
		<SectionFrame title="현재 가격" query={query}>
			{(quote) => {
				const rising = quote.change >= 0;
				return (
					<div>
						<div className="flex items-baseline gap-3">
							<span className="text-3xl font-bold">${quote.price.toLocaleString()}</span>
							<span className={rising ? "text-red-600" : "text-blue-600"}>
								{rising ? "▲" : "▼"} {Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.changePercent).toFixed(2)}%)
							</span>
						</div>
						<p className="mt-1 text-sm text-gray-600">
							어제보다 {Math.abs(quote.changePercent).toFixed(1)}% {rising ? "올랐어요" : "내렸어요"}.
						</p>
					</div>
				);
			}}
		</SectionFrame>
	);
}
