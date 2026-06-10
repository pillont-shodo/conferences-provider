import type { Conference } from "./Conference";

export function filterConferences(list: Conference[], term: string): Conference[] {
  return list.filter(conference => conference.name.toLowerCase().includes(term.toLowerCase()));
}