export interface Service {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
