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
						<p className="text-t1 font-bold tracking-tight tabular-nums">${quote.price.toLocaleString()}</p>
						<p className={`text-t5 mt-1 font-semibold tabular-nums ${rising ? "text-rise" : "text-fall"}`}>
							{rising ? "+" : "-"}
							{Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.changePercent).toFixed(2)}%)
						</p>
						<p className="text-t6 mt-2 text-grey-600">
							어제보다 {Math.abs(quote.changePercent).toFixed(1)}% {rising ? "올랐어요" : "내렸어요"}.
						</p>
					</div>
				);
			}}
		</SectionFrame>
	);
}
