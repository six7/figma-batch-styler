<script>
  import { GlobalCSS } from "figma-plugin-ds-svelte";
  import { onMount } from "svelte";
  import TextStyles from "./TextStyles.svelte";
  import ColorStyles from "./ColorStyles.svelte";
  import NoneFound from "./NoneFound.svelte";
  import Loading from "./Loading.svelte";
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
  let isResizing = false;
  let initialWidth = 400;
  let initialHeight = 780;
  let currentWidth = initialWidth;
  let currentHeight = initialHeight;
  
  // Minimum and maximum size constraints
  const MIN_WIDTH = 300;
  const MIN_HEIGHT = 400;
  const MAX_WIDTH = 800;
  const MAX_HEIGHT = 1000;

  async function trackData(receivedEvents = []) {
    let events = receivedEvents.map(e => {
      return {
        ...e,
        user_id: "placeholder@placeholder.com"
      };
    });
    const data = {
      api_key: "f6e5890a03d9d9dc4f98f65f16a33838",
      events
    };

    try {
      const response = await fetch("https://api.amplitude.com/2/httpapi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.log("error", e);
    }
  }

  onMount(() => {
    setTimeout(() => {
      sendToUI({
        type: "refresh"
      });
    }, 1000);
  });

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
      if (!textStyles.length && colorStyles.length) {
        visible = "color";
      }
      loading = false;
    }
    if (event.data.pluginMessage.type === "trackEvent") {
      trackData(event.data.pluginMessage.data);
    }
  };
  
  function startResize(event) {
    isResizing = true;
    initialWidth = currentWidth;
    initialHeight = currentHeight;
    
    // Add event listeners for mouse movement and mouse up
    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', stopResize);
    
    // Prevent default behavior to avoid text selection during resize
    event.preventDefault();
  }
  
  function handleResize(event) {
    if (!isResizing) return;
    
    // Calculate new width and height based on mouse movement
    const newWidth = Math.min(Math.max(initialWidth + event.movementX, MIN_WIDTH), MAX_WIDTH);
    const newHeight = Math.min(Math.max(initialHeight + event.movementY, MIN_HEIGHT), MAX_HEIGHT);
    
    // Update current dimensions
    currentWidth = newWidth;
    currentHeight = newHeight;
    
    // Send resize message to the plugin
    parent.postMessage({
      pluginMessage: {
        type: 'resize',
        width: newWidth,
        height: newHeight
      }
    }, '*');
  }
  
  function stopResize() {
    isResizing = false;
    
    // Remove event listeners
    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', stopResize);
  }
</script>

<style lang="scss">
  /* Add additional global or scoped styles here */
  
  .resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 16px;
    height: 16px;
    cursor: nwse-resize;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }
  
  .resize-handle-icon {
    width: 8px;
    height: 8px;
    border-right: 2px solid var(--black3);
    border-bottom: 2px solid var(--black3);
  }

  .tab-button {
    background: var(--selection-a);
    border-bottom: 1px solid var(--selection-b);
    padding: var(--size-xsmall);
    font-family: var(--font-stack);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-small);
    flex-grow: 1;
    outline: none;
    border: none;
    cursor: pointer;
    transition: background 300ms;
  }

  .tab-button:hover {
    background: var(--selection-b);
  }

  .tab-button-active {
    background: var(--blue);
    color: white;
  }

  .tab-button-active:hover {
    background: var(--blue);
    color: white;
  }

  .outer-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .gh-link {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .inner-wrapper {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: space-between;
  }

  :global(body::-webkit-scrollbar) {
    width: 9px;
  }

  :global(body::-webkit-scrollbar-thumb) {
    background-color: var(--black3);
    border-radius: 9px;
    border: 2px solid white;
  }
</style>

<div class="outer-wrapper">
  <div class="flex justify-content-between">
    <button
      class="tab-button {visible === 'text' ? 'tab-button-active' : ''}"
      name="text"
      on:click={setVisible}>
      Text
    </button>
    <button
      class="tab-button {visible === 'color' ? 'tab-button-active' : ''}"
      name="color"
      on:click={setVisible}>
      Color
    </button>
  </div>
  <div class="p-xxsmall inner-wrapper">
    {#if loading}
      <Loading />
    {:else}
      {#if textStyles.length || colorStyles.length}
        {#if visible === 'text'}
          {#if textStyles.length}
            <TextStyles {sendToUI} styles={textStyles} {availableFamilies} />
          {:else}
            <NoneFound>No Text Styles found</NoneFound>
          {/if}
        {/if}
        {#if visible === 'color'}
          {#if colorStyles.length}
            <ColorStyles {sendToUI} styles={colorStyles} />
          {:else}
            <NoneFound>No Color Styles found</NoneFound>
          {/if}
        {/if}
      {:else}
        <NoneFound>No Styles found</NoneFound>
      {/if}
      <div
        class="ml-xxsmall mr-xxsmall flex justify-content-between
        align-items-center">
        <Type>
          More information at
          <a
            href="https://jansix.at/resources/figma-batch-styler?ref=batch-styler-plugin"
            style="text-decoration: underline;"
            target="_blank">
            jansix.at
          </a>
        </Type>
        <a
          class="gh-link"
          href="https://github.com/six7/figma-batch-styler"
          target="_blank">
          <IconButton iconName={Github} />
        </a>
      </div>
    {/if}
  </div>
  <div class="resize-handle" on:mousedown={startResize}>
    <div class="resize-handle-icon"></div>
  </div>
</div>
