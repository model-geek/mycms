"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { FileImage, FileText, Film, Music, MoreHorizontal, Trash2, Copy } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import type { Media } from "../../model";

interface MediaCardProps {
  media: Media;
  onDelete: (id: string) => void;
  onSelect?: (media: Media) => void;
  selectable?: boolean;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <FileImage className="size-12 text-muted-foreground" />;
  if (mimeType.startsWith("video/")) return <Film className="size-12 text-muted-foreground" />;
  if (mimeType.startsWith("audio/")) return <Music className="size-12 text-muted-foreground" />;
  return <FileText className="size-12 text-muted-foreground" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaCard({ media, onDelete, onSelect, selectable }: MediaCardProps) {
  const isImage = media.mimeType.startsWith("image/");

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border bg-card ${
        selectable ? "cursor-pointer hover:ring-2 hover:ring-primary" : ""
      }`}
      onClick={selectable ? () => onSelect?.(media) : undefined}
    >
      <div className="relative aspect-square bg-muted">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.url}
            alt={media.fileName}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <FileIcon mimeType={media.mimeType} />
          </div>
        )}

        {!selectable && (
          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon-xs">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(media.url)}
                >
                  <Copy className="size-4" />
                  URLをコピー
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(media.id)}
                >
                  <Trash2 className="size-4" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="p-2">
        <p className="truncate text-sm font-medium">{media.fileName}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(media.size)} ・{" "}
          {format(new Date(media.createdAt), "yyyy/MM/dd", { locale: ja })}
        </p>
      </div>
    </div>
  );
}
