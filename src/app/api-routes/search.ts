import { usProvider } from "@/shared/market";

export async function searchStocks(request: Request) {
	const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
	if (q.length < 2) {
		return Response.json({ results: [] });
	}

	try {
		return Response.json({ results: await usProvider.search(q) });
	} catch {
		return Response.json({ error: { message: "검색하지 못했어요. 잠시 후 다시 시도해주세요." } }, { status: 502 });
	}
}
