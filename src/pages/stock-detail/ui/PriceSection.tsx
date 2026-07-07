"use client";

import { useQuery } from "@tanstack/react-query";

import { STOCK_QUERIES } from "../api/stockQueries";
import { interpretQuote } from "../lib/interpretQuote";
import { SectionFrame } from "./SectionFrame";

const CHANGE_TEXT_COLOR = {
	up: "text-rise",
	down: "text-fall",
	flat: "text-grey-600",
	unknown: "text-grey-600"
} as const;

const CHANGE_SIGN = {
	up: "+",
	down: "-",
	flat: "",
	unknown: ""
} as const;

type PriceSectionProps = {
	symbol: string;
};

export function PriceSection({ symbol }: PriceSectionProps) {
	const query = useQuery(STOCK_QUERIES.quote(symbol));

	return (
		<SectionFrame title="현재 가격" query={query}>
			{(quote) => {
				const { direction, sentence } = interpretQuote(quote.change, quote.changePercent);
				return (
					<div>
						<p className="text-t1 font-bold tracking-tight tabular-nums">${quote.price.toLocaleString()}</p>
						{quote.change !== null && quote.changePercent !== null && (
							<p className={`text-t5 mt-1 font-semibold tabular-nums ${CHANGE_TEXT_COLOR[direction]}`}>
								{CHANGE_SIGN[direction]}
								{Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.changePercent).toFixed(2)}%)
							</p>
						)}
						<p className="text-t6 mt-2 text-grey-600">{sentence}</p>
					</div>
				);
			}}
		</SectionFrame>
	);
}
