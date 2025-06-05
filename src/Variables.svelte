<script>
  import {
    Button,
    Checkbox,
    Icon,
    IconButton,
    Input,
    Label,
    Type,
    Section,
    SelectMenu
  } from "figma-plugin-ds-svelte";
  import { onMount, createEventDispatcher } from "svelte";
  import Selector from "./Selector.svelte";

  export let sendToUI, variables, collections;
  let selectedVariables = [];
  let selectedCollection = "all";
  let selectedType = "all";
  
  // Form inputs
  let variableName = "";
  let variableMatch = "";
  let description = "";
  let newValues = {};
  
  // Get unique variable types
  $: variableTypes = ["all", ...new Set(variables.map(v => v.resolvedType))];
  
  // Collection options for filtering
  $: collectionOptions = [
    { value: "all", label: "All Collections" },
    ...collections.map(c => ({ value: c.id, label: c.name }))
  ];

  // Filter variables based on selection
  $: filteredVariables = variables.filter(variable => {
    const matchesCollection = selectedCollection === "all" || 
      variable.collectionId === selectedCollection;
    
    const matchesType = selectedType === "all" || 
      variable.resolvedType === selectedType;
    
    return matchesCollection && matchesType;
  });

  $: disabled = !selectedVariables.length;

  function setSelectedVariables(selected) {
    selectedVariables = selected;
    description = selected.length ? selected[0].description : "";
    newValues = {};
  }

  function update() {
    if (!selectedVariables.length) return;
    
    // Convert hex color values to Figma format if needed
    let processedValues = {};
    if (newValues && Object.keys(newValues).length) {
      for (const [modeId, value] of Object.entries(newValues)) {
        if (selectedVariables[0].resolvedType === 'COLOR' && typeof value === 'string' && value.startsWith('#')) {
          // Convert hex to RGB
          const hex = value.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16) / 255;
          const g = parseInt(hex.substr(2, 2), 16) / 255;
          const b = parseInt(hex.substr(4, 2), 16) / 255;
          processedValues[modeId] = { r, g, b };
        } else {
          processedValues[modeId] = value;
        }
      }
    }
    
    sendToUI({
      type: "update",
      variant: "VARIABLE",
      values: {
        selectedVariables,
        variableName: variableName || null,
        variableMatch: variableMatch || null,
        description: description !== "" ? description : null,
        newValues: Object.keys(processedValues).length ? processedValues : null
      }
    });
  }

  function remove() {
    if (!selectedVariables.length) return;
    
    sendToUI({
      type: "remove",
      variant: "VARIABLE",
      values: {
        selectedVariables
      }
    });
  }
</script>

<style>
  .variables-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .filters-section {
    padding: 0 var(--size-xxsmall);
    margin-bottom: var(--size-xxsmall);
  }

  .filters-row {
    display: flex;
    gap: var(--size-xxsmall);
  }

  .filter-select {
    flex: 1;
  }

  .styles-wrapper {
    flex-grow: 1;
    overflow-y: auto;
  }

  .value-input-group {
    margin-bottom: var(--size-xxsmall);
  }

  .mode-input {
    display: flex;
    align-items: center;
    gap: var(--size-xxsmall);
    margin-bottom: var(--size-xxxsmall);
  }

  .mode-label {
    font-size: var(--font-size-xsmall);
    color: var(--black8);
    min-width: 80px;
  }

  hr {
    border: 0;
    height: 1px;
    background: var(--silver);
  }

  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
  }

  .flex {
    display: flex;
  }

  .justify-between {
    justify-content: space-between;
  }
</style>

<div class="variables-wrapper">
  <div class="filters-section">
    <div class="filters-row mb-xxsmall">
      <div class="filter-select">
        <SelectMenu
          bind:value={selectedCollection}
          options={collectionOptions}
          placeholder="Filter by collection"
        />
      </div>
      <div class="filter-select">
        <SelectMenu
          bind:value={selectedType}
          options={variableTypes.map(t => ({ value: t, label: t === "all" ? "All Types" : t }))}
          placeholder="Filter by type"
        />
      </div>
    </div>
  </div>

  <div class="styles-wrapper">
    <Selector 
      type="Variable" 
      styles={filteredVariables} 
      {setSelectedVariables} 
      {sendToUI} 
    />
  </div>

  <hr class="mt-xsmall mb-xsmall ml-xxsmall mr-xxsmall" />

  <form on:submit={(e) => e.preventDefault()}>
    <fieldset {disabled}>
      <div class="ml-xxsmall mr-xxsmall">
        <Label>Name</Label>
        <div class="flex flex-row justify-between space-x-2">
          <Input
            placeholder="Find"
            class="mr-xxsmall"
            name="match"
            bind:value={variableMatch}
          />
          <Input
            placeholder="Replace"
            class="ml-xxsmall"
            name="name"
            bind:value={variableName}
          />
        </div>

        <Label>Description</Label>
        <Input
          placeholder="Description"
          class="mb-xxsmall"
          name="description"
          bind:value={description}
        />

        {#if selectedVariables.length === 1 && selectedVariables[0].valuesByMode}
          <div class="value-input-group">
            <Label>Values by Mode</Label>
            {#each Object.entries(selectedVariables[0].valuesByMode) as [modeId, modeData]}
              <div class="mode-input">
                <span class="mode-label">{modeData.modeName}:</span>
                {#if selectedVariables[0].resolvedType === 'COLOR'}
                  <Input
                    bind:value={newValues[modeId]}
                    placeholder="#FF0000"
                  />
                {:else if selectedVariables[0].resolvedType === 'FLOAT'}
                  <Input
                    type="number"
                    bind:value={newValues[modeId]}
                    placeholder={String(modeData.value)}
                  />
                {:else if selectedVariables[0].resolvedType === 'STRING'}
                  <Input
                    bind:value={newValues[modeId]}
                    placeholder={modeData.value || "Text value"}
                  />
                {:else if selectedVariables[0].resolvedType === 'BOOLEAN'}
                  <Checkbox bind:checked={newValues[modeId]}>
                    {newValues[modeId] ? 'True' : 'False'}
                  </Checkbox>
                {/if}
              </div>
            {/each}
          </div>
        {/if}

        <div class="mt-xsmall flex justify-between">
          <Button {disabled} on:click={update}>Update variables</Button>
          <Button variant="secondary" {disabled} on:click={remove}>
            Delete selected
          </Button>
        </div>
      </div>
    </fieldset>
  </form>
</div>