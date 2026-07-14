import Sidebar from "@/components/patient-dashboard/Sidebar";
import PricingSection from "@/components/PricingSection";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <Sidebar />
      <main className="md:pl-[280px]">
        <PricingSection />
      </main>
    </div>
  );
}
