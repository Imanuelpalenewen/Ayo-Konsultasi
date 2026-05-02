import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, only users with this role can access the route */
  allowedRole?: "student" | "lecturer";
}

/**
 * Wraps a route to require authentication.
 *
 * Behaviour:
 * - Loading → show a subtle full-screen spinner
 * - Not authenticated → redirect to /login
 * - Wrong role → redirect to the correct dashboard
 * - Correct role → render children
 *
 * Pressman traceability: US-01, US-02
 */
export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const user = useCurrentUser();

  // Still loading — don't flash a redirect
  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin"
          role="status"
          aria-label="Loading..."
        />
      </div>
    );
  }

  // Not logged in → go to login
  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === "student" ? "/student" : "/lecturer"} replace />;
  }

  return <>{children}</>;
}
