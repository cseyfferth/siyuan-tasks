import { TaskStatus, TaskPriority } from "../types/tasks";

/**
 * Service for analyzing task markdown and extracting task-related information.
 *
 * This service handles:
 * - Task status detection (todo/done)
 * - Priority detection from SiYuan emoji indicators
 * - Text extraction and cleaning
 * - Task analysis utilities
 *
 * Priority indicators (SiYuan emoji):
 * - ❗ (type ":!") = High priority (red single chevron up)
 * - ‼️ (type ":!!") = Urgent priority (red double chevron up)
 * - "low" = Low priority (green chevron down)
 * - No indicator = Normal priority (no icon)
 *
 * ```
 */
export class TaskAnalysisService {
  /**
   * Check if a task is a todo item (unchecked)
   */
  static isTodo(markdown: string): boolean {
    return /^-\s*\[ \]/.test(markdown);
  }

  /**
   * Check if a task is a done item (checked)
   */
  static isDone(markdown: string): boolean {
    return /^-\s*\[[xX]\]/.test(markdown);
  }

  /**
   * Detect task status from markdown
   */
  static detectStatus(markdown: string): TaskStatus {
    if (this.isDone(markdown)) return TaskStatus.DONE;
    return TaskStatus.TODO;
  }

  /**
   * Detect priority from fcontent using SiYuan emoji indicators
   */
  static detectPriority(content: string): TaskPriority {
    const lowercaseContent = content.toLowerCase();

    // Urgent priority: ‼️ (double exclamation)
    if (lowercaseContent.includes("‼️")) {
      return TaskPriority.URGENT;
    }

    // High priority: ❗ (single exclamation)
    if (lowercaseContent.includes("❗")) {
      return TaskPriority.HIGH;
    }

    // Wait priority: ⏳ (hourglass)
    if (lowercaseContent.includes("⏳")) {
      return TaskPriority.WAIT;
    }

    return TaskPriority.NORMAL;
  }

  /**
   * Extract clean task text by removing priority indicators
   */
  static extractTaskText(taskText: string = ""): string {
    // Remove priority indicators (❗, ‼️, ⏳)
    taskText = taskText.replace(/[\u2757\u203c\u23f3]|\ufe0f/g, "").trim();

    // Convert SiYuan's internal hash tag format from #MyHash# to #MyHash
    taskText = taskText.replace(/#([^#]+)#/g, "#$1");

    return taskText;
  }
}
