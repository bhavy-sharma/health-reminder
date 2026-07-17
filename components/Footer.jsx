import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-2xl font-serif font-bold tracking-tight inline-block mb-3"
            >
              MedKept<span className="text-white">•</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              India&apos;s first family health management platform
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#about"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  About us
                </Link>
              </li>
              <li>
                <Link
                  href="#corporates"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  For Corporates
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#privacy"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#terms"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#dpdp"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  DPDP Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-gray-800 pt-8">
          {/* Copyright */}
          <p className="text-gray-500 text-sm text-center">
            © 2026 Family Health Command Center. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
