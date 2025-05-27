"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState, useRef } from "react";

// Agent data
const agents = [
  {
    name: "Susan Borchini",
    title: "Broker/Owner",
    phone: "407-791-1789",
    email: "sborchini@gmail.com",
    image: "https://ext.same-assets.com/2507579115/115263724.jpeg",
  },
  {
    name: "Charlie Borchini",
    title: "Broker Associate",
    phone: "407-552-7375",
    email: "charles.borchini@gmail.com",
    image: "https://ext.same-assets.com/2507579115/3118422070.jpeg",
  },
  {
    name: "Yamile Varrone",
    title: "Realtor",
    phone: "315-534-1966",
    email: "ycVarrone@gmail.com",
    image: "https://ext.same-assets.com/2507579115/1321140723.jpeg",
  },
  {
    name: "Edie Stauffer",
    title: "Broker Associate",
    phone: "215-264-0820",
    email: "eStauffer712@gmail.com",
    image: "https://ext.same-assets.com/2507579115/2816672209.jpeg",
  },
  {
    name: "Valerie Williams",
    title: "Realtor",
    phone: "407-910-2609",
    email: "ValWilliamsRealtor@gmail.com",
    image: "https://ext.same-assets.com/2507579115/2522913045.jpeg",
  },
  {
    name: "Cherie Pontes",
    title: "Broker Associate",
    phone: "305-282-0527",
    email: "cherie34759@gmail.com",
    image: "https://ext.same-assets.com/2507579115/2150993415.jpeg",
  },
  {
    name: "Dale Pautz",
    title: "Realtor",
    phone: "863-669-7559",
    email: "dgpautz@gmail.com",
    image: "https://ext.same-assets.com/2507579115/68250803.jpeg",
  },
  {
    name: "Sheila Choromanski",
    title: "Broker Associate",
    phone: "203-631-8306",
    email: "SheilaChor@gmail.com",
    image: "https://ext.same-assets.com/2507579115/1520094433.jpeg",
  },
  {
    name: "Heather Hayes",
    title: "Realtor",
    phone: "703-282-7753",
    email: "HeatherHayes222@gmail.com",
    image: "https://ext.same-assets.com/2507579115/3342529203.jpeg",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<{
    message: string;
    type: "success" | "error" | "loading" | null;
  }>({
    message: "",
    type: null,
  });

  const formRef = useRef<HTMLFormElement>(null);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    // Create email body
    const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}

Message:
${formData.message}
    `;

    // Create mailto URL
    const mailtoLink = `mailto:WestviewHomeSales@gmail.com?subject=Website Contact from ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(emailBody)}`;

    // Show success message
    setFormStatus({
      message: "We're opening your email client so you can send your message directly.",
      type: "success",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });

    // Brief delay before opening email client
    setTimeout(() => {
      // Open the user's email client
      window.location.href = mailtoLink;
    }, 1500);
  };

  return (
    <main className="container mx-auto px-4 py-6 md:py-8">
      <section className="pb-4 pt-2 md:pb-8 md:pt-6">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tighter md:text-5xl">
            Contact Us
          </h1>
          <p className="max-w-[700px] text-base sm:text-lg text-gray-600">
            Get in touch with our team about properties in Westview, Poinciana.
          </p>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 order-2 md:order-1">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Send Us a Message
          </h2>

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
            ref={formRef}
          >
            {formStatus.type && (
              <div
                className={`p-3 rounded-md text-sm ${
                  formStatus.type === "success"
                    ? "bg-green-100 text-green-700"
                    : formStatus.type === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
                dangerouslySetInnerHTML={{ __html: formStatus.message }}
              ></div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                className="w-full"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                className="w-full"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone (optional)
              </label>
              <Input
                id="phone"
                name="phone"
                placeholder="(123) 456-7890"
                className="w-full"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Send Message
            </Button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Your message will be sent to the Westview Home Sales team.
            </p>

            <div className="mt-6 text-center py-3 px-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                This form will open your email application to send a message directly to our team.
              </p>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-5 order-1 md:order-2">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Our Office
          </h2>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Address</h3>
              <p className="text-gray-600">
                <a
                  href="https://borchinirealty.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Borchini Realty
                </a>
                <br />
                345 Sorrento Rd.
                <br />
                Kissimmee, FL 34759
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Phone</h3>
              <p className="text-gray-600">
                <a href="tel:4075227375" className="hover:underline">
                  (407) 522-7375
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Email</h3>
              <p className="text-gray-600 break-words">
                <a
                  href="mailto:WestviewHomeSales@gmail.com"
                  className="hover:underline"
                >
                  WestviewHomeSales@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Office Hours</h3>
              <p className="text-gray-600">
                Monday - Friday: 9:00 AM - 6:00 PM
                <br />
                Saturday: 10:00 AM - 4:00 PM
                <br />
                Sunday: By appointment only
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-12 py-8 bg-[#fafaec]">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-8 border-b-2 border-gray-300 pb-2 text-center tracking-wide">
            Meet Our Team
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <div key={agent.email} className="flex flex-col items-center">
                <div className="w-24 h-24 overflow-hidden rounded-full mb-2">
                  <Image
                    src={agent.image}
                    alt={agent.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                    crossOrigin="anonymous"
                  />
                </div>
                <h4 className="font-semibold text-center">{agent.name}</h4>
                <p className="text-sm text-center">{agent.title}</p>
                <a
                  href={`tel:${agent.phone.replace(/[^0-9]/g, "")}`}
                  className="text-sm text-center hover:underline"
                >
                  {agent.phone}
                </a>
                <a
                  href={`mailto:${agent.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {agent.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
