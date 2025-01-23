import Navbar from "@/components/Navbar/Navbar";
import "@/styles/globals.css";
import Footer from "@/components/Footer/footer";
import { Inter } from "next/font/google";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sairam - Jamboree",
  description: "Jamboree Venue Tracking by Sairam",
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
