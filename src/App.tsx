import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// IMPORTA TUS COMPONENTES
import InicioSesion from "./components/login";
import Registro from "./components/registro";
import Inicio from "./components/Inicio";
import ProtectedRoute from "./components/ProtectedRoute"; // Corregí el nombre (typo)

function App() {
  return (
    <AuthProvider>
      <Routes>
        
        {/* --- RUTAS PÚBLICAS --- */}
        
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<InicioSesion />} />
        <Route path="/registro" element={<Registro />} />

        {/* ACTUALMENTE: RUTA ABIERTA (PÚBLICA)
            Cualquiera puede entrar a /inicio sin login
        */}
        <Route path="/inicio" element={<Inicio />} />


        {/* --- RUTAS PROTEGIDAS (COMENTADAS POR AHORA) --- */}
        {/* Cuando quieras proteger la ruta, borra la línea de arriba 
            y descomenta este bloque:
        */}
        
        {/* <Route element={<ProtectedRoute />}>
             <Route path="/inicio" element={<Inicio />} />
        </Route> 
        */}


        {/* --- Manejo de errores (404) --- */}
        {/* Esta siempre va al final */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;