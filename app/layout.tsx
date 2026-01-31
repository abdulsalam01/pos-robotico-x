import "./globals.css";
import type { Metadata } from "next";
import AuthGate from "@/components/AuthGate";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "Parfume POS",
  description: "User-friendly POS for parfum retail with CRM, inventory, and analytics."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <AuthGate>{children}</AuthGate>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
