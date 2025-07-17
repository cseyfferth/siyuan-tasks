<script lang="ts">
  import { type App } from 'siyuan';
  import { type GroupedTasks } from '../types/tasks';
  import TaskItemComponent from './task-item.svelte';
  import { NotebookService } from '../services/notebook.service';

  interface Props {
    app: App;
    groupedTasks: GroupedTasks;
  }

  let { app, groupedTasks }: Props = $props();

  // State for expanded/collapsed items - expanded by default
  let expandedNotebooks = $state<Set<string>>(new Set());
  let expandedDocuments = $state<Set<string>>(new Set());

  // Initialize expanded state when groupedTasks changes
  $effect(() => {
    // Expand all notebooks by default
    const newExpandedNotebooks = new Set<string>();
    const newExpandedDocuments = new Set<string>();
    
    for (const [boxId] of Object.entries(groupedTasks)) {
      newExpandedNotebooks.add(boxId);
    }
    
    // Expand all documents by default
    for (const [, group] of Object.entries(groupedTasks)) {
      for (const [docId] of Object.entries(group.documents)) {
        newExpandedDocuments.add(docId);
      }
    }
    
    expandedNotebooks = newExpandedNotebooks;
    expandedDocuments = newExpandedDocuments;
  });

  // Toggle notebook expansion
  function toggleNotebook(boxId: string) {
    const newSet = new Set(expandedNotebooks);
    if (newSet.has(boxId)) {
      newSet.delete(boxId);
    } else {
      newSet.add(boxId);
    }
    expandedNotebooks = newSet;
  }

  // Toggle document expansion
  function toggleDocument(docId: string) {
    const newSet = new Set(expandedDocuments);
    if (newSet.has(docId)) {
      newSet.delete(docId);
    } else {
      newSet.add(docId);
    }
    expandedDocuments = newSet;
  }

  // Get notebook icon
  async function getNotebookIcon(boxId: string): Promise<string> {
    return await NotebookService.getNotebookIcon(boxId);
  }
</script>

<div class="task-tree">
  {#each Object.entries(groupedTasks) as [boxId, group] (boxId)}
    <div class="tree-item notebook-item">
      <div 
        class="tree-header notebook-header"
        role="button"
        tabindex="0"
        onclick={() => toggleNotebook(boxId)}
        onkeydown={(e) => e.key === 'Enter' && toggleNotebook(boxId)}
        aria-expanded={expandedNotebooks.has(boxId)}
        aria-label="Toggle notebook: {group.notebook}"
      >
        <div class="tree-indicator">
          <svg class="chevron {expandedNotebooks.has(boxId) ? 'expanded' : ''}" width="12" height="12">
            <use href="#iconRight" />
          </svg>
        </div>
        <div class="tree-icon">
          {#await getNotebookIcon(boxId) then icon}
            {icon}
          {:catch}
            🗃
          {/await}
        </div>
        <div class="tree-label">
          {group.notebook}
        </div>
      </div>
      
      {#if expandedNotebooks.has(boxId)}
        <div class="tree-children">
          {#each Object.entries(group.documents) as [docId, docGroup] (docId)}
            <div class="tree-item document-item">
              <div 
                class="tree-header document-header"
                role="button"
                tabindex="0"
                onclick={() => toggleDocument(docId)}
                onkeydown={(e) => e.key === 'Enter' && toggleDocument(docId)}
                aria-expanded={expandedDocuments.has(docId)}
                aria-label="Toggle document: {docGroup.docPath}"
              >
                <div class="tree-indicator">
                  <svg class="chevron {expandedDocuments.has(docId) ? 'expanded' : ''}" width="12" height="12">
                    <use href="#iconRight" />
                  </svg>
                </div>
                <div class="tree-icon">
                  📄
                </div>
                <div class="tree-label">
                  {docGroup.docPath}
                </div>
              </div>
              
              {#if expandedDocuments.has(docId)}
                <div class="tree-children task-children">
                  {#each docGroup.tasks as task (task.id)}
                    <div class="task-item-wrapper">
                      <TaskItemComponent {app} {task} showMeta={false} />
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .task-tree {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .tree-item {
    display: flex;
    flex-direction: column;
  }

  .tree-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0 8px;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;
    min-height: 32px;
  }

  .tree-header:hover {
    background-color: var(--b3-theme-surface-hover);
  }

  .notebook-header {
    font-weight: 600;
    color: var(--b3-theme-on-surface);
  }

  .document-header {
    font-weight: 500;
    color: var(--b3-theme-on-surface-variant);
  }

  .tree-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .chevron {
    transition: transform 0.2s ease;
    fill: var(--b3-theme-on-surface-variant);
  }

  .chevron.expanded {
    transform: rotate(90deg);
  }

  .tree-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    font-size: 14px;
  }

  .tree-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tree-children {
    margin-left: 20px;
  }

  .task-children {
    margin-left: 20px;
    padding: 4px 0;
  }

  .task-item-wrapper {
    margin-left: 20px;
  }
</style> 