import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/LoginForm";

export default function BusinessLoginPage() {
  return (
    <AuthShell side="isletme">
      <LoginForm variant="isletme" />
    </AuthShell>
  );
}
