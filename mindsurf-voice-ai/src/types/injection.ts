export type TextInjectionStatus =
  "idle" | "waiting" | "injecting" | "succeeded" | "partial" | "failed";

export interface TextInjectionReport {
  requestedCodePoints: number;
  injectedCodePoints: number;
  remainingText: string;
  elapsedMs: number;
  complete: boolean;
  errorCode: string | null;
}
