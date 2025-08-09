<script lang="ts">
  export let expanded: boolean = false;
  export let size: number = 12;
  export let className: string = '';
</script>

<svg
  class="chevron {expanded ? 'expanded' : ''} {className}"
  width={size}
  height={size}
  aria-hidden="true"
  focusable="false"
>
  <use href="#iconRight" />
</svg>

<style>
  .chevron {
    transition: transform 0.2s ease, color 0.2s ease, fill 0.2s ease;
    display: inline-block;
    vertical-align: middle;
    color: var(--b3-theme-on-surface-variant);
    fill: currentColor;
    color: var(--b3-theme-on-surface-variant); 
  }
  .chevron.expanded { transform: rotate(90deg); }
</style>
