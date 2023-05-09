![Example of an extrusive app.](./example.png)

# extrusive.md

[Obsidian](https://obsidian.md/) is an **"extrusive”** rock, which means it is made from magma that erupted out of a volcano.
<br/>
^ Wonderful markdown editor!

---

#### Please note: this project is currently being developed and is not yet stable. Please report bugs and refer to the below roadmap for missing features.

There are a lot of markdown interfaces out there. There are a lot of documentation tools out there.

`extrusive.md` fills the niche that none of these do.

1. **100% free and open-source** now, and forever!
2. Hands you control and is 100% **self-hosted**.
3. Designed with a **simple interface** that requires almost no set-up work.
4. Allows easy implementation of **custom styles** in your documentation.
5. **Builds lightning-fast** using your folder structure and `.md` files. Meaning you can edit your docs in whatever environment you want.
6. Includes a **built-in search bar**, that works... That you don't have to pay for!
7. Has a simple toggle for **light/dark mode**.
8. Built with a **mobile-first design** model and styled with **inspiration from other modern documentation websites**.
9. O.O.T.B. support for **[ion-icons](https://ionic.io/ionicons) + custom HTML** directly in your markdown!

`extrusive.md` may not have all the bells and whistles, but it makes up for these by being open-ended and ready for you to customize!

## Installation

Just run `npm install -g https://github.com/NotTimTam/extrusive.md.git` to install the `extrusive` CLI globally.

Then, in your desired work directory, create your project by running:
`npx exstrusive create`
or
`npx exstrusive create --project-directory <project-directory>`
to specify a project directory.

## Development Roadmap

Client:

-   Better error indicators.
-   Code highlighting. (`marked-highlight` and `highlight.js`)
-   Emoji support. (`[marked-emoji](https://www.npmjs.com/package/marked-emoji)`)
-   Admonition support. (`[marked-admonition-extension](https://www.npmjs.com/package/marked-admonition-extension)`)
-   Cleaner, more reliable client-side code.
-   The ability to clear recent searches.
-   Automatical removal of search results that link to paths that no longer exist.
-   Print/send-to-pdf feature.

Server:

-   Improved search functionality.
-   More robust server defense firewall.

CLI:

-   **"start"** command with live server for development that does not rely on a build.
-   Static, serverless build option.
-   Better support for user script imports.
-   Sanitize output html.

General:

-   Convert to NPM package.
-   Decrease package/output footprint.
-   Explore potential for headless CMS.
-   Support for more characters, particularly '.' in file/folder labels.
