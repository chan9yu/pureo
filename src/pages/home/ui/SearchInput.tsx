import { Search } from "lucide-react";
import type { ChangeEvent, KeyboardEvent } from "react";

type SearchInputProps = {
	value: string;
	open: boolean;
	listboxId: string;
	activeOptionId: string | undefined;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
	onFocus: () => void;
};

export function SearchInput({
	value,
	open,
	listboxId,
	activeOptionId,
	onChange,
	onKeyDown,
	onFocus
}: SearchInputProps) {
	return (
		<div className="relative">
			<Search
				className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-grey-500"
				aria-hidden
			/>
			<input
				value={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
				onFocus={onFocus}
				role="combobox"
				aria-expanded={open}
				aria-controls={listboxId}
				aria-autocomplete="list"
				aria-activedescendant={activeOptionId}
				autoComplete="off"
				enterKeyHint="go"
				placeholder="티커나 영문 이름으로 검색"
				aria-label="종목 검색"
				className="text-t5 h-14 w-full rounded-2xl border-2 border-transparent bg-grey-100 pr-4 pl-12 font-medium transition outline-none placeholder:font-normal placeholder:text-grey-600 focus:border-primary focus:bg-white"
				autoFocus
			/>
		</div>
	);
}
