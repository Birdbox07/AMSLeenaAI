import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, LayoutGrid, List, Plus, Pencil, X, Phone, Mail, User as UserIcon, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../shared/utils/cn";
import { Modal, FormField, inputCls } from "../../shared/components/Modal";
import { SearchableSelect } from "../../shared/components/SearchableSelect";
import { Btn } from "../../shared/components/Btn";
import { useConferenceQuery, useConferenceMutations } from "./hooks/useConferenceQuery";
import { validateBookingForm } from "./conference.validators";
import {
  CONFERENCE_LOCATIONS, CONFERENCE_ROOMS_BY_LOCATION, MEAL_OPTIONS, TIME_SLOTS, minutesToLabel,
  SLOT_START_MIN, SLOT_END_MIN, SLOT_INCREMENT_MIN,
} from "./conference.mock";
import { useCurrentUser } from "../employees/hooks/useEmployees";
import "./conference.css";

function fmtDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isPastSlot(dateStr, slotStart) {
  const now = new Date();
  const todayStr = fmtDate(now);
  if (dateStr < todayStr) return true;
  if (dateStr === todayStr) return slotStart < now.getHours() * 60 + now.getMinutes();
  return false;
}

const emptyForm = { date: "", start: null, end: null, purpose: "", attendees: "", breakfast: "Not Required", tea: "Not Required", lunch: "Not Required" };

// Teams/Outlook-style continuous time grid: 1px per minute, events rendered
// as absolutely-positioned blocks spanning their real duration instead of
// one row per 15-minute slot.
const PX_PER_MIN = 1;
const GRID_HEIGHT = (SLOT_END_MIN - SLOT_START_MIN) * PX_PER_MIN;
const HOUR_MARKS = (() => {
  const marks = [];
  for (let m = SLOT_START_MIN; m <= SLOT_END_MIN; m += 60) marks.push(m);
  return marks;
})();
const HALF_HOUR_MARKS = HOUR_MARKS.slice(0, -1).map(m => m + 30);

