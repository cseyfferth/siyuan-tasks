import { TaskDisplayMode } from "@/types/tasks";
import { writable, get } from "svelte/store";
import { SettingsDTO } from "@/types/dto/settings.dto";

export enum PluginSetting {
  AutoRefresh = "autoRefresh",
  RefreshInterval = "refreshInterval",
  ShowCompleted = "showCompleted",
  MaxTasks = "maxTasks",
  SortBy = "sortBy",
  DisplayMode = "displayMode",
}

// Minimum refresh interval in seconds
export const MIN_REFRESH_INTERVAL = 5;

export interface PluginConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  showCompleted: boolean;
  maxTasks: number;
  sortBy: string;
  displayMode: TaskDisplayMode;
  loading: boolean;
}

function createConfigStore() {
  const { subscribe, set, update } = writable<PluginConfig>({
    autoRefresh: false,
    refreshInterval: 30,
    showCompleted: true,
    maxTasks: 2000,
    sortBy: "created",
    displayMode: TaskDisplayMode.ONLY_TASKS,
    loading: true,
  });

  return {
    subscribe,
    set,
    update,
    setLoading: (loading: boolean) =>
      update((config) => ({ ...config, loading })),

    // Dynamic setter that works with any PluginSetting key
    setSetting: (key: PluginSetting, value: unknown) =>
      update((config) => {
        switch (key) {
          case PluginSetting.AutoRefresh:
            if (typeof value !== "boolean") {
              return config;
            }
            return { ...config, autoRefresh: value };
          case PluginSetting.RefreshInterval:
            if (typeof value !== "number") {
              return config;
            }
            return {
              ...config,
              refreshInterval: Math.max(value, MIN_REFRESH_INTERVAL),
            };
          case PluginSetting.ShowCompleted:
            if (typeof value !== "boolean") {
              return config;
            }
            return { ...config, showCompleted: value };
          case PluginSetting.MaxTasks:
            if (typeof value !== "number") {
              return config;
            }
            return { ...config, maxTasks: value };
          case PluginSetting.SortBy:
            if (typeof value !== "string") {
              return config;
            }
            return { ...config, sortBy: value };
          case PluginSetting.DisplayMode:
            if (
              !Object.values(TaskDisplayMode).includes(value as TaskDisplayMode)
            ) {
              return config;
            }
            return { ...config, displayMode: value as TaskDisplayMode };
          default:
            return config;
        }
      }),

    // Get current settings as an object for saving
    getSettingsObject: () => {
      const config = get({ subscribe });
      return {
        [PluginSetting.AutoRefresh]: config.autoRefresh,
        [PluginSetting.RefreshInterval]: config.refreshInterval,
        [PluginSetting.ShowCompleted]: config.showCompleted,
        [PluginSetting.MaxTasks]: config.maxTasks,
        [PluginSetting.SortBy]: config.sortBy,
        [PluginSetting.DisplayMode]: config.displayMode,
      };
    },

    setFromSettingsDTO: (settings: SettingsDTO) => {
      update((config) => ({
        ...config,
        autoRefresh: settings.autoRefresh,
        refreshInterval: settings.refreshInterval,
        showCompleted: settings.showCompleted,
        maxTasks: settings.maxTasks,
        sortBy: settings.sortBy,
        displayMode: settings.displayMode,
      }));
    },
  };
}

export const configStore = createConfigStore();
