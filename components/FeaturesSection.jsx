export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      ),
      title: "Centralised Records",
      badge: "Forever Storage",
      description:
        "Every report, prescription, and scan — from birth to today — in one searchable timeline. Never lose a medical document again.",
      checkmark: "Works even if you change phones or delete WhatsApp",
      preview: (
        <div className="bg-[#F5F3EF] rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px]">
          <svg
            className="w-16 h-16 text-gray-800 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-sm">Upload · Organize · Share</p>
        </div>
      ),
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      title: "WhatsApp Reminders",
      badge: "Senior-Friendly",
      description:
        "Medicine reminders sent directly to WhatsApp. Seniors just reply &quot;OK&quot; to confirm. No app to download. No training needed.",
      checkmark: "You see confirmations in real-time on your dashboard",
      preview: (
        <div className="bg-[#F5F3EF] rounded-xl p-6 min-h-[200px]">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">8:00 AM</p>
                <p className="text-sm text-gray-800">
                  🌞 Good morning! Time to take your Metformin 500mg. Reply OK
                  to confirm.
                </p>
                <div className="mt-3 flex justify-end">
                  <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-medium">
                    OK
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Doctor Share PDF",
      badge: "One Click",
      description:
        "Generate a complete health summary PDF for doctor visits. Select what to include. Share via link or WhatsApp.",
      checkmark: "Doctors love this — saves 15 minutes per appointment",
      preview: (
        <div className="bg-[#F5F3EF] rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px]">
          <svg
            className="w-16 h-16 text-gray-800 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <p className="text-gray-500 text-sm">Secure · Expiring Links</p>
        </div>
      ),
    },

    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Whole Family, One Account",
      badge: "₹299/month",
      description:
        "Parents, spouse, kids, grandparents — everyone in one place. Unlimited members. Shared storage. One subscription.",
      checkmark: "First 2 members are always free",
      preview: (
        <div className="bg-[#F5F3EF] rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px]">
          <div className="flex -space-x-3">
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold border-2 border-white">
              R
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold border-2 border-white">
              M
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold border-2 border-white">
              F
            </div>
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-semibold border-2 border-white">
              P
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-[#FAF8F5] py-20 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-3">
            What It Does
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
            Every feature solves a real family health problem
          </h2>
        </div>

        {/* Features List */}
        <div className="space-y-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left Content */}
                <div className="space-y-4">
                  {/* Icon + Title */}
                  <div className="flex items-center gap-3">
                    <div className="text-gray-800">{feature.icon}</div>
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>

                  {/* Badge */}
                  <div className="inline-block">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Checkmark Note */}
                  <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature.checkmark}
                  </div>
                </div>

                {/* Right Preview */}
                <div>{feature.preview}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
