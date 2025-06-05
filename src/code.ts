/// <reference path="./figma-variables.d.ts" />

import {
  hslToRgb,
  rgbToHsl,
  figmaRGBToHex,
  hexToFigmaRGB,
} from "./color-helpers.js";
import {
  convertLetterSpacingToFigma,
  convertLineHeightToFigma,
} from "./helpers";

// Type assertion to access variables API
const figmaWithVariables = figma as any;

// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 400,
  height: 780,
});

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

async function sendStyles({ figmaTextStyles = [], figmaColorStyles = [] }) {
  let colorStyles = figmaColorStyles
    .map((s) => {
      if (s.paints.length && s.paints[0].type === "SOLID") {
        const { r, g, b } = s.paints.length && s.paints[0].color;
        const color = {
          r: r * 255,
          g: g * 255,
          b: b * 255,
        };
        const { name, description, paints, id } = s;
        return { name, description, paints, id, color };
      }
    })
    .filter((n) => n);
  let textStyles = figmaTextStyles.map((s) => {
    const { name, description, fontName, fontSize, id } = s;
    let lineHeight;
    if (s.lineHeight.unit === "AUTO") {
      lineHeight = "AUTO";
    } else if (s.lineHeight.unit === "PERCENT") {
      let value = Math.round(s.lineHeight.value * 100) / 100;
      lineHeight = `${value}%`;
    } else {
      lineHeight = Math.round(s.lineHeight.value * 100) / 100;
    }
    let letterSpacing;
    if (s.letterSpacing.unit === "PERCENT") {
      let value = Math.round(s.letterSpacing.value * 100) / 100;
      letterSpacing = `${value}%`;
    } else {
      letterSpacing = Math.round(s.letterSpacing.value * 100) / 100;
    }
    return { name, description, fontName, fontSize, lineHeight, letterSpacing, id };
  });

  let availableFonts = await figma.listAvailableFontsAsync();
  figma.ui.postMessage({
    type: "postStyles",
    textStyles,
    colorStyles,
    availableFonts,
  });
  trackEvent([{ event_type: "received_styles" }]);
}

async function sendVariables() {
  try {
    const collections = await figmaWithVariables.variables.getLocalVariableCollectionsAsync();
    const variables = await figmaWithVariables.variables.getLocalVariablesAsync();
    
    // Process variables to include their values for each mode
    const processedVariables = await Promise.all(
      variables.map(async (variable) => {
        const collection = collections.find(c => c.id === variable.variableCollectionId);
        const modes = collection ? collection.modes : [];
        
        const valuesByMode = {};
        for (const mode of modes) {
          try {
            valuesByMode[mode.modeId] = {
              modeName: mode.name,
              value: variable.valuesByMode[mode.modeId]
            };
          } catch (e) {
            console.error(`Error getting value for mode ${mode.modeId}:`, e);
          }
        }
        
        return {
          id: variable.id,
          name: variable.name,
          description: variable.description || '',
          resolvedType: variable.resolvedType,
          collectionId: variable.variableCollectionId,
          collectionName: collection?.name || 'Unknown Collection',
          valuesByMode,
          scopes: variable.scopes || []
        };
      })
    );
    
    const processedCollections = collections.map(collection => ({
      id: collection.id,
      name: collection.name,
      modes: collection.modes,
      defaultModeId: collection.defaultModeId
    }));
    
    figma.ui.postMessage({
      type: "postVariables",
      variables: processedVariables,
      collections: processedCollections
    });
    
    trackEvent([{ event_type: "received_variables" }]);
  } catch (error) {
    console.error("Error fetching variables:", error);
    figma.ui.postMessage({
      type: "postVariables",
      variables: [],
      collections: []
    });
  }
}

function getStyles() {
  const figmaTextStyles = figma.getLocalTextStyles();
  const figmaColorStyles = figma.getLocalPaintStyles();
  if (figmaTextStyles.length || figmaColorStyles.length) {
    sendStyles({ figmaTextStyles, figmaColorStyles });
  } else {
    sendStyles({});
  }
  sendVariables(); // Also send variables
  return;
}

