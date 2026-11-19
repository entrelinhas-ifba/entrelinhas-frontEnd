import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

interface LoginScreenProps {
  onSuccess?: () => void;
  onSkip?: () => void;
}

export function LoginScreen({ onSuccess, onSkip }: LoginScreenProps) {
  const { loginWithEmail, registerWithEmail, continueAsGuest, isLoading } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await loginWithEmail({ email, password, rememberMe });
      } else {
        if (password !== confirmPassword) {
          throw new Error("As senhas não coincidem.");
        }
        await registerWithEmail({ name, email, password, confirmPassword });
      }
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Não foi possível autenticar. Verifique seus dados e tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    if (mode === "register") {
      setName("Rebeca Freitas");
      setEmail("rebecafa02@gmail.com");
      setPassword("senha1234");
      setConfirmPassword("senha1234");
      setErrorMessage("");
    } else {
      setEmail("rebecafa02@gmail.com");
      setPassword("senha1234");
      setErrorMessage("");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F5F0] flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 selection:bg-[#F0DEB4] selection:text-[#1A1816]">
      <div className="relative w-full max-w-[420px] z-10">
        {/* Brand Card - Ex-Libris Stamp */}
        <div className="text-center mb-6">
          <div className="inline-block p-2.5 bg-[#FDFCF9] border border-[#DCD5C9] shadow-xs mb-3">
            <img
              src="/logo.jpg"
              alt="EntreLinhas"
              className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
            />
          </div>
          <h1 className="sr-only">EntreLinhas</h1>
          <p className="font-sans text-[12px] text-[#7D7567] tracking-wide">
            Leitura analítica, exegese e contexto literário
          </p>
        </div>

        {/* Authentication Ledger Card */}
        <div className="bg-[#FDFCF9] border border-[#DCD5C9] shadow-xs p-6 sm:p-8">
          {/* Mode Switch (Entrar / Cadastrar) */}
          <div className="grid grid-cols-2 p-1 bg-[#EFECE6] border border-[#DCD5C9] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
              }}
              className={`py-2 text-[12px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                mode === "login"
                  ? "bg-[#FDFCF9] text-[#1A1816] font-semibold shadow-xs"
                  : "text-[#7D7567] hover:text-[#1A1816]"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMessage("");
              }}
              className={`py-2 text-[12px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                mode === "register"
                  ? "bg-[#FDFCF9] text-[#1A1816] font-semibold shadow-xs"
                  : "text-[#7D7567] hover:text-[#1A1816]"
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7D7567] mb-1">
                  Nome do Leitor
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo ou pseudônimo"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DCD5C9] text-[14px] text-[#1A1816] placeholder:text-[#A8A196] focus:outline-none focus:border-[#8C2D19] focus:bg-[#FDFCF9] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7D7567] mb-1">
                Endereço de E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="leitor@exemplo.com"
                required
                className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DCD5C9] text-[14px] text-[#1A1816] placeholder:text-[#A8A196] focus:outline-none focus:border-[#8C2D19] focus:bg-[#FDFCF9] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#7D7567]">
                  Senha
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] text-[#8C2D19] hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#FAF9F5] border border-[#DCD5C9] text-[14px] text-[#1A1816] placeholder:text-[#A8A196] focus:outline-none focus:border-[#8C2D19] focus:bg-[#FDFCF9] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7D7567] hover:text-[#1A1816] cursor-pointer"
                  title={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  <span className="text-[11px] font-mono uppercase">
                    {showPassword ? "Ocultar" : "Ver"}
                  </span>
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7D7567] mb-1">
                  Confirmação de Senha
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DCD5C9] text-[14px] text-[#1A1816] placeholder:text-[#A8A196] focus:outline-none focus:border-[#8C2D19] focus:bg-[#FDFCF9] transition-colors"
                />
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center pt-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded-none border-[#DCD5C9] text-[#8C2D19] focus:ring-[#8C2D19] cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-[12px] text-[#5A5348] cursor-pointer select-none"
                >
                  Permanecer conectado neste navegador
                </label>
              </div>
            )}

            {/* Error Message banner */}
            {errorMessage && (
              <div className="p-3 bg-[#FAF0ED] border-l-2 border-[#8C2D19] text-[#8C2D19] text-[12px] leading-relaxed">
                <span className="font-semibold block mb-0.5">Falha de Autenticação</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full py-3 px-4 bg-[#1A1816] hover:bg-[#2D2A26] text-[#F7F5F0] font-mono uppercase tracking-wider text-[12px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
            >
              {isLoading || isSubmitting ? (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F7F5F0] animate-ping" />
                  <span>Processando...</span>
                </div>
              ) : mode === "login" ? (
                "Entrar no EntreLinhas"
              ) : (
                "Registrar Assinatura"
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-5 pt-4 border-t border-[#DCD5C9] flex items-center justify-between text-[11px] font-mono text-[#7D7567]">
            <span>Acesso de demonstração:</span>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-[#8C2D19] hover:underline font-semibold cursor-pointer"
            >
              [ Preencher dados ]
            </button>
          </div>
        </div>

        {/* Guest access option */}
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => {
              continueAsGuest();
              if (onSkip) onSkip();
              else if (onSuccess) onSuccess();
            }}
            className="text-[12px] text-[#5A5348] hover:text-[#1A1816] font-medium transition-colors hover:underline cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Consultar acervo como visitante</span>
            <span>→</span>
          </button>
        </div>

        {/* Archival Security notation */}
        <div className="mt-8 text-center text-[10px] font-mono uppercase tracking-widest text-[#A8A196]">
          Registro seguro · Criptografia de ponta a ponta
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={email}
      />
    </div>
  );
}