import { AgeGateProvider } from "@/context/AgeGateContext";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "SavrLeaf",
  description: "The First Cannabis Platform for Discounted and Sale Items Only",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AuthProvider>
        <head />
        <body className="antialiased">
          <AgeGateProvider>
            {children}
          </AgeGateProvider>
        </body>
      </AuthProvider>
    </html>
  );
}
