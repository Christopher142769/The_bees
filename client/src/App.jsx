import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import DynamicFavicon from "./components/DynamicFavicon.jsx";
import Navbar from "./components/Navbar.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import Home from "./pages/Home.jsx";
import Member from "./pages/Member.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ActionPlan from "./pages/ActionPlan.jsx";
import { ADMIN_PATH } from "./constants/adminPath.js";

function SuspiciousRouteTrap() {
  const navigate = useNavigate();

  useEffect(() => {
    const id = setTimeout(() => navigate("/", { replace: true }), 7000);
    return () => clearTimeout(id);
  }, [navigate]);

  return (
    <div className="page admin-trap-page">
      <div className="admin-trap-root">
        <div className="admin-trap-glow" aria-hidden />
        <div className="admin-trap-tree" aria-hidden />
        <div className="admin-trap-leaf admin-trap-leaf--a" aria-hidden />
        <div className="admin-trap-leaf admin-trap-leaf--b" aria-hidden />
        <div className="admin-trap-leaf admin-trap-leaf--c" aria-hidden />

        <div className="admin-trap-card">
          <p className="admin-trap-kicker">Salle protegee</p>
          <h1>Qui ose vouloir entrer dans la salle du trone de LA REINE ?</h1>
          <p className="admin-trap-message">Jeune abeille, retourne a ta ruche.</p>
          <p className="admin-trap-sub">Redirection automatique en cours...</p>
        </div>
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
