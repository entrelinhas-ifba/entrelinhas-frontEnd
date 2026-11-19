interface DeepAnalysisHubProps {
  onScan: () => void;
}

export function DeepAnalysisHub({ onScan }: DeepAnalysisHubProps) {
  const dimensions = [
    {
      num: "01",
      title: "Tema central e intenção autoral",
      desc: "Mapeamento do propósito discursivo, tom e direcionamento semântico do autor no excerto.",
    },
    {
      num: "02",
      title: "Contexto e referências históricas",
      desc: "Identificação de acontecimentos, períodos, personagens e alusões da época mencionadas no texto.",
    },
    {
      num: "03",
      title: "Figuras de linguagem e recursos expressivos",
      desc: "Detecção do tipo (metáforas, metonímias, paradoxos), extração do trecho e explicação do sentido.",
    },
    {
      num: "04",
      title: "Reconhecimento de idioma e tradução fiel",
      desc: "Tradução integral para o português preservando ritmo, tom de época e nuances estilísticas.",
    },
    {
      num: "05",
      title: "Crítica e construção textual integrada",
      desc: "Avaliação da arquitetura textual, sintaxe, relações semânticas e significados nas entrelinhas.",
    },
  ];

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Editorial Section Header */}
      <div className="mb-8 pb-5 border-b border-[#DCD5C9] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#8C2D19] block mb-1">
            Módulo Analítico · Modalidade 02
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1816]">
            Análise Aprofundada
          </h2>
          <p className="font-sans text-[13px] text-[#5A5348] mt-1 max-w-xl leading-relaxed">
            Exegese crítica completa: contexto histórico, decodificação de figuras de linguagem, tradução e arquitetura textual.
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#7D7567] block">
            Tempo Médio Estimado
          </span>
          <span className="font-mono text-[12px] font-semibold text-[#1A1816]">
            ~45 segundos · Processamento Hermenêutico
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Editorial Action Plate */}
        <div className="md:col-span-6">
          <div className="bg-[#FDFCF9] border border-[#DCD5C9] p-6 sm:p-8 relative">
            {/* Viewfinder Corner Accents */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#8C2D19]" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#8C2D19]" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#8C2D19]" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#8C2D19]" />

            <div className="text-center py-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8C2D19] block mb-2">
                Leitura Crítica Avançada
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1816]">
                Fotografar para Estudo Crítico
              </h3>
              <p className="font-sans text-[13px] text-[#5A5348] mt-2 max-w-sm mx-auto leading-relaxed">
                Ideal para capítulos densos, poemas, textos clássicos ou excertos com referências históricas e estilísticas intrincadas.
              </p>

              <div className="mt-6 pt-5 border-t border-[#EFECE6] flex flex-col items-center gap-3">
                <button
                  onClick={onScan}
                  className="w-full sm:w-auto px-6 py-3 bg-[#8C2D19] hover:bg-[#732414] text-[#F7F5F0] font-mono text-[12px] uppercase tracking-wider font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2.5 shadow-xs"
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
                  <span>Iniciar Captura Crítica</span>
                </button>

                <p className="text-[11px] font-mono text-[#A8A196]">
                  A análise detalhada é catalogada no seu arquivo pessoal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hermeneutic Rubric Dimensions */}
        <div className="md:col-span-6">
          <div className="bg-[#FDFCF9] border border-[#DCD5C9] p-5 sm:p-6">
            <div className="pb-3 mb-3 border-b border-[#DCD5C9] flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#7D7567]">
                Aparato Crítico
              </span>
              <span className="font-mono text-[10px] text-[#8C2D19] font-medium uppercase">
                5 Dimensões Investigativas
              </span>
            </div>

            <div className="divide-y divide-[#EFECE6]">
              {dimensions.map((f) => (
                <div key={f.num} className="py-3 first:pt-1 last:pb-1">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-[11px] font-semibold text-[#8C2D19] mt-0.5 shrink-0">
                      [{f.num}]
                    </span>
                    <div>
                      <p className="font-serif text-[14px] font-bold text-[#1A1816]">
                        {f.title}
                      </p>
                      <p className="font-sans text-[12px] text-[#5A5348] mt-0.5 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}