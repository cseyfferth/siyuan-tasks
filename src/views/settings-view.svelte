<script lang="ts">
  import type { I18N } from '@/types/i18n';
  import type { Plugin } from 'siyuan';
  import { i18nStore } from '@/stores/i18n.store';
  import Settings from '@/components/settings.svelte';

  interface Props {
    i18n: I18N;
    plugin: Plugin;
  }

  let { i18n, plugin }: Props = $props();

  let ready = $derived(Boolean($i18nStore));
</script>

{#if ready}
  <Settings {plugin} />
{/if}
