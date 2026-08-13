import { ALLOWED_DOC_EXTENSIONS, MAX_BULK_FILE_SIZE } from "./documents.mock";

export function validateUploadForm(form) {
  const errors = {};
  if (!form.fileName || !form.fileName.trim()) errors.fileName = "Please enter a file name";
  return errors;
}

export function validateBulkFile(file) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_DOC_EXTENSIONS.includes(ext)) return `Unsupported file type (.${ext})`;
  if (file.size > MAX_BULK_FILE_SIZE) return "File exceeds 5MB limit";
  return undefined;
}
