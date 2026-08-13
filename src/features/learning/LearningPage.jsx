import { useState, useMemo } from "react";
import { BookOpen, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../shared/utils/cn";
import { Btn } from "../../shared/components/Btn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { CountUp } from "../../shared/components/CountUp";
import { useLearningQuery } from "./hooks/useLearningQuery";
import "./learning.css";

export default function LearningPage() {
  const { data: COURSES } = useLearningQuery();
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => COURSES.filter(c =>
    (!catFilter || c.category === catFilter) &&
    (!statusFilter || c.status === statusFilter)
  ), [COURSES, catFilter, statusFilter]);

  const cols = [
    { key:"courseName", label:"Course Name", render: c => <span className="font-medium">{c.courseName}</span> },
    { key:"category", label:"Category" },
    { key:"instructor", label:"Instructor" },
    { key:"employeeName", label:"Employee" },
    { key:"duration", label:"Duration" },
    { key:"progress", label:"Progress", render: c => (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-muted rounded-full h-1.5 w-20">
          <div className="bg-primary rounded-full h-1.5" style={{ width:`${c.progress}%` }}/>
        </div>
        <span className="text-xs text-muted-foreground">{c.progress}%</span>
      </div>
    )},
    { key:"dueDate", label:"Due Date" },
    { key:"status", label:"Status", render: c => <StatusBadge status={c.status}/> },
  ];

  const summary = useMemo(() => ({
    total: COURSES.length,
    completed: COURSES.filter(c=>c.status==="Completed").length,
    inProgress: COURSES.filter(c=>c.status==="In Progress").length,
    avgProgress: Math.round(COURSES.reduce((a,c)=>a+c.progress,0)/COURSES.length),
  }), [COURSES]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-foreground">Learning Portal</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label:"Total Courses", value:summary.total, color:"bg-primary text-white" },
          { label:"Completed", value:summary.completed, color:"bg-[#16a34a] text-white" },
          { label:"In Progress", value:summary.inProgress, color:"bg-[#2563eb] text-white" },
          { label:"Avg Progress", value:`${summary.avgProgress}%`, color:"bg-[#f97316] text-white" },
        ].map((s,i)=>(
          <div key={s.label} className={cn("rounded-lg p-4 text-center hover-lift animate-fade-in-up", s.color)} style={{ animationDelay: `${i*40}ms` }}>
            <p className="text-2xl font-bold">{typeof s.value === "number" ? <CountUp value={s.value}/> : s.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-90">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-end animate-fade-in-up" style={{ animationDelay: "180ms" }}>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Category</label>
          <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All Categories</option>
            {["Technical","Soft Skills","Finance","Compliance","Leadership"].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Status</label>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All</option>
            {["Not Started","In Progress","Completed"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <Btn variant="ghost" size="sm" onClick={() => { setCatFilter(""); setStatusFilter(""); }}><RefreshCw size={13}/> Reset</Btn>
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: "220ms" }}>
      <DataTable columns={cols} data={filtered}
        actions={() => (
          <button onClick={() => toast.info("Opening course")} className="p-1.5 rounded-md text-primary transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary">
            <BookOpen size={14}/>
          </button>
        )}
      />
      </div>
    </div>
  );
}
