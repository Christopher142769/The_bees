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

function isAdminRoute(pathname) {
  return pathname === "/admin" || pathname === "/dashboard";
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
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<Dashboard />} />
          </Routes>
        </div>
      )}
    </>
  );
}
