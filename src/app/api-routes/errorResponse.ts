import { UnsupportedSymbolError } from "@/shared/market";

export function errorResponse(error: unknown, unavailableMessage: string) {
	if (error instanceof UnsupportedSymbolError) {
		return Response.json({ error: { message: "찾을 수 없는 종목이에요. 티커를 다시 확인해주세요." } }, { status: 404 });
	}

	return Response.json({ error: { message: unavailableMessage } }, { status: 502 });
}
