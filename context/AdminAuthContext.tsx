"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AdminRole } from "@/types";

interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_AUTH_KEY = "altaj_admin_session_v1";

// Valid Admin Credentials
const VALID_CREDENTIALS = [
  { username: "admin", password: "altaj2026", name: "Othmane (Fondateur)", role: "OWNER" as AdminRole },
  { username: "altaj", password: "altaj", name: "Othmane (Fondateur)", role: "OWNER" as AdminRole },
  { username: "admin@altajleather.ma", password: "altaj", name: "Admin ALTAJ", role: "OWNER" as AdminRole },
  { username: "admin", password: "altaj", name: "Admin ALTAJ", role: "OWNER" as AdminRole },
];

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.username) {
          setUser(parsed);
          setIsAuthenticated(true);
        }
      }
    } catch {
      // storage disabled or corrupted
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = (usernameInput: string, passwordInput: string): { success: boolean; error?: string } => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    const matched = VALID_CREDENTIALS.find(
      (c) => c.username.toLowerCase() === cleanUser && c.password === cleanPass
    );

    if (matched) {
      const newUser: AdminUser = {
        id: `adm-${Date.now()}`,
        username: matched.username,
        name: matched.name,
        role: matched.role,
      };
      setUser(newUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(newUser));
      } catch {}
      return { success: true };
    }

    return {
      success: false,
      error: "Nom d'utilisateur ou mot de passe incorrect. (Par défaut: admin / altaj)",
    };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {}
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isReady,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
