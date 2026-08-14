import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, RefreshCw, Table2, CalendarDays, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { LOCS } from "../../shared/mock/constants";
import { Modal, FormField, inputCls } from "../../shared/components/Modal";
import { Btn } from "../../shared/components/Btn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { cn } from "../../shared/utils/cn";
import { useConferenceQuery, useConferenceMutations, CONFERENCE_BOOKINGS_QUERY_KEY } from "./hooks/useConferenceQuery";
import { validateBookingForm, hasBookingConflict, isPastSlot } from "./conference.validators";
import {
  TIME_SLOTS, TIME_OPTIONS, MEAL_OPTIONS, MEAL_RESTRICTED_LOCATIONS,
  SLOT_INCREMENT_MIN, SLOT_END_HOUR, minutesToLabel, labelToMinutes,
} from "./conference.mock";
import { useCurrentUser } from "../employees/hooks/useEmployees";
import "./conference.css";

function todayStr() { return new Date().toISOString().split("T")[0]; }
function nowMinutes() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
function addDays(dateStr, delta) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return d.toISOString().split("T")[0];
}
function formatDateLabel(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

const emptyMeals = { breakfast: "Not Required", tea: "Not Required", lunch: "Not Required" };

export default function ConferencePage() {
  const { rooms: ROOMS, bookings } = useConferenceQuery();
  const { add, update, cancel } = useConferenceMutations();
  const CURRENT_USER = useCurrentUser();
  const queryClient = useQueryClient();

  const TODAY = todayStr();
  const NOW_MIN = nowMinutes();

  const [viewMode, setViewMode] = useState("calendar");
  const [locFilter, setLocFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [calDate, setCalDate] = useState(TODAY);
  const [tableDate, setTableDate] = useState(TODAY);

  const [modalForm, setModalForm] = useState(null); // null = closed
  const [errors, setErrors] = useState({});
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => { setRoomFilter(""); }, [locFilter]);

  const roomsAtLocation = useMemo(() => ROOMS.filter(r => r.location === locFilter), [ROOMS, locFilter]);
  const isMealRestrictedLocation = MEAL_RESTRICTED_LOCATIONS.includes(locFilter);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: CONFERENCE_BOOKINGS_QUERY_KEY });
    toast.success("Refreshed");
  };

  // ---------- Calendar View: Time (rows) x Rooms-at-location (columns), one day ----------
  const bookingsOnCalDate = useMemo(() => bookings.filter(b => b.date === calDate), [bookings, calDate]);

  const cellStatus = (room, slot) => {
    if (isPastSlot(calDate, slot.start, TODAY, NOW_MIN)) return { status: "past", booking: null };
    const booking = bookingsOnCalDate.find(b => b.roomId === room.id && slot.start >= b.startMin && slot.start < b.endMin);
    if (!booking) return { status: "available", booking: null };
    if (booking.employeeId === CURRENT_USER.id) return { status: "mine", booking };
    return { status: "booked", booking };
  };

  // ---------- Table View: every slot for one day, for the selected room ----------
  const bookingsForTableRoom = useMemo(() =>
    bookings.filter(b => b.roomId === roomFilter && b.date === tableDate),
    [bookings, roomFilter, tableDate]
  );
  const isHistoricalTableDate = tableDate < TODAY;
  const tableSlots = useMemo(() =>
    tableDate === TODAY ? TIME_SLOTS.filter(s => s.start >= NOW_MIN) : TIME_SLOTS,
    [tableDate, TODAY, NOW_MIN]
  );

  const tableRowStatus = (slot) => {
    const booking = bookingsForTableRoom.find(b => slot.start >= b.startMin && slot.start < b.endMin);
    if (!booking) return { status: "Available", booking: null };
    if (booking.employeeId === CURRENT_USER.id) return { status: "My Booking", booking };
    return { status: "Booked", booking };
  };

  // ---------- Modal ----------
  const modalRoom = modalForm ? ROOMS.find(r => r.id === modalForm.roomId) : null;
  const modalMealRestricted = modalRoom && MEAL_RESTRICTED_LOCATIONS.includes(modalRoom.location);

  const openBookModal = (roomId, date, startMin) => {
    setModalForm({
      mode: "book", bookingId: null, roomId, date,
      startMin, endMin: Math.min(startMin + SLOT_INCREMENT_MIN, SLOT_END_HOUR * 60),
      purpose: "", attendees: "", ...emptyMeals,
    });
    setErrors({});
  };

  const openEditModal = (booking) => {
    const room = ROOMS.find(r => r.id === booking.roomId);
    const restricted = room && MEAL_RESTRICTED_LOCATIONS.includes(room.location);
    setModalForm({
      mode: "edit", bookingId: booking.id, roomId: booking.roomId, date: booking.date,
      startMin: booking.startMin, endMin: booking.endMin,
      purpose: booking.purpose, attendees: booking.attendees,
      breakfast: restricted ? "Not Required" : booking.breakfast,
      tea: restricted ? "Not Required" : booking.tea,
      lunch: restricted ? "Not Required" : booking.lunch,
    });
    setErrors({});
  };

  const closeModal = () => { setModalForm(null); setErrors({}); };

  const onStartTimeChange = (label) => {
    const startMin = labelToMinutes(label);
    setModalForm(f => ({ ...f, startMin, endMin: f.endMin > startMin ? f.endMin : startMin + SLOT_INCREMENT_MIN }));
  };

  const submitModal = () => {
    const validationErrors = validateBookingForm(modalForm);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      toast.error(Object.values(validationErrors)[0]);
      return;
    }
    const conflict = hasBookingConflict(bookings, {
      roomId: modalForm.roomId, date: modalForm.date, startMin: modalForm.startMin, endMin: modalForm.endMin,
      excludeId: modalForm.mode === "edit" ? modalForm.bookingId : null,
    });
    if (conflict) {
      toast.error("This room is already booked for part of that time range");
      return;
    }

    const patch = {
      date: modalForm.date, startMin: modalForm.startMin, endMin: modalForm.endMin,
      purpose: modalForm.purpose.trim(), attendees: Number(modalForm.attendees),
      breakfast: modalForm.breakfast, tea: modalForm.tea, lunch: modalForm.lunch,
    };

    if (modalForm.mode === "book") {
      add({
        id: `BKG${Date.now()}`, roomId: modalForm.roomId,
        employeeId: CURRENT_USER.id, employeeName: CURRENT_USER.name,
        contact: CURRENT_USER.mobile, email: CURRENT_USER.email,
        ...patch,
      });
      toast.success(`${modalRoom?.name} booked for ${minutesToLabel(modalForm.startMin)}–${minutesToLabel(modalForm.endMin)}`);
    } else {
      update(modalForm.bookingId, patch);
      toast.success("Booking updated");
    }
    closeModal();
  };

  const confirmCancelBooking = () => {
    if (!cancelTarget) return;
    cancel(cancelTarget.id);
    toast.success("Booking cancelled");
    setCancelTarget(null);
    closeModal();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <h2 className="text-lg font-bold text-foreground">Conference Room Booking</h2>
        <Btn variant="ghost" size="sm" onClick={refresh}>
          <RefreshCw size={13}/> Refresh
        </Btn>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-end animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground"><span className="text-destructive">*</span> Location</label>
          <select value={locFilter} onChange={e => setLocFilter(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background min-w-[160px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select location...</option>
            {LOCS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        {viewMode === "table" && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground"><span className="text-destructive">*</span> Room</label>
            <select value={roomFilter} onChange={e => setRoomFilter(e.target.value)} disabled={!locFilter}
              className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background min-w-[160px] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
              <option value="">Select room...</option>
              {roomsAtLocation.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        )}

        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit ml-auto">
          <button onClick={() => setViewMode("calendar")}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors cursor-pointer border-none",
              viewMode==="calendar" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
            <CalendarDays size={13}/> Calendar
          </button>
          <button onClick={() => setViewMode("table")}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors cursor-pointer border-none",
              viewMode==="table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground bg-transparent")}>
            <Table2 size={13}/> Table
          </button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <Btn variant="ghost" size="xs" onClick={() => setCalDate(d => addDays(d, -1))} disabled={calDate <= TODAY}>
              <ChevronLeft size={13}/> Prev
            </Btn>
            <Btn variant="ghost" size="xs" onClick={() => setCalDate(TODAY)}>Today</Btn>
            <Btn variant="ghost" size="xs" onClick={() => setCalDate(d => addDays(d, 1))}>
              Next <ChevronRight size={13}/>
            </Btn>
            <span className="text-sm font-semibold text-foreground ml-1">{formatDateLabel(calDate)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status="Available"/>
            <StatusBadge status="Booked"/>
            <StatusBadge status="My Booking"/>
            <StatusBadge status="Past"/>
          </div>

          {!locFilter ? (
            <div className="bg-card rounded-lg border border-border py-12 text-center text-muted-foreground text-sm">
              Select a location to view the calendar
            </div>
          ) : roomsAtLocation.length === 0 ? (
            <div className="bg-card rounded-lg border border-border py-12 text-center text-muted-foreground text-sm">
              No conference rooms found at this location
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border overflow-auto max-h-[560px]">
              <table className="w-full border-collapse text-xs table-fixed min-w-[560px]">
                <thead>
                  <tr>
                    <th className="sticky top-0 left-0 z-20 bg-muted text-left py-2 px-3 border-b border-border w-16">Time</th>
                    {roomsAtLocation.map(room => (
                      <th key={room.id} className="sticky top-0 z-10 bg-muted text-center py-2 px-2 border-b border-l border-border font-semibold whitespace-nowrap">
                        {room.name}
                        <span className="block text-[10px] font-normal text-muted-foreground">{room.floor} · Cap {room.capacity}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map(slot => (
                    <tr key={slot.start}>
                      <td className="sticky left-0 z-10 bg-muted text-center py-1 px-2 border-b border-border text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                        {minutesToLabel(slot.start)}
                      </td>
                      {roomsAtLocation.map(room => {
                        const { status, booking } = cellStatus(room, slot);
                        return (
                          <td key={room.id}
                            onClick={() => {
                              if (status === "available") openBookModal(room.id, calDate, slot.start);
                              else if (status === "mine") openEditModal(booking);
                            }}
                            className={cn(
                              "group relative h-6 border-b border-l border-border text-center",
                              status === "available" && "cursor-pointer hover:bg-secondary",
                              status === "mine" && "bg-yellow-100 dark:bg-yellow-900/30 cursor-pointer hover:opacity-80",
                              status === "booked" && "bg-red-100 dark:bg-red-900/30 cursor-not-allowed",
                              status === "past" && "bg-muted/60 cursor-not-allowed"
                            )}
                          >
                            {booking && (
                              <div className="hidden group-hover:block absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-1 w-56 bg-popover border border-border rounded-lg shadow-xl p-2.5 text-left">
                                <p className="text-xs font-semibold text-foreground">{minutesToLabel(booking.startMin)}–{minutesToLabel(booking.endMin)}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{booking.employeeName}</p>
                                <p className="text-xs text-muted-foreground italic mt-0.5">{booking.purpose}</p>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold text-muted-foreground">Date</label>
            <input type="date" value={tableDate} onChange={e => setTableDate(e.target.value)}
              className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"/>
            <Btn variant="ghost" size="xs" onClick={() => setTableDate(TODAY)}>Today</Btn>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status="Available"/>
            <StatusBadge status="Booked"/>
            <StatusBadge status="My Booking"/>
          </div>

          {!locFilter || !roomFilter ? (
            <div className="bg-card rounded-lg border border-border py-12 text-center text-muted-foreground text-sm">
              Select a location and room to view bookings
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="overflow-auto max-h-[520px]">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-primary text-primary-foreground sticky top-0">
                      {["Start","End","Status","Employee","Contact","Actions"].map(h => (
                        <th key={h} className="py-2 px-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableSlots.length === 0 ? (
                      <tr><td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">No upcoming slots left for this date</td></tr>
                    ) : tableSlots.map(slot => {
                      const { status, booking } = tableRowStatus(slot);
                      const isMine = status === "My Booking";
                      return (
                        <tr key={slot.start} className={cn(
                          "border-b border-border",
                          status === "Booked" && "bg-red-50 dark:bg-red-900/10",
                          isMine && "bg-yellow-50 dark:bg-yellow-900/10"
                        )}>
                          <td className="py-2 px-3">{minutesToLabel(slot.start)}</td>
                          <td className="py-2 px-3">{minutesToLabel(slot.end)}</td>
                          <td className="py-2 px-3"><StatusBadge status={status}/></td>
                          <td className="py-2 px-3">{booking?.employeeName || "-"}</td>
                          <td className="py-2 px-3">{booking?.contact || "-"}</td>
                          <td className="py-2 px-3">
                            {isHistoricalTableDate ? (
                              <span className="text-xs text-muted-foreground italic">Past</span>
                            ) : status === "Available" ? (
                              <Btn variant="secondary" size="xs" onClick={() => openBookModal(roomFilter, tableDate, slot.start)}>Book</Btn>
                            ) : isMine ? (
                              <div className="flex gap-1">
                                <button onClick={() => openEditModal(booking)}
                                  className="p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer hover:bg-secondary text-primary" title="Edit"><Pencil size={13}/></button>
                                <button onClick={() => setCancelTarget({ id: booking.id, roomName: ROOMS.find(r => r.id === booking.roomId)?.name })}
                                  className="p-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" title="Cancel"><X size={13}/></button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">View only</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={!!modalForm} onClose={closeModal} maxWidth="max-w-lg"
        title={modalForm?.mode === "edit" ? `My Booking · ${modalRoom?.name}` : `Book ${modalRoom?.name || "Room"}`}
        footer={modalForm && (
          <>
            <Btn variant="secondary" size="sm" onClick={closeModal}>Cancel</Btn>
            {modalForm.mode === "edit" && (
              <Btn variant="danger" size="sm" onClick={() => setCancelTarget({ id: modalForm.bookingId, roomName: modalRoom?.name })}>Cancel Booking</Btn>
            )}
            <Btn variant="primary" size="sm" onClick={submitModal}>{modalForm.mode === "edit" ? "Update" : "Book"}</Btn>
          </>
        )}>
        {modalForm && (
          <>
            <p className="text-xs text-muted-foreground">{modalRoom?.location} · {modalRoom?.floor} · Capacity {modalRoom?.capacity}</p>

            <div className="grid grid-cols-3 gap-3">
              <FormField label="Date">
                <input type="date" min={TODAY} value={modalForm.date}
                  onChange={e => setModalForm(f => ({ ...f, date: e.target.value }))} className={inputCls}/>
                {errors.date && <span className="text-xs text-destructive">{errors.date}</span>}
              </FormField>
              <FormField label="Start Time">
                <select value={minutesToLabel(modalForm.startMin)} onChange={e => onStartTimeChange(e.target.value)} className={inputCls}>
                  {TIME_OPTIONS.filter(l => labelToMinutes(l) < SLOT_END_HOUR * 60).map(l => <option key={l}>{l}</option>)}
                </select>
              </FormField>
              <FormField label="End Time">
                <select value={minutesToLabel(modalForm.endMin)} onChange={e => setModalForm(f => ({ ...f, endMin: labelToMinutes(e.target.value) }))} className={inputCls}>
                  {TIME_OPTIONS.filter(l => labelToMinutes(l) > modalForm.startMin).map(l => <option key={l}>{l}</option>)}
                </select>
                {errors.endMin && <span className="text-xs text-destructive">{errors.endMin}</span>}
              </FormField>
            </div>

            <FormField label="Purpose">
              <input value={modalForm.purpose} maxLength={50} placeholder="Enter meeting purpose..."
                onChange={e => setModalForm(f => ({ ...f, purpose: e.target.value }))} className={inputCls}/>
              <div className="flex items-center justify-between">
                {errors.purpose && <span className="text-xs text-destructive">{errors.purpose}</span>}
                <span className="text-xs text-muted-foreground ml-auto">{modalForm.purpose.length}/50</span>
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Attendees">
                <input type="number" min="1" placeholder="Number" value={modalForm.attendees}
                  onChange={e => setModalForm(f => ({ ...f, attendees: e.target.value }))} className={inputCls}/>
                {errors.attendees && <span className="text-xs text-destructive">{errors.attendees}</span>}
              </FormField>
              <FormField label="Breakfast">
                <select value={modalForm.breakfast} disabled={modalMealRestricted}
                  onChange={e => setModalForm(f => ({ ...f, breakfast: e.target.value }))} className={cn(inputCls, "disabled:opacity-50")}>
                  {(modalMealRestricted ? ["Not Required"] : MEAL_OPTIONS).map(o => <option key={o}>{o}</option>)}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tea">
                <select value={modalForm.tea} disabled={modalMealRestricted}
                  onChange={e => setModalForm(f => ({ ...f, tea: e.target.value }))} className={cn(inputCls, "disabled:opacity-50")}>
                  {(modalMealRestricted ? ["Not Required"] : MEAL_OPTIONS).map(o => <option key={o}>{o}</option>)}
                </select>
              </FormField>
              <FormField label="Lunch">
                <select value={modalForm.lunch} disabled={modalMealRestricted}
                  onChange={e => setModalForm(f => ({ ...f, lunch: e.target.value }))} className={cn(inputCls, "disabled:opacity-50")}>
                  {(modalMealRestricted ? ["Not Required"] : MEAL_OPTIONS).map(o => <option key={o}>{o}</option>)}
                </select>
              </FormField>
            </div>
            {modalMealRestricted && (
              <p className="text-xs text-muted-foreground italic">Catering isn't available for {modalRoom.location} bookings.</p>
            )}
          </>
        )}
      </Modal>

      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Booking"
        footer={<>
          <Btn variant="secondary" size="sm" onClick={() => setCancelTarget(null)}>Keep Booking</Btn>
          <Btn variant="danger" size="sm" onClick={confirmCancelBooking}>Cancel Booking</Btn>
        </>}>
        <p className="text-sm">Are you sure you want to cancel this booking{cancelTarget?.roomName ? ` for ${cancelTarget.roomName}` : ""}? This cannot be undone.</p>
      </Modal>
    </div>
  );
}
