export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Sign up (30 seconds)",
      description: "WhatsApp OTP — no password to remember",
      time: "Less than a minute",
    },
    {
      number: "2",
      title: "Add your family members",
      description: "Parents, spouse, kids — everyone in one account",
      time: "2-3 minutes",
    },
    {
      number: "3",
      title: "Upload past reports",
      description: "Take photos with your phone. We'll organize everything.",
      time: "5 minutes for first batch",
    },
    {
      number: "4",
      title: "Set medicine reminders",
      description:
        "WhatsApp reminders start immediately. Peace of mind forever.",
      time: "2 minutes per medicine",
    },
  ];

  return (
    <section className="bg-white py-20 px-8">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 text-center mb-16">
          From chaos to clarity in 4 steps
        </h2>

        {/* Steps Container */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-12 top-0 bottom-0 w-px bg-gray-200"></div>

          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex items-start gap-8 md:gap-12"
              >
                {/* Number */}
                <div className="relative z-10 flex-shrink-0">
                  <span className="text-5xl md:text-6xl font-serif font-bold text-red-500">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 pb-12 border-b border-gray-100 last:border-0">
                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-3">{step.description}</p>

                  {/* Time Estimate */}
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {step.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <button className="bg-gray-900 text-white px-8 py-4 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2">
            Start your family health record now
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
