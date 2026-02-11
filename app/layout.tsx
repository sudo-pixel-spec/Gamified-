import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gamefied Learning",
  description: "Gamified Learning Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FAFAFA] flex flex-col min-h-screen`}>
        {/* Main Content (grows to fill space) */}
        <div className="flex-grow">
          {children}
        </div>
        
        
      </body>
    </html>
  );
}