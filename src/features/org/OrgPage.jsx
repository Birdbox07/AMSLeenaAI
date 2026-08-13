import { useState } from "react";
import { Search, Info } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { useOrgQuery } from "./hooks/useOrgQuery";
import { OrgNodeCard } from "./components/OrgNodeCard";
import "./org.css";

export default function OrgPage() {
  const { data: tree } = useOrgQuery();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <h2 className="text-lg font-bold text-foreground">Organization Hierarchy</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14}/>
          <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search employee..."
            className="py-1.5 pr-3 pl-8 text-sm border border-border rounded-md bg-input-background w-56 focus:outline-none focus:ring-2 focus:ring-ring"/>
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border shadow-sm p-6 overflow-auto animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <div className="min-w-[600px]">
          <OrgNodeCard node={tree} level={0}/>
        </div>
      </div>
      <div className="bg-secondary/50 border border-border rounded-lg p-4 text-sm text-muted-foreground flex items-start gap-2 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <Info size={14} className="mt-0.5 shrink-0 text-primary"/>
        <span>Click the arrow on any node to expand or collapse team members. You are viewing from <strong className="text-foreground">CEO level</strong>. Managers see only their direct reporting structure.</span>
      </div>
    </div>
  );
}
