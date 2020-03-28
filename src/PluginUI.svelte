<script>
  import { GlobalCSS } from "figma-plugin-ds-svelte";
  import AutoComplete from "simple-svelte-autocomplete";
  import Input from "./Input.svelte";
  import RefreshCw from "./refresh-cw.svg";
  import Github from "./github.svg";

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

  let styles = [];
  let styleFilter = "";
  let currentFamily = {};
  let availableFontNames = [];
  let availableFamilies = [];
  let availableWeights = [];
  let hasAllWeightsAvailable = true;
  let selectedStyles = [];
  let fontWeight = "";
  let newFontWeights = [];
  let familyName;
  let fontSize;
  let lineHeight;
  let weightsDialogVisible = false;
  let loading = true;

  $: disabled = !selectedStyles.length;
  $: filteredStyles = styles.filter(style => {
    var regex = new RegExp(styleFilter, "gi");
    return style.name.match(regex);
  });
  $: size = filteredStyles.length > 7 ? 7 : filteredStyles.length;
  $: {
    availableWeights = currentFamily.map(n => n.fontName.style);
  }
  $: {
    currentFamily = availableFamilies.filter(
      n => n.fontName.family === familyName
    );
  }
  $: {
    hasAllWeightsAvailable = fontWeight
      ? fontWeight.split(", ").every(e => availableWeights.includes(e))
      : true;
  }

  function showMissingWeightsDialog() {
    weightsDialogVisible = true;
    newFontWeights = fontWeight.split(", ").map(weight => {
      return {
        currentWeight: weight,
        newWeight: weight
      };
    });
  }

  function setFontWeightMappings() {
    weightsDialogVisible = false;
    fontWeight = [...new Set(newFontWeights.map(n => n.newWeight))].join(", ");
  }

  function hasMissingFont(item) {
    return !availableWeights.some(i => i === item);
  }

  function refresh() {
    parent.postMessage(
      {
        pluginMessage: {
          type: "refresh"
        }
      },
      "*"
    );
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
      if (fontWeight.split(", ").length > 1) {
        values.fontMappings = newFontWeights;
      }
      values.fontWeight = fontWeight;
    }
    if (originalFontSizes !== fontSize) {
      values.fontSize = Number(fontSize);
    }
    if (originalLineHeights !== lineHeight) {
      var numbers = /^\d+(\.\d+)?$/;
      if (lineHeight.match(numbers)) {
        values.lineHeight = {
          unit: "PIXELS",
          value: Number(lineHeight)
        };
      } else if (
        lineHeight.trim().slice(-1) === "%" &&
        lineHeight
          .trim()
          .slice(0, -1)
          .match(numbers)
      ) {
        values.lineHeight = {
          unit: "PERCENT",
          value: Number(lineHeight.slice(0, -1))
        };
      } else {
        values.lineHeight = {
          unit: "AUTO"
        };
      }
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
      loading = false;
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
    max-height: calc(5 * (1rem + 10px) + 15px) !important;
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

  .autocomplete-wrapper {
    position: relative;
  }

  .missing-button {
    position: absolute;
    right: 0;
    top: 0;
  }

  .flex-grow {
    flex-grow: 1;
  }

  .ml-auto {
    margin-left: auto;
  }

  select {
    border: 0;
  }

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

{#if weightsDialogVisible}
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
{/if}

<div class="p-xxsmall">
  <div class="styles-wrapper pr-xxsmall">
    {#if loading}LOADING!{/if}
    {#if styles.length}
      <div class="flex justify-content-between align-items-center">
        {#if styleFilter}
          <Type>
            {filteredStyles.length} Text Styles matching
            <Type weight="bold" inline>{styleFilter}</Type>
          </Type>
        {:else}
          <Type>{styles.length} Text Styles</Type>
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
      <select
        multiple
        class="type-wrapper"
        {size}
        value={filteredStyles}
        on:change={setSelectedStyles}>
        {#each filteredStyles as style}
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
    <div class="autocomplete-wrapper">
      <AutoComplete
        placeholder="Font weight"
        items={availableWeights}
        bind:selectedItem={fontWeight} />
      {#if !hasAllWeightsAvailable && familyName.split(', ').length === 1}
        <div class="missing-button pr-xxsmall">
          <IconButton
            iconName={IconWarning}
            on:click={showMissingWeightsDialog} />
        </div>
      {/if}
    </div>
    <div class="flex justify-content-between">
      <div class="flex-grow">
        <Label>Size</Label>
        <Input
          placeholder="Font Size"
          class="ml-xxsmall mr-xxsmall"
          name="size"
          bind:value={fontSize} />
      </div>
      <div class="flex-grow">
        <Label>Line height</Label>
        <Input
          placeholder="Line height"
          class="ml-xxsmall mr-xxsmall"
          name="lineheight"
          bind:value={lineHeight} />
      </div>
    </div>

    <div class="mt-small flex ml-xxsmall mr-xxsmall mb-xsmall">
      <Button {disabled} class="mr-xxsmall" on:click={update}>
        Update styles
      </Button>
      <Button variant="secondary" on:click={cancel}>Cancel</Button>
      <div class="ml-auto">
        <a href="https://github.com/six7/figma-batch-styler" target="_blank">
          <IconButton iconName={Github} />
        </a>
      </div>
    </div>
  </fieldset>
</div>
