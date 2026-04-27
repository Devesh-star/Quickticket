import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          await connectDB();
          
          if (credentials.email === "admin@quickticket.com" && credentials.password === "admin123") {
            let adminUser = await User.findOne({ email: "admin@quickticket.com" });
            if (!adminUser) {
              const hashed = await bcrypt.hash("admin123", 10);
              adminUser = await User.create({
                name: "Demo Admin",
                email: "admin@quickticket.com",
                password: hashed,
                role: "admin",
                emailVerified: new Date(),
              });
            } else if (adminUser.role !== "admin") {
              adminUser.role = "admin";
              await adminUser.save();
            }
            return { id: adminUser._id.toString(), email: adminUser.email, name: adminUser.name, role: "admin" };
          }

          const user = await User.findOne({ email: credentials.email }).select("+password");
          if (!user || !user.password) return null;
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image ?? null,
          };
        } catch (err) {
          console.error("[CREDENTIALS AUTH ERROR]", err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          const existing = await User.findOne({ email: user.email });
          if (!existing) {
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              emailVerified: new Date(),
            });
            user.id = newUser._id.toString();
          } else {
            user.id = existing._id.toString();
          }
        } catch (err) {
          console.error("[GOOGLE SIGNIN ERROR]", err?.message, err?.stack);
          return `/auth/login?error=GoogleSigninFailed`;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user?.id) token.id = user.id;
      // Fetch role from DB on initial sign-in or when session is updated
      if (user?.id || trigger === "update") {
        try {
          await connectDB();
          const dbUser = await User.findById(token.id).select("role").lean();
          token.role = dbUser?.role || "user";
        } catch {
          token.role = "user";
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) session.user.id = token.id;
      session.user.role = token.role || "user";
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },
  session: { strategy: "jwt" },
  debug: true,
  logger: {
    error(code, ...message) {
      console.error("[AUTH ERROR]", code, JSON.stringify(message, null, 2));
    },
    warn(code) {
      console.warn("[AUTH WARN]", code);
    },
  },
});
