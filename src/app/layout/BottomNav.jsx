import { LayoutDashboard, Clock, Calendar, FileText, Menu } from "lucide-react";
import { cn } from "../../shared/utils/cn";

// Mobile-only bottom tab bar (native-app style) — a fixed row of the most
// frequently used modules plus a "More" tab that opens the full Sidebar
// drawer for everything else. Hidden on md+ where the Sidebar is always
// visible instead.
const BOTTOM_TABS = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "attendance", label: "Attendance", icon: Clock },
  { id: "leave", label: "Leave", icon: Calendar },
  { id: "documents", label: "Documents", icon: FileText },
];

export function BottomNav({ active, onNav, onMore }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch bg-sidebar border-t border-sidebar-border md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {BOTTOM_TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNav(tab.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 bg-transparent border-0 cursor-pointer transition-colors",
              isActive ? "text-white" : "text-white/60"
            )}
          >
            <Icon size={20} className={cn(isActive && "text-primary")} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
      <button
        onClick={onMore}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 bg-transparent border-0 cursor-pointer text-white/60"
      >
        <Menu size={20} />
        <span className="text-[10px] font-medium">More</span>
      </button>
    </nav>
  );
}
