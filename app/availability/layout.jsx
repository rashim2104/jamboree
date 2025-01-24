import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sairam - Jamboree | Availability",
  description: "Check venue availability - Jamboree Venue Tracking",
};

export default function AvailabilityLayout({ children }) {
  return (
    <main className={inter.className}>
      <div className="min-h-screen">
        {children}
      </div>
    </main>
  );
}