import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/auth/Login";
import { RegisterPage } from "./pages/auth/Register";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { StudentDashboard } from "./pages/dashboard/StudentDashboard";
import { LecturerDashboard } from "./pages/dashboard/LecturerDashboard";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { FindLecturer } from "./pages/consultation/FindLecturer";
import { BookingPage } from "./pages/consultation/BookingPage";
import { HistoryPage } from "./pages/consultation/History";
import { AIChatPage } from "./pages/chat/AIChatPage";
import { NotFoundPage, ServerErrorPage, ForbiddenPage } from "./pages/errors/ErrorPage";

import { ErrorBoundary } from "./components/shared/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
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
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRole="student">
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/find-lecturer"
          element={
            <ProtectedRoute allowedRole="student">
              <FindLecturer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/book"
          element={
            <ProtectedRoute allowedRole="student">
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/history"
          element={
            <ProtectedRoute allowedRole="student">
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/chat"
          element={
            <ProtectedRoute allowedRole="student">
              <AIChatPage />
            </ProtectedRoute>
          }
        />

        {/* Protected: Lecturer only */}
        <Route
          path="/lecturer"
          element={
            <ProtectedRoute allowedRole="lecturer">
              <LecturerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/profile"
          element={
            <ProtectedRoute allowedRole="lecturer">
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/history"
          element={
            <ProtectedRoute allowedRole="lecturer">
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/chat"
          element={
            <ProtectedRoute allowedRole="lecturer">
              <AIChatPage />
            </ProtectedRoute>
          }
        />

        {/* Error routes */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        {/* Catch-all → 404 */}
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
