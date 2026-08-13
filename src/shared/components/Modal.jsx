import { X } from "lucide-react";
import { cn } from "../utils/cn";
import "./Modal.css";

export function Modal({ open, onClose, title, children, footer, maxWidth = "max-w-md" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={cn("bg-card rounded-xl shadow-2xl w-full max-h-[85vh] flex flex-col", "animate-pop-in", maxWidth)}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 px-6 border-b border-border shrink-0">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg border-0 bg-transparent cursor-pointer transition-colors hover:bg-muted">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">{children}</div>
        {footer && <div className="flex gap-2 p-4 px-6 border-t border-border shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}

export const inputCls = "border border-border rounded-md py-2 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring";
