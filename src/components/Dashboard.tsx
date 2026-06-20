import React, { useState, useEffect } from "react";
import { 
  Play, 
  Check, 
  Award, 
  TrendingUp, 
  LogOut, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Lock,
  Compass,
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
  CreditCard,
  X,
  Percent
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, Module, Lesson, VipOffers } from "../types";

function convertToYoutubeEmbedUrl(url: string): string {
  if (!url) return "";
  
  const trimmed = url.trim();
  if (trimmed.includes("youtube.com/embed/")) {
    return trimmed;
  }
  
  let videoId = "";
  
  if (trimmed.includes("v=")) {
    const parts = trimmed.split("v=");
    if (parts[1]) {
      videoId = parts[1].split("&")[0];
    }
  } else if (trimmed.includes("youtu.be/")) {
    const parts = trimmed.split("youtu.be/");
    if (parts[1]) {
      videoId = parts[1].split("?")[0].split("/")[0];
    }
  } else if (trimmed.includes("/shorts/")) {
    const parts = trimmed.split("/shorts/");
    if (parts[1]) {
      videoId = parts[1].split("?")[0].split("/")[0];
    }
  } else if (trimmed.length === 11 && !trimmed.includes("/") && !trimmed.includes(".")) {
    videoId = trimmed;
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  return trimmed;
}

function renderDescriptionWithLinks(text?: string) {
  if (!text) {
    return (
      <p className="text-xs text-zinc-400 leading-relaxed">
        Você pode pausar e reassistir essa mentoria quantas vezes desejar. Mantenha seu diário de trading ao lado para anotar as zonas operacionais ensinadas neste capítulo.
      </p>
    );
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return (
    <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <a 
              key={index} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-amber-500 hover:text-amber-400 underline font-bold transition break-all"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </p>
  );
}

export default function Dashboard({ user, onLogout, onOpenAdmin }: DashboardProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(user);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  
  // Interaction states
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter active states for Favorites and Recents
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'recents'>('all');
  const [favoritesList, setFavoritesList] = useState<string[]>([]);
  const [recentsList, setRecentsList] = useState<string[]>([]);

  // Profile configuration states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profileVip, setProfileVip] = useState(!!currentUser.is_vip);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // VIP Offer states
  const [showVipModal, setShowVipModal] = useState(false);
  const [vipOffers, setVipOffers] = useState<VipOffers | null>(null);

  // Fetch VIP Offers Details
  const fetchVipOffersDetails = async () => {
    try {
      const res = await fetch("/api/vip-offers");
      const data = await res.json();
      if (res.ok && data.success) {
        setVipOffers(data.offers);
      }
    } catch (err) {
      console.error("Erro ao buscar ofertas de VIP:", err);
    }
  };

  // Load fresh profile from backend
  const refreshUserProfile = async () => {
    try {
      const res = await fetch(`/api/users/me?userId=${currentUser.id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setProfileName(data.user.name);
        setProfilePhone(data.user.phone);
        setProfileEmail(data.user.email);
        setProfileVip(!!data.user.is_vip);
      }
    } catch (e) {
      console.error("Erro recarregando perfil:", e);
    }
  };

  // Fetch student activity maps
  const fetchUserActivity = async () => {
    try {
      const res = await fetch(`/api/users/${currentUser.id}/activity`);
      const data = await res.json();
      if (res.ok) {
        setFavoritesList(data.favorites || []);
        setRecentsList(data.recents || []);
      }
    } catch (e) {
      console.error("Erro recarregando atividades:", e);
    }
  };

  // Toggle favorite lesson
  const toggleFavorite = async (lessonId: string) => {
    try {
      const res = await fetch("/api/users/toggle-favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, lessonId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFavoritesList(data.favorites || []);
      }
    } catch (e) {
      console.error("Erro toggling favorite:", e);
    }
  };

  // Add lesson to recently watched
  const registerRecentWatch = async (lessonId: string) => {
    try {
      const res = await fetch("/api/users/add-recent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, lessonId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecentsList(data.recents || []);
      }
    } catch (e) {
      console.error("Erro registrando recente:", e);
    }
  };

  // Handle profile settings save
  const handleSaveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          name: profileName,
          phone: profilePhone,
          email: profileEmail,
          is_vip: profileVip
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        alert("Perfil atualizado com sucesso!");
        setShowProfileModal(false);
      } else {
        alert(data.error || "Erro ao atualizar perfil.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao salvar perfil.");
    }
  };

  // Handle avatar file upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem de avatar selecionada deve ter no máximo 5MB.");
      return;
    }

    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch("/api/users/upload-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            fileName: file.name,
            base64Data: reader.result as string
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCurrentUser(prev => ({ ...prev, avatar_url: data.url }));
          alert("Avatar atualizado com sucesso!");
        } else {
          alert(data.error || "Erro no upload do avatar.");
        }
      } catch (err) {
        console.error(err);
        alert("Erro de conexão ao enviar avatar.");
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.onerror = () => {
      alert("Erro ao ler arquivo.");
      setAvatarUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Fetch modules & progress
  const fetchLmsCatalog = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/modules?userId=${currentUser.id}`);
      const data = await res.json();
      if (res.ok) {
        setModules(data.modules || []);
        setProgress(data.progress || {});
        // Select first module by default if none selected
        if (data.modules && data.modules.length > 0) {
          // Select first unlocked module primarily
          const unlocked = data.modules.filter((m: any) => !(m.is_vip && !currentUser.is_vip && currentUser.role !== "admin"));
          if (unlocked.length > 0) {
            setSelectedModule(unlocked[0]);
            if (unlocked[0].lessons && unlocked[0].lessons.length > 0) {
              setActiveLesson(unlocked[0].lessons[0]);
            }
          } else {
            setSelectedModule(data.modules[0]);
            if (data.modules[0].lessons && data.modules[0].lessons.length > 0) {
              setActiveLesson(data.modules[0].lessons[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar catálogo da mentoria:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLmsCatalog();
    fetchUserActivity();
    refreshUserProfile();
    fetchVipOffersDetails();
  }, [currentUser.id, currentUser.is_vip]);

  // Auto-trigger VIP Offer modal for non-vip students on login/dashboard mount
  useEffect(() => {
    if (currentUser && !currentUser.is_vip && currentUser.role !== "admin") {
      const hasShown = sessionStorage.getItem(`vip_prompt_shown_${currentUser.id}`);
      if (!hasShown) {
        setShowVipModal(true);
        sessionStorage.setItem(`vip_prompt_shown_${currentUser.id}`, "true");
      }
    }
  }, [currentUser?.id, currentUser?.is_vip]);

  // Handle lesson progress toggle
  const toggleLessonWatched = async (lessonId: string, isCompleted: boolean) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/lessons/${lessonId}/toggle-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, completed: isCompleted })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProgress(data.progress);
        if (isCompleted) {
          registerRecentWatch(lessonId);
        }
      }
    } catch (error) {
      console.error("Erro toggling progress:", error);
    } finally {
      setActionLoading(false);
    }
  };;

  // Helper: compute module completion metrics
  const getModuleMetrics = (mod: Module) => {
    const modLessons = mod.lessons || [];
    if (modLessons.length === 0) return { count: 0, watched: 0, percent: 0 };
    
    const watched = modLessons.filter(l => progress[l.id]).length;
    const percent = Math.round((watched / modLessons.length) * 100);
    return { count: modLessons.length, watched, percent };
  };

  // Helper: compute global progress
  const getGlobalMetrics = () => {
    let total = 0;
    let watched = 0;
    modules.forEach(m => {
      const ml = m.lessons || [];
      total += ml.length;
      ml.forEach(l => {
        if (progress[l.id]) watched++;
      });
    });
    return total === 0 ? 0 : Math.round((watched / total) * 100);
  };

  return (
    <div id="progresso" className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-black flex flex-col lg:flex-row">
      
      {/* High Density Premium Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-black border-r border-zinc-900 p-6 shrink-0 h-screen sticky top-0 justify-between">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-1.5 rounded">
              <TrendingUp className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-black tracking-tight text-white uppercase">
              TRADER<span className="text-amber-500"> ACADEMIC</span>
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold transition text-left w-full cursor-pointer ${
                activeFilter === 'all' ? 'bg-zinc-900 text-amber-500 font-extrabold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🏠</span> <span className="ml-1 text-xs uppercase tracking-wide">Início / Grade</span>
            </button>
            <button
               onClick={() => setActiveFilter('favorites')}
               className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold transition text-left w-full cursor-pointer ${
                 activeFilter === 'favorites' ? 'bg-zinc-900 text-amber-500 font-extrabold' : 'text-zinc-400 hover:text-white'
               }`}
            >
               <span>⭐</span> <span className="ml-1 text-xs uppercase tracking-wide">Meus Favoritos</span>
            </button>
            <button
               onClick={() => setActiveFilter('recents')}
               className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold transition text-left w-full cursor-pointer ${
                 activeFilter === 'recents' ? 'bg-zinc-900 text-amber-500 font-extrabold' : 'text-zinc-400 hover:text-white'
               }`}
            >
               <span>🕒</span> <span className="ml-1 text-xs uppercase tracking-wide">Vídeos Recentes</span>
            </button>
            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold text-zinc-400 hover:text-white transition text-left w-full cursor-pointer"
            >
              <span>👤</span> <span className="ml-1 text-xs uppercase tracking-wide">Ajustar Perfil</span>
            </button>
            {currentUser.role === "admin" && (
              <>
                <div className="text-[9px] text-zinc-600 tracking-widest font-black uppercase mt-6 mb-1 px-3">Administração</div>
                <button 
                  onClick={onOpenAdmin} 
                  className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded text-sm font-semibold text-zinc-400 hover:text-amber-500 transition cursor-pointer"
                >
                  <span>⚙️</span> <span className="ml-1 text-xs uppercase tracking-wide">Painel Admin</span>
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-lg">
          <div className="text-xs font-bold text-zinc-300 flex items-center gap-1">Status do Passe {currentUser.is_vip && "💎"}</div>
          <div className="text-[11px] font-extrabold mt-0.5">
            {currentUser.is_vip ? (
              <span className="text-amber-500">Membro VIP Diamante</span>
            ) : (
              <span className="text-zinc-500">Membro Gratuito</span>
            )}
          </div>
          {!currentUser.is_vip && (
            <button
               onClick={async () => {
                 try {
                   const res = await fetch("/api/users/update-profile", {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({ userId: currentUser.id, is_vip: true })
                   });
                   const data = await res.json();
                   if (res.ok && data.success) {
                     setCurrentUser(data.user);
                     alert("Parabéns! Você ativou sua assinatura VIP com sucesso! Todos os módulos exclusivos foram liberados.");
                   }
                 } catch (err) { console.error(err); }
               }}
               className="mt-3.5 w-full bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black py-2 rounded text-center transition tracking-wider uppercase inline-block cursor-pointer"
            >
              Ativar Passe VIP Grátis
            </button>
          )}
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden mt-3.5 border border-zinc-805">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${getGlobalMetrics()}%` }}></div>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        
        {/* Top Navbar */}
        <header className="h-20 bg-black/90 border-b border-zinc-900 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur w-full">
          <div className="flex items-center gap-8">
            <div className="flex lg:hidden items-center gap-2">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-1.5 rounded">
                <TrendingUp className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-black tracking-tight text-white uppercase">
                TRADER<span className="text-amber-500"> ACADEMIC</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-6 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`transition cursor-pointer ${activeFilter === 'all' ? 'text-amber-500 font-extrabold' : 'hover:text-white'}`}
              >
                Navegar
              </button>
              <button 
                onClick={() => setActiveFilter('favorites')}
                className={`transition cursor-pointer ${activeFilter === 'favorites' ? 'text-amber-500 font-extrabold' : 'hover:text-white'}`}
              >
                Favoritos ({favoritesList.length})
              </button>
              <button 
                onClick={() => setActiveFilter('recents')}
                className={`transition cursor-pointer ${activeFilter === 'recents' ? 'text-amber-500 font-extrabold' : 'hover:text-white'}`}
              >
                Recentes ({recentsList.length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="stat-pill hidden md:flex">
              <span className="text-emerald-500 animate-pulse text-xs">●</span> 1.240 Alunos Online
            </div>

            {currentUser.role === "admin" && (
              <button
                id="admin_panel_open_btn"
                onClick={onOpenAdmin}
                className="bg-zinc-900 hover:bg-zinc-800 text-amber-500 text-xs font-bold px-3.5 py-2 rounded border border-amber-500/25 flex items-center gap-1.5 active:scale-95 transition cursor-pointer mt-0.5"
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Painel Admin
              </button>
            )}

            <div 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition select-none"
              title="Meu Perfil / Configurações"
            >
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-zinc-200 leading-none group-hover:text-amber-500 transition">{currentUser.name} {currentUser.is_vip && "💎"}</span>
                <span className="text-[9px] font-mono text-zinc-500 mt-1">{currentUser.email}</span>
              </div>
              
              {currentUser.avatar_url ? (
                <div className="w-8 h-8 rounded border border-zinc-700 bg-zinc-950 shrink-0 overflow-hidden relative">
                  <img src={currentUser.avatar_url} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center font-bold text-black text-xs uppercase shrink-0 shadow-inner">
                  {currentUser.name.substring(0, 2)}
                </div>
              )}
            </div>

            <button
              id="student_logout_btn"
              onClick={onLogout}
              className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition active:scale-95 cursor-pointer"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col justify-center items-center gap-4 py-20">
            <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-400 text-sm font-semibold tracking-wide">Carregando catálogo cinematográfico...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
          
          {/* Main Hero Backstage Banner */}
          {activeLesson && (
            <section className="relative w-full bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-900 py-8 lg:py-12 px-4 sm:px-8">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-center">
                
                {/* Embedded Video Display Player */}
                <div className="lg:col-span-7">
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800 ring-4 ring-black/40">
                    <iframe
                      src={convertToYoutubeEmbedUrl(activeLesson.youtube_url)}
                      title={activeLesson.title}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>

                {/* Lesson Context Information */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <span className="inline-flex items-center gap-1.5 self-start text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2.5 py-1 rounded uppercase tracking-widest">
                    <Play className="h-2.5 w-2.5 fill-amber-500" /> Assistindo Agora
                  </span>
                  
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    {activeLesson.title}
                  </h2>

                  <div className="flex items-center gap-4 text-xs text-zinc-400 font-semibold">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-amber-500" /> Duração: {activeLesson.duration}
                    </div>
                    {selectedModule && (
                      <div className="text-zinc-500">
                        Pertence ao: <span className="text-zinc-300 font-bold">{selectedModule.title}</span>
                      </div>
                    )}
                  </div>

                  {renderDescriptionWithLinks(activeLesson.description)}

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    {progress[activeLesson.id] ? (
                      <button
                        onClick={() => toggleLessonWatched(activeLesson.id, false)}
                        disabled={actionLoading}
                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-6 py-4 rounded flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
                      >
                        <Check className="h-4 w-4 stroke-[3px]" /> Concluída! Desmarcar
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleLessonWatched(activeLesson.id, true)}
                        disabled={actionLoading}
                        className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs px-6 py-4 rounded flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
                      >
                        Marcar como Concluída
                      </button>
                    )}
                    
                    <a
                      href="https://tradingview.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none border border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white font-semibold text-xs px-5 py-4 rounded flex items-center justify-center gap-2 transition"
                    >
                      Abrir Gráfico Auxiliar <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* User Progress Banner Overview */}
          <section className="bg-zinc-900 py-6 px-4 sm:px-8 border-b border-zinc-800">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-zinc-800 to-zinc-950 px-4 py-3 rounded-xl border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">TEU PROGRESSO</span>
                  <span className="text-2xl font-black text-amber-500 mt-1 block">{getGlobalMetrics()}%</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">Seu nível operacional expandindo</h3>
                  <p className="text-xs text-zinc-400">Assista todas as temporadas para garantir sua consistência e mentoria completa.</p>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="flex-1 max-w-md hidden md:block">
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-300" 
                    style={{ width: `${getGlobalMetrics()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </section>

          {/* Modules Catalogue Grid (Netflix Horizontal Vibe) */}
          {activeFilter !== 'all' ? (
            <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-8 animate-fade-in">
              <div>
                <h3 className="text-sm font-black uppercase text-amber-500 tracking-wider mb-2 flex items-center gap-1.5 uppercase">
                  {activeFilter === 'favorites' ? '⭐ Meus Favoritos' : '🕒 Vídeos Recentes'}
                </h3>
                <p className="text-xs text-zinc-400 mb-6 font-semibold">
                  {activeFilter === 'favorites' 
                    ? 'Lista de videoaulas operacionais que você favoritou para estudar novamente.' 
                    : 'Histórico das últimas aulas de trading que você assistiu recentemente.'}
                </p>

                <div className="space-y-3">
                  {(() => {
                    const lessonsToMap = (() => {
                      const list: { lesson: Lesson; module: Module }[] = [];
                      modules.forEach(mod => {
                        const ml = mod.lessons || [];
                        ml.forEach(les => {
                          list.push({ lesson: les, module: mod });
                        });
                      });

                      if (activeFilter === 'favorites') {
                        return list.filter(item => favoritesList.includes(item.lesson.id));
                      }
                      
                      const filtered = list.filter(item => recentsList.includes(item.lesson.id));
                      return filtered.sort((a, b) => {
                        const indexA = recentsList.indexOf(a.lesson.id);
                        const indexB = recentsList.indexOf(b.lesson.id);
                        return indexB - indexA;
                      });
                    })();

                    return lessonsToMap.length > 0 ? (
                      lessonsToMap.map(({ lesson, module }, idx) => {
                        const isWatching = activeLesson?.id === lesson.id;
                        const isWatched = progress[lesson.id];
                        const isFav = favoritesList.includes(lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border transition gap-4 ${
                              isWatching
                                ? "bg-amber-500/5 border-amber-500"
                                : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/80 hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <button
                                onClick={() => {
                                  const isLocked = module.is_vip && !currentUser.is_vip && currentUser.role !== "admin";
                                  if (isLocked) {
                                    setShowVipModal(true);
                                    return;
                                  }
                                  setActiveLesson(lesson);
                                  setSelectedModule(module);
                                  registerRecentWatch(lesson.id);
                                }}
                                className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center transition cursor-pointer ${
                                  isWatching 
                                    ? "bg-amber-500 text-black" 
                                    : "bg-zinc-850 text-zinc-400 hover:text-white"
                                }`}
                              >
                                <Play className={`h-4 w-4 ${isWatching ? "fill-black text-black" : "fill-transparent"}`} />
                              </button>
                              
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">TEMP: {module.title}</span>
                                  {isWatched && (
                                    <span className="bg-green-600/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-0.5">
                                      <Check className="h-2.5 w-2.5 stroke-[3px]" /> Concluído
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-bold text-white mt-0.5">{lesson.title}</h4>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 justify-between w-full md:w-auto border-t border-zinc-900 md:border-0 pt-3.5 md:pt-0">
                              <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-zinc-500" /> Duração: {lesson.duration}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    const isLocked = module.is_vip && !currentUser.is_vip && currentUser.role !== "admin";
                                    if (isLocked) {
                                      setShowVipModal(true);
                                      return;
                                    }
                                    setActiveLesson(lesson);
                                    setSelectedModule(module);
                                    registerRecentWatch(lesson.id);
                                  }}
                                  className={`text-xs px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                                    isWatching 
                                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                                      : "bg-zinc-850 hover:bg-zinc-850 text-zinc-300 border border-zinc-800"
                                  }`}
                                >
                                  {isWatching ? "Lendo..." : "Assistir"}
                                </button>

                                <button
                                  onClick={() => toggleLessonWatched(lesson.id, !isWatched)}
                                  className={`h-8 w-8 rounded flex items-center justify-center border transition active:scale-90 cursor-pointer ${
                                    isWatched 
                                      ? "bg-green-600 border-green-700 text-white" 
                                      : "bg-zinc-950 hover:bg-zinc-900 border-zinc-805 text-zinc-600"
                                  }`}
                                >
                                  <Check className="h-4 w-4 stroke-[3.5px]" />
                                </button>

                                <button
                                  onClick={() => toggleFavorite(lesson.id)}
                                  className={`h-8 w-8 rounded flex items-center justify-center border transition active:scale-90 cursor-pointer ${
                                    isFav
                                      ? "bg-amber-500/15 border-amber-500/40 text-amber-500"
                                      : "bg-zinc-950 hover:bg-zinc-900 border-zinc-805 text-zinc-500 hover:text-zinc-300"
                                  }`}
                                  title="Favorito"
                                >
                                  <span>★</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 text-zinc-500 text-xs flex flex-col items-center justify-center gap-2">
                        <span>📪</span>
                        <span>Nenhum vídeo listado nesta categoria ainda. Curta algumas videoaulas para preencher!</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </section>
          ) : (
            <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-10">
              <div>
                <h3 className="text-sm font-black uppercase text-zinc-500 tracking-wider mb-6 flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-amber-500" /> temporadas disponíveis
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {modules.map((mod) => {
                    const metrics = getModuleMetrics(mod);
                    const isSelected = selectedModule?.id === mod.id;
                    const isLocked = mod.is_vip && !currentUser.is_vip && currentUser.role !== "admin";

                    return (
                      <div
                        key={mod.id}
                        onClick={() => {
                          if (isLocked) {
                            setShowVipModal(true);
                            return;
                          }
                          setSelectedModule(mod);
                        }}
                        className={`group relative bg-zinc-900 rounded-xl overflow-hidden border transition duration-300 flex flex-col justify-between cursor-pointer ${
                          isLocked ? "opacity-60 hover:opacity-75" : ""
                        } ${
                          isSelected 
                            ? "border-amber-500 shadow-xl shadow-amber-500/5 -translate-y-1.5" 
                            : "border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        {/* Cap Cover */}
                        <div className="relative aspect-video">
                          <img 
                            referrerPolicy="no-referrer"
                            src={mod.cover_image_url} 
                            alt={mod.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          {isLocked && (
                            <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                              <Lock className="h-7 w-7 text-amber-500" />
                              <span className="text-[9px] font-black text-amber-500 tracking-widest uppercase bg-zinc-950/90 px-2.5 py-1 rounded-full border border-amber-500/30">MÓDULO VIP</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"></div>
                          {!isLocked && (
                            <span className="absolute bottom-2 left-2.5 text-[10px] font-black text-amber-500 drop-shadow uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded">
                              {metrics.watched}/{metrics.count} AULAS CONCLUÍDAS
                            </span>
                          )}
                        </div>

                        {/* Info body */}
                        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              {mod.is_vip && (
                                <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                                  👑 PREMIUM VIP
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-extrabold text-white leading-tight group-hover:text-amber-500 transition">
                              {mod.title}
                            </h4>
                            <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                              {mod.description}
                            </p>
                          </div>

                          {/* Visual completion slider indicator */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500">
                              <span>PROGRESSO</span>
                              <span>{metrics.percent}%</span>
                            </div>
                            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-500" 
                                style={{ width: `${metrics.percent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Module Detail - Episodes Layout and list */}
              {selectedModule && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mt-4 animate-fade-in">
                  <div className="flex flex-col md:flex-row justify-between md:items-start border-b border-zinc-800 pb-6 mb-6 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest block mb-1">MÓDULO SELECIONADO</span>
                      <h3 className="text-2xl font-black text-white">{selectedModule.title}</h3>
                      <p className="text-xs text-zinc-400 max-w-2xl mt-1">{selectedModule.description}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800/60 w-fit">
                      <BookOpen className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-zinc-300 font-bold">Temporada de {selectedModule.lessons?.length || 0} aulas</span>
                    </div>
                  </div>

                  {/* Lessons cards as a vertical stack */}
                  <div className="space-y-3">
                    {selectedModule.lessons && selectedModule.lessons.length > 0 ? (
                      selectedModule.lessons.map((les, index) => {
                        const isWatching = activeLesson?.id === les.id;
                        const isWatched = progress[les.id];
                        const isFav = favoritesList.includes(les.id);

                        return (
                          <div
                            key={les.id}
                            className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border transition gap-4 ${
                              isWatching
                                ? "bg-amber-500/5 border-amber-500"
                                : "bg-zinc-950/40 border-zinc-800/80 hover:bg-zinc-950/80 hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              {/* Watch play trigger icon indicator */}
                              <button
                                onClick={() => {
                                  setActiveLesson(les);
                                  registerRecentWatch(les.id);
                                }}
                                className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center transition cursor-pointer ${
                                  isWatching 
                                    ? "bg-amber-500 text-black" 
                                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                                }`}
                              >
                                <Play className={`h-4 w-4 ${isWatching ? "fill-black text-black" : "fill-transparent"}`} />
                              </button>
                              
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-zinc-500 font-mono text-xs">AULA #{index + 1}</span>
                                  {isWatched && (
                                    <span className="bg-green-600/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-0.5">
                                      <Check className="h-2.5 w-2.5 stroke-[3px]" /> Concluído
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-bold text-white mt-0.5">{les.title}</h4>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 justify-between w-full md:w-auto border-t border-zinc-900 md:border-0 pt-3.5 md:pt-0">
                              <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-zinc-500" /> Duração: {les.duration}
                              </span>

                              <div className="flex items-center gap-2">
                                {/* Action watching trigger */}
                                <button
                                  onClick={() => {
                                    setActiveLesson(les);
                                    registerRecentWatch(les.id);
                                  }}
                                  className={`text-xs px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                                    isWatching 
                                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                                  }`}
                                >
                                  {isWatching ? "No Player" : "Assistir"}
                                </button>

                                {/* Watch completeness visual check button */}
                                <button
                                  onClick={() => toggleLessonWatched(les.id, !isWatched)}
                                  className={`h-8 w-8 rounded flex items-center justify-center border transition active:scale-90 cursor-pointer ${
                                    isWatched 
                                      ? "bg-green-600 border-green-700 text-white" 
                                      : "bg-zinc-950 hover:bg-zinc-900 border-zinc-800"
                                  }`}
                                  title={isWatched ? "Marcar como não assistida" : "Marcar como assistida"}
                                >
                                  <Check className="h-4 w-4 stroke-[3.5px]" />
                                </button>

                                {/* Favorite lesson trigger */}
                                <button
                                  onClick={() => toggleFavorite(les.id)}
                                  className={`h-8 w-8 rounded flex items-center justify-center border transition active:scale-90 cursor-pointer ${
                                    isFav
                                      ? "bg-amber-500/15 border-amber-500/40 text-amber-500"
                                      : "bg-zinc-950 hover:bg-zinc-950/80 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                                  }`}
                                  title={isFav ? "Remover dos favoritos" : "Favoritar aula"}
                                >
                                  <span>★</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-zinc-500 text-xs">
                        Nenhuma Aula Cadastrada neste módulo ainda. Retorne em breve para novos uploads!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

        </div>
      )}

      </div> {/* End right-side scroll viewport */}

      {/* STUDENT PERSONAL PROFILE ADJUSTMENTS MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 overflow-hidden max-h-[90vh] flex flex-col justify-between shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">Configurar meu Perfil Estagiário</h3>
                <p className="text-[10px] text-zinc-500">Trader Academic • Configurações Pessoais</p>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-zinc-500 hover:text-zinc-300 transition text-sm cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            <form onSubmit={handleSaveProfileSettings} className="space-y-4 flex-1 overflow-y-auto pr-1">
              {/* Avatar upload files component */}
              <div className="bg-zinc-950 p-4 border border-zinc-805 rounded-xl space-y-3">
                <label className="text-xs font-black text-amber-500 tracking-wider block uppercase">Foto do Perfil (Avatar)</label>
                
                <div className="flex items-center gap-4">
                  {currentUser.avatar_url ? (
                    <div className="h-16 w-16 rounded overflow-hidden border border-zinc-850 shrink-0 bg-black">
                      <img src={currentUser.avatar_url} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded bg-amber-500 flex items-center justify-center font-black text-black text-lg uppercase shrink-0">
                      {currentUser.name.substring(0, 2)}
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      disabled={avatarUploading}
                      id="avatar-upload-file-input"
                      className="hidden"
                    />
                    <label 
                      htmlFor="avatar-upload-file-input"
                      className="inline-flex select-none items-center justify-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-[10px] tracking-wider uppercase px-4 py-2.5 rounded cursor-pointer transition active:scale-95"
                    >
                      {avatarUploading ? "Enviando arquivo..." : "Escolher Arquivo..."}
                    </label>
                    <p className="text-[9px] text-zinc-500">Formatos recomendados: PNG, JPG ou GIF.</p>
                  </div>
                </div>
              </div>

              {/* Name Details */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">Nome Completo</label>
                <input 
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-sm p-3 rounded focus:outline-none focus:border-amber-500/50 text-zinc-200"
                />
              </div>

              {/* WhatsApp Details */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">Número do WhatsApp (Obrigatório)</label>
                <input 
                  type="text"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-sm p-3 rounded focus:outline-none focus:border-amber-500/50 text-zinc-200 font-mono"
                />
              </div>

              {/* Email details */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">Email Acadêmico</label>
                <input 
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-sm p-3 rounded focus:outline-none focus:border-amber-500/50 text-zinc-200"
                />
              </div>

              {/* VIP simulator switch */}
              <div className="pt-2 flex items-center justify-between bg-zinc-950 p-4 border border-zinc-805 rounded-xl">
                <div>
                  <label className="text-xs font-black text-amber-500 flex items-center gap-1 pb-0.5">
                    💎 MEMBRO DE ACESSO VIP
                  </label>
                  <p className="text-[9px] text-zinc-400">Ative ou remova o passe VIP para simular ou assistir módulos bloqueados.</p>
                </div>
                <input 
                  type="checkbox"
                  checked={profileVip}
                  onChange={(e) => setProfileVip(e.target.checked)}
                  className="h-5 w-5 rounded border-zinc-800 accent-amber-500 bg-zinc-950 cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 text-xs py-3.5 rounded font-bold cursor-pointer transition text-center"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black text-xs py-3.5 rounded font-extrabold cursor-pointer transition text-center active:scale-95"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANIMATED CHOOSE OFFER VIP MODAL */}
      <AnimatePresence>
        {showVipModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-5xl overflow-hidden p-6 md:p-8 relative shadow-2xl shadow-amber-500/5 my-8 text-white font-sans"
            >
              {/* Decorative gold glowing aura */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Close Button */}
              <button 
                onClick={() => setShowVipModal(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-500 hover:text-white transition p-2 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-805 rounded-full cursor-pointer flex items-center justify-center z-10"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                
                {/* LADO ESQUERDO: DESCRICÃO DETALHADA E FORMATADA */}
                <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r border-zinc-900 pb-6 lg:pb-0 lg:pr-6 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="h-3 w-3 fill-amber-500 animate-pulse" /> Conteúdo Exclusivo VIP
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
                    🚀 Plano VIP Trader Hiove | Formação Completa do Zero ao Avançado
                  </h2>
                  
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    Tenha acesso a um ecossistema completo de aprendizado e evolução no mercado financeiro com o nosso Plano VIP Trader, desenvolvido para quem quer operar com mais consistência, leitura de mercado e gestão profissional.
                  </p>

                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                      📊 O que você recebe no VIP:
                    </h3>
                    
                    <ul className="space-y-2 text-xs text-zinc-350">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold shrink-0">✔</span>
                        <span>+30 aulas completas e estruturadas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold shrink-0">✔</span>
                        <span>Ensino de Forex, Opções Binárias, B3 e Criptoativos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold shrink-0">✔</span>
                        <span>E-books exclusivos para estudo e aprofundamento</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold shrink-0">✔</span>
                        <span>Planilha profissional de gestão de risco e performance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold shrink-0">✔</span>
                        <span>Acompanhamento estratégico para evolução real</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold shrink-0">✔</span>
                        <span>Aulas teóricas e práticas para aplicação no mercado</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2.5 pt-3 text-xs text-zinc-400 border-t border-zinc-900">
                    <p className="leading-relaxed bg-zinc-900/40 p-3 rounded-xl border border-zinc-850/80">
                      <span className="mr-1">💡</span> <strong>Aqui você não aprende apenas teoria</strong> — você aprende a entender o mercado, estruturar operações e desenvolver disciplina de trader profissional.
                    </p>
                    <p className="leading-relaxed flex gap-2">
                      <span className="text-amber-500 font-bold shrink-0">📈</span>
                      <span>Ideal para quem busca consistência, controle emocional e leitura técnica no dia a dia do trading.</span>
                    </p>
                    <p className="leading-relaxed flex gap-2 text-amber-400 font-bold">
                      <span className="shrink-0">🔥</span>
                      <span>Transforme seu conhecimento em habilidade real de operação.</span>
                    </p>
                    <p className="leading-relaxed flex gap-2 text-white font-medium">
                      <span className="shrink-0">💬</span>
                      <span>Entre no VIP e comece sua evolução hoje.</span>
                    </p>
                  </div>
                </div>

                {/* LADO DIREITO: OPÇÕES DE PLANOS (MENSAL E VITALÍCIO) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6 text-left">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">Escolha o seu plano de acesso</h3>
                    <p className="text-xs text-zinc-400">Selecione uma das opções abaixo para ser direcionado ao atendimento exclusivo no Telegram.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* PLANO MENSAL CARD */}
                    <div className="bg-zinc-900/40 border border-zinc-850 hover:border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-5 transition duration-300">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-base font-black text-white">
                              {vipOffers?.monthly_title || "Plano Mensal Premium"}
                            </h4>
                            <p className="text-zinc-500 text-[10px] mt-0.5">Assinatura recorrente</p>
                          </div>
                          <span className="p-2 bg-zinc-950 rounded-lg text-zinc-400 border border-zinc-850 flex items-center justify-center">
                            <CreditCard className="h-4 w-4" />
                          </span>
                        </div>

                        <div className="pt-1">
                          <span className="text-[10px] text-zinc-400 block font-bold">Por apenas</span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xs font-bold text-zinc-400">12x de</span>
                            <span className="text-2xl font-black text-amber-500 tracking-tight">
                              R$ {vipOffers?.monthly_installment_value || "9,70"}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 mt-1 block">
                            Ou R$ {vipOffers?.monthly_price || "97,00"} à vista
                          </span>
                        </div>

                        <ul className="space-y-1.5 text-[11px] text-zinc-400 border-t border-zinc-900/80 pt-2">
                          <li className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-amber-500 shrink-0" />
                            <span>Acesso imediato</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-amber-500 shrink-0" />
                            <span>Aulas exclusivas</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-amber-500 shrink-0" />
                            <span>Suporte VIP 1-on-1</span>
                          </li>
                        </ul>
                      </div>

                      <a 
                        href={`https://t.me/aprendendo_trading?text=${encodeURIComponent("eu gostaria de ter o acesso vip mensal")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-extrabold text-xs py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        Falar no Telegram <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    {/* PLANO VITALICIO CARD */}
                    <div className="bg-zinc-900 border-2 border-amber-500 shadow-xl shadow-amber-500/5 rounded-2xl p-5 flex flex-col justify-between space-y-5 relative transition duration-300">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow border border-amber-600">
                        🔥 MELHOR OFERTA • ÚNICO
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-start pt-1">
                          <div>
                            <h4 className="text-base font-black text-white flex items-center gap-1">
                              {vipOffers?.lifetime_title || "Acesso Vitalício Black"} <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            </h4>
                            <p className="text-amber-500 text-[10px] mt-0.5 font-bold">Sem mensalidades!</p>
                          </div>
                          <span className="p-2 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 flex items-center justify-center">
                            <Award className="h-4 w-4" />
                          </span>
                        </div>

                        <div className="pt-1">
                          <span className="text-[10px] text-zinc-400 block font-bold">Por apenas</span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xs font-bold text-zinc-400">12x de</span>
                            <span className="text-2xl font-black text-amber-500 tracking-tight">
                              R$ {vipOffers?.lifetime_installment_value || "49,70"}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 mt-1 block font-bold">
                            Ou R$ {vipOffers?.lifetime_price || "497,00"} à vista
                          </span>
                        </div>

                        <ul className="space-y-1.5 text-[11px] text-zinc-400 border-t border-zinc-900/80 pt-2">
                          <li className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-amber-500 shrink-0" />
                            <span className="text-amber-400 font-bold">Acesso vitalício integral</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-amber-500 shrink-0" />
                            <span>Suporte no WhatsApp</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-amber-500 shrink-0" />
                            <span>Planilhas de Gestão</span>
                          </li>
                        </ul>
                      </div>

                      <a 
                        href={`https://t.me/aprendendo_trading?text=${encodeURIComponent("eu gostaria de ter acesso vip vitalicio")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center bg-amber-500 hover:bg-amber-600 text-black font-black text-xs py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/15 active:scale-95"
                      >
                        Garantir no Telegram <ExternalLink className="h-3.5 w-3.5 stroke-[2.5px]" />
                      </a>
                    </div>

                  </div>

                  {/* Safety guaranteed */}
                  <div className="text-center pt-2 text-[10px] text-zinc-500 flex items-center justify-center gap-1.5 border-t border-zinc-900">
                    <Percent className="h-3.5 w-3.5 text-zinc-650" />
                    <span>Plataforma 100% Segura. Satisfação Garantida ou 7 dias de Reembolso Integral.</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
