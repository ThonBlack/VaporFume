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
  title: "Vapor Fumê - Sua loja de Vapes e Pods",
  description: "Encontre os melhores pods, vapes e juices.",
  manifest: '/manifest.json', // Add manifest here
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
        {children}
      </body>
    </html>
  );
}
