// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
    width: 400,
    height: 500
});
figma.on("selectionchange", () => {
    getSelectionDimension();
});
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
function getSelectionDimension() {
    for (const node of figma.currentPage.selection) {
        if (node.type === "INSTANCE") {
            figma.ui.postMessage({ type: 'selection', width: node.width, height: node.height, scale: node.scaleFactor });
        }
        else {
            figma.ui.postMessage({ type: 'noinstance' });
        }
    }
}
getSelectionDimension();
figma.ui.onmessage = msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    console.log("type", msg.type);
    if (msg.type === 'scale') {
        for (const node of figma.currentPage.selection) {
            if (node.type === "INSTANCE") {
                let { width, height } = node;
                node.scaleFactor = msg.scale;
                figma.ui.postMessage({ type: 'selection', width: node.width, height: node.height, scale: node.scaleFactor });
                switch (msg.origin) {
                    case "CENTER": {
                        node.x = node.x - (node.width - width) / 2;
                        node.y = node.y - (node.height - height) / 2;
                        break;
                    }
                    case "TOP-RIGHT": {
                        node.x = node.x - (node.width - width);
                        break;
                    }
                    case "BOTTOM-RIGHT": {
                        node.x = node.x - (node.width - width);
                        node.y = node.y - (node.height - height);
                        break;
                    }
                    case "BOTTOM-LEFT": {
                        node.y = node.y - (node.height - height);
                        break;
                    }
                    default:
                        break;
                }
            }
        }
        return;
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
};
