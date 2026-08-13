import { useState, useMemo, useRef, useEffect } from "react";
import { Eye, Pencil, Trash2, Plus, RefreshCw, Layers, X, CheckCircle, User, Building2, Mail, Phone, MapPin, Calendar, Users, UsersRound, UploadCloud, IdCard, Network } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../shared/utils/cn";
import { DEPTS, LOCS } from "../../shared/mock/constants";
import { Modal, FormField, inputCls } from "../../shared/components/Modal";
import { Btn } from "../../shared/components/Btn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { useEmployeesQuery, useEmployeeMutations } from "./hooks/useEmployeesQuery";
import { useCurrentUser } from "./hooks/useEmployees";
import { useHasRole } from "../../shared/access/role.store";
import { validateEmployeeForm } from "./employees.validators";
import { DOC_TYPES } from "../documents/documents.mock";
import { validateBulkFile } from "../documents/documents.validators";
import { useDocumentMutations } from "../documents/hooks/useDocumentsQuery";
import { FamilyDetailsModal } from "./components/FamilyDetailsModal";
import { BulkImportEmployeesModal } from "./components/BulkImportEmployeesModal";
import { useGlobalSearchStore } from "../../shared/utils/globalSearch.store";
import OrgPage from "../org/OrgPage";
import "./employees.css";

const emptyEmpForm = { name:"", designation:"", department:DEPTS[0], email:"", mobile:"", manager:"", location:LOCS[0], status:"Active" };

