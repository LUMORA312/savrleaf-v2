import { AgeGateProvider } from "@/context/AgeGateContext";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { poppins } from "@/fonts";

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
    <html lang="en" className={poppins.className}>
      <body className="antialiased">
        <AuthProvider>
          <AgeGateProvider>{children}</AgeGateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
