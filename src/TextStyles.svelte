<script>
  import { GlobalCSS } from "figma-plugin-ds-svelte";
  import AutoComplete from "simple-svelte-autocomplete";
  import Input from "./Input.svelte";
  import Selector from "./Selector.svelte";
  import MissingWeightsDialog from "./MissingWeightsDialog.svelte";
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

  export let styles = [];
  export let availableFamilies = [];
  export let sendToUI;
  let styleFilter = "";
  let currentFamily = {};
  let availableFontNames = [];
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
  $: {
    availableWeights = currentFamily.map(n => n.fontName.style);
  }
  $: {
    availableFontNames = [
      ...new Set(availableFamilies.map(n => n.fontName.family))
    ];
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

    sendToUI({
      type: "update",
      values,
      variant: "TEXT"
    });
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

  function setSelectedStyles(selected) {
    selectedStyles = selected;
    familyName = getFamilyNames(selected);
    fontWeight = getFontWeights(selected);
    fontSize = getFontSizes(selected);
    lineHeight = getLineHeights(selected);
  }
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
</style>

<div>
  {#if weightsDialogVisible}
    <MissingWeightsDialog
      {newFontWeights}
      {availableWeights}
      {setFontWeightMappings} />
  {/if}

  <div class="styles-wrapper pr-xxsmall">
    <Selector type="Text" {styles} {setSelectedStyles} {sendToUI} />
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
      <div class="ml-auto">
        <a href="https://github.com/six7/figma-batch-styler" target="_blank">
          <IconButton iconName={Github} />
        </a>
      </div>
    </div>
  </fieldset>
</div>
