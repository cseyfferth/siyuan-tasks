import { describe, it, expect } from "vitest";
import { TaskAnalysisService } from "../services/task-analysis.service";
import { TaskStatus, TaskPriority } from "../types/tasks";

describe("TaskAnalysisService", () => {
  describe("extractTaskText", () => {
    it("should convert SiYuan's internal hash tag format from #MyHash# to #MyHash", () => {
      const testCases = [
        {
          input: "Task with #MyHash# tag",
          expected: "Task with #MyHash tag",
        },
        {
          input: "Multiple #Tag1# and #Tag2# tags",
          expected: "Multiple #Tag1 and #Tag2 tags",
        },
        {
          input: "#SingleTag# task",
          expected: "#SingleTag task",
        },
        {
          input: "Task with #CamelCase# and #snake_case# tags",
          expected: "Task with #CamelCase and #snake_case tags",
        },
        {
          input: "Task with #numbers123# and #special-chars#",
          expected: "Task with #numbers123 and #special-chars",
        },
        {
          input: "Task without hash tags",
          expected: "Task without hash tags",
        },
        {
          input: "Task with #incomplete#",
          expected: "Task with #incomplete",
        },
        {
          input: "Task with #multiple# #hash# #tags#",
          expected: "Task with #multiple #hash #tags",
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = TaskAnalysisService.extractTaskText(input);
        expect(result).toBe(expected);
      });
    });

    it("should remove priority indicators while preserving hash tag conversion", () => {
      const testCases = [
        {
          input: "❗ High priority task with #MyHash#",
          expected: "High priority task with #MyHash",
        },
        {
          input: "‼️ Urgent task with #Tag1# and #Tag2#",
          expected: "Urgent task with #Tag1 and #Tag2",
        },
        {
          input: "⏳ Wait task with #Important#",
          expected: "Wait task with #Important",
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = TaskAnalysisService.extractTaskText(input);
        expect(result).toBe(expected);
      });
    });

    it("should handle edge cases correctly", () => {
      const testCases = [
        {
          input: "#",
          expected: "#",
        },
        {
          input: "##",
          expected: "##",
        },
        {
          input: "###",
          expected: "###",
        },
        {
          input: "Task with #tag# and regular #text",
          expected: "Task with #tag and regular #text",
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = TaskAnalysisService.extractTaskText(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe("detectStatus", () => {
    it("should detect todo tasks correctly", () => {
      expect(TaskAnalysisService.detectStatus("- [ ] Todo task")).toBe(
        TaskStatus.TODO
      );
      expect(TaskAnalysisService.detectStatus("- [ ] Task with #MyHash#")).toBe(
        TaskStatus.TODO
      );
    });

    it("should detect done tasks correctly", () => {
      expect(TaskAnalysisService.detectStatus("- [x] Done task")).toBe(
        TaskStatus.DONE
      );
      expect(TaskAnalysisService.detectStatus("- [X] Done task")).toBe(
        TaskStatus.DONE
      );
    });

    it("should return ALL for non-task content", () => {
      expect(TaskAnalysisService.detectStatus("Regular text")).toBe(
        TaskStatus.TODO
      );
      expect(TaskAnalysisService.detectStatus("")).toBe(TaskStatus.TODO);
    });
  });

  describe("detectPriority", () => {
    it("should detect urgent priority", () => {
      expect(TaskAnalysisService.detectPriority("Task with ‼️")).toBe(
        TaskPriority.URGENT
      );
      expect(TaskAnalysisService.detectPriority("‼️ Urgent task")).toBe(
        TaskPriority.URGENT
      );
    });

    it("should detect high priority", () => {
      expect(TaskAnalysisService.detectPriority("Task with ❗")).toBe(
        TaskPriority.HIGH
      );
      expect(TaskAnalysisService.detectPriority("❗ High priority task")).toBe(
        TaskPriority.HIGH
      );
    });

    it("should detect wait priority", () => {
      expect(TaskAnalysisService.detectPriority("Task with ⏳")).toBe(
        TaskPriority.WAIT
      );
      expect(TaskAnalysisService.detectPriority("⏳ Wait task")).toBe(
        TaskPriority.WAIT
      );
    });

    it("should return normal priority for tasks without indicators", () => {
      expect(TaskAnalysisService.detectPriority("Regular task")).toBe(
        TaskPriority.NORMAL
      );
      expect(TaskAnalysisService.detectPriority("Task with #MyHash#")).toBe(
        TaskPriority.NORMAL
      );
    });
  });
});
