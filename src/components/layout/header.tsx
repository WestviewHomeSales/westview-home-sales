"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, memo } from "react";

function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close menu when path changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside - memoized for performance
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      isMenuOpen &&
      !target.closest(".mobile-menu") &&
      !target.closest(".hamburger-button")
    ) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [handleClickOutside]);

  // Handle escape key for accessibility
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isMenuOpen]);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { path: "/", label: "Current Listings" },
    { path: "/sold", label: "Sold" },
    { path: "/floor-plans", label: "Floor Plans" },
    { path: "/useful-info", label: "Useful Info" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={`border-b border-gray-200 bg-white sticky top-0 z-50 transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-blue-600 text-xl">Borchini</span>
              <span className="ml-1 text-xl">Realty</span>
            </Link>
            {/* Admin button removed */}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`hover:text-primary transition-colors ${
                  isActive(link.path) ? "text-primary font-medium" : "text-gray-600"
                }`}
                aria-current={isActive(link.path) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden hamburger-button flex flex-col justify-center items-center p-2"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span
              className={`block w-6 h-0.5 bg-gray-600 transition-transform duration-300 ${
                isMenuOpen
                  ? "transform rotate-45 translate-y-1.5"
                  : "mb-1.5"
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-gray-600 transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : "mb-1.5"
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-gray-600 transition-transform duration-300 ${
                isMenuOpen
                  ? "transform -rotate-45 -translate-y-1.5"
                  : ""
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          id="mobile-menu"
          className={`mobile-menu md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-72 opacity-100 py-3" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!isMenuOpen}
        >
          <nav className="flex flex-col gap-3 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`py-3 px-2 hover:text-primary transition-colors border-b border-gray-100 ${
                  isActive(link.path)
                    ? "text-primary font-medium"
                    : "text-gray-600"
                }`}
                aria-current={isActive(link.path) ? "page" : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(Header);
