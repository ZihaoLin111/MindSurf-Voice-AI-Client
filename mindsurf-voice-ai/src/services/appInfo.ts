import { invoke } from "@tauri-apps/api/core";

import type { AppInfo, CommandResult } from "../types/app";

export async function getAppInfo(): Promise<CommandResult<AppInfo>> {
  try {
    return await invoke<CommandResult<AppInfo>>("get_app_info");
  } catch {
    return {
      ok: false,
      error: {
        code: "app_info_unavailable",
        message: "无法读取应用构建信息",
        recoverable: true,
      },
    };
  }
}
