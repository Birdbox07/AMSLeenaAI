import { useState, useMemo } from "react";
import { Clock, Calendar, Users, Headphones, RefreshCw, RotateCcw, Repeat, Gift, Briefcase, Home, MapPin } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { LEAVE_TYPES } from "../../shared/mock/constants";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { DataTable } from "../../shared/components/DataTable";
import { useLeaveQuery } from "../leave/hooks/useLeaveQuery";
import { useEmployeesQuery } from "../employees/hooks/useEmployeesQuery";
import { useServiceDeskQuery } from "../servicedesk/hooks/useServiceDeskQuery";
import { useAttendance } from "../attendance/hooks/useAttendance";
import { LEAVE_TYPE_BY_EMP_DATE } from "../leave/leave.mock";
import { useRegularizationQuery } from "../attendance/hooks/useRegularizationQuery";
import { useShiftChangeQuery } from "../attendance/hooks/useShiftChangeQuery";
import { useCompOffQuery } from "../leave/hooks/useCompOffQuery";
import { useOnDutyQuery } from "../leave/hooks/useOnDutyQuery";
import { useWfhQuery } from "../leave/hooks/useWfhQuery";
import { useLocationQuery } from "../location/hooks/useLocationQuery";
import "./reports.css";

export default function ReportsPage() {
  const { data: leaves } = useLeaveQuery();
  const { data: employees } = useEmployeesQuery();
  const { data: tickets } = useServiceDeskQuery();
  const { data: regularizations } = useRegularizationQuery();
  const { data: shiftChanges } = useShiftChangeQuery();
  const { data: compOffs } = useCompOffQuery();
  const { data: onDutyRequests } = useOnDutyQuery();
  const { data: wfhRequests } = useWfhQuery();
  const { data: checkIns } = useLocationQuery();
  const ATTENDANCE = useAttendance();
  const [reportTab, setReportTab] = useState("attendance");
  const [leaveFrom, setLeaveFrom] = useState("");
  const [leaveTo, setLeaveTo] = useState("");
  const [attLeaveType, setAttLeaveType] = useState("");

  const filteredLeaves = useMemo(() => leaves.filter(l =>
    (!leaveFrom || l.toDate >= leaveFrom) &&
    (!leaveTo || l.fromDate <= leaveTo)
  ), [leaves, leaveFrom, leaveTo]);

  const filteredAttendance = useMemo(() => ATTENDANCE.slice(0,100).filter(r =>
    !attLeaveType || LEAVE_TYPE_BY_EMP_DATE.get(`${r.employeeId}_${r.date}`) === attLeaveType
  ), [ATTENDANCE, attLeaveType]);

  const reportCols = {
    attendance: [
      { key:"employeeName", label:"Employee" },
      { key:"date", label:"Date" },
      { key:"status", label:"Status", render: (r) => <StatusBadge status={r.status}/> },
      { key:"hours", label:"Hours" },
    ],
    leave: [
      { key:"leaveNumber", label:"Leave No." },
      { key:"employeeName", label:"Employee" },
      { key:"leaveType", label:"Type" },
      { key:"days", label:"Days" },
      { key:"status", label:"Status", render: (r) => <StatusBadge status={r.status}/> },
    ],
    employee: [
      { key:"empCode", label:"Emp Code" },
      { key:"name", label:"Name" },
      { key:"department", label:"Department" },
      { key:"designation", label:"Designation" },
      { key:"location", label:"Location" },
      { key:"status", label:"Status", render: (r) => <StatusBadge status={r.status}/> },
    ],
    servicedesk: [
      { key:"ticketNumber", label:"Ticket #" },
      { key:"subject", label:"Subject" },
      { key:"priority", label:"Priority", render: (r) => <StatusBadge status={r.priority}/> },
      { key:"status", label:"Status", render: (r) => <StatusBadge status={r.status}/> },
      { key:"createdDate", label:"Date" },
    ],
    regularization: [
      { key:"requestNumber", label:"Request #" },
      { key:"employeeName", label:"Employee" },
      { key:"date", label:"Date" },
      { key:"session", label:"Session" },
      { key:"reason", label:"Reason" },
      { key:"status", label:"Status", render: (r) => <StatusBadge status={r.status}/> },
    ],
    shiftchange: [
      { key:"requestNumber", label:"Request #" },
      { key:"employeeName", label:"Employee" },
      { key:"currentShift", label:"Current Shift" },
      { key:"requestedShift", label:"Requested Shift" },
      { key:"effectiveDate", label:"Effective Date" },
      { key:"reason", label:"Reason" },
      { key:"status", label:"Status", render: (r) => <StatusBadge status={r.status}/> },
    ],
    compoff: [
      { key:"employeeName", label:"Employee" },
      { key:"date", label:"Date" },
      { key:"type", label:"Type", render: (r) => <StatusBadge status={r.type}/> },
      { key:"days", label:"Days" },
      { key:"reason", label:"Reason" },
      { key:"status", label:"Status", render: (r) => <StatusBadge status={r.status}/> },
    ],
    onduty: [
      { key:"requestNumber", label:"Request #" },
      { key:"employeeName", label:"Employee" },
      { key:"fromDate", label:"From Date" },
      { key:"toDate", label:"To Date" },
      { key:"days", label:"Days" },
      { key:"reason", label:"Reason" },
      { key:"status", label:"Status", render: (r) => <StatusBadge status={r.status}/> },
    ],
    wfh: [
      { key:"requestNumber", label:"Request #" },
      { key:"employeeName", label:"Employee" },
      { key:"fromDate", label:"From Date" },
      { key:"toDate", label:"To Date" },
      { key:"days", label:"Days" },
      { key:"reason", label:"Reason" },
      { key:"status", label:"Status", render: (r) => <StatusBadge status={r.status}/> },
    ],
    location: [
      { key:"employeeName", label:"Employee" },
      { key:"date", label:"Date" },
      { key:"time", label:"Time" },
      { key:"address", label:"Address" },
      { key:"status", label:"Status", render: (r) => <StatusBadge status={r.status}/> },
    ],
  };

  const tabs = [
    { id:"attendance", label:"Attendance Report", icon:Clock },
    { id:"leave", label:"Leave Report", icon:Calendar },
    { id:"employee", label:"Employee Report", icon:Users },
    { id:"servicedesk", label:"Service Desk Report", icon:Headphones },
    { id:"regularization", label:"Regularization Report", icon:RotateCcw },
    { id:"shiftchange", label:"Shift Change Report", icon:Repeat },
    { id:"compoff", label:"Comp-Off Report", icon:Gift },
    { id:"onduty", label:"On-Duty Report", icon:Briefcase },
    { id:"wfh", label:"WFH Report", icon:Home },
    { id:"location", label:"Location Tracker Report", icon:MapPin },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className={cn("text-lg font-bold text-foreground", "animate-fade-in-up")} style={{ animationDelay: "0ms" }}>Reports</h2>
      <div className={cn("flex gap-1 flex-wrap bg-muted p-1 rounded-lg w-fit", "animate-fade-in-up")} style={{ animationDelay: "60ms" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setReportTab(t.id)}
            className={cn("flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-colors border-none cursor-pointer bg-transparent text-muted-foreground hover:text-foreground", reportTab===t.id && "bg-card! shadow text-foreground!")}>
            <t.icon size={14}/> {t.label}
          </button>
        ))}
      </div>
      {reportTab==="attendance" && (
        <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <div className={cn("bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-end", "hover-lift")}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Leave Type</label>
              <select value={attLeaveType} onChange={e=>setAttLeaveType(e.target.value)}
                className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background min-w-[150px] focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">All Types</option>
                {LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            {attLeaveType && (
              <button onClick={() => setAttLeaveType("")}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded transition-colors text-foreground border border-transparent bg-transparent cursor-pointer hover:bg-muted">
                <RefreshCw size={13}/> Reset
              </button>
            )}
          </div>
          <DataTable columns={reportCols.attendance} data={filteredAttendance} title="Attendance Report"/>
        </div>
      )}
      {reportTab==="leave" && (
        <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <div className={cn("bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-end", "hover-lift")}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">From Date</label>
              <input type="date" value={leaveFrom} onChange={e=>setLeaveFrom(e.target.value)}
                className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"/>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">To Date</label>
              <input type="date" value={leaveTo} onChange={e=>setLeaveTo(e.target.value)}
                className="border border-border rounded-md py-1.5 px-3 text-sm bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"/>
            </div>
            {(leaveFrom || leaveTo) && (
              <button onClick={() => { setLeaveFrom(""); setLeaveTo(""); }}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded transition-colors text-foreground border border-transparent bg-transparent cursor-pointer hover:bg-muted">
                <RefreshCw size={13}/> Reset
              </button>
            )}
          </div>
          <DataTable columns={reportCols.leave} data={filteredLeaves} title="Leave Report"/>
        </div>
      )}
      {reportTab==="employee" && <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}><DataTable columns={reportCols.employee} data={employees} title="Employee Report"/></div>}
      {reportTab==="servicedesk" && <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}><DataTable columns={reportCols.servicedesk} data={tickets} title="Service Desk Report"/></div>}
      {reportTab==="regularization" && <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}><DataTable columns={reportCols.regularization} data={regularizations} title="Regularization Report"/></div>}
      {reportTab==="shiftchange" && <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}><DataTable columns={reportCols.shiftchange} data={shiftChanges} title="Shift Change Report"/></div>}
      {reportTab==="compoff" && <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}><DataTable columns={reportCols.compoff} data={compOffs} title="Comp-Off Report"/></div>}
      {reportTab==="onduty" && <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}><DataTable columns={reportCols.onduty} data={onDutyRequests} title="On-Duty Report"/></div>}
      {reportTab==="wfh" && <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}><DataTable columns={reportCols.wfh} data={wfhRequests} title="WFH Report"/></div>}
      {reportTab==="location" && <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}><DataTable columns={reportCols.location} data={checkIns} title="Location Tracker Report"/></div>}
    </div>
  );
}
