"use client";

import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useDebouncedValue } from "@/shared/lib";

import { SEARCH_QUERIES } from "../api/searchQueries";

export function SearchBar() {
	const [input, setInput] = useState("");
	const debounced = useDebouncedValue(input, 300);
	const { data: results, isFetching, isError } = useQuery(SEARCH_QUERIES.search(debounced));
	const showEmpty = results !== undefined && results.length === 0 && debounced.trim().length >= 2 && !isFetching;

	return (
		<div>
			<div className="relative">
				<Search
					className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-grey-500"
					aria-hidden
				/>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="티커나 영문 이름으로 검색"
					aria-label="종목 검색"
					className="text-t5 h-14 w-full rounded-2xl border-2 border-transparent bg-grey-100 pr-4 pl-12 font-medium transition outline-none placeholder:font-normal placeholder:text-grey-500 focus:border-primary focus:bg-white"
					autoFocus
				/>
			</div>
			{isError && (
				<p className="text-t6 mt-3 rounded-2xl bg-grey-50 px-4 py-3.5 text-grey-600">
					검색하지 못했어요. 잠시 후 다시 시도해주세요.
				</p>
			)}
			{showEmpty && (
				<p className="text-t6 mt-3 rounded-2xl bg-grey-50 px-4 py-3.5 text-grey-600">
					결과가 없어요. 미국 상장 종목의 티커나 영문 이름으로 검색해보세요.
				</p>
			)}
			{results && results.length > 0 && (
				<ul className="mt-2 -mx-3">
					{results.map((r) => (
						<li key={r.symbol}>
							<Link
								href={`/stocks/${r.symbol}`}
								className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3.5 transition hover:bg-grey-50 active:bg-grey-100"
							>
								<span className="text-t5 truncate font-semibold">{r.name}</span>
								<span className="text-t7 shrink-0 font-medium text-grey-500 tabular-nums">{r.symbol}</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
