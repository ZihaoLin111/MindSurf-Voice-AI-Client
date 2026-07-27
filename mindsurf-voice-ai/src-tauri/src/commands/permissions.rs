use crate::error::{AppError, CommandResult};

#[tauri::command]
pub fn open_permission_settings() -> CommandResult<()> {
    #[cfg(target_os = "windows")]
    {
        match std::process::Command::new("explorer.exe")
            .arg("ms-settings:privacy-microphone")
            .spawn()
        {
            Ok(_) => CommandResult::success(()),
            Err(_) => CommandResult::failure(AppError::new(
                "permission_settings_unavailable",
                "unable to open Windows microphone settings",
                true,
            )),
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        CommandResult::failure(AppError::new(
            "unsupported_platform",
            "microphone settings are only implemented for Windows",
            false,
        ))
    }
}
