import { useState, useMemo } from "react";
import { List, CalendarDays } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { SearchableSelect } from "../../shared/components/SearchableSelect";
import { useHolidaysQuery } from "./hooks/useHolidaysQuery";
import { HolidayCalendarGrid } from "./components/HolidayCalendarGrid";
import { LOCS } from "../../shared/mock/constants";
import "./holidays.css";

const LOCATION_OPTIONS = [{ value: "", label: "All Locations" }, ...LOCS.map(l => ({ value: l, label: l }))];

export default function HolidaysPage() {
  const { data: HOLIDAY_DATA } = useHolidaysQuery();
  const [view, setView] = useState("table");
  const [locationFilter, setLocationFilter] = useState("");

  const latestYear = useMemo(() => Math.max(...HOLIDAY_DATA.map(h => Number(h.date.slice(0, 4)))), [HOLIDAY_DATA]);
  const today = new Date();
  const [yearMode, setYearMode] = useState("current");
  const selectedYear = yearMode === "current" ? latestYear : latestYear - 1;

  const [calMonth, setCalMonth] = useState(() =>
    new Date(latestYear, latestYear === today.getFullYear() ? today.getMonth() : 0, 1)
  );

  const switchYear = (mode) => {
    setYearMode(mode);
    const y = mode === "current" ? latestYear : latestYear - 1;
    const m = (y === today.getFullYear()) ? today.getMonth() : 0;
    setCalMonth(new Date(y, m, 1));
  };

  const filtered = useMemo(() => HOLIDAY_DATA.filter(h =>
    h.date.startsWith(String(selectedYear)) &&
    (!locationFilter || h.location === "All" || h.location.split(",").includes(locationFilter))
  ), [HOLIDAY_DATA, selectedYear, locationFilter]);

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
        <h2 className="text-lg font-bold text-foreground">Holiday Calendar</h2>
        <div className="flex bg-muted p-1 rounded-lg gap-1">
          <button onClick={() => setView("table")}
            className={cn("flex items-center gap-1.5 py-1.5 px-4 text-sm font-medium rounded-md transition-colors border-none cursor-pointer", view==="table" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
            <List size={13}/> Table
          </button>
          <button onClick={() => setView("calendar")}
            className={cn("flex items-center gap-1.5 py-1.5 px-4 text-sm font-medium rounded-md transition-colors border-none cursor-pointer", view==="calendar" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
            <CalendarDays size={13}/> Calendar
          </button>
        </div>
      </div>

      <div className="relative z-10 bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-end animate-fade-in-up" style={{ animationDelay: "30ms" }}>
        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-xs font-semibold text-muted-foreground">Location</label>
          <SearchableSelect value={locationFilter} onChange={setLocationFilter} options={LOCATION_OPTIONS} placeholder="All Locations"/>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Year</label>
          <div className="flex bg-muted p-1 rounded-lg gap-1 w-fit">
            <button onClick={() => switchYear("previous")}
              className={cn("py-1.5 px-4 text-sm font-medium rounded-md transition-colors border-none cursor-pointer", yearMode==="previous" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
              {latestYear - 1}
            </button>
            <button onClick={() => switchYear("current")}
              className={cn("py-1.5 px-4 text-sm font-medium rounded-md transition-colors border-none cursor-pointer", yearMode==="current" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
              {latestYear}
            </button>
          </div>
        </div>
      </div>

      {view === "table" ? (
        <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <DataTable columns={cols} data={filtered} hideSearch/>
        </div>
      ) : (
        <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <HolidayCalendarGrid holidays={filtered} month={calMonth} onMonthChange={setCalMonth}/>
        </div>
      )}
    </div>
  );
}
