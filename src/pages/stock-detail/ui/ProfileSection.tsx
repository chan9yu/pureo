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
					<div className="flex items-center gap-3">
						{profile.logoUrl && (
							<img
								src={profile.logoUrl}
								alt=""
								width={40}
								height={40}
								className="size-10 shrink-0 rounded-2xl bg-white object-contain p-1"
								aria-hidden
							/>
						)}
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
							<span className="text-t4 font-bold">{profile.name}</span>
							{profile.industry && (
								<span className="text-t7 rounded-lg bg-primary-weak px-2 py-0.5 font-semibold text-primary">
									{profile.industry}
								</span>
							)}
						</div>
					</div>
					<p className="text-t6 mt-3 text-grey-700">{describeCompany(profile)}</p>
				</div>
			)}
		</SectionFrame>
	);
}
