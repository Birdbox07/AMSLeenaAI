import { seed, genDate } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

export const DOC_TYPES = ["Payslip","Form 16 Part-A","Form 16 Part-B","Increment Letter","Mediclaim","Income Tax declaration"];
export const ALLOWED_DOC_EXTENSIONS = ["pdf","doc","docx","jpg","jpeg","png"];
export const MAX_BULK_FILE_SIZE = 5 * 1024 * 1024;

export function genDocuments() {
  const docTypes = DOC_TYPES;
  const docs = [];
  let id = 1;
  EMPLOYEES.slice(0, 20).forEach(emp => {
    const count = Math.floor(seed(id*7)*4)+2;
    for (let j = 0; j < count; j++) {
      const dt = docTypes[j % docTypes.length];
      docs.push({
        id: `DOC${id++}`, employeeId: emp.id, employeeName: emp.name,
        docType: dt, fileName: `${dt.replace(/ /g,"_")}_${emp.empCode}.pdf`,
        uploadDate: genDate(Math.floor(seed(id*11)*180)),
        size: `${Math.floor(seed(id*13)*900)+100}KB`,
        status: seed(id*17) > 0.2 ? "Available" : "Pending",
      });
    }
  });
  return docs;
}

export const DOCUMENTS = genDocuments();
