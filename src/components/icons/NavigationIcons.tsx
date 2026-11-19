export const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z"
      strokeWidth={active ? "2" : "1.5"}
      strokeLinejoin="round"
    />
    <path d="M9 21V12h6v9" strokeWidth={active ? "2" : "1.5"} strokeLinejoin="round" />
  </svg>
);

export const ZapIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      d="M13 2L3 14h8l-1 8 11-12h-8l1-8z"
      strokeWidth={active ? "2" : "1.5"}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const SearchIcon2 = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="11" cy="11" r="7" strokeWidth={active ? "2" : "1.5"} />
    <path d="M16.5 16.5L21 21" strokeWidth={active ? "2" : "1.5"} strokeLinecap="round" />
    <path d="M8 11h6" strokeWidth={active ? "1.8" : "1.3"} strokeLinecap="round" />
  </svg>
);

export const BookIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      d="M4 19.5A2.5 2.5 0 016.5 17H20"
      strokeWidth={active ? "2" : "1.5"}
      strokeLinecap="round"
    />
    <path
      d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
      strokeWidth={active ? "2" : "1.5"}
      strokeLinejoin="round"
    />
    <path d="M9 7h6M9 11h4" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
