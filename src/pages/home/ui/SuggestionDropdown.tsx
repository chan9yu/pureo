import type { PointerEvent } from "react";

import type { StockSearchResult } from "@/shared/market";

import { SuggestionItem } from "./SuggestionItem";

type SuggestionDropdownProps = {
	listboxId: string;
	results: StockSearchResult[] | undefined;
	isStale: boolean;
	showLoading: boolean;
	showError: boolean;
	showEmpty: boolean;
	showResults: boolean;
	highlightedIndex: number;
	optionId: (index: number) => string;
	onOptionPointerDown: (e: PointerEvent<HTMLAnchorElement>) => void;
};

export function SuggestionDropdown({
	listboxId,
	results,
	isStale,
	showLoading,
	showError,
	showEmpty,
	showResults,
	highlightedIndex,
	optionId,
	onOptionPointerDown
}: SuggestionDropdownProps) {
	return (
		<div className="absolute inset-x-0 top-full z-30 mt-2">
			{showError && (
				<p className="text-t6 rounded-2xl border border-grey-100 bg-white px-4 py-3.5 text-grey-600 shadow-lg">
					검색하지 못했어요. 잠시 후 다시 시도해주세요.
				</p>
			)}
			{showEmpty && (
				<p className="text-t6 rounded-2xl border border-grey-100 bg-white px-4 py-3.5 text-grey-600 shadow-lg">
					결과가 없어요. 미국 상장 종목의 티커나 영문 이름으로 검색해보세요.
				</p>
			)}
			{showLoading && (
				<p className="text-t6 rounded-2xl border border-grey-100 bg-white px-4 py-3.5 text-grey-600 shadow-lg">
					검색 중이에요…
				</p>
			)}
			{showResults && results && (
				<ul
					id={listboxId}
					role="listbox"
					aria-label="종목 검색 결과"
					aria-busy={isStale}
					className={`max-h-80 overflow-y-auto rounded-2xl border border-grey-100 bg-white p-2 shadow-lg transition-opacity ${isStale ? "pointer-events-none opacity-60" : ""}`}
				>
					{results.map((r, index) => (
						<SuggestionItem
							key={r.symbol}
							id={optionId(index)}
							result={r}
							isHighlighted={index === highlightedIndex}
							onPointerDown={onOptionPointerDown}
						/>
					))}
				</ul>
			)}
		</div>
	);
}
