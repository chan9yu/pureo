"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

type SectionFrameProps<T> = {
	title: string;
	query: UseQueryResult<T>;
	children: (data: T) => ReactNode;
};

export function SectionFrame<T>({ title, query, children }: SectionFrameProps<T>) {
	return (
		<section className="rounded-xl border border-gray-200 p-4">
			<h2 className="mb-3 text-sm font-semibold text-gray-500">{title}</h2>
			{query.isPending && <div className="h-16 animate-pulse rounded-lg bg-gray-100" />}
			{query.isError && (
				<div className="text-sm text-gray-600">
					<p>이 부분을 불러오지 못했어요.</p>
					<button
						type="button"
						onClick={() => query.refetch()}
						className="mt-2 rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
					>
						다시 시도
					</button>
				</div>
			)}
			{query.isSuccess && children(query.data)}
		</section>
	);
}
