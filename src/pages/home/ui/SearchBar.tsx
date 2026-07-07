"use client";

import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useState } from "react";

import { useDebouncedValue } from "@/shared/lib";

import { SEARCH_QUERIES } from "../api/searchQueries";

export function SearchBar() {
	const [input, setInput] = useState("");
	const debounced = useDebouncedValue(input, 300);
	const { data: results, isFetching, isError } = useQuery(SEARCH_QUERIES.search(debounced));
	const isSearchable = input.trim().length >= 2;
	const showError = isSearchable && isError;
	const showEmpty =
		isSearchable && results !== undefined && results.length === 0 && debounced.trim().length >= 2 && !isFetching;
	const showResults = isSearchable && results !== undefined && results.length > 0;
	const isDropdownOpen = showError || showEmpty || showResults;

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") {
			setInput("");
		}
	};

	let statusMessage = "";
	if (showError) {
		statusMessage = "검색에 실패했어요";
	} else if (showEmpty) {
		statusMessage = "검색 결과가 없어요";
	} else if (showResults) {
		statusMessage = `${results.length}개 종목이 검색됐어요`;
	}

	return (
		<div className="relative">
			<p role="status" className="sr-only">
				{statusMessage}
			</p>
			<div className="relative">
				<Search
					className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-grey-500"
					aria-hidden
				/>
				<input
					value={input}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					placeholder="티커나 영문 이름으로 검색"
					aria-label="종목 검색"
					className="text-t5 h-14 w-full rounded-2xl border-2 border-transparent bg-grey-100 pr-4 pl-12 font-medium transition outline-none placeholder:font-normal placeholder:text-grey-600 focus:border-primary focus:bg-white"
					autoFocus
				/>
			</div>
			{isDropdownOpen && (
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
					{showResults && (
						<ul className="max-h-80 overflow-y-auto rounded-2xl border border-grey-100 bg-white p-2 shadow-lg">
							{results.map((r) => (
								<li key={r.symbol}>
									<Link
										href={`/stocks/${r.symbol}`}
										className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition hover:bg-grey-50 active:bg-grey-100"
									>
										<span className="text-t5 truncate font-semibold">{r.name}</span>
										<span className="text-t7 shrink-0 font-medium text-grey-600 tabular-nums">{r.symbol}</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
