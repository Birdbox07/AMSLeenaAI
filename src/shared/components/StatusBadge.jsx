import { cn } from "../utils/cn";
import "./StatusBadge.css";

export function StatusBadge({ status }) {
  const map = {
    Active: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    "On Leave": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    Present: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    Absent: "bg-red-100 text-red-700",
    Late: "bg-orange-100 text-orange-700",
    Leave: "bg-blue-100 text-blue-700",
    Holiday: "bg-purple-100 text-purple-700",
    WFH: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    "On Duty": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    "Forgot to Swipe": "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    Approved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    Rejected: "bg-red-100 text-red-700",
    Available: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    Booked: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    "My Booking": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    Past: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
    Open: "bg-red-100 text-red-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    Closed: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    Low: "bg-gray-100 text-gray-700",
    Medium: "bg-blue-100 text-blue-700",
    High: "bg-orange-100 text-orange-700",
    Critical: "bg-red-100 text-red-700",
    "Not Started": "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    "In Progress (course)": "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    National: "bg-purple-100 text-purple-700",
    Regional: "bg-teal-100 text-teal-700",
    Optional: "bg-yellow-100 text-yellow-700",
    "": "bg-gray-100 text-gray-600",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold", map[status] || map[""])}>
      {status}
    </span>
  );
}
