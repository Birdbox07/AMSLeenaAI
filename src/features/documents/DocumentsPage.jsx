import { useState, useMemo, useEffect } from "react";
import { Download, FolderOpen, ReceiptText, FileDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../shared/utils/cn";
import { downloadTextFile } from "../../shared/utils/downloadTextFile";
import { Btn } from "../../shared/components/Btn";
import { FormField, inputCls } from "../../shared/components/Modal";
import { useDocumentsQuery } from "./hooks/useDocumentsQuery";
import { DOC_TYPES } from "./documents.mock";
import { useCurrentUser } from "../employees/hooks/useEmployees";
import { useDocAccess, isDocTypeAllowed } from "./hooks/useDocAccess";
import IncomeTaxDeclarationTab from "./components/IncomeTaxDeclarationTab";
import "./documents.css";

const DOC_TABS = [
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "taxdeclaration", label: "Income Tax Declaration", icon: ReceiptText },
];

export default function DocumentsPage() {
  const { data: documents } = useDocumentsQuery();
  const CURRENT_USER = useCurrentUser();
  const access = useDocAccess(CURRENT_USER.id);
  const visibleDocTypes = useMemo(() => DOC_TYPES.filter(t => isDocTypeAllowed(access, t)), [access]);

  const [docType, setDocType] = useState("");
  const [date, setDate] = useState("");
  const [docTab, setDocTab] = useState("documents");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pendingDoc, setPendingDoc] = useState(null);

  const startDownload = () => {
    if (!docType || !date) { toast.error("Select a Document Type and Date first"); return; }
    const doc = documents.find(d => d.docType === docType && d.uploadDate === date);
    if (!doc) { toast.error("No document found for the selected type and date"); return; }
    setPendingDoc(doc);
    setDownloading(true);
    setProgress(0);
  };

  useEffect(() => {
    if (!downloading) return;
    const interval = setInterval(() => {
      setProgress(p => {
        const next = Math.min(100, p + Math.floor(Math.random() * 18) + 8);
        if (next >= 100) {
          clearInterval(interval);
          downloadTextFile(pendingDoc.fileName, `${pendingDoc.docType} for ${pendingDoc.employeeName}\nUploaded: ${pendingDoc.uploadDate}`);
          toast.success(`Downloaded ${pendingDoc.fileName}`);
          setDownloading(false);
        }
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downloading]);

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
        <div className={cn("bg-card rounded-lg border border-border shadow-sm p-6 max-w-md animate-fade-in-up", "hover-lift")} style={{ animationDelay: "120ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
              <FileDown size={16}/>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Download a Document</h3>
              <p className="text-xs text-muted-foreground">Select the document type and date to download it.</p>
            </div>
          </div>

          <FormField label="Document Type">
            <select value={docType} onChange={e => setDocType(e.target.value)} className={inputCls} disabled={downloading}>
              <option value="">Select type...</option>
              {visibleDocTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </FormField>

          <FormField label="Date">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} disabled={downloading}/>
          </FormField>

          <Btn variant="primary" size="sm" onClick={startDownload} disabled={downloading} className="w-full justify-center mt-2">
            <Download size={14}/> {downloading ? "Downloading..." : "Download Document"}
          </Btn>

          {downloading && (
            <div className="flex flex-col gap-1.5 mt-4">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 transition-all duration-200" style={{ width: `${progress}%` }}/>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Downloading {pendingDoc?.fileName}... {progress}%
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
