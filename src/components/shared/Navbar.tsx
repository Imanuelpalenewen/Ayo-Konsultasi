import { Menu, Bell } from "lucide-react";
import { useCurrentUser } from "../../hooks/useCurrentUser";

interface NavbarProps {
  onOpenSidebar: () => void;
}

export function Navbar({ onOpenSidebar }: NavbarProps) {
  const user = useCurrentUser();

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
          Welcome back, {user?.name?.split(" ")[0] || "User"} 👋
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          {/* Lovable style yellow dot indicator */}
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-yellow-400 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-700">{user?.name || "Loading..."}</span>
            <span className="text-xs text-gray-500 capitalize">{user?.role || "..."}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold border border-purple-200 shadow-inner">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
