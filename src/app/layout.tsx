import type { Metadata } from "next";
import type { ReactNode } from "react";
import Providers from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://ditheringstudio.com"),
  title: "Online Dithering Tool for Images & Videos | Free, No Uploads",
  description:
    "Dither images and videos online with Floyd-Steinberg, Bayer, Atkinson, Sierra and 30 algorithms. Export PNG, JPG, WEBP, SVG, GIF, MP4, WebM. Free and fully client-side.",
  icons: {
    icon: "/ditheringstudio.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
