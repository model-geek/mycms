"use client";

import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/shared/ui/button";

import { ContentFilters } from "./content-filters";
import { ContentTable, type ContentRow } from "./content-table";

interface ContentListProps {
  serviceId: string;
  apiId: string;
  schemaName: string;
  contents: ContentRow[];
  onDelete: (id: string) => void;
}

const PAGE_SIZE = 20;

export function ContentList({
  serviceId,
  apiId,
  schemaName,
  contents,
  onDelete,
}: ContentListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);

  const filteredContents = useMemo(() => {
    return contents.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [contents, search, statusFilter]);

  const pagedContents = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredContents.slice(start, start + PAGE_SIZE);
  }, [filteredContents, page]);

  const totalPages = Math.ceil(filteredContents.length / PAGE_SIZE);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === pagedContents.length) return new Set();
      return new Set(pagedContents.map((c) => c.id));
    });
  }, [pagedContents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{schemaName}</h2>
        <Button asChild>
          <Link
            href={`/services/${serviceId}/apis/${apiId}/contents/new`}
          >
            <Plus className="size-4" />
            コンテンツを作成
          </Link>
        </Button>
      </div>
      <ContentFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {contents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <FileText className="text-muted-foreground mb-4 size-12" />
          <p className="text-muted-foreground mb-4">
            コンテンツがありません
          </p>
          <Button asChild>
            <Link
              href={`/services/${serviceId}/apis/${apiId}/contents/new`}
            >
              <Plus className="size-4" />
              最初のコンテンツを作成
            </Link>
          </Button>
        </div>
      ) : (
        <ContentTable
          rows={pagedContents}
          serviceId={serviceId}
          apiId={apiId}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onDelete={onDelete}
        />
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {filteredContents.length} 件中{" "}
            {page * PAGE_SIZE + 1}-
            {Math.min((page + 1) * PAGE_SIZE, filteredContents.length)}{" "}
            件表示
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              前へ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={page >= totalPages - 1}
            >
              次へ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
