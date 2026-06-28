/**
 * Fetches from a link using a GET request, with built-in error handling
 * @param {string} url The url to fetch from
 * @returns {Promise<object>} The result
 */
async function fetchUrl(url, authorization = null) {
    const headers = {};
    if (authorization) {
        headers.Authorization = `Bearer ${authorization}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'omit'
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
}
/**
 * Sends a post request. Mainly intended for local use.
 * @param {string} url The URL to post to
 * @param {object} body The JSON dictionary of what to post
 * @param {string} authorization The user's token; if needed
 * @returns 
 */
async function postUrl(url, body, authorization = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authorization) {
        headers.Authorization = `Bearer ${authorization}`;
    }

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers,
        credentials: 'omit'
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
}

async function fetchStyles(baseUrl, token) {
    // fetch styles and font list in parallel for speed
    const [styles, fonts] = await Promise.all([
        fetchUrl(`${baseUrl}/api/style`, token),
        fetchUrl(`${baseUrl}/api/fontlist`)
    ]);

    // apply colours
    const root = document.documentElement;
    root.style.setProperty('--background', `#${styles.data.bg_color}`);
    root.style.setProperty('--color', `#${styles.data.color}`);

    // find matching font files
    const selectedFont = fonts.data.fontList.find(f => f.name === styles.data.font);
    if (!selectedFont) {
        console.warn(`Font "${styles.data.font}" not found in font list.`);
        return;
    }

    const { file_regular, file_italic, type } = selectedFont;
    const fontName = styles.data.font;

    // load regular font
    const regularFont = new FontFace(fontName, `url(${baseUrl}/fonts/${file_regular})`);
    await regularFont.load().catch(err => console.warn('Regular font load failed:', err));
    document.fonts.add(regularFont);

    // load italic font
    const italicFont = new FontFace(fontName, `url(${baseUrl}/fonts/${file_italic})`, {
        style: 'italic'
    });
    await italicFont.load().catch(err => console.warn('Italic font load failed:', err));
    document.fonts.add(italicFont);

    // apply font-family
    root.style.setProperty('--font-family', `'${fontName}', ${type}`);
}

// cache dom references
const $ = id => document.getElementById(id);
const hostUrlInput = $('host-url');
const hostSubmitBtn = $('host-submit');
const keyForm = $('key-form');
const keyInput = $('key');
const setupDiv = $('setup');
const accountDiv = $('account-section');
const logoutBtn = $('logout');
const selfhostForm = $('selfhost-form');
const selfhostMsg = $('selfhost-msg');
const openSiteLink = $('open-site');
const shortcutSpan = $('keyboard-shortcut');

async function main() {
    const storage = await browser.storage.local.get(['baseUrl', 'token']);
    const baseUrl = storage.baseUrl || 'https://sitecite.dantenl.com';
    const token = storage.token || null;

    // update UI with stored base URL
    if (storage.baseUrl) {
        hostUrlInput.value = baseUrl;
        hostSubmitBtn.textContent = 'save';
    }

    openSiteLink.href = baseUrl;

    // keyboard shortcut for mac
    const platform = await browser.runtime.getPlatformInfo();
    if (platform.os === 'mac') {
        shortcutSpan.innerHTML = `<kbd class="bordered">⌘ (cmd)</kbd> + <kbd class="bordered">⌃ (ctrl)</kbd> + <kbd class="bordered">C</kbd>`;
    }

    // if token exists, load styles and show account UI
    if (token) {
        try {
            await fetchStyles(baseUrl, token);
            setupDiv.style.display = 'none';
            accountDiv.style.display = 'block';
        } catch (err) {
            console.error('Failed to load styles:', err);
        }
    }

    console.log(sessionStorage)
    const msg = await sessionStorage.getItem('selfhostMessage');
    if (msg) {
        selfhostMsg.textContent = msg;
        await sessionStorage.removeItem('selfhostMessage');
    }
}

// * handling API key submission
keyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const storage = await browser.storage.local.get('baseUrl');
    const baseUrl = storage.baseUrl || 'https://sitecite.dantenl.com';
    const apiKey = keyInput.value.trim();

    try {
        const result = await fetchUrl(`${baseUrl}/api/token/validate`, apiKey);
        if (result.success) {
            await browser.storage.local.set({
                token: apiKey,
                expire: result.data.expire
            });
            await fetchStyles(baseUrl, apiKey);
            setupDiv.style.display = 'none';
            accountDiv.style.display = 'block';
            await browser.runtime.sendMessage('enable-ctx-menu');
        } else {
            alert('Invalid token. Please check and try again.');
        }
    } catch (err) {
        console.error('Token validation error:', err);
        alert('Could not validate token. Please check your server URL and token.');
    }
});

// * handling sign out request
logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await browser.storage.local.remove('token');
    window.location.reload();
});

// * handle setting custom base url

// fancy reset or save button
hostUrlInput.addEventListener('input', () => {
    hostSubmitBtn.textContent = hostUrlInput.value.length > 0 ? 'save' : 'reset';
});

// handle submission :smirk:
selfhostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const hostUrl = hostUrlInput.value.trim();

    if (hostUrl) {
        // try to validate the host
        let valid = false;
        let message = '';
        try {
            const resp = await fetchUrl(`${hostUrl}/api/hello`);
            valid = resp.success;
            message = resp.message || '';
        } catch {
            // fallback to /api/test for older versions
            try {
                const resp = await fetchUrl(`${hostUrl}/api/test`);
                valid = resp.success;
                message = resp.message || '';
            } catch {
                // both failed
                valid = false;
                message = 'Could not connect to server.';
            }
        }

        if (valid) {
            await browser.storage.local.remove('token');
            await browser.storage.local.set({ baseUrl: hostUrl });
            await sessionStorage.setItem('selfhostMessage', 'Success! You\'re connected to the server!');
            window.location.reload();
        } else {
            selfhostMsg.textContent = `Could not connect! ${message}`;
        }
    } else {
        // Reset to default
        const stored = await browser.storage.local.get('baseUrl');
        if (stored.baseUrl) {
            await browser.storage.local.remove('token');
            await browser.storage.local.remove('baseUrl');
            await sessionStorage.setItem('selfhostMessage', 'Reset to default server.');
            window.location.reload();
        }
    }
});

main()
