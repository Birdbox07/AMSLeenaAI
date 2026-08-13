import { useState, useMemo } from "react";
import { Plus, MapPin, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { LOCS } from "../../shared/mock/constants";
import { Modal, FormField, inputCls } from "../../shared/components/Modal";
import { Btn } from "../../shared/components/Btn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { cn } from "../../shared/utils/cn";
import { useConferenceQuery, useConferenceMutations } from "./hooks/useConferenceQuery";
import { validateBookingForm } from "./conference.validators";
import { SLOT_TIMES } from "./conference.mock";
import { useCurrentUser } from "../employees/hooks/useEmployees";
import "./conference.css";

export default function ConferencePage() {
  const { rooms: CONFERENCE_ROOMS, bookings } = useConferenceQuery();
  const { add } = useConferenceMutations();
  const CURRENT_USER = useCurrentUser();

  const [locFilter, setLocFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [bookRoom, setBookRoom] = useState(null);
  const [subject, setSubject] = useState("");

  const rooms = useMemo(() =>
    CONFERENCE_ROOMS.filter(r => !locFilter || r.location === locFilter),
    [CONFERENCE_ROOMS, locFilter]
  );

  const bookingsForDate = useMemo(() =>
    bookings.filter(b => b.date === dateFilter),
    [bookings, dateFilter]
  );

  const bookingsFor = (roomId) =>
    bookingsForDate.filter(b => b.roomId === roomId).sort((a,b) => a.startTime.localeCompare(b.startTime));

  const bookingCols = [
    { key:"roomId", label:"Room", render: b => <span className="font-medium">{CONFERENCE_ROOMS.find(r=>r.id===b.roomId)?.name}</span> },
    { key:"bookedBy", label:"Booked By" },
    { key:"subject", label:"Subject" },
    { key:"date", label:"Date" },
    { key:"startTime", label:"Start" },
    { key:"endTime", label:"End" },
  ];

  return (
    <div className="conference-page flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <h2 className="text-lg font-bold text-foreground">Conference Room Booking</h2>
        <Btn variant="primary" size="sm" onClick={() => { if (!rooms.length) { toast.error("No rooms available"); return; } setBookRoom(rooms[0]); setSubject(""); }}>
          <Plus size={14}/> New Booking
        </Btn>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-end animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Location</label>
          <select value={locFilter} onChange={e=>setLocFilter(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background min-w-[150px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All Locations</option>
            {LOCS.map(l=><option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Date</label>
          <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}
            className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"/>
        </div>
        {locFilter && (
          <Btn variant="ghost" size="sm" onClick={() => setLocFilter("")}>
            <RefreshCw size={13}/> Reset
          </Btn>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room, i) => {
          const dayBookings = bookingsFor(room.id);
          const isFree = dayBookings.length === 0;
          return (
            <button
              key={room.id}
              onClick={() => { setBookRoom(room); setSubject(""); }}
              className="text-left bg-card rounded-lg border border-border p-4 transition-all duration-150 hover:shadow-md hover:border-primary hover-lift animate-fade-in-up"
              style={{ animationDelay: `${i*40}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{room.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin size={11}/> {room.location} · {room.floor}
                  </p>
                </div>
                <span className="flex items-center gap-1.5">
                  {!isFree && <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse-dot"/>}
                  <StatusBadge status={isFree ? "Available" : "Occupied"} />
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Users size={11}/> Capacity: {room.capacity}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {room.amenities.map(a => (
                  <span key={a} className="text-[10px] py-0.5 px-2 bg-secondary text-secondary-foreground rounded-full">{a}</span>
                ))}
              </div>
              {dayBookings.length > 0 && (
                <div className="mt-3 pt-2 border-t border-border flex flex-col gap-1">
                  {dayBookings.map(b => (
                    <p key={b.id} className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">{b.startTime}–{b.endTime}</span> · {b.subject} ({b.bookedBy})
                    </p>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <DataTable
          title={`Bookings for ${dateFilter}`}
          columns={bookingCols}
          data={bookingsForDate}
        />
      </div>

      <Modal open={!!bookRoom} onClose={() => setBookRoom(null)} title={bookRoom ? `Book ${bookRoom.name}` : "Book Room"} maxWidth="max-w-lg"
        footer={<Btn variant="secondary" size="sm" onClick={() => setBookRoom(null)}>Close</Btn>}>
        {bookRoom && (() => {
          const taken = new Set(bookingsFor(bookRoom.id).map(b=>b.startTime));
          return (
            <>
              <p className="text-xs text-muted-foreground">{bookRoom.location} · {bookRoom.floor} · Capacity {bookRoom.capacity}</p>
              <FormField label="Meeting Subject">
                <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g. Sprint Planning" className={inputCls}/>
              </FormField>
              <FormField label={`Available slots on ${dateFilter}`}>
                <div className="grid grid-cols-4 gap-2">
                  {SLOT_TIMES.map(time => {
                    const isTaken = taken.has(time);
                    return (
                      <button key={time} disabled={isTaken}
                        onClick={() => {
                          const [h] = time.split(":").map(Number);
                          const endTime = `${String(h+1).padStart(2,"0")}:00`;
                          const form = { roomId: bookRoom.id, date: dateFilter, startTime: time, endTime, subject };
                          const errors = validateBookingForm(form, bookings);
                          if (Object.keys(errors).length) {
                            toast.error(Object.values(errors)[0]);
                            return;
                          }
                          add({
                            id: `BKG${Date.now()}`, roomId: bookRoom.id, bookedBy: CURRENT_USER.name,
                            date: dateFilter, startTime: time, endTime, subject: subject.trim(),
                          });
                          toast.success(`${bookRoom.name} booked at ${time} for "${subject.trim()}"`);
                          setBookRoom(null);
                        }}
                        className={cn(
                          "py-1.5 px-2 text-xs font-medium rounded-md border transition-colors duration-150",
                          isTaken
                            ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                            : "bg-transparent border-border cursor-pointer hover:border-primary hover:bg-secondary"
                        )}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </FormField>
            </>
          );
        })()}
      </Modal>
    </div>
  );
}
