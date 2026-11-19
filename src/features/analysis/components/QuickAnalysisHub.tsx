import { useEffect, useState } from "react";
import {
  historyService,
  type RecentSnippetItem,
} from "@/features/history/services/historyService";
import { useAuth } from "@/features/auth";
import { recentSnippets as mockSnippets } from "@/services/api/mockData";

interface QuickAnalysisHubProps {
  onScan: () => void;
  onItemClick?: () => void;
}

export function QuickAnalysisHub({ onScan, onItemClick }: QuickAnalysisHubProps) {
  const { isAuthenticated } = useAuth();
  const [snippets, setSnippets] = useState<RecentSnippetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadQuickSnippets() {
      setIsLoading(true);
      try {
        const data = await historyService.getRecentQuickSnippets(3);
        if (!isMounted) return;

        if (data && data.length > 0) {
          setSnippets(data);
        } else if (!isAuthenticated) {
          setSnippets(mockSnippets.slice(0, 2));
        } else {
          setSnippets([]);
        }
      } catch (err) {
        console.error("Erro ao carregar análises rápidas:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadQuickSnippets();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Editorial Section Header */}
      <div className="mb-8 pb-5 border-b border-[#DCD5C9] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#8C2D19] block mb-1">
            Módulo Analítico · Modalidade 01
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1816]">
            Leitura Rápida
          </h2>
          <p className="font-sans text-[13px] text-[#5A5348] mt-1 max-w-xl leading-relaxed">
            Extração tipográfica objetiva, síntese das ideias estruturantes e detecção da intenção discursiva em segundos.
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#7D7567] block">
            Cadência de Processamento
          </span>
          <span className="font-mono text-[12px] font-semibold text-[#1A1816]">
            Fluxo Contínuo · Tesseract & Ollama
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Editorial Action Plate */}
        <div className="md:col-span-6">
          <div className="bg-[#FDFCF9] border border-[#DCD5C9] p-6 sm:p-8 relative">
            {/* Viewfinder Crop Marks */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#1A1816]" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#1A1816]" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#1A1816]" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#1A1816]" />

            <div className="text-center py-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#7D7567] block mb-2">
                Entrada Óptica de Texto
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1816]">
                Fotografar Página Impressa
              </h3>
              <p className="font-sans text-[13px] text-[#5A5348] mt-2 max-w-sm mx-auto leading-relaxed">
                Aponte a câmera para qualquer parágrafo de prosa ou ensaio para decodificar e resumir o texto imediatamente.
              </p>

              <div className="mt-6 pt-5 border-t border-[#EFECE6] flex flex-col items-center gap-3">
                <button
                  onClick={onScan}
                  className="w-full sm:w-auto px-6 py-3 bg-[#1A1816] hover:bg-[#2D2A26] text-[#F7F5F0] font-mono text-[12px] uppercase tracking-wider font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2.5 shadow-xs"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m12-16h-2a2 2 0 00-2 2v0m4 12v-2a2 2 0 00-2-2h0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Abrir Câmera de Leitura</span>
                </button>

                <p className="text-[11px] font-mono text-[#A8A196]">
                  Permite carregar imagens salvas na galeria
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Quick Analysis Registry */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#DCD5C9]">
            <h3 className="font-serif text-base font-bold text-[#1A1816]">
              Fichas Recentes no Arquivo
            </h3>
            {snippets.length > 0 && (
              <span className="font-mono text-[10px] uppercase text-[#7D7567]">
                {snippets.length} registro(s)
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-[#FDFCF9] border border-[#DCD5C9] p-4 animate-pulse">
                  <div className="h-3 bg-[#EFECE6] w-1/3 mb-2" />
                  <div className="h-4 bg-[#EFECE6] w-3/4 mb-3" />
                  <div className="h-2.5 bg-[#EFECE6] w-1/4" />
                </div>
              ))}
            </div>
          ) : snippets.length === 0 ? (
            <div className="bg-[#FDFCF9] border border-dashed border-[#DCD5C9] p-7 text-center">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#7D7567] block mb-1">
                Arquivo Vazio
              </span>
              <p className="font-serif text-base font-semibold text-[#1A1816]">
                Nenhuma leitura rápida registrada
              </p>
              <p className="text-[12px] text-[#5A5348] mt-1.5 max-w-xs mx-auto leading-relaxed">
                Fotografe um excerto usando a placa de leitura ao lado para gerar sua primeira ficha analítica.
              </p>
            </div>
          ) : (
            snippets.map((s, idx) => (
              <div
                key={s.id}
                onClick={onItemClick}
                className={`bg-[#FDFCF9] border border-[#DCD5C9] p-4 sm:p-5 transition-colors ${
                  onItemClick ? "hover:border-[#8C2D19] cursor-pointer" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#8C2D19] block">
                      Ficha {String(idx + 1).padStart(2, "0")} · {s.author}
                    </span>
                    <p className="font-serif text-[15px] font-semibold text-[#1A1816] mt-0.5 line-clamp-2 leading-snug">
                      "{s.title}"
                    </p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#EFECE6] text-[#1A1816] border border-[#DCD5C9] shrink-0">
                    Rápida
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-[#EFECE6] text-[11px] font-mono text-[#7D7567]">
                  <span>{s.date}</span>
                  <span>·</span>
                  <span className="text-[#8C2D19] font-medium uppercase truncate max-w-[150px]">
                    {s.intent}
                  </span>
                  <span>·</span>
                  <span>{s.words} palavras</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}