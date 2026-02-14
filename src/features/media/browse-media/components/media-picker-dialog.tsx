"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import type { Media } from "../../model";
import { UploadZone } from "../../upload-media/components/upload-zone";

import { MediaGrid } from "./media-grid";

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  onSelect: (media: Media) => void;
  fetchMedia: (serviceId: string) => Promise<Media[]>;
  uploadMedia: (serviceId: string, formData: FormData) => Promise<Media | null>;
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  serviceId,
  onSelect,
  fetchMedia,
  uploadMedia,
}: MediaPickerDialogProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      startTransition(async () => {
        const result = await fetchMedia(serviceId);
        setMedia(result);
      });
    }
  }, [open, serviceId, fetchMedia]);

  const handleUpload = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadMedia(serviceId, formData);
      if (result) {
        setMedia((prev) => [result, ...prev]);
      }
    },
    [serviceId, uploadMedia],
  );

  const handleSelect = useCallback(
    (item: Media) => {
      onSelect(item);
      onOpenChange(false);
    },
    [onSelect, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>メディアを選択</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <UploadZone onUpload={handleUpload} />
          <MediaGrid
            media={media}
            onDelete={() => {}}
            onSelect={handleSelect}
            selectable
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
