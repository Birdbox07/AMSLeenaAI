import { useState, useMemo } from "react";
import { Plus, Check, X, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../shared/utils/cn";
import { Modal, FormField, inputCls } from "../../../shared/components/Modal";
import { Btn } from "../../../shared/components/Btn";
import { StatusBadge } from "../../../shared/components/StatusBadge";
import { DataTable } from "../../../shared/components/DataTable";
import { useCompOffQuery, useCompOffMutations } from "../hooks/useCompOffQuery";
import { getCompOffBalance } from "../leave.compoff.mock";
import { validateCompOffAvailForm } from "../leave.compoff.validators";
import { useCurrentUser, useMyReportees } from "../../employees/hooks/useEmployees";
import { useHasRole } from "../../../shared/access/role.store";

export default function CompOffTab() {
  const { data: entries } = useCompOffQuery();
  const STORE = useCompOffMutations();
  const CURRENT_USER = useCurrentUser();
  const MY_REPORTEES = useMyReportees();
  const hasManagerRole = useHasRole("Manager");
  const isManager = MY_REPORTEES.length > 0 && hasManagerRole;
  const reporteeIds = useMemo(() => new Set(MY_REPORTEES.map(e => e.id)), [MY_REPORTEES]);
  const [scope, setScope] = useState(isManager ? "team" : "mine");

  const [showAvail, setShowAvail] = useState(false);
  const [form, setForm] = useState({ date: "", days: "1", reason: "" });

  const scoped = useMemo(
    () => scope === "team" && isManager
      ? entries.filter(e => reporteeIds.has(e.employeeId))
      : entries.filter(e => e.employeeId === CURRENT_USER.id),
    [entries, scope, isManager, reporteeIds, CURRENT_USER]
  );

  const myBalance = useMemo(() => getCompOffBalance(CURRENT_USER.id, entries), [entries, CURRENT_USER]);

  const cols = [
    { key: "employeeName", label: "Employee" },
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
    { key: "days", label: "Days" },
    { key: "reason", label: "Reason" },
    { key: "approver", label: "Approver" },
    { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
  ];

  const submitAvail = () => {
    const errors = validateCompOffAvailForm(form, myBalance.balance);
    if (Object.keys(errors).length) { toast.error(Object.values(errors)[0]); return; }
    const entry = {
      id: `CO${Date.now()}`,
      employeeId: CURRENT_USER.id,
      employeeName: CURRENT_USER.name,
      date: form.date,
      type: "Debit",
      days: Number(form.days),
      reason: form.reason,
      status: "Pending",
      approver: CURRENT_USER.manager,
    };
    STORE.add(entry);
    toast.success("Comp-off avail request submitted for approval");
    setShowAvail(false);
    setForm({ date: "", days: "1", reason: "" });
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
            My Ledger
          </button>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">
          My Comp-Off Balance: <span className="font-bold text-primary">{myBalance.balance}</span>{" "}
          <span className="text-xs">(Earned {myBalance.credits} − Availed {myBalance.debits})</span>
        </div>
        <Btn variant="primary" size="sm" onClick={() => setShowAvail(true)}>
          <Plus size={14} /> Avail Comp-Off
        </Btn>
      </div>

      <DataTable
        title={scope === "team" && isManager ? "My Reportees' Comp-Off Ledger" : "My Comp-Off Ledger"}
        columns={cols}
        data={scoped}
        actions={(row) => row.status === "Pending" && row.type === "Debit" && scope === "team" && isManager ? (
          <>
            <button onClick={() => { STORE.update(row.id, { status: "Approved" }); toast.success("Comp-off avail approved"); }}
              className="p-1.5 rounded-md text-green-600 transition-colors bg-transparent border-none cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20" title="Approve"><Check size={14} /></button>
            <button onClick={() => { STORE.update(row.id, { status: "Rejected" }); toast.error("Comp-off avail rejected"); }}
              className="p-1.5 rounded-md text-red-500 transition-colors bg-transparent border-none cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20" title="Reject"><X size={14} /></button>
          </>
        ) : null}
      />

      <Modal open={showAvail} onClose={() => setShowAvail(false)} title="Avail Comp-Off"
        footer={<>
          <Btn variant="primary" size="sm" onClick={submitAvail}>Submit</Btn>
          <Btn variant="secondary" size="sm" onClick={() => setShowAvail(false)}>Cancel</Btn>
        </>}>
        <FormField label="Date">
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
        </FormField>
        <FormField label="Days">
          <select value={form.days} onChange={e => setForm(f => ({ ...f, days: e.target.value }))} className={inputCls}>
            <option value="1">1 (Full day)</option>
            <option value="0.5">0.5 (Half day)</option>
          </select>
        </FormField>
        <FormField label="Reason">
          <textarea rows={3} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            placeholder="Reason for availing comp-off..." className={inputCls + " resize-none"} />
        </FormField>
        <p className="text-xs text-muted-foreground">Available balance: <span className="font-semibold text-foreground">{myBalance.balance}</span> day(s). This request requires manager approval before it deducts from your balance.</p>
      </Modal>
    </div>
  );
}
