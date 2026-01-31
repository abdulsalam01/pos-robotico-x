import "./globals.css";
import type { Metadata } from "next";
import AuthGate from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "Parfume POS",
  description: "User-friendly POS for parfum retail with CRM, inventory, and analytics."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
