import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "owner" | "employee";
      businessId: string;
      employeeId?: string;
      /** Set for employees — used to prefill login when switching workplace. */
      phone?: string;
    };
  }

  interface User {
    role?: "owner" | "employee";
    businessId?: string;
    employeeId?: string;
    phone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "owner" | "employee";
    businessId?: string;
    employeeId?: string;
    phone?: string;
  }
}
