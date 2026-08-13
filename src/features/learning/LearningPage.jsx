import { ExternalLink } from "lucide-react";
import { useLearningQuery } from "./hooks/useLearningQuery";
import { DataTable } from "../../shared/components/DataTable";
import "./learning.css";

export default function LearningPage() {
  const { data: COURSES } = useLearningQuery();

  const cols = [
    { key:"url", label:"URL", render: c => (
      <a href={c.url} target="_blank" rel="noopener noreferrer"
        className="text-primary text-sm inline-flex items-center gap-1.5 hover:underline">
        {c.url} <ExternalLink size={12} className="shrink-0"/>
      </a>
    )},
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-foreground">Learning Portal</h2>
      <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <DataTable columns={cols} data={COURSES}/>
      </div>
    </div>
  );
}
