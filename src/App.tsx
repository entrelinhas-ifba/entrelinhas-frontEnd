import { useState } from "react";
import type { Screen, NavTab } from "@/types/navigation.types";
import type { AnalysisMode } from "@/types/analysis.types";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { HomeScreen } from "@/features/home";
import { CameraViewfinder, CropAdjuster } from "@/features/scanner";
import {
  ResultsView,
  QuickAnalysisHub,
  DeepAnalysisHub,
} from "@/features/analysis";
import { HistoryList } from "@/features/history";
import { AuthProvider, useAuth, LoginScreen } from "@/features/auth";

function AppContent() {
  const { isAuthenticated, isInitialLoading } = useAuth();
  const [navTab, setNavTab] = useState<NavTab>("home");
  const [screen, setScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<AnalysisMode>("rapida");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropOrigin, setCropOrigin] = useState<"camera" | "home">("home");
  const [hasDismissedInitialLogin, setHasDismissedInitialLogin] = useState(false);

  const handleNavChange = (tab: NavTab) => {
    setNavTab(tab);
    if (tab === "home") setScreen("home");
    else if (tab === "rapida") setScreen("home");
    else if (tab === "aprofundada") setScreen("home");
    else if (tab === "historico") setScreen("history");
  };

  const handleSelectGalleryImage = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setCropOrigin("home");
    setScreen("crop");
  };

  const handleCameraCapture = (photoSrc?: string) => {
    if (photoSrc) {
      setSelectedImage(photoSrc);
    }
    setCropOrigin("camera");
    setScreen("crop");
  };

  // If user opens the app not authenticated and has not chosen to dismiss, show LoginScreen
  const shouldShowLogin = (!isAuthenticated && !hasDismissedInitialLogin) || screen === "login";

  if (isInitialLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F7F5F0] flex flex-col items-center justify-center p-6 text-center selection:bg-[#F0DEB4]">
        <div className="w-28 h-28 bg-[#FDFCF9] p-2 border border-[#DCD5C9] shadow-xs flex items-center justify-center mb-5">
          <img src="/logo.jpg" alt="EntreLinhas" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#7D7567]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8C2D19] animate-pulse" />
          <span>Consultando acervo...</span>
        </div>
      </div>
    );
  }

  if (shouldShowLogin) {
    return (
      <LoginScreen
        onSuccess={() => {
          setHasDismissedInitialLogin(true);
          setScreen("home");
        }}
        onSkip={() => {
          setHasDismissedInitialLogin(true);
          setScreen("home");
        }}
      />
    );
  }

  const showNav = screen !== "camera" && screen !== "crop";

  return (
    <div className="min-h-screen w-full bg-[#F7F5F0] flex flex-col text-[#1A1816] font-sans antialiased selection:bg-[#F0DEB4] selection:text-[#1A1816]">
      {/* Top Header with Editorial Masthead and Auth controls */}
      {showNav && (
        <AppHeader
          activeTab={navTab}
          onChangeTab={handleNavChange}
          onOpenLogin={() => setScreen("login")}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col ${showNav ? "pb-24 md:pb-12" : ""}`}>
        {screen === "camera" ? (
          <CameraViewfinder
            onCapture={handleCameraCapture}
            onBack={() => setScreen("home")}
            onSelectFromGallery={(img) => {
              setSelectedImage(img);
              setCropOrigin("camera");
              setScreen("crop");
            }}
          />
        ) : screen === "crop" ? (
          <CropAdjuster
            imageSrc={selectedImage}
            onConfirm={(croppedImg) => {
              if (croppedImg) {
                setSelectedImage(croppedImg);
              }
              setScreen("results");
            }}
            onBack={() => setScreen(cropOrigin)}
          />
        ) : screen === "results" ? (
          <ResultsView
            mode={mode}
            imageSrc={selectedImage}
            onBack={() => setScreen("home")}
          />
        ) : (
          <>
            {navTab === "home" && (
              <HomeScreen
                mode={mode}
                setMode={setMode}
                onCapture={() => {
                  setSelectedImage(null);
                  setScreen("camera");
                }}
                onSelectImage={handleSelectGalleryImage}
                onSnippetClick={() => setScreen("results")}
                onViewAllHistory={() => handleNavChange("historico")}
              />
            )}
            {navTab === "rapida" && (
              <QuickAnalysisHub
                onScan={() => {
                  setMode("rapida");
                  setScreen("camera");
                }}
                onItemClick={() => setScreen("results")}
              />
            )}
            {navTab === "aprofundada" && (
              <DeepAnalysisHub
                onScan={() => {
                  setMode("aprofundada");
                  setScreen("camera");
                }}
              />
            )}
            {navTab === "historico" && (
              <HistoryList onItemClick={() => setScreen("results")} />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      {showNav && <BottomNav active={navTab} onChange={handleNavChange} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}