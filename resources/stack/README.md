<div style="margin-bottom: 2rem">
<div style="width: 6rem; height: 6rem; margin: 0 auto; margin-top: 6rem;">
    <ion-icon name="terminal" style="width: 100%; height: 100%;"></ion-icon>
</div>

<h1 style="text-align: center;">extrusive.md</h1>
</div>

Get started by editing this file or creating your own folder structure within the "content" directory!

You can run `npx extrusive build` to build your app, or `npx extrusive start` to start your development server.

Remember, the "README.md" file in the root of the content directory is a special homepage document!

```js
console.log("Happy hacking!");
```

## Tips

-   You can use [ion-icons](https://ionic.io/ionicons) in your markdown!
    -   Simply add `<ion-icon name="<name-of-icon>"/>` anywhere in your code! <ion-icon style="fill: orange;" name="wifi"></ion-icon>
-   You can add custom CSS to your project (preferably in the `styles` directory) and point the builder to it in your `extrusive.config.json`.
    -   Just add any files you want to and then indicate an array of the locations of the files in the config:

```json
{
	// ...
	"styles": ["./styles/custom.css"]
	// ...
}
```

-   With a little configuration, you can force the builder to include custom JavaScript imports in the HTML file.
    -   Dump the files you want in your project's `public`directory.
    -   Add the necessary script import tag to your project's `extrusive.config.json`:

```json
{
	// ...
	"copyright": "© 2023 Anonymous <script src='/public/test.js'></script>"
	// ...
}
```

(a better supported script import system is on the way)
