<div align="center">

# Folio Studio

### A place for your best work.

A professional portfolio builder with a calm editing experience, live preview, and a website you can take anywhere.

[**Open the builder →**](https://aaidh.github.io/folio-studio/)

![JavaScript](https://img.shields.io/badge/JavaScript-ES_modules-f4d35e?style=flat-square)
![No backend](https://img.shields.io/badge/backend-not_required-325b45?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-325b45?style=flat-square)

</div>

## Make it yours

1. Introduce yourself: name, headline, biography, photo, and skills.
2. Add your best projects, work experience, or education.
3. Choose the contact details you want to publish.
4. Pick a layout, accent colour, and headline style.
5. Download your complete `index.html` website.

The first visit includes fictional example content so you can explore the design. Use **Start fresh** to create an empty portfolio. Replace the examples before publishing.

## Features

| Feature | Details |
| --- | --- |
| Three layouts | Editorial, Studio, and Minimal |
| Visual editing | Five guided sections and an instant portfolio preview |
| Design controls | Five accent colours and serif or sans serif headlines |
| Project management | Add, remove, and reorder up to 20 projects or experience entries |
| Photo upload | Local image resizing; JPG, PNG, and WebP up to 5 MB |
| Responsive preview | Desktop, mobile, and expanded preview modes |
| Local drafts | Automatic browser saving, with a warning if storage is unavailable |
| Draft portability | Export and import a versioned JSON draft for later editing |
| Website export | One HTML file containing your content, styles, and photo |
| Accessibility | Labelled inputs, keyboard focus styles, native dialogs, reduced motion support |

The exported website uses system fonts, has no JavaScript or third-party dependencies, and can be opened offline. The builder requests Google Fonts for its interface; portfolio content and uploaded images are not sent to a server. There are no analytics or accounts.

## Run locally

Requires Node.js 22 or later. No packages to install.

```sh
git clone https://github.com/aaidh/folio-studio.git
cd folio-studio
npm start
```

Open `http://127.0.0.1:4175`. Because the builder uses ES modules, serve it over HTTP instead of opening its HTML directly.

```sh
npm test
```

Tests cover complete exports, every layout, unsafe links, HTML injection, imported draft boundaries, and optional sections. GitHub Actions runs the checks on pushes and pull requests.

## Publish your generated portfolio

1. Download the website and keep its name as `index.html`.
2. Create a public GitHub repository and upload that file.
3. In **Settings → Pages**, select **Deploy from a branch**.
4. Choose **main** and **/ (root)**, then save.
5. Open the published URL shown by GitHub after deployment completes.

Keep your draft JSON somewhere private if it contains contact information you do not want to publish. The JSON is for the editor; the HTML is your website.

## Project structure

```text
index.html       Builder workspace and dialogs
style.css        Responsive editor interface
app.js           Editing, local storage, photo upload, and downloads
core.js          Draft validation and standalone portfolio renderer
core.test.js     Export and validation tests
server.mjs       Dependency-free local preview server
```

## Contributing

Small, focused improvements are welcome. Open an issue describing a problem or enhancement, then submit a pull request. Include a screenshot for visual changes and tests for changes to draft validation or the exported website. Keep the builder usable without accounts or paid services.

## Limitations

- Drafts belong to the current browser and device. Clearing browser storage removes them; download a draft for safekeeping.
- Photos are embedded in the export, so larger photos increase file size.
- Project artwork is generated from the title and category; custom project image uploads are not yet supported.
- The preview intentionally restricts outgoing navigation. Links work normally in your downloaded website.
- Website downloads do not publish automatically; hosting instructions are available in the builder.

## License

MIT © Aaidh Ahamed. See [LICENSE](LICENSE).
