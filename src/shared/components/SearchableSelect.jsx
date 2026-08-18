import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "../utils/cn";

// A searchable, scrollable dropdown used in place of a plain <select> when the
// option list is long. `options` accepts either a string[] or a
// {value,label}[] array. Controlled like a native select via value/onChange.
export function SearchableSelect({ value, onChange, options, placeholder = "Select...", disabled, className }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  const normalized = useMemo(
    () => options.map(o => (typeof o === "string" ? { value: o, label: o } : o)),
    [options]
  );

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return normalized;
    const q = query.toLowerCase();
    return normalized.filter(o => o.label.toLowerCase().includes(q));
  }, [normalized, query]);

  const selected = normalized.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={cn(
          "w-full flex items-center justify-between border border-border rounded-md py-2 px-3 text-sm font-normal bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={14} className="text-muted-foreground shrink-0 ml-2" />
      </button>
      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-md shadow-lg flex flex-col">
          <div className="flex items-center gap-2 py-1.5 px-2 border-b border-border shrink-0">
            <Search size={13} className="text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 text-sm bg-transparent outline-none min-w-0"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">No matches</p>
            ) : (
              filtered.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm font-normal bg-transparent border-none cursor-pointer transition-colors hover:bg-secondary",
                    o.value === value && "bg-secondary font-medium"
                  )}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
