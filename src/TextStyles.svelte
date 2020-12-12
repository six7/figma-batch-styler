<script>
  import { GlobalCSS } from "figma-plugin-ds-svelte";
  import AutoComplete from "simple-svelte-autocomplete";
  import Input from "./Input.svelte";
  import Selector from "./Selector.svelte";
  import MissingWeightsDialog from "./MissingWeightsDialog.svelte";
  import {
    convertLetterSpacingToFigma,
    convertLineHeightToFigma
  } from "./helpers.ts";

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
  let styleFilter = "",
    currentFamily = {},
    availableFontNames = [],
    availableWeights = [],
    hasAllWeightsAvailable = true,
    selectedStyles = [],
    fontWeight = "",
    newFontWeights = [],
    familyName,
    styleName = "",
    styleMatch,
    fontSize,
    lineHeight,
    letterSpacing,
    weightsDialogVisible = false,
    loading = true;

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
    let originalLetterSpacings = getLetterSpacings(selectedStyles);
    let values = {};
    values.selectedStyles = selectedStyles;
    values.styleMatch = styleMatch;
    values.styleName = styleName;
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
      values.fontSize = fontSize;
    }
    if (originalLineHeights !== lineHeight) {
      values.lineHeight = lineHeight;
    }
    if (originalLetterSpacings !== letterSpacing) {
      values.letterSpacing = letterSpacing;
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

  function getLetterSpacings(selectedStyles) {
    return [...new Set(selectedStyles.map(n => n.letterSpacing))].join(", ");
  }

  function setSelectedStyles(selected) {
    selectedStyles = selected;
    familyName = getFamilyNames(selected);
    fontWeight = getFontWeights(selected);
    fontSize = getFontSizes(selected);
    lineHeight = getLineHeights(selected);
    letterSpacing = getLetterSpacings(selected);
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

  :global(input:disabled) {
    background-color: white;
  }

  .missing-button {
    position: absolute;
    right: 0;
    top: 0;
  }

  .flex-grow {
    flex-grow: 1;
  }
</style>

<div>
  {#if weightsDialogVisible}
    <MissingWeightsDialog
      {newFontWeights}
      {availableWeights}
      {setFontWeightMappings} />
  {/if}

  <div class="styles-wrapper">
    <Selector type="Text" {styles} {setSelectedStyles} {sendToUI} />
  </div>

  <hr class="mt-xxsmall" />
  <form on:submit={e => e.preventDefault()}>

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
        <div class="flex-grow">
          <Label>Letter Spacing</Label>
          <Input
            placeholder="% or px"
            class="ml-xxsmall mr-xxsmall"
            name="letterspacing"
            bind:value={letterSpacing} />
        </div>
      </div>

      <Label>Name</Label>
      <div class="flex flex-row flex-between space-x-2">
        <Input
          placeholder="Find"
          class="ml-xxsmall mr-xxsmall flex-grow"
          name="match"
          bind:value={styleMatch} />
        <Input
          placeholder="Replace"
          class="ml-xxsmall mr-xxsmall flex-grow"
          name="name"
          bind:value={styleName} />
      </div>
      <div class="mt-xsmall flex ml-xxsmall mr-xxsmall">
        <Button {disabled} on:click={update}>Update styles</Button>
      </div>
    </fieldset>
  </form>
</div>
