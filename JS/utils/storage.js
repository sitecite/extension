export async function getConfig() {
    const { token } = await browser.storage.local.get("token");
    const { baseUrl = "https://sitecite.dantenl.com" } = await browser.storage.local.get("baseUrl");
    return { token, baseUrl };
}

export async function saveToken(token) {
    await browser.storage.local.set({ token });
}

export async function clearToken() {
    await browser.storage.local.remove("token");
}
