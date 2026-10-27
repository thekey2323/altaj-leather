"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AdminRole } from "@/types";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, role?: AdminRole) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_AUTH_KEY = "altaj_admin_session_v1";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsAuthenticated(true);
      } else {
        // Provide default logged in session for demo testing
        const defaultUser: AdminUser = {
          id: "adm-1",
          email: "admin@altajleather.ma",
          name: "Othmane (Fondateur)",
          role: "OWNER",
        };
        setUser(defaultUser);
        setIsAuthenticated(true);
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(defaultUser));
      }
    } catch {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string, role: AdminRole = "OWNER") => {
    const newUser: AdminUser = {
      id: `adm-${Date.now()}`,
      email,
      name: email.split("@")[0].toUpperCase(),
      role,
    };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(ADMIN_AUTH_KEY);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated,
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
