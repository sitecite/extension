export function createHighlightLink() {
    function isWordChar(char) {
        return /\p{L}|\p{N}|_/u.test(char);
    }

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
        return encodeURIComponent(text).replace(/-/g, '%2D').replace(/,/g, '%2C');
    }

    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    const originalRange = selection.getRangeAt(0);
    const expandedRange = originalRange.cloneRange();
    expandRangeToWholeWords(expandedRange);

    const selectedText = expandedRange.toString().trim();
    if (!selectedText) return null;

    const url = new URL(window.location.href);
    url.hash = `:~:text=${encodeTextFragment(selectedText)}`;

    return { url: url.toString(), selection: originalRange.toString().trim() };
}
