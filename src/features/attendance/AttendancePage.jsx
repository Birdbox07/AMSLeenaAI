import { useState, useMemo, useEffect } from "react";
import { Users, RefreshCw, Table2, CalendarDays } from "lucide-react";
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
    if (leaveType === "Forgot to Swipe") return { label: "Forgot to Swipe", status: "Forgot to Swipe" };
    return { label: leaveType || "Leave", status: "Leave" };
  }
  if (record.status === "Absent") return { label: "Forgot to Swipe", status: "Forgot to Swipe" };
  return { label: record.status, status: record.status };
}

const WEEKDAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const CELL_TINT = {
  Present: "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800/40",
  Late: "bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800/40",
  Leave: "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800/40",
  Holiday: "bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800/40",
  "On Duty": "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-800/40",
  "Forgot to Swipe": "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/40",
};

function getMonthWeeks(year, month) {
  const startOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function AttendanceCalendar({ records, fromDate, toDate }) {
  const recordsByDate = useMemo(() => {
    const m = new Map();
    records.forEach(r => m.set(r.date, r));
    return m;
  }, [records]);

  const months = useMemo(() => {
    const start = new Date(`${fromDate}T00:00:00`);
    const end = new Date(`${toDate}T00:00:00`);
    const list = [];
    let y = start.getFullYear(), m = start.getMonth();
    const endY = end.getFullYear(), endM = end.getMonth();
    while (y < endY || (y === endY && m <= endM)) {
      list.push({ year: y, month: m });
      m++;
      if (m > 11) { m = 0; y++; }
    }
    return list;
  }, [fromDate, toDate]);

  return (
    <div className="flex flex-col gap-6">
      {months.map(({ year, month }) => (
        <div key={`${year}-${month}`} className="bg-card rounded-lg border border-border shadow-sm p-4 overflow-x-auto">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {new Date(year, month, 1).toLocaleDateString("en", { month: "long", year: "numeric" })}
          </h3>
          <div className="min-w-[630px]">
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {WEEKDAY_LABELS.map(w => (
                <div key={w} className="text-center text-[11px] font-semibold text-muted-foreground py-1">{w}</div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              {getMonthWeeks(year, month).map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1.5">
                  {week.map((date, di) => {
                    if (!date) return <div key={di} className="min-h-[86px] rounded-md"/>;
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
                    const inRange = dateStr >= fromDate && dateStr <= toDate;
                    const record = recordsByDate.get(dateStr);
                    const isHoliday = HOLIDAY_DATA.some(h => h.date === dateStr);
                    let ev = null;
                    if (record) ev = dayEvent(record);
                    else if (isHoliday && inRange) ev = { label: "Holiday", status: "Holiday" };

                    return (
                      <div key={di} className={cn(
                        "min-h-[86px] rounded-md border p-1.5 flex flex-col gap-1 transition-colors",
                        ev ? (CELL_TINT[ev.status] || "border-border") : "border-border/50",
                        !inRange && "opacity-40"
                      )}>
                        <span className="text-[11px] font-semibold text-foreground">{date.getDate()}</span>
                        {ev && (
                          <>
                            <span className="text-[10px] font-semibold leading-tight text-foreground truncate" title={ev.label}>{ev.label}</span>
                            {record && (record.checkIn !== "-" || record.checkOut !== "-") && (
                              <span className="text-[9.5px] text-muted-foreground leading-tight">{record.checkIn} – {record.checkOut}</span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border">
            {Object.keys(CELL_TINT).map(status => (
              <span key={status} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className={cn("w-2.5 h-2.5 rounded-sm border shrink-0", CELL_TINT[status])}/>
                {status}
              </span>
            ))}
          </div>
        </div>
      ))}
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
          <AttendanceCalendar records={filtered} fromDate={fromDate} toDate={toDate}/>
        ) : (
          <DataTable columns={cols} data={filtered}/>
        )}
      </div>
    </div>
  );
}
