import type { NavTab } from "@/types/navigation.types";
import {
  HomeIcon,
  ZapIcon,
  SearchIcon2,
  BookIcon,
} from "@/components/icons/NavigationIcons";

interface BottomNavProps {
  active: NavTab;
  onChange: (t: NavTab) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  const tabs: { key: NavTab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
    { key: "home", label: "Início", Icon: HomeIcon },
    { key: "rapida", label: "Rápida", Icon: ZapIcon },
    { key: "aprofundada", label: "Profunda", Icon: SearchIcon2 },
    { key: "historico", label: "Histórico", Icon: BookIcon },
  ];

  return (
    <nav
      aria-label="Navegação móvel"
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden flex items-center border-t border-[#DCD5C9] bg-[#FDFCF9] px-2 py-1.5 shadow-[0_-2px_10px_rgba(26,24,22,0.04)]"
    >
      {tabs.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 flex flex-col items-center py-1.5 gap-1 transition-colors cursor-pointer ${
              isActive ? "text-[#8C2D19]" : "text-[#666055] hover:text-[#1A1816]"
            }`}
          >
            <Icon active={isActive} />
            <span
              className={`text-[10px] tracking-wider uppercase font-mono ${
                isActive ? "font-semibold text-[#8C2D19]" : "font-normal text-[#666055]"
              }`}
            >
              {label}
            </span>
            {isActive && <span className="w-1 h-1 rounded-full bg-[#8C2D19]" />}
          </button>
        );
      })}
    </nav>
  );
}
