"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HelpCircle, Mail, Phone, ExternalLink } from "lucide-react";

export default function SupportPage() {
  const faqs = [
    { q: "How do I print my boarding pass?", a: "Once your payment is confirmed, a digital ticket and boarding pass are emailed to you immediately. You can also view and download it from the 'My Bookings' section." },
    { q: "Can I cancel my flight?", a: "Flight cancellations can currently only be processed by contacting support directly via email. Please include your Booking ID (starts with QT-)." },
    { q: "Are my payment details secure?", a: "Yes. We use Stripe for all payment processing. QuickTicket never stores your credit card details directly." },
    { q: "Why can't I search for trains or buses anymore?", a: "QuickTicket has transitioned to be exclusively a premium flight booking platform to provide the best possible airline booking experience." },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a14] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle size={28} className="text-orange-500" />
          <h1 className="font-display text-4xl font-bold text-white">Help & Support</h1>
        </div>
        <p className="text-gray-400 mb-12">We're here to help you get off the ground smoothly.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="glass p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 text-orange-500">
              <Mail size={20} />
            </div>
            <h3 className="font-bold text-white mb-2">Email Support</h3>
            <p className="text-gray-400 text-sm mb-4">We usually respond within 24 hours.</p>
            <a href="mailto:support@quickticket.com" className="text-orange-500 hover:text-orange-400 text-sm font-medium flex items-center gap-1.5">
              support@quickticket.com <ExternalLink size={14} />
            </a>
          </div>
          <div className="glass p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 text-orange-500">
              <Phone size={20} />
            </div>
            <h3 className="font-bold text-white mb-2">Call Us</h3>
            <p className="text-gray-400 text-sm mb-4">Available Mon-Fri, 9am to 6pm IST.</p>
            <span className="text-gray-300 text-sm font-medium">+91 98765 43210</span>
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass p-6 rounded-2xl">
              <h3 className="text-white font-medium mb-2 flex items-start gap-3">
                <span className="text-orange-500">Q.</span> {faq.q}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed ml-7">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
