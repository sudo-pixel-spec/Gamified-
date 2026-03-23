import "./globals.css";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Material Icons only */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Icons+Round+Outlined&display=optional"
          rel="stylesheet"
        />
        <link
  href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
  rel="stylesheet"
/>
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded"
    rel="stylesheet"
  />
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>

      </head>
      <body
        className={`${jakarta.className} bg-background-light dark:bg-background-dark text-slate-text dark:text-slate-text-dark`}
      >
        {children}
      </body>
    </html>
  );
}