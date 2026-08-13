import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { FormField, inputCls } from "../../../shared/components/Modal";
import { Btn } from "../../../shared/components/Btn";
import { cn } from "../../../shared/utils/cn";
import { NPS_OPTIONS, FUND_MANAGERS, CURRENT_FY } from "../taxdeclaration.mock";
import { validateStep, validateDeclaration, computeSection80CTotal, computeDeductionsTotal, computeSummary, SECTION_80C_FIELDS } from "../taxdeclaration.validators";
import DeclarationSummary from "./DeclarationSummary";

const STEPS = [
  { id: 1, label: "Personal Details" },
  { id: 2, label: "Tax Regime" },
  { id: 3, label: "NPS Details" },
  { id: 4, label: "Tax Deductions" },
  { id: 5, label: "Review & Submit" },
];

const emptyForm = (CURRENT_USER) => ({
  employeeId: CURRENT_USER.id,
  employeeName: CURRENT_USER.name,
  financialYear: CURRENT_FY,
  regime: "",
  pan: "",
  npsEnrolled: null,
  npsExistingSubscriber: null,
  npsType: "",
  npsContributionPct: "",
  npsInvestmentOption: "",
  npsPran: "",
  npsFundManager: "",
  npsPersonalEmail: "",
  monthlyRent: "",
  landlordPan: "",
  landlordName: "",
  houseAddress: "",
  ltaOpted: false,
  ltaPct: "",
  housingLoanInterest: "",
  otherDeductions: "",
  otherDeductionsLabel: "",
  section80C: SECTION_80C_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {}),
  termsAccepted: false,
});

