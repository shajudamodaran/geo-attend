import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { normalizePhoneDigits } from "@/lib/phone";

const googleEnabled =
  Boolean(process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  providers: [
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    Credentials({
      id: "owner-credentials",
      name: "Owner credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;
        const [{ default: connectDB }, { default: Business }, { default: bcrypt }] = await Promise.all([
          import("@/lib/mongodb"),
          import("@/models/Business"),
          import("bcryptjs"),
        ]);
        await connectDB();
        const business = await Business.findOne({ email: String(email).toLowerCase().trim() });
        if (!business?.passwordHash) return null;
        const ok = await bcrypt.compare(String(password), business.passwordHash);
        if (!ok) return null;
        return {
          id: `b:${business._id.toString()}`,
          email: business.email,
          name: business.ownerName,
          role: "owner" as const,
          businessId: business._id.toString(),
        };
      },
    }),
    Credentials({
      id: "employee-pin",
      name: "Employee PIN",
      credentials: {
        businessId: { label: "Business ID", type: "text" },
        phone: { label: "Phone", type: "text" },
        pin: { label: "PIN", type: "text" },
      },
      authorize: async (credentials) => {
        const businessId = credentials?.businessId;
        const phone = credentials?.phone;
        const pin = credentials?.pin;
        if (!businessId || !phone || !pin) return null;
        const [{ default: connectDB }, { default: Employee }, { default: bcrypt }] = await Promise.all([
          import("@/lib/mongodb"),
          import("@/models/Employee"),
          import("bcryptjs"),
        ]);
        await connectDB();
        const normalizedPhone = normalizePhoneDigits(String(phone));
        const employee = await Employee.findOne({
          businessId,
          phone: normalizedPhone,
          isActive: true,
        });
        if (!employee?.checkInPinHash) return null;
        const ok = await bcrypt.compare(String(pin), employee.checkInPinHash);
        if (!ok) return null;
        return {
          id: `e:${employee._id.toString()}`,
          email: employee.email ?? `${employee.phone}@employee.geoattend.local`,
          name: employee.name,
          role: "employee" as const,
          businessId: employee.businessId.toString(),
          employeeId: employee._id.toString(),
          phone: employee.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.businessId = user.businessId;
        token.employeeId = user.employeeId;
        token.name = user.name;
        token.email = user.email;
        const u = user as { phone?: string };
        if (u.phone) token.phone = u.phone;
        else delete token.phone;
      }
      if (account?.provider === "google" && user?.email) {
        const [{ default: connectDB }, { default: Business }] = await Promise.all([
          import("@/lib/mongodb"),
          import("@/models/Business"),
        ]);
        await connectDB();
        let business = await Business.findOne({ email: user.email.toLowerCase() });
        if (!business) {
          business = await Business.create({
            name: `${user.name ?? "Owner"}'s workspace`,
            ownerName: user.name ?? "Owner",
            email: user.email.toLowerCase(),
            passwordHash: "",
            phone: "",
            address: "",
            city: "",
            businessType: "Field services",
          });
        }
        token.role = "owner";
        token.businessId = business._id.toString();
        token.sub = `b:${business._id.toString()}`;
        token.name = business.ownerName;
        token.email = business.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? "";
        session.user.role = (token.role as "owner" | "employee") ?? "owner";
        session.user.businessId = (token.businessId as string) ?? "";
        if (token.employeeId) {
          session.user.employeeId = token.employeeId as string;
        } else {
          delete session.user.employeeId;
        }
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        if (token.phone) {
          session.user.phone = token.phone as string;
        } else {
          delete session.user.phone;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
