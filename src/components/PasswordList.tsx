import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Definimos la forma de los datos que vienen de tu API
interface Credential {
  id?: number | string;
  _id?: string; // Por si usas MongoDB
  name?: string;
  service?: string;
  username?: string;
  email?: string;
  password?: string;
}

const PasswordList: React.FC = () => {
  const { logout } = useAuth();
  
  // Estados tipados
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  // Clave Maestra
  const [masterKey, setMasterKey] = useState<string>("");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  // UI
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string | number, boolean>>({});

  // Variable de entorno en Vite + TS
  const API_URL = import.meta.env.VITE_API_URL as string;

  const fetchCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!masterKey.trim()) {
        setError("Por favor ingresa tu Clave Maestra");
        return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-secret-key': masterKey, // Header requerido
          // 'Authorization': `Bearer ${token}` // Si fuera necesario
        }
      });

      if (!response.ok) {
        if (response.status === 400) throw new Error("Falta la clave maestra o es incorrecta.");
        if (response.status === 401) throw new Error("No autorizado.");
        throw new Error("Error al obtener las credenciales.");
      }

      const data = await response.json();
      // Asegúrate de mapear esto a data o data.data según tu backend
      setCredentials(data); 
      setIsUnlocked(true);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (id: string | number) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Contraseña copiada");
  };

  const filteredCredentials = credentials.filter(item => {
    const name = item.name || item.service || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#09090b] overflow-y-auto text-white font-sans">
      
      {/* Fondo Animado */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[900px] h-[900px] bg-blue-600/30 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[1000px] h-[1000px] bg-purple-600/20 rounded-full blur-[140px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-between">
          <Link to="/inicio" className="flex items-center gap-4 hover:opacity-80 transition">
            <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
            </div>
            <span className="text-xl font-bold hidden sm:block">Gestor<span className="text-blue-500">Seguro</span></span>
          </Link>
          <div className="flex gap-4">
             {isUnlocked && (
               <Link to="/add-password" className="hidden md:flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition font-medium">
                  + Nueva
               </Link>
             )}
             <button onClick={logout} className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition text-sm font-medium">
               Salir
             </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-12 flex flex-col items-center min-h-[80vh]">
        
        {/* --- VISTA BLOQUEADA --- */}
        {!isUnlocked && (
           <div className="w-full max-w-md mt-10 animate-fade-in-up">
              <div className="bg-[#18181b]/90 border border-white/10 rounded-3xl p-10 backdrop-blur-2xl shadow-2xl text-center">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                      <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-2">Bóveda Cifrada</h2>
                  <p className="text-gray-400 mb-8">Ingresa tu Clave Maestra para descifrar.</p>

                  <form onSubmit={fetchCredentials} className="space-y-4">
                      <input 
                          type="password" 
                          placeholder="Clave Maestra"
                          value={masterKey}
                          onChange={(e) => setMasterKey(e.target.value)}
                          className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all placeholder:text-gray-600"
                          autoFocus
                      />
                      {error && <p className="text-red-400 text-sm bg-red-500/10 py-2 px-4 rounded-lg">{error}</p>}

                      <button 
                          type="submit"
                          disabled={loading}
                          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                      >
                          {loading ? "Descifrando..." : "Acceder"}
                      </button>
                  </form>
              </div>
           </div>
        )}

        {/* --- VISTA DESBLOQUEADA --- */}
        {isUnlocked && (
          <div className="w-full animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Mis Credenciales</h1>
                    <p className="text-gray-400">{credentials.length} contraseñas almacenadas</p>
                </div>
                <div className="w-full md:w-96 relative">
                    <input 
                        type="text" 
                        placeholder="Buscar..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#18181b]/80 border border-white/10 rounded-2xl focus:border-blue-500/50 outline-none transition-all text-white backdrop-blur-md"
                    />
                    <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                <Link to="/add-password" className="border border-dashed border-white/20 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-600/5 transition-all group min-h-[220px]">
                    <div className="w-14 h-14 rounded-full bg-white/5 group-hover:bg-blue-600/20 flex items-center justify-center transition-colors">
                        <svg className="w-7 h-7 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="font-medium">Agregar Nueva</span>
                </Link>

                {filteredCredentials.map((item) => {
                    const id = item.id || item._id || "unknown";
                    return (
                        <div key={id} className="bg-[#18181b]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl hover:border-white/20 transition-all group relative">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                                        {(item.name || item.service || "S").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-lg truncate w-full">{item.name || item.service}</h3>
                                        <p className="text-xs text-gray-400 truncate">{item.username || item.email || "Sin usuario"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-black/40 rounded-xl p-3 flex items-center justify-between border border-white/5 mb-4 group-hover:border-white/10 transition-colors">
                                <div className="font-mono text-gray-300 truncate mr-3 text-sm">
                                    {visiblePasswords[id] ? (item.password || "No disponible") : "••••••••••••••"}
                                </div>
                                <button onClick={() => toggleVisibility(id)} className="text-gray-500 hover:text-white transition p-1">
                                    {visiblePasswords[id] ? (
                                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>

                            <button onClick={() => copyToClipboard(item.password)} className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition flex items-center justify-center gap-2 border border-white/5 hover:border-white/20">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                Copiar
                            </button>
                        </div>
                    );
                })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PasswordList;