import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, Users, BookOpen, X, ArrowRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";

interface SearchResult {
  id: string;
  type: "consultation" | "lecturer" | "page";
  title: string;
  subtitle?: string;
  href: string;
  icon: typeof Clock;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useCurrentUser();

  // Always call hooks unconditionally (React rules), filter by role in logic
  const studentHistory = useQuery(api.consultations.getStudentHistory);
  const lecturerRequests = useQuery(api.consultations.getLecturerRequests);
  const lecturers = useQuery(api.users.getLecturers);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildResults = useCallback((): SearchResult[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Static page shortcuts
    const pages = user?.role === "student"
      ? [
          { title: "Beranda", href: "/student", subtitle: "Dashboard mahasiswa" },
          { title: "Booking Konsultasi", href: "/student/book", subtitle: "Cari dosen dengan AI & buat jadwal" },
          { title: "Detail Konsultasi", href: "/student/booking-confirmation", subtitle: "Lihat status dan detail konsultasi aktif" },
          { title: "Riwayat", href: "/student/history", subtitle: "Histori konsultasi" },
          { title: "Tanya AI", href: "/student/chat", subtitle: "Chat dengan asisten UNKLAB" },
          { title: "Profil", href: "/student/profile", subtitle: "Pengaturan akun" },
        ]
      : [
          { title: "Beranda", href: "/lecturer", subtitle: "Dashboard dosen" },
          { title: "Riwayat", href: "/lecturer/history", subtitle: "Permintaan konsultasi" },
          { title: "Profil", href: "/lecturer/profile", subtitle: "Pengaturan akun" },
        ];

    pages.forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)) {
        results.push({ id: p.href, type: "page", title: p.title, subtitle: p.subtitle, href: p.href, icon: BookOpen });
      }
    });

    // Search consultations
    const consultations = studentHistory ?? lecturerRequests ?? [];
    consultations.forEach((c: any) => {
      if (
        c.topic?.toLowerCase().includes(q) ||
        c.lecturer?.name?.toLowerCase().includes(q) ||
        c.student?.name?.toLowerCase().includes(q)
      ) {
        const counterpart = user?.role === "student" ? c.lecturer?.name : c.student?.name;
        results.push({
          id: c._id,
          type: "consultation",
          title: c.topic || "Konsultasi",
          subtitle: `${counterpart || "—"} · ${c.date} ${c.time}`,
          href: user?.role === "student" ? "/student/history" : "/lecturer/history",
          icon: Clock,
        });
      }
    });

    // Search lecturers (student only)
    if (user?.role === "student" && lecturers) {
      lecturers.forEach((l: any) => {
        if (
          l.name?.toLowerCase().includes(q) ||
          l.expertise?.some((e: string) => e.toLowerCase().includes(q))
        ) {
          results.push({
            id: l.userId,
            type: "lecturer",
            title: l.name,
            subtitle: l.expertise?.join(", ") || "Dosen",
            href: `/student/book?lecturerId=${l.userId}`,
            icon: Users,
          });
        }
      });
    }

    return results.slice(0, 8);
  }, [query, studentHistory, lecturerRequests, lecturers, user]);

  const results = buildResults();

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIdx]) {
      navigate(results[selectedIdx].href);
      setIsOpen(false);
      setQuery("");
    }
  };

  const typeLabel: Record<string, string> = {
    consultation: "Konsultasi",
    lecturer: "Dosen",
    page: "Menu",
  };

  const typeColor: Record<string, string> = {
    consultation: "bg-blue-50 text-blue-600",
    lecturer: "bg-green-50 text-green-700",
    page: "bg-gray-50 text-gray-500",
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyNav}
          placeholder="Cari permintaan, dosen..."
          className="w-full pl-9 pr-14 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        {/* Keyboard hint */}
        {!query && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 hidden md:block">
            ⌃K
          </span>
        )}
        {/* Clear button */}
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-200 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {results.length === 0 ? (
            <div className="flex flex-col items-center py-10 px-4 text-center">
              <Search className="w-8 h-8 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">Tidak ditemukan</p>
              <p className="text-xs text-gray-400 mt-0.5">Coba kata kunci lain</p>
            </div>
          ) : (
            <ul className="py-2">
              {results.map((result, idx) => {
                const Icon = result.icon;
                return (
                  <li key={result.id + idx}>
                    <button
                      onMouseEnter={() => setSelectedIdx(idx)}
                      onClick={() => {
                        navigate(result.href);
                        setIsOpen(false);
                        setQuery("");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        idx === selectedIdx
                          ? "bg-gray-50 dark:bg-gray-800"
                          : "hover:bg-gray-50/60 dark:hover:bg-gray-800/60"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColor[result.type]}`}>
                          {typeLabel[result.type]}
                        </span>
                        {idx === selectedIdx && <ArrowRight className="w-3.5 h-3.5 text-gray-400" />}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Footer hint */}
          <div className="px-4 py-2.5 border-t border-gray-50 dark:border-gray-800 flex items-center gap-3 text-[10px] text-gray-400">
            <span><kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded">↑↓</kbd> navigasi</span>
            <span><kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Enter</kbd> buka</span>
            <span><kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Esc</kbd> tutup</span>
          </div>
        </div>
      )}
    </div>
  );
}
