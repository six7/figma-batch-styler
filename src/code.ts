import { hslToRgb, rgbToHsl } from "./color-helpers.js";

// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 400,
  height: 620,
});

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

async function sendStyles({ figmaTextStyles = [], figmaColorStyles = [] }) {
  let colorStyles = figmaColorStyles.map((s) => {
    const { name, paints, id } = s;
    return { name, paints, id };
  });
  let textStyles = figmaTextStyles.map((s) => {
    const { name, fontName, fontSize, id } = s;
    let lineHeight;
    if (s.lineHeight.unit === "AUTO") {
      lineHeight = "AUTO";
    } else if (s.lineHeight.unit === "PERCENT") {
      let value = Math.round(s.lineHeight.value * 100) / 100;
      lineHeight = `${value}%`;
    } else {
      lineHeight = Math.round(s.lineHeight.value * 100) / 100;
    }
    return { name, fontName, fontSize, lineHeight, id };
  });

  let availableFonts = await figma.listAvailableFontsAsync();
  figma.ui.postMessage({
    type: "postStyles",
    textStyles,
    colorStyles,
    availableFonts,
  });
}

function getStyles() {
  const figmaTextStyles = figma.getLocalTextStyles();
  const figmaColorStyles = figma.getLocalPaintStyles();
  if (figmaTextStyles.length || figmaColorStyles.length) {
    sendStyles({ figmaTextStyles, figmaColorStyles });
  } else {
    sendStyles({});
  }
  return;
}

function convertLineHeightToFigma(value) {
  let lineHeight;
  value = value.toString();
  var numbers = /^\d+(\.\d+)?$/;
  if (value.match(numbers)) {
    lineHeight = {
      unit: "PIXELS",
      value: Number(value),
    };
  } else if (
    value.trim().slice(-1) === "%" &&
    value.trim().slice(0, -1).match(numbers)
    ) {
    lineHeight = {
      unit: "PERCENT",
      value: Number(value.slice(0, -1)),
    };
  } else {
    lineHeight = {
      unit: "AUTO",
    };
  }
  return lineHeight;
}

function updateTextStyles({
  selectedStyles,
  familyName,
  fontWeight,
  fontSize,
  lineHeight,
  fontMappings,
}) {
  let localStyles = figma.getLocalTextStyles();

  return selectedStyles.map(async (selectedStyle, index) => {
    console.log("length of styles", selectedStyles.length, lineHeight, selectedStyle.lineHeight)
    let newLineHeight;
    if (lineHeight.length > 1) {
      if (lineHeight.length === selectedStyles.length) {
        newLineHeight = lineHeight[index]
        console.log("new", newLineHeight)
      }
    } else {
      newLineHeight = lineHeight[0]
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
    let size = fontSize ? fontSize : selectedStyle.fontSize;
    let lh = newLineHeight ? newLineHeight : convertLineHeightToFigma(selectedStyle.lineHeight);
    let hit = localStyles.find((s) => s.id === selectedStyle.id);
    await figma.loadFontAsync({ family, style });
    hit.fontName = {
      family,
      style,
    };
    hit.fontSize = size;
    hit.lineHeight = {
      ...lh,
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

function updateColorStyles({ selectedStyles, hue, saturation, lightness, alpha }) {
  let localStyles = figma.getLocalPaintStyles();

  return selectedStyles.map(async (selectedStyle) => {
    let { h, s, l } = getHslFromStyle(selectedStyle);
    let newHue = hue ? hue : h;
    let newSaturation = saturation ? saturation : s;
    let newLightness = lightness ? lightness : l;
    let newColor = convertToRgb({
      h: newHue,
      s: newSaturation,
      l: newLightness,
    });
    let rgbValues = getColors(selectedStyle);
    let originalHsl = convertToHsl(rgbValues);
    let opacity = alpha ? alpha : selectedStyle.paints[0].opacity
    let hit = localStyles.find((s) => s.id === selectedStyle.id);
    hit.paints = [{ color: newColor, type: "SOLID", opacity }];
    return hit;
  });
}

async function updateStyles({
  selectedStyles,
  hue,
  saturation,
  lightness,
  alpha,
  familyName,
  fontWeight,
  fontSize,
  lineHeight,
  fontMappings,
  variant,
}) {
  let styleChanges;

  try {
    if (variant === "COLOR") {
      styleChanges = updateColorStyles({
        selectedStyles,
        hue,
        saturation,
        lightness,
        alpha,
      });
      figma.notify(
        `Successfully updated ${selectedStyles.length} color styles`
      );
    } else {
      styleChanges = updateTextStyles({
        selectedStyles,
        familyName,
        fontWeight,
        fontSize,
        lineHeight,
        fontMappings,
      });
      figma.notify(`Successfully updated ${selectedStyles.length} text styles`);
    }

    await Promise.all(styleChanges);
  } catch (e) {
    figma.notify("Encountered an error, full output in console");
    console.error(e);
  }
  getStyles();
}

figma.ui.onmessage = (msg) => {
  if (msg.type === "update") {
    const {
      selectedStyles,
      familyName,
      fontWeight,
      fontSize,
      lineHeight,
      fontMappings,
      hue,
      saturation,
      lightness,
      alpha,
      variant,
    } = msg;
    updateStyles({
      selectedStyles,
      familyName,
      fontWeight,
      fontSize,
      lineHeight,
      fontMappings,
      hue,
      saturation,
      lightness,
      alpha,
      variant,
    });
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
