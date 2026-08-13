import { BESPOKE_CATS } from "./servicedesk.mock";

export function validateNewTicketForm(category, form, categoryDetails) {
  const errors = {};
  if (!category) { errors.category = "Please select a category"; return errors; }

  if (!BESPOKE_CATS.includes(category)) {
    if (!form.subCategory) errors.subCategory = "Please select a sub category";
    if (!form.description || !form.description.trim()) errors.description = "Please enter a description";
    return errors;
  }

  if (category === "Visitor Lunch" && !categoryDetails.lunchRequestType) errors.lunchRequestType = "Please select a lunch request type";
  if (category === "Repair and Maintenance" && !categoryDetails.repairItem) errors.repairItem = "Please select a repair item";
  if (category === "Access Request/ID Card" && !categoryDetails.bloodGroup) errors.bloodGroup = "Please select a blood group";
  if (category === "Stationery" && (!categoryDetails.stationeryCategory || !categoryDetails.stationeryItem)) errors.stationery = "Please select a stationery category and item";
  return errors;
}