function StepHeader({ step }) {
  return (
    <div className="flex items-center mb-2">
      {STEPS.map((s, idx) => {
        const state = s.id < step ? "done" : s.id === step ? "active" : "pending";
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={cn(
                "w-7 h-7 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0",
                (state === "active" || state === "done") ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
              )}>
                {state === "done" ? <Check size={14} /> : s.id}
              </div>
              <span className={cn(
                "text-[10px] font-medium text-center max-w-[70px] leading-tight",
                state === "active" ? "text-foreground" : "text-muted-foreground"
              )}>{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn("flex-1 border-t mx-1 mb-4", s.id < step ? "border-primary" : "border-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DeclarationForm({ currentUser, existing, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => existing ? { ...emptyForm(currentUser), ...existing, section80C: { ...emptyForm(currentUser).section80C, ...(existing.section80C || {}) } } : emptyForm(currentUser));
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  // Reset form whenever the record being edited changes (e.g. Edit clicked on a different declaration)
  useEffect(() => {
    const base = existing ? { ...emptyForm(currentUser), ...existing, section80C: { ...emptyForm(currentUser).section80C, ...(existing.section80C || {}) } } : emptyForm(currentUser);
    setForm(base);
    setErrors({});
    setStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id, currentUser]);

  const set = (patch) => setForm(f => ({ ...f, ...patch }));
  const setSection80C = (key, value) => setForm(f => ({ ...f, section80C: { ...f.section80C, [key]: value } }));

  const rentAnnual = (Number(form.monthlyRent) || 0) * 12;
  const rentRequiresLandlord = form.regime === "Old" && rentAnnual > 100000;
  const total80C = computeSection80CTotal(form);
  const totalDeductions = computeDeductionsTotal(form);
  const summary = computeSummary(form);

  const goNext = () => {
    const errs = validateStep(step, form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix the highlighted errors before continuing");
      return;
    }
    setStep(s => Math.min(5, s + 1));
  };

  const goBack = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = () => {
    const errs = validateDeclaration(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix the highlighted errors before submitting");
      // Jump back to the first step that has an error
      const stepWithError = [1, 2, 3, 4, 5].find(s => Object.keys(validateStep(s, form)).length > 0);
      if (stepWithError) setStep(stepWithError);
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-5 flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
      <h3 className="text-sm font-bold text-foreground">
        {existing ? "Edit Income Tax Declaration" : "Income Tax Investment Declaration"}
      </h3>

      <StepHeader step={step} />

      {step === 1 && (
        <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <h4 className="text-sm font-bold text-foreground">Personal Details</h4>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Employee Name">
              <input value={currentUser.name} disabled className={cn(inputCls, "bg-muted text-muted-foreground")} />
            </FormField>
            <FormField label="Employee Code">
              <input value={currentUser.empCode || ""} disabled className={cn(inputCls, "bg-muted text-muted-foreground")} />
            </FormField>
          </div>
          <FormField label="PAN Number">
            <input value={form.pan} onChange={e => set({ pan: e.target.value.toUpperCase() })} placeholder="ABCDE1234F" maxLength={10}
              className={cn(inputCls, errors.pan && "border-destructive")} />
            {errors.pan && <p className="text-xs text-destructive mt-1">{errors.pan}</p>}
          </FormField>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <h4 className="text-sm font-bold text-foreground">Tax Regime Selection</h4>
          <div className="flex gap-4">
            {["Old", "New"].map(r => (
              <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="regime" checked={form.regime === r} onChange={() => set({ regime: r })} />
                {r} Regime
              </label>
            ))}
          </div>
          {errors.regime && <p className="text-xs text-destructive mt-1">{errors.regime}</p>}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <h4 className="text-sm font-bold text-foreground">NPS (National Pension Scheme)</h4>
          <FormField label="Are you enrolled in NPS?">
            <div className="flex gap-4">
              {[["Yes", true], ["No", false]].map(([label, val]) => (
                <label key={label} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="npsEnrolled" checked={form.npsEnrolled === val} onChange={() => set({ npsEnrolled: val })} />
                  {label}
                </label>
              ))}
            </div>
            {errors.npsEnrolled && <p className="text-xs text-destructive mt-1">{errors.npsEnrolled}</p>}
          </FormField>

          {form.npsEnrolled && (
            <div className="flex flex-col gap-3 mt-1 pl-3 border-l-2 border-border">
              <FormField label="Existing NPS subscriber?">
                <div className="flex gap-4">
                  {[["Yes", true], ["No", false]].map(([label, val]) => (
                    <label key={label} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="npsExisting" checked={form.npsExistingSubscriber === val} onChange={() => set({ npsExistingSubscriber: val })} />
                      {label}
                    </label>
                  ))}
                </div>
                {errors.npsExistingSubscriber && <p className="text-xs text-destructive mt-1">{errors.npsExistingSubscriber}</p>}
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="% of Basic Contribution">
                  <input type="number" min="0" max="100" value={form.npsContributionPct}
                    onChange={e => set({ npsContributionPct: e.target.value })}
                    className={cn(inputCls, errors.npsContributionPct && "border-destructive")} />
                  {errors.npsContributionPct && <p className="text-xs text-destructive mt-1">{errors.npsContributionPct}</p>}
                </FormField>
                <FormField label="NPS Type">
                  <select value={form.npsType} onChange={e => set({ npsType: e.target.value })} className={inputCls}>
                    <option value="">Select...</option>
                    <option value="Active">Active</option>
                    <option value="Auto">Auto</option>
                  </select>
                </FormField>
              </div>

              {form.npsType === "Active" && (
                <FormField label="Investment Option">
                  <select value={form.npsInvestmentOption} onChange={e => set({ npsInvestmentOption: e.target.value })}
                    className={cn(inputCls, errors.npsInvestmentOption && "border-destructive")}>
                    <option value="">Select...</option>
                    {NPS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  {errors.npsInvestmentOption && <p className="text-xs text-destructive mt-1">{errors.npsInvestmentOption}</p>}
                </FormField>
              )}

              {form.npsExistingSubscriber === false && (
                <>
                  <FormField label="PRAN (12 digits)">
                    <input value={form.npsPran} onChange={e => set({ npsPran: e.target.value.replace(/\D/g, "").slice(0, 12) })}
                      className={cn(inputCls, errors.npsPran && "border-destructive")} />
                    {errors.npsPran && <p className="text-xs text-destructive mt-1">{errors.npsPran}</p>}
                  </FormField>
                  <FormField label="Fund Manager">
                    <select value={form.npsFundManager} onChange={e => set({ npsFundManager: e.target.value })}
                      className={cn(inputCls, errors.npsFundManager && "border-destructive")}>
                      <option value="">Select...</option>
                      {FUND_MANAGERS.map(fm => <option key={fm}>{fm}</option>)}
                    </select>
                    {errors.npsFundManager && <p className="text-xs text-destructive mt-1">{errors.npsFundManager}</p>}
                  </FormField>
                  <FormField label="Personal Email (non-company domain)">
                    <input type="email" value={form.npsPersonalEmail} onChange={e => set({ npsPersonalEmail: e.target.value })}
                      placeholder="you@gmail.com" className={cn(inputCls, errors.npsPersonalEmail && "border-destructive")} />
                    {errors.npsPersonalEmail && <p className="text-xs text-destructive mt-1">{errors.npsPersonalEmail}</p>}
                  </FormField>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <h4 className="text-sm font-bold text-foreground">Tax Deductions</h4>
          {form.regime !== "Old" ? (
            <p className="text-sm text-muted-foreground">Deductions are only applicable under the Old Regime. You selected the New Regime, so this step can be skipped.</p>
          ) : (
            <>
              <div className="border-b border-border pb-4">
                <h5 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wide">HRA</h5>
                <FormField label="Monthly Rent Paid">
                  <input type="number" min="0" value={form.monthlyRent} onChange={e => set({ monthlyRent: e.target.value })} className={inputCls} />
                </FormField>
                {rentRequiresLandlord && (
                  <div className="flex flex-col gap-3 pl-3 border-l-2 border-border mt-3">
                    <p className="text-xs text-muted-foreground">Annual rent (₹{rentAnnual.toLocaleString("en-IN")}) exceeds ₹1,00,000 — landlord details are mandatory.</p>
                    <FormField label="Landlord PAN">
                      <input value={form.landlordPan} onChange={e => set({ landlordPan: e.target.value.toUpperCase() })} maxLength={10}
                        className={cn(inputCls, errors.landlordPan && "border-destructive")} />
                      {errors.landlordPan && <p className="text-xs text-destructive mt-1">{errors.landlordPan}</p>}
                    </FormField>
                    <FormField label="Landlord Name">
                      <input value={form.landlordName} onChange={e => set({ landlordName: e.target.value })}
                        className={cn(inputCls, errors.landlordName && "border-destructive")} />
                      {errors.landlordName && <p className="text-xs text-destructive mt-1">{errors.landlordName}</p>}
                    </FormField>
                    <FormField label="House Address">
                      <textarea rows={2} value={form.houseAddress} onChange={e => set({ houseAddress: e.target.value })}
                        className={cn(inputCls, "resize-none", errors.houseAddress && "border-destructive")} />
                      {errors.houseAddress && <p className="text-xs text-destructive mt-1">{errors.houseAddress}</p>}
                    </FormField>
                  </div>
                )}
              </div>

              <div className="border-b border-border pb-4">
                <h5 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wide">LTA</h5>
                <FormField label="Opt in for LTA (Leave Travel Allowance)?">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.ltaOpted} onChange={e => set({ ltaOpted: e.target.checked })} />
                    Yes, I want to claim LTA
                  </label>
                </FormField>
                {form.ltaOpted && (
                  <FormField label="% of Basic for LTA">
                    <input type="number" min="0" max="100" value={form.ltaPct} onChange={e => set({ ltaPct: e.target.value })}
                      className={cn(inputCls, errors.ltaPct && "border-destructive")} />
                    {errors.ltaPct && <p className="text-xs text-destructive mt-1">{errors.ltaPct}</p>}
                  </FormField>
                )}
              </div>

              <div className="border-b border-border pb-4">
                <h5 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wide">Housing Loan Interest</h5>
                <FormField label="Interest Paid on Housing Loan (annual)">
                  <input type="number" min="0" value={form.housingLoanInterest} onChange={e => set({ housingLoanInterest: e.target.value })}
                    className={cn(inputCls, errors.housingLoanInterest && "border-destructive")} />
                  {errors.housingLoanInterest && <p className="text-xs text-destructive mt-1">{errors.housingLoanInterest}</p>}
                </FormField>
              </div>

              <div className="border-b border-border pb-4">
                <h5 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wide">Section 80C</h5>
                <div className="grid grid-cols-2 gap-3">
                  {SECTION_80C_FIELDS.map(f => (
                    <FormField key={f.key} label={f.label}>
                      <input type="number" min="0" value={form.section80C[f.key]}
                        onChange={e => setSection80C(f.key, e.target.value)} className={inputCls} />
                    </FormField>
                  ))}
                </div>
                <p className="text-sm font-semibold text-foreground mt-3">
                  Total 80C: <span className="text-primary">₹{total80C.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-muted-foreground font-normal ml-2">(conceptual ₹1,50,000 cap — not enforced)</span>
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wide">Additional Deductions</h5>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Amount">
                    <input type="number" min="0" value={form.otherDeductions} onChange={e => set({ otherDeductions: e.target.value })} className={inputCls} />
                  </FormField>
                  <FormField label="Describe">
                    <input value={form.otherDeductionsLabel} onChange={e => set({ otherDeductionsLabel: e.target.value })}
                      placeholder="e.g. Medical Insurance Premium (80D)"
                      className={cn(inputCls, errors.otherDeductionsLabel && "border-destructive")} />
                    {errors.otherDeductionsLabel && <p className="text-xs text-destructive mt-1">{errors.otherDeductionsLabel}</p>}
                  </FormField>
                </div>
                <p className="text-sm font-semibold text-foreground mt-3">
                  Total Deductions (80C + Housing Loan + Other): <span className="text-primary">₹{totalDeductions.toLocaleString("en-IN")}</span>
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <h4 className="text-sm font-bold text-foreground">Review &amp; Submit</h4>
          <DeclarationSummary declaration={{ ...form, status: "Draft" }} onEdit={() => setStep(1)} hideEditButton />
          <div className="border-t border-border pt-4">
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.termsAccepted} onChange={e => set({ termsAccepted: e.target.checked })} className="mt-0.5" />
              I confirm the above declarations are true and I accept the Terms &amp; Conditions.
            </label>
            {errors.termsAccepted && <p className="text-xs text-destructive mt-1">{errors.termsAccepted}</p>}
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-between border-t border-border pt-4">
        <div>
          {existing && <Btn variant="secondary" size="sm" onClick={onCancel}>Cancel</Btn>}
        </div>
        <div className="flex gap-2">
          {step > 1 && <Btn variant="secondary" size="sm" onClick={goBack}>Back</Btn>}
          {step < 5 && <Btn variant="primary" size="sm" onClick={goNext}>Next</Btn>}
          {step === 5 && <Btn variant="primary" size="sm" onClick={handleSubmit}>Submit Declaration</Btn>}
        </div>
      </div>
    </div>
  );
}
