# Yawar Knowledge Center

A mobile-friendly, static knowledge dashboard designed for GitHub Pages. Includes a light/dark toggle, accent colors, searchable starter resources, notes, bookmarks, a local demo chat interface, and local text-document reading.

## Publish on GitHub Pages

1. Download and extract this ZIP.
2. Open your repository: `https://github.com/yawarabbas54/Yawar-knowledge-center`
3. Upload the files inside this folder (`index.html`, `style.css`, `app.js`, and `README.md`) to the repository root. Do not upload only the ZIP file.
4. If GitHub asks, choose to replace the existing files.
5. Commit the changes to the `main` branch.
6. Open **Settings → Pages** and ensure **Deploy from a branch**, branch `main`, folder `/(root)` are selected.
7. Wait for the deployment to finish, then open: `https://yawarabbas54.github.io/Yawar-knowledge-center/`

## Features and limitations

- Theme mode and accent color are saved in this browser.
- Notes, bookmarks, and demo chat history use browser local storage. They do not automatically sync between devices.
- The document reader currently reads text-based files such as `.txt`, `.md`, `.csv`, and `.json` locally. It does not parse PDFs or Word documents.
- The chat is a **demo**, not real AI. It uses predefined local responses and does not need an API key.
- To add real AI responses later, connect a secure backend and keep any API key on the server. Never put a secret API key in public `app.js`.
- External Google Fonts are optional styling; the app still has fallback fonts if unavailable.

## Troubleshooting a 404

- Make sure `index.html` is in the root of the `main` branch.
- Check **Settings → Pages** for the published URL.
- Check the repository **Actions** tab for failed deployment jobs.
- Give GitHub Pages a few minutes after committing.
