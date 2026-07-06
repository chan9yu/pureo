"use client";

import { useQuery } from "@tanstack/react-query";
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
			<input
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="티커나 영문 이름으로 검색 (예: AAPL, tesla)"
				aria-label="종목 검색"
				className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
				autoFocus
			/>
			{isError && <p className="mt-3 text-sm text-gray-600">검색하지 못했어요. 잠시 후 다시 시도해주세요.</p>}
			{showEmpty && (
				<p className="mt-3 text-sm text-gray-600">결과가 없어요. 미국 상장 종목의 티커나 영문 이름으로 검색해보세요.</p>
			)}
			{results && results.length > 0 && (
				<ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200">
					{results.map((r) => (
						<li key={r.symbol}>
							<Link
								href={`/stocks/${r.symbol}`}
								className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
							>
								<span className="font-medium">{r.name}</span>
								<span className="text-sm text-gray-500">{r.symbol}</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
