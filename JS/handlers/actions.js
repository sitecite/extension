import { getConfig } from '../utils/storage.js';
import { postJson } from '../utils/network.js';
import { showToastInTab } from '../utils/toast.js';
import { createHighlightLink } from '../content-scripts/selection.js';
import { copyText, copyImage } from '../scripts/clipboard.js';

async function getSelectionFromTab(tab) {
    const results = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: createHighlightLink
    });
    return results?.[0]?.result || null;
}

async function injectCopyText(tab, text) {
    const results = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: copyText,
        args: [text]
    });
    return results?.[0]?.result ?? false;
}

async function injectCopyImage(tab, dataUrl) {
    const results = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: copyImage,
        args: [dataUrl]
    });
    return results?.[0]?.result ?? false;
}

export async function copySelectionLink(info, tab) {
    const { token, baseUrl } = await getConfig();
    if (!token) {
        await showToastInTab(tab, 'You are not signed in!', 'error');
        return;
    }

    const selectionData = await getSelectionFromTab(tab);
    if (!selectionData?.url) {
        await showToastInTab(tab, 'No text selected!', 'error');
        return;
    }

    try {
        const result = await postJson(`${baseUrl}/api/shorten`, {
            link: selectionData.url,
            text: selectionData.selection
        }, token);

        if (!result.success) {
            await showToastInTab(tab, `Error: ${result.message}`, 'error');
            return;
        }

        const shortLink = `${baseUrl}/l/${result.data.code}`;
        const copied = await injectCopyText(tab, shortLink);
        await showToastInTab(tab, copied ? 'Link copied!' : 'Could not copy.', copied ? 'success' : 'error');
    } catch (e) {
        console.error(e);
        await showToastInTab(tab, 'Failed to shorten link', 'error');
    }
}

export async function copySelectionImage(info, tab) {
    // ... similar refactoring
    const { token, baseUrl } = await getConfig();
    if (!token) {
        await showToastInTab(tab, 'You are not signed in to sitecite!', 'error');
        return;
    }
    
    const selectionData = await getSelectionFromTab(tab);
    if (!selectionData?.selection) {
        await showToastInTab(tab, 'No text selected!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${baseUrl}/api/image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            credentials: 'omit',
            body: JSON.stringify({ text: selectionData.selection, url: tab.url })
        });
        if (!response.ok) throw new Error(`Image generation failed (${response.status})`);
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) throw new Error('Invalid image response');
    
        const dataUrl = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    
        const copySuccess = await injectCopyImage(tab, dataUrl);
        await showToastInTab(tab, copySuccess ? 'Image copied!' : 'Could not copy image.', copySuccess ? 'success' : 'error');
    } catch (e) {
        console.error(e);
        await showToastInTab(tab, 'Image generation failed', 'error');
    }
}
