import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { selectRows, insertRows, upsertTable } from "./supabaseHelpers";

dotenv.config();

const app = express();
const PORT = 3000;
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(express.json({ limit: "50mb" })); // High limit for Base64 uploads
app.use("/uploads", express.static(UPLOADS_DIR));

// Simple logger
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Helper to wrap async route handlers
function asyncWrapper(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}


/**
 * Seed data – read from database.json and migrated by migrateData.ts on first run.
 */
let dbContent;
try {
  dbContent = JSON.parse(fs.readFileSync(path.join(process.cwd(), "database.json"), "utf8"));
} catch (e) {
  console.warn("Could not read database.json, using fallback.");
  dbContent = {
    users_profiles: [],
    modules: [],
    lessons: [],
    lesson_progress: [],
    terms_acceptance: [],
    vip_offers: {
      monthly_title: "Plano Mensal Premium",
      monthly_price: "97,00",
      monthly_installment_value: "9,70",
      monthly_checkout_url: "https://kiwify.com.br",
      lifetime_title: "Acesso Vitalício Black",
      lifetime_price: "497,00",
      lifetime_installment_value: "49,70",
      lifetime_checkout_url: "https://kiwify.com.br"
    }
  };
}
export const DEFAULT_DB = dbContent;

// ---------- AUTH ----------
app.post("/api/auth/register", asyncWrapper(async (req, res) => {
  const { name, phone, email, password, acceptedTerms } = req.body;
  if (!name || !phone || !email || !password) {
    return res.status(400).json({ error: "Todos os campos de cadastro são obrigatórios." });
  }
  if (!acceptedTerms) {
    return res.status(400).json({ error: "É obrigatório aceitar os Termos de Uso." });
  }
  const existing = await selectRows<any>("users_profiles");
  if (existing.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Este email já está sendo utilizado." });
  }
  const newUserId = "usr_" + Math.random().toString(36).substring(2, 11);
  const userProfile = {
    id: newUserId,
    name,
    phone,
    email: email.toLowerCase(),
    passwordHash: password,
    role: "student",
    is_blocked: false,
    is_vip: false,
    avatar_url: "",
    created_at: new Date().toISOString()
  };
  await insertRows("users_profiles", [userProfile]);
  // Record terms acceptance
  await insertRows("terms_acceptance", [{
    id: "terms_" + Math.random().toString(36).substring(2, 11),
    user_id: newUserId,
    accepted: true,
    accepted_at: new Date().toISOString()
  }]);
  const { passwordHash, ...safeProfile } = userProfile;
  res.json({ user: safeProfile, success: true });
}));

app.post("/api/auth/login", asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }
  const users = await selectRows<any>("users_profiles");
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Cadastro não encontrado. Verifique seu email." });
  }
  if (user.passwordHash !== password) {
    return res.status(401).json({ error: "Senha incorreta. Tente novamente." });
  }
  if (user.is_blocked) {
    return res.status(403).json({ error: "Seu acesso está bloqueado. Entre em contato com o suporte." });
  }
  const { passwordHash, ...safeProfile } = user;
  res.json({ user: safeProfile, success: true });
}));

// ---------- LMS ----------
app.get("/api/modules", asyncWrapper(async (req, res) => {
  const userId = req.query.userId as string;
  const [modules, lessons, progress] = await Promise.all([
    selectRows<any>("modules"),
    selectRows<any>("lessons"),
    userId ? selectRows<any>("lesson_progress") : Promise.resolve([])
  ]);
  const sortedModules = [...modules].sort((a, b) => a.order_index - b.order_index);
  const modulesWithLessons = sortedModules.map(mod => {
    const lessonsOfMod = lessons
      .filter((les: any) => les.module_id === mod.id)
      .sort((a: any, b: any) => a.order_index - b.order_index);
    return { ...mod, lessons: lessonsOfMod };
  });
  const progressMap: Record<string, boolean> = {};
  if (userId) {
    progress
      .filter(p => p.user_id === userId && p.completed)
      .forEach(p => { progressMap[p.lesson_id] = true; });
  }
  res.json({ modules: modulesWithLessons, progress: progressMap });
}));

