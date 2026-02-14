import { ServiceList } from "@/infrastructure/services/service-list";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">サービス一覧</h1>
        <p className="text-muted-foreground">
          管理するサービスを選択するか、新しいサービスを作成してください
        </p>
      </div>
      <ServiceList services={[]} />
    </div>
  );
}
