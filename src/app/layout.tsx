import type { Metadata } from "next";
import "@/styles/globals.css";
import DemoWrapper from "@/components/demo/DemoWrapper";

export const metadata: Metadata = {
  title: "A-Share Sentinel X",
  description:
    "AI-native A-share investment assistant MVP",
  openGraph: {
    title: "A-Share Sentinel X",
    description:
      "AI-native A-share investment assistant MVP",
    type: "website",
    siteName: "A-Share Sentinel X",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <DemoWrapper>{children}</DemoWrapper>
      </body>
    </html>
  );
}
