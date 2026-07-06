"use client";

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
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">{symbol}</h1>
				<Link href="/" className="text-sm text-gray-500 hover:underline">
					← 다시 검색
				</Link>
			</div>
			<ProfileSection symbol={symbol} />
			<PriceSection symbol={symbol} />
			<TrendSection symbol={symbol} />
			<ValuationSection symbol={symbol} />
			<Disclaimer />
		</div>
	);
}
