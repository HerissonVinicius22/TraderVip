import React, { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  BarChart, 
  Plus, 
  Trash2, 
  Edit, 
  Lock, 
  Check, 
  ArrowLeft, 
  Upload, 
  UserMinus, 
  UserCheck, 
  RotateCcw,
  Sparkles,
  Youtube,
  Clock,
  Smartphone,
  Mail,
  X,
  FileText
} from "lucide-react";
import { UserProfile, Module, Lesson, DashboardStats, VipOffers } from "../types";

interface AdminPanelProps {
  adminUser: UserProfile;
  onCloseAdmin: () => void;
}

// Student safe structure with progress
interface CompiledStudent {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: "admin" | "student";
  is_blocked: boolean;
  is_vip?: boolean;
  avatar_url?: string;
  created_at: string;
  passwordPreview: string;
  completedLessonsCount: number;
  acceptedTerms: boolean;
  acceptedTermsAt?: string;
}

export default function AdminPanel({ adminUser, onCloseAdmin }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "students" | "content" | "offers">("stats");
  
  // Data states
  const [students, setStudents] = useState<CompiledStudent[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalStudents: 0, activeStudents: 0, averageProgress: 0 });
  const [modules, setModules] = useState<Module[]>([]);
  
  // Loading indicators
  const [isLoading, setIsLoading] = useState(true);
  const [operationMsg, setOperationMsg] = useState<string | null>(null);

  // Modal active states
  const [editingStudent, setEditingStudent] = useState<CompiledStudent | null>(null);
  const [passwordResetStudent, setPasswordResetStudent] = useState<CompiledStudent | null>(null);
  
  // Content addition/editing form inputs
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [modEditingId, setModEditingId] = useState<string | null>(null);
  const [modTitle, setModTitle] = useState("");
  const [modDesc, setModDesc] = useState("");
  const [modCoverUrl, setModCoverUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Lesson addition form inputs
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lesEditingId, setLesEditingId] = useState<string | null>(null);
  const [lesModId, setLesModId] = useState("");
  const [lesTitle, setLesTitle] = useState("");
  const [lesYoutubeUrl, setLesYoutubeUrl] = useState("");
  const [lesDuration, setLesDuration] = useState("");

  // Edit student inputs
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "student">("student");
  const [editIsVip, setEditIsVip] = useState(false);
  const [modIsVip, setModIsVip] = useState(false);
  
  // Reset password state
  const [newPassword, setNewPassword] = useState("");

  // VIP offers configuration inputs
  const [monthlyTitle, setMonthlyTitle] = useState("Plano Mensal Premium");
  const [monthlyPrice, setMonthlyPrice] = useState("97,00");
  const [monthlyInstallmentValue, setMonthlyInstallmentValue] = useState("9,70");
  const [monthlyCheckoutUrl, setMonthlyCheckoutUrl] = useState("https://kiwify.com.br");

  const [lifetimeTitle, setLifetimeTitle] = useState("Acesso Vitalício Black");
  const [lifetimePrice, setLifetimePrice] = useState("497,00");
  const [lifetimeInstallmentValue, setLifetimeInstallmentValue] = useState("49,70");
  const [lifetimeCheckoutUrl, setLifetimeCheckoutUrl] = useState("https://kiwify.com.br");

  const [isSavingOffers, setIsSavingOffers] = useState(false);

  const loadAllAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch users
      const usersRes = await fetch(`/api/admin/users?adminId=${adminUser.id}`);
      const usersData = await usersRes.json();
      if (usersRes.ok) {
        setStudents(usersData.users || []);
      }

      // Fetch stats
      const statsRes = await fetch(`/api/admin/stats?adminId=${adminUser.id}`);
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData || { totalStudents: 0, activeStudents: 0, averageProgress: 0 });
      }

      // Fetch modules
      const modRes = await fetch(`/api/modules?userId=${adminUser.id}`);
      const modData = await modRes.json();
      if (modRes.ok) {
        setModules(modData.modules || []);
      }

      // Fetch VIP Offers configuration
      const offersRes = await fetch("/api/vip-offers");
      const offersData = await offersRes.json();
      if (offersRes.ok && offersData.success && offersData.offers) {
        const o = offersData.offers;
        setMonthlyTitle(o.monthly_title || "Plano Mensal Premium");
        setMonthlyPrice(o.monthly_price || "97,00");
        setMonthlyInstallmentValue(o.monthly_installment_value || "9,70");
        setMonthlyCheckoutUrl(o.monthly_checkout_url || "https://kiwify.com.br");
        setLifetimeTitle(o.lifetime_title || "Acesso Vitalício Black");
        setLifetimePrice(o.lifetime_price || "497,00");
        setLifetimeInstallmentValue(o.lifetime_installment_value || "49,70");
        setLifetimeCheckoutUrl(o.lifetime_checkout_url || "https://kiwify.com.br");
      }

    } catch (error) {
      console.error("Erro ao carregar dados do admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOffers = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingOffers(true);
      const res = await fetch("/api/admin/vip-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: adminUser.id,
          vip_offers: {
            monthly_title: monthlyTitle,
            monthly_price: monthlyPrice,
            monthly_installment_value: monthlyInstallmentValue,
            monthly_checkout_url: monthlyCheckoutUrl,
            lifetime_title: lifetimeTitle,
            lifetime_price: lifetimePrice,
            lifetime_installment_value: lifetimeInstallmentValue,
            lifetime_checkout_url: lifetimeCheckoutUrl,
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOperationMsg("✅ Configuração de Ofertas salva com sucesso!");
        setTimeout(() => setOperationMsg(null), 3000);
      } else {
        alert(data.error || "Erro ao salvar as ofertas.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar ao servidor para salvar termos.");
    } finally {
      setIsSavingOffers(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [adminUser.id]);

  // Quick message alerter helper
  const flashMessage = (msg: string) => {
    setOperationMsg(msg);
    setTimeout(() => {
      setOperationMsg(null);
    }, 4500);
  };

  // Student Blocking operation
  const handleToggleBlock = async (targetUser: CompiledStudent) => {
    if (targetUser.id === adminUser.id) {
      alert("Você não pode bloquear a si mesmo.");
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}/toggle-block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: adminUser.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        flashMessage(`Status de bloqueio de ${targetUser.name} alterado com sucesso!`);
        loadAllAdminData();
      } else {
        alert(data.error || "Erro ao processar alteração.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Student Update Profile operation
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const res = await fetch(`/api/admin/users/${editingStudent.id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          adminId: adminUser.id,
          updateData: {
            name: editName,
            phone: editPhone,
            email: editEmail,
            role: editRole,
            is_vip: editIsVip,
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        flashMessage(`Perfil de ${editName} atualizado com sucesso!`);
        setEditingStudent(null);
        loadAllAdminData();
      } else {
        alert(data.error || "Erro ao editar usuário.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Force Set password operation
  const handleForceResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetStudent) return;

    try {
      const res = await fetch(`/api/admin/users/${passwordResetStudent.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          adminId: adminUser.id,
          newPassword: newPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        flashMessage(`Senha do aluno ${passwordResetStudent.name} redefinida em segurança!`);
        setPasswordResetStudent(null);
        setNewPassword("");
        loadAllAdminData();
      } else {
        alert(data.error || "Erro ao resetar senha.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Cover image uploading using base64 file translation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await fetch("/api/admin/upload-cover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminId: adminUser.id,
            fileName: file.name,
            base64Data: base64String
          })
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setModCoverUrl(data.url);
          flashMessage("Imagem carregada e gerada localmente no servidor!");
        } else {
          alert(data.error || "Não foi possível carregar a imagem.");
        }
      } catch (err) {
        console.error("Erro upload:", err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit create or edit Modules
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modTitle || !modDesc) return;

    try {
      if (modEditingId) {
        // Edit module
        const res = await fetch(`/api/admin/modules/${modEditingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminId: adminUser.id,
            title: modTitle,
            description: modDesc,
            cover_image_url: modCoverUrl,
            is_vip: modIsVip
          })
        });
        const data = await res.json();
        if (res.ok) {
          flashMessage("Módulo editado com sucesso!");
        }
      } else {
        // Create module
        const res = await fetch("/api/admin/modules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminId: adminUser.id,
            title: modTitle,
            description: modDesc,
            cover_image_url: modCoverUrl,
            is_vip: modIsVip
          })
        });
        const data = await res.json();
        if (res.ok) {
          flashMessage("Novo módulo criado e adicionado à grade!");
        }
      }
      setShowModuleModal(false);
      setModEditingId(null);
      setModTitle("");
      setModDesc("");
      setModCoverUrl("");
      setModIsVip(false);
      loadAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Save Lesson
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesTitle || !lesYoutubeUrl || !lesModId) return;

    try {
      const url = lesEditingId ? `/api/admin/lessons/${lesEditingId}` : "/api/admin/lessons";
      const method = lesEditingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: adminUser.id,
          module_id: lesModId,
          title: lesTitle,
          youtube_url: lesYoutubeUrl,
          duration: lesDuration || "10:00"
        })
      });
      const data = await res.json();
      if (res.ok) {
        flashMessage(lesEditingId ? "Aula editada com sucesso!" : "Aula inserida com sucesso!");
        setShowLessonModal(false);
        setLesEditingId(null);
        setLesTitle("");
        setLesYoutubeUrl("");
        setLesDuration("");
        loadAllAdminData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Module
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Tem certeza que deseja apagar este módulo? Todas as aulas vinculadas a ele serão apagadas permanentemente.")) return;
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}?adminId=${adminUser.id}`, { method: "DELETE" });
      if (res.ok) {
        flashMessage("Módulo deletado!");
        loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Deseja apagar esta aula?")) return;
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}?adminId=${adminUser.id}`, { method: "DELETE" });
      if (res.ok) {
        flashMessage("Aula excluída com sucesso.");
        loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-black flex flex-col">
      
      {/* Admin Panel Header Banner */}
      <header className="h-20 bg-zinc-900 border-b border-zinc-800 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onCloseAdmin}
            className="p-2 bg-zinc-950 rounded border border-zinc-800 hover:text-amber-500 transition cursor-pointer"
            title="Voltar para LMS"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">ADMIN COCKPIT</span>
            <span className="text-zinc-500 text-sm hidden sm:inline">| Controle Operacional de Mentoria</span>
          </div>
        </div>

        <button
          onClick={onCloseAdmin}
          className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold px-4 py-2 rounded transition shadow active:scale-95 cursor-pointer"
        >
          Voltar para Catálogo
        </button>
      </header>

      {/* Operation alert flash feedback */}
      {operationMsg && (
        <div className="bg-amber-500 text-black text-xs font-bold text-center py-3.5 px-4 sticky top-20 z-40 flex items-center justify-center gap-2 animate-pulse shadow-xl shadow-amber-500/10">
          <Sparkles className="h-4 w-4 stroke-[3px]" /> {operationMsg}
        </div>
      )}

      {/* Sub menu controls tabs selector */}
      <nav className="bg-zinc-900/55 border-b border-zinc-900 px-6 sm:px-8 py-3 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === "stats" ? "bg-amber-500 text-black shadow" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <BarChart className="h-3.5 w-3.5" /> Métricas e Indicadores
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === "students" ? "bg-amber-500 text-black shadow" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <Users className="h-3.5 w-3.5" /> Gestão de Alunos ({students.length})
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={`px-4 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === "content" ? "bg-amber-500 text-black shadow" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" /> Gestão de Conteúdo ({modules.length})
        </button>
        <button
          onClick={() => setActiveTab("offers")}
          className={`px-4 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === "offers" ? "bg-amber-500 text-black shadow" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Configurar Ofertas VIP
        </button>
      </nav>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <div className="h-8 w-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-xs">Mapeando dados do servidor...</p>
        </div>
      ) : (
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
          
          {/* TAB 1: METRICS AND STATISTICS */}
          {activeTab === "stats" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* KPI 1 */}
                <div className="bg-zinc-900 border border-zinc-805 p-6 rounded-2xl flex items-center justify-between shadow">
                  <div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">ALUNOS MATRICULADOS</span>
                    <span className="text-4xl font-black text-white mt-1.5 block">{stats.totalStudents}</span>
                    <p className="text-[10px] text-zinc-400 mt-2">Capacidade geral cadastrada via portal</p>
                  </div>
                  <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850">
                    <Users className="h-6 w-6 text-amber-500" />
                  </div>
                </div>

                {/* KPI 2 */}
                <div className="bg-zinc-900 border border-zinc-805 p-6 rounded-2xl flex items-center justify-between shadow">
                  <div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">RITMO DE ACESSO ATIVO</span>
                    <span className="text-4xl font-black text-green-500 mt-1.5 block">{stats.activeStudents}</span>
                    <p className="text-[10px] text-zinc-400 mt-2">Alunos desembaraçados (sem bloqueios criminosos)</p>
                  </div>
                  <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850">
                    <UserCheck className="h-6 w-6 text-green-500" />
                  </div>
                </div>

                {/* KPI 3 */}
                <div className="bg-zinc-900 border border-zinc-805 p-6 rounded-2xl flex items-center justify-between shadow">
                  <div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">X-PROGRESSO COMPRESSIVO MÉDIO</span>
                    <span className="text-4xl font-black text-amber-500 mt-1.5 block">{stats.averageProgress}%</span>
                    <p className="text-[10px] text-zinc-400 mt-2">Média de conclusão global da mentoria</p>
                  </div>
                  <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850">
                    <BarChart className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </div>

              {/* Terms accepted logs */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-4 mb-4">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Histórico Recente de Aceite de Termos</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 pb-3 block sm:table-row">
                        <th className="py-2.5 font-bold">ALUNO</th>
                        <th className="py-2.5 font-bold">CONTATO</th>
                        <th className="py-2.5 font-bold uppercase">CONDIÇÃO DOS TERMOS</th>
                        <th className="py-2.5 font-bold">DATA DO ACEITE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {students.map(st => (
                        <tr key={st.id} className="hover:bg-zinc-950/20 block sm:table-row py-2 sm:py-0">
                          <td className="py-3 font-semibold text-white flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${st.is_blocked ? "bg-red-500" : "bg-green-500"}`}></span>
                            {st.name} {st.role === "admin" && <span className="bg-amber-500 text-black text-[9px] font-extrabold px-1.5 rounded">ADMIN</span>}
                          </td>
                          <td className="py-3 text-zinc-400">{st.phone}</td>
                          <td className="py-3">
                            {st.acceptedTerms ? (
                              <span className="text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 text-[10px]">LIDO E ACEITO</span>
                            ) : (
                              <span className="text-zinc-500 bg-zinc-500/10 px-2 py-0.5 rounded border border-zinc-500/20 text-[10px]">PENDENTE</span>
                            )}
                          </td>
                          <td className="py-3 text-zinc-500">{st.acceptedTermsAt ? new Date(st.acceptedTermsAt).toLocaleString() : "Sem registro"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS DIRECTORY */}
          {activeTab === "students" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-900 pb-6">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Diretório Geral de Alunos</h3>
                  <p className="text-xs text-zinc-500">Mantenha o cadastro limpo, redefine senhas ou bloqueie invasores imediatamente.</p>
                </div>
              </div>

              {/* Table listings */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400">
                        <th className="p-4 font-bold">ALUNO / EMAIL</th>
                        <th className="p-4 font-bold">TELEFONE (WHATSAPP)</th>
                        <th className="p-4 font-bold">ESTADO DE ACESSO</th>
                        <th className="p-4 font-bold">AULAS CONCLUÍDAS</th>
                        <th className="p-4 font-bold text-right">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {students.map((st) => {
                        const isStudentBlocked = st.is_blocked;

                        return (
                          <tr key={st.id} className="hover:bg-zinc-950/20 transition">
                            <td className="p-4">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {st.name} 
                                {st.role === "admin" && <span className="bg-amber-500 text-black text-[9px] font-black px-1.5 rounded">ADMIN</span>}
                              </div>
                              <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                                <Mail className="h-3 w-3 shrink-0" /> {st.email}
                              </div>
                            </td>
                            <td className="p-4 font-mono font-medium text-zinc-300">
                              <div className="flex items-center gap-1">
                                <Smartphone className="h-3 w-3 text-amber-500" /> {st.phone}
                              </div>
                            </td>
                            <td className="p-4">
                              {isStudentBlocked ? (
                                <span className="text-red-500 font-bold bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/20 text-[10px]">BLOQUEADO</span>
                              ) : (
                                <span className="text-green-500 font-bold bg-green-500/10 px-2.5 py-0.5 rounded border border-green-500/20 text-[10px]">LIBERADO</span>
                              )}
                            </td>
                            <td className="p-4 font-bold text-amber-500">
                              {st.completedLessonsCount} assistidas
                            </td>
                            <td className="p-4 text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingStudent(st);
                                    setEditName(st.name);
                                    setEditPhone(st.phone);
                                    setEditEmail(st.email);
                                    setEditRole(st.role);
                                  }}
                                  className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
                                  title="Editar perfil"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                
                                <button
                                  onClick={() => {
                                    setPasswordResetStudent(st);
                                  }}
                                  className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-zinc-700 transition"
                                  title="Redefinir senha"
                                >
                                  <Lock className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() => handleToggleBlock(st)}
                                  className={`p-2 rounded border transition ${
                                    isStudentBlocked
                                      ? "bg-green-600/15 border-green-600 text-green-500 hover:bg-green-600 hover:text-white"
                                      : "bg-red-600/15 border-red-500 text-red-500 hover:bg-red-600 hover:text-white"
                                  }`}
                                  title={isStudentBlocked ? "Desbloquear" : "Bloquear"}
                                >
                                  {isStudentBlocked ? <UserCheck className="h-3.5 w-3.5" /> : <UserMinus className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTENT MANAGEMENT (COURSES, COVER UPLOADS, EPISODES) */}
          {activeTab === "content" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Cronograma de Temporadas e Videoaulas</h3>
                  <p className="text-xs text-zinc-500">Crie módulos, faça upload de imagens de capa, ou incorpore links do YouTube imediatamente.</p>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setModEditingId(null);
                      setModTitle("");
                      setModDesc("");
                      setModCoverUrl("");
                      setModIsVip(false);
                      setShowModuleModal(true);
                    }}
                    className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs px-4 py-3 rounded flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5px]" /> Novo Módulo
                  </button>
                  <button
                    onClick={() => {
                      if (modules.length === 0) {
                        alert("Crie um módulo primeiro!");
                        return;
                      }
                      setLesModId(modules[0].id);
                      setLesEditingId(null);
                      setLesTitle("");
                      setLesYoutubeUrl("");
                      setLesDuration("");
                      setShowLessonModal(true);
                    }}
                    className="flex-1 sm:flex-none bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 font-bold text-xs px-4 py-3 rounded flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                  >
                    <Youtube className="h-4 w-4 stroke-[1.5px]" /> Inserir Aula
                  </button>
                </div>
              </div>

              {/* Modules configuration dashboard collapse-like views */}
              <div className="space-y-6">
                {modules.map((mod) => (
                  <div key={mod.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 shadow">
                    
                    {/* Header line of module card with covers */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-zinc-800/65 pb-5 mb-5">
                      <div className="flex items-center gap-4">
                        <img 
                          referrerPolicy="no-referrer"
                          src={mod.cover_image_url} 
                          alt={mod.title} 
                          className="w-16 h-10 rounded object-cover border border-zinc-800 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-amber-500 font-extrabold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase">ORDE INDEX {mod.order_index}</span>
                            {mod.is_vip && <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase">💎 VIP</span>}
                            <span className="text-zinc-500 text-[10px] font-mono">ID: {mod.id}</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-white mt-1">{mod.title}</h4>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {/* Edit Module button */}
                        <button
                          onClick={() => {
                            setModEditingId(mod.id);
                            setModTitle(mod.title);
                            setModDesc(mod.description);
                            setModCoverUrl(mod.cover_image_url);
                            setModIsVip(!!mod.is_vip);
                            setShowModuleModal(true);
                          }}
                          className="flex-1 sm:flex-none text-[11px] font-bold bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 px-3.5 py-2 rounded flex items-center justify-center gap-1.5 transition text-zinc-300"
                        >
                          <Edit className="h-3.5 w-3.5" /> Editar
                        </button>
                        
                        {/* Delete Module button */}
                        <button
                          onClick={() => handleDeleteModule(mod.id)}
                          className="flex-1 sm:flex-none text-[11px] font-bold bg-red-600/15 hover:bg-red-600 border border-red-500/20 hover:text-white px-3.5 py-2 rounded flex items-center justify-center gap-1.5 transition text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Apagar
                        </button>
                      </div>
                    </div>

                    {/* Lessons nested inside this module block */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Aulas vinculadas</span>
                      {mod.lessons && mod.lessons.map((les) => (
                        <div key={les.id} className="bg-zinc-950 border border-zinc-900 rounded p-3 text-xs flex justify-between items-center gap-4">
                          <div className="flex items-center gap-2 max-w-md overflow-hidden">
                            <Youtube className="h-4 w-4 text-zinc-500 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-white block truncate">{les.title}</span>
                              <span className="text-[10px] text-zinc-500 font-mono truncate">{les.youtube_url}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-zinc-500" /> {les.duration}
                            </span>
                            <button
                              onClick={() => {
                                setLesEditingId(les.id);
                                setLesModId(mod.id);
                                setLesTitle(les.title);
                                setLesYoutubeUrl(les.youtube_url);
                                setLesDuration(les.duration || "");
                                setShowLessonModal(true);
                              }}
                              className="p-1 px-2 bg-zinc-900 border border-zinc-800 hover:bg-amber-500/10 text-zinc-500 hover:text-amber-500 rounded transition"
                              title="Editar Aula"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(les.id)}
                              className="p-1 px-2 bg-zinc-900 border border-zinc-800 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded transition"
                              title="Deletar Aula"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!mod.lessons || mod.lessons.length === 0) && (
                        <div className="py-2 text-center text-zinc-500 text-[11px] italic">
                          Módulo vazio. Use o botão "Inserir Aula" para preencher este módulo!
                        </div>
                      )}
                    </div>

                  </div>
                ))}

                {modules.length === 0 && (
                  <div className="py-12 border-2 border-zinc-900 border-dashed rounded-2xl flex flex-col items-center justify-center text-zinc-500 gap-2">
                    <BookOpen className="h-8 w-8" />
                    <span>Nenhum módulo para gerenciar. Ative um módulo novo acima!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EDIT VIP OFFERS CONFIGURATION */}
          {activeTab === "offers" && (
            <div className="space-y-8 animate-fade-in max-w-4xl">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500 font-extrabold" /> Configuração de Valores & Checkouts VIP
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Defina o preço dos planos (Mensal e Vitalício), parcelamento sugerido e os links da sua plataforma de checkout (Ex: Kiwify, Hotmart, Green). Esses valores serão oferecidos aos alunos que não possuem VIP quando tentarem acessar conteúdos restritos.
                </p>
              </div>

              <form onSubmit={handleSaveOffers} className="space-y-8 bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl shadow-black/45">
                {/* PLANO MENSAL */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest border-b border-zinc-800 pb-2.5 flex items-center gap-2">
                    <span>💵</span> {monthlyTitle || "Plano Mensal Premium"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400">Título do Plano</label>
                      <input
                        type="text"
                        required
                        value={monthlyTitle}
                        onChange={(e) => setMonthlyTitle(e.target.value)}
                        placeholder="Ex: Plano Mensal Premium"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400">Valor à Vista (R$)</label>
                      <input
                        type="text"
                        required
                        value={monthlyPrice}
                        onChange={(e) => setMonthlyPrice(e.target.value)}
                        placeholder="Ex: 97,05"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400">Parcela mensal sugerida (Até 12x de...)</label>
                      <input
                        type="text"
                        required
                        value={monthlyInstallmentValue}
                        onChange={(e) => setMonthlyInstallmentValue(e.target.value)}
                        placeholder="Ex: 9,70"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400">Link de Checkout de Pagamento</label>
                      <input
                        type="text"
                        required
                        value={monthlyCheckoutUrl}
                        onChange={(e) => setMonthlyCheckoutUrl(e.target.value)}
                        placeholder="https://checkout.kiwify.com.br/..."
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* PLANO VITALICIO */}
                <div className="space-y-4 pt-6 border-t border-zinc-800/80">
                  <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest border-b border-zinc-800 pb-2.5 flex items-center gap-2">
                    <span>👑</span> {lifetimeTitle || "Acesso Vitalício Black"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400">Título do Plano Vitalício</label>
                      <input
                        type="text"
                        required
                        value={lifetimeTitle}
                        onChange={(e) => setLifetimeTitle(e.target.value)}
                        placeholder="Ex: Acesso Vitalício Black"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400">Valor à Vista (R$)</label>
                      <input
                        type="text"
                        required
                        value={lifetimePrice}
                        onChange={(e) => setLifetimePrice(e.target.value)}
                        placeholder="Ex: 497,00"
                        className="w-full bg-zinc-950 border border-zinc-805 focus:border-amber-500/60 p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400">Parcela mensal sugerida (Até 12x de...)</label>
                      <input
                        type="text"
                        required
                        value={lifetimeInstallmentValue}
                        onChange={(e) => setLifetimeInstallmentValue(e.target.value)}
                        placeholder="Ex: 49,70"
                        className="w-full bg-zinc-950 border border-zinc-805 focus:border-amber-500/60 p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400">Link de Checkout de Pagamento</label>
                      <input
                        type="text"
                        required
                        value={lifetimeCheckoutUrl}
                        onChange={(e) => setLifetimeCheckoutUrl(e.target.value)}
                        placeholder="https://checkout.kiwify.com.br/..."
                        className="w-full bg-zinc-950 border border-zinc-805 focus:border-amber-500/60 p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-zinc-800">
                  <button
                    type="submit"
                    disabled={isSavingOffers}
                    className="bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 text-black font-extrabold text-xs px-6 py-4 rounded transition shadow-lg shadow-amber-500/5 active:scale-95 cursor-pointer flex items-center gap-1.5 animate-fade-in"
                  >
                    {isSavingOffers ? "Gravando Configurações..." : "Salvar Alterações de Oferta"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      )}

      {/* MODAL 1: EDIT STUDENT INFO */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <form onSubmit={handleUpdateStudent} className="bg-zinc-900 border border-zinc-800 max-w-md w-full rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              Editar Perfil de Aluno <Sparkles className="h-4 w-4 text-amber-500" />
            </h3>
            <p className="text-xs text-zinc-400">Insira as alterações atualizadas solicitadas pelo aluno.</p>
            
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Nome</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/70 text-sm p-3 rounded focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">WhatsApp (DDD+Número)</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/70 text-sm p-3 rounded focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/70 text-sm p-3 rounded focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Nível do Usuário (Cargo)</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-sm p-3 rounded text-zinc-300 focus:outline-none"
                >
                  <option value="student">Aluno de Mentoria</option>
                  <option value="admin">Administrador Geral</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between bg-zinc-950 p-4 border border-zinc-800/60 rounded-xl">
                <div>
                  <label className="text-xs font-black text-amber-500 flex items-center gap-1">
                    💎 STATUS VIP ATIVO
                  </label>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Dá acesso instantâneo a todos os módulos e aulas VIP.</p>
                </div>
                <input
                  type="checkbox"
                  checked={editIsVip}
                  onChange={(e) => setEditIsVip(e.target.checked)}
                  className="h-5 w-5 rounded border-zinc-800 accent-amber-500 bg-zinc-950 focus:ring-1 focus:ring-amber-500/40 cursor-pointer text-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="flex-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs py-3.5 rounded transition"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-3.5 rounded transition"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: RESET PASSWORD */}
      {passwordResetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <form onSubmit={handleForceResetPassword} className="bg-zinc-900 border border-zinc-800 max-w-sm w-full rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5And">
              Redefinir Senha do Aluno <Lock className="h-4 w-4 text-amber-500" />
            </h3>
            <p className="text-xs text-zinc-400">
              Isso atualizará a senha de <span className="font-bold text-white">{passwordResetStudent.name}</span> instantaneamente.
            </p>
            
            <div className="space-y-1 pt-2">
              <label className="text-xs font-bold text-zinc-300 block">Nova Senha Provisória</label>
              <input
                type="text"
                required
                placeholder="Insira a nova senha segura"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 text-sm p-3 rounded text-white focus:outline-none focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => { setPasswordResetStudent(null); setNewPassword(""); }}
                className="flex-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs py-3.5 rounded transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-3.5 rounded transition"
              >
                Aplicar Senha Nova
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: CREATE OR EDIT MODULE */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <form onSubmit={handleSaveModule} className="bg-zinc-900 border border-zinc-800 max-w-md w-full rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              {modEditingId ? "Editar Módulo" : "Criar Módulo de Mentoria"}
              <BookOpen className="h-4 w-4 text-amber-500" />
            </h3>
            <p className="text-xs text-zinc-400">
              Preencha os dados e escolha se deseja fornecer uma URL externa ou fazer upload de capa no servidor.
            </p>
            
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">Título do Módulo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Módulo 5: Price Action Sólido"
                  value={modTitle}
                  onChange={(e) => setModTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500/60 p-3 rounded text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">Descrição Curta</label>
                <textarea
                  required
                  placeholder="Mapeie os principais conceitos..."
                  value={modDesc}
                  onChange={(e) => setModDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500/60 p-3 rounded text-sm text-white h-20 focus:outline-none"
                />
              </div>

              {/* Cover Image upload controller */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-500 block">Upload de Capa (Supabase local storage)</label>
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-lg flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="bg-zinc-900 hover:bg-zinc-850 text-xs px-4 py-2 border border-zinc-800 rounded font-bold text-zinc-300 flex items-center gap-1.5 active:scale-95 transition relative cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5 text-amber-500" />
                      Escolher Foto Local
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </button>
                    {isUploading && (
                      <div className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  
                  <span className="text-[10px] text-zinc-500">Ou use uma URL de imagem válida do Unsplash abaixo:</span>
                  
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={modCoverUrl}
                    onChange={(e) => setModCoverUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded text-[11px] text-zinc-300 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between bg-zinc-950 p-4 border border-zinc-800/60 rounded-xl">
                <div>
                  <label className="text-xs font-black text-amber-500 flex items-center gap-1.5">
                    🔒 EXCLUSIVO ALUNOS VIP
                  </label>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Apenas alunos VIP ativos poderão ler ou assistir vídeo aulas do módulo.</p>
                </div>
                <input
                  type="checkbox"
                  checked={modIsVip}
                  onChange={(e) => setModIsVip(e.target.checked)}
                  className="h-5 w-5 rounded border-zinc-800 accent-amber-500 bg-zinc-950 focus:ring-1 focus:ring-amber-500/40 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => { setShowModuleModal(false); setModEditingId(null); }}
                className="flex-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs py-3.5 rounded transition"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-3.5 rounded transition"
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: INSERT/EDIT LESSON */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <form onSubmit={handleSaveLesson} className="bg-zinc-900 border border-zinc-800 max-w-md w-full rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              {lesEditingId ? "Editar Aula na Temporada" : "Inserir Aula na Temporada"} <Youtube className="h-4 w-4 text-amber-500" />
            </h3>
            <p className="text-xs text-zinc-400">
              O link do YouTube será automaticamente convertido em player para reprodução nas aulas livres.
            </p>
            
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">Vincular no Módulo</label>
                <select
                  value={lesModId}
                  onChange={(e) => setLesModId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-3 rounded text-sm text-zinc-300 focus:outline-none"
                >
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">Título do Episódio</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aula 3: Ordem Block e FVG"
                  value={lesTitle}
                  onChange={(e) => setLesTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500/60 p-3 rounded text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">Link de Compartilhamento do YouTube</label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={lesYoutubeUrl}
                  onChange={(e) => setLesYoutubeUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500/60 p-3 rounded text-sm text-white focus:outline-none font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">Duração (Ex: 14:20)</label>
                <input
                  type="text"
                  placeholder="12:00"
                  value={lesDuration}
                  onChange={(e) => setLesDuration(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500/60 p-3 rounded text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowLessonModal(false);
                  setLesEditingId(null);
                  setLesTitle("");
                  setLesYoutubeUrl("");
                  setLesDuration("");
                }}
                className="flex-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs py-3.5 rounded transition"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-3.5 rounded transition"
              >
                {lesEditingId ? "Salvar Alterações" : "Vincular Aula"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
