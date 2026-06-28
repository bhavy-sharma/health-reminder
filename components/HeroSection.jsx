export default function HeroSection() {
  return (
    <section className="px-8 py-16 md:py-24 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full">
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
            <span className="text-sm text-teal-700 font-medium">
              For every Indian family
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 leading-[1.1]">
            Where is your mother&apos;s last blood test report right now?
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="bg-gray-900 text-white px-8 py-4 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors">
              Start free — no card needed
            </button>
            <button className="px-8 py-4 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 transition-colors">
              See how it works →
            </button>
          </div>
        </div>

        {/* Right Content - Cards */}
        <div className="space-y-4">
          {/* Person Card */}
          <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
              RM
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Rajesh (You)</h3>
              <p className="text-sm text-gray-600">
                All good · Last checkup 12 days ago
              </p>
            </div>
            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
          </div>

          {/* Mother Card */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
              MA
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Mother</h3>
              <p className="text-sm text-gray-600">
                BP medicine missed yesterday
              </p>
            </div>
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
