export async function createContextMenu() {
    await browser.contextMenus.removeAll();
    const contexts = ['selection'];
    const patterns = ["http://*/*", "https://*/*"];

    await browser.contextMenus.create({
        title: "Quote selected text",
        contexts,
        id: "quote",
        documentUrlPatterns: patterns,
        enabled: true
    });

    await browser.contextMenus.create({
        title: "Copy image of selected text",
        contexts,
        id: "quote-img",
        documentUrlPatterns: patterns,
        enabled: true
    });
}
