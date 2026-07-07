import { usProvider } from "@/shared/market";

import { errorResponse } from "./errorResponse";

type Ctx = { params: Promise<{ symbol: string }> };

export async function getStockProfile(_request: Request, { params }: Ctx) {
	const { symbol } = await params;

	try {
		return Response.json(await usProvider.getProfile(symbol.toUpperCase()));
	} catch (error) {
		return errorResponse(error, "회사 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
	}
}
