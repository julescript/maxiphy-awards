import { Urbanist } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Maxiphy Office Awards",
  description:
    "Celebrate Maxiphy team achievements by year with shareable award spotlights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${urbanist.variable} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
