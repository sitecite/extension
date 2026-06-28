#!/bin/bash
set -e

# * colours
if [ -t 1 ]; then
    GREEN='\033[0;32m'
    RED='\033[0;31m'
    YELLOW='\033[0;33m'
    BOLD='\033[1m'
    RESET='\033[0m'
else
    GREEN=''; RED=''; YELLOW=''; BOLD=''; RESET=''
fi

# * default values
ZIP_ENABLED=false
BROWSER=""

# * usage
usage() {
    echo "Usage: $0 -b {chrome|firefox} [-z]"
    echo "  -b, --browser    Target browser: chrome or firefox (required)"
    echo "  -z, --zip        Create a ZIP archive (disabled by default)"
    echo "  -h, --help       Show this help"
    exit 1
}

# * parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        -z|--zip)
            ZIP_ENABLED=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo -e "${RED}Unknown option: $1${RESET}"
            usage
            ;;
    esac
done

# * check if browser valid
if [[ -z "$BROWSER" ]]; then
    echo -e "${RED}Error: Browser not specified.${RESET}"
    usage
fi

if [[ "$BROWSER" != "chrome" && "$BROWSER" != "firefox" ]]; then
    echo -e "${RED}Error: Invalid browser '$BROWSER'. Use 'chrome' or 'firefox'.${RESET}"
    exit 1
fi

# * copy from <browser>.manifest.json to manifest.json
if [[ "$BROWSER" == "chrome" ]]; then
    cp chrome.manifest.json manifest.json
    echo -e "${GREEN}Converted to Chrome manifest.${RESET}"
elif [[ "$BROWSER" == "firefox" ]]; then
    cp firefox.manifest.json manifest.json
    echo -e "${GREEN}Converted to Firefox manifest.${RESET}"
fi

# * generating zip file
if [[ "$ZIP_ENABLED" == true ]]; then
    ZIP_NAME="sitecite-${BROWSER}.zip"

    # use git ls-files if available to respect .gitignore
    if command -v git &>/dev/null && git rev-parse --is-inside-work-tree &>/dev/null; then
        echo -e "${YELLOW}Using git ls-files to respect .gitignore${RESET}"
        # list tracked files and add manifest.json, then feed to zip
        { git ls-files; echo "manifest.json"; } | zip -r "$ZIP_NAME" -@ . \
            -x "*.git*" \
            -x "chrome.manifest.json" \
            -x "firefox.manifest.json" \
            -x "build.sh" \
            -x "*.zip" \
            -x ".*"
    else
        # fallback: manual exclusion list
        echo -e "${YELLOW}Git not available or not in a repo – using manual exclusions${RESET}"
        zip -r "$ZIP_NAME" . \
            -x "*.git*" \
            -x "chrome.manifest.json" \
            -x "firefox.manifest.json" \
            -x "build.sh" \
            -x "*.zip" \
            -x ".*"
    fi

    echo -e "${GREEN}Created $ZIP_NAME${RESET}"
else
    echo -e "${YELLOW}ZIP creation skipped (use -z to enable).${RESET}"
    echo -e "  Manifest 'manifest.json' is ready in the current directory."
fi
