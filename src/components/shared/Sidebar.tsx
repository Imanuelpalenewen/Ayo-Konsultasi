import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Clock, User, X, LogOut } from "lucide-react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useAuthActions } from "@convex-dev/auth/react";

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ onClose, className = "" }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { signOut } = useAuthActions();

  const handleLogout = () => {
    void signOut();
    navigate("/login");
  };

  // Links for student
  const studentLinks = [
    { name: "Home", href: "/student", icon: Home },
    { name: "Find Lecturer", href: "/student/find-lecturer", icon: Search },
    { name: "History", href: "/student/history", icon: Clock },
    { name: "Profile", href: "/student/profile", icon: User },
  ];

  // Links for lecturer
  const lecturerLinks = [
    { name: "Home", href: "/lecturer", icon: Home },
    { name: "Schedule", href: "/lecturer/schedule", icon: Clock },
    { name: "Profile", href: "/lecturer/profile", icon: User },
  ];

  const links = user?.role === "student" ? studentLinks : user?.role === "lecturer" ? lecturerLinks : [];

  return (
    <div className={`flex h-full flex-col bg-white border-r border-gray-200 ${className}`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-yellow-500 bg-clip-text text-transparent">
          Ayo Konsultasi
        </span>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {links.map((link) => {
            const isActive = location.pathname === link.href || (location.pathname.startsWith(link.href) && link.href !== "/student" && link.href !== "/lecturer");
            return (
              <li key={link.name}>
                <Link
                  to={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <link.icon className={`w-5 h-5 ${isActive ? "text-purple-600" : "text-gray-400"}`} />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
