import localFont from "next/font/local";
import { SITE } from "@/lib/site";
import "./globals.css";

/**
 * Fonts are loaded from files in the repo rather than next/font/google, so the
 * build never depends on reaching Google's CDN. next/font still self-hosts
 * them, emits <link rel="preload"> so they download alongside the HTML instead
 * of waiting on the CSS, and injects size-adjusted fallback metrics that remove
 * the layout shift when the webfont swaps in.
 *
 * Only the latin subsets are shipped — the site has no Cyrillic/Greek content.
 */
const manrope = localFont({
  src: [{ path: "./fonts/manrope-latin-wght-normal.woff2", weight: "200 800", style: "normal" }],
  variable: "--font-manrope",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
  adjustFontFallback: "Arial",
});

const sora = localFont({
  src: [{ path: "./fonts/sora-latin-wght-normal.woff2", weight: "100 800", style: "normal" }],
  variable: "--font-sora",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
  adjustFontFallback: "Arial",
});

const spaceMono = localFont({
  src: [
    { path: "./fonts/space-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/space-mono-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-space",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

const fontVars = `${manrope.variable} ${sora.variable} ${spaceMono.variable}`;

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Mariam Automobile — Japan Recondition & New Cars Sales Center, Rajshahi",
    template: "%s — Mariam Automobile, Rajshahi",
  },
  description:
    "Mariam Automobile — trusted Japanese reconditioned and brand-new car dealer in Rajshahi, Bangladesh. Auction-verified stock, bank loan facility, cash purchase options, warranty and after-sales support.",
  applicationName: "Mariam Automobile",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Mariam Automobile",
    title: "Mariam Automobile — Japan Recondition & New Cars Sales Center",
    description:
      "Auction-verified Japanese cars in Rajshahi. Bank loan facility, cash purchase options, warranty and after-sales support.",
    images: [{ url: "/img/ece91fddb211fccd.jpg", width: 1280, height: 960 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mariam Automobile — Japan Recondition & New Cars",
    description:
      "Auction-verified Japanese cars in Rajshahi, Bangladesh. Warranty and bank loan support on every car.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  category: "automotive",
};

const autoDealerJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: "Mariam Automobile",
  description: metadata.description,
  telephone: "+8801944755111",
  url: SITE.url,
  image: `${SITE.url}/img/ece91fddb211fccd.jpg`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Terokhadia",
    addressLocality: "Rajshahi",
    postalCode: "6000",
    addressCountry: "BD",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "14:00",
      closes: "20:00",
    },
  ],
  sameAs: ["https://www.facebook.com/mariamautomobile/"],
};

export default function RootLayout({ children }) {
  return (
    /**
     * suppressHydrationWarning on <html> and <body> only.
     *
     * Browser extensions inject attributes onto these two elements before React
     * hydrates — ColorZilla adds `cz-shortcut-listen`, Grammarly adds `data-gr-*`,
     * dark-mode extensions add their own — which React reports as a hydration
     * mismatch even though the markup we sent is correct.
     *
     * The flag is deliberately scoped: it only ignores mismatches on the element
     * it is set on, one level deep. Genuine mismatches anywhere inside the app
     * are still reported.
     */
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(autoDealerJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
