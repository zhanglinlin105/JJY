import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "鞠婧祎｜个人主页";
const description =
  "鞠婧祎人物资料页：以当代人物志的方式呈现高清影像、代表作品、生平经历与演员、歌手双线职业轨迹。";

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
  const socialImage = `${origin}/og.png`;

  return {
    metadataBase: new URL(origin),
    title,
    description,
    applicationName: "JU JINGYI — Portrait Archive",
    alternates: {
      canonical: `${origin}/`,
    },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: `${origin}/`,
      siteName: "JU JINGYI — Portrait Archive",
      title,
      description,
      images: [
        {
          url: socialImage,
          width: 1792,
          height: 928,
          alt: "鞠婧祎个人主页分享封面",
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
