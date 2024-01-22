import {
  hslToRgb,
  rgbToHsl,
  figmaRGBToHex,
  hexToFigmaRGB,
} from "./color-helpers.js";
import {
  convertLetterSpacingToFigma,
  convertLineHeightToFigma,
  convertParagraphSpacingToFigma // Pa98a
} from "./helpers";

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
    let paragraphSpacing; // Pa98a
    if (s.paragraphSpacing.unit === "PERCENT") {
      let value = Math.round(s.paragraphSpacing.value * 100) / 100;
      paragraphSpacing = `${value}%`;
    } else {
      paragraphSpacing = Math.round(s.paragraphSpacing.value * 100) / 100;
    }
    return { name, description, fontName, fontSize, lineHeight, letterSpacing, paragraphSpacing, id }; // Pa98a
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
  paragraphSpacing, // Pa98a
  fontMappings,
}) {
  let localStyles = figma.getLocalTextStyles();

  return selectedStyles.map(async (selectedStyle, idx) => {
    let newLineHeight;
    let newLetterSpacing;
    let newParagraphSpacing; // P5fc3
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
    if (paragraphSpacing) { // P5fc3
      newParagraphSpacing = convertParagraphSpacingToFigma(
        fillToLengthOfSelected(paragraphSpacing, selectedStyles)[idx]
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
    let ps = newParagraphSpacing // P5fc3
      ? newParagraphSpacing
      : convertParagraphSpacingToFigma(selectedStyle.paragraphSpacing); // P5fc3
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
    hit.paragraphSpacing = { // P7de7
      ...ps
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

trackEvent([{ event_type: "launched_plugin" }]);

figma.ui.onmessage = (msg) => {
  if (msg.type === "update") {
    updateStyles(msg);
    return;
  }
  if (msg.type === "remove") {
    removeStyles(msg);
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
