<script>
  import Selector from "./Selector.svelte";
  import Input from "./Input.svelte";
  import Hue from "svelte-color/Hue.svelte";
  import { rgbToHsl } from "./color-helpers.js";
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
  export let sendToUI;

  let styleFilter = "";
  let selectedStyles = [];
  let colors = [];
  let hslValues = [];
  let hue = "";
  let saturation = "";
  let lightness = "";
  let chrome;
  let color;

  $: disabled = !selectedStyles.length;

  function update() {
    let originalHue = getHue(selectedStyles);
    let originalSaturation = getSaturation(selectedStyles);
    let originalLightness = getLightness(selectedStyles);
    let values = {};
    values.selectedStyles = selectedStyles;
    if (originalHue !== hue) {
      values.hue = Number(hue);
    }
    if (originalSaturation !== saturation) {
      values.saturation = Number(saturation);
    }
    if (originalLightness !== lightness) {
      values.lightness = Number(lightness);
    }

    sendToUI({
      type: "update",
      values,
      variant: "COLOR"
    });
  }

  const handleInput = event => {
    const { h, s, l } = event.detail;
  };

  function getColors(styles) {
    let rgbValues = [
      ...new Set(
        styles.map(n => {
          let paints = n.paints.filter(n => n.type === "SOLID");
          if (!paints) return;
          return paints[0].color;
        })
      )
    ];

    return rgbValues.map(c => convertToHsl(c));
  }

  function getHue(styles) {
    let hsl = getColors(styles);
    return [...new Set(hsl.map(c => c.h))].join(", ");
  }

  function getSaturation(styles) {
    let hsl = getColors(styles);
    return [...new Set(hsl.map(c => c.s))].join(", ");
  }

  function getLightness(styles) {
    let hsl = getColors(styles);
    return [...new Set(hsl.map(c => c.l))].join(", ");
  }

  function convertToHsl(color) {
    const { r, g, b } = color;
    let rawHsl = rgbToHsl(r * 255, g * 255, b * 255);
    let [h, s, l] = rawHsl;
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return { h, s, l };
  }

  function setSelectedStyles(selected) {
    selectedStyles = selected;
    hue = getHue(selectedStyles);
    saturation = getSaturation(selectedStyles);
    lightness = getLightness(selectedStyles);
  }
</script>

<style lang="scss">
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

  :global(.hue-wrapper) {
    border-radius: 50px;
  }
</style>

<div>
  <div class="styles-wrapper pr-xxsmall">
    <Selector type="Color" {styles} {setSelectedStyles} {sendToUI} />
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
    <div>
      <Hue class="hue-wrapper" bind:h={hue} on:input={handleInput} />
    </div>
    <div class="flex justify-content-between">
      <div class="flex-grow">
        <Label>Hue</Label>
        <Input
          placeholder="Hue"
          class="ml-xxsmall mr-xxsmall"
          name="hue"
          bind:value={hue} />
      </div>
      <div class="flex-grow">
        <Label>Saturation</Label>
        <Input
          placeholder="Saturation"
          class="ml-xxsmall mr-xxsmall"
          name="saturation"
          bind:value={saturation} />
      </div>
      <div class="flex-grow">
        <Label>Lightness</Label>
        <Input
          placeholder="Lightness"
          class="ml-xxsmall mr-xxsmall"
          name="lightness"
          bind:value={lightness} />
      </div>
    </div>
    <div class="mt-small flex ml-xxsmall mr-xxsmall mb-xsmall">
      <Button {disabled} class="mr-xxsmall" on:click={update}>
        Update styles
      </Button>
    </div>
  </fieldset>
</div>
