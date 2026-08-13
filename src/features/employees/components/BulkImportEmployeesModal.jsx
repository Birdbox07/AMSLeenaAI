import { useState, useEffect, useRef } from "react";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Modal, FormField } from "../../../shared/components/Modal";
import { Btn } from "../../../shared/components/Btn";
import { DEPTS, LOCS } from "../../../shared/mock/constants";

const REQUIRED_COLS = ["empCode", "name", "designation", "department", "email", "mobile", "manager", "location", "joinDate"];

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { header: [], rows: [] };
  const header = lines[0].split(",").map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const cells = line.split(",").map(c => c.trim());
    const obj = {};
    header.forEach((h, i) => { obj[h] = cells[i] ?? ""; });
    return obj;
  });
  return { header, rows };
}

function validateRow(row) {
  if (!row.empCode || !row.empCode.trim()) return "Missing empCode";
  if (!row.name || !row.name.trim()) return "Missing name";
  if (row.email && !/^\S+@\S+\.\S+$/.test(row.email)) return "Invalid email format";
  return undefined;
}

export function BulkImportEmployeesModal({ open, onClose, employees, onImport }) {
  const [rows, setRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [parseError, setParseError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setRows([]); setImporting(false); setProgress(0); setDone(false); setParseError("");
    }
  }, [open]);

  const onFileSelected = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv") { setParseError("Please select a .csv file"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const { header, rows: parsedRows } = parseCSV(String(e.target.result || ""));
      const missingCols = REQUIRED_COLS.filter(c => !header.includes(c));
      if (missingCols.length > 0) {
        setParseError(`CSV is missing required column(s): ${missingCols.join(", ")}`);
        setRows([]);
        return;
      }
      setParseError("");
      setRows(parsedRows.map(r => ({ data: r, error: validateRow(r) })));
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeRow = (idx) => setRows(prev => prev.filter((_, i) => i !== idx));

  const close = () => {
    onClose();
    setRows([]); setImporting(false); setProgress(0); setDone(false); setParseError("");
  };

  const submit = () => {
    if (rows.length === 0) { toast.error("Please select a CSV file with employee rows"); return; }
    if (rows.some(r => r.error)) { toast.error("Remove or fix rows with errors before importing"); return; }
    setImporting(true);
    setProgress(0);
  };

  useEffect(() => {
    if (!importing) return;
    const interval = setInterval(() => {
      setProgress(p => {
        const next = Math.min(100, p + Math.floor(Math.random() * 18) + 8);
        if (next >= 100) {
          clearInterval(interval);
          let created = 0, updated = 0;
          rows.forEach(({ data }) => {
            const existing = employees.find(e => e.empCode === data.empCode);
            if (existing) {
              onImport.update(existing.id, {
                name: data.name, designation: data.designation, department: data.department,
                email: data.email, mobile: data.mobile, manager: data.manager,
                location: data.location, joinDate: data.joinDate,
              });
              updated++;
            } else {
              onImport.add({
                id: `EMP${Date.now()}_${created}`, empCode: data.empCode, name: data.name,
                designation: data.designation, department: data.department, email: data.email,
                mobile: data.mobile, manager: data.manager, status: "Active",
                location: data.location || LOCS[0], joinDate: data.joinDate || new Date().toISOString().split("T")[0],
              });
              created++;
            }
          });
          setImporting(false);
          setDone(true);
          toast.success(`Imported ${created} new and updated ${updated} employee record(s)`);
        }
        return next;
      });
    }, 250);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importing]);

  const validCount = rows.filter(r => !r.error).length;

  return (
    <Modal open={open} onClose={close} title="Bulk Import Employees" maxWidth="max-w-lg"
      footer={done ? (
        <Btn variant="primary" size="sm" onClick={close}>Done</Btn>
      ) : (
        <>
          <Btn variant="primary" size="sm" onClick={submit}>
            {importing ? "Importing..." : `Import All (${validCount})`}
          </Btn>
          <Btn variant="secondary" size="sm" onClick={close}>Cancel</Btn>
        </>
      )}>
      {done ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <CheckCircle size={40} className="text-green-600" />
          <p className="text-sm font-medium text-foreground">Employees imported successfully</p>
        </div>
      ) : importing ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <RefreshCw size={32} className="text-primary animate-spin" />
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-2 transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">Importing {validCount} record(s)... {progress}%</p>
        </div>
      ) : (
        <>
          <FormField label={`Select CSV File (columns: ${REQUIRED_COLS.join(", ")})`}>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={e => onFileSelected(e.target.files?.[0])}
              className="border border-border rounded-md py-2 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </FormField>
          {parseError && (
            <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle size={13} /> {parseError}</p>
          )}
          <div className="-mx-2 max-h-[260px] overflow-y-auto divide-y divide-border">
            {rows.map((r, i) => (
              <div key={i} className="p-2 flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{r.data.empCode} — {r.data.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{r.data.designation} · {r.data.department}</p>
                  {r.error && <p className="text-[11px] text-destructive">{r.error}</p>}
                </div>
                <button onClick={() => removeRow(i)} className="p-1.5 px-2 rounded-md text-red-500 bg-transparent border-none cursor-pointer transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0 text-sm font-bold" title="Remove">
                  &times;
                </button>
              </div>
            ))}
            {rows.length === 0 && !parseError && (
              <p className="text-sm text-muted-foreground py-6 text-center">Select a CSV file to preview and validate rows before import. Department values outside {DEPTS.length} known departments are still accepted as new values.</p>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
