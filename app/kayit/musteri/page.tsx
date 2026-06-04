import { AuthShell } from "@/components/AuthShell";
import { RegisterCustomerForm } from "@/components/RegisterCustomerForm";

export default function CustomerRegisterPage() {
  return (
    <AuthShell side="musteri">
      <RegisterCustomerForm />
    </AuthShell>
  );
}
