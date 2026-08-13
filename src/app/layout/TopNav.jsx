import { useState, useRef, useEffect, useMemo } from "react";
import {
  Menu, X, Home, ChevronRight, Search, Sun, Moon, MessageSquare, Bell,
  ChevronDown, User, Settings, HelpCircle, LogOut, CheckCircle, Shield, Headphones, Clock, GraduationCap,
  Users, Headset, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../../shared/components/Modal";
import { Btn } from "../../shared/components/Btn";
import { findNavLabel } from "../nav";
import { useCurrentUser } from "../../features/employees/hooks/useEmployees";
import { useEmployeesQuery } from "../../features/employees/hooks/useEmployeesQuery";
import { useServiceDeskQuery } from "../../features/servicedesk/hooks/useServiceDeskQuery";
import { useDocumentsQuery } from "../../features/documents/hooks/useDocumentsQuery";
import { useGlobalSearchStore } from "../../shared/utils/globalSearch.store";
import "./TopNav.css";

export function TopNav({ module, darkMode, onDarkMode, onMenuToggle, showMenu, onNavigate }) {
  const CURRENT_USER = useCurrentUser();
  const { data: employees } = useEmployeesQuery();
  const { data: tickets } = useServiceDeskQuery();
  const { data: documents } = useDocumentsQuery();
  const setPending = useGlobalSearchStore(s => s.setPending);

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchBoxRef = useRef(null);
  const label = findNavLabel(module);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    const matchEmp = e => [e.name, e.empCode, e.email, e.designation].some(v => String(v ?? "").toLowerCase().includes(q));
    const matchTicket = t => [t.ticketNumber, t.subject].some(v => String(v ?? "").toLowerCase().includes(q));
    const matchDoc = d => [d.fileName, d.docType, d.employeeName].some(v => String(v ?? "").toLowerCase().includes(q));
    return {
      employees: employees.filter(matchEmp).slice(0, 5),
      tickets: tickets.filter(matchTicket).slice(0, 5),
      documents: documents.filter(matchDoc).slice(0, 3),
    };
  }, [search, employees, tickets, documents]);

  const hasResults = results && (results.employees.length || results.tickets.length || results.documents.length);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) setShowSearch(false);
    };
    const onEscape = (e) => { if (e.key === "Escape") setShowSearch(false); };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const goToEmployee = (emp) => {
    setPending("employees", emp.empCode);
    onNavigate("employees");
    setShowSearch(false);
  };
  const goToTicket = (ticket) => {
    setPending("servicedesk", ticket.ticketNumber);
    onNavigate("servicedesk");
    setShowSearch(false);
  };
  const goToDocument = (doc) => {
    setPending("documents", doc.fileName);
    onNavigate("documents");
    setShowSearch(false);
  };

  return (
    <header className="h-[60px] bg-card border-b border-border flex items-center gap-3 px-4 sticky top-0 z-30 shadow-sm shrink-0">
      <button onClick={onMenuToggle} className="p-1.5 rounded-lg transition-colors bg-transparent border-0 cursor-pointer hover:bg-muted md:hidden">
        {showMenu ? <X size={18}/> : <Menu size={18}/>}
      </button>

      <div className="flex items-center gap-1.5 text-sm min-w-0">
        <Home size={14} className="text-muted-foreground shrink-0"/>
        <ChevronRight size={12} className="text-muted-foreground shrink-0"/>
        <span className="text-foreground font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{label}</span>
      </div>

      <div className="relative hidden ml-4 sm:block" ref={searchBoxRef}>
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14}/>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setShowSearch(true); }}
          onFocus={() => { if (search.trim()) setShowSearch(true); }}
          placeholder="Search employees, tickets..."
          className="py-1.5 pl-8 pr-3 text-sm border border-border rounded-md bg-input-background w-64 focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {showSearch && results && (
          <div className="absolute left-0 top-full mt-1 w-96 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-[70vh] overflow-y-auto">
            {!hasResults ? (
              <div className="py-6 px-4 text-center text-sm text-muted-foreground">No results found</div>
            ) : (
              <>
                {results.employees.length > 0 && (
                  <div className="border-b border-border last:border-b-0">
                    <div className="py-2 px-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Employees</div>
                    {results.employees.map(e => (
                      <button key={e.id} onClick={() => goToEmployee(e)}
                        className="w-full flex items-center gap-2.5 py-2 px-4 text-sm transition-colors bg-transparent border-0 cursor-pointer text-left hover:bg-muted">
                        <Users size={14} className="text-muted-foreground shrink-0"/>
                        <span className="min-w-0">
                          <span className="block font-medium text-foreground truncate">{e.name}</span>
                          <span className="block text-xs text-muted-foreground truncate">{e.designation} · {e.department}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {results.tickets.length > 0 && (
                  <div className="border-b border-border last:border-b-0">
                    <div className="py-2 px-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tickets</div>
                    {results.tickets.map(t => (
                      <button key={t.id} onClick={() => goToTicket(t)}
                        className="w-full flex items-center gap-2.5 py-2 px-4 text-sm transition-colors bg-transparent border-0 cursor-pointer text-left hover:bg-muted">
                        <Headset size={14} className="text-muted-foreground shrink-0"/>
                        <span className="min-w-0">
                          <span className="block font-medium text-foreground truncate">{t.ticketNumber}</span>
                          <span className="block text-xs text-muted-foreground truncate">{t.subject}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {results.documents.length > 0 && (
                  <div className="border-b border-border last:border-b-0">
                    <div className="py-2 px-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Documents</div>
                    {results.documents.map(d => (
                      <button key={d.id} onClick={() => goToDocument(d)}
                        className="w-full flex items-center gap-2.5 py-2 px-4 text-sm transition-colors bg-transparent border-0 cursor-pointer text-left hover:bg-muted">
                        <FileText size={14} className="text-muted-foreground shrink-0"/>
                        <span className="min-w-0">
                          <span className="block font-medium text-foreground truncate">{d.fileName}</span>
                          <span className="block text-xs text-muted-foreground truncate">{d.docType} · {d.employeeName}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button onClick={onDarkMode} className="p-2 rounded-full transition-colors relative bg-transparent border-0 cursor-pointer hover:bg-muted" title="Toggle theme">
          {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
        </button>

        <button className="p-2 rounded-full transition-colors relative bg-transparent border-0 cursor-pointer hover:bg-muted" title="Messages">
          <MessageSquare size={16}/>
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-primary rounded-full"/>
        </button>

        <div className="relative">
          <button onClick={() => { setShowNotif(v=>!v); setShowUser(false); }}
            className="p-2 rounded-full transition-colors relative bg-transparent border-0 cursor-pointer hover:bg-muted" title="Notifications">
            <Bell size={16}/>
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">5</span>
          </button>
          {showNotif && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-popover border border-border rounded-lg shadow-xl z-50">
              <div className="py-3 px-4 border-b border-border font-semibold text-sm flex items-center justify-between">
                Notifications <span className="text-xs text-primary bg-secondary py-0.5 px-2 rounded-full">5 new</span>
              </div>
              {[
                { t:"Leave Approved", d:"Your casual leave for Dec 24 has been approved", time:"2m ago", icon:CheckCircle, c:"#22c55e" },
                { t:"New Policy Update", d:"IT Security Policy v3.2 has been published", time:"1h ago", icon:Shield, c:"#3b82f6" },
                { t:"Service Ticket #TKT10023", d:"Your ticket has been assigned to Suresh IT", time:"3h ago", icon:Headphones, c:"#f97316" },
                { t:"Attendance Reminder", d:"Please mark your attendance before 10 AM", time:"Yesterday", icon:Clock, c:"#eab308" },
                { t:"Training Due", d:"React Advanced Patterns course due in 3 days", time:"Yesterday", icon:GraduationCap, c:"#a855f7" },
              ].map((n,i) => (
                <div key={i} className="flex gap-3 py-3 px-4 cursor-pointer border-b border-border last:border-b-0 transition-colors hover:bg-muted/50">
                  <n.icon size={18} className="mt-0.5 shrink-0" style={{ color: n.c }}/>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{n.t}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">{n.d}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setShowUser(v=>!v); setShowNotif(false); }}
            className="flex items-center gap-2 py-1.5 pr-3 pl-2 rounded-full transition-colors bg-transparent border-0 cursor-pointer ml-1 hover:bg-muted">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
              {CURRENT_USER.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
            </div>
            <span className="hidden text-sm font-medium sm:block">{CURRENT_USER.name.split(" ")[0]}</span>
            <ChevronDown size={12} className="hidden text-muted-foreground sm:block"/>
          </button>
          {showUser && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border rounded-lg shadow-xl z-50">
              <div className="py-3 px-4 border-b border-border">
                <p className="font-semibold text-sm">{CURRENT_USER.name}</p>
                <p className="text-xs text-muted-foreground">{CURRENT_USER.email}</p>
                <p className="text-xs text-primary mt-0.5">{CURRENT_USER.designation}</p>
              </div>
              {[
                { icon:User, label:"My Profile", onClick:() => { setShowProfile(true); setShowUser(false); } },
                { icon:Settings, label:"Settings", onClick:() => { onNavigate("settings"); setShowUser(false); } },
                { icon:HelpCircle, label:"Help & Support", onClick:() => { toast.info("Help & Support: contact hr@company.com"); setShowUser(false); } },
              ].map(item => (
                <button key={item.label} onClick={item.onClick} className="w-full flex items-center gap-2.5 py-2.5 px-4 text-sm transition-colors bg-transparent border-0 cursor-pointer text-left hover:bg-muted">
                  <item.icon size={14} className="text-muted-foreground"/> {item.label}
                </button>
              ))}
              <div className="border-t border-border">
                <button onClick={() => { toast.info("Signed out"); setShowUser(false); }} className="w-full flex items-center gap-2.5 py-2.5 px-4 text-sm text-red-600 transition-colors bg-transparent border-0 cursor-pointer text-left hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut size={14}/> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={showProfile} onClose={() => setShowProfile(false)} title="My Profile"
        footer={<Btn variant="secondary" size="sm" onClick={() => setShowProfile(false)}>Close</Btn>}>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">
            {CURRENT_USER.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
          </div>
          <div>
            <p className="font-semibold">{CURRENT_USER.name}</p>
            <p className="text-sm text-muted-foreground">{CURRENT_USER.designation}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 text-sm">
          {[
            { label:"Employee Code", value:CURRENT_USER.empCode },
            { label:"Email", value:CURRENT_USER.email },
            { label:"Mobile", value:CURRENT_USER.mobile },
            { label:"Department", value:CURRENT_USER.department },
            { label:"Manager", value:CURRENT_USER.manager },
            { label:"Location", value:CURRENT_USER.location },
            { label:"Join Date", value:CURRENT_USER.joinDate },
            { label:"Status", value:CURRENT_USER.status },
          ].map(f => (
            <div key={f.label} className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="font-medium text-foreground text-right">{f.value}</span>
            </div>
          ))}
        </div>
      </Modal>
    </header>
  );
}
