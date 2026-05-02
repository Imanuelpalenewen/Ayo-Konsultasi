import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/auth/Login";
import { RegisterPage } from "./pages/auth/Register";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected: Student only */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <div className="p-8 text-center text-2xl font-semibold text-gray-800">
                Student Dashboard — Coming Soon
              </div>
            </ProtectedRoute>
          }
        />

        {/* Protected: Lecturer only */}
        <Route
          path="/lecturer"
          element={
            <ProtectedRoute allowedRole="lecturer">
              <div className="p-8 text-center text-2xl font-semibold text-gray-800">
                Lecturer Dashboard — Coming Soon
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
