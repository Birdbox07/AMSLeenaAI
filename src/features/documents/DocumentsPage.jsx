import { useState, useMemo, useEffect } from "react";
import { FileText, Mail, Award, Shield, User, Briefcase, LogOut, Download, Eye, RefreshCw, FolderOpen, ReceiptText } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { downloadTextFile } from "../../shared/utils/downloadTextFile";
import { Modal } from "../../shared/components/Modal";
import { Btn } from "../../shared/components/Btn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { useDocumentsQuery } from "./hooks/useDocumentsQuery";
import { DOC_TYPES } from "./documents.mock";
import { useCurrentUser } from "../employees/hooks/useEmployees";
import { useDocAccess, isDocTypeAllowed } from "./hooks/useDocAccess";
import { useGlobalSearchStore } from "../../shared/utils/globalSearch.store";
import IncomeTaxDeclarationTab from "./components/IncomeTaxDeclarationTab";
import { CountUp } from "../../shared/components/CountUp";
import "./documents.css";

const DOC_TABS = [
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "taxdeclaration", label: "Income Tax Declaration", icon: ReceiptText },
];

const DOC_TYPE_ICONS = {
  "Payslip": FileText,
  "Form 16": FileText,
  "Appointment Letter": Mail,
  "Increment Letter": Award,
  "Medical Insurance": Shield,
  "Identity Card": User,
  "Offer Letter": Briefcase,
  "Relieving Letter": LogOut,
};

export default function DocumentsPage() {
  const { data: documents } = useDocumentsQuery();
  const CURRENT_USER = useCurrentUser();
  const access = useDocAccess(CURRENT_USER.id);
  const visibleDocTypes = useMemo(() => DOC_TYPES.filter(t => isDocTypeAllowed(access, t)), [access]);

  const [dateFilter, setDateFilter] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("");

  const docTypeCounts = useMemo(() =>
    visibleDocTypes.map(t => ({ type: t, count: documents.filter(d => d.docType === t).length })),
    [documents, visibleDocTypes]
  );
  const [viewDoc, setViewDoc] = useState(null);
  const [docTab, setDocTab] = useState("documents");

  const [initialSearch, setInitialSearch] = useState("");
  useEffect(() => {
    const q = useGlobalSearchStore.getState().consumePending("documents");
    if (q) setInitialSearch(q);
  }, []);

  const filteredDocs = useMemo(() =>
    documents.filter(d =>
      (!dateFilter || d.uploadDate === dateFilter) &&
      (!docTypeFilter || d.docType === docTypeFilter)
    ),
    [documents, dateFilter, docTypeFilter]
  );

  const cols = [
    { key:"employeeName", label:"Employee" },
    { key:"docType", label:"Document Type" },
    { key:"fileName", label:"File Name", render: d => <span className="text-primary text-xs">{d.fileName}</span> },
    { key:"uploadDate", label:"Upload Date" },
    { key:"size", label:"Size" },
    { key:"status", label:"Status", render: d => <StatusBadge status={d.status}/> },
  ];

  return (
    <div className="documents-page flex flex-col gap-4">
      <div className={cn("flex items-center justify-between flex-wrap gap-3", "animate-fade-in-up")} style={{ animationDelay: "0ms" }}>
        <h2 className="text-lg font-bold text-foreground">Employee Documents</h2>
        {docTab === "documents" && (
          <p className="text-xs text-muted-foreground">Uploads are managed from Employee Directory &rarr; Bulk Upload Documents.</p>
        )}
      </div>

      <div className={cn("flex gap-1 flex-wrap bg-muted p-1 rounded-lg w-fit", "animate-fade-in-up")} style={{ animationDelay: "60ms" }}>
        {DOC_TABS.map(t => (
          <button key={t.id} onClick={() => setDocTab(t.id)}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors border-none cursor-pointer bg-transparent text-muted-foreground hover:text-foreground", docTab===t.id && "bg-card! shadow text-foreground!")}>
            <t.icon size={14}/> {t.label}
          </button>
        ))}
      </div>

      {docTab === "taxdeclaration" && <IncomeTaxDeclarationTab />}

      {docTab === "documents" && (
      <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {docTypeCounts.map(({ type, count }, i) => {
          const Icon = DOC_TYPE_ICONS[type] || FileText;
          const active = docTypeFilter === type;
          return (
            <button key={type} onClick={() => setDocTypeFilter(active ? "" : type)}
              className={cn(
                "text-left bg-card rounded-lg border border-border shadow-sm p-4 flex items-center gap-3 transition-shadow hover:shadow-md hover:border-primary hover-lift animate-fade-in-up",
                active && "border-primary shadow-[0_0_0_1px_var(--primary)]"
              )}
              style={{ animationDelay: `${120 + i*40}ms` }}>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-secondary text-primary animate-pop-in",
                active && "bg-primary text-primary-foreground"
              )}>
                <Icon size={18}/>
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-foreground"><CountUp value={count}/></p>
                <p className="text-[11px] font-medium text-muted-foreground truncate">{type}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className={cn("bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-end", "animate-fade-in-up")} style={{ animationDelay: "300ms" }}>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Document Type</label>
          <select
            value={docTypeFilter}
            onChange={e => setDocTypeFilter(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring min-w-[150px]"
          >
            <option value="">All Types</option>
            {visibleDocTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Upload Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {(dateFilter || docTypeFilter) && (
          <Btn variant="ghost" size="sm" onClick={() => { setDateFilter(""); setDocTypeFilter(""); }}>
            <RefreshCw size={13}/> Reset
          </Btn>
        )}
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "360ms" }}>
      <DataTable
        columns={cols}
        data={filteredDocs}
        initialSearch={initialSearch}
        actions={(row) => {
          const d = row;
          return (
            <>
              <button onClick={() => { downloadTextFile(d.fileName, `${d.docType} for ${d.employeeName}\nUploaded: ${d.uploadDate}`); toast.success(`Downloading ${d.fileName}`); }}
                className="p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary text-primary" title="Download">
                <Download size={14}/>
              </button>
              <button onClick={() => setViewDoc(d)}
                className="p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary text-muted-foreground" title="View">
                <Eye size={14}/>
              </button>
            </>
          );
        }}
      />
      </div>
      </>
      )}

      <Modal open={!!viewDoc} onClose={() => setViewDoc(null)} title="Document Details"
        footer={<Btn variant="secondary" size="sm" onClick={() => setViewDoc(null)}>Close</Btn>}>
        {viewDoc && (
          <div className="flex flex-col gap-2.5 text-sm">
            {[
              { label:"Employee", value:viewDoc.employeeName },
              { label:"Document Type", value:viewDoc.docType },
              { label:"File Name", value:viewDoc.fileName },
              { label:"Upload Date", value:viewDoc.uploadDate },
              { label:"Size", value:viewDoc.size },
              { label:"Status", value:viewDoc.status },
            ].map(f => (
              <div key={f.label} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-medium text-foreground text-right">{f.value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
