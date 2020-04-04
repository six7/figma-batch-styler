<script>
  import { Type } from "figma-plugin-ds-svelte";
</script>

<style lang="scss">
  .none-found-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    flex-grow: 1;
    text-align: center;
    padding: var(--size-medium);
  }
</style>

<div class="none-found-wrapper">
  <Type size="xlarge" weight="bold">
    <slot />
  </Type>
  <Type>
    Open Batch Styler in a document with local styles, for example the document
    where your team's styles are located.
  </Type>
</div>
