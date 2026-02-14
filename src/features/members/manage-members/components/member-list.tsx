"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import type { MemberWithUser } from "../../model";
import type { Role } from "../../permissions";
import { ROLES } from "../../permissions";

const ROLE_LABELS: Record<Role, string> = {
  owner: "オーナー",
  admin: "管理者",
  editor: "編集者",
  viewer: "閲覧者",
};

const ROLE_VARIANTS: Record<Role, "default" | "secondary" | "outline"> = {
  owner: "default",
  admin: "secondary",
  editor: "outline",
  viewer: "outline",
};

interface MemberListProps {
  members: MemberWithUser[];
  onChangeRole: (memberId: string, role: Role) => void;
  onRemove: (memberId: string) => void;
}

export function MemberList({
  members,
  onChangeRole,
  onRemove,
}: MemberListProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      startTransition(() => {
        onRemove(deleteTarget);
      });
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ユーザー</TableHead>
            <TableHead className="w-[120px]">ロール</TableHead>
            <TableHead className="w-[140px]">参加日</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                <p className="text-muted-foreground">メンバーがいません</p>
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {member.userName ?? member.userEmail}
                    </p>
                    {member.userName && (
                      <p className="text-sm text-muted-foreground">
                        {member.userEmail}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANTS[member.role]}>
                    {ROLE_LABELS[member.role]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(member.createdAt), "yyyy/MM/dd", {
                    locale: ja,
                  })}
                </TableCell>
                <TableCell>
                  {member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            ロール変更
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {ROLES.filter((r) => r !== "owner").map((role) => (
                              <DropdownMenuItem
                                key={role}
                                disabled={role === member.role}
                                onClick={() => onChangeRole(member.id, role)}
                              >
                                {ROLE_LABELS[role]}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(member.id)}
                        >
                          <Trash2 className="size-4" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>メンバーを削除</AlertDialogTitle>
            <AlertDialogDescription>
              このメンバーをサービスから削除しますか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="mt-4 text-sm text-muted-foreground">
        オーナーのロールは変更できません
      </p>
    </>
  );
}
