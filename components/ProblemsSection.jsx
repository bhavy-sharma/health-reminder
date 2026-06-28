export default function ProblemsSection() {
  const problems = [
    {
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      label: "Lost Records",
      quote:
        "Father had an MRI done. We spent 2 hours searching the house. Finally found it in an old WhatsApp chat.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      label: "Medicine Conflicts",
      quote:
        "Mother sees 5 different doctors. Nobody knows what medicines the others prescribed. Is this safe?",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      label: "Distance Emergency",
      quote:
        "I'm in Bangalore. Father had chest pain in Mumbai. Doctor asked about his history. I had no idea.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      label: "Forgotten Doses",
      quote:
        "Mother's BP medicine. She forgets. I can't call every day. By the time we notice, it's a crisis.",
    },
  ];

  return (
    <section className="bg-gray-900 py-20 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Heading */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white text-center mb-16 leading-tight">
          Every Indian family is one emergency away from chaos
        </h2>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-colors"
            >
              {/* Icon */}
              <div className="text-red-400 mb-4">{problem.icon}</div>

              {/* Label Badge */}
              <div className="inline-block bg-red-500/20 text-red-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                {problem.label}
              </div>

              {/* Quote */}
              <p className="text-gray-300 text-lg italic leading-relaxed">
                &ldquo;{problem.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
