<script>
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

  import Input from "./Input.svelte";

  import RefreshCw from "./refresh-cw.svg";

  let styleFilter = "";
  export let styles = [];
  export let setSelectedStyles;
  export let sendToUI;
  export let type;
  let filteredStyles = [];

  $: filteredStyles = styles.filter(style => {
    var regex = new RegExp(styleFilter, "gi");
    return style.name.match(regex);
  });
  $: size = filteredStyles.length > 7 ? 7 : filteredStyles.length;

  function refresh() {
    sendToUI({
      type: "refresh"
    });
  }

  function setSelected(e) {
    setSelectedStyles(
      Array.from(e.target.selectedOptions, n => JSON.parse(n.value))
    );
  }
</script>

<style lang="scss">
  select {
    border: 0;
  }
  .type-wrapper {
    width: 100%;
    overflow-x: hidden;
  }

  .type-wrapper:focus {
    outline: none;
  }

  .type-item {
    background: none;
    border: 0;
    font-size: var(--font-size-xsmall);
    font-family: var(--font-stack);
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  :global(select::-webkit-scrollbar) {
    width: 9px;
  }

  :global(select::-webkit-scrollbar-thumb) {
    background-color: var(--black3);
    border-radius: 9px;
    border: 2px solid white;
  }

  .type-item:hover {
    background: var(--hover-fill);
  }

  .type-item::selection {
    background: red;
  }
</style>

<div class="selector-wrapper">
  <div class="flex justify-content-between align-items-center">
    {#if styleFilter}
      <Type>
        {filteredStyles.length} {type} Styles matching
        <Type weight="bold" inline>{styleFilter}</Type>
      </Type>
    {:else}
      <Type>{styles.length} {type} Styles</Type>
    {/if}
    <IconButton iconName={RefreshCw} on:click={refresh} />
  </div>
  <div class="mb-xxsmall">
    <Input
      placeholder="Type to search for styles"
      className="text-input"
      name="styleFilter"
      bind:value={styleFilter} />
  </div>
  {#if styles.length}
    <select
      multiple
      class="type-wrapper"
      {size}
      value={filteredStyles}
      on:change={setSelected}>
      {#each filteredStyles as style}
        <option
          value={JSON.stringify(style)}
          class="flex type-item pt-xxsmall pb-xxsmall pl-xxsmall pr-xxsmall">
          {style.name}
        </option>
      {/each}
    </select>
  {:else}
    <Label>No {type} Styles found.</Label>
  {/if}
</div>
