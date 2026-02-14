import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { NewApiSchemaFormWrapper } from "./form-wrapper";

export default async function NewApiPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>新規API作成</CardTitle>
          <CardDescription>
            コンテンツを管理するための新しいAPIスキーマを作成します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewApiSchemaFormWrapper serviceId={serviceId} />
        </CardContent>
      </Card>
    </div>
  );
}
