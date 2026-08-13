// Dropdown option sets for the category-specific extra fields shown in the
// Raise Ticket form (ID Card / Lunch / Repair and Maintenance / Stationary),
// ported from the legacy TMS HR Helpdesk request-detail pages.
export const ID_CARD_REQUEST_TYPES = ["New ID Card", "Damaged ID Card", "Lost ID Card", "Renew ID Card"];

export const LUNCH_REQUEST_TYPES = ["Self Lunch", "Guest Lunch", "Extra Count"];

export const REPAIR_ITEMS = ["Air Conditioner", "Chair", "Desk", "Computer", "Printer", "Electrical Fitting", "Plumbing", "Other"];

export const FLOORS = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor"];

export const STATIONARY_UNITS = ["Pcs", "Box", "Ream", "Pack"];

export const STATIONARY_CATEGORY_ITEMS = {
  "Paper Products": ["A4 Paper", "A3 Paper", "Notebook", "Sticky Notes"],
  "Writing Instruments": ["Ball Pen", "Marker", "Highlighter", "Pencil"],
  "Office Supplies": ["Stapler", "Stapler Pins", "Paper Clips", "File Folder"],
  "Printer Consumables": ["Toner Cartridge", "Ink Cartridge", "Drum Unit"],
};

export const STATIONARY_CATEGORIES = Object.keys(STATIONARY_CATEGORY_ITEMS);
