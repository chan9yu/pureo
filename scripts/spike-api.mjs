// 실행: node --env-file=.env.local scripts/spike-api.mjs
const FINNHUB = process.env.FINNHUB_API_KEY;
const TWELVE = process.env.TWELVEDATA_API_KEY;

async function show(label, url) {
	const res = await fetch(url);
	const body = await res.json().catch(() => null);
	console.log(`\n=== ${label} (HTTP ${res.status}) ===`);
	console.log(JSON.stringify(body, null, 2).slice(0, 1500));
}

await show("Finnhub search", `https://finnhub.io/api/v1/search?q=apple&exchange=US&token=${FINNHUB}`);
await show("Finnhub quote", `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${FINNHUB}`);
await show("Finnhub profile2", `https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=${FINNHUB}`);
await show("Finnhub metric", `https://finnhub.io/api/v1/stock/metric?symbol=AAPL&metric=all&token=${FINNHUB}`);
await show(
	"TwelveData time_series",
	`https://api.twelvedata.com/time_series?symbol=AAPL&interval=1day&outputsize=30&apikey=${TWELVE}`
);
