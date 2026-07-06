import { usProvider } from "@/shared/market";

type Ctx = { params: Promise<{ symbol: string }> };

export async function getStockQuote(_request: Request, { params }: Ctx) {
	const { symbol } = await params;

	try {
		return Response.json(await usProvider.getQuote(symbol.toUpperCase()));
	} catch {
		return Response.json(
			{ error: { message: "시세를 불러오지 못했어요. 잠시 후 다시 시도해주세요." } },
			{ status: 502 }
		);
	}
}
