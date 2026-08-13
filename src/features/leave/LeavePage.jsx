import { useState, useMemo, useEffect } from "react";
import { Users, Calendar, Plus, RefreshCw, Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../shared/utils/cn";
import { LEAVE_TYPES, LEAVE_SESSIONS, FORGOT_TO_SWIPE_REASONS } from "../../shared/mock/constants";
import { Modal, FormField, inputCls } from "../../shared/components/Modal";
import { Btn } from "../../shared/components/Btn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { useLeaveQuery, useLeaveMutations } from "./hooks/useLeaveQuery";
import { getLeaveBalance } from "./leave.mock";
import { validateApplyLeaveForm } from "./leave.validators";
import { useCurrentUser, useMyReportees } from "../employees/hooks/useEmployees";
import { useHasRole } from "../../shared/access/role.store";
import { CountUp } from "../../shared/components/CountUp";
import "./leave.css";

function datesInRange(start, end) {
  if (!start || !end || end < start) return [];
  const dates = [];
  const d = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (d <= last) {
    dates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

const emptyApplyForm = {
  leaveType: LEAVE_TYPES[0],
  startDate: "", endDate: "", reason: "",
  singleDate: "", session: LEAVE_SESSIONS[2], forgotReason: "",
};

export default function LeavePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold text-foreground">Leave Management</h2>
      </div>
      <LeaveRequestsSection />
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
  const [showApply, setShowApply] = useState(false);
  const [viewLeave, setViewLeave] = useState(null);
  const [applyForm, setApplyForm] = useState(emptyApplyForm);
  const [dateSessions, setDateSessions] = useState({});

  const isRangeType = applyForm.leaveType !== "Forgot to Swipe";
  const rangeDates = useMemo(() => isRangeType ? datesInRange(applyForm.startDate, applyForm.endDate) : [], [isRangeType, applyForm.startDate, applyForm.endDate]);

  useEffect(() => {
    if (!isRangeType) return;
    setDateSessions(prev => {
      const next = {};
      rangeDates.forEach(d => { next[d] = prev[d] || LEAVE_SESSIONS[2]; });
      return next;
    });
  }, [rangeDates, isRangeType]);

  const hasManagerRole = useHasRole("Manager");
  const isManager = MY_REPORTEES.length > 0 && hasManagerRole;
  const [scope, setScope] = useState(isManager ? "team" : "mine");
  const reporteeIds = useMemo(() => new Set(MY_REPORTEES.map(e=>e.id)), [MY_REPORTEES]);

  const reporteeBalances = useMemo(() =>
    MY_REPORTEES.map(emp => ({ emp, balances: getLeaveBalance(emp.id, leaves) })),
    [MY_REPORTEES, leaves]
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

  const myBalance = useMemo(() => getLeaveBalance(CURRENT_USER.id, leaves), [CURRENT_USER, leaves]);

  const sessionSummary = (r) => {
    if (r.session) return r.session;
    if (r.dateSessions) {
      const vals = Object.values(r.dateSessions);
      return vals.length > 1 ? `${vals.length} dates` : (vals[0] || "Full Session");
    }
    return "Full Session";
  };

  const cols = [
    { key:"leaveNumber", label:"Leave No." },
    { key:"employeeName", label:"Employee" },
    { key:"leaveType", label:"Leave Type" },
    { key:"session", label:"Session", render: sessionSummary },
    { key:"fromDate", label:"From Date" },
    { key:"toDate", label:"To Date" },
    { key:"days", label:"Days", render: r => <span className="font-semibold">{r.days}</span> },
    { key:"approver", label:"Approver" },
    { key:"status", label:"Status", render: r => <StatusBadge status={r.status}/> },
  ];

  const resetApplyForm = () => {
    setApplyForm(emptyApplyForm);
    setDateSessions({});
  };

  const submitApply = () => {
    const errors = validateApplyLeaveForm(applyForm);
    if (Object.keys(errors).length) { toast.error(Object.values(errors)[0]); return; }

    let leave;
    if (applyForm.leaveType === "Forgot to Swipe") {
      leave = {
        id: `LV${Date.now()}`, leaveNumber: `LVN${Date.now().toString().slice(-6)}`,
        employeeId: CURRENT_USER.id, employeeName: CURRENT_USER.name, department: CURRENT_USER.department,
        leaveType: applyForm.leaveType, session: applyForm.session,
        fromDate: applyForm.singleDate, toDate: applyForm.singleDate, days: 1,
        reason: applyForm.forgotReason,
        status: "Pending", approver: CURRENT_USER.manager,
      };
    } else {
      leave = {
        id: `LV${Date.now()}`, leaveNumber: `LVN${Date.now().toString().slice(-6)}`,
        employeeId: CURRENT_USER.id, employeeName: CURRENT_USER.name, department: CURRENT_USER.department,
        leaveType: applyForm.leaveType, dateSessions,
        fromDate: applyForm.startDate, toDate: applyForm.endDate, days: rangeDates.length,
        reason: applyForm.reason,
        status: "Pending", approver: CURRENT_USER.manager,
      };
    }
    LEAVE_STORE.add(leave);
    toast.success(`Leave request ${leave.leaveNumber} submitted`);
    setShowApply(false);
    resetApplyForm();
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
          {isManager && scope === "team" ? (
            <Btn variant="secondary" size="sm" onClick={() => setShowTeamModal(true)} className="hover-lift">
              <Users size={14}/> My Reportees' Leave Balance
            </Btn>
          ) : (
            <Btn variant="secondary" size="sm" onClick={() => setShowBalance(true)} className="hover-lift">
              <Calendar size={14}/> Leave Balance
            </Btn>
          )}
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

      <Modal open={showTeamModal} onClose={() => setShowTeamModal(false)} title="My Reportees – Leave Balance" maxWidth="max-w-lg"
        footer={<Btn variant="secondary" size="sm" onClick={() => setShowTeamModal(false)}>Close</Btn>}>
        <div className="-m-2 divide-y divide-border">
          {reporteeBalances.map(({ emp, balances }) => (
            <div key={emp.id} className="py-2.5 px-2 flex flex-col gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-[0.625rem] font-bold shrink-0">
                  {emp.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis">{emp.name}</p>
                  <p className="text-[0.6875rem] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">{emp.designation} · {emp.department}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-10">
                {balances.map(b => (
                  <span key={b.type} className="text-[11px] py-1 px-2 rounded-md bg-secondary text-secondary-foreground">
                    {b.type}: <span className="font-semibold text-primary">{b.balance}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
          {reporteeBalances.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No reportees found.</p>
          )}
        </div>
      </Modal>

      <Modal open={showBalance} onClose={() => setShowBalance(false)} title="Leave Balance" maxWidth="max-w-lg"
        footer={<Btn variant="secondary" size="sm" onClick={() => setShowBalance(false)}>Close</Btn>}>
        <div className="-m-2 divide-y divide-border">
          {myBalance.map(b => (
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

      <Modal open={showApply} onClose={() => { setShowApply(false); resetApplyForm(); }} title="Apply Leave" maxWidth="max-w-lg"
        footer={<>
          <Btn variant="primary" size="sm" onClick={submitApply}>Submit</Btn>
          <Btn variant="secondary" size="sm" onClick={() => { setShowApply(false); resetApplyForm(); }}>Cancel</Btn>
        </>}>
        <FormField label="Leave Type">
          <select value={applyForm.leaveType}
            onChange={e => { setApplyForm(f=>({...f, leaveType:e.target.value})); setDateSessions({}); }}
            className={inputCls}>
            {LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </FormField>

        {applyForm.leaveType === "Forgot to Swipe" ? (
          <>
            <FormField label="Date">
              <input type="date" value={applyForm.singleDate} onChange={e=>setApplyForm(f=>({...f, singleDate:e.target.value}))} className={inputCls}/>
            </FormField>
            {applyForm.singleDate && (
              <>
                <FormField label="Session">
                  <select value={applyForm.session} onChange={e=>setApplyForm(f=>({...f, session:e.target.value}))} className={inputCls}>
                    {LEAVE_SESSIONS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </FormField>
                <FormField label="Reason">
                  <select value={applyForm.forgotReason} onChange={e=>setApplyForm(f=>({...f, forgotReason:e.target.value}))} className={inputCls}>
                    <option value="">Select a reason...</option>
                    {FORGOT_TO_SWIPE_REASONS.map(r=><option key={r}>{r}</option>)}
                  </select>
                </FormField>
              </>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Date">
                <input type="date" value={applyForm.startDate} onChange={e=>setApplyForm(f=>({...f, startDate:e.target.value}))} className={inputCls}/>
              </FormField>
              <FormField label="End Date">
                <input type="date" value={applyForm.endDate} onChange={e=>setApplyForm(f=>({...f, endDate:e.target.value}))} className={inputCls}/>
              </FormField>
            </div>
            {rangeDates.length > 0 && (
              <FormField label={`Session per Date (${rangeDates.length} day${rangeDates.length>1?"s":""})`}>
                <div className="-mx-1 max-h-[200px] overflow-y-auto flex flex-col gap-1.5 pr-1">
                  {rangeDates.map(d => (
                    <div key={d} className="flex items-center justify-between gap-2 py-1 px-2 rounded-md bg-secondary/40">
                      <span className="text-sm text-foreground">{d}</span>
                      <select value={dateSessions[d] || LEAVE_SESSIONS[2]}
                        onChange={e => setDateSessions(prev => ({ ...prev, [d]: e.target.value }))}
                        className="border border-border rounded-md py-1 px-2 text-xs bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
                        {LEAVE_SESSIONS.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </FormField>
            )}
            <FormField label="Reason (optional)">
              <textarea rows={3} value={applyForm.reason} onChange={e=>setApplyForm(f=>({...f, reason:e.target.value}))}
                placeholder="Reason for leave..." className={cn(inputCls,"resize-none")}/>
            </FormField>
          </>
        )}
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
              ...(viewLeave.reason ? [{ label:"Reason", value:viewLeave.reason }] : []),
            ].map(f => (
              <div key={f.label} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-medium text-foreground text-right">{f.value}</span>
              </div>
            ))}
            {viewLeave.dateSessions && Object.keys(viewLeave.dateSessions).length > 0 && (
              <div className="pt-2 mt-1 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">Session per Date</p>
                <div className="flex flex-col gap-1">
                  {Object.entries(viewLeave.dateSessions).map(([d, s]) => (
                    <div key={d} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">{d}</span>
                      <span className="font-medium text-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {viewLeave.session && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Session</span>
                <span className="font-medium text-foreground text-right">{viewLeave.session}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
