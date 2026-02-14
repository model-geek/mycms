"use client";

import { FileText, Plus } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export interface ApiSchemaItem {
  id: string;
  name: string;
  endpoint: string;
  type: string;
  fieldCount: number;
}

interface ApiSchemaListProps {
  serviceId: string;
  schemas: ApiSchemaItem[];
}

export function ApiSchemaList({ serviceId, schemas }: ApiSchemaListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API</CardTitle>
        <CardDescription>コンテンツAPIの一覧</CardDescription>
        <CardAction>
          <Button asChild>
            <Link href={`/services/${serviceId}/apis/new`}>
              <Plus className="size-4" />
              新規作成
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {schemas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="text-muted-foreground mb-4 size-12" />
            <p className="text-muted-foreground mb-4">
              APIが作成されていません
            </p>
            <Button asChild>
              <Link href={`/services/${serviceId}/apis/new`}>
                <Plus className="size-4" />
                最初のAPIを作成
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schemas.map((schema) => (
              <Link
                key={schema.id}
                href={`/services/${serviceId}/apis/${schema.id}`}
                className="block"
              >
                <Card className="transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <CardTitle className="text-base">{schema.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">{schema.endpoint}</Badge>
                      <Badge variant="secondary">
                        {schema.type === "list" ? "リスト" : "オブジェクト"}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {schema.fieldCount} フィールド
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
