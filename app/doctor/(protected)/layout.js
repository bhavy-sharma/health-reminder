import DoctorSidebar from "@/components/doctor/DoctorSidebar";
import RazorpayScript from "./RazorpayScript";

export const metadata = {
  title: "Doctor Portal | Family Health",
  description: "Manage your appointments, reviews, and patients on Family Health.",
};

export default function DoctorProtectedLayout({ children }) {
  return (
    <>
      <RazorpayScript />
      
      <DoctorSidebar />
      <div className="flex min-h-screen bg-[#FAF8F5]">
        <div className="hidden md:block w-64 shrink-0" />

        <main className="flex-1 min-w-0 w-full relative bg-[#FAF8F5] pt-20 md:pt-0">
          {children}
        </main>
      </div>
    </>
  );
}