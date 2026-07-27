export interface AppInfo {
  version: string;
  platform: string;
  arch: string;
  buildProfile: string;
}

export interface CommandError {
  code: string;
  message: string;
  recoverable: boolean;
}

export type CommandResult<T> =
  { ok: true; data: T } | { ok: false; error: CommandError };
