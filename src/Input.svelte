<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let id = null;
  export let value = null;
  export let name = null;
  export let iconText = null;
  export let borders = false;
  export let disabled = false;
  export let iconName = null;
  export let spin = false;
  export let placeholder = "Input something here...";
  export { className as class };

  const handleInput = e => {
    console.log("change", e);
    dispatch("input", e.target);
  };

  let className = "";
</script>

<style>
  .input {
    position: relative;
  }

  input {
    font-size: var(--font-size-xsmall);
    font-weight: var(--font-weight-normal);
    letter-spacing: var(--font-letter-spacing-neg-xsmall);
    line-height: var(--line-height);
    position: relative;
    display: flex;
    overflow: visible;
    align-items: center;
    width: 100%;
    height: 30px;
    margin: 1px 0 1px 0;
    padding: 7px 4px 9px 7px;
    color: var(--black8);
    border: 1px solid transparent;
    border-radius: var(--border-radius-small);
    outline: none;
    background-color: var(--white);
  }
  input:hover,
  input:placeholder-shown:hover {
    color: var(--black8);
    border: 1px solid var(--black1);
    background-image: none;
  }
  input::selection {
    color: var(--black);
    background-color: var(--blue3);
  }
  input::placeholder {
    color: var(--black3);
    border: 1px solid transparent;
  }
  input:placeholder-shown {
    border: 1px solid transparent;
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcAAAAABCAYAAABJ5n7WAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgSURBVHgB7cMBCQAACMTAiR3sX1TQHr+DK2B+I0lSjj29qAEYlIbeBgAAAABJRU5ErkJggg==");
    background-repeat: no-repeat;
    background-position: center bottom -0.99px;
    background-size: calc(100% - 10px) 1px;
  }
  input:focus:placeholder-shown {
    border: 1px solid var(--blue);
    outline: 1px solid var(--blue);
    outline-offset: -2px;
  }
  input:disabled:hover {
    border: 1px solid transparent;
  }
  input:active,
  input:focus {
    padding: 7px 4px 9px 7px;

    color: var(--black);
    border: 1px solid var(--blue);
    outline: 1px solid var(--blue);
    outline-offset: -2px;
  }
  input:disabled {
    position: relative;
    color: var(--black3);
    background-image: none;
  }
  input:disabled:active {
    padding: 7px 4px 9px 7px;
    outline: none;
  }

  .borders {
    border: 1px solid var(--black1);
    background-image: none;
  }
  .borders:disabled {
    border: 1px solid transparent;
    background-image: none;
  }
  .borders:disabled:placeholder-shown {
    border: 1px solid transparent;
    background-image: none;
  }
  .borders:disabled:placeholder-shown:active {
    border: 1px solid transparent;
    outline: none;
  }
  .borders:placeholder-shown {
    border: 1px solid var(--black1);
    background-image: none;
  }

  .indent {
    text-indent: 24px;
  }

  .icon {
    position: absolute;
    top: -1px;
    left: 0;
    width: var(--size-medium);
    height: var(--size-medium);
    z-index: 1;
  }
</style>

{#if iconName || iconText}
  <div class="input-icon">
    <div class="input-icon__icon">
      <div
        class="icon icon--angle icon--black-3"
        style="color: var(--black-3); fill: var(--black-3)" />

    </div>
    <input
      bind:value
      type="type"
      {id}
      {name}
      {disabled}
      {placeholder}
      class="input-icon__input"
      class:borders
      on:input={handleInput} />
  </div>
{:else}
  <div class="input {className}">
    <input
      type="input"
      bind:value
      {id}
      {name}
      {disabled}
      {placeholder}
      class:borders
      on:input={handleInput} />
  </div>
{/if}
