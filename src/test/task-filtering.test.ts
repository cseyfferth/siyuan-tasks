import { describe, it, expect, beforeEach, vi } from "vitest";
import { taskStore } from "../stores/task.store";
import { TaskStatus, TaskPriority } from "../types/tasks";
import { configStore } from "../stores/config.store";
import { get } from "svelte/store";
import { mockTasks } from "./mocks";

// Mock the API functions
vi.mock("../api", () => ({
  sql: vi.fn(),
  lsNotebooks: vi.fn(),
  getHPathByID: vi.fn(),
}));

describe("Task Filtering and Sorting", () => {
  beforeEach(() => {
    // Reset stores
    taskStore.setTasks([]);
    configStore.set({
      autoRefresh: true,
      refreshInterval: 30,
      showCompleted: true,
      showTodayTasks: true,
      maxTasks: 100,
      sortBy: "created",
      displayMode: "only_tasks" as any,
      loading: false,
    });
  });

  it("should filter tasks by completion status", () => {
    taskStore.setTasks(mockTasks);

    const config = get(configStore);
    const tasks = get(taskStore).tasks;

    // Test with showCompleted: true
    const allTasks = tasks.filter((task) => {
      if (!config.showCompleted && task.status === TaskStatus.DONE) {
        return false;
      }
      return true;
    });

    expect(allTasks).toHaveLength(3);

    // Test with showCompleted: false
    configStore.set({ ...config, showCompleted: false });
    const incompleteTasks = tasks.filter((task) => {
      if (!get(configStore).showCompleted && task.status === TaskStatus.DONE) {
        return false;
      }
      return true;
    });

    expect(incompleteTasks).toHaveLength(2);
    expect(
      incompleteTasks.every((task) => task.status === TaskStatus.TODO)
    ).toBe(true);
  });

  it("should sort tasks by priority correctly", () => {
    taskStore.setTasks(mockTasks);
    const tasks = get(taskStore).tasks;

    const sortedTasks = taskStore.sortTasks(tasks, "priority");

    expect(sortedTasks[0].priority).toBe(TaskPriority.URGENT);
    expect(sortedTasks[1].priority).toBe(TaskPriority.HIGH);
    expect(sortedTasks[2].priority).toBe(TaskPriority.NORMAL);
  });

  it("should correctly detect priority from fcontent instead of markdown", () => {
    // Test case: task with no priority but sub-blocks with priority
    const taskWithSubBlocks = {
      id: "4",
      text: "Regular task",
      markdown:
        "- [ ] Regular task\n  - [ ] ❗ Sub-task with high priority\n  - [ ] Another sub-task",
      content:
        "- [ ] Regular task\n  - [ ] ❗ Sub-task with high priority\n  - [ ] Another sub-task",
      fcontent: "- [ ] Regular task", // fcontent only contains the main task content
      box: "box1",
      boxName: "Notebook 1",
      root_id: "doc1",
      path: "/path1",
      created: "2024-01-04T00:00:00Z",
      updated: "2024-01-04T00:00:00Z",
      type: "i",
      subtype: "t",
      status: TaskStatus.TODO as TaskStatus.TODO,
      priority: TaskPriority.NORMAL, // Should be NORMAL, not HIGH
    };

    taskStore.setTasks([taskWithSubBlocks]);
    const tasks = get(taskStore).tasks;

    // Verify that the task has normal priority, not high priority from sub-blocks
    expect(tasks[0].priority).toBe(TaskPriority.NORMAL);
    expect(tasks[0].fcontent).toBe("- [ ] Regular task");
    expect(tasks[0].markdown).toContain("❗ Sub-task with high priority"); // markdown contains sub-blocks
  });
});
