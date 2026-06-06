/**
 * Fetches from a link using a GET request, with built-in error handling
 * @param {string} url The url to fetch from
 * @returns {Promise<object>} The result
 */
async function fetchUrl(url, authorization = null) {
    return new Promise(async (resolve, reject) => {
        try {
            if (authorization) {
                authorization = `Bearer ${authorization}`
            }
            const response = await fetch(url,
                {
                    method: "GET",
                    headers: {
                        Authorization: authorization
                    },
                    credentials: "omit"
                }
            );

            if (!response.ok) {
                // throw new Error(`Response status: ${response.status}`);
                reject(false)
            }

            const result = await response.json();
            resolve(result)
            return
        } catch (e) {
            console.error(e.message);
            reject(false)
        }
    })
}

/**
 * Sends a post request. Mainly intended for local use.
 * @param {string} url The URL to post to
 * @param {object} body The JSON dictionary of what to post
 * @param {string} authorization The user's token; if needed
 * @returns 
 */
function postUrl(url, body, authorization = null) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Content-type": "application/json",
                        "Authorization": `Bearer ${authorization}`
                    },
                    credentials: "omit"
                })

            const result = await response.json()
            resolve(result)
            return
        } catch (e) {
            console.error(e.message)
            reject(false)
        }
    })
}

/**
 * Inject a toast notification into the given tab.
 * @param {chrome.tabs.Tab} tab - The target tab object (must have an id).
 * @param {string} message - Text to display.
 * @param {'success'|'error'} type - Style variant.
 */
async function showToastInTab(tab, message, type, style) {
    if (!tab?.id || tab.url?.startsWith('chrome://')) return;

    await browser.scripting.insertCSS({
        target: { tabId: tab.id },
        css: `
      #__sitecite_toast_container {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        pointer-events: none;
      }
      .__sitecite_toast {
        pointer-events: auto;
        background: #f6f6f6;
        color: #000;
        padding: 10px 24px;
        // border-radius: 8px;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        // box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.2s ease, transform 0.2s ease;

        border-top: 1px solid #000;
        border-bottom: 3px solid #000;
        border-left: 1px solid #000;
        border-right: 3px solid #000;
      }
      .__sitecite_toast--visible {
        opacity: 1;
        transform: translateY(0);
      }
      .__sitecite_toast--success { background: #caffbf; color: #51664c; border-color: #51664c; }
      .__sitecite_toast--error   { background: #ffadad; color: #664545; border-color: #664545; }
    `
    }).catch(() => { });

    await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: (msg, type) => {
            // Create container if missing
            let container = document.getElementById('__sitecite_toast_container');
            if (!container) {
                container = document.createElement('div');
                container.id = '__sitecite_toast_container';
                document.body.appendChild(container);
            }

            // Build toast
            const toast = document.createElement('div');
            toast.className = `__sitecite_toast __sitecite_toast--${type}`;
            toast.textContent = msg;

            container.appendChild(toast);

            // animate in
            requestAnimationFrame(() => {
                toast.classList.add('__sitecite_toast--visible');
            });

            // remove after 2.5s
            setTimeout(() => {
                toast.classList.remove('__sitecite_toast--visible');
                const onTransitionEnd = () => {
                    toast.remove();
                    if (container.childElementCount === 0) container.remove();
                };
                toast.addEventListener('transitionend', onTransitionEnd, { once: true });
                setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
            }, 2500);
        },
        args: [message, type]
    }).catch(() => { });
}

