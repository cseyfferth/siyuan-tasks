import { SiyuanBlockType } from "@/types/siyuan-enriched";
import { sql } from "../api";
import { TaskRange, TaskStatus, DocInfo, BoxInfo } from "../types/tasks";
import { TaskAnalysisService } from "./task-analysis.service";
import { RawSiyuanBlock } from "./task-factory.service";
import { DEFAULT_SETTINGS } from "@/constants";
import { Logger } from "./logger.service";

/**
 * TODO: Limit the number of tasks in case of large number of tasks
 *
 */
export async function fetchTasksFromDB(
  range: TaskRange,
  status: TaskStatus,
  getCurrentDocInfo: () => DocInfo,
  getCurrentBoxInfo: () => BoxInfo,
  limit: number = DEFAULT_SETTINGS.maxTasks
): Promise<RawSiyuanBlock[]> {
  Logger.info(`Fetching tasks from DB ${range} ${status} ${limit}`);
  let sqlQuery = `SELECT * FROM blocks WHERE type = '${SiyuanBlockType.ListElement}' AND subtype = 't'`;

  if (status === TaskStatus.TODO) {
    sqlQuery += ` AND (markdown LIKE '- [ ]%' OR markdown LIKE '* [ ]%' or markdown LIKE '[ ]%')`;
  }

  if (range === TaskRange.DOC && getCurrentDocInfo()?.rootID) {
    sqlQuery += ` AND root_id = '${getCurrentDocInfo().rootID}'`;
  } else if (range === TaskRange.BOX && getCurrentBoxInfo()?.box) {
    sqlQuery += ` AND box = '${getCurrentBoxInfo().box}'`;
  }

  // Ensure the newest tasks are not cut off
  sqlQuery += ` ORDER BY created DESC LIMIT ${limit}`;

  const tasksResult = await sql(sqlQuery);
  if (!tasksResult || tasksResult.length === 0) {
    return [];
  }

  // Filter by status
  return filterTasksByStatus(tasksResult, status);
}

export function filterTasksByStatus(
  tasks: RawSiyuanBlock[],
  status: TaskStatus
): RawSiyuanBlock[] {
  return tasks.filter((task) => {
    if (status === TaskStatus.TODO)
      return TaskAnalysisService.isTodo(task.markdown);
    if (status === TaskStatus.DONE)
      return TaskAnalysisService.isDone(task.markdown);
    return (
      TaskAnalysisService.isTodo(task.markdown) ||
      TaskAnalysisService.isDone(task.markdown)
    );
  });
}
