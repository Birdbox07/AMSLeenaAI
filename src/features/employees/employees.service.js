import { EMPLOYEES } from "./employees.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

// Async functions shaped like a future real fetch() call, resolving from
// the mock data module for now.
export async function getEmployees() {
  await delay();
  return EMPLOYEES;
}

export async function addEmployee(employee) {
  await delay();
  return employee;
}

export async function updateEmployee(id, patch) {
  await delay();
  return patch;
}

export async function removeEmployee(id) {
  await delay();
  return id;
}
