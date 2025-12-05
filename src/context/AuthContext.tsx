import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
  id?: string;
  username?: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  errors: string[];
  login: (userData: { email: string; password: string }) => Promise<boolean>;
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

  // Fallback seguro si no existe la variable de entorno
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // --- HELPER: DECODIFICAR JWT (Para leer datos del usuario sin librería externa) ---
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error al decodificar token:", e);
      return null;
    }
  };

  // --- FUNCIÓN DE LOGIN ---
  const login = async (userData: { email: string; password: string }): Promise<boolean> => {
    try {
      // 1. Limpiar URL y construir endpoint
      const baseUrl = API_URL.replace(/\/$/, ""); 
      const url = `${baseUrl}/api/auth/login`;

      console.log("📡 [Auth] Intentando login en:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      console.log("📡 [Auth] Estado respuesta:", res.status);

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || data.message || "Error al iniciar sesión";
        console.warn("❌ [Auth] Login falló:", msg);
        setErrors([msg]);
        return false;
      }

      // 2. Guardar Token
      localStorage.setItem("token", data.token);
      
      // 3. Decodificar Token para obtener datos reales del usuario
      const decodedUser = parseJwt(data.token);
      console.log("✅ [Auth] Login exitoso. Usuario detectado:", decodedUser);

      // 4. Actualizar estado con datos reales del token (backend)
      setUser({ 
        id: decodedUser?.id,
        email: decodedUser?.email || userData.email,
        username: decodedUser?.email?.split('@')[0] // Generar un username temporal basado en el email
      }); 
      
      setIsAuthenticated(true);
      setErrors([]);
      
      return true; 
    } catch (error) {
      console.error("❌ [Auth] Error de conexión:", error);
      setErrors(["No se pudo conectar con el servidor"]);
      return false;
    }
  };

  const logout = () => {
    console.log("👋 [Auth] Cerrando sesión...");
    localStorage.removeItem("token");
    localStorage.removeItem("secretKey");
    setUser(null);
    setIsAuthenticated(false);
  };

  // --- VERIFICAR SESIÓN AL CARGAR (Persistencia) ---
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      
      if (token) {
        const decodedUser = parseJwt(token);
        
        // Verificamos si el token tiene estructura válida (ej. tiene expiración 'exp')
        if (decodedUser && decodedUser.exp * 1000 > Date.now()) {
            console.log("🔄 [Auth] Sesión restaurada para:", decodedUser.email);
            setIsAuthenticated(true);
            setUser({ 
                id: decodedUser.id,
                email: decodedUser.email,
                username: decodedUser.email.split('@')[0]
            }); 
        } else {
            console.warn("⚠️ [Auth] Token expirado o inválido. Cerrando sesión.");
            logout();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };
    
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{ login, logout, user, isAuthenticated, errors, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;