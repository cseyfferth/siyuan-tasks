<script lang="ts">
  import type { App } from 'siyuan';
  import type { I18N } from '@/types/i18n';
  import { appStore } from '@/stores/app.store';
  import { i18nStore } from '@/stores/i18n.store';
  import TaskList from '@/components/task-list.svelte';

  interface Props {
    app: App;
    i18n: I18N;
  }

  let { app, i18n }: Props = $props();

  // Initialize globals
  appStore.set(app);
  i18nStore.set(i18n);

  let ready = $derived(Boolean($appStore && $i18nStore));
</script>

{#if ready}
  <TaskList />
{/if}
