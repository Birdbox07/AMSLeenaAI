import { TICKETS } from "./servicedesk.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getTickets() {
  await delay();
  return TICKETS;
}

export async function addTicket(ticket) {
  await delay();
  return ticket;
}

export async function updateTicket(id, patch) {
  await delay();
  return patch;
}

export async function removeTicket(id) {
  await delay();
  return id;
}
