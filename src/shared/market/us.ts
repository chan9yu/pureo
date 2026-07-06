import { getMetricsUs, getProfileUs, getQuoteUs, searchUs } from "./finnhub";
import { getDailySeriesUs } from "./twelvedata";
import type { MarketDataProvider } from "./types";

export const usProvider: MarketDataProvider = {
	search: searchUs,
	getQuote: getQuoteUs,
	getProfile: getProfileUs,
	getMetrics: getMetricsUs,
	getDailySeries: getDailySeriesUs
};
