import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3b82f6",
};

export const metadata: Metadata = {
  title: "Borchini Realty | Poinciana, Florida",
  description: "Find your dream home in Westview, Poinciana, Florida. Browse listings, floor plans, and more.",
  keywords: "Borchini Realty, Westview, Poinciana, Florida, homes for sale, real estate, new construction, Kissimmee",
  authors: [{ name: "Borchini Realty" }],
  robots: "index, follow",
  metadataBase: new URL("https://WestviewHomeSales.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Borchini Realty | Homes in Poinciana, Florida",
    description: "Find your dream home in Westview, Poinciana, Florida. Browse listings, floor plans, and more.",
    url: "https://WestviewHomeSales.com",
    siteName: "Borchini Realty",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/icon-192.png",
        width: 192,
        height: 192,
        alt: "Borchini Realty",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Borchini Realty | Homes in Poinciana, Florida",
    description: "Find your dream home in Westview, Poinciana, Florida. Browse property listings now.",
  },
  verification: {
    google: "google-site-verification=placeholder",
  },
  category: "Real Estate",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="alternate" type="application/xml" href="/api/sitemap" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Borchini Realty" />
        <meta name="geo.region" content="US-FL" />
        <meta name="geo.placename" content="Poinciana, Kissimmee" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
