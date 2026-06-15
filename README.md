# sitecite extension

![Firefox showing the Wikipedia page of the soundtrack of Interstellar, with the focus being on a context menu with the options "Quote selected text" and "Copy image of selected text"](https://sitecite.dantenl.com/screenshots/firefox_wiki_interstellar_sitecite.png)

Quote and copy your text with ease! Select your text, press a keybind or right click and select "Quote selected text" and a link is automagically copied to your clipboard. You can share the link on a platform such as Discord and the text will automatically show up!

* **[Available on Firefox](https://addons.mozilla.org/en-GB/firefox/addon/sitecite/)**
* **[Available on Chrome](https://chromewebstore.google.com/detail/sitecite/nhadodoajmnpakkgidheifkfibphlghm)**

If you need any help, feel free to create an issue on the issues page or to join [the Discord server](https://discord.gg/rPBE2B7dng).

## Manual install

If you want to, you can also manually install the extension. If you're testing things out, you may also be interested in hosting a local instance of sitecite for yourself.

> ⚠️ **NOTE:** If you're instead cloning the repo, note that you will have to rename the manifest to match your browser. For example, if you're using Chrome, rename `chrome.manifest.json` to just `manifest.json`. This is because (for some reason) Firefox and Chrome both have slightly different ways of defining the background scripts.

### Firefox

If you want to run this extension, for example to test some stuff out, you can temporarily load it to your browser!


1. Download the latest zip file for Firefox from the releases tab
2. Place the extension somewhere and unzip it
3. Go to `about:debugging` on your Firefox and click "This Firefox"
4. Click "Load Temporary Add-on..."
5. Navigate to wherever you placed the unpacked extension and click on the `manifest.json` file

The extension should now be loaded and is ready for use! 

### Chrome

Chrome should be pretty easy to install.

1. Download the latest zip file for Chrome from the releases tab
2. Place the extension somewhere and unzip it
3. Go to `chrome://extensions` on your Chrome and click "Load unpacked"
4. Navigate to where you placed the unpacked extension and select the folder

The extension should now be ready! 
