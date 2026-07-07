import { usProvider } from "@/shared/market";

import { errorResponse } from "./errorResponse";

type Ctx = { params: Promise<{ symbol: string }> };

export async function getStockSeries(request: Request, { params }: Ctx) {
	const { symbol } = await params;
	const days = new URL(request.url).searchParams.get("days") === "365" ? 365 : 30;

	try {
		return Response.json(await usProvider.getDailySeries(symbol.toUpperCase(), days));
	} catch (error) {
		return errorResponse(error, "가격 흐름을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
	}
}
