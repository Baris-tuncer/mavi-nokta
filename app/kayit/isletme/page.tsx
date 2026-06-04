import { AuthShell } from "@/components/AuthShell";
import { RegisterBusinessForm } from "@/components/RegisterBusinessForm";

export default function BusinessRegisterPage() {
  return (
    <AuthShell side="isletme">
      <RegisterBusinessForm />
    </AuthShell>
  );
}
