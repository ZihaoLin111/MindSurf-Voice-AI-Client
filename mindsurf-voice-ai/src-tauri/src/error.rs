use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct AppError {
    pub code: String,
    pub message: String,
    pub recoverable: bool,
}

impl AppError {
    pub fn new(code: impl Into<String>, message: impl Into<String>, recoverable: bool) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            recoverable,
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(untagged)]
pub enum CommandResult<T> {
    Success { ok: bool, data: T },
    Failure { ok: bool, error: AppError },
}

impl<T> CommandResult<T> {
    pub fn success(data: T) -> Self {
        Self::Success { ok: true, data }
    }

    pub fn failure(error: AppError) -> Self {
        Self::Failure { ok: false, error }
    }
}

#[cfg(test)]
mod tests {
    use super::{AppError, CommandResult};

    #[test]
    fn failure_has_stable_shape() {
        let result: CommandResult<()> =
            CommandResult::failure(AppError::new("test_error", "test failed", true));
        let value = serde_json::to_value(result).expect("error should serialize");

        assert_eq!(value["ok"], false);
        assert_eq!(value["error"]["code"], "test_error");
        assert_eq!(value["error"]["recoverable"], true);
    }
}
