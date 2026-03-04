import Navbar from "./components/Navbar";
import CardGenerator from "./components/CardGenerator";

const ASHBY_URL = "https://www.ashbyhq.com";

export default function App() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-[64px] lg:h-[80px]" />

      <main>
        <CardGenerator />

        {/* Help section */}
        <div className="mx-auto max-w-[700px] px-4 pb-16 pt-8 text-center sm:px-6 lg:pb-24 lg:pt-12">
          <p className="text-lg font-medium leading-relaxed text-[#0E0C29] sm:text-xl">
            We're here to help! Please reach out with any<br className="hidden sm:inline" /> questions or concerns to{" "}
            <a
              href="mailto:events@ashbyhq.com"
              className="text-[#0E0C29] underline decoration-[#0E0C29] underline-offset-2 hover:opacity-70"
            >
              events@ashbyhq.com
            </a>
            .
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Left: copyright + links */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-text-secondary">
            <span className="font-medium text-[#0E0C29]">&copy; Ashby, Inc</span>
            <a
              href={ASHBY_URL}
              className="text-text-secondary no-underline transition-colors hover:text-[#0E0C29]"
            >
              Visit Ashby
            </a>
            <a
              href={`${ASHBY_URL}/podcast`}
              className="text-text-secondary no-underline transition-colors hover:text-[#0E0C29]"
            >
              Podcast
            </a>
            <a
              href={`${ASHBY_URL}/terms`}
              className="text-text-secondary no-underline transition-colors hover:text-[#0E0C29]"
            >
              Terms and Policies
            </a>
          </div>

          {/* Right: LinkedIn icon */}
          <a
            href="https://www.linkedin.com/company/ashbyhq"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0E0C29] transition-opacity hover:opacity-70"
            aria-label="Ashby on LinkedIn"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
