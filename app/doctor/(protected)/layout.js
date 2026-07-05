import DoctorSidebar from "@/components/doctor/DoctorSidebar";

export const metadata = {
  title: "Doctor Portal | Family Health",
  description: "Manage your appointments, reviews, and patients on Family Health.",
};

export default function DoctorProtectedLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-cream)]">
      {/* Sidebar - Fixed on desktop */}
      <div className="hidden md:block w-64 shrink-0">
        <DoctorSidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[896px] mx-auto w-full relative">
        {children}
      </main>
    </div>
  );
}
