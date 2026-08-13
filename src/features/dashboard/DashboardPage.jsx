import { useMemo } from "react";
import {
  CheckCircle, Shield, Headphones, Clock, GraduationCap, Bell, Calendar, FileText, Building2,
  Tag, Mail, Phone, User, MapPin, Plus, LogOut,
} from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { CountUp } from "../../shared/components/CountUp";
import { Btn } from "../../shared/components/Btn";
import { useLeaveQuery } from "../leave/hooks/useLeaveQuery";
import { useServiceDeskQuery } from "../servicedesk/hooks/useServiceDeskQuery";
import { getLeaveBalance } from "../leave/leave.mock";
import { useCurrentUser } from "../employees/hooks/useEmployees";
import { useAttendance } from "../attendance/hooks/useAttendance";
import { HOLIDAY_DATA } from "../holidays/holidays.mock";
import "./dashboard.css";

const NOTIFICATIONS = [
  { t:"Leave Approved", d:"Your casual leave for Dec 24 has been approved", time:"2m ago", icon:CheckCircle, c:"icon-color-green" },
  { t:"New Policy Update", d:"IT Security Policy v3.2 has been published", time:"1h ago", icon:Shield, c:"icon-color-blue" },
  { t:"Service Ticket #TKT10023", d:"Your ticket has been assigned to Suresh IT", time:"3h ago", icon:Headphones, c:"icon-color-orange" },
  { t:"Attendance Reminder", d:"Please mark your attendance before 10 AM", time:"Yesterday", icon:Clock, c:"icon-color-yellow" },
  { t:"Training Due", d:"React Advanced Patterns course due in 3 days", time:"Yesterday", icon:GraduationCap, c:"icon-color-purple" },
];