function updateTextStyles({
  selectedStyles,
  styleName,
  styleMatch,
  description,
  familyName,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  fontMappings,
}) {
  let localStyles = figma.getLocalTextStyles();

  return selectedStyles.map(async (selectedStyle, idx) => {
    let newLineHeight;
    let newLetterSpacing;
    let newFontSize;
    if (lineHeight) {
      newLineHeight = convertLineHeightToFigma(
        fillToLengthOfSelected(lineHeight, selectedStyles)[idx]
      );
    }
    if (letterSpacing) {
      newLetterSpacing = convertLetterSpacingToFigma(
        fillToLengthOfSelected(letterSpacing, selectedStyles)[idx]
      );
    }

    if (fontSize) {
      newFontSize = Number(
        fillToLengthOfSelected(fontSize, selectedStyles)[idx]
      );
    }
    let style;
    if (fontMappings) {
      let hit = fontMappings.find(
        (mapping) => mapping.currentWeight === selectedStyle.fontName.style
      );
      style = hit.newWeight;
    } else {
      style = fontWeight ? fontWeight : selectedStyle.fontName.style;
    }
    let family = familyName ? familyName : selectedStyle.fontName.family;
    let size = newFontSize ? newFontSize : selectedStyle.fontSize;
    let lh = newLineHeight
      ? newLineHeight
      : convertLineHeightToFigma(selectedStyle.lineHeight);
    let ls = newLetterSpacing
      ? newLetterSpacing
      : convertLetterSpacingToFigma(selectedStyle.letterSpacing);
    let hit = localStyles.find((s) => s.id === selectedStyle.id);

    await figma.loadFontAsync({ family, style });
    if (styleMatch !== null && styleName !== undefined) {
      hit.name = hit.name.replace(styleMatch, styleName);
    } else if (styleName) {
      hit.name = styleName;
    }
    if(description !== null) {
      hit.description = description
    }
    hit.fontName = {
      family,
      style,
    };
    hit.fontSize = size;
    hit.lineHeight = {
      ...lh,
    };
    hit.letterSpacing = {
      ...ls,
    };
    return hit;
  });
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

function convertToRgb(color) {
  const { h, s, l } = color;
  let rawRgb = hslToRgb(h / 360, s / 100, l / 100);
  let [r, g, b] = rawRgb;
  r = r / 255;
  g = g / 255;
  b = b / 255;
  return { r, g, b };
}

function getColors(style) {
  let paints = style.paints.filter((n) => n.type === "SOLID");
  if (!paints) return;
  return paints[0].color;
}

function getHslFromStyle(style) {
  let color = getColors(style);
  let { h, s, l } = convertToHsl(color);
  return { h, s, l };
}

function fillToLengthOfSelected(property, styles) {
  return new Array(styles.length)
    .fill(
      String(property)
        .split(",")
        .map((i) => i.trim())
    )
    .flat()
    .slice(0, styles.length);
}

function updateColorStyles({
  selectedStyles,
  styleName,
  styleMatch,
  description,
  hue,
  saturation,
  lightness,
  alpha,
  hex,
}) {
  let localStyles = figma.getLocalPaintStyles();

  return selectedStyles.map(async (selectedStyle, idx) => {
    let { h, s, l } = getHslFromStyle(selectedStyle);
    let newHue =
      hue == undefined
        ? h
        : Number(fillToLengthOfSelected(hue, selectedStyles)[idx]);
    let newSaturation =
      saturation == undefined
        ? s
        : Number(fillToLengthOfSelected(saturation, selectedStyles)[idx]);
    let newLightness =
      lightness == undefined
        ? l
        : Number(fillToLengthOfSelected(lightness, selectedStyles)[idx]);
    let newColor;
    if (hex) {
      newColor = hexToFigmaRGB(
        fillToLengthOfSelected(hex, selectedStyles)[idx]
      );
    } else {
      newColor = convertToRgb({
        h: newHue,
        s: newSaturation,
        l: newLightness,
      });
    }
    let opacity = alpha
      ? Number(fillToLengthOfSelected(alpha, selectedStyles)[idx])
      : selectedStyle.paints[0].opacity;
    let hit = localStyles.find((s) => s.id === selectedStyle.id);
    hit.paints = [{ color: newColor, type: "SOLID", opacity }];
    if (styleMatch !== null && styleName !== undefined) {
      hit.name = hit.name.replace(styleMatch, styleName);
    } else if (styleName) {
      hit.name = styleName;
    }
    if(description !== null) {
      hit.description = description
    }
    return hit;
  });
}

function trackEvent(data) {
  figma.ui.postMessage({
    type: "trackEvent",
    data,
  });
}

async function removeStyles({ selectedStyles }) {
  try {
    let textStyles = figma.getLocalTextStyles();
    let paintStyles = figma.getLocalPaintStyles();
    const styles = [...textStyles, ...paintStyles];

    selectedStyles.map((style) => {
      const found = styles.find((s) => s.id === style.id);
      if (found) {
        found.remove();
      }
    });
    figma.notify(`Successfully removed ${selectedStyles.length} styles`);
    trackEvent([
      {
        event_type: "removed_style",
        event_properties: { size: selectedStyles.length },
      },
    ]);
  } catch (e) {
    figma.notify("Encountered an error, full output in console");
    console.error(e);
    trackEvent([
      { event_type: "error", event_properties: { message: JSON.stringify(e) } },
    ]);
  }
  getStyles();
}

async function updateStyles({
  selectedStyles,
  styleName,
  styleMatch,
  description,
  hue,
  saturation,
  lightness,
  alpha,
  hex,
  familyName,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  fontMappings,
  variant,
}) {
  let styleChanges;

  try {
    if (variant === "COLOR") {
      styleChanges = updateColorStyles({
        selectedStyles,
        styleName,
        styleMatch,
        description,
        hue,
        saturation,
        lightness,
        alpha,
        hex,
      });
      figma.notify(
        `Successfully updated ${selectedStyles.length} color styles`
      );
      trackEvent([
        {
          event_type: "changed_color_style",
          event_properties: { size: selectedStyles.length },
        },
      ]);
    } else {
      styleChanges = updateTextStyles({
        selectedStyles,
        styleName,
        styleMatch,
        description,
        familyName,
        fontWeight,
        fontSize,
        lineHeight,
        letterSpacing,
        fontMappings,
      });
      figma.notify(`Successfully updated ${selectedStyles.length} text styles`);
      trackEvent([
        {
          event_type: "changed_text_style",
          event_properties: { size: selectedStyles.length },
        },
      ]);
    }

    await Promise.all(styleChanges);
  } catch (e) {
    figma.notify("Encountered an error, full output in console");
    console.error(e);
    trackEvent([
      { event_type: "error", event_properties: { message: JSON.stringify(e) } },
    ]);
  }
  getStyles();
}

async function updateVariables({
  selectedVariables,
  variableName,
  variableMatch,
  description,
  newValues // Object with modeId as key and new value as value
}) {
  try {
    const updatedCount = await Promise.all(
      selectedVariables.map(async (selectedVariable) => {
        const variable = await figmaWithVariables.variables.getVariableByIdAsync(selectedVariable.id);
        if (!variable) return;
        
        // Update name if provided
        if (variableMatch !== null && variableName !== undefined) {
          variable.name = variable.name.replace(variableMatch, variableName);
        } else if (variableName) {
          variable.name = variableName;
        }
        
        // Update description if provided
        if (description !== null) {
          variable.description = description;
        }
        
        // Update values for specified modes
        if (newValues) {
          for (const [modeId, value] of Object.entries(newValues)) {
            try {
              variable.setValueForMode(modeId, value);
            } catch (e) {
              console.error(`Error setting value for mode ${modeId}:`, e);
            }
          }
        }
        
        return variable;
      })
    );
    
    figma.notify(`Successfully updated ${selectedVariables.length} variables`);
    trackEvent([
      {
        event_type: "changed_variables",
        event_properties: { size: selectedVariables.length }
      }
    ]);
  } catch (e) {
    figma.notify("Encountered an error, full output in console");
    console.error(e);
    trackEvent([
      { event_type: "error", event_properties: { message: JSON.stringify(e) } }
    ]);
  }
  
  getStyles(); // Refresh all data including variables
}

async function removeVariables({ selectedVariables }) {
  try {
    await Promise.all(
      selectedVariables.map(async (variable) => {
        const found = await figmaWithVariables.variables.getVariableByIdAsync(variable.id);
        if (found) {
          found.remove();
        }
      })
    );
    
    figma.notify(`Successfully removed ${selectedVariables.length} variables`);
    trackEvent([
      {
        event_type: "removed_variables",
        event_properties: { size: selectedVariables.length }
      }
    ]);
  } catch (e) {
    figma.notify("Encountered an error, full output in console");
    console.error(e);
    trackEvent([
      { event_type: "error", event_properties: { message: JSON.stringify(e) } }
    ]);
  }
  
  getStyles(); // Refresh all data including variables
}

trackEvent([{ event_type: "launched_plugin" }]);

figma.ui.onmessage = (msg) => {
  if (msg.type === "update") {
    if (msg.variant === "VARIABLE") {
      updateVariables(msg);
    } else {
      updateStyles(msg);
    }
    return;
  }
  if (msg.type === "remove") {
    if (msg.variant === "VARIABLE") {
      removeVariables(msg);
    } else {
      removeStyles(msg);
    }
    return;
  }
  if (msg.type === "refresh") {
    getStyles();

    return;
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
