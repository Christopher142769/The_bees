import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../api.js";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const s = await api.getSettings();
      setSettings(s);
    } catch {
      setSettings({
        heroImagePath: "",
        hiveImagePath: "",
        logoPath: "",
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = {
    settings,
    refresh,
    ready: settings !== null,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSiteSettings must be used within SettingsProvider");
  }
  return ctx;
}
