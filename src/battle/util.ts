import { TimelineEntry } from "./battleTypes"

export function buildMinHeap(entries: TimelineEntry[]): TimelineEntry[] {
  return entries.sort((a, b) => a.nextActionAV - b.nextActionAV)
}

export function popMin(heap: TimelineEntry[]): TimelineEntry {
  return heap.shift()!
}
