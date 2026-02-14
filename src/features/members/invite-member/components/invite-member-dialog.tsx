"use client";

import { useCallback, useState, useTransition } from "react";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import type { MemberWithUser } from "../../model";
import type { Role } from "../../permissions";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "管理者" },
  { value: "editor", label: "編集者" },
  { value: "viewer", label: "閲覧者" },
];

interface InviteMemberDialogProps {
  onInvite: (email: string, role: Role) => Promise<MemberWithUser | null>;
  trigger: React.ReactNode;
}

export function InviteMemberDialog({
  onInvite,
  trigger,
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleInvite = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const result = await onInvite(email, role);
      if (result) {
        setEmail("");
        setRole("editor");
        setOpen(false);
      }
    });
  }, [email, role, onInvite]);

  const handleClose = useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      setEmail("");
      setRole("editor");
      setError(null);
    }
    setOpen(nextOpen);
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>メンバーを招待</DialogTitle>
          <DialogDescription>
            メールアドレスでユーザーをサービスに招待します
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="invite-email">メールアドレス</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="invite-role">ロール</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as Role)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            キャンセル
          </Button>
          <Button
            onClick={handleInvite}
            disabled={!email.trim() || isPending}
          >
            招待
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
