import { getCurrentProfile } from "@/app/_actions/profile";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import {
  demoAdminBusinesses,
  demoAdminStats,
  demoAdminActions,
  type AdminBusiness,
  type AdminStats,
  type AdminAction,
} from "@/lib/mock-admin";

export default async function AdminPage() {
  let businesses: AdminBusiness[];
  let stats: AdminStats;
  let actions: AdminAction[];
  let isDemo = false;

  try {
    const profile = await getCurrentProfile();

    // TODO: ADMIN role henuz DB'de yok — ileride eklenecek
    if (profile && (profile.role as string) === "ADMIN") {
      // Gercek admin verisi burada cekilecek
      businesses = demoAdminBusinesses;
      stats = demoAdminStats;
      actions = demoAdminActions;

      return (
        <AdminDashboard
          businesses={businesses}
          stats={stats}
          actions={actions}
          isDemo={false}
        />
      );
    }
  } catch {
    // Auth hatasi → demo moduna dus
  }

  return (
    <AdminDashboard
      businesses={demoAdminBusinesses}
      stats={demoAdminStats}
      actions={demoAdminActions}
      isDemo={true}
    />
  );
}
