import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Btn } from "../../../shared/components/Btn";
import { StatusBadge } from "../../../shared/components/StatusBadge";
import { DataTable } from "../../../shared/components/DataTable";
import { useMyReporteesPendingCheckIns, useLocationActions } from "../hooks/useLocation";
import { useHasRole } from "../../../shared/access/role.store";

export function ApprovalQueue() {
  const pending = useMyReporteesPendingCheckIns();
  const { update } = useLocationActions();
  const hasManagerRole = useHasRole("Manager");

  const approve = (row) => {
    update(row.id, { status: "Approved" });
    toast.success(`Approved check-in for ${row.employeeName}`);
  };

  const reject = (row) => {
    update(row.id, { status: "Rejected" });
    toast.success(`Rejected check-in for ${row.employeeName}`);
  };

  const cols = [
    { key: "employeeName", label: "Employee" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "address", label: "Location" },
    { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <DataTable
      columns={cols}
      data={pending}
      title="Reportees' Pending Check-Ins"
      actions={(row) => hasManagerRole ? (
        <>
          <Btn variant="secondary" size="xs" onClick={() => approve(row)}>
            <Check size={12} /> Approve
          </Btn>
          <Btn variant="danger" size="xs" onClick={() => reject(row)}>
            <X size={12} /> Reject
          </Btn>
        </>
      ) : null}
    />
  );
}
