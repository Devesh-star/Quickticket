"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, User, Chrome } from "lucide-react";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
  e.preventDefault();

  if (!name || !email || !password) {
    toast.error("Please fill in all fields");
    return;
  }

  if (password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    toast.success("Account created! Welcome 🎉");

    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/dashboard",
    });

  } catch (err) {
    toast.error(err.message || "Signup failed");
  } finally {
    setLoading(false);
  }
};

  const handleGoogle = () => signIn("google", {redirect: true, callbackUrl: "/dashboard" });

  return (
    <main className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-display font-black text-white text-sm">QT</div>
            <span className="font-display font-bold text-white text-xl">QuickTicket</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-gray-500">Start booking in seconds</p>
        </div>

        <div className="glass-dark rounded-2xl p-8">
          {/* Google */}
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 px-4 rounded-xl transition-all mb-6">
            <Chrome size={18} className="text-orange-400" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-xs">or create with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" required
                  className="input-field !pl-10" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="input-field !pl-10" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters" required
                  className="input-field !pl-10" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" />Creating account...</> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
