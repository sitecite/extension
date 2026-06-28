export function copyText(text) {
    try {
        navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        console.error("Could not copy to the clipboard:", e);
        return false;
    }
}

export function copyImage(image) {
    const byteString = atob(image.split(',')[1]);
    const mimeType = image.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });

    try {
        navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
        ]);
        return true;
    } catch (err) {
        console.error('Clipboard write failed:', err);
        return false;
    }
}
