/**
 * Fetches from a link using a GET request, with built-in error handling
 * @param {string} url The url to fetch from
 * @returns {Promise<object>} The result
 */
async function fetchUrl(url, authorization = null) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(url)
            if(authorization) {
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
                throw new Error(`Response status: ${response.status}`);
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
            console.log("Auth:",authorization)
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

async function fetchStyles(baseUrl, token) {
    const styles = await fetchUrl(`${baseUrl}/api/style`, token)

    // load actual styles
    document.documentElement.style.setProperty('--background', "#" + styles.data.bg_color);
    document.documentElement.style.setProperty('--color', "#" + styles.data.color);

    // load fonts
    const fonts = await fetchUrl(`${baseUrl}/api/fontlist`)
  
    var selectedFontFileRegular
    var selectedFontFileItalic
    var selectedFontBackup

    fonts.data.fontList.forEach(font => {
        if (styles.data.font == font.name) {
            selectedFontFileRegular = font.file_regular
            selectedFontFileItalic = font.file_italic
            selectedFontBackup = font.type
        }
    })

    // console.log(sel)
    const fontFile = new FontFace(
        styles.data.font,
        `url(${baseUrl}/fonts/${selectedFontFileRegular})`
    )

    document.fonts.add(fontFile)

    const fontFileItalic = new FontFace(
        styles.data.font,
        `url(${baseUrl}/fonts/${selectedFontFileItalic})`,
        {
            "style": "italic"
        }
    )

    document.fonts.add(fontFileItalic)
    document.documentElement.style.setProperty('--font-family', "'" + styles.data.font + "'," + selectedFontBackup);
}

// var baseUrl = null
//* fetch the api url
async function main() {
    const baseUrlStorage = await browser.storage.local.get("baseUrl")
    const baseUrl = baseUrlStorage.baseUrl || "https://sitecite.dantenl.com"

    console.log(baseUrlStorage)
    try {
        if (baseUrlStorage.baseUrl) {
            document.getElementById("host-url").value = baseUrl
            const submitBtn = document.getElementById("host-submit")
            submitBtn.innerText = "save"
        }
    } catch(e) {
        // might fail if it is empty
        // we dont care tho
    }

    // update the open site button
    document.getElementById("open-site").href = baseUrl

    // fill in proper key
    const platformInfo = await browser.runtime.getPlatformInfo()

    if(platformInfo.os == "mac") {
        document.getElementById("keyboard-shortcut").innerHTML = `
       <kbd>Cmd</kbd> + <kbd>Ctrl</kbd> + <kbd>C</kbd>
        `
    }

    var token = await browser.storage.local.get(["token"]) || null

    if(token) {
        // user is signed in
        await fetchStyles(baseUrl, token.token)
        document.getElementById("setup").style.display = "none"
        document.getElementById("account-section").style.display = "block"
    }
    
}

//* Handling API key submission
document.getElementById("key-form").addEventListener("submit", async input => {
    // store new stored colours
    input.preventDefault()

    const baseUrlStorage = await browser.storage.local.get("baseUrl")
    const baseUrl = baseUrlStorage.baseUrl || "https://sitecite.dantenl.com"
    
    const apiKey = document.getElementById("key").value

    const validateToken = await fetchUrl(`${baseUrl}/api/token/validate`, apiKey)
    if (validateToken.success) {
        // token is good, store it
        await browser.storage.local.set({token: apiKey, expire:  validateToken.data.expire })

        // update background and stuff like that
        await fetchStyles(baseUrl, apiKey)
        document.getElementById("setup").style.display = "none"
        document.getElementById("account-section").style.display = "block"

        // enable the selection quote thingy
        await browser.runtime.sendMessage('enable-ctx-menu');
    }
})

//* Handling sign out request
document.getElementById("logout").addEventListener("click", async input => {
    // regenerated the extension api key 
    input.preventDefault()
    await browser.storage.local.remove("token")
    window.location.reload();
})

//* handle setting custom base url

// fancy reset or save button
document.getElementById("host-url").addEventListener("input", async input => {
    const hostUrlElem = document.getElementById("host-url")
    const submitBtn = document.getElementById("host-submit")
    if (hostUrlElem.value.length > 0) {
        submitBtn.innerText = "save"
    } else {
        submitBtn.innerText = "reset"
    }
})

// handle submission :smirk:
document.getElementById("selfhost-form").addEventListener("submit", async input => {
    // store new stored colours
    input.preventDefault()


    const hostUrl = document.getElementById("host-url").value

    if(hostUrl) {
        // custom host
        const validateHost = await fetchUrl(`${hostUrl}/api/test`)
        if (validateHost.success) {
            // the host exists and seems to be returning valid things!
            // what we need to do is sign out the user but set baseUrl
    
            await browser.storage.local.remove("token")
            await browser.storage.local.set({ baseUrl: hostUrl})
            
            // disable context menu
            await browser.runtime.sendMessage('disable-ctx-menu');
    
            // refresh page so we dont have to bother running the functions and events again.
            document.getElementById("selfhost-msg").innerText = "Success! You're connected to the server!"
            window.location.reload();
        } else {
            document.getElementById("selfhost-msg").innerText = "Could not connect! Are you sure it's a sitecite server?"
        }
    } else {
        // just a reset to default
        const baseUrlStorage = await browser.storage.local.get("baseUrl")
        if (baseUrlStorage) {
            await browser.storage.local.remove("token")
            await browser.storage.local.remove("baseUrl")
    
            // disable context menu
            await browser.runtime.sendMessage('disable-ctx-menu');
    
            // refresh page so we dont have to bother running the functions and events again.
            window.location.reload();
        }
    }

})

main()
