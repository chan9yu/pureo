import "../styles/globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { PropsWithChildren } from "react";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"]
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"]
});

export const metadata: Metadata = {
	title: "pureo — 쉬운 종목 카드",
	description: "어려운 주식 숫자를 쉬운 말로 풀어 읽어주는 종목 카드 앱"
};

export function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
