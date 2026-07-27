import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

import type { CommandResult } from "../types/app";
import type { MainTabId } from "../types/navigation";
import type { VoiceInteractionMode } from "../types/voice";

const MAIN_TABS = new Set<MainTabId>(["record", "connection", "settings"]);
const VOICE_MODES = new Set<VoiceInteractionMode>(["dictation", "assistant", "mixed"]);

export async function syncTrayMode(mode: VoiceInteractionMode) {
  try {
    const result = await invoke<CommandResult<void>>("set_tray_mode", { mode });
    return result.ok;
  } catch {
    return false;
  }
}

export async function subscribeTrayActions(callbacks: {
  onMode: (mode: VoiceInteractionMode) => void;
  onNavigate: (page: MainTabId) => void;
}): Promise<UnlistenFn> {
  const unlisteners: UnlistenFn[] = [];
  try {
    unlisteners.push(
      await listen<string>("tray://navigate", (event) => {
        if (MAIN_TABS.has(event.payload as MainTabId)) {
          callbacks.onNavigate(event.payload as MainTabId);
        }
      }),
    );
    unlisteners.push(
      await listen<string>("tray://mode", (event) => {
        if (VOICE_MODES.has(event.payload as VoiceInteractionMode)) {
          callbacks.onMode(event.payload as VoiceInteractionMode);
        }
      }),
    );
  } catch (error) {
    for (const unlisten of unlisteners) {
      unlisten();
    }
    throw error;
  }

  return () => {
    for (const unlisten of unlisteners) {
      unlisten();
    }
  };
}
