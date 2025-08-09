<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    action: () => void | Promise<void>;
  }

  interface Props {
    items: MenuItem[];
    x: number;
    y: number;
    onClose: () => void;
    triggerElement?: HTMLElement;
  }

  let { items, x, y, onClose, triggerElement }: Props = $props();

  let menuElement: HTMLElement;
  let hideTimer: NodeJS.Timeout;
  let isMouseInMenu = $state(false);
  let isMouseInTrigger = $state(false);

  const startHideTimer = () => {
    hideTimer = setTimeout(() => {
      if (!isMouseInMenu && !isMouseInTrigger) {
        closeMenu();
      }
    }, 2000); // Hide after 2 seconds of mouse being outside
  };

  const stopHideTimer = () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
    }
  };

  const checkMouseInTrigger = (e: MouseEvent) => {
    if (triggerElement && triggerElement.contains(e.target as Node)) {
      isMouseInTrigger = true;
      stopHideTimer();
    } else {
      isMouseInTrigger = false;
      startHideTimer();
    }
  };

  const handleItemClick = async (item: MenuItem) => {
    try {
      await item.action();
    } catch (error) {
      console.error('Context menu action failed:', error);
    }
    closeMenu();
  };

  const closeMenu = () => {
    stopHideTimer();
    document.removeEventListener('mousemove', checkMouseInTrigger);
    onClose();
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (menuElement && !menuElement.contains(e.target as Node) && 
        triggerElement && !triggerElement.contains(e.target as Node)) {
      closeMenu();
    }
  };

  onMount(() => {
    startHideTimer();
    
    document.addEventListener('mousemove', checkMouseInTrigger);
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 0);
  });

  onDestroy(() => {
    stopHideTimer();
    document.removeEventListener('mousemove', checkMouseInTrigger);
    document.removeEventListener('click', handleOutsideClick);
  });
</script>

<div 
  bind:this={menuElement}
  class="context-menu"
  style="left: {x}px; top: {y}px;"
  onmouseenter={() => { isMouseInMenu = true; stopHideTimer(); }}
  onmouseleave={() => { isMouseInMenu = false; startHideTimer(); }}
>
  {#each items as item (item.id)}
    <div class="menu-item" onclick={() => handleItemClick(item)}>
      {#if item.icon}
        <svg class="menu-icon" width="14" height="14">
          <use href="#{item.icon}" />
        </svg>
      {/if}
      <span>{item.label}</span>
    </div>
  {/each}
</div>

<style>
  .context-menu {
    position: fixed;
    z-index: 9999;
    background: var(--b3-theme-surface);
    border: 1px solid var(--b3-border-color);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 4px 0;
    min-width: 160px;
    backdrop-filter: blur(8px);
  }

  .menu-item {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 14px;
    color: var(--b3-theme-on-surface);
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .menu-item:hover {
    background-color: var(--b3-theme-surface-hover);
  }

  .menu-icon {
    flex-shrink: 0;
    color: var(--b3-theme-on-surface-variant);
  }
</style>
