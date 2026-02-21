import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MetaMap • Multi-system Explorer",
  description:
    "MetaMap normalises multi-lineage self-model data with timelines, compass visualisations, and plug-in calculators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body className="antialiased">
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  );
}
