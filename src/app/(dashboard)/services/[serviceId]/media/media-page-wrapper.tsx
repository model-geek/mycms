"use client";

import { useCallback, useState, useTransition } from "react";

import { MediaGrid } from "@/features/media/browse-media/components/media-grid";
import type { Media } from "@/features/media/model";
import { UploadZone } from "@/features/media/upload-media/components/upload-zone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

interface MediaPageWrapperProps {
  serviceId: string;
  initialMedia: Media[];
}

export function MediaPageWrapper({
  serviceId,
  initialMedia,
}: MediaPageWrapperProps) {
  const [media, setMedia] = useState<Media[]>(initialMedia);
  const [, startTransition] = useTransition();

  const handleUpload = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.set("file", file);

      startTransition(async () => {
        const { uploadMedia } = await import("@/features/media/upload-media/action");
        const result = await uploadMedia(serviceId, formData);
        if (result.success) {
          setMedia((prev) => [result.data, ...prev]);
        }
      });
    },
    [serviceId],
  );

  const handleDelete = useCallback(
    (id: string) => {
      startTransition(async () => {
        const { deleteMedia } = await import("@/features/media/manage-media/action");
        const result = await deleteMedia(id, serviceId);
        if (result.success) {
          setMedia((prev) => prev.filter((m) => m.id !== id));
        }
      });
    },
    [serviceId],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>メディア</CardTitle>
        <CardDescription>画像やファイルを管理します</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <UploadZone onUpload={handleUpload} />
        <MediaGrid media={media} onDelete={handleDelete} />
      </CardContent>
    </Card>
  );
}
