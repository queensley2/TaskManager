"use client";
// import { Metadata } from "next";
import { Nunito } from "next/font/google";
import "../globals.css";
import Sidebar from "../../components/ui/sidebar";
import Navbar from "../../components/ui/nav";
// import { usePathname } from "next/navigation";

const nunito = Nunito({
  weight: ["400", "500", "700", "800", "900"],
  subsets: ["latin"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  // const pathname = usePathname();

  return (
    <div className={`${nunito.className} flex min-h-screen w-full`}>
      {/* Only render sidebar on md+ screens */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}
