import { useState, useMemo } from "react";
import { Users, Calendar, Plus, RefreshCw, Check, X, Eye, ClipboardList, Briefcase, Home } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../shared/utils/cn";
import { LEAVE_TYPES } from "../../shared/mock/constants";
import { Modal, FormField, inputCls } from "../../shared/components/Modal";
import { Btn } from "../../shared/components/Btn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { useLeaveQuery, useLeaveMutations } from "./hooks/useLeaveQuery";
import { getLeaveBalance } from "./leave.mock";
import { validateApplyLeaveForm } from "./leave.validators";
import { useCurrentUser, useMyReportees } from "../employees/hooks/useEmployees";
import { useHasRole } from "../../shared/access/role.store";
import { useAttendance } from "../attendance/hooks/useAttendance";
import CompOffTab from "./components/CompOffTab";
import OnDutyTab from "./components/OnDutyTab";
import WfhTab from "./components/WfhTab";
import { CountUp } from "../../shared/components/CountUp";
import "./leave.css";

const SECTION_TABS = [
  { id: "leave", label: "Leave Requests", icon: Calendar },
  { id: "compoff", label: "Comp-Off Ledger", icon: ClipboardList },
  { id: "onduty", label: "On-Duty Requests", icon: Briefcase },
  { id: "wfh", label: "Work From Home", icon: Home },
];

