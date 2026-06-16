import React, { useState } from "react";
import { TrendingUp, AlertCircle, Sparkles, Check, FileText } from "lucide-react";
import { UserProfile } from "../types";

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
  onBackToLanding: () => void;
  initialMode?: "login" | "signup";
}

export default function AuthScreen({ onAuthSuccess, onBackToLanding, initialMode = "login" }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Registration specific fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === "signup") {
        if (!name.trim()) throw new Error("Nome completo é obrigatório.");
        if (!phone.trim()) throw new Error("Número de telefone obrigatório para suporte WhatsApp.");
        if (!email.trim() || !password.trim()) throw new Error("Email e senha são obrigatórios.");
        if (!acceptedTerms) throw new Error("Você precisa aceitar os Termos de Uso.");

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, email, password, acceptedTerms }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao realizar cadastro.");
        
        onAuthSuccess(data.user);
      } else {
        if (!email.trim() || !password.trim()) throw new Error("Preencha email e senha.");

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login inválido.");

        onAuthSuccess(data.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between text-white font-sans selection:bg-amber-500 selection:text-black">
      {/* Header Bar */}
      <header className="h-20 flex items-center justify-between px-6 md:px-12 border-b border-zinc-900 bg-neutral-950/60 backdrop-blur w-full">
        <button 
          onClick={onBackToLanding}
          className="flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 rounded p-1"
        >
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-1.5 rounded">
            <TrendingUp className="h-5 w-5 text-black" />
          </div>
          <span className="text-lg font-black tracking-tight uppercase">
            TRADER<span className="text-amber-500"> ACADEMIC</span>
          </span>
        </button>
        <button 
          onClick={onBackToLanding}
          className="text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
        >
          Voltar para Home
        </button>
      </header>

      {/* Main Card Section */}
      <main className="flex-1 flex items-center justify-center p-4 py-12 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-neutral-950 to-neutral-950">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 sm:p-10 rounded-2xl shadow-xl shadow-amber-500/5 relative overflow-hidden">
          
          {/* Accent Glow */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

          {/* Tab Selector */}
          <div className="flex border-b border-zinc-800 mb-8">
            <button
              id="tab_login"
              type="button"
              onClick={() => { setMode("login"); setErrorMsg(null); }}
              className={`flex-1 pb-3 text-center text-sm font-semibold transition tracking-wide ${
                mode === "login" 
                  ? "border-b-2 border-amber-500 text-white" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Entrar na Aula
            </button>
            <button
              id="tab_register"
              type="button"
              onClick={() => { setMode("signup"); setErrorMsg(null); }}
              className={`flex-1 pb-3 text-center text-sm font-semibold transition tracking-wide ${
                mode === "signup" 
                  ? "border-b-2 border-amber-500 text-white" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Criar Conta Grátis
            </button>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
              {mode === "login" ? "Acesse sua Mentoria" : "Mude sua Vida Gráfica"}
              <Sparkles className="h-4 w-4 text-amber-500" />
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {mode === "login" 
                ? "Insira suas credenciais cadastradas para continuar" 
                : "Cadastre-se para ver os episódios e planilhas imediatos"}
            </p>
          </div>

          {/* Form Error Message */}
          {errorMsg && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 p-3.5 rounded-lg flex gap-2 w-full text-left">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-red-400">Falha na Operação</span>
                <p className="text-xs text-zinc-300 mt-0.5 leading-normal">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Fields Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* NAME FIELD (Sign Up Only) */}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 tracking-wide block">Nome Completo</label>
                <input
                  id="reg_name_input"
                  type="text"
                  required
                  placeholder="EX: Carlos Santos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/75 rounded px-3.5 py-3 text-sm font-medium text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                />
              </div>
            )}

            {/* PHONE FIELD (Sign Up Only) */}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 tracking-wide block">WhatsApp Obrigatório (DDD+Número)</label>
                <div className="relative">
                  <input
                    id="reg_phone_input"
                    type="tel"
                    required
                    placeholder="EX: 11988887777"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/75 rounded px-3.5 py-3 text-sm font-medium text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                  />
                </div>
                <p className="text-[10px] text-amber-500/90 leading-tight">Necessário para envio das planilhas e suporte VIP integrado.</p>
              </div>
            )}

            {/* EMAIL FIELD */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 block">Endereço de Email</label>
              <input
                id="auth_email_input"
                type="email"
                required
                placeholder="nome@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/75 rounded px-3.5 py-3 text-sm font-medium text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-300 block">Sua Senha</label>
              </div>
              <input
                id="auth_password_input"
                type="password"
                required
                placeholder="Insira sua senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/75 rounded px-3.5 py-3 text-sm font-medium text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            {/* TERMS ACCEPTANCE CHECKBOX (Sign Up Only) */}
            {mode === "signup" && (
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    id="reg_terms_checkbox"
                    type="checkbox"
                    required
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 bg-zinc-950 border border-zinc-800 rounded checked:bg-amber-500 text-black border-zinc-700 accent-amber-500"
                  />
                  <span className="text-xs text-zinc-400 leading-normal">
                    Eu li e aceito as condições dos{" "}
                    <button 
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-amber-500 font-bold hover:underline"
                    >
                      Termos de Uso
                    </button>{" "}
                    da plataforma de mentorias e riscos operacionais de trading.
                  </span>
                </label>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              id="auth_submit_btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-semibold text-sm py-4 rounded transition mt-4 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Salvando dados...
                </>
              ) : (
                mode === "login" ? "Desbloquear Acesso" : "Criar Meu Passe Netflix"
              )}
            </button>
          </form>



        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-6 border-t border-zinc-900 bg-neutral-950 text-center text-[11px] text-zinc-600 leading-normal">
        Aviso legal: O mercado envolve imensos riscos financeiros de volatilidade líquida. Garantimos suporte operacional, mas não retornos financeiros.
      </footer>

      {/* Terms of Use Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 max-w-lg w-full rounded-2xl p-6 relative shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-bold text-white">TERMOS DE USO & POLÍTICA DE RISCO</h3>
            </div>
            <div className="max-h-60 overflow-y-auto text-xs text-zinc-400 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
              <p className="font-semibold text-zinc-300">1. ESCOPO DA PLATAFORMA</p>
              <p>A TRADER ACADEMIC oferece uma plataforma estritamente didática de aprendizado (LMS). Todo o conteúdo fornecido, incluindo vídeos, planilhas inteligentes e estratégias baseadas em SMC, atuam unicamente como simulações analíticas estatísticas.</p>
              
              <p className="font-semibold text-zinc-300">2. NATUREZA DO RISCO FINANCEIRO</p>
              <p>O mercado de derivativos, ações, opções, cripto e pares cambiais (Forex) oferece extrema volatilidade e alavancagem de capitais. Você declara ciência de que pode sofrer perdas financeiras parciais ou totais ao operar em ambientes reais, eximindo a mentoria e o administrador de qualquer dano.</p>

              <p className="font-semibold text-zinc-300">3. USO DOS DADOS E TELEFONE</p>
              <p>Ao fornecer seu nome, e-mail e número telefônico, você autoriza nossos administradores a realizar contato direto de onboarding, envio operacional de materiais complementares e suporte de planilhas de trading.</p>

              <p className="font-semibold text-zinc-300">4. COMPARTILHAMENTO DE CONTAS</p>
              <p>O passe premium é individual e intransferível. Detecção de logins redundantes em diferentes IPs de forma repetida ensejará o bloqueio definitivo do perfil de usuário sem ressarcimentos residuais.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => { setAcceptedTerms(true); setShowTermsModal(false); }}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs px-5 py-2.5 rounded-md flex items-center gap-1.5 active:scale-95 transition"
              >
                <Check className="h-4 w-4" /> Concordar e Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
