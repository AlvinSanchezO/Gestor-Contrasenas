import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, errors } = useAuth();
  const navigate = useNavigate();

  // Limpia cualquier sesión anterior al entrar a /login (comportamiento original)
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("secretKey");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const success = await login({ email, password });

    if (success) {
      navigate("/inicio", { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#09090b] flex items-center justify-center p-4">
      {/* Decoración de fondo (exactamente igual que antes) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[140px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[900px] h-[900px] bg-purple-600/10 rounded-full blur-[140px] opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#18181b] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Bienvenido</h1>
          <p className="text-gray-400 text-sm">Ingresa tus credenciales</p>
        </div>

        {/* Errores del contexto (mantiene tu estilo rojo original) */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
            {errors[0]}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
              placeholder="correo@ejemplo.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="mt-7 text-center text-gray-400 text-sm">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="text-blue-400 hover:text-blue-300 font-semibold">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;