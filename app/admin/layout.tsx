import React from "react";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata = {
  title: "Back-Office ALTAJLEATHER | Gestion COD & Commandes Maroc",
  description: "Tableau de bord de gestion des commandes Cash-on-Delivery ALTAJLEATHER.",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthProvider>
  );
}

