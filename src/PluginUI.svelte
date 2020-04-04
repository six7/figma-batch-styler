<script>
  import { GlobalCSS } from "figma-plugin-ds-svelte";
  import TextStyles from "./TextStyles.svelte";
  import ColorStyles from "./ColorStyles.svelte";
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

  let textStyles = [];
  let colorStyles = [];
  let availableFamilies = [];
  let loading = true;
  let visible = "text";

  function sendToUI({ type, variant, values = {} }) {
    parent.postMessage(
      {
        pluginMessage: {
          type,
          variant,
          ...values
        }
      },
      "*"
    );
  }

  function cancel() {
    sendToUI({
      type: "cancel"
    });
  }

  function setVisible(e) {
    visible = e.target.name;
  }

  onmessage = event => {
    if (event.data.pluginMessage.type === "postStyles") {
      textStyles = event.data.pluginMessage.textStyles;
      colorStyles = event.data.pluginMessage.colorStyles;
      availableFamilies = event.data.pluginMessage.availableFonts;
      loading = false;
    }
  };
</script>

<div>
  <button name="text" on:click={setVisible}>Text</button>
  <button name="color" on:click={setVisible}>Color</button>
</div>
<div class="p-xxsmall">
  {#if loading}LOADING!{/if}
  {#if visible === 'text'}
    <TextStyles {sendToUI} styles={textStyles} {availableFamilies} />
  {/if}
  {#if visible === 'color'}
    <ColorStyles {sendToUI} styles={colorStyles} />
  {/if}
</div>
