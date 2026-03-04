import { useState, useEffect } from "react";

const ASHBY_ONE_URL = "https://www.ashbyhq.com/ashby-one/2026";

const NAV_LINKS = [
  { label: "About", href: `${ASHBY_ONE_URL}#about` },
  { label: "Agenda", href: `${ASHBY_ONE_URL}#agenda` },
  { label: "Speakers", href: "https://www.ashbyhq.com/ashby-one/2026/san-francisco" },
  { label: "Ashby Labs", href: `${ASHBY_ONE_URL}#labs` },
  { label: "FAQ", href: `${ASHBY_ONE_URL}#faq` },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50">
      {/* Glass-morphism bar */}
      <div className="nav-glass flex h-[64px] items-center justify-between px-4 sm:px-6 lg:h-[80px] lg:px-10">
        {/* Logo */}
        <a
          href={ASHBY_ONE_URL}
          className="text-[#0E0C29] no-underline transition-opacity hover:opacity-80"
        >
          <img
            src={`${import.meta.env.BASE_URL}ashby-one-logo.svg`}
            alt="Ashby One"
            className="h-[22px] w-auto lg:h-[28px]"
          />
        </a>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="nav-link text-[15px] tracking-[-0.01em] text-[#0E0C29] no-underline transition-all duration-150 hover:opacity-70 xl:text-[16px]"
            >
              {link.label}
            </a>
          ))}
          <a
            href={`${ASHBY_ONE_URL}#tickets`}
            className="nav-cta inline-flex items-center rounded-full bg-[#0E0C29] px-6 py-2.5 text-[14px] tracking-[-0.01em] text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_0_3px_rgba(71,59,206,0.2),0_8px_24px_rgba(107,79,191,0.5)] xl:text-[15px]"
          >
            Get Tickets
          </a>
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="relative flex h-10 w-10 flex-col items-center justify-center gap-[6px] lg:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span
            className={`block h-[2px] w-6 rounded-full bg-[#0E0C29] transition-all duration-300 ${
              menuOpen ? "translate-y-[8px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-6 rounded-full bg-[#0E0C29] transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-6 rounded-full bg-[#0E0C29] transition-all duration-300 ${
              menuOpen ? "-translate-y-[8px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile overlay menu */}
      <div
        className={`fixed inset-0 top-[64px] z-40 transition-all duration-300 lg:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-white/95 backdrop-blur-md"
          onClick={() => setMenuOpen(false)}
        />

        {/* Menu content */}
        <div className="relative flex flex-col items-center gap-6 px-6 pt-12">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[22px] font-semibold tracking-[-0.01em] text-[#0E0C29] no-underline transition-opacity hover:opacity-80"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={`${ASHBY_ONE_URL}#tickets`}
            className="mt-2 inline-flex items-center rounded-full bg-[#0E0C29] px-10 py-4 text-[18px] tracking-[-0.01em] text-white no-underline transition-all duration-200 hover:shadow-[0_0_0_3px_rgba(71,59,206,0.2),0_8px_24px_rgba(107,79,191,0.5)]"
            onClick={() => setMenuOpen(false)}
          >
            Get Tickets
          </a>
        </div>
      </div>
    </nav>
  );
}
