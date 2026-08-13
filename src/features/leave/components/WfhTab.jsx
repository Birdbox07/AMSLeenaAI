import { useState, useMemo } from "react";
import { Plus, Check, X, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../shared/utils/cn";
import { Modal, FormField, inputCls } from "../../../shared/components/Modal";
import { Btn } from "../../../shared/components/Btn";
import { StatusBadge } from "../../../shared/components/StatusBadge";
import { DataTable } from "../../../shared/components/DataTable";
import { useWfhQuery, useWfhMutations } from "../hooks/useWfhQuery";
import { validateWfhForm } from "../leave.wfh.validators";
import { useCurrentUser, useMyReportees } from "../../employees/hooks/useEmployees";
import { useHasRole } from "../../../shared/access/role.store";

export default function WfhTab() {
  const { data: requests } = useWfhQuery();
  const STORE = useWfhMutations();
  const CURRENT_USER = useCurrentUser();
  const MY_REPORTEES = useMyReportees();
  const hasManagerRole = useHasRole("Manager");
  const isManager = MY_REPORTEES.length > 0 && hasManagerRole;
  const reporteeIds = useMemo(() => new Set(MY_REPORTEES.map(e => e.id)), [MY_REPORTEES]);
  const [scope, setScope] = useState(isManager ? "team" : "mine");

  const [tab, setTab] = useState("All");
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ fromDate: "", toDate: "", reason: "" });

  const scoped = useMemo(
    () => scope === "team" && isManager
      ? requests.filter(r => reporteeIds.has(r.employeeId))
      : requests.filter(r => r.employeeId === CURRENT_USER.id),
    [requests, scope, isManager, reporteeIds, CURRENT_USER]
  );

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
    { key: "fromDate", label: "From Date" },
    { key: "toDate", label: "To Date" },
    { key: "days", label: "Days" },
    { key: "reason", label: "Reason" },
    { key: "approver", label: "Approver" },
    { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
  ];

  const submitApply = () => {
    const errors = validateWfhForm(form);
    if (Object.keys(errors).length) { toast.error(Object.values(errors)[0]); return; }
    const from = new Date(form.fromDate), to = new Date(form.toDate);
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
    const request = {
      id: `WFH${Date.now()}`,
      requestNumber: `WFHN${Date.now().toString().slice(-6)}`,
      employeeId: CURRENT_USER.id, employeeName: CURRENT_USER.name,
      fromDate: form.fromDate, toDate: form.toDate, days,
      reason: form.reason, status: "Pending", approver: CURRENT_USER.manager,
    };
    STORE.add(request);
    toast.success(`WFH request ${request.requestNumber} submitted`);
    setShowApply(false);
    setForm({ fromDate: "", toDate: "", reason: "" });
  };

  return (
    <div className="flex flex-col gap-4">
      {isManager && (
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          <button onClick={() => setScope("team")}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors cursor-pointer border-none", scope === "team" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
            <Users size={13}/> My Reportees
          </button>
          <button onClick={() => setScope("mine")}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors cursor-pointer border-none", scope === "mine" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
            My Requests
          </button>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          {["All", "Pending", "Approved", "Rejected"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("py-1.5 px-4 text-sm font-medium rounded-md transition-colors text-muted-foreground bg-transparent border-none cursor-pointer hover:text-foreground", tab === t && "bg-card shadow text-foreground")}>
              {t} <span className="ml-1 text-xs opacity-70">({counts[t]})</span>
            </button>
          ))}
        </div>
        <Btn variant="primary" size="sm" onClick={() => setShowApply(true)}>
          <Plus size={14} /> Request WFH
        </Btn>
      </div>

      <DataTable
        title={scope === "team" && isManager ? "My Reportees' WFH Requests" : "My WFH Requests"}
        columns={cols}
        data={filtered}
        actions={(row) => row.status === "Pending" && scope === "team" && isManager ? (
          <>
            <button onClick={() => { STORE.approve(row.id); toast.success(`${row.requestNumber} approved — attendance updated to WFH`); }}
              className="p-1.5 rounded-md text-green-600 transition-colors bg-transparent border-none cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20" title="Approve"><Check size={14} /></button>
            <button onClick={() => { STORE.reject(row.id); toast.error(`${row.requestNumber} rejected`); }}
              className="p-1.5 rounded-md text-red-500 transition-colors bg-transparent border-none cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20" title="Reject"><X size={14} /></button>
          </>
        ) : null}
      />

      <Modal open={showApply} onClose={() => setShowApply(false)} title="Request Work From Home"
        footer={<>
          <Btn variant="primary" size="sm" onClick={submitApply}>Submit</Btn>
          <Btn variant="secondary" size="sm" onClick={() => setShowApply(false)}>Cancel</Btn>
        </>}>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="From Date">
            <input type="date" value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} className={inputCls} />
          </FormField>
          <FormField label="To Date">
            <input type="date" value={form.toDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} className={inputCls} />
          </FormField>
        </div>
        <FormField label="Reason">
          <textarea rows={3} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            placeholder="Reason for WFH request..." className={inputCls + " resize-none"} />
        </FormField>
        <p className="text-xs text-muted-foreground">On approval, attendance for each matching date will automatically be marked WFH.</p>
      </Modal>
    </div>
  );
}
