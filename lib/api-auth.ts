import { auth } from "@/auth";

export async function requireOwnerSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner" || !session.user.businessId) {
    return null;
  }
  return session;
}

export async function requireEmployeeSession() {
  const session = await auth();
  if (
    !session?.user?.id ||
    session.user.role !== "employee" ||
    !session.user.businessId ||
    !session.user.employeeId
  ) {
    return null;
  }
  return session;
}
