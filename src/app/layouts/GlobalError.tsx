"use client";

import { RotateCcw } from "lucide-react";

type GlobalErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export function GlobalError({ reset }: GlobalErrorProps) {
	return (
		<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 py-24 text-center">
			<h1 className="text-t3 font-bold">문제가 생겼어요</h1>
			<p className="text-t6 mt-2 text-grey-600">잠시 후 다시 시도해주세요. 반복되면 새로고침이 도움이 돼요.</p>
			<button
				type="button"
				onClick={reset}
				className="text-t6 mt-6 inline-flex items-center gap-1.5 rounded-xl bg-primary-weak px-4 py-2.5 font-semibold text-primary transition hover:bg-primary-soft active:scale-95"
			>
				<RotateCcw className="size-4" aria-hidden />
				다시 시도
			</button>
		</main>
	);
}
