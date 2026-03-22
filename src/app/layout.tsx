import type { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#0a0f1a",
          color: "#e2e8f0",
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
