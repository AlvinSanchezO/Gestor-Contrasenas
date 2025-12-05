import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface FormState {
  service: string;
  username: string;
  password: string;
}

const AddPassword: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormState>({
    service: "",
    username: "",
    password: ""
  });

  const API_URL = import.meta.env.VITE_API_URL as string;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // AQUÍ CONECTAS EL ENDPOINT (POST /credentials)
        // Necesitas ver si tu API también requiere x-secret-key para encriptar
        // o si envía los datos planos.
        
        // const response = await fetch(`${API_URL}/credentials`, { ... });
        
        console.log("Guardando:", formData);
        
        setTimeout(() => {
            alert("Guardado (Simulación)");
            navigate("/passwords");
        }, 1000);

    } catch (error) {
        console.error(error);
        alert("Error al guardar");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#09090b] overflow-y-auto text-white font-sans">
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[900px] h-[900px] bg-blue-600/30 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[1000px] h-[1000px] bg-purple-600/20 rounded-full blur-[140px] animate-pulse delay-1000"></div>
      </div>

      <nav className="relative z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-between">
          <Link to="/inicio" className="flex items-center gap-4 hover:opacity-80 transition">
             <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
             </div>
             <span className="text-xl font-bold">Gestor<span className="text-blue-500">Seguro</span></span>
          </Link>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition">Cerrar Sesión</button>
        </div>
      </nav>

      <main className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
        
        <div className="w-full max-w-lg bg-[#18181b]/90 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-2xl shadow-2xl">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Nueva Credencial</h2>
                <p className="text-gray-400">Añade un nuevo servicio a tu bóveda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Nombre del Servicio</label>
                    <input 
                        type="text" 
                        name="service"
                        required
                        placeholder="Ej. Netflix"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Usuario / Email</label>
                    <input 
                        type="text" 
                        name="username"
                        required
                        placeholder="tu@correo.com"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Contraseña</label>
                    <input 
                        type="text" 
                        name="password"
                        required
                        placeholder="Escribe la contraseña..."
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-all font-mono"
                    />
                </div>

                <div className="pt-4 flex gap-4">
                    <Link to="/passwords" className="w-1/3 py-3.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-center font-medium transition">
                        Cancelar
                    </Link>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-2/3 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                    >
                        {loading ? "Guardando..." : "Guardar Credencial"}
                    </button>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
};

export default AddPassword;