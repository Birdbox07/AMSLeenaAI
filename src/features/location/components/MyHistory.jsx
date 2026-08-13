import { useState, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { Btn } from "../../../shared/components/Btn";
import { StatusBadge } from "../../../shared/components/StatusBadge";
import { DataTable } from "../../../shared/components/DataTable";
import { useMyCheckIns } from "../hooks/useLocation";

export function MyHistory() {
  const myCheckIns = useMyCheckIns();
  const today = new Date();
  const [fromDate, setFromDate] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`);
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);

  const filtered = useMemo(
    () => myCheckIns.filter(r => r.date >= fromDate && r.date <= toDate),
    [myCheckIns, fromDate, toDate]
  );

  const cols = [
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "address", label: "Location" },
    { key: "lat", label: "Lat" },
    { key: "long", label: "Long" },
    { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">From Date</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">To Date</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <Btn variant="ghost" size="sm" onClick={() => {
          setFromDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`);
          setToDate(today.toISOString().split("T")[0]);
        }}>
          <RefreshCw size={13} /> Reset
        </Btn>
      </div>
      <DataTable columns={cols} data={filtered} title="My Check-In History" />
    </div>
  );
}
