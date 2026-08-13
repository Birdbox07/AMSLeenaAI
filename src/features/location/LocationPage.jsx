import { useState } from "react";
import { Users } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { useMyReportees } from "../employees/hooks/useEmployees";
import { useHasRole } from "../../shared/access/role.store";
import { CheckInPanel } from "./components/CheckInPanel";
import { ApprovalQueue } from "./components/ApprovalQueue";
import { MyHistory } from "./components/MyHistory";
import "./location.css";

export default function LocationPage() {
  const MY_REPORTEES = useMyReportees();
  const hasManagerRole = useHasRole("Manager");
  const isManager = MY_REPORTEES.length > 0 && hasManagerRole;
  const [scope, setScope] = useState(isManager ? "approvals" : "history");

  return (
    <div className="flex flex-col gap-4">
      <h2 className={cn("text-lg font-bold text-foreground", "animate-fade-in-up")} style={{ animationDelay: "0ms" }}>Location Tracker</h2>

      <div className={cn("hover-lift animate-fade-in-up")} style={{ animationDelay: "60ms" }}>
        <CheckInPanel />
      </div>

      {isManager && (
        <div className={cn("flex gap-1 bg-muted p-1 rounded-lg w-fit", "animate-fade-in-up")} style={{ animationDelay: "120ms" }}>
          <button onClick={() => setScope("approvals")}
            className={cn(
              "flex items-center gap-1.5 py-1.5 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer border-none",
              scope === "approvals" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent"
            )}>
            <Users size={13} /> My Reportees' Approvals
          </button>
          <button onClick={() => setScope("history")}
            className={cn(
              "flex items-center gap-1.5 py-1.5 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer border-none",
              scope === "history" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent"
            )}>
            My History
          </button>
        </div>
      )}

      <div className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
        {scope === "approvals" && isManager ? <ApprovalQueue /> : <MyHistory />}
      </div>
    </div>
  );
}
