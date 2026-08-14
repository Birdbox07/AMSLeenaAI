import { useState, useMemo } from "react";
import { Stethoscope, CalendarCheck2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../shared/utils/cn";
import { Btn } from "../../shared/components/Btn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { FormField, inputCls } from "../../shared/components/Modal";
import { useCurrentUser } from "../employees/hooks/useEmployees";
import { useDoctorQuery, useDoctorMutations } from "./hooks/useDoctorQuery";
import { validateAppointmentForm } from "./doctor.validators";
import {
  TIME_SLOTS, upcomingClinicDates, minutesToLabel, deriveAge, deriveGender,
} from "./doctor.mock";
import "./doctor.css";

const emptyForm = { date: "", start: "" };

export default function DoctorPage() {
  const CURRENT_USER = useCurrentUser();
  const { data: appointments } = useDoctorQuery();
  const { add, cancel } = useDoctorMutations();

  const [form, setForm] = useState(emptyForm);
  const clinicDates = useMemo(() => upcomingClinicDates(4), []);
  const todayStr = new Date().toISOString().split("T")[0];

  const age = useMemo(() => deriveAge(CURRENT_USER.id), [CURRENT_USER.id]);
  const gender = useMemo(() => deriveGender(CURRENT_USER.id), [CURRENT_USER.id]);

  const bookedStarts = useMemo(() =>
    new Set(appointments.filter(a => a.date === form.date && a.status === "Scheduled").map(a => a.start)),
    [appointments, form.date]
  );
  const availableSlots = useMemo(() => TIME_SLOTS.filter(s => !bookedStarts.has(s.start)), [bookedStarts]);
  const selectedSlot = availableSlots.find(s => s.start === Number(form.start));

  const myAppointments = useMemo(() =>
    appointments
      .filter(a => a.employeeId === CURRENT_USER.id)
      .sort((a, b) => b.date.localeCompare(a.date) || b.start - a.start),
    [appointments, CURRENT_USER.id]
  );

  const submit = () => {
    const errors = validateAppointmentForm(form);
    if (Object.keys(errors).length) { toast.error(Object.values(errors)[0]); return; }
    const slot = TIME_SLOTS.find(s => s.start === Number(form.start));
    add({
      id: `DOC${Date.now()}`,
      employeeId: CURRENT_USER.id, employeeName: CURRENT_USER.name, employeeNumber: CURRENT_USER.empCode,
      age, department: CURRENT_USER.department, gender,
      date: form.date, start: slot.start, end: slot.end,
      status: "Scheduled",
    });
    toast.success(`Appointment booked for ${form.date} at ${slot.label}`);
    setForm(emptyForm);
  };

  const handleCancel = (appt) => {
    cancel(appt.id);
    toast.success("Appointment cancelled");
  };

  const cols = [
    { key:"date", label:"Date" },
    { key:"start", label:"Start Time", render: a => minutesToLabel(a.start) },
    { key:"end", label:"End Time", render: a => minutesToLabel(a.end) },
    { key:"status", label:"Status", render: a => <StatusBadge status={a.status}/> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <h2 className="text-lg font-bold text-foreground">Doctor Appointment</h2>
      </div>

      <div className={cn("bg-card rounded-lg border border-border shadow-sm p-6 max-w-2xl animate-fade-in-up", "hover-lift")} style={{ animationDelay: "60ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
            <Stethoscope size={16}/>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Book Doctor Appointment</h3>
            <p className="text-xs text-muted-foreground">Clinic runs every Friday, 2:30 PM – 5:30 PM.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <FormField label="Employee Number">
            <input value={CURRENT_USER.empCode} disabled className={cn(inputCls, "opacity-70")}/>
          </FormField>
          <FormField label="Age">
            <input value={age} disabled className={cn(inputCls, "opacity-70")}/>
          </FormField>
          <FormField label="Department">
            <input value={CURRENT_USER.department} disabled className={cn(inputCls, "opacity-70")}/>
          </FormField>
          <FormField label="Gender">
            <input value={gender} disabled className={cn(inputCls, "opacity-70")}/>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField label="Booking Date">
            <select value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value, start:""}))} className={inputCls}>
              <option value="">-Select-</option>
              {clinicDates.map(d => <option key={d} value={d}>{new Date(`${d}T00:00:00`).toLocaleDateString("en-GB")}</option>)}
            </select>
          </FormField>
          <FormField label="Available Slots">
            <select value={form.start} onChange={e=>setForm(f=>({...f, start:e.target.value}))} className={inputCls} disabled={!form.date}>
              <option value="">Select Start Time</option>
              {availableSlots.map(s => <option key={s.start} value={s.start}>{s.label}</option>)}
            </select>
          </FormField>
          <FormField label="End Time">
            <input value={selectedSlot ? minutesToLabel(selectedSlot.end) : ""} disabled className={cn(inputCls, "opacity-70")}/>
          </FormField>
        </div>

        <Btn variant="primary" size="sm" onClick={submit} className="mt-2">
          <CalendarCheck2 size={14}/> Book
        </Btn>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <DataTable
          title="My Appointments"
          columns={cols} data={myAppointments}
          actions={(a) => (a.status === "Scheduled" && a.date >= todayStr) ? (
            <button onClick={() => handleCancel(a)} className="p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary text-destructive" title="Cancel">
              <X size={14}/>
            </button>
          ) : null}
        />
      </div>
    </div>
  );
}
