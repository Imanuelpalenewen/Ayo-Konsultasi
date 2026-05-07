import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export function HelpCenter() {
  const user = useCurrentUser();

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

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={user.role === "student" ? "/student/help" : "/lecturer/help"}
      replace
    />
  );
}
