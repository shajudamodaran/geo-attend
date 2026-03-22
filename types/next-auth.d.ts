import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "owner" | "employee";
      businessId: string;
      employeeId?: string;
    };
  }

  interface User {
    role?: "owner" | "employee";
    businessId?: string;
    employeeId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "owner" | "employee";
    businessId?: string;
    employeeId?: string;
  }
}
