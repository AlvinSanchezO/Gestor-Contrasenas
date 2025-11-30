import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  rol?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  errors: string[];
  login: (user: any) => Promise<boolean>; // 👈 AHORA DEVUELVE BOOLEAN
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const login = async (userData: any): Promise<boolean> => {
    try {
      if (!API_URL) {
        setErrors(["Falta VITE_API_URL en .env"]);
        return false;
      }

      const res = await fetch(`${API_URL}/api/v1/auth/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors([data.mensaje || "Error al iniciar sesión"]);
        return false; // ❌ FALLÓ
      }

      setUser(data.user);
      setIsAuthenticated(true);
      setErrors([]);
      return true; // ✅ ÉXITO
    } catch (error) {
      console.error(error);
      setErrors(["Error de conexión"]);
      return false; // ❌ FALLÓ
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // CHECK LOGIN
  useEffect(() => {
    const checkLogin = async () => {
      if (!API_URL) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/verify`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Token inválido");

        const data = await res.json();
        setIsAuthenticated(true);
        setUser(data);
        setLoading(false);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };
    checkLogin();
  }, [API_URL]);

  return (
    <AuthContext.Provider
      value={{ login, logout, user, isAuthenticated, errors, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
