import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "鞠婧祎｜3D 互动人物志";
const description =
  "鞠婧祎 3D 互动人物志：以空间化影像、代表作品与生平时间线，呈现演员、歌手双线职业轨迹。";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || requestHeaders.get("host") || "localhost:3000";
  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol = forwardedProtocol || (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = `${origin}/og-spatial.png`;

  return {
    metadataBase: new URL(origin),
    title,
    description,
    applicationName: "JU JINGYI — Portrait in Motion",
    alternates: {
      canonical: `${origin}/`,
    },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: `${origin}/`,
      siteName: "JU JINGYI — Portrait in Motion",
      title,
      description,
      images: [
        {
          url: socialImage,
          width: 1731,
          height: 909,
          alt: "鞠婧祎五章节 3D 互动人物志：时光影廊分享封面",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f4f0ea",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
