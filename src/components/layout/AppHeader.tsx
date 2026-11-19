import { useState, useRef, useEffect } from "react";
import type { NavTab } from "@/types/navigation.types";
import {
  HomeIcon,
  ZapIcon,
  SearchIcon2,
  BookIcon,
} from "@/components/icons/NavigationIcons";
import { useAuth } from "@/features/auth";

interface AppHeaderProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenLogin?: () => void;
}

export function AppHeader({ activeTab, onChangeTab, onOpenLogin }: AppHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navTabs: { key: NavTab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
    { key: "home", label: "Início", Icon: HomeIcon },
    { key: "rapida", label: "Análise Rápida", Icon: ZapIcon },
    { key: "aprofundada", label: "Aprofundada", Icon: SearchIcon2 },
    { key: "historico", label: "Histórico", Icon: BookIcon },
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FDFCF9] border-b border-[#DCD5C9] px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-18">
        {/* Brand Lockup */}
        <button
          onClick={() => onChangeTab("home")}
          className="flex items-center gap-3.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-12 h-12 border border-[#DCD5C9] bg-[#F7F5F0] p-1 rounded-sm flex items-center justify-center overflow-hidden transition-all group-hover:border-[#1A1816] shrink-0">
            <img
              src="/logo.jpg"
              alt="Logotipo EntreLinhas"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="font-serif text-[22px] sm:text-[24px] font-semibold text-[#1A1816] tracking-tight leading-none group-hover:text-[#8C2D19] transition-colors">
                EntreLinhas
              </h1>
              <span className="font-mono text-[10px] text-[#8C2D19] uppercase tracking-wider hidden sm:inline">
                Edição Crítica
              </span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#666055] mt-1 hidden xs:block">
              Análise e interpretação textual
            </p>
          </div>
        </button>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navTabs.map(({ key, label, Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => onChangeTab(key)}
                className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  isActive
                    ? "text-[#8C2D19] font-semibold"
                    : "text-[#666055] hover:text-[#1A1816]"
                }`}
              >
                <Icon active={isActive} />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#8C2D19]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Tools & User Section */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-[#666055] px-2.5 py-1 border border-[#DCD5C9] bg-[#F7F5F0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
            <span>OCR · IA CONTEXTUAL</span>
          </div>

          {/* User Auth Info / Profile Button */}
          {isAuthenticated && user && user.provider !== "guest" ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1 border border-transparent hover:border-[#DCD5C9] transition-all cursor-pointer focus:outline-none"
                aria-label="Menu do leitor"
              >
                <div className="relative w-8 h-8 overflow-hidden bg-[#1A1816] text-[#F7F5F0] flex items-center justify-center border border-[#DCD5C9] rounded-sm">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-mono text-xs font-semibold">
                      {getInitials(user.name)}
                    </span>
                  )}
                </div>
              </button>

              {/* Profile Dropdown Popover */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#FDFCF9] border border-[#DCD5C9] shadow-[0_8px_24px_rgba(26,24,22,0.08)] py-3 z-50 text-[#1A1816]">
                  <div className="px-4 py-2 border-b border-[#DCD5C9]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 border border-[#DCD5C9] bg-[#EFECE4] flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold text-[#1A1816]">
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate text-[#1A1816] font-serif">
                          {user.name}
                        </p>
                        <p className="font-mono text-[11px] text-[#666055] truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (onOpenLogin) onOpenLogin();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-mono uppercase tracking-wider text-[#3D3934] hover:bg-[#EFECE4] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Alternar Leitor</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                        if (onOpenLogin) onOpenLogin();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-mono uppercase tracking-wider text-[#8C2D19] hover:bg-[#F6EDE9] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Encerrar Sessão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
              }}
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#F7F5F0] bg-[#1A1816] hover:bg-[#8C2D19] px-4 py-2 transition-colors cursor-pointer border border-[#1A1816]"
            >
              <span>Acessar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
