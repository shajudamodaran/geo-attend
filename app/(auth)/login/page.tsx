import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const googleEnabled = Boolean(
    (process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID) &&
      (process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET),
  );
  return <LoginForm googleEnabled={googleEnabled} />;
}
