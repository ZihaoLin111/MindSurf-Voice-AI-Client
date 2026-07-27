use serde::Serialize;

use crate::error::{AppError, CommandResult};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppInfo {
    version: &'static str,
    platform: &'static str,
    arch: &'static str,
    build_profile: &'static str,
}

#[tauri::command]
pub fn get_app_info() -> CommandResult<AppInfo> {
    let version = env!("CARGO_PKG_VERSION");

    if version.trim().is_empty() {
        return CommandResult::failure(AppError::new(
            "app_info_unavailable",
            "package version is missing",
            false,
        ));
    }

    CommandResult::success(AppInfo {
        version,
        platform: std::env::consts::OS,
        arch: std::env::consts::ARCH,
        build_profile: if cfg!(debug_assertions) {
            "debug"
        } else {
            "release"
        },
    })
}

#[cfg(test)]
mod tests {
    use super::get_app_info;

    #[test]
    fn app_info_uses_package_version() {
        let result = get_app_info();
        let value = serde_json::to_value(result).expect("app info should serialize");

        assert_eq!(value["ok"], true);
        assert_eq!(value["data"]["version"], env!("CARGO_PKG_VERSION"));
    }
}
