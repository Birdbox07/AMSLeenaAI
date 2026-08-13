import { useState, useMemo, useEffect } from "react";
import { Plus, Eye, Pencil, RefreshCw, User, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../shared/utils/cn";
import { DEPTS } from "../../shared/mock/constants";
import { Modal, FormField, inputCls } from "../../shared/components/Modal";
import { Btn } from "../../shared/components/Btn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { useServiceDeskQuery, useServiceDeskMutations } from "./hooks/useServiceDeskQuery";
import { useServiceDeskCategoryOptionsQuery } from "./hooks/useServiceDeskCategoryOptionsQuery";
import { TICKET_CATS } from "./servicedesk.mock";
import { validateNewTicketForm } from "./servicedesk.validators";
import { useCurrentUser, useMyReportees } from "../employees/hooks/useEmployees";
import { useHasRole } from "../../shared/access/role.store";
import { useGlobalSearchStore } from "../../shared/utils/globalSearch.store";
import { CountUp } from "../../shared/components/CountUp";
import "./servicedesk.css";

// Labels for the category-specific extra fields, used both to render the
// Raise Ticket form and to display a submitted ticket's categoryDetails.
const CATEGORY_FIELD_LABELS = {
  idCardRequestType: "ID Card Request Type",
  lunchRequestType: "Lunch Request Type",
  lunchFromDate: "From Date",
  lunchToDate: "To Date",
  lunchCount: "Count",
  repairItem: "Repair Item",
  repairCount: "Count",
  repairFloor: "Floor",
  stationaryCategory: "Stationary Category",
  stationaryItem: "Stationary Item",
  stationaryQuantity: "Quantity",
  stationaryUnit: "Unit",
  stationaryDepartment: "Department",
  stationaryFloor: "Floor",
};

export default function ServiceDeskPage() {
  const { data: tickets } = useServiceDeskQuery();
  const { add, update } = useServiceDeskMutations();
  const { data: catOptions } = useServiceDeskCategoryOptionsQuery();
  const CURRENT_USER = useCurrentUser();
  const MY_REPORTEES = useMyReportees();
  const hasManagerRole = useHasRole("Manager");
  const isManager = MY_REPORTEES.length > 0 && hasManagerRole;
  const isHrAdmin = useHasRole("HR Admin");
  const reporteeIds = useMemo(() => new Set(MY_REPORTEES.map(e => e.id)), [MY_REPORTEES]);

  const [tab, setTab] = useState("mine");

  const [initialSearch, setInitialSearch] = useState("");
  useEffect(() => {
    const q = useGlobalSearchStore.getState().consumePending("servicedesk");
    if (q) setInitialSearch(q);
  }, []);

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const [editTicket, setEditTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({ category: TICKET_CATS[0], priority: "Medium", subject:"", description:"" });
  const [categoryDetails, setCategoryDetails] = useState({});

  const myTickets = useMemo(() => tickets.filter(t => t.employeeId === CURRENT_USER.id), [tickets, CURRENT_USER]);
  const assignedTickets = useMemo(() => {
    if (isHrAdmin) return tickets;
    if (isManager) return tickets.filter(t => reporteeIds.has(t.employeeId));
    return [];
  }, [tickets, isHrAdmin, isManager, reporteeIds]);

  const scoped = tab === "assigned" ? assignedTickets : myTickets;

  const filtered = useMemo(() => scoped.filter(t =>
    (!statusFilter || t.status === statusFilter) &&
    (!priorityFilter || t.priority === priorityFilter) &&
    (!catFilter || t.category === catFilter)
  ), [scoped, statusFilter, priorityFilter, catFilter]);

  const stats = useMemo(() => ({
    open: scoped.filter(t=>t.status==="Open").length,
    inProgress: scoped.filter(t=>t.status==="In Progress").length,
    resolved: scoped.filter(t=>t.status==="Resolved").length,
  }), [scoped]);

  const submitTicket = () => {
    const errors = validateNewTicketForm(newTicket);
    if (Object.keys(errors).length) {
      toast.error(Object.values(errors)[0]);
      return;
    }
    const ticket = {
      id: `TKT${Date.now()}`, ticketNumber: `TKT${Date.now().toString().slice(-5)}`,
      employeeId: CURRENT_USER.id, employeeName: CURRENT_USER.name, category: newTicket.category, priority: newTicket.priority,
      status: "Open", assignedTo: "Unassigned", createdDate: new Date().toISOString().split("T")[0],
      subject: newTicket.subject.trim(),
      categoryDetails: Object.keys(categoryDetails).length ? categoryDetails : undefined,
    };
    add(ticket);
    toast.success(`Ticket ${ticket.ticketNumber} raised successfully!`);
    setShowTicketForm(false);
    setNewTicket({ category: TICKET_CATS[0], priority:"Medium", subject:"", description:"" });
    setCategoryDetails({});
  };

  const setDetail = (key, value) => setCategoryDetails(d => ({ ...d, [key]: value }));

  const closeTicketForm = () => {
    setShowTicketForm(false);
    setNewTicket({ category: TICKET_CATS[0], priority:"Medium", subject:"", description:"" });
    setCategoryDetails({});
  };

  const cols = [
    { key:"ticketNumber", label:"Ticket #" },
    { key:"subject", label:"Subject", render: t => <span className="font-medium max-w-[200px] block whitespace-nowrap overflow-hidden text-ellipsis">{t.subject}</span> },
    { key:"employeeName", label:"Raised By" },
    { key:"category", label:"Category" },
    { key:"priority", label:"Priority", render: t => <StatusBadge status={t.priority}/> },
    { key:"status", label:"Status", render: t => <StatusBadge status={t.status}/> },
    { key:"assignedTo", label:"Assigned To" },
    { key:"createdDate", label:"Created Date" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className={cn("flex items-center justify-between flex-wrap gap-2", "animate-fade-in-up")} style={{ animationDelay: "0ms" }}>
        <h2 className="text-lg font-bold text-foreground">Service Desk</h2>
        <Btn variant="primary" size="sm" onClick={() => setShowTicketForm(true)}>
          <Plus size={14}/> Raise Ticket
        </Btn>
      </div>

      <div className={cn("flex gap-1 flex-wrap bg-muted p-1 rounded-lg w-fit", "animate-fade-in-up")} style={{ animationDelay: "30ms" }}>
        <button onClick={() => setTab("mine")}
          className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors border-none cursor-pointer bg-transparent text-muted-foreground hover:text-foreground", tab==="mine" && "bg-card! shadow text-foreground!")}>
          <User size={14}/> My Tickets
        </button>
        {(isManager || isHrAdmin) && (
          <button onClick={() => setTab("assigned")}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors border-none cursor-pointer bg-transparent text-muted-foreground hover:text-foreground", tab==="assigned" && "bg-card! shadow text-foreground!")}>
            <Users size={14}/> Assigned Tickets
          </button>
        )}
      </div>

      <div className={cn("grid grid-cols-3 gap-4", "animate-fade-in-up")} style={{ animationDelay: "60ms" }}>
        {[
          { label:"Open", value:stats.open, color:"bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300", pulse:true },
          { label:"In Progress", value:stats.inProgress, color:"bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300" },
          { label:"Resolved", value:stats.resolved, color:"bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300" },
        ].map((s,i)=>(
          <div key={s.label} className={cn("border rounded-lg py-4 px-5 text-center hover-lift animate-fade-in-up", s.color)} style={{ animationDelay: `${100 + i*40}ms` }}>
            <p className="text-3xl font-bold flex items-center justify-center gap-2">
              <CountUp value={s.value}/>
              {s.pulse && s.value > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot"/>}
            </p>
            <p className="text-xs font-semibold mt-1">{s.label} Tickets</p>
          </div>
        ))}
      </div>

      <div className={cn("bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-end", "animate-fade-in-up")} style={{ animationDelay: "120ms" }}>
        {[
          { label:"Status", val:statusFilter, set:setStatusFilter, opts:["Open","In Progress","Resolved","Closed"] },
          { label:"Priority", val:priorityFilter, set:setPriorityFilter, opts:["Low","Medium","High","Critical"] },
          { label:"Category", val:catFilter, set:setCatFilter, opts:TICKET_CATS },
        ].map(f=>(
          <div key={f.label} className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">{f.label}</label>
            <select value={f.val} onChange={e=>f.set(e.target.value)}
              className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background min-w-[130px] focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All</option>
              {f.opts.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <Btn variant="ghost" size="sm" onClick={() => { setStatusFilter(""); setPriorityFilter(""); setCatFilter(""); }}>
          <RefreshCw size={13}/> Reset
        </Btn>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
      <DataTable
        title={tab === "assigned" ? "Assigned Tickets" : "My Tickets"}
        columns={cols} data={filtered} initialSearch={initialSearch}
        actions={(row) => {
          const t = row;
          return (
            <>
              <button onClick={() => setViewTicket(t)} className="p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary text-primary"><Eye size={14}/></button>
              {tab === "assigned" && (
                <button onClick={() => setEditTicket(t)} className="p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary text-muted-foreground"><Pencil size={14}/></button>
              )}
            </>
          );
        }}
      />
      </div>

      <Modal open={showTicketForm} onClose={closeTicketForm} title="Raise New Ticket" maxWidth="max-w-2xl"
        footer={<>
          <Btn variant="primary" size="sm" onClick={submitTicket}>Submit Ticket</Btn>
          <Btn variant="secondary" size="sm" onClick={closeTicketForm}>Cancel</Btn>
        </>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Category">
            <select value={newTicket.category}
              onChange={e => { setNewTicket(f=>({...f, category:e.target.value})); setCategoryDetails({}); }}
              className={inputCls}>
              {TICKET_CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Priority">
            <select value={newTicket.priority} onChange={e=>setNewTicket(f=>({...f, priority:e.target.value}))} className={inputCls}>
              {["Low","Medium","High","Critical"].map(p=><option key={p}>{p}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Subject">
          <input value={newTicket.subject} onChange={e=>setNewTicket(f=>({...f, subject:e.target.value}))} placeholder="Brief subject..." className={inputCls}/>
        </FormField>
        <FormField label="Description">
          <textarea rows={3} value={newTicket.description} onChange={e=>setNewTicket(f=>({...f, description:e.target.value}))}
            placeholder="Describe your issue in detail..." className={cn(inputCls,"resize-none")}/>
        </FormField>

        {newTicket.category === "ID Card" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <FormField label="ID Card Request Type">
              <select value={categoryDetails.idCardRequestType || ""} onChange={e=>setDetail("idCardRequestType", e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {catOptions.idCardRequestTypes.map(o=><option key={o}>{o}</option>)}
              </select>
            </FormField>
          </div>
        )}

        {newTicket.category === "Lunch" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <FormField label="Lunch Request Type">
              <select value={categoryDetails.lunchRequestType || ""} onChange={e=>setDetail("lunchRequestType", e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {catOptions.lunchRequestTypes.map(o=><option key={o}>{o}</option>)}
              </select>
            </FormField>
            <FormField label="From Date">
              <input type="date" value={categoryDetails.lunchFromDate || ""} onChange={e=>setDetail("lunchFromDate", e.target.value)} className={inputCls}/>
            </FormField>
            <FormField label="To Date">
              <input type="date" value={categoryDetails.lunchToDate || ""} onChange={e=>setDetail("lunchToDate", e.target.value)} className={inputCls}/>
            </FormField>
            <FormField label="Count">
              <input type="number" min="1" value={categoryDetails.lunchCount || ""} onChange={e=>setDetail("lunchCount", e.target.value)} className={inputCls}/>
            </FormField>
          </div>
        )}

        {newTicket.category === "Repair and Maintenance" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <FormField label="Repair Item">
              <select value={categoryDetails.repairItem || ""} onChange={e=>setDetail("repairItem", e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {catOptions.repairItems.map(o=><option key={o}>{o}</option>)}
              </select>
            </FormField>
            <FormField label="Count">
              <input type="number" min="1" value={categoryDetails.repairCount || ""} onChange={e=>setDetail("repairCount", e.target.value)} className={inputCls}/>
            </FormField>
            <FormField label="Floor">
              <select value={categoryDetails.repairFloor || ""} onChange={e=>setDetail("repairFloor", e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {catOptions.floors.map(o=><option key={o}>{o}</option>)}
              </select>
            </FormField>
          </div>
        )}

        {newTicket.category === "Stationary" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <FormField label="Stationary Category">
              <select value={categoryDetails.stationaryCategory || ""}
                onChange={e => setCategoryDetails(d => ({ ...d, stationaryCategory: e.target.value, stationaryItem: "" }))}
                className={inputCls}>
                <option value="">Select...</option>
                {catOptions.stationaryCategories.map(o=><option key={o}>{o}</option>)}
              </select>
            </FormField>
            <FormField label="Stationary Item">
              <select value={categoryDetails.stationaryItem || ""} onChange={e=>setDetail("stationaryItem", e.target.value)}
                className={inputCls} disabled={!categoryDetails.stationaryCategory}>
                <option value="">Select...</option>
                {(catOptions.stationaryCategoryItems[categoryDetails.stationaryCategory] || []).map(o=><option key={o}>{o}</option>)}
              </select>
            </FormField>
            <FormField label="Quantity">
              <input type="number" min="1" value={categoryDetails.stationaryQuantity || ""} onChange={e=>setDetail("stationaryQuantity", e.target.value)} className={inputCls}/>
            </FormField>
            <FormField label="Unit">
              <select value={categoryDetails.stationaryUnit || ""} onChange={e=>setDetail("stationaryUnit", e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {catOptions.stationaryUnits.map(o=><option key={o}>{o}</option>)}
              </select>
            </FormField>
            <FormField label="Department">
              <select value={categoryDetails.stationaryDepartment || ""} onChange={e=>setDetail("stationaryDepartment", e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {DEPTS.map(o=><option key={o}>{o}</option>)}
              </select>
            </FormField>
            <FormField label="Floor">
              <select value={categoryDetails.stationaryFloor || ""} onChange={e=>setDetail("stationaryFloor", e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {catOptions.floors.map(o=><option key={o}>{o}</option>)}
              </select>
            </FormField>
          </div>
        )}
      </Modal>

      <Modal open={!!viewTicket} onClose={() => setViewTicket(null)} title="Ticket Details"
        footer={<Btn variant="secondary" size="sm" onClick={() => setViewTicket(null)}>Close</Btn>}>
        {viewTicket && (
          <div className="flex flex-col gap-2.5 text-sm">
            {[
              { label:"Ticket #", value:viewTicket.ticketNumber },
              { label:"Subject", value:viewTicket.subject },
              { label:"Raised By", value:viewTicket.employeeName },
              { label:"Category", value:viewTicket.category },
              { label:"Priority", value:viewTicket.priority },
              { label:"Status", value:viewTicket.status },
              { label:"Assigned To", value:viewTicket.assignedTo },
              { label:"Created Date", value:viewTicket.createdDate },
              ...Object.entries(viewTicket.categoryDetails || {})
                .filter(([, value]) => value)
                .map(([key, value]) => ({ label: CATEGORY_FIELD_LABELS[key] || key, value })),
            ].map(f => (
              <div key={f.label} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-medium text-foreground text-right">{f.value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={!!editTicket} onClose={() => setEditTicket(null)} title="Update Ticket"
        footer={<>
          <Btn variant="primary" size="sm" onClick={() => {
            if (!editTicket) return;
            toast.success(`${editTicket.ticketNumber} updated to ${editTicket.status}`);
            setEditTicket(null);
          }}>Save</Btn>
          <Btn variant="secondary" size="sm" onClick={() => setEditTicket(null)}>Cancel</Btn>
        </>}>
        {editTicket && (
          <>
            <p className="text-sm text-muted-foreground">{editTicket.ticketNumber} · {editTicket.subject}</p>
            <FormField label="Status">
              <select value={editTicket.status}
                onChange={e => { const status = e.target.value; update(editTicket.id, { status }); setEditTicket({ ...editTicket, status }); }}
                className={inputCls}>
                {["Open","In Progress","Resolved","Closed"].map(s=><option key={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Assigned To">
              <input value={editTicket.assignedTo}
                onChange={e => { update(editTicket.id, { assignedTo: e.target.value }); setEditTicket({ ...editTicket, assignedTo: e.target.value }); }}
                className={inputCls}/>
            </FormField>
          </>
        )}
      </Modal>
    </div>
  );
}
