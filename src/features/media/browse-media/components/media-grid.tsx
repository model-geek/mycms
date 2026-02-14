"use client";

import { ImageIcon } from "lucide-react";

import type { Media } from "../../model";

import { MediaCard } from "./media-card";

interface MediaGridProps {
  media: Media[];
  onDelete: (id: string) => void;
  onSelect?: (media: Media) => void;
  selectable?: boolean;
}

export function MediaGrid({ media, onDelete, onSelect, selectable }: MediaGridProps) {
  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ImageIcon className="mb-4 size-12 text-muted-foreground" />
        <p className="text-muted-foreground">メディアがありません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {media.map((item) => (
        <MediaCard
          key={item.id}
          media={item}
          onDelete={onDelete}
          onSelect={onSelect}
          selectable={selectable}
        />
      ))}
    </div>
  );
}
