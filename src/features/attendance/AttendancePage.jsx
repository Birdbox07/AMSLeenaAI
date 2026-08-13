import { useState, useMemo } from "react";
import { Users, RefreshCw } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { Btn } from "../../shared/components/Btn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { useAttendance } from "./hooks/useAttendance";
import { useCurrentUser, useMyReportees } from "../employees/hooks/useEmployees";
import { useHasRole } from "../../shared/access/role.store";
import RegularizationTab from "./components/RegularizationTab";
import ShiftChangeTab from "./components/ShiftChangeTab";
import { CountUp } from "../../shared/components/CountUp";
import "./attendance.css";

const MODULE_TABS = ["Attendance Log", "Regularization", "Shift Change"];

export default function AttendancePage() {
  const CURRENT_USER = useCurrentUser();
  const MY_REPORTEES = useMyReportees();
  const ATTENDANCE = useAttendance();
  const today = new Date();
  const hasManagerRole = useHasRole("Manager");
  const isManager = MY_REPORTEES.length > 0 && hasManagerRole;
  const [moduleTab, setModuleTab] = useState(MODULE_TABS[0]);
  const [fromDate, setFromDate] = useState(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-01`);
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("");
  const [scope, setScope] = useState(isManager ? "team" : "mine");

  const scopedIds = useMemo(() =>
    new Set(scope === "team" && isManager ? MY_REPORTEES.map(e=>e.id) : [CURRENT_USER.id]),
    [scope, isManager, MY_REPORTEES, CURRENT_USER]
  );

  const filtered = useMemo(() => ATTENDANCE.filter(r =>
    scopedIds.has(r.employeeId) &&
    r.date >= fromDate && r.date <= toDate &&
    (!statusFilter || r.status === statusFilter)
  ), [ATTENDANCE, scopedIds, fromDate, toDate, statusFilter]);

  const stats = useMemo(() => ({
    present: filtered.filter(r=>r.status==="Present").length,
    absent: filtered.filter(r=>r.status==="Absent").length,
    late: filtered.filter(r=>r.status==="Late").length,
    leave: filtered.filter(r=>r.status==="Leave").length,
    totalHours: filtered.reduce((a,r)=>a+r.hours,0),
  }), [filtered]);

  const cols = [
    { key:"employeeId", label:"Emp ID", width:"80px" },
    { key:"employeeName", label:"Employee" },
    { key:"date", label:"Date" },
    { key:"checkIn", label:"Check In" },
    { key:"checkOut", label:"Check Out" },
    { key:"hours", label:"Hours", render: r => <span>{r.hours > 0 ? `${r.hours}h` : "-"}</span> },
    { key:"overtime", label:"OT", render: r => <span>{r.overtime > 0 ? `${r.overtime}h` : "-"}</span> },
    { key:"status", label:"Status", render: r => <StatusBadge status={r.status}/> },
    { key:"location", label:"Location" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-foreground">Attendance Management</h2>

      <div className={cn("flex gap-1 bg-muted p-1 rounded-lg w-fit", "animate-fade-in-up")} style={{ animationDelay: "60ms" }}>
        {MODULE_TABS.map(t => (
          <button key={t} onClick={() => setModuleTab(t)}
            className={cn(
              "py-1.5 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer border-none",
              moduleTab===t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent"
            )}>
            {t}
          </button>
        ))}
      </div>

      {moduleTab === "Regularization" && <RegularizationTab/>}
      {moduleTab === "Shift Change" && <ShiftChangeTab/>}

      {moduleTab === "Attendance Log" && <>
      {isManager && (
        <div className={cn("flex gap-1 bg-muted p-1 rounded-lg w-fit", "animate-fade-in-up")} style={{ animationDelay: "120ms" }}>
          <button onClick={() => setScope("team")}
            className={cn(
              "flex items-center gap-1.5 py-1.5 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer border-none",
              scope==="team" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent"
            )}>
            <Users size={13}/> My Reportees
          </button>
          <button onClick={() => setScope("mine")}
            className={cn(
              "flex items-center gap-1.5 py-1.5 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer border-none",
              scope==="mine" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent"
            )}>
            My Attendance
          </button>
        </div>
      )}

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
          <label className="text-xs font-semibold text-muted-foreground">Status</label>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All</option>
            {["Present","Absent","Late","Leave","Holiday"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <Btn variant="ghost" size="sm" onClick={() => setStatusFilter("")}>
          <RefreshCw size={13}/> Reset
        </Btn>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label:"Present", value:stats.present, color:"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
          { label:"Absent", value:stats.absent, color:"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
          { label:"Late", value:stats.late, color:"bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
          { label:"On Leave", value:stats.leave, color:"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
          { label:"Total Hours", value:`${stats.totalHours}h`, color:"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", isHours:true },
        ].map((s,i)=>(
          <div key={s.label} className={cn("rounded-lg py-3 px-4 text-center hover-lift animate-fade-in-up", s.color)} style={{ animationDelay: `${240 + i*40}ms` }}>
            <p className="text-2xl font-bold">{s.isHours ? <><CountUp value={stats.totalHours}/>h</> : <CountUp value={s.value}/>}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "480ms" }}>
        <DataTable columns={cols} data={filtered}/>
      </div>
      </>}
    </div>
  );
}
