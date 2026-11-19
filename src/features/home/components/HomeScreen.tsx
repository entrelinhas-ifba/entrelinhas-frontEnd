import { useRef, useState, useEffect } from "react";
import type { AnalysisMode } from "@/types/analysis.types";
import {
  historyService,
  type RecentSnippetItem,
  type HistoryStats,
} from "@/features/history/services/historyService";
import { recentSnippets as mockSnippets } from "@/services/api/mockData";
import { useAuth } from "@/features/auth";

interface HomeScreenProps {
  mode: AnalysisMode;
  setMode: (m: AnalysisMode) => void;
  onCapture: () => void;
  onSelectImage?: (imageSrc: string) => void;
  onSnippetClick: () => void;
  onViewAllHistory: () => void;
}

export function HomeScreen({
  mode,
  setMode,
  onCapture,
  onSelectImage,
  onSnippetClick,
  onViewAllHistory,
}: HomeScreenProps) {
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [snippets, setSnippets] = useState<RecentSnippetItem[]>([]);
  const [stats, setStats] = useState<HistoryStats>({ paginasEsteMes: 0, palavrasAnalisadas: 0 });
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoadingData(true);
      try {
        const [recentData, statsData, count] = await Promise.all([
          historyService.getRecentSnippets(3),
          historyService.getStats(),
          historyService.getTotalCount(),
        ]);

        if (!isMounted) return;

        if (recentData && recentData.length > 0) {
          setSnippets(recentData);
        } else if (!isAuthenticated) {
          setSnippets(mockSnippets);
        } else {
          setSnippets([]);
        }

        setStats(statsData);
        setTotalCount(count);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const processFile = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string" && onSelectImage) {
        onSelectImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Frontispiece / Editorial Header */}
      <section className="mb-8 border-b border-[#DCD5C9] pb-6 sm:pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#8C2D19]">
              <span>Caderno de Leitura</span>
              <span>—</span>
              <span>{user && user.provider !== "guest" ? user.name : "Leitor Visitante"}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal leading-[1.15] text-[#1A1816] tracking-tight">
              Análise literária e leitura nas <span className="italic font-serif">entrelinhas</span>.
            </h2>
            <p className="mt-3 text-sm sm:text-[15px] text-[#666055] leading-relaxed max-w-xl">
              Digitalize páginas impressas para extrair temas, intenções autorais,
              figuras de linguagem e notas históricas do texto.
            </p>
          </div>

          {/* Monthly Digest Badge */}
          <div className="flex md:flex-col items-baseline md:items-end gap-4 md:gap-1 pt-4 md:pt-0 border-t md:border-t-0 border-[#DCD5C9]">
            <div className="text-left md:text-right">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#666055] block">
                Páginas no Mês
              </span>
              <span className="font-mono text-2xl font-semibold text-[#1A1816]">
                {isLoadingData ? "—" : stats.paginasEsteMes}
              </span>
            </div>
            <div className="text-left md:text-right">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#666055] block">
                Palavras Analisadas
              </span>
              <span className="font-mono text-base font-medium text-[#8C2D19]">
                {isLoadingData ? "—" : stats.palavrasAnalisadas.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Capture Chamber */}
        <div className="md:col-span-5 flex flex-col gap-6">
          {/* Method Selector Tabs */}
          <div className="bg-[#FDFCF9] border border-[#DCD5C9] p-1">
            <div className="grid grid-cols-2 gap-1 font-mono text-xs uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setMode("rapida")}
                className={`py-2.5 px-3 transition-colors text-center cursor-pointer ${
                  mode === "rapida"
                    ? "bg-[#1A1816] text-[#F7F5F0] font-medium"
                    : "text-[#666055] hover:text-[#1A1816] hover:bg-[#EFECE4]"
                }`}
              >
                01. Leitura Rápida
              </button>
              <button
                type="button"
                onClick={() => setMode("aprofundada")}
                className={`py-2.5 px-3 transition-colors text-center cursor-pointer ${
                  mode === "aprofundada"
                    ? "bg-[#1A1816] text-[#F7F5F0] font-medium"
                    : "text-[#666055] hover:text-[#1A1816] hover:bg-[#EFECE4]"
                }`}
              >
                02. Aprofundada
              </button>
            </div>
            <div className="p-3 text-[12px] text-[#666055] leading-relaxed border-t border-[#DCD5C9] mt-1 bg-[#F7F5F0]">
              {mode === "rapida" ? (
                <p>
                  <strong className="text-[#1A1816] font-medium font-mono text-[11px] uppercase tracking-wide block mb-0.5">
                    Modo Rápido
                  </strong>
                  Extração OCR, tema central, intenção preliminar e síntese textual imediata.
                </p>
              ) : (
                <p>
                  <strong className="text-[#1A1816] font-medium font-mono text-[11px] uppercase tracking-wide block mb-0.5">
                    Modo Crítico Aprofundado
                  </strong>
                  Mapeamento de figuras de linguagem, notas contextuais históricas e tradução integral.
                </p>
              )}
            </div>
          </div>

          {/* Capture Workspace */}
          <div className="bg-[#FDFCF9] border border-[#DCD5C9] p-5 sm:p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Droppable Plate */}
            <div
              className={`border border-dashed transition-all p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer ${
                isDragging
                  ? "border-[#8C2D19] bg-[#F6EDE9]"
                  : "border-[#C9C2B5] hover:border-[#1A1816] bg-[#F7F5F0]"
              }`}
              onClick={onCapture}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {/* Sight / Scanner Frame Mark */}
              <div className="w-14 h-14 border border-[#8C2D19] flex items-center justify-center mb-3 bg-[#FDFCF9] relative">
                <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#8C2D19]" />
                <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-[#8C2D19]" />
                <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-[#8C2D19]" />
                <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#8C2D19]" />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8C2D19">
                  <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" strokeWidth="1.6" />
                  <line x1="8" y1="12" x2="16" y2="12" strokeWidth="1.6" />
                  <line x1="12" y1="8" x2="12" y2="16" strokeWidth="1.6" />
                </svg>
              </div>

              <h3 className="font-serif text-lg font-medium text-[#1A1816]">
                Capturar Página Impressa
              </h3>
              <p className="font-mono text-[11px] text-[#666055] mt-1 uppercase tracking-wider">
                Fotografe sob luz uniforme ou solte o arquivo aqui
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={onCapture}
                className="w-full py-3 px-4 bg-[#8C2D19] hover:bg-[#702212] text-[#F7F5F0] font-mono text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Abrir Câmera</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-transparent hover:bg-[#EFECE4] text-[#1A1816] border border-[#DCD5C9] font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                Carregar Imagem da Galeria
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Readings Ledger */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="flex items-baseline justify-between border-b border-[#DCD5C9] pb-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8C2D19] block">
                Arquivo de Leituras
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1A1816]">
                Trechos Analisados
              </h3>
            </div>
            <button
              type="button"
              onClick={onViewAllHistory}
              className="font-mono text-xs text-[#8C2D19] hover:underline uppercase tracking-wider cursor-pointer"
            >
              Consultar Catálogo ({totalCount > 0 ? totalCount : snippets.length}) →
            </button>
          </div>

          {/* Ledger List */}
          {isLoadingData ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 border border-[#DCD5C9] bg-[#FDFCF9] animate-pulse">
                  <div className="h-3 bg-[#EFECE4] w-24 mb-3" />
                  <div className="h-4 bg-[#EFECE4] w-3/4 mb-2" />
                  <div className="h-3 bg-[#EFECE4] w-1/2" />
                </div>
              ))}
            </div>
          ) : snippets.length === 0 ? (
            <div className="p-8 border border-dashed border-[#DCD5C9] bg-[#FDFCF9] text-center">
              <span className="font-mono text-xs uppercase tracking-widest text-[#666055] block mb-1">
                Catálogo Vazio
              </span>
              <p className="font-serif text-base text-[#1A1816]">
                Nenhum trecho literário analisado até o momento.
              </p>
              <p className="text-xs text-[#666055] mt-1 max-w-sm mx-auto">
                Utilize o módulo ao lado para fotografar a primeira página de estudo.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {snippets.map((s, index) => (
                <article
                  key={s.id}
                  onClick={onSnippetClick}
                  className="group p-5 bg-[#FDFCF9] border border-[#DCD5C9] hover:border-[#1A1816] transition-all cursor-pointer text-left relative"
                >
                  {/* Top Meta Line */}
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#666055] mb-2.5">
                    <span className="text-[#8C2D19] font-semibold">
                      Ficha {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex items-center gap-3 uppercase tracking-wider">
                      <span>{s.date}</span>
                      <span>·</span>
                      <span>{s.words} palavras</span>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <blockquote className="font-serif italic text-[15px] sm:text-base text-[#1A1816] leading-relaxed mb-3 pl-3 border-l-2 border-[#8C2D19]">
                    "{s.title}"
                  </blockquote>

                  {/* Footnotes / Intention */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-[#EFECE4] text-xs">
                    <span className="font-mono text-[11px] text-[#666055] uppercase tracking-wide">
                      {s.author}
                    </span>
                    <span className="font-mono text-[11px] text-[#1A1816] bg-[#EFECE4] px-2 py-0.5">
                      {s.intent}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
