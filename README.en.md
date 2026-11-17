<div align="center">

<img src="assets/icons/icon128.png" alt="Cookie Manager" width="96" />

# Cookie Manager

A Chrome / Edge extension to categorize, search, edit, import, export, and delete cookies by site. All data stays on your device.

[繁體中文](README.md) | **English**

[Website](https://cookie-manager.stack-base.com/) · [Privacy Policy](https://cookie-manager.stack-base.com/privacy.html)

![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

</div>

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Scripts](#scripts)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Localization](#localization)
- [Privacy and Permissions](#privacy-and-permissions)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)

## Features

### Dashboard

- Cookies grouped by main site (e.g. `.mail.google.com` is grouped under `google.com`)
- Custom categories: add, rename, pick colors, reorder, delete
- Search by site, cookie name, or domain
- Delete a single cookie, all cookies of a site, or several selected sites at once
- Move selected sites to a category or export them in bulk
- Cookie details: value, domain, path, expiry, Secure / HttpOnly / SameSite flags, with value copy
- Export cookies as JSON, Netscape (cookies.txt), or header string, as a file download or to the clipboard
- Back up and restore category settings (backups never include cookie contents)
- The list refreshes automatically when cookies change

### Toolbar popup

- List the current tab's cookies, switch between "This page" and "Whole site" scope, and search
- Create, edit, and delete cookies (name, value, domain, path, expiry, SameSite, Secure, HttpOnly)
- Import and export cookies (JSON, Netscape, header string); the import format is detected automatically
- Delete all cookies of the current tab in one click
- Assign a category to the current site and open the dashboard

### General

- UI available in Traditional Chinese, English, and Japanese; follows the browser language by default and can be switched manually
- Dark mode

## Installation

The extension is not yet available on the Chrome Web Store, so you need to build and load it yourself.

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- Google Chrome or Microsoft Edge

### Build

```bash
git clone https://github.com/bruce-yang-422/CookieManager.git
cd CookieManager
npm install
npm run build
```

The build output goes to the `extension/` folder.

### Load in the browser

1. Open `chrome://extensions` (`edge://extensions` in Edge)
2. Turn on **Developer mode** in the top-right corner
3. Click **Load unpacked** and select the `extension/` folder

After pulling new code and rebuilding, click the reload button (↻) on the extension's card.

## Scripts

| Command | Description |
| --- | --- |
| `npm run build` | Type-check and build to `extension/` |
| `npm run watch` | Watch for changes and rebuild to `extension/` automatically |
| `npm run typecheck` | Run type checking only |
| `npm run icons` | Generate PNG icons in all sizes from the source image `assets/icons/logo.png` |

## Tech Stack

| Area | Technology |
| --- | --- |
| Extension platform | Chrome Manifest V3 |
| Build tool | [Vite](https://vite.dev/) + [CRXJS](https://crxjs.dev/) |
| Framework | [Vue 3](https://vuejs.org/) (Composition API) |
| UI library | [Naive UI](https://www.naiveui.com/) |
| Language | TypeScript (strict mode) |
| Storage | `chrome.storage.local` (local only, no backend) |

## Project Structure

```text
CookieManager/
├── src/
│   ├── background/        # Service worker (opens the dashboard on first install)
│   ├── popup/             # Toolbar popup
│   │   └── components/    # Cookie editor form, import panel, export panel
│   ├── dashboard/         # Dashboard
│   │   └── components/    # Cookie details, category manager, export dialog
│   ├── lib/               # Cookie operations, import/export formats, category backup, shared components
│   ├── i18n/              # UI translations
│   │   └── locales/       # zh-TW.ts (primary), en.ts, ja.ts
│   ├── storage/           # Category data read/write
│   └── styles/            # Shared styles
├── public/_locales/       # Extension name and description translations (Chrome format)
├── assets/icons/          # Extension icons (logo.png is the source image)
├── scripts/               # Build helper scripts (icon generation)
├── index.html             # Project website (GitHub Pages)
├── privacy.html           # Privacy policy
├── site/                  # Shared styles and language switching for the website
├── manifest.config.ts     # Manifest configuration
└── vite.config.ts         # Vite configuration
```

`extension/` (build output) and `node_modules/` are not under version control.

## Localization

Supported languages: Traditional Chinese (`zh-TW`), English (`en`), and Japanese (`ja`).

- **UI language**: follows the browser language by default (Chinese → Traditional Chinese, Japanese → Japanese, anything else → English). Switch it from the language menu in the top-right corner of the popup or dashboard; the setting syncs across all pages.
- **Translation files**: `src/i18n/locales/`. `zh-TW.ts` is the primary language, and every other language file must contain the same keys; `npm run typecheck` reports any missing key.
- **Parameters and plurals**: `{name}` in a message is replaced by a parameter. When singular and plural differ, write `"singular | plural"`; the form is chosen by the `n` parameter.
- **Extension name and description**: `public/_locales/<language>/messages.json`.

### Adding a language

1. Copy `src/i18n/locales/en.ts` to a new file (for example `ko.ts`) and translate it
2. Add the language to `LOCALES`, `DICTIONARIES`, `NAIVE_LOCALES`, and `detect()` in `src/i18n/index.ts`
3. Add `public/_locales/<language>/messages.json`

## Privacy and Permissions

- Collects and transmits no user data; there is no backend server
- No analytics, advertising, or third-party services
- No remote code is loaded
- Exported cookie files are downloaded straight to your device; they contain login credentials, so keep them safe

See the full [Privacy Policy](https://cookie-manager.stack-base.com/privacy.html).

| Permission | Purpose |
| --- | --- |
| `cookies` | Read, create, edit, and delete cookies |
| `storage` | Store category settings locally |
| `favicon` | Show site icons from the browser cache |
| `<all_urls>` | Manage cookies for any site |

## Known Limitations

- Incognito cookies are not listed
- Partitioned cookies (CHIPS) are not listed
- The main site is determined by built-in rules, so a few unusual domains may be grouped imprecisely

## Contributing

Issues and pull requests are welcome. Before submitting, please make sure that:

- `npm run build` passes (including type checking)
- UI text changes are applied to every language file under `src/i18n/locales/`
- README changes are applied to both [README.md](README.md) (Traditional Chinese) and [README.en.md](README.en.md) (English)
