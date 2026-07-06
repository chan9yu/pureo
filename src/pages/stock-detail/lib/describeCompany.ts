import type { CompanyProfile } from "@/shared/market";

export function formatMarketCapUsd(usd: number) {
	if (usd >= 1e12) return `약 ${(usd / 1e12).toFixed(1)}조 달러`;
	if (usd >= 1e8) return `약 ${Math.round(usd / 1e8).toLocaleString()}억 달러`;
	return `약 ${Math.round(usd / 1e4).toLocaleString()}만 달러`;
}

function sizeWord(usd: number) {
	if (usd >= 200e9) return "아주 큰";
	if (usd >= 10e9) return "큰";
	if (usd >= 2e9) return "중간 크기의";
	return "작은";
}

export function describeCompany(profile: CompanyProfile) {
	const industry = profile.industry ? `${profile.industry} 업종의 ` : "";
	const base = `${industry}미국 증시에 상장된 회사예요.`;

	if (profile.marketCapUsd === null) {
		return base;
	}

	return `${base} 시가총액은 ${formatMarketCapUsd(profile.marketCapUsd)}로, 시장에서 ${sizeWord(profile.marketCapUsd)} 회사로 평가받고 있어요.`;
}
