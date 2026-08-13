import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Modal, FormField, inputCls } from "../../../shared/components/Modal";
import { Btn } from "../../../shared/components/Btn";
import { useFamilyDetails, useFamilyStoreActions } from "../hooks/useFamilyDetails";
import { validateFamilyForm } from "../family.validators";

const emptyChild = () => ({ name: "", dob: "", gender: "Male", insured: false });

function toForm(record) {
  const children = Array.from({ length: 4 }, (_, i) => record?.children?.[i] || emptyChild());
  return {
    fatherName: record?.fatherName || "",
    fatherDob: record?.fatherDob || "",
    motherName: record?.motherName || "",
    motherDob: record?.motherDob || "",
    maritalStatus: record?.maritalStatus || "Single",
    spouseName: record?.spouseName || "",
    spouseDob: record?.spouseDob || "",
    spouseGender: record?.spouseGender || "Male",
    spouseInsured: record?.spouseInsured || false,
    selfInsured: record?.selfInsured || false,
    children,
  };
}

export function FamilyDetailsModal({ open, onClose, employee }) {
  const record = useFamilyDetails(employee?.id);
  const { add, update } = useFamilyStoreActions();
  const [form, setForm] = useState(toForm(null));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) { setForm(toForm(record)); setErrors({}); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employee?.id]);

  const setChild = (idx, patch) => {
    setForm(f => ({
      ...f,
      children: f.children.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  };

  const submit = () => {
    const errs = validateFamilyForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) { toast.error("Please fix the highlighted fields"); return; }

    const trimmedChildren = form.children.filter(c => c.name && c.name.trim());
    const payload = { ...form, children: trimmedChildren, employeeId: employee.id };
    if (record) {
      update(record.id, payload);
      toast.success("Family details updated");
    } else {
      add({ id: `FAM${Date.now()}`, ...payload });
      toast.success("Family details saved");
    }
    onClose();
  };

  if (!employee) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Family Details & Mediclaim — ${employee.name}`} maxWidth="max-w-lg"
      footer={<>
        <Btn variant="primary" size="sm" onClick={submit}>Save</Btn>
        <Btn variant="secondary" size="sm" onClick={onClose}>Cancel</Btn>
      </>}>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={form.selfInsured} onChange={e => setForm(f => ({ ...f, selfInsured: e.target.checked }))} />
        {employee.name} (Self) covered under Mediclaim
      </label>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Father's Name">
          <input value={form.fatherName} onChange={e => setForm(f => ({ ...f, fatherName: e.target.value }))} className={inputCls} />
        </FormField>
        <FormField label="Father's Date of Birth">
          <input type="date" value={form.fatherDob} onChange={e => setForm(f => ({ ...f, fatherDob: e.target.value }))} className={inputCls} />
          {errors.fatherDob && <span className="text-[11px] text-destructive">{errors.fatherDob}</span>}
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Mother's Name">
          <input value={form.motherName} onChange={e => setForm(f => ({ ...f, motherName: e.target.value }))} className={inputCls} />
        </FormField>
        <FormField label="Mother's Date of Birth">
          <input type="date" value={form.motherDob} onChange={e => setForm(f => ({ ...f, motherDob: e.target.value }))} className={inputCls} />
          {errors.motherDob && <span className="text-[11px] text-destructive">{errors.motherDob}</span>}
        </FormField>
      </div>

      <FormField label="Marital Status">
        <select value={form.maritalStatus} onChange={e => setForm(f => ({ ...f, maritalStatus: e.target.value }))} className={inputCls}>
          <option>Single</option>
          <option>Married</option>
        </select>
      </FormField>

      {form.maritalStatus === "Married" && (
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Spouse Name">
            <input value={form.spouseName} onChange={e => setForm(f => ({ ...f, spouseName: e.target.value }))} className={inputCls} />
            {errors.spouseName && <span className="text-[11px] text-destructive">{errors.spouseName}</span>}
          </FormField>
          <FormField label="Spouse DOB">
            <input type="date" value={form.spouseDob} onChange={e => setForm(f => ({ ...f, spouseDob: e.target.value }))} className={inputCls} />
            {errors.spouseDob && <span className="text-[11px] text-destructive">{errors.spouseDob}</span>}
          </FormField>
          <FormField label="Spouse Gender">
            <select value={form.spouseGender} onChange={e => setForm(f => ({ ...f, spouseGender: e.target.value }))} className={inputCls}>
              <option>Male</option>
              <option>Female</option>
            </select>
          </FormField>
        </div>
      )}

      {form.maritalStatus === "Married" && (
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={form.spouseInsured} onChange={e => setForm(f => ({ ...f, spouseInsured: e.target.checked }))} />
          Spouse covered under Mediclaim
        </label>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Children (optional, up to 4)</p>
        {form.children.map((c, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 items-end">
            <FormField label={`Child ${i + 1} Name`}>
              <input value={c.name} onChange={e => setChild(i, { name: e.target.value })} className={inputCls} />
            </FormField>
            <FormField label="DOB">
              <input type="date" value={c.dob} onChange={e => setChild(i, { dob: e.target.value })} className={inputCls} />
              {errors[`child${i}Dob`] && <span className="text-[11px] text-destructive">{errors[`child${i}Dob`]}</span>}
            </FormField>
            <FormField label="Gender">
              <select value={c.gender} onChange={e => setChild(i, { gender: e.target.value })} className={inputCls}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </FormField>
            <label className="flex items-center gap-2 text-xs font-medium col-span-3">
              <input type="checkbox" checked={!!c.insured} onChange={e => setChild(i, { insured: e.target.checked })} />
              Covered under Mediclaim
            </label>
          </div>
        ))}
      </div>
    </Modal>
  );
}
