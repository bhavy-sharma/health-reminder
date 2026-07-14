import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-[#F5F3EF] py-20 px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-8 leading-tight">
          Your family&apos;s health deserves better than a WhatsApp folder
        </h2>

        {/* CTA Button */}
        <Link href="/login" className="bg-gray-900 text-white px-8 py-4 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors inline-block mb-4">
          Start organizing your family&apos;s health — free
        </Link>

        {/* Subtext */}
        <p className="text-gray-500 text-sm">
          2 members free forever · No credit card required
        </p>
      </div>
    </section>
  );
}
