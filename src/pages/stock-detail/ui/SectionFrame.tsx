"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

type SectionFrameProps<T> = {
	title: string;
	query: UseQueryResult<T>;
	children: (data: T) => ReactNode;
};

export function SectionFrame<T>({ title, query, children }: SectionFrameProps<T>) {
	return (
		<section className="h-full rounded-3xl bg-grey-50 p-6">
			<h2 className="text-t6 mb-3 font-semibold text-grey-600">{title}</h2>
			{query.isPending && (
				<div className="flex flex-col gap-2">
					<div className="h-5 w-3/5 animate-pulse rounded-lg bg-grey-200" />
					<div className="h-5 w-4/5 animate-pulse rounded-lg bg-grey-200" />
					<div className="h-5 w-2/5 animate-pulse rounded-lg bg-grey-200" />
				</div>
			)}
			{query.isError && (
				<div>
					<p className="text-t6 text-grey-600">이 부분을 불러오지 못했어요.</p>
					<button
						type="button"
						onClick={() => query.refetch()}
						className="text-t6 mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary-weak px-4 py-2.5 font-semibold text-primary transition hover:bg-primary-soft active:scale-95"
					>
						<RotateCcw className="size-4" aria-hidden />
						다시 시도
					</button>
				</div>
			)}
			{query.isSuccess && children(query.data)}
		</section>
	);
}
