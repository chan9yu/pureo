"use client";

import { CircleHelp } from "lucide-react";
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
				className="text-t5 inline-flex items-center gap-1.5 font-bold transition active:opacity-70"
			>
				{term}
				<CircleHelp className="size-4 text-grey-400" aria-hidden />
			</button>
			{open && <span className="text-t6 mt-2 block rounded-2xl bg-white p-4 text-grey-600">{children}</span>}
		</span>
	);
}
