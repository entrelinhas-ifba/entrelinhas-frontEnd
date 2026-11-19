import { useState, useEffect, useRef, useCallback } from "react";

interface CameraViewfinderProps {
  onCapture: (photoSrc?: string) => void;
  onBack: () => void;
  onSelectFromGallery?: (imageSrc: string) => void;
}

export function CameraViewfinder({ onCapture, onBack, onSelectFromGallery }: CameraViewfinderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  const [cameraStatus, setCameraStatus] = useState<"requesting" | "active" | "denied">("requesting");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isLevel, setIsLevel] = useState(false);
  const [flash, setFlash] = useState(false);
  const [grid, setGrid] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Check if device has multiple video devices (front and back)
  useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Start real device camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraStatus("requesting");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Câmera não suportada neste navegador.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setCameraStatus("active");
        };
      } else {
        setCameraStatus("active");
      }
    } catch {
      setCameraStatus("denied");
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    startCamera();
    const t = setTimeout(() => setIsLevel(true), 1500);

    return () => {
      clearTimeout(t);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Toggle flash or hardware torch
  const toggleFlash = async () => {
    const nextFlash = !flash;
    setFlash(nextFlash);

    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        try {
          const trackWithTorch = track as MediaStreamTrack & {
            applyConstraints?: (c: { advanced: Array<{ torch?: boolean }> }) => Promise<void>;
          };
          if (trackWithTorch.applyConstraints) {
            await trackWithTorch.applyConstraints({
              advanced: [{ torch: nextFlash }],
            });
          }
        } catch {
          // Hardware torch unsupported; screen flash fallback works automatically
        }
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const capturePhoto = () => {
    if (shutterFlash) return;
    setShutterFlash(true);

    setTimeout(() => {
      let photoUrl: string | undefined = undefined;
      const video = videoRef.current;

      if (cameraStatus === "active" && video && video.videoWidth > 0 && video.videoHeight > 0) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (facingMode === "user") {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          photoUrl = canvas.toDataURL("image/jpeg", 0.95);
        }
      }

      stopCamera();
      onCapture(photoUrl);
    }, 150);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string" && onSelectFromGallery) {
          stopCamera();
          onSelectFromGallery(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleNativeCameraFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          stopCamera();
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleBack = () => {
    stopCamera();
    onBack();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#141311] flex items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full h-full sm:h-auto sm:max-w-md sm:aspect-[3/4.2] bg-[#1A1816] sm:border sm:border-[#3D3833] overflow-hidden relative flex flex-col shadow-2xl">
        
        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleNativeCameraFile}
        />

        {/* Shutter flash animation overlay */}
        {shutterFlash && (
          <div className="absolute inset-0 bg-[#F7F5F0] z-50 transition-opacity duration-150 pointer-events-none" />
        )}

        {/* Screen flash light simulator */}
        {flash && (
          <div className="absolute inset-0 bg-[#F7F5F0]/25 pointer-events-none z-10" />
        )}

        {/* Top Controls Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 pt-4 pb-3 px-4 flex items-center justify-between bg-gradient-to-b from-[#141311]/90 to-transparent">
          <button
            onClick={handleBack}
            className="px-3 py-1.5 border border-[#4D4740] bg-[#24211D]/80 hover:bg-[#332F2A] transition-colors cursor-pointer text-[#F7F5F0] font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5"
            title="Voltar"
          >
            <span>←</span>
            <span>Fechar</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border border-[#4D4740] bg-[#24211D]/80 text-[#DCD5C9]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                cameraStatus === "active"
                  ? "bg-[#2D6A4F]"
                  : cameraStatus === "requesting"
                  ? "bg-[#8C2D19] animate-pulse"
                  : "bg-[#B46C20]"
              }`}
            />
            <span>
              {cameraStatus === "active"
                ? "Sensor Óptico Ativo"
                : cameraStatus === "requesting"
                ? "Conectando..."
                : "Sem Acesso"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasMultipleCameras && (
              <button
                onClick={toggleCameraFacing}
                title="Inverter Câmera"
                className="w-8 h-8 border border-[#4D4740] bg-[#24211D]/80 flex items-center justify-center hover:bg-[#332F2A] transition-colors cursor-pointer text-[#F7F5F0]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 10c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 1.5.4 2.9 1.1 4.1L3 16l4.5-.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4 14c0 4.418 3.582 8 8 8s8-3.582 8-8c0-1.5-.4-2.9-1.1-4.1L21 8l-4.5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}

            <button
              onClick={toggleFlash}
              title="Iluminação / Flash"
              className={`w-8 h-8 border flex items-center justify-center transition-colors cursor-pointer ${
                flash ? "bg-[#B46C20] border-[#B46C20] text-white" : "border-[#4D4740] bg-[#24211D]/80 text-[#F7F5F0]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polygon
                  points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill={flash ? "currentColor" : "none"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Live Camera Viewfinder */}
        <div className="absolute inset-0 bg-[#141311] flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cameraStatus === "active" ? "opacity-100" : "opacity-0"
            }`}
          />

          {cameraStatus === "requesting" && (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-[#F7F5F0] z-10 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#8C2D19] animate-ping" />
              <p className="text-[12px] uppercase tracking-wider">Acessando sensor da câmera...</p>
              <p className="text-[11px] text-[#A8A196]">Autorize a permissão no navegador</p>
            </div>
          )}

          {cameraStatus === "denied" && (
            <div className="flex flex-col items-center gap-3.5 p-6 text-center text-[#F7F5F0] z-20 max-w-[300px]">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#B46C20]">
                Acesso Indisponível
              </div>
              <p className="font-serif text-[15px] font-bold">
                Câmera Direta Bloqueada
              </p>
              <p className="text-[12px] text-[#A8A196] leading-relaxed">
                Você pode utilizar a captura fotográfica padrão do seu dispositivo ou escolher um arquivo da galeria.
              </p>
              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="w-full py-2.5 bg-[#8C2D19] hover:bg-[#732414] text-[#F7F5F0] font-mono text-[11px] uppercase tracking-wider font-semibold cursor-pointer"
                >
                  Acionar Câmera Nativa
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-2 border border-[#4D4740] bg-[#24211D] text-[#DCD5C9] font-mono text-[11px] uppercase tracking-wider cursor-pointer"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Framing Guides Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none z-20">
          <div className="relative w-full max-w-[300px] aspect-[0.707]">
            {/* Corner Alignment Marks */}
            {[
              "top-0 left-0",
              "top-0 right-0 rotate-90",
              "bottom-0 right-0 rotate-180",
              "bottom-0 left-0 -rotate-90",
            ].map((pos, i) => (
              <div key={i} className={`absolute ${pos} w-7 h-7`}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M2 14V2H14"
                    stroke={isLevel ? "#DCD5C9" : "#8C2D19"}
                    strokeWidth="2"
                    strokeLinecap="square"
                  />
                </svg>
              </div>
            ))}

            {/* Grid */}
            {grid && (
              <div className="absolute inset-0 opacity-25">
                {[33, 66].map((p) => (
                  <div key={`h${p}`} className="absolute w-full h-px bg-[#F7F5F0]" style={{ top: `${p}%` }} />
                ))}
                {[33, 66].map((p) => (
                  <div key={`v${p}`} className="absolute h-full w-px bg-[#F7F5F0]" style={{ left: `${p}%` }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Level Indicator */}
        <div className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{ top: "35%" }}>
          <div
            className={`w-9 h-9 border flex items-center justify-center transition-colors duration-300 ${
              isLevel ? "border-[#DCD5C9]/80" : "border-[#8C2D19]/80"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 transition-all duration-300 ${
                isLevel ? "bg-[#DCD5C9]" : "bg-[#8C2D19] translate-x-0.5"
              }`}
            />
          </div>
          {isLevel && (
            <div className="text-center mt-1">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#DCD5C9] bg-[#141311]/80 px-2 py-0.5 border border-[#3D3833]">
                Alinhamento Correto
              </span>
            </div>
          )}
        </div>

        {/* Bottom Shutter & Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 pb-6 pt-6 px-6 bg-gradient-to-t from-[#141311] via-[#141311]/80 to-transparent">
          <div className="flex items-center justify-between mb-4">
            {/* Gallery Picker */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Carregar da Galeria"
              className="w-11 h-11 border border-[#4D4740] bg-[#24211D]/90 flex items-center justify-center hover:bg-[#332F2A] transition-colors cursor-pointer text-[#F7F5F0]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>

            {/* Shutter Capture Button */}
            <button
              onClick={capturePhoto}
              title="Capturar Foto"
              className="relative cursor-pointer group"
              style={{ width: 68, height: 68 }}
            >
              <div className="absolute inset-0 border-2 border-[#DCD5C9] transition-transform group-active:scale-95" />
              <div className="absolute inset-1.5 bg-[#F7F5F0] hover:bg-[#EFECE6] transition-colors flex items-center justify-center">
                <div className="w-3 h-3 border border-[#1A1816]" />
              </div>
            </button>

            {/* Grid Toggle */}
            <button
              onClick={() => setGrid(!grid)}
              title="Alternar Grade"
              className={`w-11 h-11 border flex items-center justify-center transition-colors cursor-pointer ${
                grid ? "bg-[#332F2A] border-[#DCD5C9] text-[#F7F5F0]" : "border-[#4D4740] bg-[#24211D]/90 text-[#F7F5F0]"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.6" />
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleBack}
            className="w-full py-2 border border-[#4D4740] bg-[#24211D]/60 text-[#DCD5C9] font-mono text-[11px] uppercase tracking-wider hover:bg-[#24211D] transition-colors cursor-pointer"
          >
            Cancelar Captura
          </button>
        </div>

      </div>
    </div>
  );
}