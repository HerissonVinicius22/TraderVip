import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import { UserProfile } from "./types";

type AppView = "landing" | "auth" | "dashboard" | "admin";

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [sessionLoading, setSessionLoading] = useState(true);

  // Restore session from localStorage on startup
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("traderacademic_session") || localStorage.getItem("tradingflix_session");
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        setUser(parsed);
        setView("dashboard");
      }
    } catch (e) {
      console.error("Erro recuperando sessão de login anterior:", e);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  // Handle successful login or registration
  const handleAuthSuccess = (loggedUser: UserProfile) => {
    if (loggedUser.is_blocked) {
      alert("Seu acesso está bloqueado por determinação administrativa.");
      return;
    }
    setUser(loggedUser);
    localStorage.setItem("traderacademic_session", JSON.stringify(loggedUser));
    setView("dashboard");
  };

  // Log user out
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("traderacademic_session");
    localStorage.removeItem("tradingflix_session");
    setView("landing");
  };

  // Standard full reload in case database reset is triggered
  const handleLogoClick = () => {
    setView("landing");
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-semibold tracking-wide text-zinc-400">Verificando passe de streaming...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 font-sans">
      
      {/* LANDING PAGE ROUTE */}
      {view === "landing" && (
        <LandingPage
          onStartSignUp={() => {
            setAuthMode("signup");
            setView("auth");
          }}
          onStartLogin={() => {
            setAuthMode("login");
            setView("auth");
          }}
        />
      )}

      {/* LOGIN & SIGNUP SCREEN ROUTE */}
      {view === "auth" && (
        <AuthScreen
          initialMode={authMode}
          onAuthSuccess={handleAuthSuccess}
          onBackToLanding={() => setView("landing")}
        />
      )}

      {/* LMS STUDENT DASHBOARD CATALOG ROUTE */}
      {view === "dashboard" && user && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onOpenAdmin={() => {
            if (user.role === "admin") {
              setView("admin");
            } else {
              alert("Acesso exclusivo para administradores.");
            }
          }}
        />
      )}

      {/* REVOLUTIONARY ADMIN CONTROL CENTER COCKPIT */}
      {view === "admin" && user && user.role === "admin" && (
        <AdminPanel
          adminUser={user}
          onCloseAdmin={() => setView("dashboard")}
        />
      )}
      
    </div>
  );
}
