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
      
      <div className="flex min-h-screen bg-[#FAF8F5]">
        <div className="hidden md:block w-64 shrink-0">
          <DoctorSidebar />
        </div>

        <main className="flex-1 max-w-[896px] mx-auto w-full relative bg-[#FAF8F5] p-6 md:p-8">
          {children}
        </main>
      </div>
    </>
  );
}