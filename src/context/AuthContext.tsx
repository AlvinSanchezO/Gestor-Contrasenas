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
  login: (user: any) => Promise<void>;
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

  // Variable de entorno (Asegúrate de que en .env sea algo como: http://localhost:3000)
  const ENV_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  // Quitamos la barra final si el usuario la puso por error para evitar //api
  const API_URL = ENV_URL.replace(/\/$/, "");

  // --- LOGIN ---
  const login = async (userData: any) => {
    try {
      console.log("🔵 Intentando login en:", `${API_URL}/api/v1/auth/iniciar`);
      
      const res = await fetch(`${API_URL}/api/v1/auth/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include", // IMPORTANTE: Esto requiere CORS bien configurado en backend
      });

      const data = await res.json();

      if (!res.ok) {
        // Si el backend responde con error (ej. 401, 400)
        setErrors([data.mensaje || "Error al iniciar sesión"]);
        return;
      }

      console.log("✅ Login exitoso:", data);
      setUser(data.user || data); // Ajusta según cómo responda tu backend
      setIsAuthenticated(true);
      setErrors([]);
    } catch (error: any) {
      // Aquí cae si el servidor está apagado o si hay bloqueo de CORS
      console.error("❌ Error de conexión (detalles):", error);
      
      if (error.message === "Failed to fetch") {
        setErrors(["No se pudo conectar al servidor. Revisa si está encendido o si es un error de CORS."]);
      } else {
        setErrors([error.message || "Error de conexión desconocido"]);
      }
    }
  };

  // --- LOGOUT ---
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setErrors([]);
    // Opcional: Fetch al backend para borrar cookie
  };

  // --- VERIFICAR SESIÓN (CHECK LOGIN) ---
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/verify`, {
          method: "GET",
          credentials: "include", // Envía la cookie para verificar
        });

        if (!res.ok) {
          throw new Error("Token inválido o no autenticado");
        }

        const data = await res.json();
        
        // Si backend verifica OK:
        setIsAuthenticated(true);
        setUser(data.user || data); 
        setLoading(false);
      } catch (error) {
        // No hay sesión activa o falló la verificación
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