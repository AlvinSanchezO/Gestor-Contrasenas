import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// COMPONENTES
//import Dashboard from "./components/Dashboard";
import InicioSesion from "./components/Login";
import Registro from "./components/Registro";
import Inicio from "./components/inicio";
import ProtectedRoute from "./components/ProtectedRoute";
import PasswordList from "./components/PasswordList";
import AddPassword from "./components/AddPassword";
function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<InicioSesion />} />
        <Route path="/registro" element={<Registro />} />

        {/* --- RUTAS PROTEGIDAS --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/inicio" element={<Inicio />} />
        </Route>

          <Route element={<ProtectedRoute />}>
          <Route path="/PasswordList" element={<PasswordList />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/add-password" element={<AddPassword />} />
        </Route>

        {/* --- 404 --- */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;
