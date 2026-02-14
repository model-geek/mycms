"use client";

import { createContext, useContext } from "react";

type ServiceContextType = {
  serviceId: string;
  serviceName: string;
  serviceSlug: string;
};

const ServiceContext = createContext<ServiceContextType | null>(null);

export function ServiceProvider({
  children,
  service,
}: {
  children: React.ReactNode;
  service: ServiceContextType;
}) {
  return <ServiceContext value={service}>{children}</ServiceContext>;
}

export function useService() {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useService must be used within ServiceProvider");
  }
  return context;
}
