"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AdminRole } from "@/types";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("admin@altajleather.ma");
  const [password, setPassword] = useState("••••••••");
  const [role, setRole] = useState<AdminRole>("OWNER");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      login(email, role);
      router.push("/admin");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-altaj-dark flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-sm shadow-2xl border border-altaj-border space-y-6">
        <div className="text-center space-y-2">
          <Logo size="md" />
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-altaj-gold pt-2">
            <Lock className="h-3 w-3" />
            <span>Accès Back-Office Sécurisé</span>
          </div>
          <p className="text-xs text-altaj-muted">
            Connectez-vous pour gérer les commandes et les expéditions COD.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Select
            label="Rôle"
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            options={[
              { value: "OWNER", label: "Propriétaire (OWNER)" },
              { value: "STAFF", label: "Opérateur (STAFF)" },
            ]}
          />
          <Button type="submit" variant="gold" size="lg" isLoading={loading} className="w-full mt-2">
            Accéder au tableau de bord
          </Button>
        </form>

        <div className="pt-4 border-t border-altaj-border text-center">
          <a href="/" className="text-[11px] font-semibold text-altaj-brown hover:text-altaj-dark uppercase">
            ← Retour à la boutique
          </a>
        </div>
      </div>
    </div>
  );
}
