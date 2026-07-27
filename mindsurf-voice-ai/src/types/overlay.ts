import type { VoiceInteractionMode } from "./voice";

export interface OverlaySnapshot {
  assistantText: string;
  cancellable: boolean;
  duration: string;
  level: number;
  mode: VoiceInteractionMode;
  status: string;
  transcript: string;
}
