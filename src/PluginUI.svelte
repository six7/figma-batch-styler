<script>
  import { GlobalCSS } from "figma-plugin-ds-svelte";
  import Padding from "./padding.svg";
  import Horizontal from "./horizontal.svg";
  import Vertical from "./vertical.svg";
  import AutoComplete from "simple-svelte-autocomplete";

  import {
    Button,
    Icon,
    Input,
    Label,
    Type,
    Section,
    SelectMenu,
    Switch
  } from "figma-plugin-ds-svelte";

  let styles = [];
  let availableFontNames = [];
  let availableFontWeights = [];
  let availableFamilies = [];
  let availableWeights = [];
  let selectedStyles = [];
  let fontWeight;
  let familyName;
  let fontSize;
  let lineHeight;

  $: disabled = !selectedStyles.length;
  $: size = styles.length > 8 ? 8 : styles.length
  $: {
    availableWeights = availableFamilies
      .filter(n => n.fontName.family === familyName)
      .map(n => n.fontName.style);
  }


  function update() {
    let originalFamilyNames = getFamilyNames(selectedStyles);
    let originalFontWeights = getFontWeights(selectedStyles);
    let originalFontSizes = getFontSizes(selectedStyles);
    let originalLineHeights = getLineHeights(selectedStyles);
    let values = {};
    values.selectedStyles = selectedStyles;
    if (originalFamilyNames !== familyName) {
      values.familyName = familyName;
    }
    if (originalFontWeights !== fontWeight) {
      values.fontWeight = fontWeight;
    }
    if (originalFontSizes !== fontSize) {
      values.fontSize = Number(fontSize);
    }
    if (originalLineHeights !== lineHeight) {
      values.lineHeight = Number(lineHeight);
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: "update",
          ...values
        }
      },
      "*"
    );
  }

  function cancel() {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  }

  function getFamilyNames(selectedStyles) {
    return [...new Set(selectedStyles.map(n => n.fontName.family))].join(", ");
  }

  function getFontWeights(selectedStyles) {
    return [...new Set(selectedStyles.map(n => n.fontName.style))].join(", ");
  }

  function getFontSizes(selectedStyles) {
    return [...new Set(selectedStyles.map(n => n.fontSize))].join(", ");
  }

  function getLineHeights(selectedStyles) {
    return [...new Set(selectedStyles.map(n => n.lineHeight))].join(", ");
  }

  function setSelectedStyles(e) {
    selectedStyles = Array.from(e.target.selectedOptions, n =>
      JSON.parse(n.value)
    );
    familyName = getFamilyNames(selectedStyles);
    fontWeight = getFontWeights(selectedStyles);
    fontSize = getFontSizes(selectedStyles);
    lineHeight = getLineHeights(selectedStyles);
  }

  onmessage = event => {
    if (event.data.pluginMessage.type === "postStyles") {
      styles = event.data.pluginMessage.styles;
      availableFamilies = event.data.pluginMessage.availableFonts;
      availableFontNames = [
        ...new Set(
          event.data.pluginMessage.availableFonts.map(n => n.fontName.family)
        )
      ];
    }
  };
</script>

<style lang="scss">
  /* Add additional global or scoped styles here */
  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
  }

  hr {
    border: 0;
    height: 1px;
    background: var(--silver);
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

  .type-item:hover {
    background: var(--hover-fill);
  }

  :global(.autocomplete) {
    margin: 0 var(--size-xxsmall);
    position: relative;
    font-family: var(--font-stack) !important;
    font-size: var(--font-size-xsmall);
  }

  :global(.autocomplete-input) {
    height: auto !important;
    border: 1px solid var(--silver);
    border-radius: 2px;
    padding: var(--size-xxsmall) !important;
  }

  :global(.autocomplete-input:focus) {
    outline: none;
    border: 1px solid var(--grey);
  }

  :global(.autocomplete-list) {
    position: absolute !important;
    top: 100% !important;
    margin-top: -1px;
    padding: 0 !important;
    border: 1px solid var(--silver) !important;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  :global(.autocomplete-list-item) {
    padding: var(--size-xxsmall) var(--size-xxsmall) !important;
  }

  :global(.autocomplete-list-item:hover) {
    background-color: var(--hover-fill) !important;
    border: 0;
    color: inherit !important;
  }

  :global(.autocomplete-list-item.selected) {
    background-color: var(--blue) !important;
    border: 0;
  }

  :global(.autocomplete-list-item.selected:hover) {
    color: white !important;
  }

  :global(select::-webkit-scrollbar) {
    width: 9px;
  }

  :global(select::-webkit-scrollbar-thumb) {
    background-color: var(--black3);
    border-radius: 9px;
    border: 2px solid white;
  }
  :global(body::-webkit-scrollbar) {
    width: 9px;
  }

  :global(body::-webkit-scrollbar-thumb) {
    background-color: var(--black3);
    border-radius: 9px;
    border: 2px solid white;
  }
  :global(.autocomplete-list::-webkit-scrollbar) {
    width: 9px;
  }

  :global(.autocomplete-list::-webkit-scrollbar-thumb) {
    background-color: var(--black3);
    border-radius: 9px;
    border: 2px solid white;
  }

  select {
    border: 0;
  }
</style>

<div class="p-xxsmall">
  <div class="styles-wrapper pr-xxsmall">
    {#if styles.length}
      <Label>{styles.length} Text Styles</Label>
      <select
        multiple
        class="type-wrapper"
        {size}
        value={styles}
        on:change={setSelectedStyles}>
        {#each styles as style}
          <option
            value={JSON.stringify(style)}
            class="flex type-item pt-xxsmall pb-xxsmall pl-xxsmall pr-xxsmall">
            {style.name}
          </option>
        {/each}
      </select>
    {:else}
      <Label>No Text Styles found.</Label>
    {/if}
  </div>

  <hr class="mt-small mb-xsmall ml-xxsmall mr-xxsmall" />
  <div class="ml-xxsmall mr-xxsmall mb-xsmall">
    <div class="mb-xxsmall">
      <Type weight="bold">Properties</Type>
    </div>
    {#if selectedStyles.length}
      <Type>Only changed values get updated.</Type>
    {:else}
      <Type>Select one or more styles to begin.</Type>
    {/if}
  </div>
  <fieldset {disabled}>
    <Label>Family</Label>
    <AutoComplete
      placeholder="Font family"
      items={availableFontNames}
      bind:selectedItem={familyName} />

    <Label>Weight</Label>
    <AutoComplete
      placeholder="Font weight"
      items={availableWeights}
      bind:selectedItem={fontWeight} />

    <Label>Size</Label>
    <Input
      name="size"
      bind:value={fontSize}
    />

    <Label>Line height</Label>
    <Input
      name="size"
      bind:value={fontSize}
    />

    <div class="mt-small flex ml-xxsmall mr-xxsmall">
      <Button {disabled} class="mr-xxsmall" on:click={update}>
        Update styles
      </Button>
      <Button variant="secondary" on:click={cancel}>Cancel</Button>
    </div>
  </fieldset>
</div>
