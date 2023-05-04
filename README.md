![Example of an extrusive app.](./example.png)

# extrusive.md

[Obsidian](https://obsidian.md/) is an **"extrusive”** rock, which means it is made from magma that erupted out of a volcano.
<br/>
^ Wonderful markdown editor!

---

#### Please note: this project is currently being developed and is not yet stable. Please report bugs and refer to the below roadmap for missing features.

There are a lot of markdown interfaces out there. There are a lot of documentation tools out there.

`extrusive.md` fills the niche that none of these do.

1. It is, and always will be, **100% free and open-source**.
2. It hands you control, to self-host and self-deploy.
3. It has a simple interface that requires almost no set-up work.
4. It allows you to easily implement custom styles in your documentation. It builds lightning-fast using your folder structure and `.md` files. Meaning you can edit your docs in whatever environment you want.
5. It has a built-in search bar, that works... That you don't have to pay for!
6. It has a nice toggle for light/dark mode and was built mobile-first!

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

-   Better loading/error indicators.
-   Code highlighting.
-   Functional keyboard interaction with search modal.
-   Clean, reduced-footprint clientside code.

Server/CLI:

-   Static, serverless build option.
-   **"start"** command with live server for development that does not rely on a build.
-   Improved search functionality.
-   More robust server defense firewall.
