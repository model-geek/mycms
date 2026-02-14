export const ROLES = ["owner", "admin", "editor", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = {
  "service.update": ["owner", "admin"],
  "service.delete": ["owner"],
  "schema.create": ["owner", "admin"],
  "schema.update": ["owner", "admin"],
  "schema.delete": ["owner", "admin"],
  "content.create": ["owner", "admin", "editor"],
  "content.update": ["owner", "admin", "editor"],
  "content.delete": ["owner", "admin"],
  "content.publish": ["owner", "admin", "editor"],
  "media.upload": ["owner", "admin", "editor"],
  "media.delete": ["owner", "admin"],
  "apiKey.create": ["owner", "admin"],
  "apiKey.delete": ["owner", "admin"],
  "webhook.manage": ["owner", "admin"],
  "member.invite": ["owner", "admin"],
  "member.remove": ["owner", "admin"],
  "member.changeRole": ["owner"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}
