import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// 🔹 1. Configuración de la URL (Con fallback a localhost:3000 para pruebas seguras)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Registro = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Usamos estado local para errores para capturar la respuesta exacta del backend
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    // Validaciones locales
    if (password !== confirmPassword) {
      setLocalError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // 🔹 2. Petición directa al Backend para asegurar la conexión
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Enviamos los datos limpios (trim)
        body: JSON.stringify({ 
          username: username.trim(), 
          email: email.trim(), 
          password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        // 🔹 3. Capturar mensaje de error del backend (data.message o data.error)
        setLocalError(data.message || data.error || "Error al registrar usuario");
      }

    } catch (err) {
      console.error(err);
      setLocalError("No se pudo conectar con el servidor. Revisa que el backend esté corriendo en el puerto 3000.");
    } finally {
      setLoading(false);
    }
  };

  // === PANTALLA DE ÉXITO (ESTILO INTACTO) ===
  if (isSuccess) {
    return (
      <div className="fixed inset-0 w-full h-screen bg-[#09090b] overflow-hidden flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[140px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[900px] h-[900px] bg-purple-600/20 rounded-full blur-[140px] animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 w-full max-w-sm bg-[#18181b]/90 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 mb-5">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Listo!</h2>
          <p className="text-gray-400 text-sm mb-8">Tu cuenta ha sido creada con éxito.</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // === FORMULARIO DE REGISTRO (ESTILO INTACTO) ===
  return (
    <div className="fixed inset-0 w-full h-screen bg-[#09090b] overflow-hidden flex items-center justify-center px-4">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[900px] h-[900px] bg-purple-600/20 rounded-full blur-[140px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm bg-[#18181b]/90 border border-white/10 rounded-3xl p-7 shadow-2xl backdrop-blur-2xl">

        <div className="flex flex-col items-center text-center mb-7">
          <div className="h-12 w-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 mb-3">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
          <p className="text-gray-400 text-xs mt-1">Rellena los datos para comenzar</p>
        </div>

        {/* Mostramos el error local (que viene del backend o validación) */}
        {localError && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de usuario"
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            required
            disabled={loading}
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            required
            disabled={loading}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            required
            disabled={loading}
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar contraseña"
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-xs">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Registro;