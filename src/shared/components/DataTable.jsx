import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Search, Download, Printer, AlertCircle, ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../utils/cn";
import "./DataTable.css";

// Generic data table. Toolbar intentionally has Search / CSV / Print only
// (no copy-to-clipboard button) — shared by every module's table.
export function DataTable({ columns, data, title, actions, filterExtra, initialSearch }) {
  const [search, setSearch] = useState(initialSearch || "");
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    let d = data;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(row => columns.some(c => String(row[c.key] ?? "").toLowerCase().includes(q)));
    }
    if (sortKey) {
      d = [...d].sort((a, b) => {
        const av = String(a[sortKey] ?? "");
        const bv = String(b[sortKey] ?? "");
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return d;
  }, [data, search, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page-1)*pageSize, page*pageSize);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  useEffect(() => { setPage(1); }, [search]);

  const exportCSV = () => {
    toast.success("Exporting CSV...");
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col items-start gap-3 p-4 border-b border-border sm:flex-row sm:items-center">
        {title && <h3 className="font-semibold text-foreground mr-auto">{title}</h3>}
        {filterExtra}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="py-1.5 pl-8 pr-3 text-sm border border-border rounded-md bg-input-background w-48 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button onClick={exportCSV} className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium border border-border rounded-md bg-transparent cursor-pointer transition-colors hover:bg-muted" title="Export CSV">
            <Download size={13} /> CSV
          </button>
          <button onClick={() => toast.success("Printing...")} className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium border border-border rounded-md bg-transparent cursor-pointer transition-colors hover:bg-muted" title="Print">
            <Printer size={13} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable !== false && handleSort(String(col.key))}
                  className={cn(
                    "py-3 px-4 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap select-none",
                    col.sortable !== false && "cursor-pointer transition-colors hover:bg-white/10"
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && (
                      sortKey === String(col.key)
                        ? (sortDir === "asc" ? <ChevronUp size={13}/> : <ChevronDown size={13}/>)
                        : <ArrowUpDown size={12} className="opacity-50"/>
                    )}
                  </span>
                </th>
              ))}
              {actions && <th className="py-3 px-4 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap select-none">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border transition-colors">
                  {columns.map((_, j) => (
                    <td key={j} className="py-3 px-4">
                      <div className="h-4 bg-muted rounded-lg animate-pulse" style={{ width: `${60+((i*j*7)%40)}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-12 px-4 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle size={32} className="opacity-30" />
                    <p className="font-medium">No records found</p>
                    <p className="text-xs">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row, ri) => (
                <tr key={ri} className={cn("border-b border-border transition-colors hover:bg-secondary/50", ri % 2 !== 0 && "bg-muted/30")}>
                  {columns.map(col => (
                    <td key={String(col.key)} className="py-2.5 px-4 whitespace-nowrap text-foreground">
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                  {actions && (
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 py-3 px-4 border-t border-border bg-muted/20 sm:flex-row">
        <span className="text-xs text-muted-foreground">
          Showing {filtered.length === 0 ? 0 : (page-1)*pageSize+1}–{Math.min(page*pageSize, filtered.length)} of {filtered.length} records
        </span>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="text-xs border border-border rounded-lg py-1 px-2 bg-card focus:outline-none"
          >
            {[5,10,25,50].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
            className="p-1 rounded-lg border border-border bg-transparent cursor-pointer transition-colors hover:enabled:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronLeft size={14}/>
          </button>
          {Array.from({ length: Math.min(5,totalPages) }, (_, i) => {
            const pg = totalPages <= 5 ? i+1 : Math.max(1, Math.min(totalPages-4, page-2)) + i;
            return (
              <button key={pg} onClick={() => setPage(pg)}
                className={cn(
                  "w-7 h-7 text-xs rounded-lg border border-border bg-transparent cursor-pointer transition-colors hover:bg-muted",
                  page===pg && "bg-primary text-primary-foreground border-primary"
                )}>
                {pg}
              </button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
            className="p-1 rounded-lg border border-border bg-transparent cursor-pointer transition-colors hover:enabled:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronRight size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}
