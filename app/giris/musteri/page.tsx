import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/LoginForm";

export default function CustomerLoginPage() {
  return (
    <AuthShell side="musteri">
      <LoginForm variant="musteri" />
    </AuthShell>
  );
}
