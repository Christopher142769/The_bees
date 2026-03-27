import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import DynamicFavicon from "./components/DynamicFavicon.jsx";
import Navbar from "./components/Navbar.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import Home from "./pages/Home.jsx";
import Member from "./pages/Member.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ActionPlan from "./pages/ActionPlan.jsx";
import { ADMIN_PATH } from "./constants/adminPath.js";

function SuspiciousRouteTrap() {
  useEffect(() => {
    window.alert(
      "Ohlala, que fais-tu encore ici ?! 🤯🚨💀\nDesole pour l'imprudence. Retourne a la page publique."
    );
  }, []);

  return (
    <div className="page dashboard-login-page">
      <div className="dashboard-login">
        <h1>🚫 Acces bloque</h1>
        <p className="login-sub">🧨🔥👾🛑🛡️</p>
        <p className="login-sub">Desole pour l'imprudence.</p>
        <Navigate to="/" replace />
      </div>
    </div>
  );
}

function isAdminRoute(pathname) {
  return pathname === ADMIN_PATH;
}

/** Intro à chaque chargement (sauf zone admin). */
function introInitial() {
  if (typeof window === "undefined") return true;
  if (isAdminRoute(window.location.pathname)) return true;
  return false;
}

export default function App() {
  const { pathname } = useLocation();
  const [introDone, setIntroDone] = useState(introInitial);

  useLayoutEffect(() => {
    if (isAdminRoute(pathname)) setIntroDone(true);
  }, [pathname]);

  const handleIntroDone = useCallback(() => {
    setIntroDone(true);
  }, []);

  const showIntro = !introDone && !isAdminRoute(pathname);

  useEffect(() => {
    if (showIntro) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showIntro]);

  return (
    <>
      <DynamicFavicon />
      {showIntro &&
        createPortal(<LoadingScreen onComplete={handleIntroDone} />, document.body)}
      {introDone && !isAdminRoute(pathname) && <Navbar />}
      {introDone && (
        <div className="app-shell app-shell--ready">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plan-action" element={<ActionPlan />} />
            <Route path="/membre/:slug" element={<Member />} />
            <Route path="/admin" element={<SuspiciousRouteTrap />} />
            <Route path="/dashboard" element={<SuspiciousRouteTrap />} />
            <Route path={ADMIN_PATH} element={<Dashboard />} />
          </Routes>
        </div>
      )}
    </>
  );
}
