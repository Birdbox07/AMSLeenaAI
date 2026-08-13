import { useState, useMemo } from "react";
import { List, CalendarDays } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { useHolidaysQuery } from "./hooks/useHolidaysQuery";
import { HolidayCalendarGrid } from "./components/HolidayCalendarGrid";
import "./holidays.css";

export default function HolidaysPage() {
  const { data: HOLIDAY_DATA } = useHolidaysQuery();
  const [view, setView] = useState("table");
  const [typeFilter, setTypeFilter] = useState("");

  const filtered = useMemo(() => HOLIDAY_DATA.filter(h =>
    !typeFilter || h.type === typeFilter
  ), [HOLIDAY_DATA, typeFilter]);

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
        <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <HolidayCalendarGrid holidays={HOLIDAY_DATA}/>
        </div>
      )}
    </div>
  );
}