export default function DashboardPage({ onNavigate }) {
  const CURRENT_USER = useCurrentUser();
  const { data: leaves } = useLeaveQuery();
  const { data: tickets } = useServiceDeskQuery();
  const ATTENDANCE = useAttendance();

  const todayStr = new Date().toISOString().split("T")[0];

  const myCheckInToday = useMemo(() =>
    ATTENDANCE.find(r => r.employeeId === CURRENT_USER.id && r.date === todayStr) || null,
    [ATTENDANCE, todayStr, CURRENT_USER]
  );

  const currentMonthAttendance = useMemo(() => {
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    return ATTENDANCE.filter(r => r.employeeId === CURRENT_USER.id && r.date.startsWith(monthPrefix))
      .sort((a,b) => a.date.localeCompare(b.date));
  }, [ATTENDANCE, CURRENT_USER]);

  const leaveBalance = useMemo(() => getLeaveBalance(CURRENT_USER.id, leaves), [leaves, CURRENT_USER]);

  const myPendingLeaves = useMemo(() =>
    leaves.filter(l => l.employeeId === CURRENT_USER.id && l.status === "Pending"),
    [leaves, CURRENT_USER]
  );

  const myOpenTickets = tickets.filter(t => t.employeeName === CURRENT_USER.name && (t.status==="Open" || t.status==="In Progress")).length;

  const upcomingHolidays = useMemo(() => [...HOLIDAY_DATA].sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3), []);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  })();

  const announcements = [
    { id:1, title:"Q4 Performance Reviews", desc:"Annual performance review cycle begins November 1st.", date:"Oct 25, 2025", priority:"High", author:"HR Team" },
    { id:2, title:"Office Closure – Diwali", desc:"Office will be closed on October 20-21 for Diwali.", date:"Oct 18, 2025", priority:"Medium", author:"Admin" },
    { id:3, title:"New IT Security Policy", desc:"Updated IT Security Policy v3.2 is now in effect.", date:"Oct 15, 2025", priority:"High", author:"IT Team" },
    { id:4, title:"Team Building Activity", desc:"Annual team outing scheduled for November 15th.", date:"Oct 10, 2025", priority:"Low", author:"HR Team" },
    { id:5, title:"Health Insurance Renewal", desc:"Please submit health insurance declarations by Oct 31.", date:"Oct 08, 2025", priority:"High", author:"Finance" },
  ];

  const monthStats = useMemo(() => ({
    present: currentMonthAttendance.filter(r=>r.status==="Present").length,
    absent: currentMonthAttendance.filter(r=>r.status==="Absent").length,
    late: currentMonthAttendance.filter(r=>r.status==="Late").length,
    leave: currentMonthAttendance.filter(r=>r.status==="Leave").length,
    totalHours: currentMonthAttendance.reduce((a,r)=>a+r.hours,0),
  }), [currentMonthAttendance]);

  return (
    <div className="flex flex-col gap-6">
      <div className={cn("bg-primary text-primary-foreground rounded-lg shadow-sm p-5 flex items-center gap-4", "animate-fade-in-up", "card-shimmer")}>
        <div className={cn("w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold shrink-0", "animate-pop-in")}>
          {CURRENT_USER.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
        </div>
        <div>
          <h2 className="text-lg font-bold">{greeting}, {CURRENT_USER.name}</h2>
          <p className="text-sm text-primary-foreground/80">{CURRENT_USER.designation} · {CURRENT_USER.department} · {CURRENT_USER.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={cn("bg-card rounded-lg border border-border shadow-sm overflow-hidden", "hover-lift", "animate-fade-in-up")} style={{ animationDelay: "60ms" }}>
          <div className="flex items-center gap-3 py-4 px-5 border-b border-border bg-secondary/40">
            <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
              {CURRENT_USER.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{CURRENT_USER.name}</p>
              <p className="text-xs text-muted-foreground truncate">{CURRENT_USER.designation} · {CURRENT_USER.department}</p>
            </div>
            <StatusBadge status={CURRENT_USER.status}/>
          </div>
          <div className="divide-y divide-border">
            {[
              { label:"Employee Code", value:CURRENT_USER.empCode, icon:Tag },
              { label:"Email", value:CURRENT_USER.email, icon:Mail },
              { label:"Mobile", value:CURRENT_USER.mobile, icon:Phone },
              { label:"Manager", value:CURRENT_USER.manager, icon:User },
              { label:"Location", value:CURRENT_USER.location, icon:MapPin },
              { label:"Join Date", value:CURRENT_USER.joinDate, icon:Calendar },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3 py-2.5 px-5">
                <f.icon size={14} className="text-muted-foreground shrink-0"/>
                <span className="text-xs text-muted-foreground flex-1">{f.label}</span>
                <span className="text-sm font-medium text-foreground text-right truncate max-w-[55%]">{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={cn("bg-card rounded-lg border border-border shadow-sm overflow-hidden", "hover-lift", "animate-fade-in-up")} style={{ animationDelay: "120ms" }}>
          <div className="flex items-center justify-between px-5 pt-5">
            <h3 className="font-semibold text-sm flex items-center gap-2"><CheckCircle size={16} className="text-primary"/> My Check-In Today</h3>
            <button onClick={() => onNavigate("attendance")} className="text-xs text-primary font-medium bg-transparent border-none cursor-pointer hover:underline">View All</button>
          </div>
          {myCheckInToday ? (
            <>
              <div className="flex items-center gap-2 px-5 mt-3">
                {(myCheckInToday.status === "Present" || myCheckInToday.status === "Late") && (
                  <span className="w-2 h-2 rounded-full bg-[#2F6B45] animate-pulse-dot"/>
                )}
                <StatusBadge status={myCheckInToday.status}/>
                <span className="text-[11px] text-muted-foreground">{new Date().toLocaleDateString("en",{ weekday:"long", day:"2-digit", month:"short" })}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-5 pt-3">
                <div className="rounded-md bg-secondary/60 py-2.5 px-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-primary shrink-0"><LogOut size={14} className="rotate-180"/></div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Check In</p>
                    <p className="text-sm font-semibold text-foreground">{myCheckInToday.checkIn}</p>
                  </div>
                </div>
                <div className="rounded-md bg-secondary/60 py-2.5 px-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-primary shrink-0"><LogOut size={14}/></div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Check Out</p>
                    <p className="text-sm font-semibold text-foreground">{myCheckInToday.checkOut}</p>
                  </div>
                </div>
                <div className="rounded-md bg-secondary/60 py-2.5 px-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-primary shrink-0"><Clock size={14}/></div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Hours Worked</p>
                    <p className="text-sm font-semibold text-foreground">{myCheckInToday.hours > 0 ? `${myCheckInToday.hours}h` : "-"}</p>
                  </div>
                </div>
                <div className="rounded-md bg-secondary/60 py-2.5 px-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-primary shrink-0"><MapPin size={14}/></div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Location</p>
                    <p className="text-sm font-semibold text-foreground truncate">{myCheckInToday.location}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No check-in recorded for today.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
        {[
          { label:"Apply Leave", icon:Calendar, module:"leave" },
          { label:"My Documents", icon:FileText, module:"documents" },
          { label:"Book a Room", icon:Building2, module:"conference" },
          { label:"Raise Ticket", icon:Headphones, module:"servicedesk" },
        ].map((a,i) => (
          <button key={a.label} onClick={() => onNavigate(a.module)}
            style={{ animationDelay: `${180 + i*40}ms` }}
            className={cn("group bg-card rounded-lg border border-border shadow-sm p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:shadow-md hover:border-primary hover:-translate-y-0.5", "animate-fade-in-up")}>
            <div className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
              <a.icon size={16}/>
            </div>
            <span className="text-xs font-medium text-foreground text-center">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={cn("bg-card rounded-lg border border-border shadow-sm p-5", "hover-lift", "animate-fade-in-up")} style={{ animationDelay: "240ms" }}>
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-4"><Clock size={16} className="text-primary"/> My Attendance – Current Month (Swipe Details)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
            {[
              { label:"Present", value:monthStats.present, color:"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
              { label:"Absent", value:monthStats.absent, color:"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
              { label:"Late", value:monthStats.late, color:"bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
              { label:"Leave", value:monthStats.leave, color:"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
              { label:"Hours", value:`${monthStats.totalHours}h`, color:"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
            ].map(s => (
              <div key={s.label} className={cn("rounded-md p-2 text-center", s.color)}>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="max-h-[220px] overflow-y-auto mt-2">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pt-1.5 pr-2 pb-1.5 pl-0 font-medium">Date</th>
                  <th className="pt-1.5 pr-2 pb-1.5 pl-0 font-medium">Check In</th>
                  <th className="pt-1.5 pr-2 pb-1.5 pl-0 font-medium">Check Out</th>
                  <th className="pt-1.5 pr-2 pb-1.5 pl-0 font-medium">Hours</th>
                  <th className="pt-1.5 pr-2 pb-1.5 pl-0 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentMonthAttendance.map(r => (
                  <tr key={r.id} className="[&:last-child_td]:border-b-0">
                    <td className="pt-1.5 pr-2 pb-1.5 pl-0 text-foreground border-b border-border">{r.date}</td>
                    <td className="pt-1.5 pr-2 pb-1.5 pl-0 text-foreground border-b border-border">{r.checkIn}</td>
                    <td className="pt-1.5 pr-2 pb-1.5 pl-0 text-foreground border-b border-border">{r.checkOut}</td>
                    <td className="pt-1.5 pr-2 pb-1.5 pl-0 text-foreground border-b border-border">{r.hours > 0 ? `${r.hours}h` : "-"}</td>
                    <td className="pt-1.5 pr-2 pb-1.5 pl-0 text-foreground border-b border-border"><StatusBadge status={r.status}/></td>
                  </tr>
                ))}
                {currentMonthAttendance.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No records for this month.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={cn("bg-card rounded-lg border border-border shadow-sm p-5", "hover-lift", "animate-fade-in-up")} style={{ animationDelay: "300ms" }}>
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-4"><Calendar size={16} className="text-primary"/> My Leave Balance</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pt-1.5 pr-2 pb-1.5 pl-0 font-medium">Leave Type</th>
                <th className="pt-1.5 pr-2 pb-1.5 pl-0 font-medium text-right">Allocated</th>
                <th className="pt-1.5 pr-2 pb-1.5 pl-0 font-medium text-right">Used</th>
                <th className="pt-1.5 pr-2 pb-1.5 pl-0 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {leaveBalance.map(b => (
                <tr key={b.type} className="[&:last-child_td]:border-b-0">
                  <td className="py-2 pr-2 pl-0 text-foreground border-b border-border">{b.type}</td>
                  <td className="py-2 pr-2 pl-0 text-foreground border-b border-border text-right">{b.allocated}</td>
                  <td className="py-2 pr-2 pl-0 text-foreground border-b border-border text-right">{b.used}</td>
                  <td className="py-2 pr-2 pl-0 text-foreground border-b border-border text-right font-semibold text-primary">{b.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={cn("bg-card rounded-lg border border-border shadow-sm", "hover-lift", "animate-fade-in-up")} style={{ animationDelay: "360ms" }}>
        <div className="flex items-center justify-between py-4 px-5 border-b border-border">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Bell size={16} className="text-primary"/> Notifications</h3>
          <span className="text-xs text-primary bg-secondary py-0.5 px-2 rounded-full">{NOTIFICATIONS.length} new</span>
        </div>
        <div className="max-h-[220px] overflow-y-auto divide-y divide-border">
          {NOTIFICATIONS.map((n,i) => (
            <div key={i} className="flex gap-3 py-3 px-5 transition-colors duration-150 hover:bg-muted/30">
              <n.icon size={16} className={cn("mt-0.5 shrink-0", n.c)}/>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{n.t}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.d}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { count: myPendingLeaves.length, label:"Your Pending Leave Requests", module:"leave", delay: 480 },
          { count: myOpenTickets, label:"Your Open Service Desk Tickets", module:"servicedesk", delay: 520 },
        ].map(t => (
          <button key={t.label} onClick={() => onNavigate(t.module)}
            style={{ animationDelay: `${t.delay}ms` }}
            className={cn("text-left bg-card rounded-lg border border-border shadow-sm p-4 transition-all duration-200 hover:shadow-md hover:border-primary hover:-translate-y-0.5", "animate-fade-in-up")}>
            <p className="text-2xl font-bold text-foreground"><CountUp value={t.count}/></p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{t.label}</p>
          </button>
        ))}
        <button onClick={() => onNavigate("holidays")}
          style={{ animationDelay: "560ms" }}
          className={cn("text-left bg-card rounded-lg border border-border shadow-sm p-4 transition-all duration-200 hover:shadow-md hover:border-primary hover:-translate-y-0.5", "animate-fade-in-up")}>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Upcoming Holidays</p>
          <div className="flex flex-col gap-1">
            {upcomingHolidays.map(h => (
              <p key={h.id} className="text-xs text-foreground flex items-center justify-between">
                <span className="truncate">{h.name}</span>
                <span className="text-muted-foreground shrink-0 ml-2">{h.date}</span>
              </p>
            ))}
          </div>
        </button>
      </div>

      <div className={cn("bg-card rounded-lg border border-border shadow-sm", "hover-lift", "animate-fade-in-up")} style={{ animationDelay: "620ms" }}>
        <div className="flex items-center justify-between py-4 px-5 border-b border-border">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Bell size={16} className="text-primary"/> Announcements</h3>
          <Btn variant="ghost" size="xs"><Plus size={12}/> New</Btn>
        </div>
        <div className="divide-y divide-border">
          {announcements.map(a => (
            <div key={a.id} className="py-3 px-5 transition-colors duration-150 hover:bg-muted/30">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <StatusBadge status={a.priority}/>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.desc}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{a.date} · {a.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
