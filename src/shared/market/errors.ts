export class UnsupportedSymbolError extends Error {
	constructor(symbol: string) {
		super(`지원하지 않는 종목: ${symbol}`);
		this.name = "UnsupportedSymbolError";
	}
}
