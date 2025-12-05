// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Mientras verifica token
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white">
        Cargando...
      </div>
    );
  }

  // Si NO está autenticado → redirigir a /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado → mostrar la ruta protegida
  return <Outlet />;
};

export default ProtectedRoute;
