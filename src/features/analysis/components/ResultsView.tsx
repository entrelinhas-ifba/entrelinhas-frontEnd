import { useState, useEffect } from "react";
import type { AnalysisMode, ResultTab } from "@/types/analysis.types";
import { useAnalysis } from "../hooks/useAnalysis";

interface ResultsViewProps {
  mode: AnalysisMode;
  onBack: () => void;
  imageSrc?: string | null;
}

export function ResultsView({ mode, onBack, imageSrc }: ResultsViewProps) {
  const {
    analysis,
    isLoading,
    isBackendOffline,
    executeImageAnalysis,
    executeCorrection,
    executeCleaning,
  } = useAnalysis();

  const [tab, setTab] = useState<ResultTab>("digitalizado");
  const [viewMode, setViewMode] = useState<"texto" | "imagem">("texto");
  const [expandedSection, setExpandedSection] = useState<string | null>("Período Histórico");
  const [showTranslation, setShowTranslation] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edição de texto e ações de IA
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(analysis.extractedText);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  // Executa a análise real pelo backend quando uma imagem for fornecida
  useEffect(() => {
    if (imageSrc) {
      executeImageAnalysis(imageSrc, mode);
    }
  }, [imageSrc, mode, executeImageAnalysis]);

  useEffect(() => {
    setCurrentText(analysis.extractedText);
  }, [analysis.extractedText]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCorrectText = async () => {
    setIsProcessingAction(true);
    setActionStatus("Ajustando ortografia e concordância via Ollama...");
    const corrected = await executeCorrection(currentText);
    if (corrected && corrected.trim()) {
      setCurrentText(corrected);
      setActionStatus("Texto revisado com sucesso pelo modelo local.");
    } else {
      setActionStatus("Serviço Ollama indisponível na porta 11434.");
    }
    setIsProcessingAction(false);
    setTimeout(() => setActionStatus(null), 3500);
  };

  const handleCleanText = async () => {
    setIsProcessingAction(true);
    setActionStatus("Removendo artefatos de OCR e ruídos...");
    const cleaned = await executeCleaning(currentText);
    if (cleaned && cleaned.trim()) {
      setCurrentText(cleaned);
      setActionStatus("Ruídos e quebras de linha normalizados.");
    } else {
      setActionStatus("Serviço de limpeza textual indisponível.");
    }
    setIsProcessingAction(false);
    setTimeout(() => setActionStatus(null), 3500);
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Scholarly Edition Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-[#DCD5C9]">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="px-2.5 py-1.5 border border-[#DCD5C9] bg-[#FDFCF9] hover:bg-[#EFECE6] text-[#1A1816] font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
            title="Voltar ao início"
          >
            <span>←</span>
            <span>Retornar</span>
          </button>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#8C2D19] block">
              Ficha de Leitura Analítica
            </span>
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#1A1816]">
              {analysis.bookTitle}
            </h2>
            <p className="font-mono text-[11px] text-[#7D7567] mt-0.5">
              {analysis.author} · {analysis.chapter}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-mono text-[11px] uppercase tracking-wider px-3 py-1 bg-[#FDFCF9] border border-[#DCD5C9] text-[#1A1816]">
            {mode === "rapida" ? "01. Leitura Rápida" : "02. Análise Aprofundada"}
          </span>
        </div>
      </div>

      {/* Backend Status Notice */}
      {isBackendOffline && (
        <div className="mb-6 p-4 bg-[#FAF0ED] border-l-2 border-[#8C2D19] text-[12px] text-[#5A5348] leading-relaxed">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#8C2D19] font-bold mb-1">
            [ Registro Informativo · Modo Demonstrativo ]
          </div>
          <p>
            O servidor Spring Boot local (porta 8002) não respondeu nesta requisição. Os dados exibidos correspondem a um espécime de demonstração.
          </p>
          <p className="mt-1 font-mono text-[11px] text-[#8C2D19]">
            Para OCR e LLM em tempo real: <code className="bg-[#EFECE6] px-1.5 py-0.5 text-[#1A1816]">cd api && mvn spring-boot:run</code>
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-[#FDFCF9] border border-[#DCD5C9] p-12 sm:p-20 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-20 h-20 border border-[#DCD5C9] bg-[#FAF9F5] p-2 flex items-center justify-center">
            <img src="/logo.jpg" alt="EntreLinhas" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[#8C2D19] mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8C2D19] animate-ping" />
              <span>Processamento Hermenêutico em Curso</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1816]">
              Decodificando excerto selecionado...
            </h3>
            <p className="font-sans text-[13px] text-[#5A5348] mt-2 max-w-md mx-auto leading-relaxed">
              Realizando reconhecimento óptico de caracteres, filtragem de ruídos e análise crítica de significados.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden grid-cols-2 p-1 bg-[#EFECE6] border border-[#DCD5C9] mb-5">
            {(["digitalizado", "interpretacao"] as ResultTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  tab === t
                    ? "bg-[#FDFCF9] text-[#1A1816] font-semibold shadow-xs"
                    : "text-[#7D7567]"
                }`}
              >
                {t === "digitalizado" ? "Texto Transcrito" : "Aparato Crítico"}
              </button>
            ))}
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column: Facsimile / Extracted Text */}
            <div className={`lg:col-span-6 flex flex-col gap-4 ${tab === "digitalizado" ? "block" : "hidden lg:flex"}`}>
              <div className="bg-[#FDFCF9] border border-[#DCD5C9] shadow-xs">
                {/* Facsimile Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DCD5C9] bg-[#FAF9F5]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#7D7567]">
                      {viewMode === "texto" ? "Transcrição Tipográfica" : "Espécime Original"}
                    </span>
                    {imageSrc && (
                      <div className="flex border border-[#DCD5C9] bg-[#EFECE6] p-0.5 text-[10px] font-mono">
                        <button
                          onClick={() => setViewMode("texto")}
                          className={`px-2 py-0.5 uppercase transition-colors cursor-pointer ${
                            viewMode === "texto"
                              ? "bg-[#FDFCF9] text-[#1A1816] font-semibold"
                              : "text-[#7D7567]"
                          }`}
                        >
                          Texto
                        </button>
                        <button
                          onClick={() => setViewMode("imagem")}
                          className={`px-2 py-0.5 uppercase transition-colors cursor-pointer ${
                            viewMode === "imagem"
                              ? "bg-[#FDFCF9] text-[#1A1816] font-semibold"
                              : "text-[#7D7567]"
                          }`}
                        >
                          Imagem
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border border-[#DCD5C9] bg-[#FDFCF9] hover:bg-[#EFECE6] text-[#1A1816] transition-colors cursor-pointer"
                    >
                      {copied ? "Copiado ✓" : "Copiar"}
                    </button>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                        isEditing
                          ? "bg-[#1A1816] text-[#F7F5F0] border-[#1A1816]"
                          : "border-[#DCD5C9] bg-[#FDFCF9] hover:bg-[#EFECE6] text-[#1A1816]"
                      }`}
                    >
                      {isEditing ? "Concluir" : "Editar"}
                    </button>
                  </div>
                </div>

                {/* Text Body */}
                <div className="p-5 sm:p-7">
                  {viewMode === "imagem" && imageSrc ? (
                    <div className="border border-[#DCD5C9] bg-[#1A1816] p-2 flex items-center justify-center max-h-[400px]">
                      <img
                        src={imageSrc}
                        alt="Página selecionada"
                        className="max-h-[380px] w-auto object-contain"
                      />
                    </div>
                  ) : isEditing ? (
                    <div className="flex flex-col gap-3">
                      <textarea
                        value={currentText}
                        onChange={(e) => setCurrentText(e.target.value)}
                        rows={10}
                        className="w-full font-serif text-[15px] sm:text-[16px] leading-[1.85] text-[#1A1816] bg-[#FAF9F5] p-4 border border-[#DCD5C9] focus:outline-none focus:border-[#8C2D19] resize-y"
                        placeholder="Edite o excerto transcrito..."
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={handleCorrectText}
                          disabled={isProcessingAction}
                          className="px-3 py-1.5 border border-[#DCD5C9] bg-[#FDFCF9] hover:bg-[#EFECE6] text-[#1A1816] font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                        >
                          [ Corrigir via IA ]
                        </button>
                        <button
                          onClick={handleCleanText}
                          disabled={isProcessingAction}
                          className="px-3 py-1.5 border border-[#DCD5C9] bg-[#FDFCF9] hover:bg-[#EFECE6] text-[#1A1816] font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                        >
                          [ Limpar Ruídos ]
                        </button>
                      </div>
                      {actionStatus && (
                        <p className="text-[11px] font-mono text-[#8C2D19] italic">
                          {actionStatus}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="relative pl-5 sm:pl-6 border-l-2 border-[#8C2D19]">
                      <p className="font-serif text-[16px] sm:text-[17px] leading-[1.9] text-[#1A1816] italic">
                        "{currentText}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Textual Metrics Table */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Extensão em Palavras",
                    value: String(currentText.trim().split(/\s+/).filter(Boolean).length),
                  },
                  {
                    label: "Caracteres Totais",
                    value: currentText.length.toLocaleString("pt-BR"),
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-[#FDFCF9] border border-[#DCD5C9] p-3.5 text-center shadow-xs"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#7D7567] block">
                      {s.label}
                    </span>
                    <span className="font-mono text-xl font-bold text-[#1A1816] mt-0.5 block">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Archival Confirmation Stamp */}
              <div className="p-3 bg-[#FDFCF9] border border-[#DCD5C9] flex items-center justify-between text-[11px] font-mono text-[#5A5348]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                  <span className="uppercase tracking-wider">
                    Registrado no Arquivo Permanente
                  </span>
                </div>
                <span className="text-[#A8A196]">Autossalvamento Concluído</span>
              </div>
            </div>

            {/* Right Column: Aparato Crítico & Hermeneutic Insights */}
            <div className={`lg:col-span-6 flex flex-col gap-5 ${tab === "interpretacao" ? "block" : "hidden lg:flex"}`}>
              {/* Intent and Tone Card */}
              <div className="bg-[#FDFCF9] border border-[#DCD5C9] p-5 sm:p-6 shadow-xs">
                <div className="pb-3 mb-4 border-b border-[#DCD5C9] flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#7D7567]">
                    01. Intenção & Tom Discursivo
                  </span>
                  <span className="font-mono text-[10px] uppercase text-[#8C2D19]">
                    Semântica
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {analysis.intents.map((intent, idx) => (
                    <span
                      key={intent}
                      className={`font-mono text-[11px] uppercase tracking-wider px-3 py-1 border ${
                        idx === 0
                          ? "bg-[#FAF0ED] text-[#8C2D19] border-[#8C2D19]/40 font-semibold"
                          : "bg-[#FAF9F5] text-[#1A1816] border-[#DCD5C9]"
                      }`}
                    >
                      {intent}
                    </span>
                  ))}
                </div>

                {/* Tone Metrics Scale */}
                <div className="space-y-3 pt-3 border-t border-[#EFECE6]">
                  {analysis.toneMetrics.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[12px] font-mono mb-1 text-[#5A5348]">
                        <span>{item.label}</span>
                        <span className="font-semibold text-[#1A1816]">{item.value}</span>
                      </div>
                      <div className="h-1 bg-[#EFECE6] w-full overflow-hidden">
                        <div
                          className="h-full bg-[#8C2D19]"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Literary Summary */}
              <div className="bg-[#FDFCF9] border border-[#DCD5C9] p-5 sm:p-6 shadow-xs">
                <div className="pb-3 mb-4 border-b border-[#DCD5C9] flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#7D7567]">
                    02. Ideias Centrais & Estrutura
                  </span>
                  <span className="font-mono text-[10px] uppercase text-[#7D7567]">
                    Exegese
                  </span>
                </div>

                <div className="space-y-3">
                  {analysis.summaryPoints.map((point, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="font-mono text-[11px] font-semibold text-[#8C2D19] mt-0.5 shrink-0">
                        [{String(i + 1).padStart(2, "0")}]
                      </span>
                      <p className="font-serif text-[14px] text-[#1A1816] leading-relaxed">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historical References (If Present) */}
              {analysis.referenciasHistoricas && analysis.referenciasHistoricas.length > 0 && (
                <div className="bg-[#FDFCF9] border border-[#DCD5C9] p-5 sm:p-6 shadow-xs">
                  <div className="pb-3 mb-3 border-b border-[#DCD5C9] flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#7D7567]">
                      03. Referências & Alusões Históricas
                    </span>
                    <span className="font-mono text-[10px] uppercase text-[#8C2D19]">
                      Contexto
                    </span>
                  </div>

                  <ul className="space-y-2.5">
                    {analysis.referenciasHistoricas.map((ref, idx) => (
                      <li key={idx} className="font-sans text-[13px] text-[#2C2825] flex items-start gap-2.5 leading-relaxed">
                        <span className="font-mono text-[#8C2D19] text-[11px] mt-0.5">§</span>
                        <span>{ref}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Figuras de Linguagem (If Present) */}
              {analysis.figurasDeLinguagem && analysis.figurasDeLinguagem.length > 0 && (
                <div className="bg-[#FDFCF9] border border-[#DCD5C9] p-5 sm:p-6 shadow-xs">
                  <div className="pb-3 mb-3 border-b border-[#DCD5C9] flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#7D7567]">
                      04. Figuras de Linguagem Mapeadas
                    </span>
                    <span className="font-mono text-[10px] uppercase text-[#7D7567]">
                      Estilística
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {analysis.figurasDeLinguagem.map((fig, idx) => (
                      <span
                        key={idx}
                        className="font-serif text-[13px] px-3 py-1 bg-[#FAF9F5] text-[#1A1816] border border-[#DCD5C9] italic"
                      >
                        {fig}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contextual Notes & Marginalia */}
              <div className="bg-[#FDFCF9] border border-[#DCD5C9] shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#DCD5C9] bg-[#FAF9F5] flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#7D7567]">
                    05. Notas Marginais & Paralelos
                  </span>
                  <span className="font-mono text-[10px] uppercase text-[#7D7567]">
                    Glosas
                  </span>
                </div>

                <div className="divide-y divide-[#EFECE6]">
                  {analysis.contextualNotes.map((item) => (
                    <button
                      key={item.title}
                      onClick={() =>
                        setExpandedSection(expandedSection === item.title ? null : item.title)
                      }
                      className="w-full flex items-start justify-between px-5 py-3.5 text-left hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                    >
                      <div className="pr-3">
                        <p className="font-serif text-[14px] font-bold text-[#1A1816]">
                          {item.title}
                        </p>
                        <p className="font-mono text-[11px] text-[#7D7567] mt-0.5">
                          {item.sub}
                        </p>
                        {expandedSection === item.title && (
                          <p className="font-sans text-[13px] text-[#5A5348] mt-2.5 leading-relaxed pt-2 border-t border-[#EFECE6]">
                            {item.content}
                          </p>
                        )}
                      </div>
                      <span className="font-mono text-[13px] text-[#7D7567] shrink-0 mt-0.5">
                        {expandedSection === item.title ? "−" : "+"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Translation Card (If present) */}
              {analysis.translation && (
                <div className="bg-[#FDFCF9] border border-[#DCD5C9] p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DCD5C9] mb-3">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#7D7567] block">
                        Tradução Literária
                      </span>
                      <p className="font-serif text-[14px] font-bold text-[#1A1816]">
                        Transposição de Idioma
                      </p>
                    </div>

                    <button
                      onClick={() => setShowTranslation(!showTranslation)}
                      className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                        showTranslation
                          ? "bg-[#1A1816] text-[#F7F5F0] border-[#1A1816]"
                          : "border-[#DCD5C9] bg-[#FAF9F5] text-[#1A1816]"
                      }`}
                    >
                      {showTranslation ? "Ocultar" : "Exibir Versão"}
                    </button>
                  </div>

                  {showTranslation && (
                    <div className="bg-[#FAF9F5] border border-[#DCD5C9] p-4 mt-2">
                      <p className="font-serif text-[14px] leading-[1.8] text-[#1A1816] italic">
                        {analysis.translation.text}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}