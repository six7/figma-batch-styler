<script>
  //import Global CSS from the svelte boilerplate
  //contains Figma color vars, spacing vars, utility classes and more
  import { GlobalCSS } from "figma-plugin-ds-svelte";
  import Padding from "./padding.svg";
  import Horizontal from "./horizontal.svg";
  import Vertical from "./vertical.svg";
  import AutoComplete from "simple-svelte-autocomplete";

  //import some Svelte Figma UI components
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

  var styles = [];
  let availableFontNames = [];
  let availableFontWeights = [];
  let availableFamilies = [];
  let availableWeights = [];
  let selectedStyles = [];
  var fontWeight;
  let familyName;

  //this is a reactive variable that will return false when a value is selected from
  //the select menu, its value is bound to the primary buttons disabled prop

  $: disabled = !selectedStyles.length;
  $: {
    console.log({ familyName });
    availableWeights = availableFamilies
      .filter(n => n.fontName.family === familyName)
      .map(n => n.fontName.style);
  }
  // $: {
  //   let names = [...new Set(selectedStyles.map(n => n.familyName.family))]
  //   if (names.length === 1) familyName = names[0];
  //   if (names.length > 1) familyName = "-"
  // 	console.log({familyName, names})
  // }

  const colors = ["White", "Red", "Yellow", "Green", "Blue", "Black"];
  let selectedColor;

  function update() {
    let originalFamilyNames = getFamilyNames(selectedStyles);
    let originalFontWeights = getFontWeights(selectedStyles);
    let values = {};
    values.selectedStyles = selectedStyles;
    if (originalFamilyNames !== familyName) {
      values.familyName = familyName;
    }
    if (originalFontWeights !== fontWeight) {
      values.fontWeight = fontWeight;
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

  function changefamilyName(e) {
    console.log("changing", { e });
  }

  function getFamilyNames(selectedStyles) {
    return [...new Set(selectedStyles.map(n => n.fontName.family))].join(" ");
  }

  function getFontWeights(selectedStyles) {
    return [...new Set(selectedStyles.map(n => n.fontName.style))].join(" ");
  }

  function setSelectedStyles(e) {
    selectedStyles = Array.from(e.target.selectedOptions, n =>
      JSON.parse(n.value)
    );
    familyName = getFamilyNames(selectedStyles);
    fontWeight = getFontWeights(selectedStyles);
  }

  function setSelectedFamily(e) {
    familyName = e.target.value;
  }

  function setSelectedWeight(e) {
    fontWeight = e.target.value;
  }

  onmessage = event => {
    if (event.data.pluginMessage.type === "postStyles") {
      styles = event.data.pluginMessage.styles;
      availableFamilies = event.data.pluginMessage.availableFonts;
      console.log(availableFamilies[5]);
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

  .w-full {
    width: 100%;
  }

  .type-wrapper:focus {
    outline: none;
  }

  .type-item {
    background: none;
    border: 0;
    font-size: var(--font-size-xsmall);
    font-family: var(--font-stack);
  }

  .type-item:hover {
    background: var(--hover-fill);
  }

  :global(.autocomplete) {
    position: relative;
  }

  :global(.autocomplete-input) {
    height: auto !important;
  }

  :global(.autocomplete-list) {
    position: absolute !important;
    top: 100% !important;
    font-family: var(--font-stack) !important;
    font-size: var(--font-size-xsmall);
  }

  select {
    border: 0;
  }
</style>

<div class="wrapper p-xxsmall">
  <div class="styles-wrapper">
    {#if styles.length}
      <Type weight="bold" size="small">Found styles</Type>
      <select
        multiple
        class="w-full type-wrapper"
        size="8"
        value={styles}
        on:change={setSelectedStyles}>
        {#each styles as style}
          <option
            value={JSON.stringify(style)}
            class="flex w-full type-item pt-xxsmall pb-xxsmall">
            {style.name}
          </option>
        {/each}
      </select>
    {:else}
      <Type weight="bold" size="small">No styles found</Type>
    {/if}
  </div>

  <Label>Family</Label>
  <AutoComplete items={availableFontNames} bind:selectedItem={familyName} />

  <Label>Weight</Label>
  <AutoComplete items={availableWeights} bind:selectedItem={fontWeight} />

  <div class="mt-small">
    <fieldset {disabled}>
      <div class="flex">
        <Button {disabled} class="mr-xxsmall" on:click={update}>
          Update styles
        </Button>
        <Button variant="secondary" on:click={cancel}>Cancel</Button>
      </div>
    </fieldset>
  </div>
</div>
