import {
  LayoutDashboard, Users, Clock, Calendar, FileText,
  Headphones, BarChart2, Settings, MapPin, LayoutGrid,
} from "lucide-react";

// Flat items render directly in the sidebar. Items with `children` render as a
// collapsible dropdown group (grouping related modules to keep the sidebar
// from growing one row per feature).
export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "employees", label: "Employee Directory", icon: Users },
  {
    id: "attendance-group", label: "Attendance", icon: Clock,
    children: [
      { id: "attendance", label: "Attendance & Regularization", icon: Clock },
      { id: "location", label: "Location Tracker", icon: MapPin },
    ],
  },
  { id: "leave", label: "Leave Management", icon: Calendar, badge: 14 },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "servicedesk", label: "Service Desk", icon: Headphones, badge: 32 },
  { id: "services", label: "Services", icon: LayoutGrid },
  { id: "reports", label: "Reports", icon: BarChart2, minRole: "Manager" },
  { id: "settings", label: "Settings", icon: Settings },
];

// Flattened leaf list (groups expanded to their children) — used for
// breadcrumb/label lookups and anywhere a plain module-id -> label mapping
// is needed (e.g. TopNav).
export const FLAT_NAV_ITEMS = NAV_ITEMS.flatMap(item => item.children ? item.children : [item]);

export function findNavLabel(moduleId) {
  return FLAT_NAV_ITEMS.find(n => n.id === moduleId)?.label || "Dashboard";
}

// Given an active module id, returns the id of the group it belongs to (if any).
export function findParentGroupId(moduleId) {
  const group = NAV_ITEMS.find(item => item.children?.some(c => c.id === moduleId));
  return group?.id || null;
}
