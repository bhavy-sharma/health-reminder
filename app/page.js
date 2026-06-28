import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemsSection from "@/components/ProblemsSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      <Navbar />
      <HeroSection />
      <ProblemsSection />
    </main>
  );
}
