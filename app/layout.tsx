import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisuAlg Interpreter",
  description: "Interpretador de VisuAlg online para desenvolvedores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
