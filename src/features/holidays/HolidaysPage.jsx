import { useState, useMemo } from "react";
import { List, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { useHolidaysQuery } from "./hooks/useHolidaysQuery";
import "./holidays.css";

export default function HolidaysPage() {
  const { data: HOLIDAY_DATA } = useHolidaysQuery();
  const [view, setView] = useState("table");
  const [calMonth, setCalMonth] = useState(new Date(2025, 9, 1));
  const [typeFilter, setTypeFilter] = useState("");

  const filtered = useMemo(() => HOLIDAY_DATA.filter(h =>
    !typeFilter || h.type === typeFilter
  ), [HOLIDAY_DATA, typeFilter]);

  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthHolidays = HOLIDAY_DATA.filter(h => {
    const d = new Date(h.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const cols = [
    { key:"name", label:"Holiday Name", render: h => <span className="font-medium">{h.name}</span> },
    { key:"date", label:"Date" },
    { key:"day", label:"Day" },
    { key:"type", label:"Type", render: h => <StatusBadge status={h.type}/> },
    { key:"location", label:"Applicable Locations" },
  ];

  return (
    <div className="holidays-page flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <h2 className="text-lg font-bold text-foreground">Holiday Calendar 2025</h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted p-1 rounded-lg gap-1">
            <button onClick={() => setView("table")} className={cn("flex items-center gap-1.5 py-1 px-3 text-xs font-medium rounded-sm transition-colors text-muted-foreground bg-transparent border-none cursor-pointer", view==="table" && "bg-card shadow-sm text-foreground")}>
              <List size={12}/> Table
            </button>
            <button onClick={() => setView("calendar")} className={cn("flex items-center gap-1.5 py-1 px-3 text-xs font-medium rounded-sm transition-colors text-muted-foreground bg-transparent border-none cursor-pointer", view==="calendar" && "bg-card shadow-sm text-foreground")}>
              <CalendarDays size={12}/> Calendar
            </button>
          </div>
          {view==="table" && (
            <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
              className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All Types</option>
              {["National","Regional","Optional"].map(t=><option key={t}>{t}</option>)}
            </select>
          )}
        </div>
      </div>

      {view === "table" ? (
        <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <DataTable columns={cols} data={filtered}/>
        </div>
      ) : (
        <div className={cn("bg-card rounded-lg border border-border shadow-sm p-5", "animate-fade-in-up")} style={{ animationDelay: "60ms" }}>
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setCalMonth(new Date(year, month-1, 1))}
              className="p-2 rounded-sm transition-colors bg-transparent border-none cursor-pointer hover:bg-muted"><ChevronLeft size={16}/></button>
            <h3 className="font-bold text-base">{calMonth.toLocaleDateString("en",{month:"long",year:"numeric"})}</h3>
            <button onClick={() => setCalMonth(new Date(year, month+1, 1))}
              className="p-2 rounded-sm transition-colors bg-transparent border-none cursor-pointer hover:bg-muted"><ChevronRight size={16}/></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_,i) => <div key={`e${i}`}/>)}
            {Array.from({ length: daysInMonth }, (_,i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const holiday = monthHolidays.find(h => h.date === dateStr);
              const dayOfWeek = new Date(year, month, day).getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isToday = dateStr === new Date().toISOString().split("T")[0];
              return (
                <div key={day} className={cn(
                  "relative min-h-[60px] rounded-lg p-1.5 border border-border transition-colors",
                  isToday && "border-primary bg-primary/10",
                  isWeekend && "bg-muted/40",
                  holiday && "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
                  holiday && "hover-lift animate-fade-in-up"
                )} style={holiday ? { animationDelay: `${100 + day * 5}ms` } : undefined}>
                  <span className={cn("text-xs font-semibold text-foreground", isToday ? "text-primary" : isWeekend && "text-muted-foreground")}>
                    {day}
                  </span>
                  {holiday && (
                    <div className="mt-1 text-[9px] leading-tight text-red-600 dark:text-red-400 font-medium line-clamp-2">
                      {holiday.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-red-100 border border-red-200"/>&nbsp;Holiday</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-primary/10 border border-primary"/>&nbsp;Today</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-muted/40 border border-border"/>&nbsp;Weekend</span>
          </div>
        </div>
      )}
    </div>
  );
}