export default function EmployeesPage() {
  const { data: employees } = useEmployeesQuery();
  const EMPLOYEE_STORE = useEmployeeMutations();
  const DOCUMENT_STORE = useDocumentMutations();
  const CURRENT_USER = useCurrentUser();
  const isHrAdmin = useHasRole("HR Admin");

  const [view, setView] = useState("details");
  const [deptFilter, setDeptFilter] = useState("");
  const [locFilter, setLocFilter] = useState("");
  const [viewEmp, setViewEmp] = useState(null);
  const [editEmp, setEditEmp] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteEmp, setDeleteEmp] = useState(null);
  const [form, setForm] = useState(emptyEmpForm);

  const [familyEmp, setFamilyEmp] = useState(null);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const [initialSearch, setInitialSearch] = useState("");
  useEffect(() => {
    const q = useGlobalSearchStore.getState().consumePending("employees");
    if (q) setInitialSearch(q);
  }, []);

  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkDocType, setBulkDocType] = useState(DOC_TYPES[0]);
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkDone, setBulkDone] = useState(false);
  const bulkFileInputRef = useRef(null);

  const onBulkFilesSelected = (files) => {
    if (!files || files.length === 0) return;
    const newRows = Array.from(files).map(f => {
      const error = validateBulkFile(f);
      return { file: f, employeeId: employees[0]?.id || CURRENT_USER.id, error };
    });
    setBulkRows(prev => [...prev, ...newRows]);
    if (bulkFileInputRef.current) bulkFileInputRef.current.value = "";
  };

  const updateBulkRowEmployee = (idx, employeeId) => {
    setBulkRows(prev => prev.map((r,i) => i===idx ? { ...r, employeeId } : r));
  };

  const removeBulkRow = (idx) => {
    setBulkRows(prev => prev.filter((_,i) => i!==idx));
  };

  const closeBulkUpload = () => {
    setShowBulkUpload(false);
    setBulkRows([]);
    setBulkDocType(DOC_TYPES[0]);
    setBulkUploading(false);
    setBulkProgress(0);
    setBulkDone(false);
  };

  const submitBulkUpload = () => {
    const validRows = bulkRows.filter(r => !r.error);
    if (validRows.length === 0) { toast.error("Please add at least one valid file"); return; }
    if (bulkRows.some(r => r.error)) { toast.error("Remove or fix files with errors before uploading"); return; }
    setBulkUploading(true);
    setBulkProgress(0);
  };

  useEffect(() => {
    if (!bulkUploading) return;
    const interval = setInterval(() => {
      setBulkProgress(p => {
        const next = Math.min(100, p + Math.floor(Math.random()*18) + 8);
        if (next >= 100) {
          clearInterval(interval);
          bulkRows.filter(r => !r.error).forEach((row, i) => {
            const emp = employees.find(e => e.id === row.employeeId) || CURRENT_USER;
            DOCUMENT_STORE.add({
              id: `DOC${Date.now()}_${i}`, employeeId: emp.id, employeeName: emp.name,
              docType: bulkDocType, fileName: row.file.name,
              uploadDate: new Date().toISOString().split("T")[0],
              size: `${(row.file.size/1024).toFixed(0)}KB`, status: "Available",
            });
          });
          setBulkUploading(false);
          setBulkDone(true);
          toast.success(`${bulkRows.filter(r=>!r.error).length} document(s) uploaded successfully`);
        }
        return next;
      });
    }, 250);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulkUploading]);

  const visibleEmployees = useMemo(() => isHrAdmin ? employees : employees.filter(e => e.id === CURRENT_USER.id), [employees, isHrAdmin, CURRENT_USER]);

  const filtered = useMemo(() => visibleEmployees.filter(e =>
    (!isHrAdmin || !deptFilter || e.department === deptFilter) &&
    (!isHrAdmin || !locFilter || e.location === locFilter)
  ), [visibleEmployees, isHrAdmin, deptFilter, locFilter]);

  const openAdd = () => { setForm(emptyEmpForm); setShowAdd(true); };
  const openEdit = (emp) => {
    setEditEmp(emp);
    setForm({ name:emp.name, designation:emp.designation, department:emp.department, email:emp.email, mobile:emp.mobile, manager:emp.manager, location:emp.location, status:emp.status });
  };

  const submitAdd = () => {
    const errors = validateEmployeeForm(form);
    if (Object.keys(errors).length) { toast.error(Object.values(errors)[0]); return; }
    const n = employees.length + 1;
    const emp = {
      id: `EMP${Date.now()}`, empCode: `AMS${1000+n}`,
      name: form.name, designation: form.designation, department: form.department,
      email: form.email || `${form.name.toLowerCase().replace(/\s+/g,".")}@company.com`,
      mobile: form.mobile, manager: form.manager, location: form.location, status: form.status,
      joinDate: new Date().toISOString().split("T")[0],
    };
    EMPLOYEE_STORE.add(emp);
    toast.success(`${emp.name} added`);
    setShowAdd(false);
  };

  const submitEdit = () => {
    if (!editEmp) return;
    const errors = validateEmployeeForm(form);
    if (Object.keys(errors).length) { toast.error(Object.values(errors)[0]); return; }
    EMPLOYEE_STORE.update(editEmp.id, form);
    toast.success(`${form.name} updated`);
    setEditEmp(null);
  };

  const confirmDelete = () => {
    if (!deleteEmp) return;
    EMPLOYEE_STORE.remove(deleteEmp.id);
    toast.success(`${deleteEmp.name} removed`);
    setDeleteEmp(null);
  };

  const cols = [
    { key:"empCode", label:"Emp ID", width:"90px" },
    { key:"name", label:"Employee Name", render: e => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0">
          {e.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
        </div>
        <span className="font-medium">{e.name}</span>
      </div>
    )},
    { key:"designation", label:"Designation" },
    { key:"department", label:"Department" },
    { key:"email", label:"Email", render: e => <span className="text-primary text-xs">{e.email}</span> },
    { key:"mobile", label:"Mobile" },
    { key:"manager", label:"Manager" },
    { key:"location", label:"Location" },
    { key:"status", label:"Status", render: e => <StatusBadge status={e.status}/> },
  ];

  return (
    <div className="employees-page flex flex-col gap-4">
      <div className={cn("flex flex-wrap gap-3 items-center", "animate-fade-in-up")} style={{ animationDelay: "0ms" }}>
        <h2 className="text-lg font-bold text-foreground mr-auto">Employee Directory</h2>
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          <button onClick={() => setView("details")}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors cursor-pointer border-none",
              view==="details" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
            <IdCard size={13}/> Employee Details
          </button>
          <button onClick={() => setView("orgchart")}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors cursor-pointer border-none",
              view==="orgchart" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
            <Network size={13}/> Organization Chart
          </button>
        </div>
        {view === "details" && isHrAdmin && (
          <Btn variant="secondary" size="sm" onClick={() => setShowBulkUpload(true)}>
            <Layers size={14}/> Bulk Upload Documents
          </Btn>
        )}
        {view === "details" && isHrAdmin && (
          <Btn variant="secondary" size="sm" onClick={() => setShowBulkImport(true)}>
            <UploadCloud size={14}/> Bulk Import Employees
          </Btn>
        )}
        {view === "details" && isHrAdmin && (
          <Btn variant="primary" size="sm" onClick={openAdd}>
            <Plus size={14}/> Add Employee
          </Btn>
        )}
      </div>

      {view === "orgchart" ? <OrgPage/> : <>

      {isHrAdmin && (
        <div className={cn("bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-end", "hover-lift", "animate-fade-in-up")} style={{ animationDelay: "60ms" }}>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Department</label>
            <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}
              className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring min-w-[150px]">
              <option value="">All Departments</option>
              {DEPTS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Location</label>
            <select value={locFilter} onChange={e=>setLocFilter(e.target.value)}
              className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring min-w-[130px]">
              <option value="">All Locations</option>
              {LOCS.map(l=><option key={l}>{l}</option>)}
            </select>
          </div>
          <Btn variant="ghost" size="sm" onClick={() => { setDeptFilter(""); setLocFilter(""); }}>
            <RefreshCw size={13}/> Reset
          </Btn>
        </div>
      )}

      <div className={cn("animate-fade-in-up")} style={{ animationDelay: "120ms" }}>
      <DataTable
        columns={cols}
        data={filtered}
        initialSearch={initialSearch}
        actions={(row) => (
          <>
            <button onClick={() => setViewEmp(row)}
              className="p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary text-primary" title="View">
              <Eye size={14}/>
            </button>
            {isHrAdmin && (
              <button onClick={() => openEdit(row)} className="p-1.5 rounded-md text-muted-foreground transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary" title="Edit">
                <Pencil size={14}/>
              </button>
            )}
            <button onClick={() => setFamilyEmp(row)} className="p-1.5 rounded-md text-muted-foreground transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary" title="Family Details & Mediclaim">
              <UsersRound size={14}/>
            </button>
            {isHrAdmin && (
            <button onClick={() => setDeleteEmp(row)} className="p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" title="Delete">
              <Trash2 size={14}/>
            </button>
            )}
          </>
        )}
      />
      </div>

      {viewEmp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewEmp(null)}>
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 px-6 border-b border-border">
              <h3 className="font-bold text-lg">Employee Details</h3>
              <button onClick={() => setViewEmp(null)} className="p-1 rounded-sm bg-transparent border-none cursor-pointer transition-colors hover:bg-muted"><X size={18}/></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {viewEmp.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                </div>
                <div>
                  <h4 className="text-lg font-bold">{viewEmp.name}</h4>
                  <p className="text-sm text-primary">{viewEmp.designation}</p>
                  <StatusBadge status={viewEmp.status}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label:"Employee Code", value:viewEmp.empCode, icon:User },
                  { label:"Department", value:viewEmp.department, icon:Building2 },
                  { label:"Email", value:viewEmp.email, icon:Mail },
                  { label:"Mobile", value:viewEmp.mobile, icon:Phone },
                  { label:"Location", value:viewEmp.location, icon:MapPin },
                  { label:"Manager", value:viewEmp.manager, icon:Users },
                  { label:"Join Date", value:viewEmp.joinDate, icon:Calendar },
                ].map(f=>(
                  <div key={f.label} className="flex items-start gap-2">
                    <f.icon size={14} className="text-muted-foreground mt-0.5 shrink-0"/>
                    <div>
                      <p className="text-xs text-muted-foreground">{f.label}</p>
                      <p className="font-medium text-foreground text-sm">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 p-4 px-6 border-t border-border">
              {isHrAdmin && (
                <Btn variant="primary" size="sm" onClick={() => { openEdit(viewEmp); setViewEmp(null); }}>
                  <Pencil size={13}/> Edit
                </Btn>
              )}
              <Btn variant="secondary" size="sm" onClick={() => setViewEmp(null)}>Close</Btn>
            </div>
          </div>
        </div>
      )}
      </>}

      <Modal open={showAdd || !!editEmp} onClose={() => { setShowAdd(false); setEditEmp(null); }}
        title={editEmp ? "Edit Employee" : "Add Employee"}
        footer={<>
          <Btn variant="primary" size="sm" onClick={editEmp ? submitEdit : submitAdd}>{editEmp ? "Save Changes" : "Add Employee"}</Btn>
          <Btn variant="secondary" size="sm" onClick={() => { setShowAdd(false); setEditEmp(null); }}>Cancel</Btn>
        </>}>
        <FormField label="Full Name">
          <input value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} className={inputCls}/>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Designation">
            <input value={form.designation} onChange={e=>setForm(f=>({...f, designation:e.target.value}))} className={inputCls}/>
          </FormField>
          <FormField label="Department">
            <select value={form.department} onChange={e=>setForm(f=>({...f, department:e.target.value}))} className={inputCls}>
              {DEPTS.map(d=><option key={d}>{d}</option>)}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Email">
            <input value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} className={inputCls}/>
          </FormField>
          <FormField label="Mobile">
            <input value={form.mobile} onChange={e=>setForm(f=>({...f, mobile:e.target.value}))} className={inputCls}/>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Manager">
            <input value={form.manager} onChange={e=>setForm(f=>({...f, manager:e.target.value}))} className={inputCls}/>
          </FormField>
          <FormField label="Location">
            <select value={form.location} onChange={e=>setForm(f=>({...f, location:e.target.value}))} className={inputCls}>
              {LOCS.map(l=><option key={l}>{l}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Status">
          <select value={form.status} onChange={e=>setForm(f=>({...f, status:e.target.value}))} className={inputCls}>
            {["Active","Inactive","On Leave"].map(s=><option key={s}>{s}</option>)}
          </select>
        </FormField>
      </Modal>

      <Modal open={!!deleteEmp} onClose={() => setDeleteEmp(null)} title="Delete Employee"
        footer={<>
          <Btn variant="danger" size="sm" onClick={confirmDelete}>Delete</Btn>
          <Btn variant="secondary" size="sm" onClick={() => setDeleteEmp(null)}>Cancel</Btn>
        </>}>
        <p className="text-sm">Are you sure you want to remove <strong>{deleteEmp?.name}</strong> from the directory? This cannot be undone.</p>
      </Modal>

      <Modal open={showBulkUpload} onClose={closeBulkUpload} title="Bulk Document Upload" maxWidth="max-w-lg"
        footer={bulkDone ? (
          <Btn variant="primary" size="sm" onClick={closeBulkUpload}>Done</Btn>
        ) : (
          <>
            <Btn variant="primary" size="sm" onClick={submitBulkUpload}>
              {bulkUploading ? "Uploading..." : `Upload All (${bulkRows.filter(r=>!r.error).length})`}
            </Btn>
            <Btn variant="secondary" size="sm" onClick={closeBulkUpload}>Cancel</Btn>
          </>
        )}>
        {bulkDone ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle size={40} className="text-green-600"/>
            <p className="text-sm font-medium text-foreground">Documents uploaded successfully</p>
          </div>
        ) : bulkUploading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <RefreshCw size={32} className="text-primary animate-spin"/>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-2 transition-all duration-200" style={{ width: `${bulkProgress}%` }}/>
            </div>
            <p className="text-xs text-muted-foreground">Uploading {bulkRows.filter(r=>!r.error).length} document(s)... {bulkProgress}%</p>
          </div>
        ) : (
          <>
            <FormField label="Document Type">
              <select value={bulkDocType} onChange={e=>setBulkDocType(e.target.value)} className={inputCls}>
                {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Select Files (any employee, PDF/DOC/DOCX/JPG/PNG, max 5MB each)">
              <input ref={bulkFileInputRef} type="file" multiple onChange={e => onBulkFilesSelected(e.target.files)} className={inputCls}/>
            </FormField>
            <div className="-mx-2 max-h-[240px] overflow-y-auto divide-y divide-border">
              {bulkRows.map((row, i) => (
                <div key={i} className="p-2 flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{row.file.name}</p>
                    {row.error && <p className="text-[11px] text-destructive">{row.error}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select value={row.employeeId} disabled={!!row.error} onChange={e => updateBulkRowEmployee(i, e.target.value)}
                      className="border border-border rounded-md py-1 px-2 text-xs bg-input-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                    <button onClick={() => removeBulkRow(i)} className="p-1.5 rounded-sm text-red-500 bg-transparent border-none cursor-pointer transition-colors hover:bg-red-50 dark:hover:bg-red-900/20" title="Remove">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              ))}
              {bulkRows.length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">Select a document type, then choose files for one or more employees.</p>
              )}
            </div>
          </>
        )}
      </Modal>

      <FamilyDetailsModal open={!!familyEmp} onClose={() => setFamilyEmp(null)} employee={familyEmp} />
      <BulkImportEmployeesModal
        open={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        employees={employees}
        onImport={{ add: EMPLOYEE_STORE.add, update: EMPLOYEE_STORE.update }}
      />
    </div>
  );
}
