import { useState } from "react";
import { MapPin, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Btn } from "../../../shared/components/Btn";
import { LOCS } from "../../../shared/mock/constants";
import { LOCATION_COORDS } from "../location.mock";
import { useCurrentUser } from "../../employees/hooks/useEmployees";
import { useLocationActions } from "../hooks/useLocation";

function mockCoords() {
  const loc = LOCS[Math.floor(Math.random() * LOCS.length)];
  const base = LOCATION_COORDS[loc];
  const lat = +(base.lat + (Math.random() - 0.5) * 0.01).toFixed(6);
  const long = +(base.long + (Math.random() - 0.5) * 0.01).toFixed(6);
  return { lat, long, address: `${loc} — Lat ${lat}, Long ${long}`, approximate: true };
}

export function CheckInPanel() {
  const CURRENT_USER = useCurrentUser();
  const { add } = useLocationActions();
  const [checkingIn, setCheckingIn] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState(null);

  const submitCheckIn = ({ lat, long, address, approximate }) => {
    const now = new Date();
    const record = {
      id: `LOC${Date.now()}`,
      employeeId: CURRENT_USER.id,
      employeeName: CURRENT_USER.name,
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
      lat,
      long,
      address,
      status: "Pending",
    };
    add(record);
    setLastCheckIn(record);
    setCheckingIn(false);
    toast.success(
      approximate
        ? "Checked in using approximate location"
        : "Checked in successfully"
    );
  };

  const handleCheckIn = () => {
    setCheckingIn(true);
    if (!navigator.geolocation) {
      submitCheckIn(mockCoords());
      return;
    }
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = +pos.coords.latitude.toFixed(6);
          const long = +pos.coords.longitude.toFixed(6);
          submitCheckIn({ lat, long, address: `Lat ${lat}, Long ${long}`, approximate: false });
        },
        () => {
          submitCheckIn(mockCoords());
        },
        { timeout: 8000 }
      );
    } catch {
      submitCheckIn(mockCoords());
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
          <MapPin size={20} />
        </div>
        <div>
          <p className="font-semibold text-foreground">Location Check-In</p>
          <p className="text-xs text-muted-foreground">
            {lastCheckIn
              ? `Last check-in: ${lastCheckIn.date} ${lastCheckIn.time} — ${lastCheckIn.address}`
              : "Capture your current location for today's attendance record"}
          </p>
        </div>
      </div>
      <Btn onClick={handleCheckIn} disabled={checkingIn}>
        {checkingIn ? <LoaderCircle size={14} className="animate-spin" /> : <MapPin size={14} />}
        {checkingIn ? "Checking in..." : "Check In"}
      </Btn>
    </div>
  );
}
