# sitecite extension

![Firefox showing the Wikipedia page of the soundtrack of Interstellar, with the focus being on a context menu with the options "Quote selected text" and "Copy image of selected text"](https://sitecite.dantenl.com/screenshots/firefox_wiki_interstellar_sitecite.png)

[![Firefox version](https://img.shields.io/amo/v/sitecite?logo=firefox&logoColor=white&style=for-the-badge)](https://sitecite.dantenl.com/r/firefox)
[![Chrome version](https://img.shields.io/chrome-web-store/v/nhadodoajmnpakkgidheifkfibphlghm?logo=chrome-web-store&logoColor=white&style=for-the-badge)](https://sitecite.dantenl.com/r/chrome)

Quote and copy your text with ease! Select your text, press a keybind or right click and select "Quote selected text" and a link is automagically copied to your clipboard. You can share the link on a platform such as Discord and the text will automatically show up!

* **[Available on Firefox](https://sitecite.dantenl.com/r/firefox)**
* **[Available on Chrome](https://sitecite.dantenl.com/r/chrome)**

If you need any help, feel free to create an issue on the issues page or to join [the Discord server](https://sitecite.dantenl.com/r/discord).

## Manual install

If you want to, you can also manually install the extension. If you're testing things out, you may also be interested in hosting a local instance of sitecite for yourself. You can do so using the [Docker version](https://github.com/sitecite/server-docker).

### Cloning the repo

> [!TIP]
> If you can't be bothered, you can instead just download a zip file from the releases tab.

First, you want to create a new directory where you wish to place the extension. You can do so with git.

```
mkdir sitecite-extension
cd sitecite-extension
git clone https://github.com/sitecite/extension
```

Afterwards, you will need to do either of two things:

1. Rename or copy `<browser>.manifest.json` to just `manifest.json`, depending on if you're using Firefox or Chrome. If you're planning on using Firefox, you could run something like this:

```
cp firefox.manifest.json manifest.json
```

2. Build the version. If you're planning on constantly converting back and forth, it can be easier to just run a simple script. Luckily for you, that exists! **This can also be used to create a zip file.**

> [!IMPORTANT]
> I don't use Windows. I can't be for certain this script works there.

First off, we need to make sure we can execute the script:

```
chmod +x build.sh
```

Afterwards, we can simply use one of the following commands:
* `./build.sh -b firefox` - Converts the manifest to Firefox
* `./build.sh -b chrome` - Converts the manifest to Chrome
* `./build.sh -b firefox -z` - Converts the manifest to Firefox and creates a zip file in the current dir called `sitecite-firefox.zip`
* `./build.sh -b chrome -z` -  Converts the manifest to Chrome and creates a zip file in the current dir called `sitecite-chrome.zip`

### Firefox

If you want to run this extension, for example to test some stuff out, you can temporarily load it to your browser!

If you've cloned the repo, you can start at step 3.

1. Download the latest zip file for Firefox from the releases tab
2. Place the extension somewhere and unzip it
3. Go to `about:debugging` on your Firefox and click "This Firefox"
4. Click "Load Temporary Add-on..."
5. Navigate to wherever you placed the unpacked extension and click on the `manifest.json` file

The extension should now be loaded and is ready for use!


### Chrome

Chrome should be pretty easy to install, even permanently without having to use a Developer or Nightly build.

If you've followed the instructions on cloning the repo, you can start at step 3.

1. Download the latest zip file for Chrome from the releases tab
2. Place the extension somewhere and unzip it
3. Go to `chrome://extensions` on your Chrome and click "Load unpacked"
4. Navigate to where you placed the unpacked extension and select the folder

The extension should now be ready! 
