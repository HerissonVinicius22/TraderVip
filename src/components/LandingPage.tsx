import React, { useState } from "react";
import { 
  TrendingUp, 
  Play, 
  ShieldCheck, 
  Users, 
  Award, 
  HelpCircle, 
  DollarSign, 
  Smartphone, 
  ArrowRight,
  BookOpen,
  MessageCircle,
  Clock,
  Sparkles
} from "lucide-react";

interface LandingPageProps {
  onStartSignUp: () => void;
  onStartLogin: () => void;
}

export default function LandingPage({ onStartSignUp, onStartLogin }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const testimonials = [
    {
      name: "Marcus Gagliardi",
      role: "Trader de Cripto (B3)",
      quote: "Após a mentoria, aprendi a ler a liquidez institucional utilizando Smart Money. Mudei minha consistência de forma inimaginável. A plataforma em formato Netflix faz as aulas parecerem maratona de série!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop"
    },
    {
      name: "Fernanda Lima",
      role: "Trader de Forex (Mesa Proprietária)",
      quote: "O módulo de gerenciamento de risco salvou minha banca. Passei no teste da mesa proprietária de $50k na primeira tentativa seguindo o plano rígido de 1:3. Recomendo de olhos fechados!",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop"
    },
    {
      name: "Rodrigo Mendes",
      role: "Day Trader Iniciante",
      quote: "Eu não sabia ler um gráfico de barras. A didática clara do zero aos conceitos avançados me deu plena confiança para operar sozinho. O suporte do WhatsApp integrado é espetacular.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop"
    }
  ];

  const benefits = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-amber-500" />,
      title: "Método Validado",
      desc: "Estratégias simplificadas e testadas exaustivamente nas principais bolsas de valores e pares de moedas forex."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-amber-500" />,
      title: "Consistência Sólida",
      desc: "Foco absoluto no gerenciamento com risco regulado e leitura de fluxos de dinheiro profissional (SMC)."
    },
    {
      icon: <BookOpen className="h-6 w-6 text-amber-500" />,
      title: "Netflix do Trading",
      desc: "Assista no seu tempo em formato de catálogo por temporadas com capas, controle de progresso e navegação premium."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-amber-500" />,
      title: "Acesso Mobile & Desktop",
      desc: "Prepare o seu plano de operação diário pelo tablet, celular ou computador com total sincronismo de progresso."
    }
  ];

  const faqs = [
    {
      q: "Preciso de experiência prévia para iniciar?",
      a: "Não! O Módulo 1 foi desenhado exatamente para o iniciante do zero absoluto. Você aprenderá desde o conceito fundamental até configurar sua conta de simulação sem riscos."
    },
    {
      q: "Como funciona o formato Netflix de mentoria?",
      a: "As aulas são divididas em módulos sequenciais organizados como episódios de uma temporada. Ao final de cada aula, você clica em marcar como concluída, acompanhando visualmente o seu avanço."
    },
    {
      q: "O que é o Smart Money Concepts (SMC)?",
      a: "É uma metodologia moderna de análise de mercado focada em mapear onde os grandes bancos e instituições financeiras injetam bilhões no gráfico, permitindo operar a favor deles e não contra."
    },
    {
      q: "Como funciona a garantia e o suporte?",
      a: "Oferecemos suporte direto por meio do nosso botão fixo do WhatsApp integrado à mentoria. Você tem 7 dias de garantia incondicional após adquirir a assinatura para avaliar o conteúdo."
    }
  ];

  // WhatsApp click handler
  const handleWhatsAppClick = () => {
    const phoneNumber = "5511999999999"; 
    const text = encodeURIComponent("Olá! Gostaria de saber mais sobre a Mentoria de Trading Premium.");
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500 selection:text-black">
      {/* Target headers */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-zinc-800 transition duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-lg shadow-lg">
              <TrendingUp className="h-6 w-6 text-black" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase">
              TRADER<span className="text-amber-500"> ACADEMIC</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#beneficios" className="hover:text-white transition">Benefícios</a>
            <a href="#modulos" className="hover:text-white transition">Catálogo</a>
            <a href="#depoimentos" className="hover:text-white transition">Depoimentos</a>
            <a href="#precos" className="hover:text-white transition">Planos</a>
            <a href="#faq" className="hover:text-white transition">Dúvidas</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              id="header_login_btn"
              onClick={onStartLogin}
              className="px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white transition"
            >
              Entrar
            </button>
            <button 
              id="header_signup_btn"
              onClick={onStartSignUp}
              className="bg-amber-500 hover:bg-amber-600 text-black px-5 py-2.5 rounded-md text-sm font-semibold transition shadow-md shadow-amber-500/10 active:scale-95"
            >
              Assinar Agora
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden pt-16 pb-28 md:pt-24 md:pb-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7 flex flex-col gap-6 text-center md:text-left">
              <div className="inline-flex items-center self-center md:self-start gap-1.5 bg-neutral-900/90 border border-amber-500/30 px-3 py-1 rounded text-xs font-bold text-amber-500 tracking-wide uppercase">
                <Sparkles className="h-3.5 w-3.5" /> Mentoria Altamente Comercial
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
                O <span className="text-amber-500 underline decoration-amber-500/40">Netflix</span> do Trading de Alta Performance
              </h1>
              
              <p className="text-lg text-zinc-300 font-normal leading-relaxed max-w-2xl">
                Domine o mercado de ações, Forex e criptomoedas com estratégias profissionais de SMC (Smart Money Concepts) e Gerenciamento 1:3. Módulos cinematográficos liberados semanalmente.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 justify-center md:justify-start">
                <button
                  id="hero_cta_signup"
                  onClick={onStartSignUp}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black font-semibold text-base px-8 py-4 rounded-md transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95"
                >
                  <Play className="h-5 w-5 fill-black" /> Começar Maratona
                </button>
                <button
                  id="hero_cta_preview"
                  onClick={onStartLogin}
                  className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-base px-8 py-4 rounded-md border border-zinc-700 transition flex items-center justify-center gap-2"
                >
                  Espiar Catálogo <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-6 mt-6 text-zinc-400 text-xs">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-500" /> +35 horas de conteúdo
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-amber-500" /> 1.2k Alunos Ativos
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" /> Suporte VIP WhatsApp
                </div>
              </div>
            </div>

            <div className="md:col-span-5 relative">
              <div className="relative mx-auto max-w-sm md:max-w-none bg-zinc-900 border border-zinc-800 p-2.5 rounded-2xl shadow-2xl shadow-amber-500/5">
                <img 
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop" 
                  alt="Trading Interface" 
                  className="rounded-xl w-full object-cover aspect-video sm:aspect-square"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                  <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Episódio em Destaque</span>
                  <h3 className="text-xl font-bold mt-1 text-white">Leitura de Liquidez Profissional</h3>
                  <p className="text-xs text-zinc-300 line-clamp-2 mt-1">
                    Como as instituições deixam pegadas gráficas antes de reverter a tendência de preço.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numerical Banner */}
      <section className="bg-zinc-950 border-y border-zinc-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-500">92.4%</div>
              <div className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Satisfação Geral</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">120+</div>
              <div className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Aulas de Alta Resolução</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">R$ 4.2k</div>
              <div className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Média Mensal Alunos</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-500">7 Dias</div>
              <div className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Garantia Incondicional</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">Por que nós?</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">Uma experiência desenhada para reter sua atenção e acelerar lucros</p>
          <p className="text-base text-zinc-400 mt-4">
            Chega de cursos chatos e confusos do YouTube organizados em pastas bagunçadas. Estude com a melhor arquitetura de aprendizado do mercado.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b, i) => (
            <div key={i} className="bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 p-8 rounded-xl transition group duration-300">
              <div className="bg-zinc-950 p-3 rounded-lg w-fit group-hover:scale-110 transition duration-300">
                {b.icon}
              </div>
              <h3 className="text-lg font-bold text-white mt-6 mb-2">{b.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Class Modules Showcase */}
      <section id="modulos" className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">Temporadas de Ensino</h2>
              <p className="text-3xl font-extrabold text-white">Módulos Exclusivos da Grade</p>
            </div>
            <p className="text-sm text-zinc-400 max-w-md">
              Você receberá acesso sequencial e relatórios de progresso intuitivos à medida que avança na jornada do básico ao trader consistente.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group hover:border-amber-500/35 transition duration-300">
              <div className="relative aspect-video">
                <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="Capa" />
                <span className="absolute top-2 left-2 bg-black/80 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded tracking-widest">SEASON 1</span>
              </div>
              <div className="p-5">
                <h4 className="text-base font-bold text-white mb-2 leading-snug">Instalação & Mindset Gráfico</h4>
                <p className="text-xs text-zinc-400 line-clamp-2">Introdução psicológica e configuração de plataformas como Profit Pro e TradingView passo a passo.</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group hover:border-amber-500/35 transition duration-300">
              <div className="relative aspect-video">
                <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="Capa" />
                <span className="absolute top-2 left-2 bg-black/80 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded tracking-widest">SEASON 2</span>
              </div>
              <div className="p-5">
                <h4 className="text-base font-bold text-white mb-2 leading-snug">Price Action & Padrões Sólidos</h4>
                <p className="text-xs text-zinc-400 line-clamp-2">LTA, LTB, Suporte e Resistência de precisão, volumes regulados e velas de reversão técnica.</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group hover:border-amber-500/35 transition duration-300">
              <div className="relative aspect-video">
                <img src="https://images.unsplash.com/photo-1642543348745-03b1219733d9?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="Capa" />
                <span className="absolute top-2 left-2 bg-black/80 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded tracking-widest">SEASON 3</span>
              </div>
              <div className="p-5">
                <h4 className="text-base font-bold text-white mb-2 leading-snug">Institucional SMC Elite</h4>
                <p className="text-xs text-zinc-400 line-clamp-2">Operando a favor dos tubarões. Mapeamento de FVG (Fair Value Gap), Order Blocks e Liquidez.</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group hover:border-amber-500/35 transition duration-300">
              <div className="relative aspect-video">
                <img src="https://images.unsplash.com/photo-1434626881859-194d67b2b86f?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="Capa" />
                <span className="absolute top-2 left-2 bg-black/80 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded tracking-widest">SEASON 4</span>
              </div>
              <div className="p-5">
                <h4 className="text-base font-bold text-white mb-2 leading-snug">Gerenciamento Matemático</h4>
                <p className="text-xs text-zinc-400 line-clamp-2">Gerenciamento profissional com planilhas de cálculo automático de perdas e lucros.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">Quem já maratona</h2>
          <p className="text-3xl font-extrabold text-white">Alunos Satisfeitos Recomendam</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl flex flex-col justify-between">
              <p className="text-sm text-zinc-300 italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-zinc-800">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-amber-500/45" />
                <div>
                  <h5 className="text-sm font-bold text-white">{t.name}</h5>
                  <span className="text-[11px] text-amber-500 font-semibold">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing and Plans */}
      <section id="precos" className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">Subscrições de Acesso</h2>
            <p className="text-3xl font-extrabold text-white">Invista na sua Consistência Gráfica</p>
            <p className="text-sm text-zinc-400 mt-2">Escolha o plano ideal para o seu perfil e comece a maratona agora mesmo.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto">
            {/* Standard Plan */}
            <div className="flex-1 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-zinc-400">PASSE MENSAL</span>
                  <span className="text-xs font-bold bg-zinc-950 px-2 py-0.5 rounded text-zinc-400 border border-zinc-800">RECORRENTE</span>
                </div>
                <div className="flex items-baseline gap-1 mt-2 mb-6">
                  <span className="text-zinc-400 text-sm">R$</span>
                  <span className="text-4xl font-extrabold text-white">97</span>
                  <span className="text-zinc-400 text-sm">/mês</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">Acesso completo ao catálogo base com cancelamento a qualquer hora, perfeito para iniciantes.</p>
                <ul className="space-y-3.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">✔️ Acesso completo a Temporada 1 e 2</li>
                  <li className="flex items-center gap-2">✔️ Downloads de Planilhas Basicas</li>
                  <li className="flex items-center gap-2">✔️ Suporte da Comunidade</li>
                  <li className="flex items-center gap-2 text-zinc-500">❌ Aulas de Estratégia SMC Elite</li>
                  <li className="flex items-center gap-2 text-zinc-500">❌ Acompanhamento WhatsApp VIP</li>
                </ul>
              </div>
              <button
                id="select_plan_monthly"
                onClick={onStartSignUp}
                className="w-full bg-zinc-950 text-white font-semibold text-sm py-3.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition mt-8 active:scale-95"
              >
                Assinar Plano Mensal
              </button>
            </div>

            {/* Premium Gold Plan */}
            <div className="flex-1 bg-zinc-900 border-2 border-amber-500 p-8 rounded-2xl flex flex-col justify-between relative shadow-2xl shadow-amber-500/5 hover:-translate-y-1 transition duration-300">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-amber-500 text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Recomendado
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-amber-500">PASSE ANUAL VIP</span>
                  <span className="text-[10px] font-extrabold bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30">MELHOR VALOR</span>
                </div>
                <div className="flex items-baseline gap-1 mt-2 mb-6">
                  <span className="text-amber-500 text-sm font-semibold">R$</span>
                  <span className="text-5xl font-extrabold text-white">797</span>
                  <span className="text-zinc-400 text-sm">/ano</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed mb-6">Acesso irrestrito de 1 ano com direito aos módulos de elite de SMC e acompanhamento personalizado via WhatsApp.</p>
                <ul className="space-y-3.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">✔️ TODOS os Módulos do Catálogo (Seasons 1 a 4)</li>
                  <li className="flex items-center gap-2">✔️ Planilhas de Risco & Gerenciamento Avançados</li>
                  <li className="flex items-center gap-2">✔️ Suporte direto no WhatsApp VIP (Dúvidas de Operação)</li>
                  <li className="flex items-center gap-2">✔️ Módulos Extras & Lives Gravadas semanais</li>
                  <li className="flex items-center gap-2">✔️ Selo de Aluno Consistente no LMS</li>
                </ul>
              </div>
              <button
                id="select_plan_annual"
                onClick={onStartSignUp}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm py-4 rounded-lg transition mt-8 shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Garantir Vaga Anual VIP
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">Dúvidas Frequentes</h2>
          <p className="text-3xl font-extrabold text-white">Central de Perguntas</p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden transition">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left px-6 py-5 flex justify-between items-center text-sm font-semibold text-white focus:outline-none"
              >
                <span>{f.q}</span>
                <span className="text-amber-500 text-lg">{activeFaq === idx ? "−" : "＋"}</span>
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-6 pt-0 text-xs text-zinc-400 border-t border-zinc-800/40 leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-sm font-bold text-white uppercase">TRADER ACADEMIC</span>
          </div>

          <div className="text-zinc-500 text-center md:text-right">
            <p>© 2026 TRADER ACADEMIC Mentoria de Trading LTDA. Todos os direitos reservados.</p>
            <p className="mt-1 text-[11px] text-zinc-600">Trading envolve sério risco de perda e pode não ser adequado para todos os investidores.</p>
          </div>
        </div>
      </footer>

      {/* Fixed WhatsApp Button */}
      <button
        id="whatsapp_fixed_btn"
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl shadow-green-500/20 hover:scale-110 active:scale-95 transition flex items-center justify-center cursor-pointer"
        title="Falar com Suporte"
      >
        <MessageCircle className="h-7 w-7 fill-white text-[#25D366]" />
      </button>
    </div>
  );
}
