// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 400,
  height: 620
});

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

async function sendStyles(styles) {
  let values = styles.map(s => {
    const { name, fontName, fontSize, id } = s;
    let lineHeight;
    if (s.lineHeight.unit === "AUTO") {
      lineHeight = "AUTO";
    } else if (s.lineHeight.unit === "PERCENT") {
      lineHeight = `${s.lineHeight.value}%`;
    } else {
      lineHeight = s.lineHeight.value;
    }
    return { name, fontName, fontSize, lineHeight, id };
  });

  let availableFonts = await figma.listAvailableFontsAsync();
  figma.ui.postMessage({
    type: "postStyles",
    styles: values,
    availableFonts
  });
}

function getStyles() {
  const styles = figma.getLocalTextStyles();
  if (styles.length) {
    sendStyles(styles);
  }
  return;
}

async function updateStyles({
  selectedStyles,
  familyName,
  fontWeight,
  fontSize,
  lineHeight
}) {
  let localStyles = figma.getLocalTextStyles();
  let styleChanges = selectedStyles.map(async selectedStyle => {
    let style = fontWeight ? fontWeight : selectedStyle.fontName.style;
    let family = familyName ? familyName : selectedStyle.fontName.family;
    let size = fontSize ? fontSize : selectedStyle.fontSize;
    let lh = lineHeight ? lineHeight : selectedStyle.lineHeight;
    let hit = localStyles.find(s => s.id === selectedStyle.id);
    await figma.loadFontAsync({ family, style });
    hit.fontName = {
      family,
      style
    };
    hit.fontSize = size;
    hit.lineHeight = {
      ...lh
    };
    return hit;
  });

  await Promise.all(styleChanges);
  sendStyles(localStyles);
}

getStyles();

figma.ui.onmessage = msg => {
  if (msg.type === "update") {
    const {
      selectedStyles,
      familyName,
      fontWeight,
      fontSize,
      lineHeight
    } = msg;
    updateStyles({
      selectedStyles,
      familyName,
      fontWeight,
      fontSize,
      lineHeight
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
