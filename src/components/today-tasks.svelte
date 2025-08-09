<script lang="ts">
  import { type I18N } from '../types/i18n';
  import { type TaskItem } from '../types/tasks';
  import TaskItemComponent from './task-item.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { i18nStore } from '@/stores/i18n.store';
  import { taskStore } from '@/stores/task.store';

  interface Props {
    tasks: TaskItem[];
    isExpanded?: boolean;
    onToggleExpanded?: () => void;
    onTaskUpdated?: () => void;
  }

  let { tasks, isExpanded = true, onToggleExpanded, onTaskUpdated }: Props = $props();

  // Globals
  let i18n = $derived($i18nStore as I18N);

  // Filter tasks that are marked for today
  let todayTasks = $derived(() => {
    return tasks.filter(task => task.isToday === true);
  });

  // Check if there are any today tasks
  let hasTodayTasks = $derived(() => todayTasks().length > 0);

  // Drag and drop state
  let isDragOver = $state(false);
  let isDragging = $state(false);

  // Global drag event listeners
  let dragStartHandler: (e: DragEvent) => void;
  let dragEndHandler: (e: DragEvent) => void;

  onMount(() => {
    // Track when dragging starts globally
    dragStartHandler = () => {
      isDragging = true;
    };
    
    dragEndHandler = () => {
      isDragging = false;
      isDragOver = false;
    };
    
    document.addEventListener('dragstart', dragStartHandler);
    document.addEventListener('dragend', dragEndHandler);
    
    // Listen for dragover on document to detect any drag activity
    document.addEventListener('dragover', (e) => {
      e.preventDefault(); // This is crucial to prevent drag cancellation
      if (!isDragging) {
        isDragging = true;
      }
    });
    
    // Also listen for drop on document to handle cases where drop happens outside our drop zone
    document.addEventListener('drop', (e) => {
      e.preventDefault();
      isDragging = false;
      isDragOver = false;
    });
    
    // Prevent scroll interference during drag
    document.addEventListener('dragenter', (e) => {
      e.preventDefault();
    });
  });

  onDestroy(() => {
    if (dragStartHandler) {
      document.removeEventListener('dragstart', dragStartHandler);
    }
    if (dragEndHandler) {
      document.removeEventListener('dragend', dragEndHandler);
    }
  });

  // Handle drag over event
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragOver = true;
  }

  // Handle drag leave event
  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
  }

  // Handle drop event
  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
    isDragging = false; // Also set isDragging to false when drop happens

    const taskId = event.dataTransfer?.getData('text/plain');
    if (taskId) {
      try {
        await taskStore.addTaskToToday(taskId);
        onTaskUpdated?.();
      } catch (error) {
        console.error('Failed to add task to today:', error);
      }
    }
  }
</script>

{#if hasTodayTasks()}
  <div class="today-tasks-section">
    <div class="today-header" onclick={onToggleExpanded} onkeydown={(e) => e.key === 'Enter' && onToggleExpanded?.()} role="button" tabindex="0">
      <div class="today-title">
        <svg class="icon" width="16" height="16">
          <use href="#iconCalendar"></use>
        </svg>
        <span>{i18n.todayTasks?.title || "Today's Tasks"}</span>
        <span class="task-count">({todayTasks().length})</span>
      </div>
      <div class="expand-icon">
        <svg class="icon" width="12" height="12">
          <use href={isExpanded ? "#iconChevronUp" : "#iconChevronDown"}></use>
        </svg>
      </div>
    </div>
    
    {#if isExpanded}
      <div class="today-tasks-list">
        {#each todayTasks() as task (task.id)}
          <TaskItemComponent {task} showMeta={false} onTaskUpdated={onTaskUpdated} />
        {/each}
      </div>
    {/if}
  </div>
{/if}

<!-- Always-visible drop zone (compact by default, expands on drag) -->
<div 
  class="today-drop-zone {isDragOver || isDragging ? 'active' : 'compact'}" 
  role="region" 
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  <div class="drop-zone-content">
    <svg class="icon" width="16" height="16">
      <use href="#iconCalendar"></use>
    </svg>
    <span class="drop-title">{i18n.todayTasks?.title || "Today's Tasks"}</span>
    <span class="drop-hint">{i18n.todayTasks?.addToToday || 'Drop tasks here to add to today'}</span>
  </div>
</div>

<style>
  .today-tasks-section {
    border-bottom: 1px solid var(--b3-border-color);
    margin-bottom: 12px;
  }

  .today-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--b3-theme-surface);
    border-radius: 4px 4px 0 0;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .today-header:hover {
    background: var(--b3-theme-surface-hover);
  }

  .today-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    font-size: 14px;
    color: var(--b3-theme-on-surface);
  }

  .task-count {
    font-weight: normal;
    color: var(--b3-theme-on-surface-variant);
    font-size: 12px;
  }

  .expand-icon {
    color: var(--b3-theme-on-surface-variant);
  }

  .today-tasks-list {
    padding: 8px 0;
    background: var(--b3-theme-surface-variant);
    border-radius: 0 0 4px 4px;
  }

  .today-tasks-list :global(.task-item) {
    margin: 0 8px 4px 8px;
  }

  .today-tasks-list :global(.task-item:last-child) {
    margin-bottom: 0;
  }

  /* Always-visible, sticky drop zone */
  .today-drop-zone {
    position: sticky;
    top: 0;
    z-index: 100;
    border-radius: 4px;
    transition: all 0.18s ease;
    margin-bottom: 12px;
    border: 2px dashed transparent;
    background: transparent;
    backdrop-filter: blur(4px);
  }

  .today-drop-zone.compact {
    padding: 4px 8px; /* very compact */
    min-height: 6px; /* thin bar */
    border-color: transparent;
  }

  .today-drop-zone.compact .drop-zone-content {
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0.45;
    font-size: 11px;
    color: var(--b3-theme-on-surface-variant);
  }

  /* Hide hint text in compact mode to save space */
  .today-drop-zone.compact .drop-hint {
    display: none;
  }

  .today-drop-zone.active {
    padding: 16px;
    border-color: var(--b3-theme-primary);
    background: var(--b3-theme-primary-container);
  }

  .today-drop-zone .drop-zone-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .today-drop-zone .drop-title {
    font-weight: 600;
  }
</style>
