import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/auth/Login";
import { RegisterPage } from "./pages/auth/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Stub routes for dashboards */}
        <Route path="/student" element={<div className="p-8 text-center text-2xl font-semibold">Student Dashboard (Stub)</div>} />
        <Route path="/lecturer" element={<div className="p-8 text-center text-2xl font-semibold">Lecturer Dashboard (Stub)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
