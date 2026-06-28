import { createContextMenu } from './handlers/menu.js';
import { copySelectionLink, copySelectionImage } from './handlers/actions.js';

// event listeners

browser.runtime.onInstalled.addListener(createContextMenu);
browser.runtime.onStartup.addListener(createContextMenu);

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "quote") {
        copySelectionLink(info, tab);
    } else if (info.menuItemId === "quote-img") {
        copySelectionImage(info, tab);
    }
});

browser.commands.onCommand.addListener((command) => {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        const tab = tabs[0];
        if (command === "copy-quote") {
            copySelectionLink(null, tab);
        } else if (command === "copy-quote-img") {
            copySelectionImage(null, tab);
        }
    });
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'enable-ctx-menu') {
        browser.contextMenus.update("quote", { enabled: true });
    }
    return true;
});