export default function ConferencePage() {
  const { data: bookings } = useConferenceQuery();
  const { add, update, cancel } = useConferenceMutations();
  const CURRENT_USER = useCurrentUser();

  const [location, setLocation] = useState("");
  const [room, setRoom] = useState("");
  const [view, setView] = useState("calendar");
  const [weekOffset, setWeekOffset] = useState(0);
  const [tableDate, setTableDate] = useState(fmtDate(new Date()));

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const roomsForLocation = CONFERENCE_ROOMS_BY_LOCATION[location] || [];
  const hasSelection = !!location && !!room;

  const scopedBookings = useMemo(() =>
    hasSelection ? bookings.filter(b => b.location === location && b.room === room) : [],
    [bookings, location, room, hasSelection]
  );

  const findBooking = (dateStr, slotStart) =>
    scopedBookings.find(b => b.date === dateStr && slotStart >= b.start && slotStart < b.end);

  const isMyBooking = (b) => !!b && b.employeeId === CURRENT_USER.id;

  const weekDates = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    base.setDate(base.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const todayStr = fmtDate(new Date());
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine = nowMinutes >= SLOT_START_MIN && nowMinutes <= SLOT_END_MIN;
  const nowTop = (nowMinutes - SLOT_START_MIN) * PX_PER_MIN;

  const handleColumnClick = (e, dStr) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const minutesFromStart = Math.max(0, Math.floor(offsetY / PX_PER_MIN));
    const slotStart = Math.min(
      SLOT_START_MIN + Math.floor(minutesFromStart / SLOT_INCREMENT_MIN) * SLOT_INCREMENT_MIN,
      SLOT_END_MIN - SLOT_INCREMENT_MIN
    );
    if (isPastSlot(dStr, slotStart)) return;
    const existing = findBooking(dStr, slotStart);
    if (existing) { if (isMyBooking(existing)) openEditModal(existing); return; }
    openAddModal(dStr, slotStart, slotStart + SLOT_INCREMENT_MIN);
  };

  const changeLocation = (val) => {
    setLocation(val);
    setRoom("");
  };

  const openAddModal = (dateStr, start, end) => {
    setModalMode("add");
    setEditingId(null);
    setForm({ ...emptyForm, date: dateStr, start, end });
    setShowModal(true);
  };

  const openEditModal = (booking) => {
    setModalMode("edit");
    setEditingId(booking.id);
    setForm({
      date: booking.date, start: booking.start, end: booking.end,
      purpose: booking.purpose, attendees: booking.attendees,
      breakfast: booking.breakfast, tea: booking.tea, lunch: booking.lunch,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const submitModal = () => {
    const payload = { location, room, date: form.date, start: form.start, end: form.end, purpose: form.purpose, attendees: Number(form.attendees) };
    const errors = validateBookingForm(payload, scopedBookings, modalMode === "edit" ? editingId : null);
    if (Object.keys(errors).length) { toast.error(Object.values(errors)[0]); return; }

    if (modalMode === "add") {
      add({
        id: `BKG${Date.now()}`, location, room, date: form.date, start: form.start, end: form.end,
        employeeId: CURRENT_USER.id, employeeName: CURRENT_USER.name, contact: CURRENT_USER.mobile, email: CURRENT_USER.email,
        purpose: form.purpose.trim(), attendees: Number(form.attendees),
        breakfast: form.breakfast, tea: form.tea, lunch: form.lunch,
      });
      toast.success(`${room} booked for ${minutesToLabel(form.start)}–${minutesToLabel(form.end)}`);
    } else {
      update(editingId, {
        date: form.date, start: form.start, end: form.end,
        purpose: form.purpose.trim(), attendees: Number(form.attendees),
        breakfast: form.breakfast, tea: form.tea, lunch: form.lunch,
      });
      toast.success("Booking updated");
    }
    closeModal();
  };

  const cancelBookingFromModal = () => {
    if (!editingId) return;
    cancel(editingId);
    toast.success("Booking cancelled");
    closeModal();
  };

  return (
    <div className="conference-page flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <h2 className="text-lg font-bold text-foreground">Conference Room Booking</h2>
        <Btn variant="secondary" size="sm" onClick={() => toast.info("Refreshed")}>
          <RefreshCw size={13}/> Refresh
        </Btn>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 flex flex-wrap items-end gap-3 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <div className="flex flex-col gap-1 min-w-[220px]">
          <label className="text-xs font-semibold text-muted-foreground">Location</label>
          <SearchableSelect value={location} onChange={changeLocation} options={CONFERENCE_LOCATIONS} placeholder="Select location..."/>
        </div>
        <div className="flex flex-col gap-1 min-w-[280px]">
          <label className="text-xs font-semibold text-muted-foreground">Room</label>
          <SearchableSelect value={room} onChange={setRoom} options={roomsForLocation} disabled={!location}
            placeholder={location ? (roomsForLocation.length ? "Select room..." : "No rooms available") : "Select a location first"}/>
        </div>

        <div className="flex gap-1 bg-muted p-1 rounded-lg ml-auto">
          <button onClick={() => setView("calendar")}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors border-none cursor-pointer",
              view==="calendar" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
            <LayoutGrid size={13}/> Calendar
          </button>
          <button onClick={() => setView("table")}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors border-none cursor-pointer",
              view==="table" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
            <List size={13}/> Table
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap text-[11px] text-muted-foreground animate-fade-in-up" style={{ animationDelay: "90ms" }}>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-card border border-border"/>Available</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-red-100 border border-red-300 dark:bg-red-900/30 dark:border-red-800"/>Booked</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-yellow-100 border border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800"/>My Booking</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-muted border border-border"/>Past</span>
      </div>

      {view === "calendar" ? (
        <div className="bg-card rounded-lg border border-border shadow-sm animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center gap-2 p-3 flex-wrap">
            <button onClick={() => setWeekOffset(w => Math.max(0, w - 1))} disabled={weekOffset <= 0}
              className="flex items-center gap-1 py-1 px-2.5 text-xs font-medium border border-border rounded-md bg-card cursor-pointer transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft size={13}/> Prev
            </button>
            <button onClick={() => setWeekOffset(0)}
              className="py-1 px-2.5 text-xs font-medium border border-border rounded-md bg-card cursor-pointer transition-colors hover:bg-muted">
              Today
            </button>
            <button onClick={() => setWeekOffset(w => w + 1)}
              className="flex items-center gap-1 py-1 px-2.5 text-xs font-medium border border-border rounded-md bg-card cursor-pointer transition-colors hover:bg-muted">
              Next <ChevronRight size={13}/>
            </button>
            <span className="text-sm font-semibold text-foreground ml-1">{fmtDate(weekDates[0])} – {fmtDate(weekDates[6])}</span>
          </div>

          {!hasSelection ? (
            <p className="text-sm text-muted-foreground text-center py-16">Select a location and room to view the calendar</p>
          ) : (
            <div className="overflow-auto border-t border-border" style={{ maxHeight: 560 }}>
              <div className="grid select-none" style={{ gridTemplateColumns: `56px repeat(7, minmax(120px, 1fr))` }}>
                {/* Header row */}
                <div className="sticky top-0 left-0 z-20 bg-muted border-b border-r border-border"/>
                {weekDates.map((d, i) => {
                  const dStr = fmtDate(d);
                  const today = dStr === todayStr;
                  return (
                    <div key={i} className={cn("sticky top-0 z-10 py-2 px-1 text-center border-b border-border", today ? "bg-primary/10 text-primary" : "bg-muted text-foreground")}>
                      <span className="block text-xs font-semibold">{d.toLocaleDateString("en", { weekday: "short" })}</span>
                      <span className="block text-[10px] font-normal text-muted-foreground">{dStr.slice(5)}</span>
                    </div>
                  );
                })}

                {/* Time gutter — first/last labels are clamped so they don't get
                    clipped by the sticky header above or the grid's bottom edge */}
                <div className="relative border-r border-border" style={{ height: GRID_HEIGHT }}>
                  {HOUR_MARKS.map((m, i) => {
                    const isFirst = i === 0;
                    const isLast = i === HOUR_MARKS.length - 1;
                    return (
                      <span key={m}
                        className={cn(
                          "absolute right-1.5 text-[10px] font-medium text-foreground whitespace-nowrap",
                          isFirst ? "" : isLast ? "-translate-y-full" : "-translate-y-1/2"
                        )}
                        style={{ top: (m - SLOT_START_MIN) * PX_PER_MIN }}>
                        {minutesToLabel(m)}
                      </span>
                    );
                  })}
                </div>

                {/* Day columns */}
                {weekDates.map((d, dayIdx) => {
                  const dStr = fmtDate(d);
                  const dayIsPast = dStr < todayStr;
                  const dayBookings = scopedBookings.filter(b => b.date === dStr);
                  return (
                    <div key={dayIdx}
                      onClick={(e) => !dayIsPast && handleColumnClick(e, dStr)}
                      className={cn("relative border-r border-border", dayIsPast ? "bg-muted/40 cursor-not-allowed" : "cursor-pointer hover:bg-primary/5")}
                      style={{ height: GRID_HEIGHT }}
                    >
                      {HOUR_MARKS.map(m => (
                        <div key={m} className="absolute left-0 right-0 border-t border-border pointer-events-none" style={{ top: (m - SLOT_START_MIN) * PX_PER_MIN }}/>
                      ))}
                      {HALF_HOUR_MARKS.map(m => (
                        <div key={m} className="absolute left-0 right-0 border-t border-dashed border-border/60 pointer-events-none" style={{ top: (m - SLOT_START_MIN) * PX_PER_MIN }}/>
                      ))}

                      {dStr === todayStr && showNowLine && (
                        <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: nowTop }}>
                          <div className="relative h-0 border-t-2 border-red-500">
                            <span className="absolute -left-1 -top-[5px] w-2.5 h-2.5 rounded-full bg-red-500"/>
                          </div>
                        </div>
                      )}

                      {dStr === todayStr && nowTop > 0 && (
                        <div className="absolute left-0 right-0 top-0 bg-muted/40 pointer-events-none" style={{ height: Math.min(nowTop, GRID_HEIGHT) }}/>
                      )}

                      {dayBookings.map(b => {
                        const top = (b.start - SLOT_START_MIN) * PX_PER_MIN;
                        const height = Math.max((b.end - b.start) * PX_PER_MIN, 18);
                        const mine = isMyBooking(b);
                        return (
                          <div key={b.id}
                            onClick={(e) => { e.stopPropagation(); if (mine) openEditModal(b); }}
                            className={cn(
                              "group absolute left-0.5 right-0.5 z-10 rounded-md border px-1.5 py-1 shadow-sm transition-shadow hover:shadow-md hover:z-20",
                              mine ? "bg-yellow-100 border-yellow-300 cursor-pointer dark:bg-yellow-900/40 dark:border-yellow-700" : "bg-red-100 border-red-300 cursor-not-allowed dark:bg-red-900/40 dark:border-red-700"
                            )}
                            style={{ top, height }}
                          >
                            <p className={cn("text-[10px] font-semibold leading-tight truncate", mine ? "text-yellow-900 dark:text-yellow-200" : "text-red-800 dark:text-red-200")}>
                              {minutesToLabel(b.start)}–{minutesToLabel(b.end)}
                            </p>
                            <p className={cn("text-[10px] leading-tight truncate", mine ? "text-yellow-800 dark:text-yellow-300" : "text-red-700 dark:text-red-300")}>
                              {b.employeeName}
                            </p>

                            <div className={cn(
                              "hidden group-hover:block absolute z-30 left-1/2 -translate-x-1/2 w-56 bg-popover border border-border rounded-lg shadow-xl p-2.5 text-left text-xs",
                              top < 200 ? "top-full mt-1" : "bottom-full mb-1"
                            )}>
                              <p className="font-semibold text-foreground text-[11px]">{dStr} · {minutesToLabel(b.start)}–{minutesToLabel(b.end)}</p>
                              <p className="flex items-center gap-1.5 text-muted-foreground mt-1"><UserIcon size={11}/> {b.employeeName}</p>
                              {b.contact && <p className="flex items-center gap-1.5 text-muted-foreground mt-0.5"><Phone size={11}/> {b.contact}</p>}
                              {b.email && <p className="flex items-center gap-1.5 text-muted-foreground mt-0.5 truncate"><Mail size={11}/> {b.email}</p>}
                              <p className="italic text-muted-foreground mt-1.5 pt-1.5 border-t border-border">{b.purpose}</p>
                              {mine && (
                                <div className="flex justify-end gap-1.5 mt-1.5 pt-1.5 border-t border-border">
                                  <button onClick={(e) => { e.stopPropagation(); openEditModal(b); }}
                                    className="flex items-center gap-1 py-0.5 px-2 text-[10px] font-medium rounded bg-primary text-primary-foreground border-none cursor-pointer">
                                    <Pencil size={9}/> Edit
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); cancel(b.id); toast.success("Booking cancelled"); }}
                                    className="flex items-center gap-1 py-0.5 px-2 text-[10px] font-medium rounded bg-destructive text-white border-none cursor-pointer">
                                    <X size={9}/> Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border shadow-sm animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center gap-2 p-3 flex-wrap border-b border-border">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Clock size={12}/> Date</label>
            <input type="date" value={tableDate} onChange={e => setTableDate(e.target.value)}
              className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"/>
            <button onClick={() => setTableDate(todayStr)}
              className="py-1.5 px-3 text-xs font-medium border border-border rounded-md bg-card cursor-pointer transition-colors hover:bg-muted">
              Today
            </button>
          </div>

          {!hasSelection ? (
            <p className="text-sm text-muted-foreground text-center py-16">Select a location and room to view bookings</p>
          ) : (
            <div className="overflow-auto max-h-[480px]">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-left text-muted-foreground bg-muted sticky top-0 z-10">
                    <th className="py-1.5 px-3 font-semibold text-[11px]">Action</th>
                    <th className="py-1.5 px-3 font-semibold text-[11px]">Start</th>
                    <th className="py-1.5 px-3 font-semibold text-[11px]">End</th>
                    <th className="py-1.5 px-3 font-semibold text-[11px]">Status</th>
                    <th className="py-1.5 px-3 font-semibold text-[11px]">Employee</th>
                    <th className="py-1.5 px-3 font-semibold text-[11px]">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.filter(slot => tableDate !== todayStr || !isPastSlot(tableDate, slot.start)).map(slot => {
                    const past = isPastSlot(tableDate, slot.start);
                    const booking = findBooking(tableDate, slot.start);
                    const mine = isMyBooking(booking);
                    const rowCls = past ? "bg-muted/40" : booking ? (mine ? "bg-yellow-50 dark:bg-yellow-900/10" : "bg-red-50 dark:bg-red-900/10") : "";

                    return (
                      <tr key={slot.start} className={cn("border-b border-border", rowCls)}>
                        <td className="py-1 px-3">
                          {past ? (
                            <span className="text-[11px] text-muted-foreground italic">Past</span>
                          ) : booking ? (
                            mine ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => openEditModal(booking)} title="Edit"
                                  className="p-1 rounded-md border border-border bg-card cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary">
                                  <Pencil size={12}/>
                                </button>
                                <button onClick={() => { cancel(booking.id); toast.success("Booking cancelled"); }} title="Cancel"
                                  className="p-1 rounded-md border border-border bg-card cursor-pointer transition-colors hover:bg-destructive hover:text-white hover:border-destructive">
                                  <X size={12}/>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground italic">View only</span>
                            )
                          ) : (
                            <button onClick={() => openAddModal(tableDate, slot.start, slot.end)}
                              className="flex items-center gap-1 py-1 px-2.5 text-[11px] font-semibold rounded-md border border-green-600 text-green-700 bg-card cursor-pointer transition-colors hover:bg-green-600 hover:text-white dark:text-green-400">
                              <Plus size={11}/> Book
                            </button>
                          )}
                        </td>
                        <td className="py-1 px-3 text-foreground">{slot.label}</td>
                        <td className="py-1 px-3 text-foreground">{minutesToLabel(slot.end)}</td>
                        <td className="py-1 px-3">
                          <span className={cn("inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold",
                            past ? "bg-muted text-muted-foreground" : booking ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300")}>
                            {past ? "Past" : booking ? "Booked" : "Available"}
                          </span>
                        </td>
                        <td className="py-1 px-3 text-foreground">{booking?.employeeName || "-"}</td>
                        <td className="py-1 px-3 text-foreground">{booking?.contact || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal open={showModal} onClose={closeModal} maxWidth="max-w-md"
        title={modalMode === "add" ? "Book Room" : "My Booking"}
        footer={<>
          {modalMode === "add" ? (
            <Btn variant="primary" size="sm" onClick={submitModal}>Book</Btn>
          ) : (
            <>
              <Btn variant="primary" size="sm" onClick={submitModal}>Update</Btn>
              <Btn variant="danger" size="sm" onClick={cancelBookingFromModal}>Cancel Booking</Btn>
            </>
          )}
          <Btn variant="secondary" size="sm" onClick={closeModal}>Close</Btn>
        </>}>
        <p className="text-xs text-muted-foreground -mt-2">{location} · {room}</p>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Date">
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls}/>
          </FormField>
          <FormField label="Start Time">
            <select value={form.start ?? ""} onChange={e => setForm(f => ({ ...f, start: Number(e.target.value) }))} className={inputCls}>
              {TIME_SLOTS.map(s => <option key={s.start} value={s.start}>{s.label}</option>)}
            </select>
          </FormField>
          <FormField label="End Time">
            <select value={form.end ?? ""} onChange={e => setForm(f => ({ ...f, end: Number(e.target.value) }))} className={inputCls}>
              {TIME_SLOTS.map(s => <option key={s.end} value={s.end}>{minutesToLabel(s.end)}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Purpose">
          <input value={form.purpose} maxLength={50} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="Enter meeting purpose..." className={inputCls}/>
          <span className="text-[10px] text-muted-foreground text-right">{form.purpose.length}/50</span>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Attendees">
            <input type="number" min="1" value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} placeholder="Number" className={inputCls}/>
          </FormField>
          <FormField label="Breakfast">
            <select value={form.breakfast} onChange={e => setForm(f => ({ ...f, breakfast: e.target.value }))} className={inputCls}>
              {MEAL_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tea">
            <select value={form.tea} onChange={e => setForm(f => ({ ...f, tea: e.target.value }))} className={inputCls}>
              {MEAL_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </FormField>
          <FormField label="Lunch">
            <select value={form.lunch} onChange={e => setForm(f => ({ ...f, lunch: e.target.value }))} className={inputCls}>
              {MEAL_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
