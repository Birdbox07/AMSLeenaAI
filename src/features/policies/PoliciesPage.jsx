import { useState, useMemo } from "react";
import { Plus, Download, Pencil, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { DEPTS } from "../../shared/mock/constants";
import { cn } from "../../shared/utils/cn";
import { Btn } from "../../shared/components/Btn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { Modal, FormField, inputCls } from "../../shared/components/Modal";
import { usePoliciesQuery, usePolicyMutations } from "./hooks/usePoliciesQuery";
import { validatePolicyForm } from "./policies.validators";
import { useHasRole } from "../../shared/access/role.store";
import "./policies.css";

const CATEGORIES = ["HR","IT","Finance","Operations","Compliance"];
const emptyForm = { policyName: "", category: "", department: "", version: "v1.0", effectiveDate: "", status: "Active" };

export default function PoliciesPage() {
  const { data: POLICIES } = usePoliciesQuery();
  const { add, update } = usePolicyMutations();
  const isHrAdmin = useHasRole("HR Admin");
  const [catFilter, setCatFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = add, {...policy} = edit
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const openAdd = () => { setEditing({}); setForm(emptyForm); setErrors({}); };
  const openEdit = (policy) => { setEditing(policy); setForm({ ...emptyForm, ...policy }); setErrors({}); };
  const closeModal = () => setEditing(null);

  const submitForm = () => {
    const validationErrors = validatePolicyForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    if (editing && editing.id) {
      update(editing.id, form);
      toast.success("Policy updated");
    } else {
      add({ id: `POL${Date.now()}`, ...form });
      toast.success("Policy added");
    }
    closeModal();
  };

  const filtered = useMemo(() => POLICIES.filter(p =>
    (!catFilter || p.category === catFilter) &&
    (!deptFilter || p.department === deptFilter || p.department === "All")
  ), [POLICIES, catFilter, deptFilter]);

  const cols = [
    { key:"policyName", label:"Policy Name", render: p => <span className="font-medium">{p.policyName}</span> },
    { key:"category", label:"Category", render: p => <StatusBadge status={p.category}/> },
    { key:"department", label:"Department" },
    { key:"version", label:"Version" },
    { key:"effectiveDate", label:"Effective Date" },
    { key:"status", label:"Status", render: p => <StatusBadge status={p.status}/> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <h2 className="text-lg font-bold text-foreground">Policies</h2>
        {isHrAdmin && (
          <Btn variant="primary" size="sm" onClick={openAdd}>
            <Plus size={14}/> Add Policy
          </Btn>
        )}
      </div>
      <div className={cn("bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-end", "animate-fade-in-up")} style={{ animationDelay: "60ms" }}>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Category</label>
          <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All Categories</option>
            {["HR","IT","Finance","Operations","Compliance"].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Department</label>
          <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All Departments</option>
            {DEPTS.map(d=><option key={d}>{d}</option>)}
          </select>
        </div>
        <Btn variant="ghost" size="sm" onClick={() => { setCatFilter(""); setDeptFilter(""); }}>
          <RefreshCw size={13}/> Reset
        </Btn>
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <DataTable
          columns={cols}
          data={filtered}
          actions={() => (
            <>
              <button onClick={() => toast.success("Downloading policy PDF")}
                className="p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary text-primary" title="Download"><Download size={14}/></button>
              {isHrAdmin && (
                <button onClick={() => openEdit(p)}
                  className="p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary text-muted-foreground" title="Edit"><Pencil size={14}/></button>
              )}
            </>
          )}
        />
      </div>

      <Modal open={!!editing} onClose={closeModal} title={editing?.id ? "Edit Policy" : "Add Policy"} maxWidth="max-w-lg"
        footer={
          <>
            <Btn variant="secondary" size="sm" onClick={closeModal}>Cancel</Btn>
            <Btn variant="primary" size="sm" onClick={submitForm}>{editing?.id ? "Save Changes" : "Add Policy"}</Btn>
          </>
        }>
        <FormField label="Policy Name">
          <input value={form.policyName} onChange={e=>setForm(f=>({...f, policyName:e.target.value}))} className={inputCls}/>
          {errors.policyName && <span className="text-xs text-destructive">{errors.policyName}</span>}
        </FormField>
        <FormField label="Category">
          <select value={form.category} onChange={e=>setForm(f=>({...f, category:e.target.value}))} className={inputCls}>
            <option value="">Select category</option>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
          {errors.category && <span className="text-xs text-destructive">{errors.category}</span>}
        </FormField>
        <FormField label="Department">
          <select value={form.department} onChange={e=>setForm(f=>({...f, department:e.target.value}))} className={inputCls}>
            <option value="">Select department</option>
            <option value="All">All</option>
            {DEPTS.map(d=><option key={d}>{d}</option>)}
          </select>
          {errors.department && <span className="text-xs text-destructive">{errors.department}</span>}
        </FormField>
        <FormField label="Version">
          <input value={form.version} onChange={e=>setForm(f=>({...f, version:e.target.value}))} className={inputCls}/>
        </FormField>
        <FormField label="Effective Date">
          <input type="date" value={form.effectiveDate} onChange={e=>setForm(f=>({...f, effectiveDate:e.target.value}))} className={inputCls}/>
          {errors.effectiveDate && <span className="text-xs text-destructive">{errors.effectiveDate}</span>}
        </FormField>
        <FormField label="Status">
          <select value={form.status} onChange={e=>setForm(f=>({...f, status:e.target.value}))} className={inputCls}>
            <option>Active</option>
            <option>Archived</option>
          </select>
        </FormField>
      </Modal>
    </div>
  );
}