function createHighlightLink() {
    function expandRangeToWholeWords(range) {
        const isWordChar = (char) => /\p{L}|\p{N}|_/u.test(char);

        // expand start backward if the selection begins inside a word
        const startContainer = range.startContainer;
        if (startContainer.nodeType === Node.TEXT_NODE) {
            const text = startContainer.textContent;
            let offset = range.startOffset;
            // if character before offset is a word character, we are inside a word
            if (offset > 0 && isWordChar(text[offset - 1])) {
                // move back to the first non‑word character before this word
                while (offset > 0 && isWordChar(text[offset - 1])) {
                    offset--;
                }
                range.setStart(startContainer, offset);
            }
        }

        // expand end forward if the selection ends inside a word
        const endContainer = range.endContainer;
        if (endContainer.nodeType === Node.TEXT_NODE) {
            const text = endContainer.textContent;
            let offset = range.endOffset;
            // if the character at offset is a word character, we are inside a word
            if (offset < text.length && isWordChar(text[offset])) {
                // move forward to the first non‑word character after this word
                while (offset < text.length && isWordChar(text[offset])) {
                    offset++;
                }
                range.setEnd(endContainer, offset);
            }
        }
        return range;
    }

    function encodeTextFragment(text) {
        // certain characters may not play nicely with urls, but are actualy valid
        return encodeURIComponent(text)
            .replace(/-/g, '%2D')
            .replace(/,/g, '%2C');
    }

    // get selected text
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    const originalRange = selection.getRangeAt(0);
    // clone so visual selection isnt altered
    const expandedRange = originalRange.cloneRange();
    // get full words (this plays nicer with browsers)
    expandRangeToWholeWords(expandedRange);

    const selectedText = expandedRange.toString().trim();
    if (!selectedText) return null;

    const url = new URL(window.location.href);
    url.hash = `:~:text=${encodeTextFragment(selectedText)}`;

    console.log(originalRange.toString().trim())
    return { url: url.toString(), selection: originalRange.toString().trim() };
}

function copyText(text) {
    try {
        // copy simple regular text
        navigator.clipboard.writeText(text)
    } catch(e) {
        console.error("Could not copy to the clipboard:", e)
        return false
    }
    return true
}

function copyImage(image) {
    // convert data URL back to blob
    const byteString = atob(image.split(',')[1]);
    const mimeType = image.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });

    // copy to clipboard
    try {
        navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ]);
        return true;
    } catch (err) {
        console.error('Clipboard write failed:', err);
        return false;
    }
}

// A generic onclick callback function.
browser.contextMenus.onClicked.addListener(handleCtxMenu);

async function handleCtxMenu(info, tab) {
    // handle when user clicked on a context menu item
    if(info.menuItemId === "quote") {
        copySelectionLink(info, tab)
    } else if (info.menuItemId === "quote-img") {
        copySelectionImage(info, tab)
    } else {
        return
    }
}

async function copySelectionLink(info = null, tab) {
    // copy the url of the selected text
    // check if user is signed in and what their host is
    const baseUrlStorage = await browser.storage.local.get("baseUrl")
    const baseUrl = baseUrlStorage.baseUrl || "https://sitecite.dantenl.com"

    var token = await browser.storage.local.get(["token"]) || null

    // no token ):
    if(!token) {
        await showToastInTab(tab, 'You are not signed in to sitecite!', 'error');
        return
    }

    // execute a function in the current tab to get the selected text and generate the link
    const execScript = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: createHighlightLink
    }).catch(err => console.error("Script injection error;", err))
    console.log(execScript)
    if(!execScript[0].result) {
        // no selection made
        await showToastInTab(tab, 'sitecite: no text selected!', 'error');
        return
    }
    // function returns a full link with highlight and the selected text
    // the selected text is passed through as well for the image generation 
    const link = execScript[0]?.result.url;
    const selection = execScript[0]?.result.selection;
    // console.log(execScript)
    if (link) {
        // upload the link
        const linkUpload = await postUrl(
            `${baseUrl}/api/shorten`, 
            {
                link: link,
                text: selection
            },
            token.token
        )

        if(!linkUpload.success) {
            await showToastInTab(tab, 'Error: '+linkUpload.message, 'error');
            return
        }

        const shortenedLink = baseUrl+"/l/"+linkUpload.data.code

        const execCopyScript = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: copyText,
            args: [shortenedLink]
        }).catch(err => console.error("Script injection error;", err))

        const success = execCopyScript[0]?.result;
        if(success) {
            await showToastInTab(tab, 'Link copied to clipboard!', 'success');
        } else {
            await showToastInTab(tab, 'Could not copy link to clipboard.', 'error');
        }
    } else {
        await showToastInTab(tab, 'sitecite: no text selected!', 'error');
    }
}

