import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#f8f9fa] py-8 mt-8">
      <div className="container mx-auto px-4">
        <div className="text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <div>
              © {currentYear} <Link href="/" className="footer-link">Borchini Realty</Link>. All rights reserved.
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-2">
              <Link
                href="mailto:WestviewHomeSales@gmail.com"
                className="footer-link"
              >
                WestviewHomeSales@gmail.com
              </Link>
              <span>|</span>
              <Link href="tel:4075227375" className="footer-link">
                (407) 522-7375
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
