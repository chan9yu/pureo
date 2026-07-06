"use client";

import { useQuery } from "@tanstack/react-query";

import { STOCK_QUERIES } from "../api/stockQueries";
import { GLOSSARY } from "../lib/glossary";
import { interpretPbr, interpretPer } from "../lib/valuation";
import { Gauge } from "./Gauge";
import { SectionFrame } from "./SectionFrame";
import { TermHint } from "./TermHint";

type ValuationSectionProps = {
	symbol: string;
};

export function ValuationSection({ symbol }: ValuationSectionProps) {
	const query = useQuery(STOCK_QUERIES.metrics(symbol));

	return (
		<SectionFrame title="지금 비싼 거예요, 싼 거예요?" query={query}>
			{(metrics) => {
				const per = interpretPer(metrics.per);
				const pbr = interpretPbr(metrics.pbr);
				return (
					<div className="flex flex-col gap-6">
						<div>
							<TermHint term="PER로 보면">{GLOSSARY.PER}</TermHint>
							{per.level !== "unknown" && <Gauge level={per.level} />}
							<p className="text-t6 mt-2 text-grey-700">{per.sentence}</p>
						</div>
						<div>
							<TermHint term="PBR로 보면">{GLOSSARY.PBR}</TermHint>
							{pbr.level !== "unknown" && <Gauge level={pbr.level} />}
							<p className="text-t6 mt-2 text-grey-700">{pbr.sentence}</p>
						</div>
					</div>
				);
			}}
		</SectionFrame>
	);
}