app.post("/api/lessons/:id/toggle-progress", asyncWrapper(async (req, res) => {
  const lessonId = req.params.id;
  const { userId, completed } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "Usuário é obrigatório para marcar progresso." });
  }
  const users = await selectRows<any>("users_profiles");
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }
  if (user.is_blocked) {
    return res.status(403).json({ error: "Usuário bloqueado." });
  }
  const progressRows = await selectRows<any>("lesson_progress");
  const existing = progressRows.find(p => p.user_id === userId && p.lesson_id === lessonId);
  if (existing) {
    existing.completed = !!completed;
    if (completed) existing.completed_at = new Date().toISOString();
    await upsertTable("lesson_progress", [existing]);
  } else if (completed) {
    const newProg = {
      id: "prog_" + Math.random().toString(36).substring(2, 11),
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString()
    };
    await insertRows("lesson_progress", [newProg]);
  }
  const refreshed = await selectRows<any>("lesson_progress");
  const progressMap: Record<string, boolean> = {};
  refreshed.filter(p => p.user_id === userId && p.completed)
    .forEach(p => { progressMap[p.lesson_id] = true; });
  res.json({ success: true, progress: progressMap });
}));

// ---------- ADMIN (simplified) ----------
app.get("/api/admin/users", asyncWrapper(async (req, res) => {
  const adminId = req.query.adminId as string;
  const admins = await selectRows<any>("users_profiles");
  const admin = admins.find(u => u.id === adminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Acesso administrativo negado." });
  const users = await selectRows<any>("users_profiles");
  const lessonProgress = await selectRows<any>("lesson_progress");
  const terms = await selectRows<any>("terms_acceptance");
  const usersWithProgress = users.map(user => {
    const userProgress = lessonProgress.filter(p => p.user_id === user.id && p.completed);
    const acceptedTerm = terms.find(t => t.user_id === user.id);
    const { passwordHash, ...rest } = user;
    return {
      ...rest,
      passwordPreview: passwordHash,
      completedLessonsCount: userProgress.length,
      acceptedTerms: !!acceptedTerm?.accepted,
      acceptedTermsAt: acceptedTerm?.accepted_at
    };
  });
  res.json({ users: usersWithProgress });
}));

app.post("/api/admin/users/:id/toggle-block", asyncWrapper(async (req, res) => {
  const adminId = req.body.adminId;
  const targetUserId = req.params.id;
  const admins = await selectRows<any>("users_profiles");
  const admin = admins.find(u => u.id === adminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Acesso administrativo negado." });
  const users = await selectRows<any>("users_profiles");
  const target = users.find(u => u.id === targetUserId);
  if (!target) return res.status(404).json({ error: "Usuário não encontrado." });
  if (target.id === adminId) return res.status(400).json({ error: "Você não pode bloquear a si mesmo." });
  target.is_blocked = !target.is_blocked;
  await upsertTable("users_profiles", [target]);
  res.json({ success: true, user: target });
}));

// ---------- IMAGE UPLOAD (kept local) ----------
app.post("/api/admin/upload-cover", asyncWrapper(async (req, res) => {
  const { adminId, fileName, base64Data } = req.body;
  const admins = await selectRows<any>("users_profiles");
  const admin = admins.find(u => u.id === adminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Acesso administrativo negado." });
  if (!fileName || !base64Data) {
    return res.status(400).json({ error: "Arquivo ou dados corrompidos." });
  }
  try {
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Clean, "base64");
    const uniqueFileName = `${Date.now()}_${fileName.replace(/\s+/g, "_")}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);
    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${uniqueFileName}`;
    res.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Erro salvando imagem:", error);
    res.status(500).json({ error: "Erro de servidor ao processar o upload do arquivo." });
  }
}));

// ---------- START SERVER ----------
app.get("/goal", (req, res) => {
  const indexPath = path.join(process.cwd(), "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Not Found");
  }
});
app.use(express.static(path.join(process.cwd(), "dist")));

// Fallback to index.html for SPA routes
app.get("*", (req, res) => {
  const indexPath = path.join(process.cwd(), "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Not Found");
  }
});

// Start server
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
