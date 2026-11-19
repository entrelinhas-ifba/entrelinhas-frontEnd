import { useEffect, useState } from "react";
import { historyService } from "@/features/history/services/historyService";

export type Historico = {
  id: string;
  tipo: "SIMPLES" | "PROFUNDA";
  data: string;
  resumo: string;
  imagem?: string;
};

type Filter = "TODOS" | "SIMPLES" | "PROFUNDA";

export function HistoryList({ onItemClick }: { onItemClick: (id: string) => void }) {
  const [historicos, setHistoricos] = useState<Historico[]>([]);
  const [filter, setFilter] = useState<Filter>("TODOS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    historyService
      .getHistoryItems()
      .then((data) => {
        setHistoricos(data as unknown as Historico[]);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setError(e.message ?? "Erro desconhecido");
        setLoading(false);
      });
  }, []);

  const filtered = historicos.filter((h) => {
    if (filter === "TODOS") return true;
    return h.tipo === filter;
  });

  if (loading) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-3">
        <div className="h-6 bg-[#EFECE6] w-48 mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-[#FDFCF9] border border-[#DCD5C9] p-4 animate-pulse">
            <div className="h-4 bg-[#EFECE6] w-1/3 mb-2" />
            <div className="h-3 bg-[#EFECE6] w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        <div className="p-4 bg-[#FAF0ED] border-l-2 border-[#8C2D19] text-[#8C2D19] text-[13px]">
          Falha ao consultar o arquivo histórico: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Editorial Section Header */}
      <div className="mb-6 pb-5 border-b border-[#DCD5C9] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#8C2D19] block mb-1">
            Arquivo Permanente
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1816]">
            Histórico de Leituras
          </h2>
          <p className="font-sans text-[13px] text-[#5A5348] mt-1 max-w-xl leading-relaxed">
            Catálogo completo de páginas digitalizadas, fichas interpretativas e estudos críticos salvos.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#7D7567] block">
            Total de Fichas
          </span>
          <span className="font-mono text-[13px] font-semibold text-[#1A1816]">
            {historicos.length} exemplar(es)
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "TODOS", label: "Todas as Fichas" },
          { key: "SIMPLES", label: "Leitura Rápida" },
          { key: "PROFUNDA", label: "Análise Aprofundada" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as Filter)}
            className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider border transition-colors cursor-pointer ${
              filter === f.key
                ? "bg-[#1A1816] text-[#F7F5F0] border-[#1A1816] font-semibold"
                : "bg-[#FDFCF9] text-[#5A5348] border-[#DCD5C9] hover:bg-[#EFECE6]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-[#FDFCF9] border border-dashed border-[#DCD5C9] p-8 sm:p-12 text-center my-4">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#7D7567] block mb-1">
            Catálogo Vazio
          </span>
          <p className="font-serif text-lg font-bold text-[#1A1816]">
            Nenhum registro localizado neste filtro
          </p>
          <p className="font-sans text-[13px] text-[#5A5348] mt-1.5 max-w-sm mx-auto leading-relaxed">
            Realize uma leitura rápida ou estudo aprofundado para compor este acervo.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((h, idx) => {
            const dateObj = new Date(h.data);
            const dateStr = !isNaN(dateObj.getTime())
              ? `${dateObj.toLocaleDateString("pt-BR")} · ${dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
              : h.data;

            return (
              <button
                key={h.id}
                onClick={() => onItemClick(h.id)}
                className="w-full text-left p-4 sm:p-5 bg-[#FDFCF9] border border-[#DCD5C9] hover:border-[#8C2D19] transition-colors flex items-start gap-4 cursor-pointer group"
              >
                {h.imagem && (
                  <div className="w-14 h-16 sm:w-16 sm:h-20 border border-[#DCD5C9] bg-[#FAF9F5] p-1 shrink-0 overflow-hidden">
                    <img
                      src={h.imagem}
                      alt="Fac-símile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#7D7567]">
                      Ficha {String(idx + 1).padStart(3, "0")} · {dateStr}
                    </span>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                        h.tipo === "SIMPLES"
                          ? "bg-[#FAF9F5] text-[#1A1816] border-[#DCD5C9]"
                          : "bg-[#FAF0ED] text-[#8C2D19] border-[#8C2D19]/40 font-semibold"
                      }`}
                    >
                      {h.tipo === "SIMPLES" ? "Rápida" : "Aprofundada"}
                    </span>
                  </div>

                  <p className="font-serif text-[15px] sm:text-[16px] text-[#1A1816] line-clamp-2 leading-snug group-hover:text-[#8C2D19] transition-colors">
                    "{h.resumo}"
                  </p>

                  <div className="mt-2 text-[11px] font-mono text-[#7D7567] flex items-center gap-2">
                    <span>Exibir detalhes da ficha</span>
                    <span>→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}