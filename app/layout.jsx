import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "QuickTicket — Travel Smarter, Book Faster",
  description: "Book flights, trains and buses with real-time pricing and seat availability.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1a2e",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              },
              success: { iconTheme: { primary: "#f97316", secondary: "#fff" } },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
