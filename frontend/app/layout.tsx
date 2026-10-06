import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: "Via Tomitana",
  description: "Platformă web pentru explorarea obiectivelor turistice și a moștenirii culturale din Constanța.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <NavBar />
        <div className="min-h-[calc(100vh-120px)]"><AuthProvider>{children}</AuthProvider></div>
        <Footer />
      </body>
    </html>
  );
}
