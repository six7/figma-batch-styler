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

  function getColorClass(color) {
    return color ? "value-item" : "";
  }

  function getColorStyle(color) {
    return color
      ? `--background-color: rgb(${Object.values(color).join(", ")}`
      : "";
  }

  let isResizing = false;
  let startY;
  let startHeight;

  function handleMouseDown(event) {
    isResizing = true;
    startY = event.clientY;
    startHeight = parseInt(document.defaultView.getComputedStyle(panel).height, 10);
    document.documentElement.addEventListener('mousemove', handleMouseMove);
    document.documentElement.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(event) {
    if (!isResizing) return;
    const newHeight = startHeight + event.clientY - startY;
    panel.style.height = `${newHeight}px`;
  }

  function handleMouseUp() {
    isResizing = false;
    document.documentElement.removeEventListener('mousemove', handleMouseMove);
    document.documentElement.removeEventListener('mouseup', handleMouseUp);
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

  .value-item::before {
    content: "";
    position: relative;
    display: inline-block;
    border-radius: 4px;
    margin-right: 2px;
    width: 8px;
    height: 8px;
    background: var(--background-color);
  }

  .resize-handle {
    width: 100%;
    height: 10px;
    background: var(--grey);
    cursor: ns-resize;
  }
</style>

<div class="selector-wrapper" bind:this={panel}>
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
          style={getColorStyle(style.color)}
          class="{getColorClass(style.color)} flex type-item pt-xxsmall
          pb-xxsmall pl-xxsmall pr-xxsmall">
          {style.name}
        </option>
      {/each}
    </select>
  {:else}
    <Label>No {type} Styles found.</Label>
  {/if}
  <div class="resize-handle" on:mousedown={handleMouseDown}></div>
</div>
