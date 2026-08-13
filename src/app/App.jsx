import { useState, useCallback, useEffect } from "react";
import { Toaster } from "sonner";
import { cn } from "../shared/utils/cn";
import "./App.css";
import { Sidebar } from "./layout/Sidebar";
import { TopNav } from "./layout/TopNav";
import { BottomNav } from "./layout/BottomNav";

import DashboardPage from "../features/dashboard/DashboardPage";
import EmployeesPage from "../features/employees/EmployeesPage";
import AttendancePage from "../features/attendance/AttendancePage";
import LeavePage from "../features/leave/LeavePage";
import DocumentsPage from "../features/documents/DocumentsPage";
import ServiceDeskPage from "../features/servicedesk/ServiceDeskPage";
import ServicesPage from "../features/services/ServicesPage";
import SettingsPage from "../features/settings/SettingsPage";

export default function App() {
  const [module, setModule] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ams-dark");
    if (saved === "true") setDarkMode(true);
  }, []);

  const toggleDark = useCallback(() => {
    setDarkMode(v => {
      localStorage.setItem("ams-dark", String(!v));
      return !v;
    });
  }, []);

  const handleNav = useCallback((m) => {
    setModule(m);
    setMobileSidebarOpen(false);
  }, []);

  return (
    <div className={cn("flex h-screen overflow-hidden bg-background text-foreground", darkMode && "dark")}>
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileSidebarOpen(false)}/>
      )}

      <div className={cn(
        "fixed top-0 bottom-0 left-0 z-50 h-full transition-transform duration-300 md:relative md:z-auto md:!translate-x-0",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar
          active={module}
          onNav={handleNav}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(v=>!v)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav
          module={module}
          darkMode={darkMode}
          onDarkMode={toggleDark}
          onMenuToggle={() => setMobileSidebarOpen(v=>!v)}
          showMenu={mobileSidebarOpen}
          onNavigate={setModule}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-20 md:pb-6">
          {module === "dashboard" && <DashboardPage onNavigate={setModule}/>}
          {module === "employees" && <EmployeesPage/>}
          {module === "attendance" && <AttendancePage/>}
          {module === "leave" && <LeavePage/>}
          {module === "documents" && <DocumentsPage/>}
          {module === "servicedesk" && <ServiceDeskPage/>}
          {module === "services" && <ServicesPage/>}
          {module === "settings" && <SettingsPage darkMode={darkMode} onDarkMode={toggleDark}/>}
        </main>
      </div>

      <BottomNav active={module} onNav={handleNav} onMore={() => setMobileSidebarOpen(true)} />

      <Toaster
        position="top-right"
        richColors
        toastOptions={{ style: { fontFamily: "Inter, Segoe UI, sans-serif", fontSize: 13 } }}
      />
    </div>
  );
}
