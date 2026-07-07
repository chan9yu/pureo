import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { SearchBar } from "./SearchBar";

const STARTER_STOCKS = [
	{ symbol: "AAPL", name: "애플" },
	{ symbol: "NVDA", name: "엔비디아" },
	{ symbol: "TSLA", name: "테슬라" },
	{ symbol: "MSFT", name: "마이크로소프트" },
	{ symbol: "KO", name: "코카콜라" },
	{ symbol: "SBUX", name: "스타벅스" }
];

export function HomePage() {
	return (
		<main className="animate-fade-up mx-auto w-full max-w-6xl flex-1 px-5 pt-8 pb-16 lg:px-8 lg:pt-16">
			<div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-16">
				<div className="lg:col-span-3">
					<h1 className="text-t1 font-bold tracking-tight lg:text-5xl lg:leading-tight">
						어려운 주식,
						<br />
						쉬운 말로 읽어드려요
					</h1>
					<p className="text-t5 mt-3 text-grey-600 lg:mt-5">
						PER, 시가총액… 몰라도 괜찮아요. 검색하면 사람 말로 풀어드릴게요.
					</p>
					<div className="mt-7">
						<SearchBar />
					</div>
				</div>

				<section className="rounded-3xl bg-grey-50 p-6 lg:col-span-2 h-full">
					<h2 className="text-t6 font-semibold text-grey-600">이렇게 읽어드려요</h2>
					<p className="text-t7 mt-4 text-grey-600">증권 앱의 말</p>
					<p className="text-t6 mt-1 text-grey-600 tabular-nums">PER 36.9x · PBR 34.0x · Mkt Cap $4.53T</p>
					<p className="text-t7 mt-4 font-semibold text-primary">pureo의 말</p>
					<p className="text-t5 mt-1 font-medium text-grey-800">
						“지금 주가는 <span className="text-primary">1년 이익의 36.9배</span>예요. 미래 성장 기대가 많이 반영된, 비싼
						편이에요.”
					</p>
				</section>
			</div>

			<section className="mt-12 lg:mt-16">
				<h2 className="text-t6 font-semibold text-grey-600">이런 종목부터 볼까요?</h2>
				<ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{STARTER_STOCKS.map((stock) => (
						<li key={stock.symbol}>
							<Link
								href={`/stocks/${stock.symbol}`}
								className="flex items-center justify-between rounded-2xl bg-grey-50 px-5 py-4 transition hover:bg-grey-100 active:bg-grey-200"
							>
								<span className="flex items-baseline gap-2">
									<span className="text-t5 font-semibold">{stock.name}</span>
									<span className="text-t7 text-grey-600 tabular-nums">{stock.symbol}</span>
								</span>
								<ChevronRight className="size-5 text-grey-400" aria-hidden />
							</Link>
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
