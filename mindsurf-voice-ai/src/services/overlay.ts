import { invoke } from "@tauri-apps/api/core";
import { emitTo, listen, type UnlistenFn } from "@tauri-apps/api/event";

import type { CommandResult } from "../types/app";
import type { OverlaySnapshot } from "../types/overlay";
import type { OverlayPosition } from "../types/voice";

async function invokeOverlayCommand(command: string, args?: Record<string, unknown>) {
  try {
    const result = await invoke<CommandResult<void>>(command, args);
    return result.ok;
  } catch {
    return false;
  }
}

export function setOverlayWindowPosition(position: OverlayPosition) {
  return invokeOverlayCommand("set_overlay_position", { position });
}

export function showOverlayWindow() {
  return invokeOverlayCommand("show_overlay");
}

export function hideOverlayWindow() {
  return invokeOverlayCommand("hide_overlay");
}

export async function publishOverlaySnapshot(snapshot: OverlaySnapshot) {
  try {
    await emitTo("overlay", "overlay://state", snapshot);
  } catch {
    // The event API is unavailable in a regular browser preview.
  }
}

export async function subscribeOverlayActions(callbacks: {
  onCancel: () => void;
  onReady: () => void;
}): Promise<UnlistenFn> {
  const unlisteners: UnlistenFn[] = [];
  try {
    unlisteners.push(
      await listen("overlay://cancel", () => {
        callbacks.onCancel();
      }),
    );
    unlisteners.push(
      await listen("overlay://ready", () => {
        callbacks.onReady();
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

export async function subscribeOverlayState(
  onSnapshot: (snapshot: OverlaySnapshot) => void,
) {
  return listen<OverlaySnapshot>("overlay://state", (event) => {
    onSnapshot(event.payload);
  });
}

export async function notifyOverlayReady() {
  try {
    await emitTo("main", "overlay://ready");
  } catch {
    // The event API is unavailable in a regular browser preview.
  }
}

export async function requestOverlayCancel() {
  try {
    await emitTo("main", "overlay://cancel");
  } catch {
    // The event API is unavailable in a regular browser preview.
  }
}
