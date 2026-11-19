import { useState, useRef, useEffect, useCallback } from "react";

interface CropAdjusterProps {
  imageSrc?: string | null;
  onConfirm: (croppedImage?: string) => void;
  onBack: () => void;
}

type Point = { x: number; y: number };

type DragTarget =
  | { type: "corner"; index: number }
  | { type: "edge"; edge: "top" | "bottom" | "left" | "right" }
  | { type: "all" }
  | null;

const DEFAULT_CORNERS: Point[] = [
  { x: 10, y: 8 },
  { x: 90, y: 8 },
  { x: 90, y: 92 },
  { x: 10, y: 92 },
];

export function CropAdjuster({ imageSrc, onConfirm, onBack }: CropAdjusterProps) {
  const [grayscale, setGrayscale] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [corners, setCorners] = useState<Point[]>(DEFAULT_CORNERS);
  const [activeTarget, setActiveTarget] = useState<DragTarget>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    startPos: Point;
    startCorners: Point[];
  } | null>(null);

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleAutoAdjust = () => {
    setCorners([
      { x: 7, y: 6 },
      { x: 93, y: 6 },
      { x: 93, y: 94 },
      { x: 7, y: 94 },
    ]);
  };

  const handleExpandFull = () => {
    setCorners([
      { x: 2, y: 2 },
      { x: 98, y: 2 },
      { x: 98, y: 98 },
      { x: 2, y: 98 },
    ]);
  };

  const handleReset = () => {
    setCorners(DEFAULT_CORNERS);
    setRotation(0);
    setGrayscale(false);
  };

  // Convert client pointer coordinate to 0-100% space
  const getContainerPercent = useCallback((clientX: number, clientY: number): Point => {
    if (!containerRef.current) return { x: 50, y: 50 };
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, Math.round(rawX * 10) / 10)),
      y: Math.max(0, Math.min(100, Math.round(rawY * 10) / 10)),
    };
  }, []);

  const handlePointerDown = (
    e: React.PointerEvent,
    target: NonNullable<DragTarget>
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const percent = getContainerPercent(e.clientX, e.clientY);
    dragStartRef.current = {
      startPos: percent,
      startCorners: corners.map((c) => ({ ...c })),
    };
    setActiveTarget(target);
  };

  useEffect(() => {
    if (!activeTarget) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragStartRef.current || !containerRef.current) return;
      const current = getContainerPercent(e.clientX, e.clientY);
      const { startPos, startCorners } = dragStartRef.current;
      const dx = current.x - startPos.x;
      const dy = current.y - startPos.y;

      setCorners(() => {
        const next = startCorners.map((c) => ({ ...c }));

        if (activeTarget.type === "corner") {
          const idx = activeTarget.index;
          let newX = current.x;
          let newY = current.y;

          if (idx === 0) {
            newX = Math.min(newX, next[1].x - 10);
            newY = Math.min(newY, next[3].y - 10);
          } else if (idx === 1) {
            newX = Math.max(newX, next[0].x + 10);
            newY = Math.min(newY, next[2].y - 10);
          } else if (idx === 2) {
            newX = Math.max(newX, next[3].x + 10);
            newY = Math.max(newY, next[1].y + 10);
          } else if (idx === 3) {
            newX = Math.min(newX, next[2].x - 10);
            newY = Math.max(newY, next[0].y + 10);
          }

          next[idx] = {
            x: Math.max(0, Math.min(100, newX)),
            y: Math.max(0, Math.min(100, newY)),
          };
        } else if (activeTarget.type === "edge") {
          const edge = activeTarget.edge;
          if (edge === "top") {
            const maxAllowedY = Math.min(next[2].y, next[3].y) - 10;
            const newY = Math.max(0, Math.min(maxAllowedY, startCorners[0].y + dy));
            next[0].y = newY;
            next[1].y = startCorners[1].y + (newY - startCorners[0].y);
          } else if (edge === "bottom") {
            const minAllowedY = Math.max(next[0].y, next[1].y) + 10;
            const newY = Math.min(100, Math.max(minAllowedY, startCorners[2].y + dy));
            next[2].y = newY;
            next[3].y = startCorners[3].y + (newY - startCorners[2].y);
          } else if (edge === "left") {
            const maxAllowedX = Math.min(next[1].x, next[2].x) - 10;
            const newX = Math.max(0, Math.min(maxAllowedX, startCorners[0].x + dx));
            next[0].x = newX;
            next[3].x = startCorners[3].x + (newX - startCorners[0].x);
          } else if (edge === "right") {
            const minAllowedX = Math.max(next[0].x, next[3].x) + 10;
            const newX = Math.min(100, Math.max(minAllowedX, startCorners[1].x + dx));
            next[1].x = newX;
            next[2].x = startCorners[2].x + (newX - startCorners[1].x);
          }
        } else if (activeTarget.type === "all") {
          const minX = Math.min(...startCorners.map((c) => c.x));
          const maxX = Math.max(...startCorners.map((c) => c.x));
          const minY = Math.min(...startCorners.map((c) => c.y));
          const maxY = Math.max(...startCorners.map((c) => c.y));

          const clampedDx = Math.max(-minX, Math.min(100 - maxX, dx));
          const clampedDy = Math.max(-minY, Math.min(100 - maxY, dy));

          return startCorners.map((c) => ({
            x: c.x + clampedDx,
            y: c.y + clampedDy,
          }));
        }

        return next;
      });
    };

    const handlePointerUp = () => {
      setActiveTarget(null);
      dragStartRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [activeTarget, getContainerPercent]);

  // Real canvas crop processing
  const handleConfirmCrop = async () => {
    setIsProcessing(true);
    if (!imageSrc) {
      setTimeout(() => {
        setIsProcessing(false);
        onConfirm();
      }, 300);
      return;
    }

    try {
      const croppedDataUrl = await new Promise<string>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(imageSrc);
            return;
          }

          const xs = corners.map((c) => c.x);
          const ys = corners.map((c) => c.y);
          const minXPercent = Math.max(0, Math.min(...xs)) / 100;
          const maxXPercent = Math.min(100, Math.max(...xs)) / 100;
          const minYPercent = Math.max(0, Math.min(...ys)) / 100;
          const maxYPercent = Math.min(100, Math.max(...ys)) / 100;

          const isRotated90 = rotation % 180 !== 0;
          const baseW = isRotated90 ? img.naturalHeight : img.naturalWidth;
          const baseH = isRotated90 ? img.naturalWidth : img.naturalHeight;

          const baseCanvas = document.createElement("canvas");
          baseCanvas.width = baseW;
          baseCanvas.height = baseH;
          const baseCtx = baseCanvas.getContext("2d");

          if (!baseCtx) {
            resolve(imageSrc);
            return;
          }

          if (grayscale) {
            baseCtx.filter = "grayscale(100%) contrast(1.15)";
          }

          baseCtx.translate(baseW / 2, baseH / 2);
          baseCtx.rotate((rotation * Math.PI) / 180);
          baseCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

          const cropX = Math.round(minXPercent * baseW);
          const cropY = Math.round(minYPercent * baseH);
          const cropW = Math.max(40, Math.round((maxXPercent - minXPercent) * baseW));
          const cropH = Math.max(40, Math.round((maxYPercent - minYPercent) * baseH));

          canvas.width = cropW;
          canvas.height = cropH;

          ctx.drawImage(
            baseCanvas,
            cropX,
            cropY,
            cropW,
            cropH,
            0,
            0,
            cropW,
            cropH
          );

          resolve(canvas.toDataURL("image/jpeg", 0.92));
        };

        img.onerror = () => resolve(imageSrc);
        img.src = imageSrc;
      });

      onConfirm(croppedDataUrl);
    } catch {
      onConfirm(imageSrc);
    } finally {
      setIsProcessing(false);
    }
  };

  const edgeMidpoints = {
    top: { x: (corners[0].x + corners[1].x) / 2, y: (corners[0].y + corners[1].y) / 2 },
    right: { x: (corners[1].x + corners[2].x) / 2, y: (corners[1].y + corners[2].y) / 2 },
    bottom: { x: (corners[2].x + corners[3].x) / 2, y: (corners[2].y + corners[3].y) / 2 },
    left: { x: (corners[3].x + corners[0].x) / 2, y: (corners[3].y + corners[0].y) / 2 },
  };

  const cornerLabels = [
    "Superior Esquerdo",
    "Superior Direito",
    "Inferior Direito",
    "Inferior Esquerdo",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#141311] flex items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full h-full sm:h-auto sm:max-w-md sm:aspect-[3/4.2] bg-[#1A1816] sm:border sm:border-[#3D3833] overflow-hidden relative flex flex-col shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#3D3833] bg-[#24211D]/90 backdrop-blur-sm z-30">
          <button
            onClick={onBack}
            className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-[#DCD5C9] hover:text-[#F7F5F0] border border-[#4D4740] bg-[#1A1816] transition-colors cursor-pointer"
          >
            ← Voltar
          </button>
          <div className="text-center">
            <p className="font-serif text-[14px] font-bold text-[#F7F5F0]">Enquadrar Margens</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#B46C20]">
              {activeTarget
                ? activeTarget.type === "corner"
                  ? `Canto: ${cornerLabels[activeTarget.index]}`
                  : activeTarget.type === "edge"
                  ? `Borda: ${activeTarget.edge}`
                  : "Reposicionando seleção"
                : "Ajuste os vértices da página"}
            </p>
          </div>
          <button
            onClick={handleReset}
            title="Redefinir ajustes"
            className="text-[11px] font-mono uppercase text-[#A8A196] hover:text-[#F7F5F0] transition-colors cursor-pointer"
          >
            Restaurar
          </button>
        </div>

        {/* Quick Presets Toolbar */}
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-[#1E1B18] border-b border-[#3D3833] z-20">
          <button
            onClick={handleAutoAdjust}
            className="px-3 py-1 bg-[#282420] border border-[#4D4740] hover:bg-[#332F2A] text-[#DCD5C9] font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
          >
            [ Auto-Enquadrar ]
          </button>
          <button
            onClick={handleExpandFull}
            className="px-3 py-1 bg-[#282420] border border-[#4D4740] hover:bg-[#332F2A] text-[#DCD5C9] font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
          >
            [ Página Completa ]
          </button>
        </div>

        {/* Interactive Cropper Canvas */}
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-[#141311]">
          <div
            ref={containerRef}
            className="relative w-full max-w-[290px] sm:max-w-[320px] aspect-[0.707] bg-[#1A1816] border border-[#4D4740] overflow-hidden shadow-2xl touch-none"
            style={{ touchAction: "none" }}
          >
            {imageSrc ? (
              <div className="absolute inset-0 flex items-center justify-center p-2 bg-[#1A1816] overflow-hidden">
                <img
                  src={imageSrc}
                  alt="Página para recorte"
                  className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-200"
                  style={{
                    filter: grayscale ? "grayscale(100%) contrast(1.15)" : "none",
                    transform: `rotate(${rotation}deg)`,
                  }}
                />
              </div>
            ) : (
              <div
                className={`absolute inset-0 ${grayscale ? "bg-neutral-300" : "bg-[#F7F5F0]"} flex flex-col px-6 pt-8 gap-2.5`}
                style={{
                  filter: grayscale ? "grayscale(100%)" : "none",
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[5px] bg-[#DCD5C9]"
                    style={{ width: `${70 + Math.sin(i * 0.8) * 20}%` }}
                  />
                ))}
              </div>
            )}

            {/* SVG Mask and Outlines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d={`M 0 0 L 100 0 L 100 100 L 0 100 Z M ${corners[0].x} ${corners[0].y} L ${corners[1].x} ${corners[1].y} L ${corners[2].x} ${corners[2].y} L ${corners[3].x} ${corners[3].y} Z`}
                fill="rgba(20, 19, 17, 0.72)"
                fillRule="evenodd"
              />

              <polygon
                points={corners.map((c) => `${c.x},${c.y}`).join(" ")}
                fill="transparent"
                stroke="#8C2D19"
                strokeWidth="0.9"
              />

              {/* Grid rules */}
              <line
                x1={corners[0].x + (corners[3].x - corners[0].x) / 3}
                y1={corners[0].y + (corners[3].y - corners[0].y) / 3}
                x2={corners[1].x + (corners[2].x - corners[1].x) / 3}
                y2={corners[1].y + (corners[2].y - corners[1].y) / 3}
                stroke="rgba(247, 245, 240, 0.3)"
                strokeWidth="0.35"
                strokeDasharray="1.5 1.5"
              />
              <line
                x1={corners[0].x + ((corners[3].x - corners[0].x) * 2) / 3}
                y1={corners[0].y + ((corners[3].y - corners[0].y) * 2) / 3}
                x2={corners[1].x + ((corners[2].x - corners[1].x) * 2) / 3}
                y2={corners[1].y + ((corners[2].y - corners[1].y) * 2) / 3}
                stroke="rgba(247, 245, 240, 0.3)"
                strokeWidth="0.35"
                strokeDasharray="1.5 1.5"
              />
              <line
                x1={corners[0].x + (corners[1].x - corners[0].x) / 3}
                y1={corners[0].y + (corners[1].y - corners[0].y) / 3}
                x2={corners[3].x + (corners[2].x - corners[3].x) / 3}
                y2={corners[3].y + (corners[2].y - corners[3].y) / 3}
                stroke="rgba(247, 245, 240, 0.3)"
                strokeWidth="0.35"
                strokeDasharray="1.5 1.5"
              />
              <line
                x1={corners[0].x + ((corners[1].x - corners[0].x) * 2) / 3}
                y1={corners[0].y + ((corners[1].y - corners[0].y) * 2) / 3}
                x2={corners[3].x + ((corners[2].x - corners[3].x) * 2) / 3}
                y2={corners[3].y + ((corners[2].y - corners[3].y) * 2) / 3}
                stroke="rgba(247, 245, 240, 0.3)"
                strokeWidth="0.35"
                strokeDasharray="1.5 1.5"
              />
            </svg>

            {/* Center Drag Zone */}
            <div
              onPointerDown={(e) => handlePointerDown(e, { type: "all" })}
              className="absolute inset-0 cursor-move"
              style={{
                clipPath: `polygon(${corners.map((c) => `${c.x}% ${c.y}%`).join(", ")})`,
              }}
              title="Mover enquadramento"
            />

            {/* Edge Handles */}
            {(["top", "right", "bottom", "left"] as const).map((edge) => {
              const pt = edgeMidpoints[edge];
              const isHorizontal = edge === "top" || edge === "bottom";
              return (
                <div
                  key={edge}
                  onPointerDown={(e) => handlePointerDown(e, { type: "edge", edge })}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center cursor-${
                    isHorizontal ? "ns" : "ew"
                  }-resize`}
                  style={{
                    left: `${pt.x}%`,
                    top: `${pt.y}%`,
                    width: isHorizontal ? 36 : 24,
                    height: isHorizontal ? 24 : 36,
                  }}
                  title={`Ajustar borda ${edge}`}
                >
                  <div
                    className={`bg-[#F7F5F0] border border-[#8C2D19] ${
                      isHorizontal ? "w-4 h-1.5" : "w-1.5 h-4"
                    }`}
                  />
                </div>
              );
            })}

            {/* 4 Interactive Corner Pins */}
            {corners.map((c, i) => {
              const isActive =
                activeTarget?.type === "corner" && activeTarget.index === i;
              const cursorClass =
                i === 0 || i === 2 ? "cursor-nwse-resize" : "cursor-nesw-resize";

              return (
                <div
                  key={i}
                  onPointerDown={(e) => handlePointerDown(e, { type: "corner", index: i })}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center ${cursorClass}`}
                  style={{
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                    width: 38,
                    height: 38,
                  }}
                  title={`Ajustar ${cornerLabels[i]}`}
                >
                  <div
                    className={`flex items-center justify-center transition-transform ${
                      isActive ? "scale-125" : "hover:scale-110"
                    }`}
                    style={{ width: 22, height: 22 }}
                  >
                    <div className="w-4 h-4 bg-[#F7F5F0] border-2 border-[#8C2D19] shadow-md flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#8C2D19]" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Magnifier Loupe */}
            {activeTarget?.type === "corner" && imageSrc && (
              <div
                className="absolute z-40 pointer-events-none -translate-x-1/2 -translate-y-full mb-3"
                style={{
                  left: `${corners[activeTarget.index].x}%`,
                  top: `${Math.max(15, corners[activeTarget.index].y)}%`,
                }}
              >
                <div className="w-20 h-20 border-2 border-[#8C2D19] shadow-2xl overflow-hidden bg-[#141311] relative">
                  <img
                    src={imageSrc}
                    alt="Zoom da borda"
                    className="w-full h-full object-contain"
                    style={{
                      transform: `scale(2.5) rotate(${rotation}deg)`,
                      transformOrigin: `${corners[activeTarget.index].x}% ${corners[activeTarget.index].y}%`,
                      filter: grayscale ? "grayscale(100%) contrast(1.15)" : "none",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-px bg-[#8C2D19]" />
                    <div className="h-full w-px bg-[#8C2D19] absolute" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="px-5 pb-5 pt-3 flex flex-col gap-2.5 bg-[#1E1B18] border-t border-[#3D3833] z-30">
          <div className="flex gap-2">
            <button
              onClick={handleRotate}
              className="flex-1 py-2.5 border border-[#4D4740] bg-[#282420] text-[#DCD5C9] font-mono text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#332F2A] transition-colors cursor-pointer"
            >
              Girar 90° {rotation > 0 ? `(${rotation}°)` : ""}
            </button>
            <button
              onClick={() => setGrayscale(!grayscale)}
              className={`flex-1 py-2.5 border font-mono text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                grayscale
                  ? "bg-[#332F2A] border-[#DCD5C9] text-[#F7F5F0] font-semibold"
                  : "border-[#4D4740] bg-[#282420] text-[#DCD5C9] hover:bg-[#332F2A]"
              }`}
            >
              {grayscale ? "Cores Originais" : "Tons de Cinza / PB"}
            </button>
          </div>

          <button
            onClick={handleConfirmCrop}
            disabled={isProcessing}
            className="w-full py-3 bg-[#8C2D19] hover:bg-[#732414] disabled:opacity-60 text-[#F7F5F0] font-mono text-[12px] uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            {isProcessing ? (
              <span>Processando Recorte...</span>
            ) : (
              <span>Confirmar Enquadramento</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}