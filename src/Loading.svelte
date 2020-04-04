<script>
  import { Type, Icon, IconSpinner } from "figma-plugin-ds-svelte";
</script>

<style lang="scss">
  .loading-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    flex-grow: 1;
    text-align: center;
    padding: var(--size-xlarge);
  }
</style>

<div class="loading-wrapper">
  <Icon spin iconName={IconSpinner} />
  <Type size="xlarge" weight="bold">Loading styles, please wait.</Type>
  <Type size="medium">If Loading takes too long, restart the plugin.</Type>
</div>
