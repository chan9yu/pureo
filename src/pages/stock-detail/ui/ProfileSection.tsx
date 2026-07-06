"use client";

import { useQuery } from "@tanstack/react-query";

import { STOCK_QUERIES } from "../api/stockQueries";
import { describeCompany } from "../lib/describeCompany";
import { SectionFrame } from "./SectionFrame";

type ProfileSectionProps = {
	symbol: string;
};

export function ProfileSection({ symbol }: ProfileSectionProps) {
	const query = useQuery(STOCK_QUERIES.profile(symbol));

	return (
		<SectionFrame title="어떤 회사예요?" query={query}>
			{(profile) => (
				<div>
					<div className="flex items-center gap-2">
						<span className="text-lg font-bold">{profile.name}</span>
						{profile.industry && (
							<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{profile.industry}</span>
						)}
					</div>
					<p className="mt-2 text-sm text-gray-700">{describeCompany(profile)}</p>
				</div>
			)}
		</SectionFrame>
	);
}