export default function LeavePage() {
  const [section, setSection] = useState("leave");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold text-foreground">Leave Management</h2>
      </div>
      <div className={cn("flex gap-1 flex-wrap bg-muted p-1 rounded-lg w-fit", "animate-fade-in-up")} style={{ animationDelay: "60ms" }}>
        {SECTION_TABS.map(t => (
          <button key={t.id} onClick={() => setSection(t.id)}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors border-none cursor-pointer bg-transparent text-muted-foreground hover:text-foreground", section === t.id && "bg-card! shadow text-foreground!")}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>
      {section === "leave" && <LeaveRequestsSection />}
      {section === "compoff" && <CompOffTab />}
      {section === "onduty" && <OnDutyTab />}
      {section === "wfh" && <WfhTab />}
    </div>
  );
}

function LeaveRequestsSection() {
  const { data: leaves } = useLeaveQuery();
  const LEAVE_STORE = useLeaveMutations();
  const CURRENT_USER = useCurrentUser();
  const MY_REPORTEES = useMyReportees();

  const [tab, setTab] = useState("All");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [balanceEmpId, setBalanceEmpId] = useState(CURRENT_USER.id);
  const [showApply, setShowApply] = useState(false);
  const [viewLeave, setViewLeave] = useState(null);
  const [applyForm, setApplyForm] = useState({ leaveType: LEAVE_TYPES[0], fromDate:"", toDate:"", reason:"" });

  const hasManagerRole = useHasRole("Manager");
  const isManager = MY_REPORTEES.length > 0 && hasManagerRole;
  const [scope, setScope] = useState(isManager ? "team" : "mine");
  const reporteeIds = useMemo(() => new Set(MY_REPORTEES.map(e=>e.id)), [MY_REPORTEES]);
  const today = new Date().toISOString().split("T")[0];
  const ATTENDANCE = useAttendance();

  const teamAttendanceToday = useMemo(() =>
    MY_REPORTEES.map(emp => ({
      emp,
      record: ATTENDANCE.find(r => r.employeeId === emp.id && r.date === today) || null,
    })),
    [ATTENDANCE, today, MY_REPORTEES]
  );

  const scoped = useMemo(() => scope === "team" && isManager
    ? leaves.filter(l => reporteeIds.has(l.employeeId))
    : leaves.filter(l => l.employeeId === CURRENT_USER.id),
    [leaves, scope, isManager, reporteeIds, CURRENT_USER]);

  const filtered = useMemo(() => scoped.filter(l =>
    (tab === "All" || l.status === tab) &&
    (!typeFilter || l.leaveType === typeFilter) &&
    (!fromDate || l.toDate >= fromDate) &&
    (!toDate || l.fromDate <= toDate)
  ), [scoped, tab, typeFilter, fromDate, toDate]);

  const counts = useMemo(() => ({
    All: scoped.length,
    Pending: scoped.filter(l=>l.status==="Pending").length,
    Approved: scoped.filter(l=>l.status==="Approved").length,
    Rejected: scoped.filter(l=>l.status==="Rejected").length,
  }), [scoped]);

  const balanceEmployees = useMemo(() => [CURRENT_USER, ...MY_REPORTEES], [CURRENT_USER, MY_REPORTEES]);
  const balanceEmp = balanceEmployees.find(e => e.id === balanceEmpId) || CURRENT_USER;
  const selectedBalance = useMemo(() => getLeaveBalance(balanceEmp.id, leaves), [balanceEmp, leaves]);

  const cols = [
    { key:"leaveNumber", label:"Leave No." },
    { key:"employeeName", label:"Employee" },
    { key:"leaveType", label:"Leave Type" },
    { key:"fromDate", label:"From Date" },
    { key:"toDate", label:"To Date" },
    { key:"days", label:"Days", render: r => <span className="font-semibold">{r.days}</span> },
    { key:"approver", label:"Approver" },
    { key:"status", label:"Status", render: r => <StatusBadge status={r.status}/> },
  ];

  const submitApply = () => {
    const errors = validateApplyLeaveForm(applyForm);
    if (Object.keys(errors).length) { toast.error(Object.values(errors)[0]); return; }
    const from = new Date(applyForm.fromDate), to = new Date(applyForm.toDate);
    const days = Math.max(1, Math.round((to.getTime()-from.getTime())/86400000)+1);
    const leave = {
      id: `LV${Date.now()}`, leaveNumber: `LVN${Date.now().toString().slice(-6)}`,
      employeeId: CURRENT_USER.id, employeeName: CURRENT_USER.name, department: CURRENT_USER.department,
      leaveType: applyForm.leaveType, fromDate: applyForm.fromDate, toDate: applyForm.toDate, days,
      status: "Pending", approver: CURRENT_USER.manager,
    };
    LEAVE_STORE.add(leave);
    toast.success(`Leave request ${leave.leaveNumber} submitted`);
    setShowApply(false);
    setApplyForm({ leaveType: LEAVE_TYPES[0], fromDate:"", toDate:"", reason:"" });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={cn("flex items-center justify-between flex-wrap gap-2", "animate-fade-in-up")} style={{ animationDelay: "60ms" }}>
        {isManager && (
          <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
            <button onClick={() => setScope("team")}
              className={cn("flex items-center gap-1.5 py-1.5 px-4 text-sm font-medium rounded-md transition-colors border-none cursor-pointer",
                scope==="team" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
              <Users size={13}/> My Reportees
            </button>
            <button onClick={() => setScope("mine")}
              className={cn("flex items-center gap-1.5 py-1.5 px-4 text-sm font-medium rounded-md transition-colors border-none cursor-pointer",
                scope==="mine" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
              My Requests
            </button>
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          {isManager && (
            <Btn variant="secondary" size="sm" onClick={() => setShowTeamModal(true)} className="hover-lift">
              <Users size={14}/> My Reportees' Attendance
            </Btn>
          )}
          <Btn variant="secondary" size="sm" onClick={() => { setBalanceEmpId(CURRENT_USER.id); setShowBalance(true); }} className="hover-lift">
            <Calendar size={14}/> Leave Balance
          </Btn>
          <Btn variant="primary" size="sm" onClick={() => setShowApply(true)} className="hover-lift">
            <Plus size={14}/> Apply Leave
          </Btn>
        </div>
      </div>

      <div className={cn("flex gap-1 bg-muted p-1 rounded-lg w-fit", "animate-fade-in-up")} style={{ animationDelay: "120ms" }}>
        {["All","Pending","Approved","Rejected"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("py-1.5 px-4 text-sm font-medium rounded-md transition-colors text-muted-foreground bg-transparent border-none cursor-pointer hover:text-foreground", tab===t && "bg-card shadow text-foreground")}>
            {t} <span className="ml-1 text-xs opacity-70">({counts[t]})</span>
          </button>
        ))}
      </div>

      <div className={cn("bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-end", "animate-fade-in-up")} style={{ animationDelay: "180ms" }}>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">From Date</label>
          <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"/>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">To Date</label>
          <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"/>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Leave Type</label>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring min-w-[150px]">
            <option value="">All Types</option>
            {LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        {(typeFilter || fromDate || toDate) && (
          <Btn variant="ghost" size="sm" onClick={() => { setTypeFilter(""); setFromDate(""); setToDate(""); }}>
            <RefreshCw size={13}/> Reset
          </Btn>
        )}
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
      <DataTable
        title={scope === "team" && isManager ? "My Reportees' Leave Requests" : "My Leave Requests"}
        columns={cols}
        data={filtered}
        actions={(row) => {
          const r = row;
          const canApprove = r.status === "Pending" && scope === "team" && isManager;
          return canApprove ? (
            <>
              <button onClick={() => { LEAVE_STORE.update(r.id, { status:"Approved" }); toast.success(`${r.leaveNumber} approved`); }}
                className="p-1.5 rounded-md text-green-600 transition-colors bg-transparent border-none cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20" title="Approve"><Check size={14}/></button>
              <button onClick={() => { LEAVE_STORE.update(r.id, { status:"Rejected" }); toast.error(`${r.leaveNumber} rejected`); }}
                className="p-1.5 rounded-md text-red-500 transition-colors bg-transparent border-none cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20" title="Reject"><X size={14}/></button>
            </>
          ) : (
            <button onClick={() => setViewLeave(r)} className="p-1.5 rounded-md text-primary transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary" title="View"><Eye size={14}/></button>
          );
        }}
      />
      </div>

      <Modal open={showTeamModal} onClose={() => setShowTeamModal(false)} title="My Reportees – Attendance Today" maxWidth="max-w-lg"
        footer={<Btn variant="secondary" size="sm" onClick={() => setShowTeamModal(false)}>Close</Btn>}>
        <div className="-m-2 divide-y divide-border">
          {teamAttendanceToday.map(({ emp, record }) => (
            <div key={emp.id} className="py-2.5 px-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-[0.625rem] font-bold shrink-0">
                  {emp.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis">{emp.name}</p>
                  <p className="text-[0.6875rem] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">{emp.designation} · {emp.department}</p>
                </div>
              </div>
              <StatusBadge status={record?.status || "Absent"}/>
            </div>
          ))}
          {teamAttendanceToday.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No reportees found.</p>
          )}
        </div>
      </Modal>

      <Modal open={showBalance} onClose={() => setShowBalance(false)} title="Leave Balance" maxWidth="max-w-lg"
        footer={<Btn variant="secondary" size="sm" onClick={() => setShowBalance(false)}>Close</Btn>}>
        {isManager && (
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-xs font-semibold text-muted-foreground">Employee</label>
            <select value={balanceEmpId} onChange={e=>setBalanceEmpId(e.target.value)} className={inputCls}>
              <option value={CURRENT_USER.id}>{CURRENT_USER.name} (You)</option>
              {MY_REPORTEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        )}
        <div className="-m-2 divide-y divide-border">
          {selectedBalance.map(b => (
            <div key={b.type} className="py-2.5 px-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">{b.type}</span>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Allocated: <span className="font-semibold text-foreground"><CountUp value={b.allocated}/></span></span>
                <span>Used: <span className="font-semibold text-foreground"><CountUp value={b.used}/></span></span>
                <span>Balance: <span className="font-semibold text-primary"><CountUp value={b.balance}/></span></span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={showApply} onClose={() => setShowApply(false)} title="Apply Leave"
        footer={<>
          <Btn variant="primary" size="sm" onClick={submitApply}>Submit</Btn>
          <Btn variant="secondary" size="sm" onClick={() => setShowApply(false)}>Cancel</Btn>
        </>}>
        <FormField label="Leave Type">
          <select value={applyForm.leaveType} onChange={e=>setApplyForm(f=>({...f, leaveType:e.target.value}))} className={inputCls}>
            {LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="From Date">
            <input type="date" value={applyForm.fromDate} onChange={e=>setApplyForm(f=>({...f, fromDate:e.target.value}))} className={inputCls}/>
          </FormField>
          <FormField label="To Date">
            <input type="date" value={applyForm.toDate} onChange={e=>setApplyForm(f=>({...f, toDate:e.target.value}))} className={inputCls}/>
          </FormField>
        </div>
        <FormField label="Reason">
          <textarea rows={3} value={applyForm.reason} onChange={e=>setApplyForm(f=>({...f, reason:e.target.value}))}
            placeholder="Reason for leave..." className={cn(inputCls,"resize-none")}/>
        </FormField>
      </Modal>

      <Modal open={!!viewLeave} onClose={() => setViewLeave(null)} title="Leave Request Details"
        footer={<Btn variant="secondary" size="sm" onClick={() => setViewLeave(null)}>Close</Btn>}>
        {viewLeave && (
          <div className="flex flex-col gap-2.5 text-sm">
            {[
              { label:"Leave No.", value:viewLeave.leaveNumber },
              { label:"Employee", value:viewLeave.employeeName },
              { label:"Leave Type", value:viewLeave.leaveType },
              { label:"From Date", value:viewLeave.fromDate },
              { label:"To Date", value:viewLeave.toDate },
              { label:"Days", value:viewLeave.days },
              { label:"Approver", value:viewLeave.approver },
              { label:"Status", value:viewLeave.status },
            ].map(f => (
              <div key={f.label} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-medium text-foreground text-right">{f.value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
