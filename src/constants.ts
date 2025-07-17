import { TaskDisplayMode } from "./types/tasks";

export const STORAGE_NAME = "plugin-tasks";
export const TASK_DOCK_TYPE = "task-list-panel-dock";

export const DEFAULT_SETTINGS = {
  autoRefresh: false,
  refreshInterval: 30,
  showCompleted: true,
  maxTasks: 1000,
  sortBy: "created",
  displayMode: TaskDisplayMode.ONLY_TASKS,
};
