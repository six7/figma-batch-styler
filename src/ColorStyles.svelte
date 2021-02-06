<script>
  import Selector from "./Selector.svelte";
  import Input from "./Input.svelte";
  import Hue from "svelte-color/Hue.svelte";
  import { rgbToHsl, figmaRGBToHex } from "./color-helpers.js";
  import {
    Button,
    Icon,
    IconButton,
    Label,
    Type,
    Section,
    SelectMenu,
    Switch,
    IconWarning,
  } from "figma-plugin-ds-svelte";

  export let styles = [];
  export let sendToUI;

  let styleFilter = "",
    selectedStyles = [],
    colors = [],
    hslValues = [],
    hue = "",
    saturation = "",
    lightness = "",
    alpha = "",
    hex = "",
    chrome,
    color,
    styleName = "",
    description = "",
    styleMatch;

  $: disabled = !selectedStyles.length;

  function remove() {
    sendToUI({
      type: "remove",
      values: {
        selectedStyles,
      },
    });
  }

  function update() {
    let originalHue = getHue(selectedStyles);
    let originalSaturation = getSaturation(selectedStyles);
    let originalLightness = getLightness(selectedStyles);
    let originalAlpha = getAlpha(selectedStyles);
    let originalHex = getHex(selectedStyles);
    let values = {};
    values.selectedStyles = selectedStyles;
    if (originalHue !== hue) {
      values.hue = hue;
    }
    if (originalSaturation !== saturation) {
      values.saturation = saturation;
    }
    if (originalLightness !== lightness) {
      values.lightness = lightness;
    }
    if (originalAlpha !== alpha) {
      values.alpha = alpha;
    }
    if (originalHex !== hex) {
      values.hex = hex;
    }
    values.description = description;
    values.styleMatch = styleMatch;
    values.styleName = styleName;

    sendToUI({
      type: "update",
      values,
      variant: "COLOR",
    });
  }

  const handleInput = (event) => {
    const { h, s, l } = event.detail;
  };

  function getColors(styles) {
    return [
      ...new Set(
        styles.map((n) => {
          let paints = n.paints.filter((n) => n.type === "SOLID");
          if (!paints) return;
          return paints[0].color;
        })
      ),
    ];
  }

  function getHSLValues(styles) {
    return getColors(styles).map((c) => convertToHsl(c));
  }

  function getHexValues(styles) {
    return getColors(styles).map((c) => convertToHex(c));
  }

  function getHue(styles) {
    let hsl = getHSLValues(styles);
    return [...new Set(hsl.map((c) => c.h))].join(", ");
  }

  function getSaturation(styles) {
    let hsl = getHSLValues(styles);
    return [...new Set(hsl.map((c) => c.s))].join(", ");
  }

  function getLightness(styles) {
    let hsl = getHSLValues(styles);
    return [...new Set(hsl.map((c) => c.l))].join(", ");
  }

  function getAlpha(styles) {
    return [...new Set(styles.map((c) => c.paints[0].opacity))].join(", ");
  }

  function getHex(styles) {
    let hexValues = getHexValues(styles);
    return [...new Set(hexValues)].join(", ");
  }

  function convertToHsl({ r, g, b }) {
    let rawHsl = rgbToHsl(r * 255, g * 255, b * 255);
    let [h, s, l] = rawHsl;
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return { h, s, l };
  }

  function convertToHex({ r, g, b }) {
    let hex = figmaRGBToHex({ r, g, b });
    return hex;
  }

  function setSelectedStyles(selected) {
    selectedStyles = selected;
    hue = getHue(selectedStyles);
    saturation = getSaturation(selectedStyles);
    lightness = getLightness(selectedStyles);
    alpha = getAlpha(selectedStyles);
    hex = getHex(selectedStyles);
    description = selected[0].description;
  }
</script>

<div>
  <div class="styles-wrapper">
    <Selector type="Color" {styles} {setSelectedStyles} {sendToUI} />
  </div>

  <hr class="mt-xsmall mb-xsmall ml-xxsmall mr-xxsmall" />
  <form on:submit={(e) => e.preventDefault()}>
    <fieldset {disabled}>
      <div class="ml-xxsmall mr-xxsmall mb-xxsmall mt-xsmall">
        <Hue
          class="hue-wrapper {disabled ? 'disabled' : ''}"
          bind:h={hue}
          on:input={handleInput}
        />
      </div>
      <div class="flex justify-content-between">
        <div class="flex-grow">
          <Label>Hue</Label>
          <Input
            placeholder="Hue"
            class="ml-xxsmall mr-xxsmall"
            name="hue"
            bind:value={hue}
          />
        </div>
        <div class="flex-grow">
          <Label>Saturation</Label>
          <Input
            placeholder="Saturation"
            class="ml-xxsmall mr-xxsmall"
            name="saturation"
            bind:value={saturation}
          />
        </div>
        <div class="flex-grow">
          <Label>Lightness</Label>
          <Input
            placeholder="Lightness"
            class="ml-xxsmall mr-xxsmall"
            name="lightness"
            bind:value={lightness}
          />
        </div>
        <div class="flex-grow">
          <Label>Alpha</Label>
          <Input
            placeholder="Alpha"
            class="ml-xxsmall mr-xxsmall"
            name="alpha"
            bind:value={alpha}
          />
        </div>
      </div>
      <div class="flex-grow">
        <Label>Hex</Label>
        <Input
          placeholder="Hex"
          class="ml-xxsmall mr-xxsmall"
          name="hue"
          bind:value={hex}
        />
      </div>

      <Label>Name</Label>
      <div class="flex flex-row flex-between space-x-2">
        <Input
          placeholder="Find"
          class="ml-xxsmall mr-xxsmall"
          name="match"
          bind:value={styleMatch}
        />
        <Input
          placeholder="Replace"
          class="ml-xxsmall mr-xxsmall"
          name="name"
          bind:value={styleName}
        />
      </div>
      <Label>Description</Label>
      <Input
        placeholder="Description"
        class="ml-xxsmall mr-xxsmall"
        name="description"
        bind:value={description}
      />
      <div class="mt-xsmall flex ml-xxsmall mr-xxsmall justify-between">
        <Button {disabled} on:click={update}>Update styles</Button>
        <Button variant="secondary" {disabled} on:click={remove}>
          Delete selected
        </Button>
      </div>
    </fieldset>
  </form>
</div>

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

  .flex {
    display: flex;
  }

  .flex-row {
    flex-direction: row;
  }

  .justify-between {
    justify-content: space-between;
  }

  :global(.hue-wrapper) {
    border-radius: 50px;
  }

  :global(.disabled) {
    opacity: 0.3;
    filter: grayscale();
    pointer-events: none;
  }
</style>
