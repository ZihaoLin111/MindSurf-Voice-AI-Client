export type ShortcutBinding =
  "ctrl_win" | "ctrl_alt_space" | "ctrl_shift_space" | "ctrl_win_space";

export type ShortcutListenerStatus = "starting" | "running" | "error";

export interface ShortcutStatus {
  binding: ShortcutBinding;
  display: string;
  enabled: boolean;
  listenerStatus: ShortcutListenerStatus;
  lastError: string | null;
}

export interface RecordShortcutEvent {
  shortcut: string;
  timestamp_ms: number;
}

export interface CancelShortcutEvent {
  timestamp_ms: number;
}
