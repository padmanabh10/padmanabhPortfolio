import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { themes, DEFAULT_THEME_ID } from "@/lib/themes";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Padmanabh Kulkarni",
    template: "%s - Padmanabh Kulkarni",
  },
  description: "Portfolio of Padmanabh Kulkarni.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Padmanabh",
  },
};

const themeMap = Object.fromEntries(themes.map((t) => [t.id, t.vars]));
const antiFlashScript = `(function(){try{var m=${JSON.stringify(themeMap)};var s=localStorage.getItem('portfolio-theme')||'${DEFAULT_THEME_ID}';var v=m[s]||m['${DEFAULT_THEME_ID}'];var r=document.documentElement;for(var k in v)r.style.setProperty(k,v[k]);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');` }} />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
