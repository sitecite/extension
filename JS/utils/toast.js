export async function showToastInTab(tab, message, type) {
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
