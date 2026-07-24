"use client";

import { useSearchAutocomplete } from "../model/useSearchAutocomplete";
import { SearchInput } from "./SearchInput";
import { SuggestionDropdown } from "./SuggestionDropdown";

export function SearchBar() {
	const {
		input,
		results,
		settledQuery,
		open,
		isStale,
		showLoading,
		showError,
		showEmpty,
		showResults,
		highlightedIndex,
		listboxId,
		optionId,
		handleChange,
		handleFocus,
		handleBlur,
		handleKeyDown,
		handleOptionPointerDown
	} = useSearchAutocomplete();

	let statusMessage = "";
	if (showError) {
		statusMessage = "검색에 실패했어요";
	} else if (showEmpty) {
		statusMessage = "검색 결과가 없어요";
	} else if (showResults && !isStale && results) {
		statusMessage = `'${settledQuery}' ${results.length}개 종목이 검색됐어요`;
	}

	const activeOptionId = open && highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined;

	return (
		<div className="relative" onBlur={handleBlur}>
			<p role="status" className="sr-only">
				{statusMessage}
			</p>
			<SearchInput
				value={input}
				open={open}
				listboxId={listboxId}
				activeOptionId={activeOptionId}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
			/>
			{open && (
				<SuggestionDropdown
					listboxId={listboxId}
					results={results}
					isStale={isStale}
					showLoading={showLoading}
					showError={showError}
					showEmpty={showEmpty}
					showResults={showResults}
					highlightedIndex={highlightedIndex}
					optionId={optionId}
					onOptionPointerDown={handleOptionPointerDown}
				/>
			)}
		</div>
	);
}
