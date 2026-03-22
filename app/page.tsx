import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user?.role === "owner") {
    redirect("/dashboard");
  }
  if (session?.user?.role === "employee") {
    redirect("/checkin");
  }
  redirect("/login");
}
