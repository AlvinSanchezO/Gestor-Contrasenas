import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Inicio = () => {
  const { user, logout } = useAuth();

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#09090b] overflow-y-auto text-white font-sans">
      
      {/* Luces de fondo animadas */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[900px] h-[900px] bg-blue-600/30 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[1000px] h-[1000px] bg-purple-600/20 rounded-full blur-[140px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-2xl font-bold">Gestor<span className="text-blue-500">Seguro</span></span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-12">

        <div className="text-center mb-14">
          <h1 className="text-5xl md:text-4xl font-bold mb-4">
            Hola,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              {user?.username || "Usuario"}
            </span>
          </h1>
          <p className="text-xl text-gray-300">Tu bóveda personal está protegida y lista</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {/* Tarjeta 1: Seguridad */}
          <div className="bg-[#18181b]/90 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl hover:border-white/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Estado de Seguridad</h3>
              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-400 mb-6">Cifrado AES-256 activo • Conexión segura</p>
            <div className="flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
              </span>
              <span className="text-green-400 font-semibold">100% Protegido</span>
            </div>
          </div>

          {/* Tarjeta 2: Perfil */}
          <div className="bg-[#18181b]/90 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl">
            <h3 className="text-xl font-bold mb-7 text-gray-300">Tu Perfil</h3>
            <div className="flex items-center gap-5 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-3xl font-bold shadow-2xl shadow-blue-500/40">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-2xl font-bold">{user?.username}</p>
                <p className="text-sm text-gray-500">Cuenta principal</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">{user?.email}</span>
            </div>
          </div>

          {/* Tarjeta 3: Acceso al gestor */}
          <div className="md:col-span-2 xl:col-span-3 bg-gradient-to-r from-blue-600/25 via-purple-600/20 to-pink-600/10 border border-white/10 rounded-3xl p-10 backdrop-blur-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
              <div className="max-w-2xl">
                <h2 className="text-4xl font-bold mb-4">Gestor de Contraseñas</h2>
                <p className="text-lg text-gray-300">
                  Todas tus credenciales guardadas de forma segura y siempre accesibles.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 w-full lg:w-auto">
                {/* BOTÓN 1: Redirige a la lista de contraseñas */}
                <Link
                  to="/PasswordList" 
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-blue-900/50 transition-all hover:scale-105 active:scale-95"
                >
                  Ver Mis Contraseñas
                </Link>

                {/* BOTÓN 2: Redirige al formulario de nueva contraseña */}
                <Link
                  to="/add-password"
                  className="px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
                >
                  + Agregar Nueva
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Inicio;