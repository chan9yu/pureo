import { usProvider } from "@/shared/market";

import { errorResponse } from "./errorResponse";

const MAX_RESULTS = 10;

function parseLimit(raw: string | null) {
	const parsed = Number(raw);
	if (!Number.isInteger(parsed) || parsed < 1) {
		return MAX_RESULTS;
	}

	return Math.min(parsed, MAX_RESULTS);
}

export async function searchStocks(request: Request) {
	const url = new URL(request.url);
	const q = url.searchParams.get("q")?.trim() ?? "";
	if (q.length < 2) {
		return Response.json({ results: [] });
	}

	const limit = parseLimit(url.searchParams.get("limit"));
	try {
		const results = await usProvider.search(q);
		return Response.json({ results: results.slice(0, limit) });
	} catch (error) {
		return errorResponse(error, "검색하지 못했어요. 잠시 후 다시 시도해주세요.");
	}
}
