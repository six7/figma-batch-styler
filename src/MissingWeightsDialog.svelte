<script>
  export let newFontWeights = [];
  export let availableWeights = [];
  export let setFontWeightMappings;

  import {
    Button,
    Icon,
    IconButton,
    Label,
    Type,
    Section,
    SelectMenu,
    Switch,
    IconWarning
  } from "figma-plugin-ds-svelte";

  function hasMissingFont(item) {
    return !availableWeights.some(i => i === item);
  }
</script>

<style lang="scss">
  .weights-dialog {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: white;
    z-index: 50;
    margin: 50px;
  }

  .dialog-title {
    border-bottom: 1px solid var(--grey);
    padding-bottom: var(--pxxsmall);
  }

  .dialog-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--grey);
    opacity: 0.5;
    z-index: 50;
  }

  .select-sm {
    font-size: var(--font-size-xsmall);
    font-family: var(--font-stack);
    border: 1px solid var(--grey);
    padding: var(--size-xxsmall);
    border-radius: var(--border-radius-small);
  }
</style>

<div class="dialog-background" />
<div class="weights-dialog">
  <div class="dialog-title">
    <div class="p-xxsmall">
      <Type weight="bold">Missing Weights</Type>
    </div>
  </div>
  <div class="p-xxsmall">
    {#each newFontWeights as weight, i}
      <div class="flex justify-content-between align-items-center mb-xxsmall">
        <Type>{weight.currentWeight}</Type>
        <div class="flex align-items-center">
          <select class="select-sm" bind:value={newFontWeights[i].newWeight}>
            <option disabled>{newFontWeights[i].newWeight}</option>
            {#each availableWeights as item}
              <option>{item}</option>
            {/each}
          </select>
          {#if hasMissingFont(weight.currentWeight)}
            <Icon iconName={IconWarning} />
          {/if}
        </div>
      </div>
    {/each}
    <Button on:click={setFontWeightMappings}>Save</Button>
  </div>
</div>
