<div align="center">

<img src="assets/icons/icon128.png" alt="Cookie Manager" width="96" />

# Cookie Manager

A Chrome / Edge extension for categorizing, searching, and deleting cookies by site. All data stays on your device.

[繁體中文](README.md) | **English**

![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

</div>

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Localization](#localization)
- [Privacy](#privacy)
- [Publishing](#publishing)
- [Known Limitations](#known-limitations)
- [Documentation](#documentation)

## Features

### Dashboard

- Cookies grouped by main site (e.g. `.mail.google.com` is grouped under `google.com`)
- Custom categories: add, rename, pick colors, reorder, delete
- Search by site, cookie name, or domain
- Delete a single cookie or all cookies of a site
- Bulk actions: select multiple sites to delete, export, or move to a category at once
- Cookie details: value, domain, path, expiry, Secure / HttpOnly / SameSite flags, one-click copy
- Export cookies: export each site on its own or several sites at once, in JSON, Netscape (cookies.txt), or header string format, as a file download or to the clipboard
- Back up / restore category data (backups never include cookie contents)
- UI available in Traditional Chinese, English, and Japanese; follows the browser language by default and can be switched manually
- Dark mode; the list refreshes automatically when cookies change
- Max width of 1440px, centered on ultra-wide screens

### Toolbar popup (quick tool)

- List all cookies of the current tab, switch between "This page" and "Whole site" scope, and search
- Create, edit, and delete cookies (name, value, domain, path, expiry, SameSite, Secure, HttpOnly, and more)
- Import and export cookies in multiple formats: JSON, Netscape (cookies.txt), and header string; the import format is detected automatically
- Delete all cookies of the current tab in one click
- Assign a category to the current site and open the dashboard in one click

## Tech Stack

| Area | Technology |
| --- | --- |
| Extension platform | Chrome Manifest V3 |
| Build tool | [Vite](https://vite.dev/) + [CRXJS](https://crxjs.dev/) |
| Framework | [Vue 3](https://vuejs.org/) (Composition API) |
| UI library | [Naive UI](https://www.naiveui.com/) |
| Language | TypeScript (strict mode) |
| Storage | `chrome.storage.local` (local only, no backend) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- Google Chrome or Microsoft Edge (latest version)

### Install and build

```bash
git clone <repository-url>
cd CookieManager
npm install
npm run build
```

The build output goes to the `extension/` folder.

### Load in the browser

1. Open `chrome://extensions` (`edge://extensions` in Edge)
2. Turn on **Developer mode** in the top-right corner
3. Click **Load unpacked** and select the `extension/` folder

After changing code, rebuild, then click the reload button (↻) on the extension card.

## Scripts

| Command | Description |
| --- | --- |
| `npm run build` | Type-check and build to `extension/` |
| `npm run watch` | Watch for changes and rebuild to `extension/` automatically |
| `npm run typecheck` | Run type checking only |
| `npm run icons` | Generate PNG icons in all sizes from the source image `assets/icons/logo.png` |
| `npm run dev` | Start the Vite dev server (hot reload) |

## Project Structure

```text
CookieManager/
├── src/
│   ├── background/        # Service worker (opens the dashboard on first install)
│   ├── popup/             # Toolbar popup
│   │   └── components/    # Cookie editor form, import panel, export panel
│   ├── dashboard/         # Dashboard
│   │   └── components/    # Cookie detail drawer, category manager dialog, export dialog
│   ├── lib/               # Cookie operations, import/export formats, category backup, icons, language menu, theme, shared shell
│   ├── i18n/              # UI translations
│   │   └── locales/       # zh-TW.ts (primary), en.ts, ja.ts
│   ├── storage/           # Category data read/write
│   └── styles/            # Shared styles
├── public/_locales/       # Extension name and description translations (Chrome format)
├── assets/icons/          # Extension icons (logo.png is the source image)
├── scripts/               # Build helper scripts (icon generation)
├── extension/             # Build output (generated, do not edit)
├── index.html             # GitHub Pages website home page
├── privacy.html           # Privacy policy
├── site/                  # Shared styles and language switching for the website
├── .nojekyll              # Lets GitHub Pages serve static files as-is
├── manifest.config.ts     # Manifest configuration
└── vite.config.ts         # Vite configuration
```

## Localization

Supported languages: Traditional Chinese (`zh-TW`), English (`en`), and Japanese (`ja`).

- **UI language**: follows the browser language by default (Chinese → Traditional Chinese, Japanese → Japanese, anything else → English). Switch it from the language menu in the top-right corner of the popup or dashboard; the setting syncs across all pages.
- **Translation files**: `src/i18n/locales/`. `zh-TW.ts` is the primary language, and every other language file must contain the same keys; `npm run typecheck` reports any missing key.
- **Parameters and plurals**: `{name}` in a message is replaced by a parameter. When singular and plural differ, write `"singular | plural"`; the form is chosen by the `n` parameter.
- **Extension name and description**: `public/_locales/<language>/messages.json`, shown on the browser's extensions page and in the store.

### Adding a language

1. Copy `src/i18n/locales/en.ts` to a new file (for example `ko.ts`) and translate it
2. Add the language to `LOCALES`, `DICTIONARIES`, `NAIVE_LOCALES`, and `detect()` in `src/i18n/index.ts`
3. Add `public/_locales/<language>/messages.json`

## Privacy

- Collects and transmits no user data; there is no backend server
- No analytics, advertising, or third-party services
- No remote code is loaded
- Exported cookie files are downloaded straight to your device and never pass through any server; they contain login credentials, so keep them safe

See the full [Privacy Policy](privacy.html).

### Permissions

| Permission | Purpose |
| --- | --- |
| `cookies` | Read, create, edit, and delete cookies |
| `storage` | Store category settings locally |
| `favicon` | Show site icons from the browser cache |
| `<all_urls>` | Manage cookies for any site |

## Publishing

1. Run `npm run build`
2. Zip the **contents** of the `extension/` folder
3. Upload to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) or [Microsoft Edge Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/)
4. Privacy policy URL: `https://<user>.github.io/<repo>/privacy.html`

### Project website (GitHub Pages)

`index.html` in the project root is the project website and `privacy.html` is the privacy policy page. Both are available in Traditional Chinese, English, and Japanese (pick one with a parameter such as `?lang=en`).

1. Push the project to GitHub
2. In the repo, open **Settings → Pages** and set Source to **Deploy from a branch**
3. Choose the `main` branch and the `/ (root)` folder, then click **Save**

## Known Limitations

- Incognito cookies are not supported yet
- Some partitioned cookies (CHIPS) may not be listed
- Main-site detection uses built-in rules, so a few unusual domains may be grouped imprecisely

## Documentation

This README is available in two languages and must be kept in sync:

- [README.md](README.md): Traditional Chinese (primary)
- [README.en.md](README.en.md): English

When you edit one, update the other as well.
