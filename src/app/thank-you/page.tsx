import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function ThankYouPage() {
  return (
    <main className="container mx-auto px-4 py-12 md:py-16 min-h-[calc(100vh-300px)] flex flex-col items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Thank You!</h1>
        <p className="text-gray-600 mb-6">
          Your message has been sent successfully. A member of our team will get back to you as soon as possible.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/">
              Return to Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">
              Send Another Message
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
