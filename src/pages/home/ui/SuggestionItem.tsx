import Link from "next/link";
import type { PointerEvent } from "react";

import type { StockSearchResult } from "@/shared/market";

type SuggestionItemProps = {
	id: string;
	result: StockSearchResult;
	isHighlighted: boolean;
	onPointerDown: (e: PointerEvent<HTMLAnchorElement>) => void;
};

export function SuggestionItem({ id, result, isHighlighted, onPointerDown }: SuggestionItemProps) {
	return (
		<li role="presentation">
			<Link
				id={id}
				role="option"
				aria-selected={isHighlighted}
				tabIndex={-1}
				href={`/stocks/${result.symbol}`}
				onPointerDown={onPointerDown}
				className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition hover:bg-grey-50 active:bg-grey-100 ${isHighlighted ? "bg-grey-100" : ""}`}
			>
				<span className="text-t5 truncate font-semibold">{result.name}</span>
				<span className="text-t7 shrink-0 font-medium text-grey-600 tabular-nums">{result.symbol}</span>
			</Link>
		</li>
	);
}
