import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Disclaimer } from "./Disclaimer";
import { PriceSection } from "./PriceSection";
import { ProfileSection } from "./ProfileSection";
import { TrendSection } from "./TrendSection";
import { ValuationSection } from "./ValuationSection";

type StockCardProps = {
	symbol: string;
};

export function StockCard({ symbol }: StockCardProps) {
	return (
		<div className="flex flex-col gap-3">
			<div className="mb-1 flex items-center justify-between">
				<Link
					href="/"
					className="text-t6 -ml-2 inline-flex items-center gap-1 rounded-xl px-2 py-1.5 font-medium text-grey-600 transition hover:bg-grey-50 active:bg-grey-100"
				>
					<ArrowLeft className="size-4" aria-hidden />
					다시 검색
				</Link>
				<h1 className="text-t4 font-bold tracking-tight tabular-nums">{symbol}</h1>
			</div>
			<div className="grid gap-3 lg:grid-cols-3">
				<div className="lg:col-start-3 lg:row-start-1">
					<ProfileSection symbol={symbol} />
				</div>
				<div className="lg:col-span-2 lg:col-start-1 lg:row-start-1">
					<PriceSection symbol={symbol} />
				</div>
				<div className="lg:col-span-2 lg:col-start-1 lg:row-start-2">
					<TrendSection symbol={symbol} />
				</div>
				<div className="lg:col-start-3 lg:row-start-2">
					<ValuationSection symbol={symbol} />
				</div>
			</div>
			<div className="mt-3 px-1">
				<Disclaimer />
			</div>
		</div>
	);
}
