import { getFile, putFile, readDir, removeFile } from "../api";
import { Logger } from "./logger.service";

export interface TodayTaskData {
  isToday: true;
}

export class TaskMetadataService {
  private static readonly STORAGE_BASE_PATH =
    "/data/storage/petal/siyuan-tasks";

  /**
   * Get the file path for a specific task's today metadata
   */
  private static getTaskFilePath(taskId: string): string {
    return `${this.STORAGE_BASE_PATH}/task-${taskId}.json`;
  }

  /**
   * Check if a task is marked as today
   */
  static async isTaskToday(taskId: string): Promise<boolean> {
    try {
      const filePath = this.getTaskFilePath(taskId);
      const data = await getFile<TodayTaskData>(filePath);
      return data && data.isToday === true;
    } catch (error) {
      // File doesn't exist or other error - task is not today
      return false;
    }
  }

  /**
   * Add a task to today's tasks
   */
  static async addTaskToToday(taskId: string): Promise<void> {
    try {
      const filePath = this.getTaskFilePath(taskId);
      const data: TodayTaskData = {
        isToday: true,
      };

      await putFile(
        filePath,
        false,
        new Blob([JSON.stringify(data)], { type: "application/json" })
      );
      Logger.info(`Added task ${taskId} to today's tasks`);
    } catch (error) {
      Logger.error(`Failed to add task ${taskId} to today's tasks:`, error);
      throw error;
    }
  }

  /**
   * Remove a task from today's tasks
   */
  static async removeTaskFromToday(taskId: string): Promise<void> {
    try {
      const filePath = this.getTaskFilePath(taskId);
      await removeFile(filePath);
      Logger.info(`Removed task ${taskId} from today's tasks`);
    } catch (error) {
      Logger.error(
        `Failed to remove task ${taskId} from today's tasks:`,
        error
      );
      throw error;
    }
  }

  /**
   * Toggle a task's today status
   */
  static async toggleTaskToday(taskId: string): Promise<boolean> {
    const isToday = await this.isTaskToday(taskId);

    if (isToday) {
      await this.removeTaskFromToday(taskId);
      return false;
    } else {
      await this.addTaskToToday(taskId);
      return true;
    }
  }

  /**
   * Load all task IDs that are marked as today
   */
  static async loadTodayTaskIds(): Promise<string[]> {
    try {
      const dirData = await readDir(this.STORAGE_BASE_PATH);
      if (!dirData || !dirData.data || !Array.isArray(dirData.data)) {
        return [];
      }

      const todayTaskIds: string[] = [];

      for (const item of dirData.data) {
        if (item.isDir || !item.name.endsWith(".json")) {
          continue;
        }

        // Extract task ID from filename (remove .json extension)
        const taskId = item.name.replace(".json", "");

        // Verify the file contains valid today task data
        try {
          const filePath = `${this.STORAGE_BASE_PATH}/${item.name}`;
          const data = await getFile<TodayTaskData>(filePath);
          if (data && data.isToday === true) {
            todayTaskIds.push(taskId);
          }
        } catch (error) {
          // Skip invalid files
          Logger.warn(`Invalid today task file: ${item.name}`);
        }
      }

      return todayTaskIds;
    } catch (error) {
      // Directory doesn't exist yet - no today tasks
      Logger.debug("Today tasks directory doesn't exist yet");
      return [];
    }
  }

  /**
   * Get count of today tasks
   */
  static async getTodayTasksCount(): Promise<number> {
    const todayTaskIds = await this.loadTodayTaskIds();
    return todayTaskIds.length;
  }
}
