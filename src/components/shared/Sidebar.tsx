import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Clock, User, X, LogOut, Calendar, Sparkles, MessageCircle } from "lucide-react";
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
    { name: "Beranda", href: "/student", icon: Home },
    { name: "Rekomendasi AI", href: "/student/find-lecturer", icon: Sparkles },
    { name: "Booking Konsultasi", href: "/student/book", icon: Calendar },
    { name: "Riwayat", href: "/student/history", icon: Clock },
    { name: "Tanya AI", href: "/student/chat", icon: MessageCircle },
    { name: "Profil", href: "/student/profile", icon: User },
  ];

  // Links for lecturer
  const lecturerLinks = [
    { name: "Beranda", href: "/lecturer", icon: Home },
    { name: "Riwayat", href: "/lecturer/history", icon: Clock },
    { name: "Tanya AI", href: "/lecturer/chat", icon: MessageCircle },
    { name: "Profil", href: "/lecturer/profile", icon: User },
  ];

  const links = user?.role === "student" ? studentLinks : user?.role === "lecturer" ? lecturerLinks : [];

  return (
    <div className={`flex h-full flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-colors ${className}`}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-sm">AK</span>
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900 dark:text-white leading-none block">Ayo Konsultasi</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">FILKOM UNKLAB</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Section label */}
      <div className="px-5 pt-4 pb-1">
        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest">Workspace</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-1">
        <ul className="space-y-0.5 px-3">
          {links.map((link) => {
            const isActive = location.pathname === link.href || (location.pathname.startsWith(link.href) && link.href !== "/student" && link.href !== "/lecturer");
            return (
              <li key={link.name}>
                <Link
                  to={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm ${
                    isActive
                      ? "bg-primary/8 text-yellow-800 dark:text-primary font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
                  }`}
                  style={isActive ? { backgroundColor: 'rgb(234 179 8 / 0.08)' } : undefined}
                >
                  <link.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-primary" : "text-gray-400 dark:text-gray-500"}`} />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Keluar
        </button>
      </div>
    </div>
  );
}
