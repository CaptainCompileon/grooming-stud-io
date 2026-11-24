export interface RequestLogEntry {
  route: string;
  requestId: string;
  status: number;
  durationMs: number;
  payloadBytes: number;
  attempts?: number;
  reason?: string;
  errorName?: string;
}

/** The only logging path for route handlers. Entries must never contain request content. */
export function logRequest(entry: RequestLogEntry): void {
  console.info(JSON.stringify(entry));
}