async function copySelectionImage(info = null, tab) {
    // copy an image of the selected text
    // check if user is signed in and what their host is
    const baseUrlStorage = await browser.storage.local.get("baseUrl")
    const baseUrl = baseUrlStorage.baseUrl || "https://sitecite.dantenl.com"

    const token = await browser.storage.local.get(["token"]) || null

    // no token ):
    if (!token) {
        await showToastInTab(tab, 'You are not signed in to sitecite!', 'error');
        return
    }

    // execute a function in the current tab to get the selected text and generate the link
    const execScript = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: createHighlightLink
    }).catch(err => console.error("Script injection error;", err))

    if (!execScript[0].result) {
        // no selection made
        await showToastInTab(tab, 'sitecite: no text selected!', 'error');
        return
    }
    // even if the function returns both a url and the selected text, we only care about the selected text
    const selection = execScript[0]?.result.selection;

    // send a post request to the image generation service
    const response = await fetch(baseUrl+"/api/image", {
        method: 'POST',
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${token.token}`
        },
        credentials: "omit",
        body: JSON.stringify({
            text: selection,
            url: tab.url
        })
    });

    if (!response.ok) {
        await showToastInTab(tab, 'the image could not be generated', 'error');
        console.error(response)
        return
    }

    // get response as blob
    const blob = await response.blob();
    
    // conver to data url to inject to page
    // browsers dont like transferring blobs
    const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });


    // verifiy its an image
    if (!blob.type.startsWith('image/')) {
        await showToastInTab(tab, 'the image could not be generated', 'error');
        throw new Error('Response is not a valid image');
        return
    }

    // copy to clipboard
    const execCopyScript = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: copyImage,
        args: [dataUrl]
    }).catch(err => console.error("Script injection error;", err))

    const success = execCopyScript[0]?.result;
    if (success) {
        await showToastInTab(tab, 'Image copied to clipboard!', 'success');
    } else {
        await showToastInTab(tab, 'Could not copy image to clipboard.', 'error');
    }



}

async function createContextMenu() {
    // const baseUrlStorage = await browser.storage.local.get("baseUrl")
    // const baseUrl = baseUrlStorage.baseUrl || "https://sitecite.dantenl.com"
    // var token = await browser.storage.local.get(["token"]) || null

    // // verifiy token
    // if (token) {
    //     try {
    //         const validateToken = await fetchUrl(`${baseUrl}/api/token/validate`, token.token)
    //     } catch (e) {
    //         token = null
    //     }
    // }

    // var enabled = true
    // if (!token) {
    //     enabled = false
    // }
    // this doesn't really work? it's best to just have it always enabled and to return an error every once in a while

    await browser.contextMenus.removeAll()
    let contexts = ['selection'];
    await browser.contextMenus.create({
        title: "Quote selected text",
        contexts: contexts,
        id: "quote",
        documentUrlPatterns: ["http://*/*", "https://*/*"],
        enabled: true
    })
    await browser.contextMenus.create({
        title: "Copy image of selected text",
        contexts: contexts,
        id: "quote-img",
        documentUrlPatterns: ["http://*/*", "https://*/*"],
        enabled: true
    })
}

browser.runtime.onInstalled.addListener(createContextMenu)
browser.runtime.onStartup.addListener(createContextMenu)


// handle keyboard shortcut
browser.commands.onCommand.addListener((command) => {
    if(command === "copy-quote") {
        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var activeTab = tabs[0];
            copySelectionLink(null, activeTab)
    
        });
    } else if (command === "copy-quote-img") {
        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var activeTab = tabs[0];
            copySelectionImage(null, activeTab)

        });
    } else {
        return
    }

});


// enable if valid api key is entered
function handleMessages(message, sender, sendResponse) {
    if (message !== 'enable-ctx-menu') return;

    browser.contextMenus.update(
        "quote",
        {
            enabled: true
        }
    )

    return true;
}

// disable if host changed
function handleMessages(message, sender, sendResponse) {
    if (message !== 'disable-ctx-menu') return;

    // browser.contextMenus.update(
    //     "quote",
    //     {
    //         enabled: false
    //     }
    // )

    return true;
}

browser.runtime.onMessage.addListener(handleMessages);
