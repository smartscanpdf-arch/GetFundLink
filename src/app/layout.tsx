import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title:       { default: "FundLink", template: "%s | FundLink" },
  description: "India's most curated startup–investor network. Verified founders, serious investors, warm introductions.",
  keywords:    ["startup", "investor", "funding", "India", "angel", "seed", "VC"],
  openGraph: {
    type:      "website",
    locale:    "en_IN",
    url:       "https://fundlink.in",
    siteName:  "FundLink",
    title:     "FundLink — India's Startup Funding Network",
    description: "Connect verified founders with serious investors through warm introductions.",
  },
  robots: { index: true, follow: true },
  icons:  { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={`${dmSans.className} antialiased bg-slate-50`}>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background:   "#0F172A",
              color:        "#fff",
              borderRadius: "12px",
              padding:      "12px 16px",
              fontSize:     "13px",
              fontWeight:   "500",
              boxShadow:    "0 8px 24px rgba(0,0,0,0.35)",
            },
            success: { iconTheme: { primary: "#1FA3A3", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
