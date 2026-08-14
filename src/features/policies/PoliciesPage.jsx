import { useState, useMemo } from "react";
import { Plus, Download, Pencil, UploadCloud, Folder, ChevronUp, ChevronDown, ChevronLeft, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../shared/utils/cn";
import { downloadTextFile } from "../../shared/utils/downloadTextFile";
import { Btn } from "../../shared/components/Btn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { Modal, FormField, inputCls } from "../../shared/components/Modal";
import { SearchableSelect } from "../../shared/components/SearchableSelect";
import { usePoliciesQuery, usePolicyMutations } from "./hooks/usePoliciesQuery";
import { validatePolicyForm } from "./policies.validators";
import { POLICY_TYPES, POLICY_FOLDERS_BY_TYPE } from "./policies.mock";
import { useHasRole } from "../../shared/access/role.store";
import "./policies.css";

const emptyForm = { policyName: "", policyType: "HR Policies", folder: "", department: "All", version: "v1.0", effectiveDate: "", status: "Active", fileName: "" };

export default function PoliciesPage() {
  const { data: POLICIES } = usePoliciesQuery();
  const { add, update } = usePolicyMutations();
  const isHrAdmin = useHasRole("HR Admin");

  const [policyType, setPolicyType] = useState("HR Policies");
  const [viewMode, setViewMode] = useState("folder");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [foldersOpen, setFoldersOpen] = useState(true);

  const [editing, setEditing] = useState(null); // null = closed, {} = add, {...policy} = edit
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const scoped = useMemo(() => POLICIES.filter(p => p.policyType === policyType), [POLICIES, policyType]);

  const folderNames = useMemo(() => Object.keys(POLICY_FOLDERS_BY_TYPE[policyType] || {}), [policyType]);
  const folderCounts = useMemo(() => {
    const counts = {};
    folderNames.forEach(f => { counts[f] = 0; });
    scoped.forEach(p => { counts[p.folder] = (counts[p.folder] || 0) + 1; });
    return counts;
  }, [scoped, folderNames]);

  const switchPolicyType = (pt) => { setPolicyType(pt); setSelectedFolder(null); };
  const switchViewMode = (v) => { setViewMode(v); setSelectedFolder(null); };

  const folderArticles = useMemo(() => selectedFolder ? scoped.filter(p => p.folder === selectedFolder) : [], [scoped, selectedFolder]);

  const openAdd = () => { setEditing({}); setForm({ ...emptyForm, policyType, folder: selectedFolder || "" }); setErrors({}); };
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

  const downloadPolicy = (p) => {
    const fileName = p.fileName || `${p.policyName.replace(/\s+/g,"_")}.txt`;
    downloadTextFile(fileName, `${p.policyName}\nType: ${p.policyType}\nFolder: ${p.folder}\nDepartment: ${p.department}\nVersion: ${p.version}\nEffective Date: ${p.effectiveDate}\nStatus: ${p.status}`);
    toast.success(`Downloading ${fileName}`);
  };

  const folderCols = [
    { key:"policyName", label:"Policy Name", render: p => <span className="font-medium">{p.policyName}</span> },
    { key:"folder", label:"Folder" },
    { key:"department", label:"Department" },
    { key:"version", label:"Version" },
    { key:"effectiveDate", label:"Effective Date" },
    { key:"status", label:"Status", render: p => <StatusBadge status={p.status}/> },
  ];

  const tableCols = [
    { key:"folder", label:"Policy Category" },
    { key:"policyName", label:"Policy Name", render: p => <span className="font-medium">{p.policyName}</span> },
    { key:"effectiveDate", label:"Effective Date" },
  ];

  const actions = (p) => (
    <>
      <button onClick={() => downloadPolicy(p)}
        className="p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary text-primary" title="Download"><Download size={14}/></button>
      {isHrAdmin && (
        <button onClick={() => openEdit(p)}
          className="p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary text-muted-foreground" title="Edit"><Pencil size={14}/></button>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <h2 className="text-lg font-bold text-foreground">Policies</h2>
        {isHrAdmin && (
          <Btn variant="primary" size="sm" onClick={openAdd}>
            <Plus size={14}/> Add Policy
          </Btn>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: "30ms" }}>
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          {POLICY_TYPES.map(pt => (
            <button key={pt} onClick={() => switchPolicyType(pt)}
              className={cn("py-1.5 px-4 text-sm font-medium rounded-md transition-colors border-none cursor-pointer",
                policyType===pt ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
              {pt}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          <button onClick={() => switchViewMode("folder")}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors border-none cursor-pointer",
              viewMode==="folder" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
            <LayoutGrid size={13}/> Folder View
          </button>
          <button onClick={() => switchViewMode("table")}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors border-none cursor-pointer",
              viewMode==="table" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
            <List size={13}/> Table View
          </button>
        </div>
      </div>

      {viewMode === "folder" ? (
        selectedFolder ? (
          <div className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedFolder(null)}
                className="flex items-center gap-1 text-sm text-primary font-medium bg-transparent border-none cursor-pointer hover:underline">
                <ChevronLeft size={15}/> Back to Folders
              </button>
              <span className="text-sm text-muted-foreground">/ {policyType} / <span className="text-foreground font-medium">{selectedFolder}</span></span>
            </div>
            <DataTable columns={folderCols} data={folderArticles} hideExport actions={actions}/>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
            <button onClick={() => setFoldersOpen(v=>!v)}
              className="flex items-center gap-1.5 text-sm font-semibold text-foreground bg-transparent border-none cursor-pointer w-fit">
              {foldersOpen ? <ChevronUp size={15}/> : <ChevronDown size={15}/>} Folders
            </button>
            {foldersOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folderNames.map((f, i) => (
                  <button key={f} onClick={() => setSelectedFolder(f)}
                    style={{ animationDelay: `${i*30}ms` }}
                    className={cn("text-left bg-card rounded-lg border border-border shadow-sm p-4 flex items-center gap-3 transition-all duration-200 hover:shadow-md hover:border-primary hover:-translate-y-0.5 cursor-pointer", "hover-lift", "animate-fade-in-up")}>
                    <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Folder size={20}/>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{f}</p>
                      <p className="text-xs text-muted-foreground">{folderCounts[f] || 0} Article{folderCounts[f]===1?"":"s"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <DataTable columns={tableCols} data={scoped} hideExport actions={actions}/>
        </div>
      )}

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
        {isHrAdmin && (
          <FormField label="Policy Document Upload">
            <div className="flex items-center gap-2">
              <UploadCloud size={14} className="text-muted-foreground shrink-0"/>
              <input type="file" accept=".pdf,.doc,.docx"
                onChange={e => setForm(f => ({ ...f, fileName: e.target.files?.[0]?.name || f.fileName }))}
                className={inputCls}/>
            </div>
            {form.fileName && <span className="text-xs text-muted-foreground">Selected: {form.fileName}</span>}
          </FormField>
        )}
        <FormField label="Policy Type">
          <select value={form.policyType} onChange={e=>setForm(f=>({...f, policyType:e.target.value, folder:""}))} className={inputCls}>
            {POLICY_TYPES.map(pt=><option key={pt}>{pt}</option>)}
          </select>
          {errors.policyType && <span className="text-xs text-destructive">{errors.policyType}</span>}
        </FormField>
        <FormField label="Policy Category">
          <SearchableSelect value={form.folder} onChange={value=>setForm(f=>({...f, folder:value}))}
            options={Object.keys(POLICY_FOLDERS_BY_TYPE[form.policyType] || {})}
            placeholder="Select a category..."/>
          {errors.folder && <span className="text-xs text-destructive">{errors.folder}</span>}
        </FormField>
        <FormField label="Effective Date">
          <input type="date" value={form.effectiveDate} onChange={e=>setForm(f=>({...f, effectiveDate:e.target.value}))} className={inputCls}/>
          {errors.effectiveDate && <span className="text-xs text-destructive">{errors.effectiveDate}</span>}
        </FormField>
      </Modal>
    </div>
  );
}
