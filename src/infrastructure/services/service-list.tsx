"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { CreateServiceForm } from "@/infrastructure/services/create-service-form";

type Service = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export function ServiceList({ services }: { services: Service[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              サービスを作成
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいサービスを作成</DialogTitle>
              <DialogDescription>
                サービスの名前とスラッグを入力してください
              </DialogDescription>
            </DialogHeader>
            <CreateServiceForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">サービスがありません</p>
          <p className="mt-1 text-sm text-muted-foreground">
            最初のサービスを作成してください
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link key={service.id} href={`/services/${service.id}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>
                    {service.description ?? service.slug}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
