import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { getQueryClient } from "@/shared/api";
import { usProvider } from "@/shared/market";

import { STOCK_QUERIES } from "../api/stockQueries";
import { StockCard } from "./StockCard";

type StockDetailPageProps = {
	params: Promise<{ symbol: string }>;
};

export async function generateMetadata({ params }: StockDetailPageProps): Promise<Metadata> {
	const { symbol } = await params;
	return { title: `${symbol.toUpperCase()} — pureo` };
}

export async function StockDetailPage({ params }: StockDetailPageProps) {
	const { symbol: raw } = await params;
	const symbol = raw.toUpperCase();
	const queryClient = getQueryClient();

	// prefetchQuery는 실패해도 throw하지 않는다 → 실패한 섹션은 클라이언트에서 재시도
	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: STOCK_QUERIES.quote(symbol).queryKey,
			queryFn: () => usProvider.getQuote(symbol)
		}),
		queryClient.prefetchQuery({
			queryKey: STOCK_QUERIES.profile(symbol).queryKey,
			queryFn: () => usProvider.getProfile(symbol)
		}),
		queryClient.prefetchQuery({
			queryKey: STOCK_QUERIES.metrics(symbol).queryKey,
			queryFn: () => usProvider.getMetrics(symbol)
		}),
		queryClient.prefetchQuery({
			queryKey: STOCK_QUERIES.series(symbol, 30).queryKey,
			queryFn: () => usProvider.getDailySeries(symbol, 30)
		})
	]);

	return (
		<main className="animate-fade-up mx-auto w-full max-w-6xl flex-1 px-5 py-6 lg:px-8 lg:py-10">
			<HydrationBoundary state={dehydrate(queryClient)}>
				<StockCard symbol={symbol} />
			</HydrationBoundary>
		</main>
	);
}
