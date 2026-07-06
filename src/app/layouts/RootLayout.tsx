import "../styles/globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";
import type { PropsWithChildren } from "react";

import { QueryProvider } from "../providers/QueryProvider";

const pretendard = localFont({
	src: "../fonts/PretendardVariable.woff2",
	display: "swap",
	weight: "45 920",
	variable: "--font-pretendard",
	preload: false
});

export const metadata: Metadata = {
	title: "pureo — 쉬운 종목 카드",
	description: "어려운 주식 숫자를 쉬운 말로 풀어 읽어주는 종목 카드 앱",
	icons: {
		icon: [
			{ url: "/favicons/favicon.ico", type: "image/x-icon" },
			{ url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" }
		],
		apple: [{ url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
	}
};

export function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
			<body className="min-h-full flex flex-col">
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}
