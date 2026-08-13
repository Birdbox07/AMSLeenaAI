import { seed, genDate } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

export const COURSE_NAMES = [
  "React Advanced Patterns","Python for Data Science","Leadership Essentials","MS Excel Mastery",
  "Cybersecurity Fundamentals","Agile & Scrum Master","Communication Skills","Financial Modelling",
  "SQL for Analysts","Cloud Computing AWS","Project Management PMP","Design Thinking",
  "Emotional Intelligence","Power BI Dashboard","DevOps Fundamentals","Public Speaking",
];

export function genCourses() {
  const instructors = ["Dr. Rajesh Kumar","Prof. Anita Sharma","Mr. Suresh Iyer","Ms. Priya Nair"];
  return Array.from({ length: 40 }, (_, i) => {
    const emp = EMPLOYEES[Math.floor(seed(i*7)*EMPLOYEES.length)];
    const prog = Math.floor(seed(i*11)*101);
    const sts = prog === 0 ? "Not Started" : prog === 100 ? "Completed" : "In Progress";
    return {
      id: `CRS${i+1}`, courseName: COURSE_NAMES[i%COURSE_NAMES.length],
      category: ["Technical","Soft Skills","Finance","Compliance","Leadership"][i%5],
      duration: `${Math.floor(seed(i*13)*20)+4}h`,
      progress: prog, status: sts,
      instructor: instructors[Math.floor(seed(i*17)*instructors.length)],
      employeeName: emp.name, dueDate: genDate(-Math.floor(seed(i*19)*60)),
    };
  });
}

export const COURSES = genCourses();
