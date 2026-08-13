import { useState, useMemo } from "react";
import { Users, Plus, RefreshCw, Check, X, Ban } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../shared/utils/cn";
import { Modal, FormField, inputCls } from "../../../shared/components/Modal";
import { Btn } from "../../../shared/components/Btn";
import { StatusBadge } from "../../../shared/components/StatusBadge";
import { DataTable } from "../../../shared/components/DataTable";
import { useCurrentUser, useMyReportees } from "../../employees/hooks/useEmployees";
import { useHasRole } from "../../../shared/access/role.store";
import { useRegularizationQuery, useRegularizationMutations } from "../hooks/useRegularizationQuery";
import { SESSIONS } from "../attendance.regularization.mock";
import { validateRegularizationForm, hasDuplicatePendingRequest } from "../attendance.regularization.validators";

export default function RegularizationTab() {
  const CURRENT_USER = useCurrentUser();
  const MY_REPORTEES = useMyReportees();
  const hasManagerRole = useHasRole("Manager");
  const isManager = MY_REPORTEES.length > 0 && hasManagerRole;
  const { data: requests } = useRegularizationQuery();
  const STORE = useRegularizationMutations();

  const [scope, setScope] = useState(isManager ? "team" : "mine");
  const [tab, setTab] = useState("All");
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ date: "", session: SESSIONS[0], reason: "", remarks: "" });
  const [errors, setErrors] = useState({});

  const reporteeIds = useMemo(() => new Set(MY_REPORTEES.map(e => e.id)), [MY_REPORTEES]);

  const scoped = useMemo(() => {
    if (isManager && scope === "team") return requests.filter(r => reporteeIds.has(r.employeeId));
    return requests.filter(r => r.employeeId === CURRENT_USER.id);
  }, [requests, isManager, scope, reporteeIds, CURRENT_USER]);

  const filtered = useMemo(() => scoped.filter(r => tab === "All" || r.status === tab), [scoped, tab]);

  const counts = useMemo(() => ({
    All: scoped.length,
    Pending: scoped.filter(r => r.status === "Pending").length,
    Approved: scoped.filter(r => r.status === "Approved").length,
    Rejected: scoped.filter(r => r.status === "Rejected").length,
  }), [scoped]);

  const cols = [
    { key: "requestNumber", label: "Request No." },
    { key: "employeeName", label: "Employee" },
    { key: "date", label: "Date" },
    { key: "session", label: "Session" },
    { key: "reason", label: "Reason" },
    { key: "manager", label: "Approver" },
    { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
  ];

  const submit = () => {
    const errs = validateRegularizationForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (hasDuplicatePendingRequest(requests, CURRENT_USER.id, form.date, form.session)) {
      toast.error("A pending request already exists for this date and session");
      return;
    }
    const req = {
      id: `REG${Date.now()}`,
      requestNumber: `REGN${Date.now().toString().slice(-6)}`,
      employeeId: CURRENT_USER.id,
      employeeName: CURRENT_USER.name,
      manager: CURRENT_USER.manager,
      date: form.date,
      session: form.session,
      reason: form.reason,
      remarks: form.remarks,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    STORE.add(req);
    toast.success(`Regularization request ${req.requestNumber} submitted`);
    setShowApply(false);
    setErrors({});
    setForm({ date: "", session: SESSIONS[0], reason: "", remarks: "" });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          {["All", "Pending", "Approved", "Rejected"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("py-1.5 px-4 text-sm font-medium rounded-md transition-colors text-muted-foreground bg-transparent border-none cursor-pointer hover:text-foreground", tab === t && "bg-card shadow text-foreground")}>
              {t} <span className="ml-1 text-xs opacity-70">({counts[t]})</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {isManager && (
            <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
              <button onClick={() => setScope("team")}
                className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors cursor-pointer border-none", scope === "team" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
                <Users size={13} /> My Reportees
              </button>
              <button onClick={() => setScope("mine")}
                className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors cursor-pointer border-none", scope === "mine" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
                My Requests
              </button>
            </div>
          )}
          <Btn variant="primary" size="sm" onClick={() => setShowApply(true)}>
            <Plus size={14} /> New Request
          </Btn>
        </div>
      </div>

      <DataTable
        title={isManager && scope === "team" ? "My Reportees' Regularization Requests" : "My Regularization Requests"}
        columns={cols}
        data={filtered}
        actions={(row) => {
          const isOwn = row.employeeId === CURRENT_USER.id;
          const isReportee = reporteeIds.has(row.employeeId);
          if (row.status !== "Pending") return null;
          if (isManager && scope === "team" && isReportee) {
            return (
              <>
                <button onClick={() => { STORE.update(row.id, { status: "Approved" }); toast.success(`${row.requestNumber} approved`); }}
                  className="p-1.5 rounded-md text-green-600 transition-colors bg-transparent border-none cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20" title="Approve"><Check size={14} /></button>
                <button onClick={() => { STORE.update(row.id, { status: "Rejected" }); toast.error(`${row.requestNumber} rejected`); }}
                  className="p-1.5 rounded-md text-red-500 transition-colors bg-transparent border-none cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20" title="Reject"><X size={14} /></button>
              </>
            );
          }
          if (isOwn) {
            return (
              <button onClick={() => { STORE.update(row.id, { status: "Cancelled" }); toast("Request cancelled"); }}
                className="p-1.5 rounded-md text-muted-foreground transition-colors bg-transparent border-none cursor-pointer hover:bg-muted" title="Cancel"><Ban size={14} /></button>
            );
          }
          return null;
        }}
      />

      <Modal open={showApply} onClose={() => setShowApply(false)} title="New Regularization Request"
        footer={<>
          <Btn variant="primary" size="sm" onClick={submit}>Submit</Btn>
          <Btn variant="secondary" size="sm" onClick={() => setShowApply(false)}>Cancel</Btn>
        </>}>
        <FormField label="Date">
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
          {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
        </FormField>
        <FormField label="Session">
          <select value={form.session} onChange={e => setForm(f => ({ ...f, session: e.target.value }))} className={inputCls}>
            {SESSIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Reason">
          <textarea rows={3} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            placeholder="Reason for missed swipe..." className={cn(inputCls, "resize-none")} />
          {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
        </FormField>
        <FormField label="Remarks (optional)">
          <textarea rows={2} value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
            placeholder="Additional remarks..." className={cn(inputCls, "resize-none")} />
        </FormField>
      </Modal>
    </div>
  );
}
