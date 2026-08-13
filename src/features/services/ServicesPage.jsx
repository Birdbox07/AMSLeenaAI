import { useState } from "react";
import { GraduationCap, DoorOpen, CalendarDays } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import LearningPage from "../learning/LearningPage";
import ConferencePage from "../conference/ConferencePage";
import HolidaysPage from "../holidays/HolidaysPage";
import "./services.css";

export default function ServicesPage() {
  const [tab, setTab] = useState("learning");

  const tabs = [
    { id:"learning", label:"Learning Portal", icon:GraduationCap },
    { id:"conference", label:"Conference Room", icon:DoorOpen },
    { id:"holidays", label:"Holiday Calendar", icon:CalendarDays },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-foreground">Services</h2>
      <div className="flex gap-1 flex-wrap bg-muted p-1 rounded-lg w-fit animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        {tabs.map((t, i) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors border-none cursor-pointer bg-transparent text-muted-foreground hover:text-foreground hover-lift animate-fade-in-up", tab===t.id && "bg-card! shadow text-foreground!")}
            style={{ animationDelay: `${i*40}ms` }}>
            <t.icon size={14}/> {t.label}
          </button>
        ))}
      </div>
      {tab==="learning" && <LearningPage/>}
      {tab==="conference" && <ConferencePage/>}
      {tab==="holidays" && <HolidaysPage/>}
    </div>
  );
}
