<script lang="ts">
  import { i18nStore } from '@/stores/i18n.store';

  interface Props {
    searchText: string;
    onSearchChange: (value: string) => void;
  }

  let { searchText, onSearchChange }: Props = $props();
  let i18n = $derived($i18nStore);
</script>

<div class="search-wrap">
  <input 
    type="text" 
    value={searchText}
    oninput={(e: Event) => onSearchChange((e.currentTarget as HTMLInputElement).value)}
    placeholder={i18n.searchPlaceholder || 'Search tasks...'}
    class="search-input"
  />
</div>

<style>
  .search-wrap {
    margin-bottom: 8px;
    padding: 0 12px;
    box-sizing: border-box;
  }

  .search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--b3-border-color);
    border-radius: 4px;
    background: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
    font-size: 14px;
    box-sizing: border-box;
    max-width: 100%;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--b3-theme-primary);
  }
</style> 