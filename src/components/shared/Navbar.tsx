import { useLocation, Link, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, HelpCircle } from "lucide-react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useDarkMode } from "../../hooks/useDarkMode";
import { NotificationBell } from "./NotificationBell";
import { GlobalSearch } from "./GlobalSearch";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface NavbarProps {
  onOpenSidebar: () => void;
}

function getBreadcrumb(pathname: string, role: string) {
  const base = role === "student" ? "Mahasiswa" : "Dosen";
  if (pathname.includes("/book")) return `${base} / Booking Konsultasi`;
  if (pathname.includes("/history")) return `${base} / Riwayat`;
  if (pathname.includes("/profile")) return `${base} / Profil`;
  if (pathname.includes("/chat")) return `${base} / Tanya AI`;
  return `${base} / Beranda`;
}

export function Navbar({ onOpenSidebar }: NavbarProps) {
  const user = useCurrentUser();
  const { isDark, toggle } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();
  const breadcrumb = getBreadcrumb(location.pathname, user?.role || "student");

  // Resolve avatar URL (handles both storageId and legacy HTTP URLs)
  const resolvedAvatar = useQuery(
    api.users.resolveStorageUrl,
    user !== undefined ? { storageId: user?.avatarUrl ?? null } : "skip"
  );

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-8 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:block font-medium">
          {breadcrumb}
        </span>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex items-center flex-1 mx-8">
        <GlobalSearch />
      </div>

      {/* Right: Dark Mode + Help + Bell + Avatar */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggle}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={() => navigate("/help")}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Panduan"
          title="Panduan"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <NotificationBell />

        {/* Avatar → clickable to profile, updates instantly when avatar changes */}
        <Link
          to={user?.role === "student" ? "/student/profile" : "/lecturer/profile"}
          className="flex items-center gap-2.5 pl-2 border-l border-gray-100 dark:border-gray-800 ml-1 hover:opacity-80 transition-opacity"
          title="Buka Profil"
        >
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm overflow-hidden">
            {resolvedAvatar ? (
              <img src={resolvedAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
              {user?.name?.split(" ")[0] || "User"}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
              {user?.role === "student" ? "Mahasiswa" : "Dosen"}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
