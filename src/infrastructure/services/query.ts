import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Service } from "./model";

export async function getServicesByOwner(
  ownerId: string,
): Promise<Service[]> {
  const result = await db
    .select()
    .from(services)
    .where(eq(services.ownerId, ownerId));
  return result as Service[];
}

export async function getServiceById(
  id: string,
): Promise<Service | null> {
  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.id, id));
  return (service as Service) ?? null;
}

export async function getServiceBySlug(
  slug: string,
): Promise<Service | null> {
  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.slug, slug));
  return (service as Service) ?? null;
}
