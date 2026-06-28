# [v1.1.0](https://github.com/sitecite/extension/pull/2) [2026-06-28]

* Optimised a lot of code
    - Made it easier to convert browser formats
    - Split off the `background.js` file into multiple different files

* Updated installation instructions
* Made the "Open sitecite" button clearer
* Added symbols for the keyboard shortcut when using macOS


## Bugs fixed

* Fixed an issue where a success message did not appear when using a self-hosted instance
* Fixed an issue with minumum font size on Chrome
* Fixed an issue with the window size on Chrome

# [v1.0.0](https://github.com/sitecite/extension/pull/1) [2026-6-15]

* A link to the sitecite website is displayed more prominently
* Fixed a couple of mild annoyances having to do with using a self-hosted instance
* Set Atkinson Hyperlegible Next as default font, in line with the sitecite website. This is now bundled with the extension.
* Updated the CSS file to be more inline with the website
* Bumped up to v1.0.0
* Added a license

## Deprecation warning

If you're self-hosting sitecite, please update your instance. The endpoint `/api/test` is deprecated in favour of `/api/hello`. The extension will continue to use `/api/test` as a backup to ensure compatibility with servers.

# [v0.0.2](https://github.com/sitecite/extension/releases/tag/v0.0.2) [2026-6-6]

* Added the icon
* Improved text highlight generation
* Added the ability to create only an image
* Added Chrome support

# v0.0.1

* Release
