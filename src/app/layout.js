import { Inter, Outfit } from "next/font/google"; // Font setup
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import AgeGate from '@/components/AgeGate';
import InstallPrompt from '@/components/InstallPrompt';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit'
});

export const metadata = {
  metadataBase: new URL('https://vaporfume.shop'),
  title: "Vapor Fumê - Sua loja de Vapes e Pods",
  description: "Encontre os melhores pods, vapes e juices.",
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/icon-v2.png',
    shortcut: '/assets/icon-v2.png',
    apple: '/assets/icon-v2.png',
  },
  openGraph: {
    title: "Vapor Fumê - Sua loja de Vapes e Pods",
    description: "Encontre os melhores pods, vapes e juices. Ignite, Elfbar, Oxbar com entrega rápida.",
    url: 'https://vaporfume.shop',
    siteName: 'Vapor Fumê',
    images: [
      {
        url: '/assets/icon-v2.png', // Fallback image
        width: 800,
        height: 600,
      }
    ],
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} ${outfit.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "Vapor Fumê",
              "image": "https://vaporfume.com.br/assets/ref-mobile.jpg",
              "description": "A melhor loja de Vapes, Pods e Juices. Ignite, Elfbar, Oxbar com entrega rápida e preços imbatíveis.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Av. Brasil, 1000",
                "addressLocality": "Campo Grande",
                "addressRegion": "MS",
                "postalCode": "79000-000",
                "addressCountry": "BR"
              },
              "priceRange": "$$",
              "telephone": "+55 67 99999-9999",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                  ],
                  "opens": "09:00",
                  "closes": "18:00"
                }
              ]
            })
          }}
        />
        <Toaster position="top-center" />
        <AgeGate />
        <InstallPrompt />
        <ServiceWorkerRegister />
        {children}
        <footer className="py-6 text-center text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
          <p>System v2.1 (Debug Active)</p>
        </footer>
      </body>
    </html>
  );
}
