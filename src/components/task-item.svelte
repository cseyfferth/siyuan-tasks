<script lang="ts">
  import { type App, openTab } from 'siyuan';
  import { type TaskItem } from '../types/tasks';
  import { TaskStatus, TaskPriority } from '../types/tasks';
  import { TaskMetadataService } from '../services/task-metadata.service';
  import ContextMenu from './ui/context-menu.svelte';
  import { type I18N } from '../types/i18n';

  interface Props {
    app: App;
    task: TaskItem;
    i18n: I18N;
    showMeta?: boolean;
    onTaskUpdated?: () => void;
  }

  let { app, task, i18n, showMeta = false, onTaskUpdated }: Props = $props();

  // Context menu state
  let showContextMenu = $state(false);
  let contextMenuX = $state(0);
  let contextMenuY = $state(0);
  let triggerElement: HTMLElement;

  function handleTaskClick() {
    if (task.root_id) {
      openTab({
        app: app,
        doc: {
          id: task.root_id,
          zoomIn: false,
        }
      });
    }
  }

  function getPriorityIconId(): string | null {
    switch (task.priority) {
      case TaskPriority.URGENT:
        return 'priorityUrgent';
      case TaskPriority.HIGH:
        return 'priorityHigh';
      case TaskPriority.WAIT:
        return 'priorityWait';
      case TaskPriority.NORMAL:
      default:
        return null;
    }
  }

  // Drag functionality
  function handleDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', task.id);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setDragImage(event.target as HTMLElement, 0, 0);
    }
  }

  // Prevent scroll interference during drag
  function handleDrag(event: DragEvent) {
    event.preventDefault();
  }

  // Context menu functionality
  function handleContextMenu(event: MouseEvent) {
    event.preventDefault();
    
    contextMenuX = event.clientX;
    contextMenuY = event.clientY;
    showContextMenu = true;
  }

  // Context menu actions
  const contextMenuItems = $derived(() => {
    const isToday = task.isToday === true;
    const addLabel = i18n.todayTasks?.addToToday || "Add to Today's Tasks";
    const removeLabel = i18n.todayTasks?.removeFromToday || "Remove from Today's Tasks";
    return [
      {
        id: 'toggle-today',
        label: isToday ? removeLabel : addLabel,
        icon: 'iconCalendar',
        action: async () => {
          try {
            if (isToday) {
              await TaskMetadataService.removeTaskFromToday(task.id);
            } else {
              await TaskMetadataService.addTaskToToday(task.id);
            }
            onTaskUpdated?.();
          } catch (error) {
            console.error('Failed to update task today status:', error);
          }
        }
      }
    ];
  });

  function closeContextMenu() {
    showContextMenu = false;
  }
</script>

<span 
  bind:this={triggerElement}
  class="task-item {task.status} {task.isToday ? 'today-task' : ''}" 
  role="button"
  tabindex="0"
  draggable="true"
  onclick={handleTaskClick}
  onkeydown={(e) => e.key === 'Enter' && handleTaskClick()}
  ondragstart={handleDragStart}
  ondrag={handleDrag}
  oncontextmenu={handleContextMenu}
  aria-label="Open task: {task.fcontent}"
>
  <div class="task-checkbox">
    <input 
      type="checkbox" 
      checked={task.status === TaskStatus.DONE} 
      disabled
    />
  </div>
  <div class="task-content">
    <div class="task-text">
      {#if getPriorityIconId()}
        <svg class="priority-icon" width="16" height="16">
          <use href="#{getPriorityIconId()}" />
        </svg>
      {/if}
      {task.text}
    </div>
    {#if showMeta}
      <div class="task-meta">
        {task.boxName} / {task.docPath}
      </div>
    {/if}
  </div>
</span>

{#if showContextMenu}
  <ContextMenu 
    items={contextMenuItems()}
    x={contextMenuX}
    y={contextMenuY}
    onClose={closeContextMenu}
    triggerElement={triggerElement}
  />
{/if}

<style>
  .task-item {
    display: flex;
    align-items: flex-start;
    padding: 0 2px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
  }

  .task-item:hover {
    background-color: var(--b3-theme-surface-hover);
  }

  .task-item.done {
    opacity: 0.7;
  }

  .task-item.today-task {
    background-color: var(--b3-theme-primary-container);
  }

  .task-item.today-task:hover {
    background-color: var(--b3-theme-primary-container-hover);
  }

  .task-checkbox {
    margin-right: 8px;
    margin-top: 0;
    align-self: flex-start;
  }

  .task-content {
    flex: 1;
    min-width: 0;
  }

  .task-text {
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 4px;
    word-break: break-word;
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }

  .priority-icon {
    flex-shrink: 0;
    margin-top: 0.1875rem;
  }

  .task-meta {
    font-size: 12px;
    color: var(--b3-theme-on-surface-variant);
    opacity: 0.8;
  }
</style> 