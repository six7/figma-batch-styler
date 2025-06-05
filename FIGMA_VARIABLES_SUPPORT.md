# Figma Variables Support

This document describes the Figma Variables support that has been added to the Batch Styler plugin.

## Overview

The Batch Styler plugin now supports managing Figma Variables in addition to Text and Color styles. This allows users to:

- View all variables in their Figma file
- Filter variables by collection and type
- Batch edit variable names, descriptions, and values
- Delete multiple variables at once

## Implementation Details

### 1. Backend (code.ts)

Added new functions to handle variables:

- `sendVariables()`: Fetches all local variables and collections, processes them with their values for each mode
- `updateVariables()`: Updates selected variables with new names, descriptions, or values
- `removeVariables()`: Removes selected variables from the file

### 2. Frontend Components

#### PluginUI.svelte
- Added a new "Variables" tab alongside "Text" and "Color" tabs
- Handles the `postVariables` message to receive variable data
- Automatically switches to Variables tab if no styles are found but variables exist

#### Variables.svelte (new component)
- Main component for managing variables
- Features:
  - Filter by collection using a dropdown
  - Filter by variable type (COLOR, FLOAT, STRING, BOOLEAN)
  - Search functionality through the Selector component
  - Batch editing capabilities:
    - Find & replace in variable names
    - Update descriptions
    - Edit values for each mode (single selection only)
  - Batch delete functionality

### 3. Type Definitions

Created `figma-variables.d.ts` to add TypeScript definitions for the Figma Variables API, which includes:

- Variable interface with properties and methods
- VariableCollection interface
- VariablesAPI interface with all available methods

Updated `tsconfig.json` to target ES2017 for better compatibility.

## Features

### Filtering
- **By Collection**: Users can filter variables to show only those from a specific collection
- **By Type**: Filter by variable type (COLOR, FLOAT, STRING, BOOLEAN)

### Batch Operations
- **Name Updates**: Change variable names with find & replace functionality
- **Description Updates**: Update descriptions for multiple variables
- **Value Editing**: When a single variable is selected, users can edit its value for each mode
- **Deletion**: Remove multiple variables at once

### Value Editing
The plugin supports editing values based on variable type:
- **COLOR**: Accepts hex values (e.g., #FF0000) and converts them to Figma's RGB format
- **FLOAT**: Number input for numeric values
- **STRING**: Text input for string values
- **BOOLEAN**: Checkbox for boolean values

## Usage

1. Open the plugin in Figma
2. Click on the "Variables" tab
3. Use filters to narrow down the variables you want to edit
4. Select variables using the selector list
5. Make your changes in the form below
6. Click "Update variables" to apply changes or "Delete selected" to remove them

## Technical Notes

- The plugin uses `figmaWithVariables` as a type-cast workaround since the official Figma type definitions may not include the Variables API
- Variables are fetched asynchronously using the Figma Variables API
- The plugin tracks all operations for analytics purposes
- Color values are automatically converted from hex to Figma's RGB format when updating

## Future Enhancements

Potential improvements could include:
- Bulk value editing for multiple variables
- Creating new variables and collections
- Importing/exporting variables
- Variable aliasing support
- Mode management (adding/removing modes)