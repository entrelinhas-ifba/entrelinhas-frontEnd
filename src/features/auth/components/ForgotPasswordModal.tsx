import { useState } from "react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  defaultEmail = "",
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Por favor, informe um endereço de e-mail válido.");
      return;
    }
    setErrorMessage("");
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSentSuccess(true);
    }, 600);
  };

  const handleReset = () => {
    setSentSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FDFCF9] border border-[#DCD5C9] shadow-md max-w-md w-full overflow-hidden p-6 sm:p-7">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCD5C9]">
          <h3 className="font-serif text-lg font-bold text-[#1A1816]">
            Recuperação de Acesso
          </h3>
          <button
            onClick={onClose}
            className="text-[#7D7567] hover:text-[#1A1816] font-mono text-[14px] p-1 cursor-pointer"
            title="Fechar"
          >
            ✕
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-10 h-10 border border-[#2D6A4F] bg-[#EDF5F0] text-[#2D6A4F] mx-auto flex items-center justify-center text-lg font-mono">
              ✓
            </div>
            <h4 className="font-serif font-bold text-[#1A1816] text-base">
              Instruções Enviadas
            </h4>
            <p className="text-[13px] text-[#5A5348] leading-relaxed">
              Encaminhamos o procedimento de redefinição para:
              <br />
              <strong className="text-[#1A1816] font-mono text-[12px]">{email}</strong>
            </p>
            <p className="text-[11px] text-[#7D7567]">
              Caso não localize em instantes, confira a caixa de spam ou lixo eletrônico.
            </p>
            <div className="pt-3">
              <button
                onClick={handleReset}
                className="w-full py-2.5 px-4 bg-[#1A1816] hover:bg-[#2D2A26] text-[#F7F5F0] font-mono uppercase tracking-wider text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Retornar ao Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            <p className="text-[13px] text-[#5A5348] leading-relaxed">
              Digite o e-mail cadastrado no <strong>EntreLinhas</strong> para receber as instruções de recuperação de senha.
            </p>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7D7567] mb-1">
                E-mail cadastrado
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

            {errorMessage && (
              <div className="p-2.5 bg-[#FAF0ED] border-l-2 border-[#8C2D19] text-[#8C2D19] text-[12px]">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-[#DCD5C9] bg-[#FAF9F5] hover:bg-[#EFECE6] text-[#5A5348] font-mono uppercase tracking-wider text-[11px] font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-[#8C2D19] hover:bg-[#732414] text-[#F7F5F0] font-mono uppercase tracking-wider text-[11px] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? "Enviando..." : "Enviar Instruções"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}