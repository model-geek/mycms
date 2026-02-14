import { ServiceList } from "@/infrastructure/services/service-list";
import { getServicesByOwner } from "@/infrastructure/services/query";
import { requireAuth } from "@/shared/lib/auth-guard";

export default async function ServicesPage() {
  const session = await requireAuth();
  const services = await getServicesByOwner(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">サービス一覧</h1>
        <p className="text-muted-foreground">
          管理するサービスを選択するか、新しいサービスを作成してください
        </p>
      </div>
      <ServiceList services={services} />
    </div>
  );
}
