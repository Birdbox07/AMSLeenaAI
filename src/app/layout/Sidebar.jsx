import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Briefcase } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { NAV_ITEMS, findParentGroupId } from "../nav";
import { useSimulatedRole } from "../../shared/access/role.store";
import { roleAtLeast } from "../../features/employees/employees.roles";
import "./Sidebar.css";

function NavButton({ item, isActive, collapsed, onClick, indent }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group w-full flex items-center gap-3 py-2.5 px-4 transition-colors text-left relative bg-transparent border-0 cursor-pointer text-white/70",
        indent && !collapsed && "pl-9",
        isActive ? "bg-primary text-white" : "hover:bg-sidebar-accent hover:text-white"
      )}
    >
      <Icon size={18} className="shrink-0"/>
      {!collapsed && (
        <span className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1">{item.label}</span>
      )}
      {!collapsed && item.badge && (
        <span className="bg-red-500 text-white text-[10px] font-bold py-0.5 px-1.5 rounded-full min-w-[18px] text-center">
          {item.badge}
        </span>
      )}
      {collapsed && item.badge && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"/>
      )}
      {collapsed && (
        <span className="absolute left-full ml-2 py-1 px-2 bg-[#333] text-white text-xs rounded-lg shadow-md opacity-0 pointer-events-none whitespace-nowrap z-50 transition-opacity group-hover:opacity-100">
          {item.label}
        </span>
      )}
    </button>
  );
}

export function Sidebar({ active, onNav, collapsed, onToggle }) {
  const simulatedRole = useSimulatedRole();
  const visibleNavItems = NAV_ITEMS.filter(item => !item.minRole || roleAtLeast(simulatedRole, item.minRole));

  const activeGroupId = findParentGroupId(active);
  const [openGroups, setOpenGroups] = useState(() => new Set(activeGroupId ? [activeGroupId] : []));

  // Keep the group containing the active module expanded (e.g. after a
  // direct nav via Dashboard quick-actions or TopNav search).
  useEffect(() => {
    if (activeGroupId) setOpenGroups(prev => new Set(prev).add(activeGroupId));
  }, [activeGroupId]);

  // If the active module was hidden by a role downgrade (e.g. user was on
  // Reports, then simulated role dropped below its minRole), fall back to
  // Dashboard so the main pane isn't stuck rendering a module with no nav entry.
  useEffect(() => {
    const stillVisible = visibleNavItems.some(item => item.children ? item.children.some(c => c.id === active) : item.id === active);
    if (!stillVisible) onNav("dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatedRole]);

  const toggleGroup = (id) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <aside className={cn(
      "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-300 shrink-0",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border min-h-[60px]">
        <div className="shrink-0 w-8 h-8 bg-primary rounded-md flex items-center justify-center">
          <Briefcase size={16} className="text-white"/>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white leading-tight overflow-hidden text-ellipsis whitespace-nowrap">AMS Portal</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {visibleNavItems.map(item => {
          if (!item.children) {
            return (
              <NavButton key={item.id} item={item} isActive={active === item.id} collapsed={collapsed}
                onClick={() => onNav(item.id)} />
            );
          }

          const Icon = item.icon;
          const isOpen = openGroups.has(item.id) || collapsed;
          const groupActive = item.id === activeGroupId;
          return (
            <div key={item.id}>
              <button
                onClick={() => (collapsed ? onNav(item.children[0].id) : toggleGroup(item.id))}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group w-full flex items-center gap-3 py-2.5 px-4 transition-colors text-left relative bg-transparent border-0 cursor-pointer text-white/70",
                  groupActive ? "text-white" : "hover:bg-sidebar-accent hover:text-white"
                )}
              >
                <Icon size={18} className="shrink-0"/>
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1">{item.label}</span>
                    <ChevronDown size={14} className={cn("shrink-0 transition-transform", isOpen && "rotate-180")}/>
                  </>
                )}
                {collapsed && (
                  <span className="absolute left-full ml-2 py-1 px-2 bg-[#333] text-white text-xs rounded-lg shadow-md opacity-0 pointer-events-none whitespace-nowrap z-50 transition-opacity group-hover:opacity-100">
                    {item.label}
                  </span>
                )}
              </button>
              {!collapsed && isOpen && item.children.map(child => (
                <NavButton key={child.id} item={child} isActive={active === child.id} collapsed={collapsed}
                  onClick={() => onNav(child.id)} indent />
              ))}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-white/60 rounded-lg transition-colors bg-transparent border-0 cursor-pointer hover:text-white hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight size={16}/> : <><ChevronLeft size={16}/><span className="text-xs">Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
