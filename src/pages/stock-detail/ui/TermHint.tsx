"use client";

import type { PropsWithChildren } from "react";
import { useState } from "react";

type TermHintProps = PropsWithChildren<{
	term: string;
}>;

export function TermHint({ term, children }: TermHintProps) {
	const [open, setOpen] = useState(false);

	return (
		<span className="block">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				aria-expanded={open}
				className="inline-flex items-center gap-1 font-semibold"
			>
				{term}
				<span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-600">
					?
				</span>
			</button>
			{open && <span className="mt-1 block rounded-lg bg-gray-50 p-2 text-sm text-gray-600">{children}</span>}
		</span>
	);
}
