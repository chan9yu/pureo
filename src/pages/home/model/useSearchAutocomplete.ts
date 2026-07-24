"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FocusEvent, KeyboardEvent, PointerEvent } from "react";
import { useId, useState } from "react";

import { useDebouncedValue } from "@/shared/lib";

import { SEARCH_QUERIES } from "../api/searchQueries";

export function useSearchAutocomplete() {
	const router = useRouter();
	const listboxId = useId();
	const [input, setInput] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const debounced = useDebouncedValue(input, 300);
	const settledQuery = debounced.trim();
	const { data: results, isFetching, isError, isPlaceholderData } = useQuery(SEARCH_QUERIES.search(settledQuery));

	const trimmedInput = input.trim();
	const isSearchable = trimmedInput.length >= 2;
	// stale 창은 두 겹: 디바운스 지연(키가 아직 이전 입력) + keepPreviousData placeholder(fetch 중 이전 키 데이터)
	const isStale = settledQuery !== trimmedInput || isPlaceholderData;

	const showResults = isSearchable && results !== undefined && results.length > 0;
	const showEmpty = isSearchable && !isStale && !isFetching && results !== undefined && results.length === 0;
	const showError = isSearchable && !isStale && isError && !showResults;
	const showLoading = isSearchable && isFetching && !showResults;
	const open = isOpen && (showResults || showEmpty || showError || showLoading);

	const optionId = (index: number) => `${listboxId}-option-${index}`;

	const moveHighlight = (delta: number) => {
		if (!results || results.length === 0) return;
		const count = results.length;
		const next = highlightedIndex < 0 ? (delta > 0 ? 0 : count - 1) : (highlightedIndex + delta + count) % count;
		setHighlightedIndex(next);
		document.getElementById(optionId(next))?.scrollIntoView({ block: "nearest" });
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
		setHighlightedIndex(-1);
		setIsOpen(true);
	};

	const handleFocus = () => {
		setIsOpen(true);
	};

	const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
		if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
		setIsOpen(false);
		setHighlightedIndex(-1);
	};

	// Safari는 링크 클릭 시 relatedTarget이 null이라 blur-close가 클릭을 삼킨다 — 포커스 이동 자체를 막는다
	const handleOptionPointerDown = (e: PointerEvent<HTMLAnchorElement>) => {
		e.preventDefault();
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setIsOpen(true);
			moveHighlight(1);
			return;
		}
		if (e.key === "ArrowUp") {
			e.preventDefault();
			setIsOpen(true);
			moveHighlight(-1);
			return;
		}
		if (e.key === "Enter") {
			if (!open || !showResults || isStale || !results) return;
			const target = results[highlightedIndex] ?? results[0];
			if (!target) return;
			e.preventDefault();
			setIsOpen(false);
			router.push(`/stocks/${target.symbol}`);
			return;
		}
		if (e.key === "Escape") {
			e.preventDefault();
			setIsOpen(false);
			setHighlightedIndex(-1);
		}
	};

	return {
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
	};
}
