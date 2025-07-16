import { PluginConfig, PluginSetting } from "@/stores/config.store";
import { TaskDisplayMode } from "../tasks";

export const DEFAULT_SETTINGS = {
  autoRefresh: false,
  refreshInterval: 30,
  showCompleted: true,
  maxTasks: 2000,
  sortBy: "created",
  displayMode: TaskDisplayMode.ONLY_TASKS,
};

export class SettingsDTO {
  constructor(
    public readonly autoRefresh: boolean,
    public readonly refreshInterval: number,
    public readonly showCompleted: boolean,
    public readonly maxTasks: number,
    public readonly sortBy: string,
    public readonly displayMode: TaskDisplayMode
  ) {}
}

export const createDefaultSettingsDTO = (): SettingsDTO => {
  return new SettingsDTO(
    DEFAULT_SETTINGS.autoRefresh,
    DEFAULT_SETTINGS.refreshInterval,
    DEFAULT_SETTINGS.showCompleted,
    DEFAULT_SETTINGS.maxTasks,
    DEFAULT_SETTINGS.sortBy,
    DEFAULT_SETTINGS.displayMode
  );
};

export const createFromObject = (
  settings: Partial<PluginConfig>
): SettingsDTO => {
  return new SettingsDTO(
    settings[PluginSetting.AutoRefresh] ?? DEFAULT_SETTINGS.autoRefresh,
    settings[PluginSetting.RefreshInterval] ?? DEFAULT_SETTINGS.refreshInterval,
    settings[PluginSetting.ShowCompleted] ?? DEFAULT_SETTINGS.showCompleted,
    settings[PluginSetting.MaxTasks] ?? DEFAULT_SETTINGS.maxTasks,
    settings[PluginSetting.SortBy] ?? DEFAULT_SETTINGS.sortBy,
    settings[PluginSetting.DisplayMode] ?? DEFAULT_SETTINGS.displayMode
  );
};

export const createFromSettingsStore = (
  settings: PluginConfig
): SettingsDTO => {
  return new SettingsDTO(
    settings.autoRefresh,
    settings.refreshInterval,
    settings.showCompleted,
    settings.maxTasks,
    settings.sortBy,
    settings.displayMode
  );
};
