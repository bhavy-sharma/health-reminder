export default function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: null,
      popular: false,
      features: [
        "2 family members",
        "1 GB storage",
        "WhatsApp reminders",
        "Basic records",
      ],
      cta: "Start Free",
      dark: false,
    },
    {
      name: "Family",
      price: "₹299",
      period: "/month",
      popular: true,
      features: [
        "Unlimited members",
        "5 GB storage",
        "WhatsApp reminders",
        "Doctor PDF sharing",
        "Emergency info",
        "Priority support",
      ],
      cta: "Start Family Plan",
      dark: true,
    },
    {
      name: "Premium",
      price: "₹599",
      period: "/month",
      popular: false,
      features: [
        "Everything in Family",
        "20 GB storage",
        "AI health insights",
        "ABHA integration",
        "Dedicated support",
      ],
      cta: "Start Premium",
      dark: false,
    },
  ];

  return (
    <section className="bg-[#F5F3EF] py-20 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 text-center mb-16">
          Simple, family-friendly pricing
        </h2>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.dark
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-900 shadow-sm"
              }`}
            >
              {/* Most Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                    Most popular
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3
                className={`text-2xl font-semibold mb-2 ${plan.dark ? "text-white" : "text-gray-900"}`}
              >
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <span
                  className={`text-5xl font-serif font-bold ${plan.dark ? "text-white" : "text-gray-900"}`}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className={`text-sm ml-1 ${plan.dark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.dark ? "text-teal-400" : "text-teal-600"
                      }`}
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
                    <span
                      className={plan.dark ? "text-gray-200" : "text-gray-700"}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.dark
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-gray-500 text-sm mt-10">
          No credit card · Cancel anytime · Data never deleted
        </p>
      </div>
    </section>
  );
}
