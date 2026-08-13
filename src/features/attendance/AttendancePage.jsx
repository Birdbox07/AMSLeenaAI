import { useState, useMemo, useEffect } from "react";
import { Users, RefreshCw, Table2, CalendarDays, Clock, LogOut } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { Btn } from "../../shared/components/Btn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { useAttendance } from "./hooks/useAttendance";
import { useCurrentUser, useMyReportees } from "../employees/hooks/useEmployees";
import { useHasRole } from "../../shared/access/role.store";
import { HOLIDAY_DATA } from "../holidays/holidays.mock";
import { LEAVE_TYPE_BY_EMP_DATE } from "../leave/leave.mock";
import { CountUp } from "../../shared/components/CountUp";
import "./attendance.css";

function dayEvent(record) {
  const isHoliday = HOLIDAY_DATA.some(h => h.date === record.date);
  if (isHoliday) return { label: "Holiday", status: "Holiday" };
  if (record.status === "Leave") {
    const leaveType = LEAVE_TYPE_BY_EMP_DATE.get(`${record.employeeId}_${record.date}`);
    if (leaveType === "On Duty") return { label: "On Duty", status: "On Duty" };
    return { label: leaveType || "Leave", status: "Leave" };
  }
  if (record.status === "Absent") return { label: "Forgot to Swipe", status: "Forgot to Swipe" };
  return { label: record.status, status: record.status };
}

function AttendanceCalendar({ records }) {
  const sorted = useMemo(() => [...records].sort((a,b) => a.date.localeCompare(b.date)), [records]);
  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No attendance records in this range.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {sorted.map(r => {
        const ev = dayEvent(r);
        const weekday = new Date(r.date).toLocaleDateString("en", { weekday: "short" });
        return (
          <div key={r.id} className="bg-card rounded-lg border border-border shadow-sm p-4 flex flex-col gap-2.5 hover-lift animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{r.date}</p>
                <p className="text-[11px] text-muted-foreground">{weekday}</p>
              </div>
              <StatusBadge status={ev.status}/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md bg-secondary/50 py-2 px-2.5 flex items-center gap-2">
                <Clock size={13} className="text-primary shrink-0"/>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Check In</p>
                  <p className="text-xs font-semibold text-foreground">{r.checkIn}</p>
                </div>
              </div>
              <div className="rounded-md bg-secondary/50 py-2 px-2.5 flex items-center gap-2">
                <LogOut size={13} className="text-primary shrink-0"/>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Check Out</p>
                  <p className="text-xs font-semibold text-foreground">{r.checkOut}</p>
                </div>
              </div>
            </div>
            {ev.label !== r.status && (
              <p className="text-xs text-muted-foreground">{ev.label}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AttendancePage() {
  const CURRENT_USER = useCurrentUser();
  const MY_REPORTEES = useMyReportees();
  const ATTENDANCE = useAttendance();
  const today = new Date();
  const hasManagerRole = useHasRole("Manager");
  const isManager = MY_REPORTEES.length > 0 && hasManagerRole;
  const [fromDate, setFromDate] = useState(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-01`);
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("");
  const [scope, setScope] = useState(isManager ? "team" : "mine");
  const [selectedReportee, setSelectedReportee] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const scopedEmployees = useMemo(() => {
    if (scope === "team" && isManager) {
      if (selectedReportee) return MY_REPORTEES.filter(e => e.id === selectedReportee);
      return MY_REPORTEES;
    }
    return [CURRENT_USER];
  }, [scope, isManager, selectedReportee, MY_REPORTEES, CURRENT_USER]);

  const scopedIds = useMemo(() => new Set(scopedEmployees.map(e => e.id)), [scopedEmployees]);

  useEffect(() => {
    if (scope !== "team") setSelectedReportee("");
  }, [scope]);

  useEffect(() => {
    if (scopedEmployees.length !== 1 && viewMode === "calendar") setViewMode("table");
  }, [scopedEmployees.length, viewMode]);

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

  const canShowCalendar = scopedEmployees.length === 1;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-foreground">Attendance</h2>

      <div className={cn("flex items-center justify-between flex-wrap gap-2", "animate-fade-in-up")} style={{ animationDelay: "60ms" }}>
        {isManager && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
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
            {scope === "team" && (
              <select value={selectedReportee} onChange={e=>setSelectedReportee(e.target.value)}
                className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring min-w-[180px]">
                <option value="">All Reportees</option>
                {MY_REPORTEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            )}
          </div>
        )}

        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit ml-auto">
          <button onClick={() => setViewMode("table")}
            className={cn(
              "flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors cursor-pointer border-none",
              viewMode==="table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent"
            )}>
            <Table2 size={13}/> Table View
          </button>
          <button onClick={() => canShowCalendar && setViewMode("calendar")}
            disabled={!canShowCalendar}
            title={!canShowCalendar ? "Select a single employee to use Calendar View" : undefined}
            className={cn(
              "flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors border-none",
              !canShowCalendar ? "text-muted-foreground/50 bg-transparent cursor-not-allowed" :
                viewMode==="calendar" ? "bg-card shadow-sm text-foreground cursor-pointer" : "text-muted-foreground hover:text-foreground bg-transparent cursor-pointer"
            )}>
            <CalendarDays size={13}/> Calendar View
          </button>
        </div>
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
        {viewMode === "calendar" && canShowCalendar ? (
          <AttendanceCalendar records={filtered}/>
        ) : (
          <DataTable columns={cols} data={filtered}/>
        )}
      </div>
    </div>
  );
}
