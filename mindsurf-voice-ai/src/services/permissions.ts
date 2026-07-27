import { invoke } from "@tauri-apps/api/core";

import type { CommandResult } from "../types/app";

export async function openMicrophonePermissionSettings(): Promise<CommandResult<null>> {
  try {
    return await invoke<CommandResult<null>>("open_permission_settings");
  } catch {
    return {
      ok: false,
      error: {
        code: "permission_settings_unavailable",
        message: "无法打开 Windows 麦克风设置",
        recoverable: true,
      },
    };
  }
}
