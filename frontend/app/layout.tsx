import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Embedded Camps — Master AOSP & Android Platform Engineering",
  description:
    "The most intensive hands-on training program for Android Platform Engineers. 8 courses, 50+ hours of deep-dive content covering AOSP Internals, HAL Development, Security, Boot, OTA, System Design, and Interview Preparation. Led by industry engineers.",
  keywords: [
    "AOSP",
    "Android Platform Engineer",
    "Embedded Android",
    "HAL Development",
    "Android Internals",
    "Binder IPC",
    "SELinux",
    "Android Boot",
    "OTA Updates",
    "Android Automotive",
  ],
  openGraph: {
    title: "Embedded Camps — Master AOSP & Android Platform Engineering",
    description:
      "The most intensive hands-on training for Android Platform Engineers. 8 courses. 50+ hours. Hardware labs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
