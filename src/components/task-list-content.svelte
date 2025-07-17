<script lang="ts">
  import { type App } from 'siyuan';
  import { type I18N } from '../types/i18n';
  import { configStore } from '../stores/config.store';
  import { taskStore } from '../stores/task.store';
  import { type TaskItem, type GroupedTasks, TaskStatus } from '../types/tasks';
  import { TaskDisplayMode } from '../types/tasks';
  import TaskItemComponent from './task-item.svelte';
  import TaskTree from './task-tree.svelte';
  import { TaskProcessingService } from '../services/task-processing.service';
  import { Logger } from '@/services/logger.service';

  interface Props {
    app: App;
    i18n: I18N;
    searchText: string;
    onRefresh: () => void;
  }

  let { app, i18n, searchText, onRefresh }: Props = $props();
  
  // Subscribe to stores
  let tasks = $state<TaskItem[]>([]);
  let loading = $state(false);
  let error = $state('');
  
  taskStore.subscribe(state => {
    tasks = state.tasks;
    loading = state.loading;
    error = state.error;
  });
  
  // Get config from config store
  let displayMode = $derived($configStore.displayMode);
  let showCompleted = $derived($configStore.showCompleted);
  let sortBy = $derived($configStore.sortBy);
  Logger.debug("displayMode", displayMode);
  Logger.debug("showCompleted", showCompleted);
  Logger.debug("sortBy", sortBy);
  
  // Filter and sort tasks
  let processedTasks = $derived(() => {
    let filteredTasks = tasks.filter(task => {
      // Filter by search text
      if (searchText && !task.fcontent.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      
      // Filter out completed tasks if showCompleted is false
      if (!showCompleted && task.status === TaskStatus.DONE) {
        return false;
      }
      
      return true;
    });
    
    // Sort filtered tasks
    return taskStore.sortTasks(filteredTasks, sortBy);
  });
  
  // Check if tasks are empty
  function isTasksEmpty(): boolean {
    return processedTasks().length === 0;
  }
  
  // Get tasks in the appropriate display mode
  let groupedProcessedTasks = $derived(() => {
    return TaskProcessingService.groupTasksForDisplay(processedTasks(), displayMode);
  });
</script>

<div class="task-list-content">
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <span>Loading tasks...</span>
    </div>
  {:else if error}
    <div class="error">
      <span>Error: {error}</span>
      <button onclick={onRefresh}>Retry</button>
    </div>
  {:else if isTasksEmpty()}
    <div class="empty">
      <span>{i18n.noTasksFound || 'No tasks found'}</span>
    </div>
  {:else}
    <div class="task-list">
      {#if displayMode === TaskDisplayMode.ONLY_TASKS}
        {#each processedTasks() as task (task.id)}
          <TaskItemComponent {app} {task} showMeta={false} />
        {/each}
      {:else if displayMode === TaskDisplayMode.NOTEBOOK_TASKS}
        {#each Object.entries(groupedProcessedTasks() as GroupedTasks) as [boxId, group] (boxId)}
          <div class="notebook-group">
            <div class="notebook-header">
              <h4>{group.notebook}</h4>
            </div>
            {#each Object.entries(group.documents) as [docId, docGroup] (docId)}
              <div class="notebook-tasks">
                {#each docGroup.tasks as task (task.id)}
                  <TaskItemComponent {app} {task} showMeta={true} />
                {/each}
              </div>
            {/each}
          </div>
        {/each}
      {:else if displayMode === TaskDisplayMode.NOTEBOOK_DOCUMENT_TASKS}
        <TaskTree {app} groupedTasks={groupedProcessedTasks() as GroupedTasks} />
      {:else}
        {#each Object.entries(groupedProcessedTasks() as GroupedTasks) as [boxId, group] (boxId)}
          <div class="notebook-group">
            <div class="notebook-header">
              <h4>{group.notebook}</h4>
            </div>
            {#each Object.entries(group.documents) as [docId, docGroup] (docId)}
                <div class="document-group">
                  <div class="document-header">
                    <h5>{docGroup.docPath}</h5>
                  </div>
                  <div class="document-tasks">
                    {#each docGroup.tasks as task (task.id)}
                      <TaskItemComponent {app} {task} showMeta={true} />
                    {/each}
                  </div>
                </div>
            {/each}
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .task-list-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .loading, .error, .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--b3-theme-on-surface-variant);
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--b3-border-color);
    border-top: 2px solid var(--b3-theme-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error button {
    margin-top: 8px;
    padding: 4px 8px;
    background: var(--b3-theme-primary);
    color: var(--b3-theme-on-primary);
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .notebook-group {
    border: 1px solid var(--b3-border-color);
    border-radius: 4px;
    overflow: hidden;
  }

  .notebook-header {
    background: var(--b3-theme-surface);
    padding: 8px 12px;
    border-bottom: 1px solid var(--b3-border-color);
  }

  .notebook-header h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--b3-theme-on-surface);
  }

  .document-group {
    border-bottom: 1px solid var(--b3-border-color);
  }

  .document-group:last-child {
    border-bottom: none;
  }

  .document-header {
    background: var(--b3-theme-surface-variant);
    padding: 6px 12px;
    border-bottom: 1px solid var(--b3-border-color);
  }

  .document-header h5 {
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--b3-theme-on-surface-variant);
  }

  .document-tasks, .notebook-tasks {
    padding: 4px 0;
  }

  /* Tree-specific styles for NOTEBOOK_DOCUMENT_TASKS mode */
  :global(.task-tree) {
    border: none;
    background: transparent;
  }

  :global(.task-tree .notebook-group) {
    border: none;
    background: transparent;
  }

  :global(.task-tree .document-group) {
    border: none;
    background: transparent;
  }
</style> 