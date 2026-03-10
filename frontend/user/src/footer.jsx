import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 ">
      <div className="max-w-7xl mx-auto px-6 lg:px-20 py-12">
        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Support Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Help Centre
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Get help with a safety issue
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  BookCover
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Anti-discrimination
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Disability support
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Cancellation options
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Report neighbourhood concern
                </a>
              </li>
            </ul>
          </div>

          {/* Hosting Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Hosting</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Book your home
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Book your experience
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Book your service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  BookCover for Hosts
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Hosting resources
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Community forum
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Hosting responsibly
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Join a free hosting class
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Find a co-host
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Refer a host
                </a>
              </li>
            </ul>
          </div>

          {/* Book Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Book</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  2025 Summer Release
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Newsroom
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Investors
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-900 hover:underline">
                  Book.org emergency stays
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-6 border-t border-gray-200 gap-4">
          {/* Left Side - Copyright and Links */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-900">
            <span>© 2026 Book, Inc.</span>
            <span className="hidden md:inline">·</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span className="hidden md:inline">·</span>
            <a href="#" className="hover:underline">Terms</a>
            <span className="hidden md:inline">·</span>
            <a href="#" className="hover:underline">Company details</a>
          </div>

          {/* Right Side - Language, Currency, and Social */}
          <div className="flex items-center gap-6">
            {/* Language and Currency */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:underline">
                <span>🌐</span>
                <span>English (IN)</span>
              </button>
              <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:underline">
                <span>₹</span>
                <span>INR</span>
              </button>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-900 hover:opacity-70 transition-opacity">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-900 hover:opacity-70 transition-opacity">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-900 hover:opacity-70 transition-opacity">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;