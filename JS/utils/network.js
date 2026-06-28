export async function fetchJson(url, options = {}) {
    const { authorization, ...fetchOptions } = options;
    const headers = { ...fetchOptions.headers };
    if (authorization) headers.Authorization = `Bearer ${authorization}`;

    const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: "omit"
    });

    if (!response.ok) {
        const err = new Error(`HTTP ${response.status}`);
        err.status = response.status;
        throw err;
    }
    return response.json();
}

export async function postJson(url, body, authorization = null) {
    return fetchJson(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        authorization,
        body: JSON.stringify(body)
    });
}
