"use client";

import { createContext, useContext } from "react";

export type AdminUserInfo = { id: string; email: string; role: string };

const AdminUserContext = createContext<AdminUserInfo | null | undefined>(undefined);

export function AdminUserProvider({
  user,
  children,
}: {
  user: AdminUserInfo | undefined;
  children: React.ReactNode;
}) {
  return (
    <AdminUserContext.Provider value={user}>
      {children}
    </AdminUserContext.Provider>
  );
}

export function useAdminUser(): AdminUserInfo | null | undefined {
  return useContext(AdminUserContext);
}
