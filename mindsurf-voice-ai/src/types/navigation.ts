export type MainTabId = "record" | "connection" | "settings";

export interface MainTab {
  id: MainTabId;
  label: string;
}
