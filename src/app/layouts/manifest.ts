import type { MetadataRoute } from "next";

export function manifest(): MetadataRoute.Manifest {
	return {
		name: "pureo — 쉬운 종목 카드",
		short_name: "pureo",
		description: "어려운 주식 숫자를 쉬운 말로 풀어 읽어주는 종목 카드 앱",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#ffffff",
		icons: [{ src: "/favicons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }]
	};
}
