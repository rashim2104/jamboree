import Navbar from "@/components/Navbar/Navbar";
import "@/styles/globals.css";
import Footer from "@/components/Footer/footer";
import { Inter } from "next/font/google";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sairam S2T",
  description: "School Towards Technology",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
        <Footer />  
      </body>
    </html>
  );
}
